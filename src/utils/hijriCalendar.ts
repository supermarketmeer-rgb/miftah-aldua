import { HijriDateInfo } from '../types';

export const HIJRI_MONTHS = [
  'محرم الحرام',
  'صفر الخير',
  'ربيع الأول',
  'ربيع الآخر',
  'جمادى الأولى',
  'جمادى الآخرة',
  'رجب الأصب',
  'شعبان المعظم',
  'شهر رمضان المبارك',
  'شوال المكرم',
  'ذو القعدة الحرام',
  'ذو الحجة الحرام'
];

export const DAYS_ARABIC = [
  'الأحد',
  'الاثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت'
];

/**
 * Calculates approximate Hijri Date based on astronomical lunar cycle
 * calibrated for religious calendar presentation.
 */
export function getHijriDate(date: Date = new Date()): HijriDateInfo {
  // Approximate conversion algorithm with accurate calibration
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  const dayOfWeek = date.getDay(); // 0 is Sunday

  // Standard Julian Day Number calculation
  let m = month + 1;
  let y = year;
  if (m < 3) {
    y -= 1;
    m += 12;
  }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5;

  // Approximate Hijri conversion from JD
  const l = Math.floor(jd - 1948440 + 10632);
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j = (Math.floor((10985 - l2) / 5316)) * (Math.floor((50 * l2) / 17719)) + (Math.floor(l2 / 5670)) * (Math.floor((43 * l2) / 15238));
  const l3 = l2 - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50)) - (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;
  
  const hijriMonthNum = Math.floor((24 * l3) / 709);
  const hijriDay = Math.min(30, Math.max(1, l3 - Math.floor((709 * hijriMonthNum) / 24)));
  const hijriYear = Math.floor((30 * n) + j - 30);
  const safeMonthIndex = Math.max(0, Math.min(11, hijriMonthNum - 1));

  // Determine Shia religious occasions
  let occasion: string | undefined;
  let specialDuaId: string | undefined;

  // Day-of-week based recommendations
  if (dayOfWeek === 4) {
    // Thursday evening
    occasion = 'ليلة الجمعة المباركة - وقت قراءة دعاء كميل وزيارة الحسين (ع)';
    specialDuaId = 'dua-kumayl';
  } else if (dayOfWeek === 5) {
    // Friday
    occasion = 'يوم الجمعة المبارك - يستحب قراءة دعاء الندبة والسمات';
    specialDuaId = 'dua-nudba';
  } else if (dayOfWeek === 2) {
    // Tuesday night
    occasion = 'ليلة الأربعاء - موعد قراءة دعاء التوسل بالأئمة الأطهار';
    specialDuaId = 'dua-tawassul';
  }

  // Monthly occasions
  if (safeMonthIndex === 6) { // Rajab
    occasion = 'شهر رجب الأصب - شهر الاستغفار وأدعية رجب المباركة';
    if (!specialDuaId) specialDuaId = 'dua-rajab';
  } else if (safeMonthIndex === 7) { // Shaban
    occasion = 'شهر شعبان المعظم - شهر رسول الله (ص) والمناجاة الشعبانية';
    if (!specialDuaId) specialDuaId = 'munajat-shabaniyah';
  } else if (safeMonthIndex === 8) { // Ramadan
    occasion = 'شهر رمضان المبارك - دعاء الافتتاح وأدعية السحر';
    if (!specialDuaId) specialDuaId = 'dua-iftitah';
  } else if (safeMonthIndex === 11 && hijriDay === 9) { // Arafah
    occasion = 'يوم عرفة المبارك - دعاء الإمام الحسين (ع) في عرفات';
    specialDuaId = 'dua-arafah';
  } else if (safeMonthIndex === 11 && hijriDay === 18) { // Ghadir
    occasion = 'عيد الغدير الأغر - عيد الله الأكبر';
    specialDuaId = 'dua-ahd';
  } else if (safeMonthIndex === 0 && hijriDay <= 10) { // Ashura
    occasion = 'عاشوراء الإمام الحسين (ع) - يستحب قراءة زيارة عاشوراء';
    specialDuaId = 'ziyarat-ashura';
  }

  return {
    day: hijriDay,
    month: hijriMonthNum,
    monthName: HIJRI_MONTHS[safeMonthIndex] || HIJRI_MONTHS[0],
    year: hijriYear || 1448,
    dayName: DAYS_ARABIC[dayOfWeek],
    occasion,
    specialDuaId
  };
}
