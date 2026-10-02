export interface InstagramPost {
  id: string;
  creator: string;
  handle: string;
  title: string;
  caption: string;
  views: string;
  likes: string;
  shares: string;
  hashtags: string[];
  badge: string;
  aspectRatio: string;
  videoUrl: string;
  posterBg: string;
  accentColor: string;
  duration: string;
}

export interface Track {
  id: string;
  number: string;
  title: string;
  artist: string;
  releaseType: string;
  year: string;
  duration: string;
  durationSec: number;
  bpm: number;
  key: string;
  coverGradient: string;
  coverImage?: string; // High-res album artwork
  waveformPattern: number[];
  audioFrequency: number; // Base frequency for WebAudio synth
  audioUrl?: string; // Real audio file stream (.flac, .mp3, .wav, etc.)
  downloadUrl?: string; // Direct download link
  flacDownloadUrl?: string; // Direct attachment FLAC download link
  streamUrl?: string; // Proxy stream URL
  originalUrl?: string; // Original database URL
}

export interface ReelCard {
  id: string;
  number: string;
  platform: 'TIKTOK';
  category: string;
  title: string;
  creatorHandle: string;
  description: string;
  views: string;
  likes: string;
  comments: string;
  shares: string;
  bookmarks: string;
  soundName: string;
  videoUrl: string;
  posterGradient: string;
  tags: string[];
}

export interface LifestyleItem {
  id: string;
  tag: string;
  title: string;
  location: string;
  description: string;
  aspect: string;
  accent: string;
  gradient: string;
}

export const INSTAGRAM_POSTS: InstagramPost[] = [
  {
    id: '01',
    creator: 'NICOLENIMA',
    handle: '@NICOLENIMA_',
    title: 'NICOLENIMA',
    caption: 'Ustedes me dicen ... cuando sale ?',
    views: '2.4M',
    likes: '425K',
    shares: '88.1K',
    hashtags: ['#Instagram', '#Nicolenima', '#MusicVideo', '#ViralTrend'],
    badge: 'PREVIEW (38)',
    aspectRatio: '9:16',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-singer-recording-a-song-in-a-studio-41444-large.mp4',
    posterBg: 'linear-gradient(135deg, #1f0b2b 0%, #3e1245 40%, #11081f 100%)',
    accentColor: '#D92CFF',
    duration: '0:38'
  },
  {
    id: '02',
    creator: 'THIAGOVSC',
    handle: '@THIAGOVSC',
    title: 'NIGHT DRIVE',
    caption: 'The night has its own frequency. Stay a little longer.',
    views: '1.8M',
    likes: '312K',
    shares: '42.6K',
    hashtags: ['#GoodVibes', '#NightDrive', '#ThiagoVsc', '#Electronic'],
    badge: 'OFFICIAL (45)',
    aspectRatio: '9:16',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-driving-through-a-city-at-night-with-neon-lights-42898-large.mp4',
    posterBg: 'linear-gradient(135deg, #0e0720 0%, #260c3d 50%, #08070d 100%)',
    accentColor: '#F03BBE',
    duration: '0:45'
  },
  {
    id: '03',
    creator: 'THIAGOVSC',
    handle: '@THIAGOVSC',
    title: 'CHROME DREAMS',
    caption: 'Tokyo midnight session with vintage modular synths and heavy sub bass.',
    views: '980K',
    likes: '184K',
    shares: '21.4K',
    hashtags: ['#StudioSession', '#ModularSynth', '#TokyoVibes', '#NewSound'],
    badge: 'STUDIO (32)',
    aspectRatio: '9:16',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-adjusting-the-volume-of-an-audio-mixer-41457-large.mp4',
    posterBg: 'linear-gradient(135deg, #170d29 0%, #461460 50%, #0c0714 100%)',
    accentColor: '#7136FF',
    duration: '0:32'
  },
  {
    id: '04',
    creator: 'THIAGOVSC',
    handle: '@THIAGOVSC',
    title: 'VELVET HORIZON',
    caption: 'Sunset cruise through the coastline under a neon magenta haze. No ordinary moments.',
    views: '1.2M',
    likes: '248K',
    shares: '35.9K',
    hashtags: ['#LuxuryLifestyle', '#SunsetVibes', '#CyborgAesthetic', '#VisualCulture'],
    badge: 'REELS (50)',
    aspectRatio: '9:16',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-city-traffic-at-night-42894-large.mp4',
    posterBg: 'linear-gradient(135deg, #1c082e 0%, #30104e 50%, #08070d 100%)',
    accentColor: '#D92CFF',
    duration: '0:50'
  }
];

