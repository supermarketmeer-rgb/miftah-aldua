import React from 'react';
import { BookOpen, Star, Disc, Calendar, Users } from 'lucide-react';

interface BottomTabBarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenSearch: () => void;
  favoritesCount: number;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  currentTab,
  onTabChange,
  onOpenSearch,
  favoritesCount,
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#fcfbf7]/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-emerald-900/10 dark:border-emerald-800/30 pb-safe">
      <div className="grid grid-cols-5 items-center h-16 px-1">
        <button
          onClick={() => onTabChange('home')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] transition-colors ${
            currentTab === 'home'
              ? 'text-emerald-800 dark:text-emerald-400 font-semibold'
              : 'text-stone-500 dark:text-stone-400 hover:text-emerald-700'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[11px] font-medium mt-1">الأدعية</span>
        </button>

        <button
          onClick={() => onTabChange('favorites')}
          className={`relative flex flex-col items-center justify-center min-h-[44px] min-w-[44px] transition-colors ${
            currentTab === 'favorites'
              ? 'text-emerald-800 dark:text-emerald-400 font-semibold'
              : 'text-stone-500 dark:text-stone-400 hover:text-emerald-700'
          }`}
        >
          <Star className="w-5 h-5" />
          <span className="text-[11px] font-medium mt-1">المفضلة</span>
          {favoritesCount > 0 && (
            <span className="absolute top-1.5 right-4 w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">
              {favoritesCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onTabChange('group')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] transition-colors ${
            currentTab === 'group'
              ? 'text-emerald-800 dark:text-emerald-400 font-semibold'
              : 'text-stone-500 dark:text-stone-400 hover:text-emerald-700'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[11px] font-medium mt-1">جماعي</span>
        </button>

        <button
          onClick={() => onTabChange('tasbeeh')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] transition-colors ${
            currentTab === 'tasbeeh'
              ? 'text-emerald-800 dark:text-emerald-400 font-semibold'
              : 'text-stone-500 dark:text-stone-400 hover:text-emerald-700'
          }`}
        >
          <Disc className="w-5 h-5" />
          <span className="text-[11px] font-medium mt-1">السبحة</span>
        </button>

        <button
          onClick={() => onTabChange('calendar')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] transition-colors ${
            currentTab === 'calendar'
              ? 'text-emerald-800 dark:text-emerald-400 font-semibold'
              : 'text-stone-500 dark:text-stone-400 hover:text-emerald-700'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[11px] font-medium mt-1">المناسبات</span>
        </button>
      </div>
    </div>
  );
};
