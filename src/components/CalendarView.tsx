import React, { useState } from 'react';
import { Calendar, Moon, Sparkles, ArrowLeft, BookOpen } from 'lucide-react';
import { HijriDateInfo, Dua } from '../types';
import { HIJRI_MONTHS } from '../utils/hijriCalendar';

interface CalendarViewProps {
  currentHijri: HijriDateInfo;
  allDuas: Dua[];
  onSelectDua: (dua: Dua) => void;
}

interface ShiaOccasion {
  month: number; // 1-12
  day: number;
  title: string;
  description: string;
  recommendedDuaId?: string;
  isHighOccasion?: boolean;
}

export const OCCASIONS_LIST: ShiaOccasion[] = [
  {
    month: 1, // Muharram
    day: 10,
    title: 'يوم عاشوراء - استشهاد الإمام الحسين (ع)',
    description: 'يوم الحزن العظيم والفجيعة الكبرى باستشهاد سيد الشهداء وأهل بيته وصحبه في كربلاء.',
    recommendedDuaId: 'ziyarat-ashura',
    isHighOccasion: true
  },
  {
    month: 2, // Safar
    day: 20,
    title: 'أربعينية الإمام الحسين (ع)',
    description: 'ذكرى مرور أربعين يوماً على واقعة الطف وزيارة جابر بن عبد الله الأنصاري لكربلاء.',
    recommendedDuaId: 'ziyarat-ashura',
    isHighOccasion: true
  },
  {
    month: 3, // Rabi al-Awwal
    day: 17,
    title: 'ميلاد النبي الأكرم (ص) والإمام جعفر الصادق (ع)',
    description: 'ذكرى ولادة سيد الكائنات محمد بن عبد الله (ص) وحفيده ناشر علوم أهل البيت الإمام الصادق (ع).',
    recommendedDuaId: 'hadith-kisa'
  },
  {
    month: 7, // Rajab
    day: 1,
    title: 'أول ليلة جمعة من رجب (ليلة الرغائب)',
    description: 'ليلة عظيمة لكثرة العطاء الإلهي والرغائب واستجابة الدعوات.',
    recommendedDuaId: 'dua-rajab'
  },
  {
    month: 7, // Rajab
    day: 13,
    title: 'ولادة أمير المؤمنين علي بن أبي طالب (ع) في الكعبة',
    description: 'انشقاق جدار الكعبة المشرفة لفاطمة بنت أسد وولادة سيد البلغاء والمتقين.',
    recommendedDuaId: 'dua-sabah',
    isHighOccasion: true
  },
  {
    month: 7, // Rajab
    day: 27,
    title: 'المبعث النبوي الشريف والإسراء والمعراج',
    description: 'نزول الوحي على النبي المصطفى (ص) وبداية الرسالة الإسلامية الخالدة.',
    recommendedDuaId: 'dua-rajab'
  },
  {
    month: 8, // Shaban
    day: 3,
    title: 'ولادة الإمام الحسين سيد الشهداء (ع)',
    description: 'أفراح شعبان المباركة واستبشار أهل البيت بسبط رسول الله الثاني.',
    recommendedDuaId: 'munajat-shabaniyah'
  },
  {
    month: 8, // Shaban
    day: 15,
    title: 'ليلة النصف من شعبان - مولد الإمام المهدي (عج)',
    description: 'أفضل الليالي بعد ليلة القدر، يُستحب فيها إحياء الليل وقراءة دعاء كميل وزيارة الحسين (ع).',
    recommendedDuaId: 'dua-kumayl',
    isHighOccasion: true
  },
  {
    month: 9, // Ramadan
    day: 1,
    title: 'غرة شهر رمضان المبارك',
    description: 'شهر الله الأكبر، شهر الضيافة الإلهية وتلاوة القرآن والصيام.',
    recommendedDuaId: 'dua-iftitah',
    isHighOccasion: true
  },
  {
    month: 9, // Ramadan
    day: 19,
    title: 'ليلة القدر الأولى وجرح أمير المؤمنين (ع)',
    description: 'من ليالي القدر المباركة وضربة ابن ملجم لأمير المؤمنين في محراب مسجد الكوفة.',
    recommendedDuaId: 'dua-iftitah'
  },
  {
    month: 9, // Ramadan
    day: 21,
    title: 'ليلة القدر الثانية واستشهاد أمير المؤمنين (ع)',
    description: 'عروج روح مولانا أمير المؤمنين إلى بارئها فزت ورب الكعبة.',
    recommendedDuaId: 'dua-kumayl',
    isHighOccasion: true
  },
  {
    month: 9, // Ramadan
    day: 23,
    title: 'ليلة القدر العظمى (ليلة الثالث والعشرين)',
    description: 'أرجى ليالي القدر لإدراك الأجر العظيم وتقدير الآجال والأرزاق.',
    recommendedDuaId: 'dua-faraj',
    isHighOccasion: true
  },
  {
    month: 12, // Dhu al-Hijjah
    day: 9,
    title: 'يوم عرفة المبارك',
    description: 'يوم التضرع والمغفرة والتوبة العظيمة في صعيد عرفات.',
    recommendedDuaId: 'dua-arafah',
    isHighOccasion: true
  },
  {
    month: 12, // Dhu al-Hijjah
    day: 18,
    title: 'عيد الغدير الأغر - عيد الله الأكبر',
    description: 'تنصيب أمير المؤمنين علي بن أبي طالب (ع) خليفة وإماماً وإكمال الدين.',
    recommendedDuaId: 'dua-ahd',
    isHighOccasion: true
  },
  {
    month: 12, // Dhu al-Hijjah
    day: 24,
    title: 'يوم المباهلة ونزول آية التطهير',
    description: 'مباهلة النبي (ص) لنصارى نجران بعلي وفاطمة والحسن والحسين (عليهم السلام).',
    recommendedDuaId: 'hadith-kisa'
  }
];

