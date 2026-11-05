import { Reciter } from '../types';

export const RECITERS: Reciter[] = [
  {
    id: 'abathar',
    name: 'Abathar Al-Halwaji',
    nameAr: 'أباذر الحلواجي',
    origin: 'البحرين'
  },
  {
    id: 'maytham',
    name: 'Maytham Al-Tammar',
    nameAr: 'ميثم التمار',
    origin: 'العراق'
  },
  {
    id: 'basim',
    name: 'Basim Al-Karbalaei',
    nameAr: 'باسم الكربلائي',
    origin: 'العراق'
  },
  {
    id: 'tts',
    name: 'System Reciter',
    nameAr: 'القارئ الآلي المدمج',
    origin: 'محرك النطق العربي المدمج'
  }
];

export const DEFAULT_RECITER_ID = 'abathar';
