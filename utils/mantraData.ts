export interface Mantra {
  id: string;
  title: string;
  deity: string;
  category: string;
  language: string;
  duration: number; // in seconds
  cover: any; // require() image
  audio: any; // require() audio
  lyrics: any; // JSON structure
  description: string;
}

export const CATEGORIES = [
  'All',
  'Daily Prayers',
  'Morning Mantras',
  'Meditation',
  'Healing & Protection',
  'Devotional Songs'
];

export const MANTRAS: Mantra[] = [
  {
    id: 'gayatri',
    title: 'Gayatri Mantra',
    deity: 'Gayatri / Savitr',
    category: 'Daily Prayers',
    language: 'Sanskrit',
    duration: 50,
    cover: require('../assets/images/gayatri.png'),
    audio: require('../assets/audio/gayatri.mp3'),
    lyrics: require('../assets/lyrics/gayatri.json'),
    description: 'The Gayatri Mantra is a highly revered chant from the Rig Veda. Dedicated to Savitr, the sun deity of beginnings, it is chanted for enlightenment, wisdom, and clearing the intellect.'
  },
  {
    id: 'mahamrityunjaya',
    title: 'Mahamrityunjaya Mantra',
    deity: 'Shiva',
    category: 'Healing & Protection',
    language: 'Sanskrit',
    duration: 56,
    cover: require('../assets/images/mahamrityunjaya.png'),
    audio: require('../assets/audio/mahamrityunjaya.mp3'),
    lyrics: require('../assets/lyrics/mahamrityunjaya.json'),
    description: 'Also known as the Rudra Mantra, this powerful chant is dedicated to Lord Shiva. It is chanted for rejuvenation, physical and mental healing, and overcoming the fear of mortality.'
  },
  {
    id: 'ganesha',
    title: 'Ganesha Mantra (Vakratunda)',
    deity: 'Ganesha',
    category: 'Morning Mantras',
    language: 'Sanskrit',
    duration: 55,
    cover: require('../assets/images/ganesha.png'),
    audio: require('../assets/audio/ganesha.mp3'),
    lyrics: require('../assets/lyrics/ganesha.json'),
    description: 'Chanted to invoke Lord Ganesha, the lord of wisdom and remover of obstacles. Traditionally recited before beginning any new venture to ensure smooth progress and success.'
  },
  {
    id: 'harekrishna',
    title: 'Hare Krishna Mahamantra',
    deity: 'Krishna / Rama',
    category: 'Meditation',
    language: 'Sanskrit',
    duration: 50,
    cover: require('../assets/images/harekrishna.png'),
    audio: require('../assets/audio/harekrishna.mp3'),
    lyrics: require('../assets/lyrics/harekrishna.json'),
    description: 'A 16-word Vaishnava mantra which is mentioned in the Kali-Santarana Upanishad. Chanted for spiritual purification, emotional calm, and merging into transcendental consciousness.'
  },
  {
    id: 'shivatandava',
    title: 'Shiva Tandava Stotram',
    deity: 'Shiva',
    category: 'Devotional Songs',
    language: 'Sanskrit',
    duration: 56,
    cover: require('../assets/images/shivatandava.png'),
    audio: require('../assets/audio/shivatandava.mp3'),
    lyrics: require('../assets/lyrics/shivatandava.json'),
    description: 'A dynamic stotra describing the power and beauty of Lord Shiva\'s cosmic dance. Composed by Ravana, it represents energy, cosmic order, and aesthetic devotional surrender.'
  }
];
