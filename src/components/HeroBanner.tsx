import React from 'react';
import { Calendar, Clock, Bookmark, ArrowLeft, Volume2, ShieldCheck, WifiOff } from 'lucide-react';
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

        {/* Main Title & Spiritual Quote */}
        <div className="max-w-2xl mb-8">
          <h1 className="font-amiri text-3xl sm:text-4xl lg:text-5xl font-bold text-amber-100 leading-tight mb-3">
            كِتَابُ الأَدْعِيَةِ وَالزِّيَارَاتِ
          </h1>
          <p className="font-amiri text-base sm:text-lg text-emerald-100/90 leading-relaxed">
            «الدُّعَاءُ سِلاحُ الْمُؤْمِنِ، وَعِمَادُ الدِّينِ، وَنُورُ السَّمَاوَاتِ وَالأَرْضِ» — رسول الله (صلى الله عليه وآله)
          </p>
          {hijriInfo.occasion && (
            <div className="mt-3 inline-flex items-center gap-2 text-xs sm:text-sm text-amber-300 bg-amber-500/10 border border-amber-400/25 px-3.5 py-1.5 rounded-xl backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>مناسبة اليوم: {hijriInfo.occasion}</span>
            </div>
          )}
        </div>

        {/* Interactive Action Hub: Today's Dua & Last Read Resumption */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">
          {todayDua && (
            <button
              onClick={() => onSelectDua(todayDua)}
              className="flex items-center justify-between p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 backdrop-blur-md transition-all text-right group hover:border-amber-400/40"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-amber-200/80 mb-0.5">دعاء هذا اليوم المستحب</div>
                  <div className="font-amiri text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                    {todayDua.title}
                  </div>
                  <div className="text-[11px] text-emerald-200/70">
                    {todayDua.estimatedMinutes} دقائق للقراءة والاستماع
                  </div>
                </div>
              </div>
              <ArrowLeft className="w-5 h-5 text-amber-300/70 group-hover:text-amber-300 group-hover:-translate-x-1 transition-all shrink-0" />
            </button>
          )}

          {lastReadDua && (
            <button
              onClick={() => onSelectDua(lastReadDua, lastRead?.pageNumber || 1)}
              className="flex items-center justify-between p-4 rounded-2xl bg-emerald-800/40 hover:bg-emerald-800/60 border border-emerald-500/30 backdrop-blur-md transition-all text-right group hover:border-emerald-400/60"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Bookmark className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-emerald-300/80 mb-0.5">متابعة آخر موضع قراءة</div>
                  <div className="font-amiri text-lg font-bold text-white group-hover:text-emerald-200 transition-colors">
                    {lastReadDua.title}
                  </div>
                  <div className="text-[11px] text-emerald-200/70">
                    الصفحة {lastRead?.pageNumber || 1} · {lastRead?.percent || 0}% منجز
                  </div>
                </div>
              </div>
              <ArrowLeft className="w-5 h-5 text-emerald-300/70 group-hover:text-emerald-300 group-hover:-translate-x-1 transition-all shrink-0" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
