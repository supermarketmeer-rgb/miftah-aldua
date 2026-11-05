import React from 'react';
import { BookOpen, Search, Download, Sparkles, Moon, Sun, Settings } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenSearch: () => void;
  onOpenSettings: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  onOpenSearch,
  onOpenSettings,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const { isInstallable, install, isIOS } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-emerald-900/10 dark:border-emerald-800/30 bg-[#fcfbf7]/90 dark:bg-slate-900/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element in display face) */}
        <button
          onClick={() => onTabChange('home')}
          className="flex items-center gap-2.5 text-right whitespace-nowrap shrink-0 group focus:outline-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-900 text-amber-300 flex items-center justify-center shadow-sm border border-amber-400/20 group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="font-amiri text-2xl font-bold tracking-tight text-emerald-950 dark:text-emerald-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
            مِفْتَاحُ الدُّعَاءِ
          </span>
        </button>

        {/* Zone 2: Navigation Links (single line, concise labels) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          <button
            onClick={() => onTabChange('home')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-1 ${
              currentTab === 'home'
                ? 'text-emerald-800 dark:text-emerald-300 border-b-2 border-emerald-700 dark:border-emerald-400 font-semibold'
                : 'text-stone-600 dark:text-stone-300 hover:text-emerald-800 dark:hover:text-emerald-200'
            }`}
          >
            الأدعية والزيارات
          </button>
          <button
            onClick={() => onTabChange('favorites')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-1 ${
              currentTab === 'favorites'
                ? 'text-emerald-800 dark:text-emerald-300 border-b-2 border-emerald-700 dark:border-emerald-400 font-semibold'
                : 'text-stone-600 dark:text-stone-300 hover:text-emerald-800 dark:hover:text-emerald-200'
            }`}
          >
            المفضلة والعلامات
          </button>
          <button
            onClick={() => onTabChange('tasbeeh')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-1 ${
              currentTab === 'tasbeeh'
                ? 'text-emerald-800 dark:text-emerald-300 border-b-2 border-emerald-700 dark:border-emerald-400 font-semibold'
                : 'text-stone-600 dark:text-stone-300 hover:text-emerald-800 dark:hover:text-emerald-200'
            }`}
          >
            السبحة الإلكترونية
          </button>
          <button
            onClick={() => onTabChange('calendar')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-1 ${
              currentTab === 'calendar'
                ? 'text-emerald-800 dark:text-emerald-300 border-b-2 border-emerald-700 dark:border-emerald-400 font-semibold'
                : 'text-stone-600 dark:text-stone-300 hover:text-emerald-800 dark:hover:text-emerald-200'
            }`}
          >
            المناسبات الهجرية
          </button>
          <button
            onClick={() => onTabChange('group')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-1 flex items-center gap-1 ${
              currentTab === 'group'
                ? 'text-emerald-800 dark:text-emerald-300 border-b-2 border-emerald-700 dark:border-emerald-400 font-semibold'
                : 'text-stone-600 dark:text-stone-300 hover:text-emerald-800 dark:hover:text-emerald-200'
            }`}
          >
            <span>القراءة الجماعية</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action & Utility Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-stone-600 dark:text-stone-300 hover:border-emerald-600 dark:hover:border-emerald-500 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors"
            title="بحث في الأدعية والنصوص"
          >
            <Search className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span className="hidden sm:inline">بحث في الأدعية...</span>
          </button>

          {isInstallable && (
            <button
              onClick={install}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0"
              title="تثبيت التطبيق على الجهاز"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تثبيت التطبيق</span>
            </button>
          )}

          {isIOS && !isInstallable && (
            <button
              onClick={() => setShowIOSModal(true)}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-emerald-800 dark:text-emerald-300 border border-emerald-700/30 rounded-lg hover:bg-emerald-50 dark:hover:bg-slate-800 transition"
              title="تثبيت على الآيفون"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تثبيت iOS</span>
            </button>
          )}

          <button
            onClick={onToggleDarkMode}
            className="p-2 text-stone-600 dark:text-stone-300 hover:text-emerald-700 dark:hover:text-amber-400 rounded-lg hover:bg-stone-100 dark:hover:bg-slate-800 transition"
            title={isDarkMode ? 'الوضع النهاري' : 'الوضع الليلي'}
            aria-label="تبديل المظهر"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 text-stone-600 dark:text-stone-300 hover:text-emerald-700 dark:hover:text-amber-400 rounded-lg hover:bg-stone-100 dark:hover:bg-slate-800 transition"
            title="إعدادات القراءة والتخزين"
            aria-label="الإعدادات"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS Safari Installation Guide Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-emerald-900/10 dark:border-emerald-800/30 p-6 shadow-2xl text-right">
            <h3 className="font-amiri text-xl font-bold text-emerald-950 dark:text-emerald-100">
              تثبيت التطبيق على أجهزة iOS
            </h3>
            <p className="mt-3 text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
              لتثبيت كتاب الأدعية واستخدامه دون اتصال مثل تطبيق أصلي:
            </p>
            <ol className="mt-3 text-sm text-stone-700 dark:text-stone-300 space-y-2 list-decimal list-inside pr-1">
              <li>اضغط على زر <strong>المشاركة (Share)</strong> في شريط متصفح سفاري بالأسفل.</li>
              <li>انزل في القائمة واختر <strong>إضافة إلى الشاشة الرئيسية (Add to Home Screen)</strong>.</li>
              <li>اضغط على <strong>إضافة (Add)</strong> في الزاوية العلوية.</li>
            </ol>
            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-6 w-full py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-sm transition"
            >
              تم
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
