export interface TikTokItem {
  id: string;
  videoId: string;
  originalUrl: string;
  videoUrl: string;
  coverUrl: string;
  username: string;
  creatorName: string;
  creatorHandle: string;
  profilePic: string;
  caption: string;
  hashtags: string[];
  likes: string;
  bookmarks: string;
  views: string;
  commentsCount: string;
  shares: string;
  soundName: string;
  status: string;
  date: string;
  badge?: string;
}

export const DIRECT_TIKTOK_ITEMS: TikTokItem[] = [
  {
    id: 'tiktok-01',
    videoId: '7690656517523033366',
    originalUrl: 'https://www.tiktok.com/@carlagaldon_/video/7690656517523033366',
    videoUrl: '/videos/tiktok_7690656517523033366.mp4',
    coverUrl: '/videos/tiktok_7690656517523033366_cover.jpg',
    username: 'carlagaldon_',
    creatorName: 'Carla Galdón',
    creatorHandle: '@carlagaldon_',
    profilePic: '/images/avatars/tiktok_carlagaldon.jpg',
    caption: 'Vibra urbana en el estudio ✨ nueva sesión en vivo',
    hashtags: ['#carlagaldon_', '#viral', '#tiktok', '#musica'],
    likes: '2.1K',
    bookmarks: '284',
    views: '11.6K',
    commentsCount: '5',
    shares: '319',
    soundName: 'sonido original - Lyricz Genero Chileno',
    status: 'activo',
    date: 'Reciente',
    badge: 'VIRAL',
  },
  {
    id: 'tiktok-02',
    videoId: '7404517500723023137',
    originalUrl: 'https://www.tiktok.com/@iriss.vallaranii/video/7404517500723023137',
    videoUrl: '/videos/tiktok_7404517500723023137.mp4',
    coverUrl: '/videos/tiktok_7404517500723023137_cover.jpg',
    username: 'iriss.vallaranii',
    creatorName: 'Iris 🌺',
    creatorHandle: '@iriss.vallaranii',
    profilePic: '/images/avatars/tiktok_iriss_vallaranii.jpg',
    caption: 'Flow & aesthetic vibes ✨',
    hashtags: ['#irissvallaranii', '#viral', '#fyp', '#aesthetic'],
    likes: '2.8M',
    bookmarks: '407K',
    views: '34.6M',
    commentsCount: '11.6K',
    shares: '321K',
    soundName: 'original sound - hi',
    status: 'activo',
    date: 'Reciente',
    badge: 'TENDENCIA',
  },
  {
    id: 'tiktok-03',
    videoId: '7597096264601308438',
    originalUrl: 'https://www.tiktok.com/@guarnerinoemii/video/7597096264601308438',
    videoUrl: '/videos/tiktok_7597096264601308438.mp4',
    coverUrl: '/videos/tiktok_7597096264601308438_cover.jpg',
    username: 'guarnerinoemii',
    creatorName: 'Noemí Guarner',
    creatorHandle: '@guarnerinoemii',
    profilePic: '/images/avatars/tiktok_guarnerinoemii.jpg',
    caption: '@stay',
    hashtags: ['#guarnerinoemii', '#stay', '#tiktok', '#viral'],
    likes: '5.0K',
    bookmarks: '642',
    views: '58.2K',
    commentsCount: '7',
    shares: '305',
    soundName: 'origineel geluid - Okan',
    status: 'activo',
    date: 'Reciente',
    badge: 'EXCLUSIVO',
  },
    {
    id: 'tiktok-04',
    videoId: '7574956307921259807',
    originalUrl: 'https://www.tiktok.com/@devon.shae/video/7574956307921259807',
    // 👇 Aquí pones los links directos de la nube
    videoUrl: 'https://files.catbox.moe/EL_LINK_DE_TU_VIDEO.mp4',
    coverUrl: 'https://files.catbox.moe/EL_LINK_DE_TU_PORTADA.jpg', 
    username: 'devon.shae',
    creatorName: 'Devon Shae',
    creatorHandle: '@devon.shae',
    // 👇 También puedes alojar la foto de perfil en la nube
    profilePic: 'https://files.catbox.moe/FOTO_PERFIL_DEVON.jpg',
    caption: 'New vibes ✨',
    hashtags: ['#devonshae', '#tiktok', '#viral'],
    likes: '1.2M',
    bookmarks: '120K',
    views: '4.5M',
    commentsCount: '8.4K',
    shares: '52K',
    soundName: 'original sound - devon.shae',
    status: 'activo',
    date: 'Reciente',
    badge: 'NUEVO',
  }
];

export const FALLBACK_TIKTOK_ITEMS = DIRECT_TIKTOK_ITEMS;

export async function fetchTikTokSheets(_force = false): Promise<TikTokItem[]> {
  return DIRECT_TIKTOK_ITEMS;
}
