import React, { useState } from 'react';
import { Calendar, Clock, Bookmark, Play, BookOpen, Star, Sparkles, Filter, Send, Share2 } from 'lucide-react';
import { Dua, DuaCategory } from '../types';
import { CATEGORY_LABELS } from '../data/duas';

interface DuaListProps {
  duas: Dua[];
  onSelectDua: (dua: Dua) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onOpenTelegramShare?: (dua: Dua) => void;
}

export const DuaList: React.FC<DuaListProps> = ({
  duas,
  onSelectDua,
  favorites,
  onToggleFavorite,
  onOpenTelegramShare,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'جميع الأدعية' },
    { id: 'days', label: 'أدعية الأيام' },
    { id: 'week', label: 'أدعية الأسبوع' },
    { id: 'months', label: 'أدعية الأشهر' },
    { id: 'year', label: 'أدعية السنة' },
    { id: 'ziyarat', label: 'الزيارات الشريفة' },
  ];

  const filteredDuas = selectedCategory === 'all'
    ? duas
    : duas.filter(d => d.category === selectedCategory);

  return (
    <section className="mb-14">
      {/* Category Tabs: Interactive segmented controls */}
      <div className="flex items-center gap-1.5 p-1 bg-stone-100 dark:bg-slate-800/80 rounded-2xl overflow-x-auto no-scrollbar mb-6">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-xl whitespace-nowrap shrink-0 transition-all ${
              selectedCategory === cat.id
                ? 'bg-white dark:bg-slate-900 text-emerald-900 dark:text-emerald-300 shadow-sm font-semibold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Duas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDuas.map(dua => {
          const isFav = favorites.includes(dua.id);

          return (
            <div
              key={dua.id}
              onClick={() => onSelectDua(dua)}
              className="group relative flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-stone-200/80 dark:border-slate-800/80 hover:border-emerald-600/50 dark:hover:border-emerald-500/50 hover:shadow-md transition-all cursor-pointer text-right"
            >
              <div>
                {/* Unboxed Metadata Header (Zero-Pill Discipline) */}
                <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-2">
                  <div className="flex items-center gap-1.5 truncate">
                    <span>{CATEGORY_LABELS[dua.category]?.title || 'أدعية'}</span>
                    <span aria-hidden="true">·</span>
                    <span className="truncate">{dua.occasion}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    {onOpenTelegramShare && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenTelegramShare(dua);
                        }}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition"
                        title="مشاركة الدعاء والرابط"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(dua.id);
                      }}
                      className={`p-1.5 -mr-1 rounded-lg transition ${
                        isFav
                          ? 'text-amber-500 hover:text-amber-600'
                          : 'text-stone-400 hover:text-amber-500'
                      }`}
                      title={isFav ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
                    >
                      <Star className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Title and Subtitle */}
                <h3 className="font-amiri text-xl font-bold text-emerald-950 dark:text-emerald-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors mb-1.5">
                  {dua.title}
                </h3>
                {dua.subtitle && (
                  <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-1 mb-3">
                    {dua.subtitle}
                  </p>
                )}

                {/* Snippet preview */}
                <p className="font-amiri text-sm text-stone-700 dark:text-stone-300 line-clamp-2 leading-relaxed opacity-90 mb-4">
                  {dua.verses[0]?.textAr}
                </p>
              </div>

              {/* Card Footer: Metadata and Action */}
              <div className="pt-3 border-t border-stone-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-stone-400 font-mono text-[11px]">
                  {dua.estimatedMinutes} دقائق · {dua.verses.length} فقرات
                </span>

                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold group-hover:translate-x-1 transition-transform">
                  <span>فتح وقراءة</span>
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
