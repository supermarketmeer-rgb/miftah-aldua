import React, { useMemo } from 'react';
import {
  Calendar,
  Clock,
  Bookmark,
  ArrowLeft,
  Volume2,
  Play,
  ShieldCheck,
  WifiOff,
  Sparkles,
  Moon,
  Sun,
  Flame
} from 'lucide-react';
import { HijriDateInfo, ReadingProgress, Dua } from '../types';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface HeroBannerProps {
  hijriInfo: HijriDateInfo;
  todayDua: Dua | undefined;
  lastRead: ReadingProgress | undefined;
  allDuas: Dua[];
  onSelectDua: (dua: Dua, startPage?: number) => void;
  onOpenCalendar: () => void;
}

interface AlertDuaConfig {
  dua: Dua;
  badge: string;
  badgeColor: string;
  detail: string;
  iconType: 'moon' | 'sun' | 'sparkles' | 'clock' | 'flame';
  isNow: boolean;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  hijriInfo,
  todayDua,
  lastRead,
  allDuas,
  onSelectDua,
  onOpenCalendar,
}) => {
  const isOnline = useOnlineStatus();
  const lastReadDua = lastRead ? allDuas.find(d => d.id === lastRead.duaId) : null;

  // Calculate the single Dua whose time has arrived right now
  const dueDuaConfig = useMemo<AlertDuaConfig>(() => {
    const now = new Date();
    const day = now.getDay(); // 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
    const hour = now.getHours();

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
          detail: 'أفضل أعمال ليلة الجمعة؛ قراءة دعاء كميل وزيارة الحسين (ع) لنيل المغفرة وقضاء الحوائج.',
          iconType: 'moon',
          isNow: !isThursdayAfternoon,
        };
      }
    }

    // 2. Friday Late Afternoon (الساعة الأخيرة من نهار الجمعة - دعاء السِمات)
    if (day === 5 && hour >= 15 && hour <= 18) {
      const simat = allDuas.find(d => d.id === 'dua-simat' || d.id === 'samaat');
      if (simat) {
        return {
          dua: simat,
          badge: 'ساعة الاستجابة الأخيرة قبل الغروب',
          badgeColor: 'emerald',
          detail: 'آخر ساعة من نهار الجمعة من أرجى أوقات استجابة الدعاء؛ يُستحب قراءة دعاء السِمات.',
          iconType: 'sparkles',
          isNow: true,
        };
      }
    }

    // 3. Friday Morning (صباح الجمعة - دعاء الندبة)
    if (day === 5 && hour >= 5 && hour < 12) {
      const nudba = allDuas.find(d => d.id === 'dua-nudba' || d.id === 'nudbah');
      if (nudba) {
        return {
          dua: nudba,
          badge: 'صباح الجمعة المبارك',
          badgeColor: 'emerald',
          detail: 'ندبة واستغاثة بصاحب العصر والزمان الحجة بن الحسن (عج).',
          iconType: 'sun',
          isNow: true,
        };
      }
    }

    // 4. Tuesday Evening / Wednesday Eve (ليلة الأربعاء - دعاء التوسل)
    if ((day === 2 && hour >= 16) || (day === 3 && hour < 2)) {
      const tawassul = allDuas.find(d => d.id === 'dua-tawassul' || d.id === 'tawassul');
      if (tawassul) {
        return {
          dua: tawassul,
          badge: 'ليلة الأربعاء المباركة (باب الحوائج)',
          badgeColor: 'amber',
          detail: 'التوسل بالنبي الأعظم (ص) وأهل بيته الميامين لقضاء الحوائج وتفريج الهموم.',
          iconType: 'flame',
          isNow: true,
        };
      }
    }

    // 5. Early Morning (أذكار الصباح - دعاء الصباح / دعاء العهد)
    if (hour >= 4 && hour < 10) {
      const morningDua = allDuas.find(d => d.id === 'dua-sabah' || d.id === 'sabah') ||
                         allDuas.find(d => d.id === 'dua-ahd' || d.id === 'ahad');
      if (morningDua) {
        return {
          dua: morningDua,
          badge: 'أذكار الصباح وتجديد العهد',
          badgeColor: 'emerald',
          detail: '«يا من دلّ على ذاته بذاته...» افتتح يومك بكلمات أمير المؤمنين (ع).',
          iconType: 'sun',
          isNow: true,
        };
      }
    }

    // 6. Pre-dawn / Suhur (أدعية السحر)
    if (hour >= 1 && hour < 5) {
      const sahar = allDuas.find(d => d.id === 'dua-sahar' || d.id === 'sehar') ||
                    allDuas.find(d => d.id === 'dua-mujir');
      if (sahar) {
        return {
          dua: sahar,
          badge: 'وقت السحر والمناجاة',
          badgeColor: 'amber',
          detail: 'خير ساعات الليل للمستغفرين بالأسحار؛ خلوة إيمانية وابتهال للرب الرحيم.',
          iconType: 'moon',
          isNow: true,
        };
      }
    }

    // 7. Special Occasions in Hijri
    if (hijriInfo.occasion) {
      const occLower = hijriInfo.occasion.toLowerCase();
      if (occLower.includes('رجب')) {
        const rajab = allDuas.find(d => d.id === 'dua-rajab');
        if (rajab) {
          return {
            dua: rajab,
            badge: `مناسبة: ${hijriInfo.occasion}`,
            badgeColor: 'amber',
            detail: 'يُستحب قراءة هذا الدعاء عقيب كل صلاة في شهر رجب الأصب لنيل الرحمة.',
            iconType: 'sparkles',
            isNow: true,
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
            detail: 'مناجاة أمير المؤمنين والأئمة الأطهار (ع) المأثورة في شهر شعبان المعظم.',
            iconType: 'sparkles',
            isNow: true,
          };
        }
      }
    }

    // 8. Default: Today's Daily Recommended Dua
    const fallbackDua = todayDua || allDuas[0];
    return {
      dua: fallbackDua,
      badge: 'دعاء هذا اليوم المستحب',
      badgeColor: 'emerald',
      detail: `${fallbackDua.estimatedMinutes || 3} دقائق للقراءة والاستماع ونيل البركة.`,
      iconType: 'clock',
      isNow: true,
    };
  }, [allDuas, todayDua, hijriInfo]);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-stone-900 text-white shadow-xl border border-amber-500/20 mb-8">
      {/* Background Islamic Manuscript Artwork with rich gradient scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/islamic_manuscript_hero_1793864380421.jpg"
          alt="مخطوطة إسلامية مذهبة"
          className="w-full h-full object-cover object-center opacity-30 mix-blend-luminosity scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 via-emerald-950/50 to-transparent" />
      </div>

      {/* Decorative Islamic Frame Inset */}
      <div className="absolute inset-2 sm:inset-3 rounded-2xl border border-amber-400/20 pointer-events-none" />

      <div className="relative z-10 p-6 sm:p-8 lg:p-10">
        {/* Top line metadata */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 text-amber-300/90 text-xs sm:text-sm font-medium">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>{hijriInfo.dayName} {hijriInfo.day} {hijriInfo.monthName} {hijriInfo.year} هـ</span>
            </span>
            <span aria-hidden="true" className="text-amber-400/40">·</span>
            <button
              onClick={onOpenCalendar}
              className="text-amber-300 hover:text-white underline decoration-amber-400/40 hover:decoration-white transition-colors"
            >
              التقويم والمناسبات
            </button>
          </div>

          <div className="flex items-center gap-2">
            {!isOnline ? (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs border border-amber-500/30">
                <WifiOff className="w-3.5 h-3.5" />
                <span>وضع عدم الاتصال (الأوفلاين)</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-emerald-300/80">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>نصوص محققة وموثقة</span>
              </div>
            )}
          </div>
        </div>

        {/* Main Title & Spiritual Quote (صورة 2) */}
        <div className="max-w-2xl mb-6">
          <h1 className="font-amiri text-3xl sm:text-4xl lg:text-5xl font-bold text-amber-100 leading-tight mb-3">
            كِتَابُ الأَدْعِيَةِ وَالزِّيَارَاتِ
          </h1>
          <p className="font-amiri text-base sm:text-lg text-emerald-100/90 leading-relaxed">
            «الدُّعَاءُ سِلاحُ الْمُؤْمِنِ، وَعِمَادُ الدِّينِ، وَنُورُ السَّمَاوَاتِ وَالأَرْضِ» — رسول الله (صلى الله عليه وآله)
          </p>
        </div>

        {/* 
          Single Unified Alert Button:
          زر واحد فيه التنبيه عن الدعاء الذي حان وقته للقراءة أو الاستماع
          وعند الضغط عليه تفتح شاشة الدعاء مباشرة
        */}
        <div className="space-y-3 max-w-3xl">
          <button
            onClick={() => onSelectDua(dueDuaConfig.dua)}
            className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/25 via-emerald-600/30 to-amber-500/15 hover:from-amber-500/35 hover:via-emerald-600/40 hover:to-amber-500/25 border-2 border-amber-400/60 hover:border-amber-300 shadow-xl shadow-black/30 backdrop-blur-md transition-all text-right group active:scale-[0.99] gap-3.5"
          >
            <div className="flex items-center gap-3.5">
              {/* Glowing Pulse Icon */}
              <div className="relative w-12 h-12 rounded-2xl bg-amber-500/25 text-amber-300 border border-amber-400/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-md shadow-amber-950/40">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-2xl bg-amber-400 opacity-25" />
                <Volume2 className="w-6 h-6 text-amber-300" />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
                  </span>
                  <span className="text-xs font-bold text-amber-300 tracking-wide">
                    {dueDuaConfig.badge}
                  </span>
                </div>
                <div className="font-amiri text-xl sm:text-2xl font-bold text-white group-hover:text-amber-200 transition-colors">
                  {dueDuaConfig.dua.title}
                </div>
                <div className="text-xs text-emerald-100/80 line-clamp-1 mt-0.5">
                  {dueDuaConfig.detail}
                </div>
              </div>
            </div>

            {/* Action Pill Inside Button */}
            <div className="flex items-center gap-1.5 self-end sm:self-center px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 group-hover:from-amber-400 group-hover:to-amber-500 text-stone-950 font-bold text-xs sm:text-sm shrink-0 shadow-md group-hover:shadow-amber-500/30 transition-all">
              <Play className="w-3.5 h-3.5 fill-stone-950" />
              <span>تشغيل واستماع</span>
              <ArrowLeft className="w-4 h-4 mr-0.5 group-hover:-translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Last read resumption strip (if available) */}
          {lastReadDua && (
            <button
              onClick={() => onSelectDua(lastReadDua, lastRead?.pageNumber || 1)}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-right text-xs text-stone-300 hover:text-white transition group"
            >
              <div className="flex items-center gap-2 truncate">
                <Bookmark className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-emerald-300 font-medium">متابعة آخر موضع:</span>
                <span className="truncate text-white font-semibold">{lastReadDua.title}</span>
                <span className="text-stone-400 text-[11px]">(الصفحة {lastRead?.pageNumber || 1})</span>
              </div>
              <ArrowLeft className="w-3.5 h-3.5 text-stone-400 group-hover:text-emerald-300 group-hover:-translate-x-1 transition-all shrink-0" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
