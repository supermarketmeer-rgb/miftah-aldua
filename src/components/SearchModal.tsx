import React, { useState, useMemo } from 'react';
import { Search, X, BookOpen, Clock, ArrowLeft } from 'lucide-react';
import { Dua } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  duas: Dua[];
  onSelectDua: (dua: Dua) => void;
}

// Normalize Arabic for insensitive search
function normalizeArabic(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\u064B-\u065F\u0670]/g, '') // remove diacritics / tashkeel
    .replace(/[أإآء]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .toLowerCase()
    .trim();
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  duas,
  onSelectDua,
}) => {
  const [query, setQuery] = useState<string>('');

  const results = useMemo(() => {
    const q = normalizeArabic(query);
    if (!q || q.length < 2) return [];

    const matches: { dua: Dua; matchedSnippet?: string }[] = [];

    duas.forEach(dua => {
      const normalizedTitle = normalizeArabic(dua.title);
      const normalizedSubtitle = normalizeArabic(dua.subtitle || '');
      const normalizedOccasion = normalizeArabic(dua.occasion);
      const normalizedSource = normalizeArabic(dua.source);

      // Check title or metadata first
      if (
        normalizedTitle.includes(q) ||
        normalizedSubtitle.includes(q) ||
        normalizedOccasion.includes(q) ||
        normalizedSource.includes(q)
      ) {
        matches.push({ dua });
        return;
      }

      // Check verse stanzas
      for (const verse of dua.verses) {
        const normalizedVerse = normalizeArabic(verse.textAr);
        if (normalizedVerse.includes(q)) {
          matches.push({
            dua,
            matchedSnippet: verse.textAr
          });
          break;
        }
      }
    });

    return matches;
  }, [query, duas]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 pt-16 sm:pt-24 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[80vh] text-right">
        {/* Search Input Box */}
        <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث باسم الدعاء، أو كلمة من النص، أو المناسبة (مثل: كميل، الفرج، رجب)..."
            className="flex-1 text-sm sm:text-base bg-transparent text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none text-right font-amiri"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs px-2.5 py-1.5 rounded-lg text-stone-500 hover:bg-stone-100 dark:hover:bg-slate-800 transition"
          >
            إغلاق
          </button>
        </div>

        {/* Search Results Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {query.length >= 2 && results.length === 0 && (
            <div className="py-12 text-center text-stone-400 text-sm font-amiri">
              لم نعثر على نتائج مطابقة لـ «{query}». جرب كلمة أخرى.
            </div>
          )}

          {query.length < 2 && (
            <div className="py-8 px-4 text-center">
              <div className="text-xs text-stone-400 mb-3">اقتراحات شائعة للبحث السريع:</div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {['دعاء كميل', 'دعاء التوسل', 'دعاء الصباح', 'دعاء الفرج', 'زيارة عاشوراء', 'دعاء العهد', 'ليلة الجمعة'].map(s => (
                  <button
                    key={s}
                    onClick={() => setQuery(s)}
                    className="px-3 py-1 rounded-full text-xs bg-stone-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-stone-700 dark:text-stone-300 transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.map(({ dua, matchedSnippet }) => (
            <button
              key={dua.id}
              onClick={() => {
                onSelectDua(dua);
                onClose();
              }}
              className="w-full text-right p-3.5 rounded-2xl hover:bg-stone-50 dark:hover:bg-slate-800/60 border border-stone-100 dark:border-slate-800 transition flex items-center justify-between group"
            >
              <div className="flex-1 min-w-0 pr-1">
                <div className="flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-400 mb-1">
                  <span className="font-semibold">{dua.title}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-stone-400 truncate">{dua.occasion}</span>
                </div>

                {matchedSnippet ? (
                  <p className="font-amiri text-xs text-stone-600 dark:text-stone-300 line-clamp-1 leading-relaxed">
                    «...{matchedSnippet}...»
                  </p>
                ) : (
                  <p className="font-amiri text-xs text-stone-500 dark:text-stone-400 line-clamp-1">
                    {dua.source}
                  </p>
                )}
              </div>

              <ArrowLeft className="w-4 h-4 text-stone-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 group-hover:-translate-x-1 transition-all shrink-0 mr-3" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