export const MUSIC_TRACKS: Track[] = [
  {
    id: 'track-01',
    number: '01',
    title: 'BBY WOW',
    artist: 'Karol G',
    releaseType: 'SINGLE',
    year: '2026',
    duration: '3:24',
    durationSec: 204,
    bpm: 122,
    key: 'F# Minor',
    coverGradient: 'linear-gradient(135deg, #D92CFF 0%, #210c3b 100%)',
    coverImage: '/images/covers/thumb_01.jpg',
    waveformPattern: [20, 35, 60, 85, 45, 70, 95, 65, 80, 50, 40, 75, 90, 100, 80, 60, 45, 70, 95, 85, 65, 40, 55, 75, 90, 60, 30, 20],
    audioFrequency: 146.83, // D3
    audioUrl: '/audio/track_01.mp3',
    downloadUrl: 'https://files.catbox.moe/aq5se4.mp3',
  },
  {
    id: 'track-02',
    number: '02',
    title: 'VAMO A VEL',
    artist: 'Anuel AA Ft ROA',
    releaseType: 'EP / TITLE',
    year: '2026',
    duration: '2:58',
    durationSec: 178,
    bpm: 128,
    key: 'C Minor',
    coverGradient: 'linear-gradient(135deg, #F03BBE 0%, #150928 100%)',
    coverImage: '/images/covers/thumb_02.jpg',
    waveformPattern: [15, 45, 75, 90, 80, 60, 50, 85, 100, 70, 55, 65, 80, 95, 85, 70, 60, 45, 75, 90, 65, 50, 35, 25, 45, 65, 80, 40],
    audioFrequency: 130.81, // C3
    audioUrl: '/audio/track_02.mp3',
    downloadUrl: 'https://files.catbox.moe/6oh4d7.flac',
  },
  {
    id: 'track-03',
    number: '03',
    title: 'DARDOS',
    artist: 'Romeo Santos Ft Prince Royce',
    releaseType: 'CLUB MIX',
    year: '2026',
    duration: '4:12',
    durationSec: 252,
    bpm: 126,
    key: 'A Minor',
    coverGradient: 'linear-gradient(135deg, #7136FF 0%, #0d061c 100%)',
    coverImage: '/images/covers/thumb_03.jpg',
    waveformPattern: [30, 50, 70, 90, 60, 80, 100, 75, 85, 65, 45, 80, 95, 90, 75, 85, 60, 50, 70, 85, 60, 40, 50, 70, 90, 55, 35, 20],
    audioFrequency: 110.00, // A2
    audioUrl: '/audio/track_03.mp3',
    downloadUrl: 'https://files.catbox.moe/zfkwx5.flac',
  },
  {
    id: 'track-04',
    number: '04',
    title: 'LA GRACIOSA',
    artist: 'Quevedo Ft Elvis Crespo',
    releaseType: 'ARCHIVE',
    year: '2025',
    duration: '3:45',
    durationSec: 225,
    bpm: 118,
    key: 'E Minor',
    coverGradient: 'linear-gradient(135deg, #D92CFF 0%, #461460 50%, #08070d 100%)',
    coverImage: '/images/covers/thumb_04.jpg',
    waveformPattern: [25, 40, 65, 80, 70, 55, 75, 90, 85, 60, 45, 65, 85, 95, 75, 60, 50, 70, 85, 65, 45, 30, 50, 70, 80, 50, 30, 15],
    audioFrequency: 164.81, // E3
    audioUrl: '/audio/track_04.mp3',
    downloadUrl: 'https://files.catbox.moe/wiec6e.flac',
  },
  {
    id: 'track-05',
    number: '05',
    title: 'Jamaican (Bam Bam)',
    artist: 'Hugel',
    releaseType: 'ORIGINAL',
    year: '2026',
    duration: '3:15',
    durationSec: 195,
    bpm: 124,
    key: 'G Minor',
    coverGradient: 'linear-gradient(135deg, #F03BBE 0%, #7136FF 100%)',
    coverImage: '/images/covers/thumb_05.jpg',
    waveformPattern: [20, 35, 55, 75, 90, 80, 65, 85, 100, 85, 70, 80, 95, 85, 70, 55, 65, 85, 95, 75, 60, 45, 60, 80, 70, 45, 25, 15],
    audioFrequency: 196.00, // G3
    audioUrl: '/audio/track_05.mp3',
    downloadUrl: 'https://files.catbox.moe/xfrtal.flac',
  }
];

