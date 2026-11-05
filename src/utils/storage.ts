import { Bookmark, Dua, ReadingProgress, ReadingSettings } from '../types';

const FAVORITES_KEY = 'miftah_duas_favorites';
const BOOKMARKS_KEY = 'miftah_duas_bookmarks';
const PROGRESS_KEY = 'miftah_duas_progress';
const SETTINGS_KEY = 'miftah_duas_settings';
const CUSTOM_DUAS_KEY = 'miftah_duas_custom';

export const DEFAULT_SETTINGS: ReadingSettings = {
  fontFamily: 'amiri',
  fontSize: 22,
  lineHeight: 2.2,
  theme: 'cream',
  displayMode: 'paged',
  showTashkeel: true,
  autoScrollWithAudio: true,
  hapticFeedback: true
};

// ==========================================
// LocalStorage helpers
// ==========================================

export function getFavorites(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : ['dua-kumayl', 'dua-tawassul', 'dua-ahd', 'dua-faraj'];
  } catch {
    return ['dua-kumayl', 'dua-tawassul'];
  }
}

export function saveFavorites(favs: string[]): void {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
  } catch (e) {
    console.error('Error saving favorites:', e);
  }
}

export function toggleFavorite(duaId: string): string[] {
  const current = getFavorites();
  const exists = current.includes(duaId);
  const updated = exists ? current.filter(id => id !== duaId) : [...current, duaId];
  saveFavorites(updated);
  return updated;
}

export function getBookmarks(): Bookmark[] {
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveBookmark(bookmark: Omit<Bookmark, 'id' | 'createdAt'>): Bookmark[] {
  const all = getBookmarks();
  const newBm: Bookmark = {
    ...bookmark,
    id: `bm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    createdAt: Date.now()
  };
  const updated = [newBm, ...all];
  try {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving bookmark:', e);
  }
  return updated;
}

export function removeBookmark(id: string): Bookmark[] {
  const all = getBookmarks();
  const updated = all.filter(b => b.id !== id);
  try {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error removing bookmark:', e);
  }
  return updated;
}

export function getReadingHistory(): ReadingProgress[] {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveReadingProgress(duaId: string, verseId: number, pageNumber: number, percent: number): void {
  const all = getReadingHistory();
  const existingIndex = all.findIndex(p => p.duaId === duaId);
  const item: ReadingProgress = {
    duaId,
    verseId,
    pageNumber,
    percent: Math.min(100, Math.max(0, Math.round(percent))),
    lastReadDate: Date.now()
  };

  if (existingIndex >= 0) {
    all[existingIndex] = item;
  } else {
    all.unshift(item);
  }

  // Keep last 30 read items
  const trimmed = all.slice(0, 30);
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.error('Error saving reading progress:', e);
  }
}

export function getReadingSettings(): ReadingSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveReadingSettings(settings: ReadingSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings:', e);
  }
}

export function getCustomDuas(): Dua[] {
  try {
    const raw = localStorage.getItem(CUSTOM_DUAS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomDua(dua: Dua): Dua[] {
  const all = getCustomDuas();
  const updated = [dua, ...all];
  try {
    localStorage.setItem(CUSTOM_DUAS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving custom dua:', e);
  }
  return updated;
}

// ==========================================
// IndexedDB for Offline Audio Caching
// ==========================================

const DB_NAME = 'MiftahDuasAudioDB';
const DB_VERSION = 1;
const AUDIO_STORE = 'audio_files';

function openAudioDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(AUDIO_STORE)) {
        db.createObjectStore(AUDIO_STORE, { keyPath: 'key' });
      }
    };
  });
}

export interface CachedAudioMeta {
  key: string; // `${duaId}_${reciterId}`
  duaId: string;
  reciterId: string;
  sizeBytes: number;
  cachedAt: number;
}

export async function saveAudioOffline(duaId: string, reciterId: string, blob: Blob): Promise<void> {
  const db = await openAudioDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(AUDIO_STORE, 'readwrite');
    const store = tx.objectStore(AUDIO_STORE);
    const key = `${duaId}_${reciterId}`;
    const record = {
      key,
      duaId,
      reciterId,
      blob,
      sizeBytes: blob.size,
      cachedAt: Date.now()
    };
    const req = store.put(record);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getAudioOffline(duaId: string, reciterId: string): Promise<Blob | null> {
  try {
    const db = await openAudioDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(AUDIO_STORE, 'readonly');
      const store = tx.objectStore(AUDIO_STORE);
      const key = `${duaId}_${reciterId}`;
      const req = store.get(key);
      req.onsuccess = () => {
        if (req.result && req.result.blob) {
          resolve(req.result.blob);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

export async function hasAudioOffline(duaId: string, reciterId: string): Promise<boolean> {
  const blob = await getAudioOffline(duaId, reciterId);
  return blob !== null;
}

export async function getAllOfflineAudios(): Promise<CachedAudioMeta[]> {
  try {
    const db = await openAudioDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(AUDIO_STORE, 'readonly');
      const store = tx.objectStore(AUDIO_STORE);
      const req = store.getAll();
      req.onsuccess = () => {
        const results: CachedAudioMeta[] = (req.result || []).map((item: any) => ({
          key: item.key,
          duaId: item.duaId,
          reciterId: item.reciterId,
          sizeBytes: item.sizeBytes || item.blob?.size || 0,
          cachedAt: item.cachedAt || Date.now()
        }));
        resolve(results);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

export async function deleteOfflineAudio(duaId: string, reciterId: string): Promise<void> {
  const db = await openAudioDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(AUDIO_STORE, 'readwrite');
    const store = tx.objectStore(AUDIO_STORE);
    const key = `${duaId}_${reciterId}`;
    const req = store.delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function clearAllOfflineAudio(): Promise<void> {
  const db = await openAudioDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(AUDIO_STORE, 'readwrite');
    const store = tx.objectStore(AUDIO_STORE);
    const req = store.clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
