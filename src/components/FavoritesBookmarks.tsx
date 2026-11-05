import React, { useState } from 'react';
import { Star, Bookmark, History, ArrowLeft, Trash2, BookOpen } from 'lucide-react';
import { Dua, Bookmark as BookmarkType, ReadingProgress } from '../types';
import { getBookmarks, removeBookmark, getReadingHistory } from '../utils/storage';

interface FavoritesBookmarksProps {
  allDuas: Dua[];
  favorites: string[];
  onSelectDua: (dua: Dua, pageNumber?: number) => void;
  onToggleFavorite: (id: string) => void;
}

export const FavoritesBookmarks: React.FC<FavoritesBookmarksProps> = ({
  allDuas,
  favorites,
  onSelectDua,
  onToggleFavorite,
}) => {
  const [activeTab, setActiveTab] = useState<'favorites' | 'bookmarks' | 'history'>('favorites');
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>(getBookmarks());
  const history = getReadingHistory();

  const favoriteDuas = allDuas.filter(d => favorites.includes(d.id));

  const handleDeleteBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = removeBookmark(id);
    setBookmarks(updated);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header and Filter Tabs */}
      <div className="text-center mb-8">
        <h2 className="font-amiri text-3xl font-bold text-emerald-950 dark:text-emerald-100 mb-2">
          المَحْفُوظَاتُ وَالعَلامَاتُ
        </h2>
        <p className="text-sm text-stone-600 dark:text-stone-400">
          الوصول السريع إلى أدعيتك المفضلة ومواضع قراءتك المحفوظة
        </p>

        {/* Segmented Tab Controls */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium rounded-xl transition ${
              activeTab === 'favorites'
                ? 'bg-emerald-800 text-white shadow-sm font-semibold'
                : 'bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-slate-700'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>الأدعية المفضلة ({favoriteDuas.length})</span>
          </button>

          <button
            onClick={() => {
              setBookmarks(getBookmarks());
              setActiveTab('bookmarks');
            }}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium rounded-xl transition ${
              activeTab === 'bookmarks'
                ? 'bg-emerald-800 text-white shadow-sm font-semibold'
                : 'bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-slate-700'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>العلامات المرجعية ({bookmarks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium rounded-xl transition ${
              activeTab === 'history'
                ? 'bg-emerald-800 text-white shadow-sm font-semibold'
                : 'bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-slate-700'
            }`}
          >
            <History className="w-4 h-4" />
            <span>سجل القراءة ({history.length})</span>
          </button>
        </div>
      </div>

      {/* Favorites List */}
      {activeTab === 'favorites' && (
        <div className="space-y-3">
          {favoriteDuas.length === 0 ? (
            <div className="py-16 text-center text-stone-400 font-amiri">
              <Star className="w-10 h-10 mx-auto mb-3 opacity-30 text-amber-500" />
              <p>لم تقم بإضافة أي دعاء إلى المفضلة بعد.</p>
              <p className="text-xs mt-1">اضغط على علامة النجمة في أي دعاء لإضافته هنا.</p>
            </div>
          ) : (
            favoriteDuas.map(dua => (
              <div
                key={dua.id}
                onClick={() => onSelectDua(dua)}
                className="group p-4 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200/80 dark:border-slate-800 hover:border-emerald-600/50 dark:hover:border-emerald-500/50 shadow-xs hover:shadow-md transition flex items-center justify-between cursor-pointer text-right"
              >
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mb-1">
                    <span>{dua.occasion}</span>
                    <span aria-hidden="true">·</span>
                    <span>{dua.estimatedMinutes} دقائق</span>
                  </div>
                  <h3 className="font-amiri text-lg sm:text-xl font-bold text-emerald-950 dark:text-emerald-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                    {dua.title}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 font-serif line-clamp-1 mt-0.5">
                    {dua.source}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(dua.id);
                    }}
                    className="p-2 text-amber-500 hover:text-amber-600 rounded-lg hover:bg-stone-100 dark:hover:bg-slate-800 transition"
                    title="إزالة من المفضلة"
                  >
                    <Star className="w-4 h-4 fill-current" />
                  </button>
                  <ArrowLeft className="w-4 h-4 text-stone-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 group-hover:-translate-x-1 transition-all mr-2" />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Bookmarks List */}
      {activeTab === 'bookmarks' && (
        <div className="space-y-3">
          {bookmarks.length === 0 ? (
            <div className="py-16 text-center text-stone-400 font-amiri">
              <Bookmark className="w-10 h-10 mx-auto mb-3 opacity-30 text-emerald-600" />
              <p>لا توجد علامات مرجعية محفوظة حالياً.</p>
              <p className="text-xs mt-1">أثناء قراءة أي دعاء، يمكنك الضغط على أيقونة الإشارة المرجعية لتثبيت الموضع.</p>
            </div>
          ) : (
            bookmarks.map(bm => {
              const matchedDua = allDuas.find(d => d.id === bm.duaId);
              if (!matchedDua) return null;

              return (
                <div
                  key={bm.id}
                  onClick={() => onSelectDua(matchedDua, bm.pageNumber)}
                  className="group p-4 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200/80 dark:border-slate-800 hover:border-emerald-600/50 shadow-xs hover:shadow-md transition flex items-center justify-between cursor-pointer text-right"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mb-1">
                      <span className="font-semibold text-emerald-800 dark:text-emerald-400">{matchedDua.title}</span>
                      <span aria-hidden="true">·</span>
                      <span>الصفحة {bm.pageNumber}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-[10px]">
                        {new Date(bm.createdAt).toLocaleDateString('ar-EG')}
                      </span>
                    </div>

                    <p className="font-amiri text-sm text-stone-700 dark:text-stone-300 line-clamp-1 leading-relaxed">
                      {bm.snippet}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleDeleteBookmark(bm.id, e)}
                      className="p-2 text-stone-400 hover:text-red-600 rounded-lg hover:bg-stone-100 dark:hover:bg-slate-800 transition"
                      title="حذف العلامة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ArrowLeft className="w-4 h-4 text-stone-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 group-hover:-translate-x-1 transition-all mr-2" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* History List */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          {history.length === 0 ? (
            <div className="py-16 text-center text-stone-400 font-amiri">
              <History className="w-10 h-10 mx-auto mb-3 opacity-30 text-stone-400" />
              <p>سجل القراءة فارغ حالياً.</p>
              <p className="text-xs mt-1">عند تصفح الأدعية، سيتم حفظ آخر موضع وصلت إليه تلقائياً.</p>
            </div>
          ) : (
            history.map(item => {
              const matchedDua = allDuas.find(d => d.id === item.duaId);
              if (!matchedDua) return null;

              return (
                <div
                  key={item.duaId}
                  onClick={() => onSelectDua(matchedDua, item.pageNumber)}
                  className="group p-4 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200/80 dark:border-slate-800 hover:border-emerald-600/50 shadow-xs hover:shadow-md transition flex items-center justify-between cursor-pointer text-right"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mb-1">
                      <span>الصفحة {item.pageNumber}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-[10px]">
                        {new Date(item.lastReadDate).toLocaleDateString('ar-EG')}
                      </span>
                    </div>

                    <h3 className="font-amiri text-lg font-bold text-emerald-950 dark:text-emerald-100 group-hover:text-emerald-700 transition-colors">
                      {matchedDua.title}
                    </h3>

                    {/* Progress Bar */}
                    <div className="w-full max-w-xs mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-stone-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full"
                          style={{ width: `${item.percent}%` }}
                        />
                      </div>
                      <span className="font-mono text-[10px] text-stone-400">
                        {item.percent}%
                      </span>
                    </div>
                  </div>

                  <ArrowLeft className="w-4 h-4 text-stone-400 group-hover:text-emerald-700 group-hover:-translate-x-1 transition-all mr-2" />
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
