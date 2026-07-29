export interface GenreCategoryConfig {
  id: string;
  title: string;
  description?: string;
  queryParams: {
    sort?: string[];
    format?: string;
    status?: string;
    seasonYear?: number;
    season?: string;
    minimumScore?: number;
    episodesLesser?: number;
    episodesGreater?: number;
    excludedGenres?: string[];
    tagIn?: string[];
    tagNotIn?: string[];
    searchQuery?: string;
    page?: number;
  };
}

export interface GenreConfig {
  slug: string;
  name: string; // Exact AniList genre name
  japaneseName: string;
  description: string;
  sampleTitles: string[];
  bgGradient: string;
  accentColor: string;
  borderColor: string;
  badgeBg: string;
  aspectRatio: 'tall' | 'wide' | 'square' | 'hero';
  featured?: boolean;
  popularCount: string;
  relatedGenres: string[]; // Slugs or names
  categories: GenreCategoryConfig[];
}

export interface MoodConfig {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  bgGradient: string;
  genres: string[]; // List of genre names or slugs
  queryOpts: {
    sort?: string[];
    minimumScore?: number;
    excludedGenres?: string[];
    format?: string;
  };
}

export const MOOD_COLLECTIONS: MoodConfig[] = [
  {
    id: 'adrenaline',
    title: 'Adrenaline Rush',
    subtitle: 'High-stakes action, explosive battles & edge-of-your-seat intensity',
    emoji: '⚡',
    bgGradient: 'from-[#389B5F]/30 via-[#0E1410] to-[#060807]',
    genres: ['Action', 'Thriller', 'Supernatural'],
    queryOpts: { sort: ['TRENDING_DESC'], minimumScore: 75 },
  },
  {
    id: 'cozy-wholesome',
    title: 'Cozy & Wholesome',
    subtitle: 'Warm slice-of-life, comforting comedy & relaxing everyday moments',
    emoji: '☕',
    bgGradient: 'from-[#C5A059]/20 via-[#0E1410] to-[#060807]',
    genres: ['Slice of Life', 'Comedy'],
    queryOpts: { sort: ['SCORE_DESC'], minimumScore: 78, excludedGenres: ['Ecchi', 'Horror'] },
  },
  {
    id: 'mind-bending',
    title: 'Mind-Bending Thrills',
    subtitle: 'Complex mysteries, psychological games & unexpected plot twists',
    emoji: '🧠',
    bgGradient: 'from-[#1A2E22] via-[#0E1410] to-[#060807]',
    genres: ['Psychological', 'Mystery', 'Thriller'],
    queryOpts: { sort: ['SCORE_DESC'], minimumScore: 80 },
  },
  {
    id: 'romantic-heartfelt',
    title: 'Heartfelt Romance',
    subtitle: 'Sweet love stories, emotional journeys & memorable character bonds',
    emoji: '💖',
    bgGradient: 'from-[#389B5F]/20 via-[#1F1810] to-[#060807]',
    genres: ['Romance', 'Drama'],
    queryOpts: { sort: ['POPULARITY_DESC'], minimumScore: 76 },
  },
  {
    id: 'epic-fantasy',
    title: 'Epic Fantasy Worlds',
    subtitle: 'Magic realms, mythical quests & expansive world-building',
    emoji: '🗡️',
    bgGradient: 'from-[#C5A059]/30 via-[#0E1410] to-[#060807]',
    genres: ['Fantasy', 'Adventure'],
    queryOpts: { sort: ['POPULARITY_DESC'], minimumScore: 75 },
  },
];

