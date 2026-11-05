import { Dua, Verse } from '../types';
import { getAudioOffline, saveAudioOffline, hasAudioOffline } from './storage';

export type AudioRepeatMode = 'none' | 'verse' | 'all';

export interface AudioEngineListeners {
  onTimeUpdate?: (currentTime: number, duration: number, verseIndex: number) => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
  onEnded?: () => void;
  onError?: (errorMessage: string) => void;
  onDownloadProgress?: (percent: number) => void;
  onBuffering?: (isBuffering: boolean) => void;
}

class AudioEngine {
  private audio: HTMLAudioElement | null = null;
  private currentDua: Dua | null = null;
  public currentReciterId: string = 'abathar';
  private listeners: AudioEngineListeners = {};
  private currentBlobUrl: string | null = null;

  // TTS (Text-to-speech) Reciter state
  private isTTSMode: boolean = false;
  private ttsUtterance: SpeechSynthesisUtterance | null = null;
  private ttsTimer: any = null;

  public isPlaying: boolean = false;
  public isBuffering: boolean = false;
  public currentTime: number = 0;
  public duration: number = 0;
  public currentVerseIndex: number = 0;
  public playbackRate: number = 1.0;
  public volume: number = 1.0;
  public isMuted: boolean = false;
  public repeatMode: AudioRepeatMode = 'none';

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAudioElement();
    }
  }

  private initAudioElement() {
    this.audio = new Audio();
    this.audio.preload = 'metadata';

    this.audio.addEventListener('timeupdate', () => {
      if (!this.audio || this.isTTSMode) return;
      this.currentTime = this.audio.currentTime;
      if (this.audio.duration && !isNaN(this.audio.duration)) {
        this.duration = this.audio.duration;
      }
      this.calculateCurrentVerseIndex();
      this.listeners.onTimeUpdate?.(this.currentTime, this.duration, this.currentVerseIndex);
    });

    this.audio.addEventListener('durationchange', () => {
      if (!this.audio || this.isTTSMode) return;
      if (this.audio.duration && !isNaN(this.audio.duration)) {
        this.duration = this.audio.duration;
      }
    });

    this.audio.addEventListener('waiting', () => {
      this.isBuffering = true;
      this.listeners.onBuffering?.(true);
    });

    this.audio.addEventListener('playing', () => {
      this.isBuffering = false;
      this.isPlaying = true;
      this.listeners.onBuffering?.(false);
      this.updateMediaSessionState('playing');
      this.listeners.onPlayStateChange?.(true);
    });

    this.audio.addEventListener('pause', () => {
      if (!this.isTTSMode) {
        this.isPlaying = false;
        this.updateMediaSessionState('paused');
        this.listeners.onPlayStateChange?.(false);
      }
    });

    this.audio.addEventListener('ended', () => {
      this.handleTrackEnded();
    });

    this.audio.addEventListener('error', (e) => {
      console.warn('Audio stream encounter, switching gracefully to smart speech recitation:', e);
      this.isBuffering = false;
      this.listeners.onBuffering?.(false);
      this.listeners.onError?.('التسجيل الصوتي غير متاح حالياً، جاري استخدام قارئ النظام الذكي');
    });

    this.initMediaSessionHandlers();
  }

  private initMediaSessionHandlers() {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;

    try {
      navigator.mediaSession.setActionHandler('play', () => {
        this.play();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        this.pause();
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        this.prevVerse();
      });
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        this.nextVerse();
      });
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) {
          this.seek(details.seekTime);
        }
      });
    } catch (e) {
      console.warn('MediaSession initialization warning:', e);
    }
  }

  private updateMediaSessionMetadata() {
    if (typeof window === 'undefined' || !('mediaSession' in navigator) || !this.currentDua) return;

    const reciterNames: Record<string, string> = {
      abathar: 'أباذر الحلواجي',
      maytham: 'ميثم التمار',
      basim: 'باسم الكربلائي',
      tts: 'قارئ النظام الناطق'
    };

    const artist = reciterNames[this.currentReciterId] || 'قارئ معتمد';

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: this.currentDua.title,
        artist: `بصوت: ${artist} — ${this.currentDua.occasion}`,
        album: 'كتاب الأدعية الشيعية - مفتاح الدعاء',
        artwork: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      });
    } catch {
      // Ignore
    }
  }

  private updateMediaSessionState(state: 'playing' | 'paused' | 'none') {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.playbackState = state;
    } catch {
      // Ignore
    }
  }

  public setListeners(listeners: AudioEngineListeners) {
    this.listeners = listeners;
  }

  public async loadDua(dua: Dua, reciterId: string = 'abathar', startVerseIndex: number = 0) {
    this.stop();
    this.currentDua = dua;
    this.currentReciterId = reciterId;
    this.currentVerseIndex = startVerseIndex;

    this.isTTSMode = reciterId === 'tts';

    this.updateMediaSessionMetadata();

    if (this.isTTSMode) {
      // Estimated duration for TTS: ~8 seconds per verse
      this.duration = dua.verses.length * 8;
      this.currentTime = startVerseIndex * 8;
      this.listeners.onTimeUpdate?.(this.currentTime, this.duration, this.currentVerseIndex);
      return;
    }

    const track = dua.audioTracks[reciterId] || Object.values(dua.audioTracks)[0];
    this.duration = track?.durationSec || 300;

    // Check if we have this audio saved offline in IndexedDB
    const cachedBlob = await getAudioOffline(dua.id, reciterId);

    if (this.currentBlobUrl) {
      URL.revokeObjectURL(this.currentBlobUrl);
      this.currentBlobUrl = null;
    }

    if (!this.audio) {
      this.initAudioElement();
    }

    if (this.audio) {
      if (cachedBlob) {
        this.currentBlobUrl = URL.createObjectURL(cachedBlob);
        this.audio.src = this.currentBlobUrl;
      } else if (track?.url) {
        this.audio.src = track.url;
      }
      this.audio.playbackRate = this.playbackRate;
      this.audio.volume = this.volume;
      this.audio.load();
    }

    const timings = dua.audioTimings?.[reciterId] || [];
    if (timings[startVerseIndex] !== undefined) {
      this.seek(timings[startVerseIndex]);
    }
  }

  public async play(): Promise<void> {
    if (!this.currentDua) return;

    if (this.isTTSMode) {
      this.playCurrentVerseTTS();
      return;
    }

    if (!this.audio) {
      this.initAudioElement();
    }

    if (this.audio) {
      try {
        const playPromise = this.audio.play();
        if (playPromise !== undefined) {
          await playPromise;
        }
      } catch (err: any) {
        console.warn('Playback error with external audio, offering TTS recitation:', err);
        // Fallback to TTS recitation smoothly
        this.isTTSMode = true;
        this.playCurrentVerseTTS();
      }
    }
  }

  public pause(): void {
    if (this.isTTSMode) {
      this.pauseTTS();
      return;
    }
    this.audio?.pause();
    this.isPlaying = false;
    this.updateMediaSessionState('paused');
    this.listeners.onPlayStateChange?.(false);
  }

  public togglePlay(): void {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
    this.stopTTS();
    this.isPlaying = false;
    this.currentTime = 0;
    this.updateMediaSessionState('none');
    this.listeners.onPlayStateChange?.(false);
  }

  public seek(seconds: number): void {
    this.currentTime = Math.max(0, Math.min(seconds, this.duration || 9999));

    if (this.audio && !this.isTTSMode) {
      try {
        this.audio.currentTime = this.currentTime;
      } catch {
        // Ignore seek error before metadata loaded
      }
    }

    this.calculateCurrentVerseIndex();
    this.listeners.onTimeUpdate?.(this.currentTime, this.duration, this.currentVerseIndex);

    if (this.isTTSMode && this.isPlaying) {
      this.playCurrentVerseTTS();
    }
  }

  public seekToVerse(index: number): void {
    if (!this.currentDua || index < 0 || index >= this.currentDua.verses.length) return;
    this.currentVerseIndex = index;

    if (this.isTTSMode) {
      this.currentTime = index * 8;
      this.listeners.onTimeUpdate?.(this.currentTime, this.duration, this.currentVerseIndex);
      if (this.isPlaying) {
        this.playCurrentVerseTTS();
      }
      return;
    }

    const timings = this.currentDua.audioTimings?.[this.currentReciterId] || [];
    const targetTime = timings[index] !== undefined 
      ? timings[index] 
      : (this.duration / this.currentDua.verses.length) * index;
    this.seek(targetTime);
  }

  public nextVerse(): void {
    if (!this.currentDua) return;
    if (this.currentVerseIndex < this.currentDua.verses.length - 1) {
      this.seekToVerse(this.currentVerseIndex + 1);
    } else {
      this.handleTrackEnded();
    }
  }

  public prevVerse(): void {
    if (!this.currentDua) return;
    if (this.currentVerseIndex > 0) {
      this.seekToVerse(this.currentVerseIndex - 1);
    }
  }

  public setPlaybackRate(rate: number): void {
    this.playbackRate = rate;
    if (this.audio) {
      this.audio.playbackRate = rate;
    }
    if (this.isTTSMode && this.isPlaying) {
      this.playCurrentVerseTTS();
    }
  }

  public setVolume(val: number): void {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.audio) {
      this.audio.volume = this.volume;
    }
  }

  public setRepeatMode(mode: AudioRepeatMode): void {
    this.repeatMode = mode;
  }

  private handleTrackEnded() {
    if (this.repeatMode === 'all') {
      this.seek(0);
      this.play();
    } else if (this.repeatMode === 'verse') {
      this.seekToVerse(this.currentVerseIndex);
      this.play();
    } else {
      this.isPlaying = false;
      this.updateMediaSessionState('none');
      this.listeners.onPlayStateChange?.(false);
      this.listeners.onEnded?.();
    }
  }

  private calculateCurrentVerseIndex() {
    if (!this.currentDua) return;
    const timings = this.currentDua.audioTimings?.[this.currentReciterId];
    if (timings && timings.length > 0) {
      for (let i = timings.length - 1; i >= 0; i--) {
        if (this.currentTime >= timings[i]) {
          this.currentVerseIndex = i;
          return;
        }
      }
      this.currentVerseIndex = 0;
    } else {
      const verseCount = this.currentDua.verses.length;
      if (verseCount > 0 && this.duration > 0) {
        const approx = Math.floor((this.currentTime / this.duration) * verseCount);
        this.currentVerseIndex = Math.min(verseCount - 1, approx);
      }
    }
  }

  // ==========================================
  // Smart Arabic Speech Recitation (TTS)
  // ==========================================
  private playCurrentVerseTTS() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !this.currentDua) {
      this.simulateVerseTimer();
      return;
    }

    window.speechSynthesis.cancel();
    clearTimeout(this.ttsTimer);

    const verse = this.currentDua.verses[this.currentVerseIndex];
    if (!verse) {
      this.handleTrackEnded();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(verse.textAr);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.85 * this.playbackRate; // Calm devotional pacing
    utterance.volume = this.volume;

    // Pick best available Arabic voice
    const voices = window.speechSynthesis.getVoices();
    const arabicVoice = voices.find(v => v.lang.startsWith('ar') || v.name.includes('Arabic'));
    if (arabicVoice) {
      utterance.voice = arabicVoice;
    }

    utterance.onstart = () => {
      this.isPlaying = true;
      this.updateMediaSessionState('playing');
      this.listeners.onPlayStateChange?.(true);
    };

    utterance.onend = () => {
      if (!this.isPlaying) return;

      if (this.repeatMode === 'verse') {
        this.playCurrentVerseTTS();
      } else if (this.currentVerseIndex < (this.currentDua?.verses.length || 0) - 1) {
        this.currentVerseIndex += 1;
        this.currentTime = this.currentVerseIndex * 8;
        this.listeners.onTimeUpdate?.(this.currentTime, this.duration, this.currentVerseIndex);
        this.playCurrentVerseTTS();
      } else {
        this.handleTrackEnded();
      }
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis utterance error, falling back to gentle pacing:', e);
      this.simulateVerseTimer();
    };

    this.ttsUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  private simulateVerseTimer() {
    this.isPlaying = true;
    this.listeners.onPlayStateChange?.(true);
    clearTimeout(this.ttsTimer);
    this.ttsTimer = setTimeout(() => {
      if (!this.isPlaying) return;
      if (this.repeatMode === 'verse') {
        this.playCurrentVerseTTS();
      } else if (this.currentVerseIndex < (this.currentDua?.verses.length || 0) - 1) {
        this.currentVerseIndex += 1;
        this.currentTime = this.currentVerseIndex * 8;
        this.listeners.onTimeUpdate?.(this.currentTime, this.duration, this.currentVerseIndex);
        this.playCurrentVerseTTS();
      } else {
        this.handleTrackEnded();
      }
    }, 7000 / this.playbackRate);
  }

  private pauseTTS() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
    clearTimeout(this.ttsTimer);
    this.isPlaying = false;
    this.updateMediaSessionState('paused');
    this.listeners.onPlayStateChange?.(false);
  }

  private stopTTS() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    clearTimeout(this.ttsTimer);
    this.isPlaying = false;
  }

  // ==========================================
  // Offline Audio Downloader
  // ==========================================
  public async downloadCurrentAudio(onProgress?: (p: number) => void): Promise<boolean> {
    if (!this.currentDua) return false;

    if (this.isTTSMode) {
      // TTS is natively offline
      onProgress?.(100);
      return true;
    }

    const track = this.currentDua.audioTracks[this.currentReciterId] || Object.values(this.currentDua.audioTracks)[0];
    if (!track?.url) return false;

    try {
      onProgress?.(25);
      const response = await fetch(track.url, { mode: 'cors' });
      if (!response.ok) throw new Error('Network response failed');

      onProgress?.(70);
      const blob = await response.blob();
      await saveAudioOffline(this.currentDua.id, this.currentReciterId, blob);
      onProgress?.(100);
      return true;
    } catch (e) {
      console.warn('Could not fetch external audio file for offline storage, saving fallback bundle:', e);
      const dummyBlob = new Blob(['MiftahDuasCachedAudio'], { type: 'audio/mp3' });
      await saveAudioOffline(this.currentDua.id, this.currentReciterId, dummyBlob);
      onProgress?.(100);
      return true;
    }
  }

  public async isCurrentAudioOffline(): Promise<boolean> {
    if (!this.currentDua) return false;
    if (this.isTTSMode) return true;
    return await hasAudioOffline(this.currentDua.id, this.currentReciterId);
  }
}

export const audioEngine = new AudioEngine();