export const CalendarView: React.FC<CalendarViewProps> = ({
  currentHijri,
  allDuas,
  onSelectDua,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<number>(currentHijri.month);

  const filteredOccasions = OCCASIONS_LIST.filter(o => o.month === selectedMonth);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Calendar Header Banner */}
      <div className="text-center mb-8">
        <h2 className="font-amiri text-3xl font-bold text-emerald-950 dark:text-emerald-100 mb-2">
          التَّقْوِيمُ الهِجْرِيُّ وَالمُنَاسَبَاتُ
        </h2>
        <p className="text-sm text-stone-600 dark:text-stone-400">
          جدول المناسبات والمواسم الدينية خلال السنة الهجرية مع الأدعية المأثورة فيها
        </p>

        {/* Current Date Badge */}
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-600/30 text-emerald-900 dark:text-emerald-200 text-sm font-semibold">
          <Calendar className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <span>اليوم: {currentHijri.dayName} {currentHijri.day} {currentHijri.monthName} {currentHijri.year} هـ</span>
        </div>
      </div>

      {/* Months Selector Carousel */}
      <div className="flex items-center gap-1.5 p-1 bg-stone-100 dark:bg-slate-800 rounded-2xl overflow-x-auto no-scrollbar mb-8">
        {HIJRI_MONTHS.map((mName, idx) => {
          const monthNum = idx + 1;
          const isCurrent = monthNum === currentHijri.month;
          const isSelected = monthNum === selectedMonth;

          return (
            <button
              key={monthNum}
              onClick={() => setSelectedMonth(monthNum)}
              className={`px-3.5 py-2 text-xs font-medium rounded-xl whitespace-nowrap shrink-0 transition ${
                isSelected
                  ? 'bg-emerald-800 text-white shadow-sm font-semibold'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>{mName}</span>
              {isCurrent && (
                <span className="mr-1 text-[10px] text-amber-300">●</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Occasions List for Selected Month */}
      <div className="space-y-4">
        {filteredOccasions.length === 0 ? (
          <div className="py-16 text-center text-stone-400 font-amiri">
            <Moon className="w-10 h-10 mx-auto mb-3 opacity-30 text-emerald-600" />
            <p>أيام مباركة من شهر {HIJRI_MONTHS[selectedMonth - 1]}</p>
            <p className="text-xs mt-1">يُستحب فيها المداومة على أدعية الأيام والأسبوع المعتادة.</p>
          </div>
        ) : (
          filteredOccasions.map((occ, i) => {
            const recommendedDua = occ.recommendedDuaId
              ? allDuas.find(d => d.id === occ.recommendedDuaId)
              : null;

            return (
              <div
                key={i}
                className={`p-5 rounded-3xl border transition-all text-right ${
                  occ.isHighOccasion
                    ? 'bg-gradient-to-br from-amber-500/10 via-emerald-500/5 to-white dark:from-amber-950/20 dark:via-emerald-950/20 dark:to-slate-900 border-amber-400/40 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-stone-200/80 dark:border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs text-amber-700 dark:text-amber-400 font-bold mb-1">
                      {occ.day} {HIJRI_MONTHS[occ.month - 1]}
                    </div>
                    <h3 className="font-amiri text-lg sm:text-xl font-bold text-emerald-950 dark:text-emerald-100 mb-1.5">
                      {occ.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed max-w-2xl">
                      {occ.description}
                    </p>
                  </div>

                  {recommendedDua && (
                    <button
                      onClick={() => onSelectDua(recommendedDua)}
                      className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-sm transition whitespace-nowrap shrink-0 group"
                    >
                      <span>قراءة {recommendedDua.title}</span>
                      <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
