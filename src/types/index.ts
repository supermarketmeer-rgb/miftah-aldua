export type DuaCategory = 
  | 'days'     // أدعية الأيام
  | 'week'     // أدعية الأسبوع
  | 'months'   // أدعية الشهر
  | 'year'     // أدعية السنة والمناسبات
  | 'ziyarat'  // الزيارات
  | 'munajat'; // المناجاة

export interface Verse {
  id: number;
  textAr: string;
  timingSec?: number; // Second offset in audio track
  note?: string;      // حاشية أو معنى
}

export interface Reciter {
  id: string;
  name: string;
  nameAr: string;
  avatar?: string;
  origin?: string;
}

export interface Dua {
  id: string;
  title: string;
  subtitle?: string;
  category: DuaCategory;
  occasion: string;
  dayOfWeek?: number; // 0: Sunday, 1: Monday, ... 5: Friday, 6: Saturday
  hijriMonth?: number; // 1: Muharram, ... 9: Ramadan, etc.
  source: string; // e.g., مفاتيح الجنان للشيخ عباس القمي
  narrator?: string; // عن كميل بن زياد، عن أمير المؤمنين (ع)
  virtues?: string; // فضل الدعاء وثوابه
  verses: Verse[];
  fullText: string;
  audioTracks: {
    [reciterId: string]: {
      url: string;
      durationSec: number;
    };
  };
  audioTimings?: {
    [reciterId: string]: number[]; // start time in seconds for each verse
  };
  estimatedMinutes: number;
  isCustom?: boolean;
}

export interface Bookmark {
  id: string;
  duaId: string;
  verseId: number;
  pageNumber: number;
  snippet: string;
  createdAt: number;
  note?: string;
}

export interface ReadingProgress {
  duaId: string;
  lastReadDate: number;
  verseId: number;
  pageNumber: number;
  percent: number;
}

export type FontFamily = 'amiri' | 'scheherazade' | 'naskh' | 'cairo';
export type ReadingTheme = 'cream' | 'night' | 'sepia' | 'emerald';
export type DisplayMode = 'paged' | 'scroll';

export interface ReadingSettings {
  fontFamily: FontFamily;
  fontSize: number; // in px
  lineHeight: number;
  theme: ReadingTheme;
  displayMode: DisplayMode;
  showTashkeel: boolean;
  autoScrollWithAudio: boolean;
  hapticFeedback: boolean;
}

export interface HijriDateInfo {
  day: number;
  month: number;
  monthName: string;
  year: number;
  dayName: string;
  occasion?: string;
  specialDuaId?: string;
}