export const GENRES_CONFIG: GenreConfig[] = [
  {
    slug: 'action',
    name: 'Action',
    japaneseName: 'アクション',
    description: 'High-octane fights, Martial Arts, fast-paced combat, and epic battles.',
    sampleTitles: ['Attack on Titan', 'Jujutsu Kaisen', 'Demon Slayer', 'Solo Leveling'],
    bgGradient: 'from-[#389B5F]/40 via-[#152B1D] to-[#060807]',
    accentColor: '#389B5F',
    borderColor: 'border-[#389B5F]/40',
    badgeBg: 'bg-[#389B5F]/20 text-[#6CE097]',
    aspectRatio: 'hero',
    featured: true,
    popularCount: '4,200+ Titles',
    relatedGenres: ['adventure', 'supernatural', 'thriller', 'sci-fi'],
    categories: [
      {
        id: 'trending-action',
        title: '🔥 Trending Action',
        description: 'Currently booming combat anime on everyone’s watchlist',
        queryParams: { sort: ['TRENDING_DESC'] },
      },
      {
        id: 'top-rated-action',
        title: '🏆 Highest Rated Action Legends',
        description: 'Masterpieces with exceptional animation and choreography',
        queryParams: { sort: ['SCORE_DESC'], minimumScore: 82 },
      },
      {
        id: 'shonen-tactical',
        title: '⚔️ High-Stakes Battle Anime',
        description: 'Intense martial arts and superpower showdowns',
        queryParams: { sort: ['POPULARITY_DESC'], minimumScore: 78 },
      },
      {
        id: 'action-movies',
        title: '🎬 Action Feature Films',
        description: 'Cinematic quality blockbusters and high-budget features',
        queryParams: { format: 'MOVIE', sort: ['SCORE_DESC'] },
      },
      {
        id: 'hidden-action-gems',
        title: '💎 Underrated Action Gems',
        description: 'Critically acclaimed action titles deserving more love',
        queryParams: { sort: ['SCORE_DESC'], minimumScore: 77, page: 2 },
      },
    ],
  },
  {
    slug: 'adventure',
    name: 'Adventure',
    japaneseName: '冒険',
    description: 'Journeys into unknown worlds, treasure hunts, and grand quests.',
    sampleTitles: ['One Piece', 'Hunter x Hunter', 'Frieren: Beyond Journey\'s End', 'Made in Abyss'],
    bgGradient: 'from-[#C5A059]/40 via-[#262013] to-[#060807]',
    accentColor: '#C5A059',
    borderColor: 'border-[#C5A059]/40',
    badgeBg: 'bg-[#C5A059]/20 text-[#E5C383]',
    aspectRatio: 'tall',
    featured: true,
    popularCount: '3,800+ Titles',
    relatedGenres: ['fantasy', 'action', 'sci-fi', 'mystery'],
    categories: [
      {
        id: 'trending-adventure',
        title: '🌟 Trending Adventures',
        description: 'Grand journeys currently captivating viewers',
        queryParams: { sort: ['TRENDING_DESC'] },
      },
      {
        id: 'epic-journeys',
        title: '🗺️ Highest Rated Explorations',
        description: 'Top-tier world-building and memorable odysseys',
        queryParams: { sort: ['SCORE_DESC'], minimumScore: 82 },
      },
      {
        id: 'classic-quest',
        title: '🏰 Fantasy Quest & Exploration',
        description: 'Magic, guild quests, and mythical expedition realms',
        queryParams: { sort: ['POPULARITY_DESC'], minimumScore: 75 },
      },
      {
        id: 'adventure-movies',
        title: '🎞️ Cinematic Expeditions',
        description: 'Feature film adventures into breathtaking lands',
        queryParams: { format: 'MOVIE', sort: ['SCORE_DESC'] },
      },
    ],
  },
  {
    slug: 'comedy',
    name: 'Comedy',
    japaneseName: 'コメディ',
    description: 'Hilarity, parodies, slapstick humor, and witty absurdities.',
    sampleTitles: ['Gintama', 'Kaguya-sama', 'Konosuba', 'Spy x Family'],
    bgGradient: 'from-[#25663E]/40 via-[#102016] to-[#060807]',
    accentColor: '#4ADE80',
    borderColor: 'border-green-500/40',
    badgeBg: 'bg-green-950/60 text-green-400',
    aspectRatio: 'square',
    featured: true,
    popularCount: '5,100+ Titles',
    relatedGenres: ['slice-of-life', 'romance', 'fantasy'],
    categories: [
      {
        id: 'trending-comedy',
        title: '😂 Trending Laughs',
        description: 'The funniest airing and recent comedy releases',
        queryParams: { sort: ['TRENDING_DESC'] },
      },
      {
        id: 'top-rated-comedy',
        title: '👑 Comedy Hall of Fame',
        description: 'Unanimous fan-favorite funny anime',
        queryParams: { sort: ['SCORE_DESC'], minimumScore: 80 },
      },
      {
        id: 'wholesome-comedy',
        title: '🌾 Wholesome & Lighthearted',
        description: 'Feel-good comedy without intense drama or dark themes',
        queryParams: { sort: ['POPULARITY_DESC'], excludedGenres: ['Ecchi', 'Horror', 'Thriller'] },
      },
      {
        id: 'short-comedy',
        title: '⚡ Quick Pick-Me-Ups',
        description: 'Short episode formats or single-cour comedy series',
        queryParams: { sort: ['POPULARITY_DESC'], episodesLesser: 13 },
      },
    ],
  },
  {
    slug: 'drama',
    name: 'Drama',
    japaneseName: 'ドラマ',
    description: 'Deep human emotion, personal growth, conflict, and poignant stories.',
    sampleTitles: ['Your Lie in April', 'Clannad', 'Violet Evergarden', 'March Comes in Like a Lion'],
    bgGradient: 'from-[#8B5CF6]/30 via-[#1C1629] to-[#060807]',
    accentColor: '#A78BFA',
    borderColor: 'border-purple-500/40',
    badgeBg: 'bg-purple-950/60 text-purple-300',
    aspectRatio: 'tall',
    featured: true,
    popularCount: '3,400+ Titles',
    relatedGenres: ['romance', 'slice-of-life', 'psychological', 'music'],
    categories: [
      {
        id: 'trending-drama',
        title: '🎭 Trending Dramas',
        description: 'Emotionally charged series engaging audiences right now',
        queryParams: { sort: ['TRENDING_DESC'] },
      },
      {
        id: 'tearjerkers',
        title: '💧 Acclaimed Tearjerkers',
        description: 'Profound masterpieces that leave lasting emotional impressions',
        queryParams: { sort: ['SCORE_DESC'], minimumScore: 83 },
      },
      {
        id: 'coming-of-age',
        title: '🌱 Coming of Age & Life Lessons',
        description: 'Character-driven stories of youth and maturation',
        queryParams: { sort: ['POPULARITY_DESC'], minimumScore: 78 },
      },
      {
        id: 'drama-movies',
        title: '🎬 Cinematic Drama Masterpieces',
        description: 'Critically celebrated theatrical animated dramas',
        queryParams: { format: 'MOVIE', sort: ['SCORE_DESC'] },
      },
    ],
  },
  {
    slug: 'ecchi',
    name: 'Ecchi',
    japaneseName: 'エッチ',
    description: 'Playful fan-service, romantic shenanigans, and humorous suggestive themes.',
    sampleTitles: ['High School DxD', 'Food Wars!', 'To LOVE-Ru', 'No Game No Life'],
    bgGradient: 'from-[#EC4899]/30 via-[#26101B] to-[#060807]',
    accentColor: '#F472B6',
    borderColor: 'border-pink-500/40',
    badgeBg: 'bg-pink-950/60 text-pink-300',
    aspectRatio: 'square',
    featured: false,
    popularCount: '1,900+ Titles',
    relatedGenres: ['comedy', 'harem', 'romance', 'fantasy'],
    categories: [
      {
        id: 'trending-ecchi',
        title: '🔥 Trending Fan-Service',
        description: 'Most active ecchi and harem series',
        queryParams: { sort: ['TRENDING_DESC'] },
      },
      {
        id: 'top-rated-ecchi',
        title: '⭐ Fan-Favorite Ecchi Comedy',
        description: 'Popular titles blending humor and suggestive tropes',
        queryParams: { sort: ['SCORE_DESC'], minimumScore: 72 },
      },
      {
        id: 'supernatural-ecchi',
        title: '🪄 Fantasy & Supernatural Harem',
        description: 'Magical worlds filled with ecchi antics',
        queryParams: { sort: ['POPULARITY_DESC'] },
      },
    ],
  },
  {
    slug: 'fantasy',
    name: 'Fantasy',
    japaneseName: 'ファンタジー',
    description: 'Magic, mythical creatures, otherworldly realms, and magical arts.',
    sampleTitles: ['Frieren', 'Jobless Reincarnation', 'Re:Zero', 'Fullmetal Alchemist'],
    bgGradient: 'from-[#389B5F]/35 via-[#C5A059]/20 to-[#060807]',
    accentColor: '#C5A059',
    borderColor: 'border-[#C5A059]/40',
    badgeBg: 'bg-[#C5A059]/20 text-[#E5C383]',
    aspectRatio: 'hero',
    featured: true,
    popularCount: '6,400+ Titles',
    relatedGenres: ['adventure', 'action', 'supernatural', 'isekai'],
    categories: [
      {
        id: 'trending-fantasy',
        title: '✨ Trending Fantasy Realms',
        description: 'Currently popular magical and otherworldly series',
        queryParams: { sort: ['TRENDING_DESC'] },
      },
      {
        id: 'top-rated-fantasy',
        title: '👑 Legendary Fantasy Masterpieces',
        description: 'Highest rated world-building epics of all time',
        queryParams: { sort: ['SCORE_DESC'], minimumScore: 84 },
      },
      {
        id: 'magic-adventure',
        title: '🔮 High Magic & Guild Adventures',
        description: 'Spellcasters, dungeons, and mythical beasts',
        queryParams: { sort: ['POPULARITY_DESC'], minimumScore: 78 },
      },
      {
        id: 'dark-fantasy',
        title: '🌒 Dark & Gritty Fantasy',
        description: 'Higher stakes, survival themes, and grim worlds',
        queryParams: { sort: ['SCORE_DESC'], minimumScore: 77 },
      },
    ],
  },
  {
    slug: 'horror',
    name: 'Horror',
    japaneseName: 'ホラー',
    description: 'Chilling tales, eerie suspense, psychological terror, and macabre themes.',
    sampleTitles: ['Another', 'Shiki', 'Parasyte', 'Higurashi When They Cry'],
    bgGradient: 'from-[#EF4444]/30 via-[#2A0F11] to-[#060807]',
    accentColor: '#F87171',
    borderColor: 'border-red-600/40',
    badgeBg: 'bg-red-950/60 text-red-400',
    aspectRatio: 'tall',
    featured: false,
    popularCount: '1,100+ Titles',
    relatedGenres: ['thriller', 'mystery', 'psychological', 'supernatural'],
    categories: [
      {
        id: 'trending-horror',
        title: '🩸 Trending Terror',
        description: 'Chilling titles catching horror fan attention right now',
        queryParams: { sort: ['TRENDING_DESC'] },
      },
      {
        id: 'top-rated-horror',
        title: '☠️ Acclaimed Horrors & Thrills',
        description: 'Top rated eerie masterclasses in tension and terror',
        queryParams: { sort: ['SCORE_DESC'], minimumScore: 76 },
      },
      {
        id: 'psychological-horror',
        title: '👁️ Mind-Warping Suspense',
        description: 'Disturbing mysteries and claustrophobic thrillers',
        queryParams: { sort: ['POPULARITY_DESC'] },
      },
    ],
  },
  {
    slug: 'mahou-shoujo',
    name: 'Mahou Shoujo',
    japaneseName: '魔法少女',
    description: 'Magical girls, sparkling transformations, power of friendship, and dark subversions.',
    sampleTitles: ['Puella Magi Madoka Magica', 'Sailor Moon', 'Cardcaptor Sakura', 'Princess Tutu'],
    bgGradient: 'from-[#F472B6]/30 via-[#251221] to-[#060807]',
    accentColor: '#F472B6',
    borderColor: 'border-pink-400/40',
    badgeBg: 'bg-pink-950/60 text-pink-300',
    aspectRatio: 'square',
    featured: false,
    popularCount: '650+ Titles',
    relatedGenres: ['fantasy', 'drama', 'supernatural', 'comedy'],
    categories: [
      {
        id: 'trending-mahou',
        title: '🪄 Popular Magical Girl Series',
        description: 'Current and iconic magical girl anime',
        queryParams: { sort: ['POPULARITY_DESC'] },
      },
      {
        id: 'dark-mahou',
        title: '🌘 Dark & Subversive Magical Girls',
        description: 'Deconstructive and psychologically intense takes on the genre',
        queryParams: { sort: ['SCORE_DESC'], minimumScore: 80 },
      },
      {
        id: 'classic-mahou',
        title: '💖 Classic Transformation Magic',
        description: 'Heartwarming adventures, friendship, and iconic heroines',
        queryParams: { sort: ['SCORE_DESC'], minimumScore: 75 },
      },
    ],
  },
  {
    slug: 'mecha',
    name: 'Mecha',
    japaneseName: 'メカ',
    description: 'Giant robots, futuristic warfare, military strategy, and pilot stories.',
    sampleTitles: ['Neon Genesis Evangelion', 'Code Geass', 'Mobile Suit Gundam', '86 Six'],
    bgGradient: 'from-[#3B82F6]/30 via-[#0F1C33] to-[#060807]',
    accentColor: '#60A5FA',
    borderColor: 'border-blue-500/40',
    badgeBg: 'bg-blue-950/60 text-blue-300',
    aspectRatio: 'wide',
    featured: false,
    popularCount: '2,200+ Titles',
    relatedGenres: ['sci-fi', 'action', 'military', 'drama'],
    categories: [
      {
        id: 'trending-mecha',
        title: '🤖 Trending Mecha',
        description: 'High-tech robot battles and tactical sci-fi series',
        queryParams: { sort: ['TRENDING_DESC'] },
      },
      {
        id: 'masterpiece-mecha',
        title: '🎖️ Masterpiece Mecha Epics',
        description: 'Timeless anime defined by profound political and psychological depth',
        queryParams: { sort: ['SCORE_DESC'], minimumScore: 82 },
      },
      {
        id: 'real-robot-sci-fi',
        title: '🚀 Tactical Sci-Fi Warfare',
        description: 'Gundam, military strategy, and space combat',
        queryParams: { sort: ['POPULARITY_DESC'], minimumScore: 77 },
      },
    ],
  },
  {
    slug: 'music',
    name: 'Music',
    japaneseName: '音楽',
    description: 'Band performances, idol groups, classical passion, and musical dreams.',
    sampleTitles: ['Bocchi the Rock!', 'K-On!', 'Your Lie in April', 'NANA', 'Carole & Tuesday'],
    bgGradient: 'from-[#EAB308]/30 via-[#26200D] to-[#060807]',
    accentColor: '#FACC15',
    borderColor: 'border-yellow-500/40',
    badgeBg: 'bg-yellow-950/60 text-yellow-300',
    aspectRatio: 'square',
    featured: false,
    popularCount: '1,400+ Titles',
    relatedGenres: ['slice-of-life', 'drama', 'comedy'],
    categories: [
      {
        id: 'trending-music',
        title: '🎸 Trending Musical Acts',
        description: 'Rock bands, idols, and musical stories making waves',
        queryParams: { sort: ['TRENDING_DESC'] },
      },
      {
        id: 'acclaimed-music',
        title: '🎵 Top Rated Musical Masterpieces',
        description: 'Inspirational stories powered by unforgettable soundtracks',
        queryParams: { sort: ['SCORE_DESC'], minimumScore: 80 },
      },
      {
        id: 'band-rock',
        title: '🥁 Band & Rock Performance',
        description: 'Group dynamics, band rehearsals, and live concert energy',
        queryParams: { sort: ['POPULARITY_DESC'], minimumScore: 78 },
      },
    ],
  },
  {
    slug: 'mystery',
    name: 'Mystery',
    japaneseName: 'ミステリー',
    description: 'Whodunits, crime investigations, supernatural riddles, and secret truths.',
    sampleTitles: ['Hyouka', 'Monster', 'Erased', 'Detective Conan', 'The Promised Neverland'],
    bgGradient: 'from-[#10B981]/30 via-[#0B211A] to-[#060807]',
    accentColor: '#34D399',
    borderColor: 'border-emerald-500/40',
    badgeBg: 'bg-emerald-950/60 text-emerald-300',
    aspectRatio: 'tall',
    featured: true,
    popularCount: '2,600+ Titles',
    relatedGenres: ['psychological', 'thriller', 'supernatural', 'drama'],
    categories: [
      {
        id: 'trending-mystery',
        title: '🔍 Trending Mysteries',
        description: 'Unraveling secrets currently engaging mystery lovers',
        queryParams: { sort: ['TRENDING_DESC'] },
      },
      {
        id: 'top-rated-mystery',
        title: '🧩 Genius Detective & Crime Masterpieces',
        description: 'Meticulously crafted plots with brilliant detective work',
        queryParams: { sort: ['SCORE_DESC'], minimumScore: 82 },
      },
      {
        id: 'supernatural-mystery',
        title: '👻 Supernatural Inquiries',
        description: 'Occult riddles, urban legends, and mysterious phenomena',
        queryParams: { sort: ['POPULARITY_DESC'], minimumScore: 77 },
      },
    ],
  },
  {
    slug: 'psychological',
    name: 'Psychological',
    japaneseName: 'サイコロジカル',
    description: 'Mind games, morality dilemmas, sanity checks, and complex internal struggles.',
    sampleTitles: ['Death Note', 'Monster', 'Steins;Gate', 'Classroom of the Elite', 'Psycho-Pass'],
    bgGradient: 'from-[#6366F1]/30 via-[#151733] to-[#060807]',
    accentColor: '#818CF8',
    borderColor: 'border-indigo-500/40',
    badgeBg: 'bg-indigo-950/60 text-indigo-300',
    aspectRatio: 'hero',
    featured: true,
    popularCount: '1,800+ Titles',
    relatedGenres: ['thriller', 'mystery', 'drama', 'sci-fi'],
    categories: [
      {
        id: 'trending-psychological',
        title: '🌀 Mind-Bending Trends',
        description: 'Intense mental duels and complex narrative games',
        queryParams: { sort: ['TRENDING_DESC'] },
      },
      {
        id: 'top-rated-psychological',
        title: '🧠 Intellectual Masterpieces',
        description: 'Unrivaled psychological thrillers with legendary writing',
        queryParams: { sort: ['SCORE_DESC'], minimumScore: 83 },
      },
      {
        id: 'survival-mind-games',
        title: '♠️ High Stakes & Strategy Battles',
        description: 'Survival games, gambits, and moral testings',
        queryParams: { sort: ['POPULARITY_DESC'], minimumScore: 78 },
      },
    ],
  },
  {
    slug: 'romance',
    name: 'Romance',
    japaneseName: '恋愛',
    description: 'Sweet heartbeats, romantic rivalries, school love, and lifelong devotion.',
    sampleTitles: ['Kaguya-sama: Love is War', 'Horimiya', 'Toradora!', 'My Dress-Up Darling', 'Fruits Basket'],
    bgGradient: 'from-[#389B5F]/30 via-[#261521] to-[#060807]',
    accentColor: '#389B5F',
    borderColor: 'border-[#389B5F]/40',
    badgeBg: 'bg-[#389B5F]/20 text-[#6CE097]',
    aspectRatio: 'tall',
    featured: true,
    popularCount: '5,800+ Titles',
    relatedGenres: ['comedy', 'drama', 'slice-of-life', 'school'],
    categories: [
      {
        id: 'trending-romance',
        title: '💖 Trending Love Stories',
        description: 'The romantic series everyone is gushing over right now',
        queryParams: { sort: ['TRENDING_DESC'] },
      },
      {
        id: 'pure-wholesome-romance',
        title: '🌸 Pure & Wholesome Romance',
        description: 'Sweet, feel-good relationships without unnecessary ecchi',
        queryParams: { sort: ['SCORE_DESC'], minimumScore: 80, excludedGenres: ['Ecchi', 'Horror'] },
      },
      {
        id: 'rom-com-gems',
        title: '💌 Top Romantic Comedies',
        description: 'Perfect blend of laughter and romantic butterflies',
        queryParams: { sort: ['POPULARITY_DESC'], minimumScore: 78 },
      },
      {
        id: 'fantasy-romance',
        title: '🏰 Otherworldly & Historical Love',
        description: 'Romance set in magical kingdoms and ancient eras',
        queryParams: { sort: ['SCORE_DESC'], minimumScore: 77 },
      },
      {
        id: 'romance-movies',
        title: '🎬 Unforgettable Romantic Films',
        description: 'Stunning theatrical anime love stories',
        queryParams: { format: 'MOVIE', sort: ['SCORE_DESC'] },
      },
    ],
  },
  {
    slug: 'sci-fi',
    name: 'Sci-Fi',
    japaneseName: 'SF',
    description: 'Futuristic tech, time travel, space exploration, and cybernetic worlds.',
    sampleTitles: ['Steins;Gate', 'Cowboy Bebop', 'Cyberpunk: Edgerunners', 'Ghost in the Shell'],
    bgGradient: 'from-[#14B8A6]/30 via-[#0A2222] to-[#060807]',
    accentColor: '#2DD4BF',
    borderColor: 'border-teal-500/40',
    badgeBg: 'bg-teal-950/60 text-teal-300',
    aspectRatio: 'hero',
    featured: true,
    popularCount: '3,100+ Titles',
    relatedGenres: ['mecha', 'action', 'psychological', 'mystery'],
    categories: [
      {
        id: 'trending-scifi',
        title: '🌐 Trending Sci-Fi',
        description: 'Futuristic and cyberpunk series captivating fans',
        queryParams: { sort: ['TRENDING_DESC'] },
      },
      {
        id: 'top-rated-scifi',
        title: '⏳ Legendary Sci-Fi Classics',
        description: 'Time travel, space westerns, and philosophical cyberpunk',
        queryParams: { sort: ['SCORE_DESC'], minimumScore: 83 },
      },
      {
        id: 'cyberpunk-dystopia',
        title: '🏙️ Cyberpunk & Dystopian Futures',
        description: 'High tech, low life, AI, and futuristic cities',
        queryParams: { sort: ['POPULARITY_DESC'], minimumScore: 78 },
      },
      {
        id: 'space-exploration',
        title: '🌌 Outer Space Odysseys',
        description: 'Intergalactic travel, space bounty hunters, and planets',
        queryParams: { sort: ['SCORE_DESC'], minimumScore: 78 },
      },
    ],
  },
  {
    slug: 'slice-of-life',
    name: 'Slice of Life',
    japaneseName: '日常',
    description: 'Gentle daily routines, heartwarming friendships, healing atmospheres, and simple joy.',
    sampleTitles: ['Laid-Back Camp', 'Barakamon', 'Non Non Biyori', 'Hyouka', 'March Comes in Like a Lion'],
    bgGradient: 'from-[#C5A059]/30 via-[#1C1810] to-[#060807]',
    accentColor: '#C5A059',
    borderColor: 'border-[#C5A059]/40',
    badgeBg: 'bg-[#C5A059]/20 text-[#E5C383]',
    aspectRatio: 'tall',
    featured: true,
    popularCount: '4,500+ Titles',
    relatedGenres: ['comedy', 'school', 'music', 'drama'],
    categories: [
      {
        id: 'trending-sol',
        title: '☕ Trending Warmth',
        description: 'Relaxing slice-of-life series gaining fan affection',
        queryParams: { sort: ['TRENDING_DESC'] },
      },
      {
        id: 'iyashikei-healing',
        title: '🍃 Healing & Cozy Atmosphere',
        description: 'Stress-relieving, gentle shows for peace of mind',
        queryParams: { sort: ['SCORE_DESC'], minimumScore: 80, excludedGenres: ['Ecchi', 'Horror', 'Action'] },
      },
      {
        id: 'school-life-friendship',
        title: '🏫 School Days & Friendship',
        description: 'Relatable student routines and club activities',
        queryParams: { sort: ['POPULARITY_DESC'], minimumScore: 77 },
      },
    ],
  },
  {
    slug: 'sports',
    name: 'Sports',
    japaneseName: 'スポーツ',
    description: 'Team rivalry, tournament passion, physical conditioning, and athletic triumphs.',
    sampleTitles: ['Haikyu!!', 'Kuroko\'s Basketball', 'Blue Lock', 'Hajime no Ippo', 'Slam Dunk'],
    bgGradient: 'from-[#F97316]/30 via-[#26150A] to-[#060807]',
    accentColor: '#FB923C',
    borderColor: 'border-orange-500/40',
    badgeBg: 'bg-orange-950/60 text-orange-300',
    aspectRatio: 'square',
    featured: false,
    popularCount: '1,300+ Titles',
    relatedGenres: ['action', 'drama', 'shonen'],
    categories: [
      {
        id: 'trending-sports',
        title: '⚽ Trending Tournaments',
        description: 'Electrifying sports anime taking center stage',
        queryParams: { sort: ['TRENDING_DESC'] },
      },
      {
        id: 'top-rated-sports',
        title: '🏆 Legendary Sports Anime',
        description: 'Unforgettable team spirit and championship journeys',
        queryParams: { sort: ['SCORE_DESC'], minimumScore: 82 },
      },
      {
        id: 'high-stakes-competition',
        title: '🔥 Intense Competitive Battles',
        description: 'Strategic games, training arcs, and underdog stories',
        queryParams: { sort: ['POPULARITY_DESC'], minimumScore: 78 },
      },
    ],
  },
  {
    slug: 'supernatural',
    name: 'Supernatural',
    japaneseName: '超自然',
    description: 'Spirits, yokai, exorcists, demonic pacts, and inexplicable forces.',
    sampleTitles: ['Jujutsu Kaisen', 'Bleach', 'Mob Psycho 100', 'Noragami', 'Monogatari'],
    bgGradient: 'from-[#10B981]/30 via-[#0D2118] to-[#060807]',
    accentColor: '#34D399',
    borderColor: 'border-emerald-500/40',
    badgeBg: 'bg-emerald-950/60 text-emerald-300',
    aspectRatio: 'hero',
    featured: true,
    popularCount: '5,200+ Titles',
    relatedGenres: ['action', 'fantasy', 'mystery', 'horror'],
    categories: [
      {
        id: 'trending-supernatural',
        title: '👻 Trending Yokai & Spirits',
        description: 'Current popular spirit and demonic battle shows',
        queryParams: { sort: ['TRENDING_DESC'] },
      },
      {
        id: 'top-rated-supernatural',
        title: '🌕 Acclaimed Occult Masterpieces',
        description: 'Brilliant stories blending urban folklore and supernatural powers',
        queryParams: { sort: ['SCORE_DESC'], minimumScore: 82 },
      },
      {
        id: 'exorcists-curse',
        title: '🗡️ Exorcists & Cursed Battles',
        description: 'High energy phantom and curse combat',
        queryParams: { sort: ['POPULARITY_DESC'], minimumScore: 78 },
      },
    ],
  },
  {
    slug: 'thriller',
    name: 'Thriller',
    japaneseName: 'スリラー',
    description: 'Pulse-pounding suspense, survival, espionage, and race-against-time tension.',
    sampleTitles: ['Steins;Gate', 'The Promised Neverland', 'Monster', 'Erased', 'Psycho-Pass'],
    bgGradient: 'from-[#DC2626]/30 via-[#260C0C] to-[#060807]',
    accentColor: '#F87171',
    borderColor: 'border-red-500/40',
    badgeBg: 'bg-red-950/60 text-red-300',
    aspectRatio: 'tall',
    featured: true,
    popularCount: '1,500+ Titles',
    relatedGenres: ['psychological', 'mystery', 'horror', 'action'],
    categories: [
      {
        id: 'trending-thriller',
        title: '⌛ High-Voltage Suspense',
        description: 'Nail-biting thrillers keeping fans hooked',
        queryParams: { sort: ['TRENDING_DESC'] },
      },
      {
        id: 'masterpiece-thrillers',
        title: '🎯 Peak Thriller Masterpieces',
        description: 'Tense, masterfully executed survival and espionage',
        queryParams: { sort: ['SCORE_DESC'], minimumScore: 83 },
      },
      {
        id: 'crime-espionage',
        title: '🕵️ Crime, Spies & Survival',
        description: 'Undercover operations, escapes, and cat-and-mouse chases',
        queryParams: { sort: ['POPULARITY_DESC'], minimumScore: 78 },
      },
    ],
  },
];

/**
 * Utility to find genre by slug or name
 */
export function getGenreBySlug(slug: string): GenreConfig | undefined {
  const normalized = slug.toLowerCase().trim();
  return GENRES_CONFIG.find(
    (g) => g.slug.toLowerCase() === normalized || g.name.toLowerCase() === normalized
  );
}

/**
 * Utility to map AniList genre string to slug
 */
export function genreNameToSlug(name: string): string {
  const match = GENRES_CONFIG.find((g) => g.name.toLowerCase() === name.toLowerCase());
  if (match) return match.slug;
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
