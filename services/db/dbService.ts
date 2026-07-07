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
}

// -------------------------------------------------------------
// Web/Fallback Database Simulation (using localStorage)
// -------------------------------------------------------------
class WebDatabase implements DatabaseInterface {
  private favKey = 'mantra_db_favorites';
  private histKey = 'mantra_db_history';

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
}

export const dbService: DatabaseInterface =
  Platform.OS === 'web' ? new WebDatabase() : new SQLiteDatabase();
