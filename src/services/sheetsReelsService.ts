export interface SheetReel {
  id: string;
  shortcode: string;
  originalUrl: string;
  videoUrl: string;
  coverUrl: string;
  username: string;
  personName: string;
  creatorHandle: string;
  profilePic: string;
  caption: string;
  hashtags: string[];
  likes: string;
  commentsCount: string;
  shares: string;
  bookmarks: string;
  date: string;
  status: string;
  soundName?: string;
}

export function formatPersonName(username: string): string {
  if (!username) return 'CREADOR';
  const clean = username.trim().toLowerCase();
  if (clean === 'nicolenima_') return 'NICOLE NIMA';
  if (clean === 'dayanaveve') return 'DAYANA VEVE';
  if (clean === 'iamantry') return 'ANTRY';
  if (clean === 'luar_lal' || clean === 'luarlal') return 'LUAR LA L';
  return username.replace(/_/g, ' ').replace(/\./g, ' ').toUpperCase();
}

export interface ReelComment {
  id: string;
  shortcode: string;
  author: string;
  avatar?: string;
  text: string;
  timestamp: string;
  likes: number;
}

// Fallback reels matching exact initial active rows from Google Sheets
export const FALLBACK_SHEET_REELS: SheetReel[] = [
  {
    id: 'reel-01',
    shortcode: 'DXxoCpWO9NQ',
    originalUrl: 'https://www.instagram.com/reel/DXxoCpWO9NQ/?stkn=bnFwdmZ6dXR4NTNs',
    videoUrl: '/api/video-stream/DXxoCpWO9NQ',
    coverUrl: '/api/cover-image/DXxoCpWO9NQ',
    username: 'nicolenima_',
    personName: 'NICOLE NIMA',
    creatorHandle: '@nicolenima_',
    profilePic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    caption: 'Ya no son 4 babies … los veo el viernes en las justas 🐆',
    hashtags: ['#nicolenima', '#justas', '#reels', '#instagram'],
    likes: '3,046',
    commentsCount: '48',
    shares: '1.2K',
    bookmarks: '840',
    date: 'Reciente',
    status: 'activo',
    soundName: 'nicolenima_ · Original Audio',
  },
  {
    id: 'reel-02',
    shortcode: 'DcMX0RUP_ox',
    originalUrl: 'https://www.instagram.com/reel/DcMX0RUP_ox/?stkn=YjA0dW41ajV1dW5n',
    videoUrl: '/api/video-stream/DcMX0RUP_ox',
    coverUrl: '/api/cover-image/DcMX0RUP_ox',
    username: 'dayanaveve',
    personName: 'DAYANA VEVE',
    creatorHandle: '@dayanaveve',
    profilePic: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    caption: '♥️ Playlist en Rotation ♥️ Si no contesto el celular es porque estoy en una terraza con un desconocido',
    hashtags: ['#dayanaveve', '#playlist', '#electronic', '#reels'],
    likes: '8,420',
    commentsCount: '76',
    shares: '2.5K',
    bookmarks: '1.1K',
    date: 'Reciente',
    status: 'activo',
    soundName: 'dayanaveve · Night Vibes Club Edit',
  },
  {
    id: 'reel-03',
    shortcode: 'DdKVe22vB9T',
    originalUrl: 'https://www.instagram.com/reel/DdKVe22vB9T/?stkn=b2lva3JlNThuY2h4',
    videoUrl: '/api/video-stream/DdKVe22vB9T',
    coverUrl: '/api/cover-image/DdKVe22vB9T',
    username: 'iamantry',
    personName: 'ANTRY',
    creatorHandle: '@iamantry',
    profilePic: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    caption: 'Lo estamos haciendo real 🙏🏻 Estamos representando el R&B en español 🤎 sigo sin creerlo 🥹 @rnb.radar Thank you 🙏🏻🤍 Gracias x todo el apoyo que le han dado a “Tiempo Lento” ✨',
    hashtags: ['#iamantry', '#tiempolento', '#rnb', '#reels'],
    likes: '14.9K',
    commentsCount: '112',
    shares: '3.8K',
    bookmarks: '2.3K',
    date: 'Reciente',
    status: 'activo',
    soundName: 'iamantry · Tiempo Lento R&B',
  },
  {
    id: 'reel-04',
    shortcode: 'Dd9LEmGgyeS',
    originalUrl: 'https://www.instagram.com/reel/Dd9LEmGgyeS/?stkn=azFsZW9rY2E1Z3M1',
    videoUrl: '/api/video-stream/Dd9LEmGgyeS',
    coverUrl: '/api/cover-image/Dd9LEmGgyeS',
    username: 'luar_lal',
    personName: 'LUAR LA L',
    creatorHandle: '@luar_lal',
    profilePic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    caption: '@hades66 Suéltalo 📜 \n\nLSN ☥',
    hashtags: ['#luarlal', '#hades66', '#reels', '#urban'],
    likes: '122K',
    commentsCount: '738',
    shares: '4.5K',
    bookmarks: '3.1K',
    date: 'Reciente',
    status: 'activo',
    soundName: 'Hades66 · YO QUIERO',
  },
];

const REELS_STORAGE_KEY = 'applet_sheets_reels_cache_v2';

export async function fetchSheetsReels(force = false): Promise<SheetReel[]> {
  // 1. Live server fetch first for real-time synchronization with Instagram Google Sheets
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`/api/sheets-reels${force ? '?force=1' : `?t=${Date.now()}`}`, {
      signal: controller.signal,
      headers: { 'Cache-Control': 'no-cache' },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.reels) && data.reels.length > 0) {
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(REELS_STORAGE_KEY, JSON.stringify(data.reels));
          } catch {}
        }
        return data.reels;
      }
    }
  } catch (err) {
    console.warn('Live sheets reels fetch error, checking local fallback:', err);
  }

  // 2. Offline / local storage fallback if network is unreachable
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(REELS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
  }

  return FALLBACK_SHEET_REELS;
}

export async function fetchReelComments(shortcode: string): Promise<ReelComment[]> {
  try {
    const res = await fetch(`/api/comments/${shortcode}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    if (data.success && Array.isArray(data.comments)) {
      return data.comments;
    }
  } catch (err) {
    console.warn(`Failed loading comments for ${shortcode}:`, err);
  }
  return [];
}

export async function postReelComment(
  shortcode: string,
  text: string,
  author: string = 'invitado_vip'
): Promise<ReelComment | null> {
  try {
    const res = await fetch(`/api/comments/${shortcode}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, author }),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    if (data.success && data.comment) {
      return data.comment;
    }
  } catch (err) {
    console.error('Failed submitting comment:', err);
  }
  return null;
}
