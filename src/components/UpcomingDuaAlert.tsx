import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Play,
  BookOpen,
  Share2,
  Clock,
  Moon,
  Sun,
  Flame,
  X,
  Volume2,
  BellRing,
  Heart
} from 'lucide-react';
import { Dua, HijriDateInfo } from '../types';

interface UpcomingDuaAlertProps {
  allDuas: Dua[];
  hijriInfo: HijriDateInfo;
  onPlayDua: (dua: Dua) => void;
  onReadDua: (dua: Dua) => void;
  onShareDua: (dua: Dua) => void;
}

interface AlertDuaConfig {
  dua: Dua;
  badge: string;
  badgeColor: string;
  headline: string;
  detail: string;
  iconType: 'moon' | 'sun' | 'sparkles' | 'clock' | 'flame';
  isNow: boolean; // True if current time is the peak time, false if approaching
  timeWindow: string;
}

export const UpcomingDuaAlert: React.FC<UpcomingDuaAlertProps> = ({
  allDuas,
  hijriInfo,
  onPlayDua,
  onReadDua,
  onShareDua,
}) => {
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [alertConfig, setAlertConfig] = useState<AlertDuaConfig | null>(null);

  useEffect(() => {
    const calculateUpcomingDua = (): AlertDuaConfig | null => {
      const now = new Date();
      const day = now.getDay(); // 0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, 5 = Friday, 6 = Saturday
      const hour = now.getHours();
      const minute = now.getMinutes();
      const totalMinutes = hour * 60 + minute;

      // 1. Thursday Evening / Friday Eve (ليلة الجمعة المباركة - دعاء كميل)
      // Thursday from 16:00 (4 PM) until Friday 04:00 (4 AM)
      if ((day === 4 && hour >= 16) || (day === 5 && hour < 4)) {
        const kumayl = allDuas.find(d => d.id === 'dua-kumayl' || d.id === 'kumayl');
        if (kumayl) {
          const isThursdayAfternoon = day === 4 && hour < 18;
          return {
            dua: kumayl,
            badge: isThursdayAfternoon ? 'يقترب موعد ليلة الجمعة' : 'حان وقت ليلة الجمعة المباركة',
            badgeColor: 'amber',
            headline: 'دعاء كميل بن زياد (ع)',
            detail: isThursdayAfternoon
              ? 'اقترب وقت ليلة الجمعة؛ جهّز نفسك لقراءة دعاء كميل لنيل المغفرة وقضاء الحوائج.'
              : 'أفضل أعمال ليلة الجمعة المباركة؛ استمع للتلاوة العطرة مع التعقيب والدعاء.',
            iconType: 'moon',
            isNow: !isThursdayAfternoon,
            timeWindow: 'ليلة الجمعة (من مغرب الخميس حتى فجر الجمعة)'
          };
        }
      }

      // 2. Friday Late Afternoon (الساعة الأخيرة من نهار الجمعة - دعاء السِمات)
      // Friday between 15:30 (3:30 PM) and 18:30 (6:30 PM)
      if (day === 5 && hour >= 15 && hour <= 18) {
        const simat = allDuas.find(d => d.id === 'dua-simat' || d.id === 'samaat');
        if (simat) {
          return {
            dua: simat,
            badge: 'ساعة الاستجابة الأخيرة',
            badgeColor: 'emerald',
            headline: 'دعاء السِمات المبارك',
            detail: 'آخر ساعة من نهار الجمعة من أرجى الساعات لاستجابة الدعاء، يُستحب قراءة دعاء السِمات.',
            iconType: 'sparkles',
            isNow: true,
            timeWindow: 'آخر ساعة قبل غروب شمس الجمعة'
          };
        }
      }

      // 3. Friday Morning (صباح الجمعة - دعاء الندبة)
      // Friday between 05:00 and 12:00
      if (day === 5 && hour >= 5 && hour < 12) {
        const nudba = allDuas.find(d => d.id === 'dua-nudba' || d.id === 'nudbah');
        if (nudba) {
          return {
            dua: nudba,
            badge: 'صباح الجمعة المبارك',
            badgeColor: 'emerald',
            headline: 'دعاء الندبة الشريف',
            detail: 'يُستحب في صبيحة يوم الجمعة ندبة واستغاثة بصاحب العصر والزمان الحجة بن الحسن (عج).',
            iconType: 'sun',
            isNow: true,
            timeWindow: 'صبيحة يوم الجمعة'
          };
        }
      }

      // 4. Tuesday Evening / Wednesday Eve (ليلة الأربعاء - دعاء التوسل)
      // Tuesday from 16:30 (4:30 PM) until Wednesday 02:00 (2 AM)
      if ((day === 2 && hour >= 16) || (day === 3 && hour < 2)) {
        const tawassul = allDuas.find(d => d.id === 'dua-tawassul' || d.id === 'tawassul');
        if (tawassul) {
          const isApproaching = day === 2 && hour < 18;
          return {
            dua: tawassul,
            badge: isApproaching ? 'يقترب موعد ليلة الأربعاء' : 'ليلة الأربعاء المباركة',
            badgeColor: 'amber',
            headline: 'دعاء التوسل العظيم',
            detail: 'ليلة الأربعاء باب الحوائج؛ التوسل بالنبي الأعظم (ص) وأهل بيته الميامين لقضاء الحوائج.',
            iconType: 'flame',
            isNow: !isApproaching,
            timeWindow: 'ليلة الأربعاء (من مغرب الثلاثاء)'
          };
        }
      }

      // 5. Early Morning (أوراد الصباح - دعاء الصباح لأمير المؤمنين ع ودعاء العهد)
      // Daily between 04:30 and 09:30 AM
      if (hour >= 4 && hour < 10) {
        const sabah = allDuas.find(d => d.id === 'dua-sabah' || d.id === 'sabah');
        const ahd = allDuas.find(d => d.id === 'dua-ahd' || d.id === 'ahad');
        const chosen = sabah || ahd;
        if (chosen) {
          return {
            dua: chosen,
            badge: 'أذكار الصباح المباركة',
            badgeColor: 'emerald',
            headline: chosen.title,
            detail: '«يا من دلّ على ذاته بذاته...» افتتح يومك بتجديد العهد ونور كلمات أمير المؤمنين (ع).',
            iconType: 'sun',
            isNow: true,
            timeWindow: 'بعد صلاة الفجر وصبيحة اليوم'
          };
        }
      }

      // 6. Pre-dawn / Suhur (أدعية السحر والخلوة مع الله)
      // Daily between 01:30 and 04:30 AM
      if (hour >= 1 && hour < 5) {
        const sahar = allDuas.find(d => d.id === 'dua-sahar' || d.id === 'sehar') ||
                      allDuas.find(d => d.id === 'dua-mujir');
        if (sahar) {
          return {
            dua: sahar,
            badge: 'وقت السحر والمناجاة',
            badgeColor: 'amber',
            headline: sahar.title,
            detail: 'خير ساعات الليل للمستغفرين بالأسحار؛ خلوة إيمانية وابتهال للرب الرحيم.',
            iconType: 'moon',
            isNow: true,
            timeWindow: 'وقت السحر والثلث الأخير من الليل'
          };
        }
      }

      // 7. Special Hijri Occasions check (e.g. Rajab, Shaban, Ramadan, Ashura)
      if (hijriInfo.occasion) {
        const occLower = hijriInfo.occasion.toLowerCase();
        if (occLower.includes('رجب')) {
          const rajab = allDuas.find(d => d.id === 'dua-rajab');
          if (rajab) {
            return {
              dua: rajab,
              badge: `مناسبة: ${hijriInfo.occasion}`,
              badgeColor: 'amber',
              headline: rajab.title,
              detail: 'يُستحب قراءة هذا الدعاء عقيب كل صلاة في شهر رجب الأصب لنيل الرحمة والمغفرة.',
              iconType: 'sparkles',
              isNow: true,
              timeWindow: 'شهر رجب المرجب'
            };
          }
        }
        if (occLower.includes('شعبان')) {
          const shaban = allDuas.find(d => d.id === 'munajat-shabaniyah');
          if (shaban) {
            return {
              dua: shaban,
              badge: `مناسبة: ${hijriInfo.occasion}`,
              badgeColor: 'amber',
              headline: shaban.title,
              detail: 'مناجاة أمير المؤمنين والأئمة الأطهار (ع) المأثورة في شهر شعبان المعظم.',
              iconType: 'sparkles',
              isNow: true,
              timeWindow: 'شهر شعبان المعظم'
            };
          }
        }
      }

      // 8. General Active Hours: Today's Daily Dua Reminder
      const todayDua = allDuas.find(d => d.category === 'days' && d.dayOfWeek === day);
      if (todayDua) {
        return {
          dua: todayDua,
          badge: `دعاء ${hijriInfo.dayName} المأثور`,
          badgeColor: 'emerald',
          headline: todayDua.title,
          detail: 'من أدعية الصحيفة السجادية المباركة للاعتصام بالله وطلب السلامة والتوفيق في الدين والدنيا.',
          iconType: 'clock',
          isNow: true,
          timeWindow: `مستحب طوال ساعات ${hijriInfo.dayName}`
        };
      }

      return null;
    };

    setAlertConfig(calculateUpcomingDua());
  }, [allDuas, hijriInfo]);

  if (!alertConfig || isDismissed) {
    return null;
  }

  const { dua, badge, headline, detail, iconType, isNow, timeWindow } = alertConfig;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-stone-900 text-white p-5 sm:p-6 mb-6 shadow-xl border-2 border-amber-400/30 transition-all hover:border-amber-400/50 group">
      {/* Decorative Glow Ambient Backdrop */}
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Decorative Islamic Borders */}
      <div className="absolute inset-1.5 sm:inset-2 rounded-2xl border border-amber-400/15 pointer-events-none" />

      <div className="relative z-10">
        {/* Top Header Strip: Live Pulse, Badge & Dismiss */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            {/* Live Indicator Pulse */}
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400" />
            </span>

            {/* Badge */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-200 border border-amber-400/30 text-xs font-semibold backdrop-blur-sm">
              {iconType === 'moon' && <Moon className="w-3.5 h-3.5 text-amber-300" />}
              {iconType === 'sun' && <Sun className="w-3.5 h-3.5 text-amber-300" />}
              {iconType === 'sparkles' && <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
              {iconType === 'flame' && <Flame className="w-3.5 h-3.5 text-amber-300" />}
              {iconType === 'clock' && <Clock className="w-3.5 h-3.5 text-amber-300" />}
              <span>{badge}</span>
            </span>

            <span className="text-[11px] text-emerald-200/70 hidden sm:inline">
              · {timeWindow}
            </span>
          </div>

          {/* Dismiss button */}
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition"
            title="إخفاء الإشعار مؤقتاً"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
          <div className="space-y-1.5 max-w-xl">
            <h3 className="font-amiri text-2xl sm:text-3xl font-bold text-amber-100 flex items-center gap-2">
              <span>{headline}</span>
              {isNow && (
                <span className="text-[11px] font-sans px-2 py-0.5 rounded-md bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 font-medium">
                  حان الموعد
                </span>
              )}
            </h3>
            <p className="font-amiri text-sm sm:text-base text-stone-200/90 leading-relaxed">
              {detail}
            </p>
          </div>

          {/* Action Hub Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 md:pt-0">
            {/* Primary Action: Direct One-Click Play */}
            <button
              onClick={() => onPlayDua(dua)}
              className="py-2.5 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-900/40 hover:shadow-amber-500/30 transition-all active:scale-[0.98] group/btn"
            >
              <div className="w-6 h-6 rounded-full bg-stone-950/15 flex items-center justify-center">
                <Play className="w-3.5 h-3.5 fill-stone-950 text-stone-950 ml-0.5" />
              </div>
              <span>تشغيل التلاوة الآن</span>
            </button>

            {/* Read Text Button */}
            <button
              onClick={() => onReadDua(dua)}
              className="py-2.5 px-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/15 flex items-center gap-1.5 backdrop-blur-md transition active:scale-[0.98]"
            >
              <BookOpen className="w-4 h-4 text-emerald-300" />
              <span>قراءة</span>
            </button>

            {/* Share Shortened Link Button */}
            <button
              onClick={() => onShareDua(dua)}
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-amber-300 hover:text-amber-200 border border-white/15 transition active:scale-[0.98]"
              title="مشاركة الرابط المختصر للدعاء"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

