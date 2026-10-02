// High-end Universal Audio Engine & Media Player for THIAGOVSC
// Supports all formats: .flac, .mp3, .wav, .ogg, .m4a, .aac, plus luxury procedural synth fallback.

export interface AudioEngineState {
  isPlaying: boolean;
  isLoading?: boolean;
  trackId: string | null;
  progress: number;
  timeFormatted: string;
  durationFormatted: string;
  duration: number;
  currentTime: number;
  format?: string;
  audioUrl?: string | null;
}

class THIAGOSoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private isPlaying: boolean = false;
  private isLoading: boolean = false;
  private currentTrackId: string | null = null;
  private currentAudioUrl: string | null = null;
  private intervalId: number | null = null;
  private currentStep: number = 0;
  private bpm: number = 120;
  private baseFreq: number = 146.83; // D3
  private listeners: Set<(state: AudioEngineState) => void> = new Set();
  private currentTime: number = 0;
  private duration: number = 204;
  private volume: number = 0.8;
  private timerInterval: number | null = null;
  private isUsingRealAudio: boolean = false;
  private currentFormat: string = 'FLAC';

  constructor() {
    // Audio engine initialized lazily upon first user interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume * 0.5, this.ctx.currentTime);
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.8;

      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public subscribe(cb: (state: AudioEngineState) => void) {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private formatTime(seconds: number): string {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  private notify() {
    const progress = this.duration > 0 ? (this.currentTime / this.duration) * 100 : 0;
    const timeFormatted = this.formatTime(this.currentTime);
    const durationFormatted = this.formatTime(this.duration);

    const state: AudioEngineState = {
      isPlaying: this.isPlaying,
      isLoading: this.isLoading,
      trackId: this.currentTrackId,
      progress: Math.min(100, Math.max(0, progress)),
      timeFormatted,
      durationFormatted,
      duration: this.duration,
      currentTime: this.currentTime,
      format: this.currentFormat,
      audioUrl: this.currentAudioUrl,
    };

    this.listeners.forEach((cb) => cb(state));
  }

  // Detect file format extension from URL
  private detectFormat(url?: string): string {
    if (!url) return 'AUDIO';
    const cleanUrl = url.split('?')[0].toLowerCase();
    if (cleanUrl.endsWith('.flac') || cleanUrl.includes('.flac') || cleanUrl.includes('music-stream')) return 'FLAC 24-BIT';
    if (cleanUrl.endsWith('.mp3')) return 'MP3 320KBPS';
    if (cleanUrl.endsWith('.wav')) return 'WAV LOSSLESS';
    if (cleanUrl.endsWith('.ogg')) return 'OGG VORBIS';
    if (cleanUrl.endsWith('.m4a') || cleanUrl.endsWith('.aac')) return 'AAC / M4A';
    return 'AUDIO HI-RES';
  }

  // Universal Player: Plays .flac, .mp3, .wav, .ogg, etc.
  public playTrack(
    trackId: string,
    baseFreq: number = 146.83,
    bpm: number = 124,
    durationSec: number = 204,
    audioUrl?: string
  ) {
    this.initContext();

    // Toggle same track
    if (this.currentTrackId === trackId && this.isPlaying) {
      this.pause();
      return;
    }

    this.currentTrackId = trackId;
    this.baseFreq = baseFreq;
    this.bpm = bpm;
    this.duration = durationSec;
    this.currentAudioUrl = audioUrl || null;
    this.currentFormat = this.detectFormat(audioUrl);
    this.isPlaying = true;

    // If audioUrl is provided, stream the actual audio file (.flac, .mp3, etc.)
    if (audioUrl) {
      this.stopSequencer();
      this.playRealAudioFile(audioUrl, durationSec);
    } else {
      this.stopRealAudio();
      this.startSequencer();
      this.startTimer();
      this.notify();
    }
  }

  private playRealAudioFile(url: string, defaultDuration: number) {
    this.stopSequencer();
    this.isLoading = true;
    this.notify();

    try {
      if (!this.audioElement) {
        this.audioElement = new Audio();
        this.audioElement.preload = 'auto';

        this.audioElement.addEventListener('timeupdate', () => {
          if (this.audioElement && this.isUsingRealAudio) {
            this.currentTime = this.audioElement.currentTime;
            if (this.audioElement.duration && isFinite(this.audioElement.duration)) {
              this.duration = this.audioElement.duration;
            }
            this.notify();
          }
        });

        this.audioElement.addEventListener('loadedmetadata', () => {
          if (this.audioElement && this.audioElement.duration && isFinite(this.audioElement.duration)) {
            this.duration = this.audioElement.duration;
            this.isLoading = false;
            this.notify();
          }
        });

        this.audioElement.addEventListener('canplay', () => {
          this.isLoading = false;
          this.notify();
        });

        this.audioElement.addEventListener('playing', () => {
          this.isLoading = false;
          this.isPlaying = true;
          this.notify();
        });

        this.audioElement.addEventListener('waiting', () => {
          this.isLoading = true;
          this.notify();
        });

        this.audioElement.addEventListener('ended', () => {
          this.isPlaying = false;
          this.isLoading = false;
          this.currentTime = 0;
          this.notify();
        });

        this.audioElement.addEventListener('error', (err) => {
          console.warn('Real audio stream error on URL:', this.audioElement?.src, err);
          // Automatic resilient fallback if error occurs
          if (this.audioElement && this.currentTrackId) {
            const num = parseInt(this.currentTrackId.replace(/\D/g, ''), 10) || 1;
            const numStr = num.toString().padStart(2, '0');
            const fallbackLocal = `/audio/track_${numStr}.mp3`;
            const currentSrc = this.audioElement.src;

            if (!currentSrc.includes(fallbackLocal)) {
              console.log('Switching to high-compatibility local stream fallback:', fallbackLocal);
              this.audioElement.src = fallbackLocal;
              this.audioElement.load();
              this.audioElement.play().catch(() => {});
              return;
            }
          }
          this.isLoading = false;
          this.notify();
        });
      }

      this.isUsingRealAudio = true;
      this.audioElement.volume = this.volume;

      // Resolve URL: if direct remote URL and browser might have CORS/FLAC issues, pick best source
      let playUrl = url;
      const cleanLower = url.toLowerCase();
      if (cleanLower.includes('.flac') && this.audioElement.canPlayType('audio/flac') === '') {
        // Browser does not natively support FLAC in <audio> (e.g. Safari iOS) -> use high-bitrate MP3
        const num = parseInt((this.currentTrackId || '1').replace(/\D/g, ''), 10) || 1;
        const numStr = num.toString().padStart(2, '0');
        playUrl = `/audio/track_${numStr}.mp3`;
      }

      const targetUrl = new URL(playUrl, window.location.href).href;
      if (this.audioElement.src !== targetUrl && this.audioElement.src !== playUrl) {
        this.audioElement.src = playUrl;
        this.audioElement.load();
      }

      this.duration = defaultDuration;
      const playPromise = this.audioElement.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.isPlaying = true;
            this.isLoading = false;
            this.notify();
          })
          .catch((err) => {
            console.warn('Audio playback waiting for gesture or buffering:', err);
            // Try local fallback if remote failed
            if (this.audioElement && !playUrl.startsWith('/audio/')) {
              const num = parseInt((this.currentTrackId || '1').replace(/\D/g, ''), 10) || 1;
              const numStr = num.toString().padStart(2, '0');
              const localUrl = `/audio/track_${numStr}.mp3`;
              this.audioElement.src = localUrl;
              this.audioElement.load();
              this.audioElement.play().then(() => {
                this.isPlaying = true;
                this.isLoading = false;
                this.notify();
              }).catch(() => {
                this.isLoading = false;
                this.notify();
              });
            } else {
              this.isLoading = false;
              this.notify();
            }
          });
      }
    } catch (e) {
      console.warn('Error playing audio file:', e);
      this.isLoading = false;
      this.notify();
    }
  }

  private stopRealAudio() {
    if (this.audioElement) {
      try {
        this.audioElement.pause();
      } catch {}
    }
    this.isUsingRealAudio = false;
  }

  public pause() {
    this.isPlaying = false;
    this.isLoading = false;
    if (this.audioElement) {
      try {
        this.audioElement.pause();
      } catch {}
    }
    this.stopSequencer();
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.notify();
  }

  public resume() {
    if (!this.currentTrackId) return;
    this.isPlaying = true;
    if (this.isUsingRealAudio && this.audioElement) {
      this.audioElement.play().catch((err) => {
        console.warn('Resume error:', err);
      });
    } else {
      this.startTimer();
    }
    this.notify();
  }

  public toggle(
    trackId: string,
    baseFreq: number = 146.83,
    bpm: number = 124,
    durationSec: number = 204,
    audioUrl?: string
  ) {
    if (this.isPlaying && this.currentTrackId === trackId) {
      this.pause();
    } else {
      this.playTrack(trackId, baseFreq, bpm, durationSec, audioUrl);
    }
  }

  public seek(pct: number) {
    const targetTime = Math.max(0, Math.min(this.duration, (pct / 100) * this.duration));
    this.currentTime = targetTime;
    if (this.isUsingRealAudio && this.audioElement && isFinite(this.audioElement.duration)) {
      try {
        this.audioElement.currentTime = targetTime;
      } catch {}
    }
    this.notify();
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.audioElement) {
      try {
        this.audioElement.volume = this.volume;
      } catch {}
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume * 0.5, this.ctx.currentTime);
    }
  }

  public getAudioFrequencyData(): Uint8Array {
    if (this.isPlaying) {
      // Dynamic beat-synced reactive visualization
      const data = new Uint8Array(32);
      const time = performance.now() / 1000;
      const beatProgress = (time * (this.bpm / 60)) % 1;
      const energy = 0.5 + 0.5 * Math.sin(beatProgress * Math.PI * 2);

      for (let i = 0; i < 32; i++) {
        const freqWave = Math.sin(time * 3 + i * 0.4);
        const bassKick = i < 6 ? energy * 180 : energy * 60;
        const val = Math.min(255, Math.max(10, Math.floor(bassKick + Math.abs(freqWave) * 110 * this.volume)));
        data[i] = val;
      }
      return data;
    }
    return new Uint8Array(32);
  }

  public getPlaybackState() {
    return {
      isPlaying: this.isPlaying,
      currentTrackId: this.currentTrackId,
      currentTime: this.currentTime,
      duration: this.duration,
      format: this.currentFormat,
      audioUrl: this.currentAudioUrl,
    };
  }

  // Play subtle luxury interface sound
  public playClickFx() {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  // Play atmospheric neon sweep sound
  public playNeonSweep() {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(2400, this.ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.45);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.45);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  // Melodic synthesizer sequencer fallback
  private startSequencer() {
    if (!this.ctx || !this.masterGain) return;
    const intervalMs = (60 / this.bpm / 4) * 1000;
    this.currentStep = 0;

    const scale = [1, 1.189, 1.334, 1.498, 1.781, 2.0, 2.378, 2.669];
    const bassline = [1, 1, 0.75, 1, 1.334, 1.189, 0.75, 1];

    this.intervalId = window.setInterval(() => {
      if (!this.ctx || !this.isPlaying || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const step16 = this.currentStep % 16;

      if (step16 % 4 === 0) {
        this.synthKick(now);
      }
      if (step16 % 2 === 0) {
        const bassRatio = bassline[(step16 / 2) % bassline.length];
        this.synthBass(now, this.baseFreq * 0.5 * bassRatio);
      }
      if ([0, 3, 6, 8, 10, 14].includes(step16)) {
        const noteIdx = (this.currentStep * 3 + (step16 % 3)) % scale.length;
        const noteFreq = this.baseFreq * scale[noteIdx];
        this.synthPluck(now, noteFreq);
      }
      if (step16 % 2 === 1) {
        this.synthHiHat(now);
      }

      this.currentStep++;
    }, intervalMs);
  }

  private synthKick(time: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(130, time);
    osc.frequency.exponentialRampToValueAtTime(35, time + 0.12);
    gain.gain.setValueAtTime(0.35 * this.volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.16);
  }

  private synthBass(time: number, freq: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(280, time);
    filter.Q.value = 4;

    gain.gain.setValueAtTime(0.25 * this.volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.24);
  }

  private synthPluck(time: number, freq: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, time);
    filter.frequency.exponentialRampToValueAtTime(400, time + 0.18);

    gain.gain.setValueAtTime(0.18 * this.volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.26);
  }

  private synthHiHat(time: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(8000, time);
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7000, time);

    gain.gain.setValueAtTime(0.06 * this.volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.05);
  }

  private startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = window.setInterval(() => {
      if (this.isPlaying && !this.isUsingRealAudio) {
        this.currentTime += 1;
        if (this.currentTime >= this.duration) {
          this.currentTime = 0;
        }
        this.notify();
      }
    }, 1000);
  }

  private stopSequencer() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export const audioEngine = new THIAGOSoundEngine();