export const REELS_CARDS: ReelCard[] = [
  {
    id: 'tiktok-01',
    number: '01',
    platform: 'TIKTOK',
    category: 'STUDIO LIVE',
    title: 'ANALOG SYNTH DROP',
    creatorHandle: '@thiagovsc',
    description: 'When the sub bass hits just right in the midnight session 🔥🎧',
    views: '1.4M',
    likes: '286.4K',
    comments: '4,892',
    shares: '38.2K',
    bookmarks: '52.1K',
    soundName: 'sonido original - THIAGOVSC · Analog Dream',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-adjusting-the-volume-of-an-audio-mixer-41457-large.mp4',
    posterGradient: 'linear-gradient(180deg, rgba(217, 44, 255, 0.25) 0%, #12091e 100%)',
    tags: ['#fyp', '#parati', '#modularsynth', '#producer', '#techno']
  },
  {
    id: 'tiktok-02',
    number: '02',
    platform: 'TIKTOK',
    category: 'NIGHT DRIVE',
    title: 'HIGHWAY 03:00 AM',
    creatorHandle: '@thiagovsc',
    description: 'Tokyo night drive with unreleased synthwave cuts. Rate the vibe 1-10 🏎️✨',
    views: '2.8M',
    likes: '492.1K',
    comments: '8,120',
    shares: '71.5K',
    bookmarks: '89.4K',
    soundName: 'sonido original - THIAGOVSC · Night Drive 2026',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-driving-through-a-city-at-night-with-neon-lights-42898-large.mp4',
    posterGradient: 'linear-gradient(180deg, rgba(113, 54, 255, 0.3) 0%, #0a0614 100%)',
    tags: ['#fyp', '#nightdrive', '#tokyo', '#vibes', '#cyberpunk']
  },
  {
    id: 'tiktok-03',
    number: '03',
    platform: 'TIKTOK',
    category: 'VOCAL LAB',
    title: 'CYBORG HARMONIES',
    creatorHandle: '@thiagovsc',
    description: 'Layering 16 vocoder takes for the new EP outro. Goosebumps every time 🎙️🔮',
    views: '3.1M',
    likes: '580.3K',
    comments: '9,440',
    shares: '84.6K',
    bookmarks: '104K',
    soundName: 'sonido original - THIAGOVSC · Cyborg Vocals',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-singer-recording-a-song-in-a-studio-41444-large.mp4',
    posterGradient: 'linear-gradient(180deg, rgba(240, 59, 190, 0.35) 0%, #150924 100%)',
    tags: ['#fyp', '#vocals', '#studiolife', '#viral', '#producerlife']
  },
  {
    id: 'tiktok-04',
    number: '04',
    platform: 'TIKTOK',
    category: 'BASS DROP',
    title: 'UNRELEASED DROP',
    creatorHandle: '@thiagovsc',
    description: 'Testing the festival drop at maximum volume. Drop a 🔊 if this needs to come out Friday!',
    views: '4.6M',
    likes: '815K',
    comments: '14.2K',
    shares: '139K',
    bookmarks: '168K',
    soundName: 'sonido original - THIAGOVSC · Bass Drop ID',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-city-traffic-at-night-42894-large.mp4',
    posterGradient: 'linear-gradient(180deg, rgba(217, 44, 255, 0.3) 0%, #0e071a 100%)',
    tags: ['#fyp', '#festivaldrop', '#bass', '#edmtiktok', '#unreleased']
  }
];

export const LIFESTYLE_ITEMS: LifestyleItem[] = [
  {
    id: 'life-01',
    tag: 'MIDNIGHT DRIVE',
    title: 'PURSUIT OF THE NIGHT',
    location: 'SHIBUYA EXPRESSWAY / 03:42 AM',
    description: 'The raw acoustics of twin-turbo engines reverberating against concrete tunnels. A sensory meditation between speed and silence.',
    aspect: 'col-span-12 lg:col-span-7',
    accent: '#D92CFF',
    gradient: 'linear-gradient(135deg, #1b0c2b 0%, #2f1044 50%, #08070d 100%)'
  },
  {
    id: 'life-02',
    tag: 'SANCTUARY',
    title: 'ANALOG CHRONICLES',
    location: 'BERLIN STUDIO / ARCHIVE',
    description: 'Every patch cord tells a story. Heavy low-end resonance filtered through vintage analog circuitry.',
    aspect: 'col-span-12 lg:col-span-5',
    accent: '#7136FF',
    gradient: 'linear-gradient(135deg, #120921 0%, #261142 50%, #08070d 100%)'
  },
  {
    id: 'life-03',
    tag: 'HORIZON',
    title: 'ROOFTOP VELVET',
    location: 'DUBAI MARINA PENTHOUSE',
    description: 'When dusk merges the purple horizon with illuminated skylines. Good vibes distilled into visual architecture.',
    aspect: 'col-span-12 lg:col-span-5',
    accent: '#F03BBE',
    gradient: 'linear-gradient(135deg, #1c0828 0%, #340c42 50%, #08070d 100%)'
  },
  {
    id: 'life-04',
    tag: 'VISUAL CULTURE',
    title: 'FUTURISTIC EDITORIAL',
    location: 'MILAN / TOKYO COLLABORATION',
    description: 'High-fashion meets cybernetic biomechanics. Breaking boundaries where music, clothing and cinema collide.',
    aspect: 'col-span-12 lg:col-span-7',
    accent: '#D92CFF',
    gradient: 'linear-gradient(135deg, #1e0b30 0%, #2d0f48 50%, #08070d 100%)'
  }
];
