import { Track } from '../data/content';

export const MUSIC_SHEETS_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vRxS9XmdI3dLEy65nLFSW44uX3jgo0RkCXBnrPsjXrepYgC72pL-XWcnkKU-RE0BaYX0wUGtgRMNaIJ/pub?output=csv';

const STORAGE_KEY = 'thiagovsc_music_tracks_v5';

export function getCoverImageForTrack(track?: Track | null, index?: number): string {
  if (track?.coverImage) return track.coverImage;
  const num = track?.number
    ? parseInt(track.number, 10)
    : track?.id
    ? parseInt(track.id.replace(/\D/g, ''), 10)
    : index !== undefined
    ? index + 1
    : 1;
  const safeNum = Math.min(Math.max(isNaN(num) ? 1 : num, 1), 5);
  const numStr = safeNum.toString().padStart(2, '0');
  return `/images/covers/thumb_${numStr}.jpg`;
}

export const FALLBACK_SHEET_TRACKS: Track[] = [
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
    audioFrequency: 146.83,
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
    audioFrequency: 130.81,
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
    audioFrequency: 110.0,
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
    audioFrequency: 164.81,
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
    audioFrequency: 196.0,
    audioUrl: '/audio/track_05.mp3',
    downloadUrl: 'https://files.catbox.moe/xfrtal.flac',
  },
];

export async function fetchMusicSheets(force: boolean = false): Promise<Track[]> {
  // 1. Live server fetch first for instant real-time synchronization with Google Sheets
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`/api/music-sheets${force ? '?force=1' : `?t=${Date.now()}`}`, {
      signal: controller.signal,
      headers: { 'Cache-Control': 'no-cache' },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.tracks) && data.tracks.length > 0) {
        const sanitized = data.tracks.map((t: Track, i: number) => ({
          ...t,
          coverImage: t.coverImage || getCoverImageForTrack(t, i),
        }));

        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
          } catch {}
        }
        return sanitized;
      }
    }
  } catch (err) {
    console.warn('Live music sheets fetch error, checking local fallback:', err);
  }

  // 2. Offline / local storage fallback if network is unreachable
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
  }

  return FALLBACK_SHEET_TRACKS;
}
