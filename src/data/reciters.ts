import { Reciter } from '../types';

export const RECITERS: Reciter[] = [
  {
    id: 'abathar',
    name: 'Abathar Al-Halwaji',
    nameAr: 'أباذر الحلواجي (تسجيل صوتي)',
    origin: 'البحرين'
  },
  {
    id: 'maytham',
    name: 'Maytham Al-Tammar',
    nameAr: 'ميثم التمار (تسجيل صوتي)',
    origin: 'العراق'
  },
  {
    id: 'basim',
    name: 'Basim Al-Karbalaei',
    nameAr: 'باسم الكربلائي (تسجيل صوتي)',
    origin: 'العراق'
  },
  {
    id: 'tts',
    name: 'System Reciter',
    nameAr: 'قارئ النظام الناطق (تلاوة آلية لجميع الأدعية دون إنترنت)',
    origin: 'محرك النطق العربي المدمج'
  }
];

export const DEFAULT_RECITER_ID = 'abathar';
