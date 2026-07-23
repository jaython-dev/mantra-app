import { Platform } from 'react-native';

export interface FavoriteRow {
  id: string;
  added_at: string;
}

export interface HistoryRow {
  id: number;
  mantra_id: string;
  played_at: string;
}

interface DatabaseInterface {
  initialize(): Promise<void>;
  addFavorite(id: string): Promise<void>;
  removeFavorite(id: string): Promise<void>;
  getFavorites(): Promise<string[]>;
  isFavorite(id: string): Promise<boolean>;
  addHistory(mantraId: string): Promise<void>;
  getHistory(limit?: number): Promise<string[]>;
  getChantedCount(): Promise<number>;
  getChantedDates(): Promise<string[]>;
  getChantStreak(): Promise<number>;
}

// -------------------------------------------------------------
// Web/Fallback Database Simulation (using localStorage)
// -------------------------------------------------------------
class WebDatabase implements DatabaseInterface {
  private favKey = 'mantra_db_favorites';
  private histKey = 'mantra_db_history';
  private countKey = 'mantra_db_chant_count';
  private datesKey = 'mantra_db_chant_dates';

  async initialize(): Promise<void> {
    // Already loaded
  }

  async addFavorite(id: string): Promise<void> {
    const favs = await this.getFavorites();
    if (!favs.includes(id)) {
      favs.push(id);
      localStorage.setItem(this.favKey, JSON.stringify(favs));
    }
  }

  async removeFavorite(id: string): Promise<void> {
    let favs = await this.getFavorites();
    favs = favs.filter(x => x !== id);
    localStorage.setItem(this.favKey, JSON.stringify(favs));
  }

  async getFavorites(): Promise<string[]> {
    try {
      const data = localStorage.getItem(this.favKey);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  async isFavorite(id: string): Promise<boolean> {
    const favs = await this.getFavorites();
    return favs.includes(id);
  }

  async addHistory(mantraId: string): Promise<void> {
    try {
      const data = localStorage.getItem(this.histKey);
      let list: string[] = data ? JSON.parse(data) : [];
      // Remove duplicates to keep list unique of recently played
      list = [mantraId, ...list.filter(x => x !== mantraId)];
      localStorage.setItem(this.histKey, JSON.stringify(list));

      // Increment chant count
      const currentCount = await this.getChantedCount();
      localStorage.setItem(this.countKey, String(currentCount + 1));

      // Save unique date
      const dates = await this.getChantedDates();
      const todayStr = new Date().toISOString().split('T')[0];
      if (!dates.includes(todayStr)) {
        dates.push(todayStr);
        localStorage.setItem(this.datesKey, JSON.stringify(dates));
      }
    } catch {}
  }

  async getHistory(limit = 10): Promise<string[]> {
    try {
      const data = localStorage.getItem(this.histKey);
      const list: string[] = data ? JSON.parse(data) : [];
      return list.slice(0, limit);
    } catch {
      return [];
    }
  }

  async getChantedCount(): Promise<number> {
    try {
      const val = localStorage.getItem(this.countKey);
      return val ? parseInt(val, 10) : 0;
    } catch {
      return 0;
    }
  }

  async getChantedDates(): Promise<string[]> {
    try {
      const val = localStorage.getItem(this.datesKey);
      return val ? JSON.parse(val) : [];
    } catch {
      return [];
    }
  }

  async getChantStreak(): Promise<number> {
    const dates = await this.getChantedDates();
    if (dates.length === 0) return 0;

    const sortedDates = [...dates].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    const todayStr = new Date().toISOString().split('T')[0];
    
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (sortedDates[0] !== todayStr && sortedDates[0] !== yesterdayStr) {
      return 0;
    }

    let streak = 0;
    let checkDate = new Date(sortedDates[0]);
    
    while (true) {
      const checkStr = checkDate.toISOString().split('T')[0];
      if (sortedDates.includes(checkStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }
}

// -------------------------------------------------------------
// Native SQLite Database (using expo-sqlite)
// -------------------------------------------------------------
class SQLiteDatabase implements DatabaseInterface {
  private db: any = null;

  async initialize(): Promise<void> {
    try {
      const SQLite = require('expo-sqlite');
      this.db = await SQLite.openDatabaseAsync('mantras.db', { useNewConnection: true });
      
      // Create tables
      await this.db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS favorites (
          id TEXT PRIMARY KEY NOT NULL,
          added_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          mantra_id TEXT NOT NULL,
          played_at TEXT NOT NULL
        );
      `);
    } catch (e) {
      console.error('Failed to initialize SQLite database', e);
    }
  }

  async addFavorite(id: string): Promise<void> {
    if (!this.db) return;
    const now = new Date().toISOString();
    await this.db.runAsync(
      'INSERT OR REPLACE INTO favorites (id, added_at) VALUES (?, ?)',
      [id, now]
    );
  }

  async removeFavorite(id: string): Promise<void> {
    if (!this.db) return;
    await this.db.runAsync('DELETE FROM favorites WHERE id = ?', [id]);
  }

  async getFavorites(): Promise<string[]> {
    if (!this.db) return [];
    const rows = await this.db.getAllAsync('SELECT id FROM favorites ORDER BY added_at DESC');
    return rows.map((r: any) => r.id);
  }

  async isFavorite(id: string): Promise<boolean> {
    if (!this.db) return false;
    const row = await this.db.getFirstAsync('SELECT id FROM favorites WHERE id = ?', [id]);
    return !!row;
  }

  async addHistory(mantraId: string): Promise<void> {
    if (!this.db) return;
    const now = new Date().toISOString();
    await this.db.runAsync(
      'INSERT INTO history (mantra_id, played_at) VALUES (?, ?)',
      [mantraId, now]
    );
  }

  async getHistory(limit = 10): Promise<string[]> {
    if (!this.db) return [];
    // Get unique recently played mantras, most recent first
    const rows = await this.db.getAllAsync(`
      SELECT mantra_id, MAX(played_at) as played_at 
      FROM history 
      GROUP BY mantra_id 
      ORDER BY played_at DESC 
      LIMIT ?
    `, [limit]);
    return rows.map((r: any) => r.mantra_id);
  }

  async getChantedCount(): Promise<number> {
    if (!this.db) return 0;
    const row = await this.db.getFirstAsync('SELECT COUNT(*) as total FROM history');
    return row ? row.total : 0;
  }

  async getChantedDates(): Promise<string[]> {
    if (!this.db) return [];
    const rows = await this.db.getAllAsync("SELECT DISTINCT substr(played_at, 1, 10) as day FROM history ORDER BY day DESC");
    return rows.map((r: any) => r.day);
  }

  async getChantStreak(): Promise<number> {
    const dates = await this.getChantedDates();
    if (dates.length === 0) return 0;

    const todayStr = new Date().toISOString().split('T')[0];
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (dates[0] !== todayStr && dates[0] !== yesterdayStr) {
      return 0;
    }

    let streak = 0;
    let checkDate = new Date(dates[0]);
    
    while (true) {
      const checkStr = checkDate.toISOString().split('T')[0];
      if (dates.includes(checkStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }
}

export const dbService: DatabaseInterface =
  Platform.OS === 'web' ? new WebDatabase() : new SQLiteDatabase();
