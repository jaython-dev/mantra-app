export interface Verse {
  number: number;
  text: string;
  transliteration?: string;
  translation: string;
  meaning?: string; // Word-by-word meaning
  audioStart?: number; // Start offset in seconds
  audioEnd?: number; // End offset in seconds
}

export interface Mantra {
  id: string;
  title: string;
  deity: string;
  category: string;
  language: string;
  duration: number; // in seconds
  cover: any; // require() image
  audio: any; // require() audio
  lyrics: any; // JSON structure containing verses
  description: string;
  // Hierarchical associations
  bookId?: string;
  chapterId?: string;
  pageNumber?: number;
}

export interface Chapter {
  id: string;
  bookId: string;
  title: string;
  description: string;
  duration: number; // total duration in seconds
  mantrasCount: number;
  downloaded?: boolean;
  downloadProgress?: number;
  verses: Verse[];
  audio: any; // Chapter audiobook track
}

export interface Book {
  id: string;
  title: string;
  author: string;
  language: string;
  cover: any;
  description: string;
  chaptersCount: number;
  estimatedReadingTime: string; // e.g. "45 mins"
  category: string;
  chapters: Chapter[];
  downloaded?: boolean;
}

export const CATEGORIES = [
  'All',
  'Daily Prayers',
  'Morning Mantras',
  'Meditation',
  'Healing & Protection',
  'Devotional Songs',
  'Scriptures'
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
    description: 'The Gayatri Mantra is a highly revered chant from the Rig Veda. Dedicated to Savitr, the sun deity of beginnings, it is chanted for enlightenment, wisdom, and clearing the intellect.',
    bookId: 'rigveda',
    chapterId: 'rigveda_ch1',
    pageNumber: 1
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

export const BOOKS: Book[] = [
  {
    id: 'brahmpath',
    title: 'Brahmpath',
    author: 'ऋषि व्यास',
    language: 'Sanskrit / Hindi',
    cover: require('../assets/images/brahmpath_main.png'),
    description: 'विकास द्विवेदी कृत ब्रह्मपथ - सिद्ध याग कुञ्जिका. Sacred scripture and recitation of ancient wisdom for spiritual alignment.',
    chaptersCount: 12,
    estimatedReadingTime: '60 mins',
    category: 'Scriptures',
    chapters: [
      {
        id: 'brahmpath_ch1',
        bookId: 'brahmpath',
        title: 'Chapter 1: Siddha Yagya Kunjika',
        description: 'Initial recitation and invocation of spiritual energy.',
        duration: 240,
        mantrasCount: 5,
        audio: require('../assets/audio/shivatandava.mp3'),
        verses: [
          {
            number: 1,
            text: 'ॐ श्री ब्रह्मपथाय नमः',
            translation: 'Salutations to the sacred path of Brahmpath.',
            audioStart: 0,
            audioEnd: 15
          }
        ]
      }
    ]
  },
  {
    id: 'bhagavad_gita',
    title: 'Bhagavad Gita',
    author: 'Krishna Dvaipayana Vyasa',
    language: 'Sanskrit / English',
    cover: require('../assets/images/brahmpath_main.png'),
    description: 'The Bhagavad Gita, often referred to as the Gita, is a 700-verse Hindu scripture that is part of the epic Mahabharata. It is structured as a dialogue between Pandava prince Arjuna and his guide and charioteer Lord Krishna.',
    chaptersCount: 18,
    estimatedReadingTime: '3 hrs 45 mins',
    category: 'Scriptures',
    chapters: [
      {
        id: 'gita_ch1',
        bookId: 'bhagavad_gita',
        title: 'Chapter 1: Arjuna Vishada Yoga',
        description: 'Lamenting the Consequence of War. Arjuna experiences profound grief and despair upon seeing friends and family members arrayed on the battlefield, leading to spiritual inertia.',
        duration: 240,
        mantrasCount: 3,
        audio: require('../assets/audio/ganesha.mp3'),
        verses: [
          {
            number: 1,
            text: 'धृतराष्ट्र उवाच |\nधर्मक्षेत्रे कुरुक्षेत्रे समवेता युयुत्सवः |\nमामकाः पाण्डवाश्चैव किमकुर्वत सञ्जय ॥ १ ॥',
            transliteration: 'dhṛtarāṣṭra uvāca |\ndharmakṣetre kurukṣetre samavetā yuyutsavaḥ |\nmāmakāḥ pāṇḍavāścaiva kimakurvata sañjaya || 1 ||',
            translation: 'Dhritarashtra said: O Sanjaya, assembled on the holy plain of Kurukshetra, desiring to fight, what did my sons and the sons of Pandu do?',
            meaning: 'dharmakṣetre: on the field of piety; kurukṣetre: on the field of the Kurus; samavetāḥ: assembled; yuyutsavaḥ: desiring to fight; māmakāḥ: my party; pāṇḍavāḥ: the sons of Pandu; ca: and; eva: certainly; kim: what; akurvata: did; sañjaya: O Sanjaya.',
            audioStart: 0,
            audioEnd: 15
          },
          {
            number: 2,
            text: 'सञ्जय उवाच |\nदृष्ट्वा तु पाण्डवानीकं व्यूढं दुर्योधनस्तदा |\nआचार्यमुपसङ्गम्य राजा वचनमब्रवीत ॥ २ ॥',
            transliteration: 'sañjaya uvāca |\ndṛṣṭvā tu pāṇḍavānīkaṃ vyūḍhaṃ duryodhanastadā |\nācāryamupasaṅgamya rājā vacanamabravīt || 2 ||',
            translation: 'Sanjaya said: Having seen the army of the Pandavas arranged in military alignment, King Duryodhana then approached his teacher Drona and spoke these words.',
            meaning: 'dṛṣṭvā: having seen; tu: but; pāṇḍava-anīkam: the army of the Pandavas; vyūḍham: arranged in military formation; duryodhanaḥ: King Duryodhana; tadā: at that time; ācāryam: the teacher; upasaṅgamya: approaching; rājā: the king; vacanam: words; abravīt: spoke.',
            audioStart: 15,
            audioEnd: 30
          },
          {
            number: 3,
            text: 'पश्यैतां पाण्डुपुत्राणामाचार्य महतीं चमूम् |\nव्यूढां द्रुपदपुत्रेण तव शिष्येण धीमता ॥ ३ ॥',
            transliteration: 'paśyaitāṃ pāṇḍuputrāṇāmācārya mahatīṃ camūm |\nvyūḍhāṃ drupadaputreṇa tava śiṣyeṇa dhīmatā || 3 ||',
            translation: 'Behold, O teacher, this mighty army of the sons of Pandu, arranged by your wise disciple, the son of Drupada.',
            meaning: 'paśya: behold; etām: this; pāṇḍu-putrāṇām: of the sons of Pandu; ācārya: O teacher; mahatīm: great; camūm: military force; vyūḍhām: arranged; drupada-putreṇa: by the son of Drupada; tava: your; śiṣyeṇa: by the disciple; dhī-matā: highly intelligent.',
            audioStart: 30,
            audioEnd: 45
          }
        ]
      },
      {
        id: 'gita_ch2',
        bookId: 'bhagavad_gita',
        title: 'Chapter 2: Sankhya Yoga',
        description: 'The Constitution of the Soul. Lord Krishna instructs Arjuna in the path of self-realization, describing the eternal nature of the soul (Atman) and the value of selfless duty.',
        duration: 360,
        mantrasCount: 2,
        audio: require('../assets/audio/mahamrityunjaya.mp3'),
        verses: [
          {
            number: 1,
            text: 'सञ्जय उवाच |\nतं तथा कृपयाविष्टमश्रुपूर्णाकुलेक्षणम् |\nविषीदन्तमिदं वाक्यमुवाच मधुसूदनः ॥ १ ॥',
            transliteration: 'sañjaya uvāca |\ntaṃ tathā kṛpayāviṣṭamaśrupūrṇākulekṣaṇam |\nviṣīdantamidaṃ vākyamuvāca madhusūdanaḥ || 1 ||',
            translation: 'Sanjaya said: To him who was thus overwhelmed with pity, whose eyes were filled with tears of grief, and who was in deep despair, Madhusudana (Krishna) spoke these words.',
            meaning: 'tam: to Arjuna; tathā: thus; kṛpayā: by pity; āviṣṭam: overwhelmed; aśru-pūrṇa: filled with tears; ākula: distressed; īkṣaṇam: eyes; viṣīdantam: lamenting; idam: this; vākyam: speech; uvāca: spoke; madhusūdanaḥ: the slayer of Madhu.',
            audioStart: 0,
            audioEnd: 20
          },
          {
            number: 2,
            text: 'श्रीभगवानुवाच |\nकुतस्त्वा कश्मलमिदं विषमे समुपस्थितम् |\nअनार्यजुष्टमस्वर्ग्यमकीर्तिकर मर्जुन ॥ २ ॥',
            transliteration: 'śrībhagavānuvāca |\nkutastvā kaśmalamidaṃ viṣame samupasthitam |\nanāryajuṣṭamasvargyamakīrtikaram arjuna || 2 ||',
            translation: 'The Supreme Divine Lord said: My dear Arjuna, how have these impurities come upon you in this hour of crisis? They are unbecoming of a noble soul; they lead not to heaven but to infamy.',
            meaning: 'śrī-bhagavān uvāca: the Supreme Personality of Godhead spoke; kutaḥ: wherefrom; tvā: unto you; kaśmalam: dirt/impurities; idam: this; viṣame: in this hour of crisis; samupasthitam: arrived; anārya: persons who do not know the value of life; juṣṭam: practiced by; asvargyam: which does not lead to heaven; akīrti-karam: causing infamy; arjuna: O Arjuna.',
            audioStart: 20,
            audioEnd: 40
          }
        ]
      }
    ]
  },
  {
    id: 'isha_upanishad',
    title: 'Isha Upanishad',
    author: 'Ancient Vedic Rishis',
    language: 'Sanskrit / English',
    cover: require('../assets/images/mahamrityunjaya.png'),
    description: 'The Isha Upanishad is one of the shortest Upanishads, consisting of 18 verses. It is the final chapter of the Shukla Yajurveda. It focuses on the oneness of all existence and the integration of karma and wisdom.',
    chaptersCount: 1,
    estimatedReadingTime: '15 mins',
    category: 'Scriptures',
    chapters: [
      {
        id: 'isha_ch1',
        bookId: 'isha_upanishad',
        title: 'Full Text: 18 Verses of Isha',
        description: 'On the Oneness of God and World. Explains how the universe is pervaded by the Divine, and how one should live in the world without attachments or greed.',
        duration: 120,
        mantrasCount: 2,
        audio: require('../assets/audio/gayatri.mp3'),
        verses: [
          {
            number: 1,
            text: 'ॐ ईशावास्यमिदं सर्वं यत्किञ्च जगत्यां जगत् |\nतेन त्यक्तेन भुञ्जीथा मा गृधः कस्यस्विद्धनम् ॥ १ ॥',
            transliteration: 'oṃ īśāvāsyamidaṃ sarvaṃ yatkiñca jagatyāṃ jagat |\ntena tyaktena bhuñjīthā mā gṛdhaḥ kasyasviddhanam || 1 ||',
            translation: 'Everything in the universe, both the moving and the unmoving, is enveloped by the Divine. Therefore, support yourself with renunciation, and do not covet the wealth of others.',
            meaning: 'īśā-vāsyam: enveloped by the Lord; idam: this; sarvam: all; yat-kiñca: whatsoever; jagatyām: in the universe; jagat: moving; tena: by that; tyaktena: with renunciation; bhuñjīthā: enjoy/nourish yourself; mā: do not; gṛdhaḥ: covet; kasyasvit: of anyone; dhanam: wealth.',
            audioStart: 0,
            audioEnd: 30
          },
          {
            number: 2,
            text: 'कुर्वन्नेवेह कर्माणि जिजीविषेच्छतं समाः |\nएवं त्वयि नान्यथेतोऽस्ति न कर्म लिप्यते नरे ॥ २ ॥',
            transliteration: 'kurvanneveha karmāṇi jijīviṣecchataṃ samāḥ |\nevaṃ tvayi nānyatheto\'sti na karma lipyate nare || 2 ||',
            translation: 'One should wish to live a hundred years in this world only by performing selfless work. In this way, work will not bind you, and there is no other way for a human being.',
            meaning: 'kurvan: performing; eva: only; iha: here; karmāṇi: actions; jijīviṣet: should desire to live; śatam: hundred; samāḥ: years; evam: thus; tvayi: unto you; na: not; anyathā: otherwise; itaḥ: from this; asti: is; na: not; karma: action; lipyate: clings; nare: to a human.',
            audioStart: 30,
            audioEnd: 60
          }
        ]
      }
    ]
  },
  {
    id: 'rigveda',
    title: 'Rigveda Selections',
    author: 'Vedic Seers (Rishis)',
    language: 'Sanskrit',
    cover: require('../assets/images/gayatri.png'),
    description: 'Select hymns from the Rigveda, the oldest of the four sacred Vedas. Contains powerful hymns dedicated to cosmic order, fire (Agni), creation, and intellect (Gayatri).',
    chaptersCount: 3,
    estimatedReadingTime: '30 mins',
    category: 'Scriptures',
    chapters: [
      {
        id: 'rigveda_ch1',
        bookId: 'rigveda',
        title: 'Hymn 1: Gayatri Mantra',
        description: 'Rigveda Mandala 3, Hymn 62, Verse 10. Chanted for mental illumination, intellect purification, and connecting to the spiritual sun.',
        duration: 50,
        mantrasCount: 1,
        audio: require('../assets/audio/gayatri.mp3'),
        verses: [
          {
            number: 1,
            text: 'ॐ भूर्भुवः स्वः |\nतत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि |\nधियो यो नः प्रचोदयात् ॥',
            transliteration: 'oṃ bhūrbhuvaḥ svaḥ |\ntatsaviturvareṇyaṃ bhargo devasya dhīmahi |\ndhiyo yo naḥ pracodayāt ||',
            translation: 'We meditate upon the sacred light of the adorable Sun; may He illuminate and guide our intellect towards righteousness and wisdom.',
            meaning: 'bhūr: earth; bhuvaḥ: atmosphere; svaḥ: heavens; tat: that; savituḥ: of the sun god; vareṇyam: adorable; bhargaḥ: divine light; devasya: of the deity; dhīmahi: let us meditate; dhiyaḥ: intellect; yaḥ: who; naḥ: our; pracodayāt: inspire/guide.',
            audioStart: 0,
            audioEnd: 48
          }
        ]
      }
    ]
  }
];
