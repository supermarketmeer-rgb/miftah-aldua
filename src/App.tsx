import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { BottomTabBar } from './components/BottomTabBar';
import { HeroBanner } from './components/HeroBanner';
import { DuaList } from './components/DuaList';
import { DuaReader } from './components/DuaReader';
import { TasbeehCounter } from './components/TasbeehCounter';
import { CalendarView } from './components/CalendarView';
import { FavoritesBookmarks } from './components/FavoritesBookmarks';
import { GroupRecitationView } from './components/GroupRecitationView';
import { SearchModal } from './components/SearchModal';
import { SettingsModal } from './components/SettingsModal';
import { AddDuaModal } from './components/AddDuaModal';
import { ShareCardModal } from './components/ShareCardModal';
import { TelegramShareModal } from './components/TelegramShareModal';
import { Dua, Verse, ReadingSettings, HijriDateInfo } from './types';
import { INITIAL_DUAS } from './data/duas';
import { getHijriDate } from './utils/hijriCalendar';
import { parseCurrentDeepLink, generateDuaDeepLink, findDuaMatch, getDuaSlug } from './utils/deepLink';
import {
  getFavorites,
  toggleFavorite,
  getReadingSettings,
  saveReadingSettings,
  getReadingHistory,
  getCustomDuas,
  saveCustomDua
} from './utils/storage';
import { useOnlineStatus } from './hooks/useOnlineStatus';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [activeDua, setActiveDua] = useState<Dua | null>(null);
  const [activePage, setActivePage] = useState<number>(1);
  const [autoPlay, setAutoPlay] = useState<boolean>(false);
  const [activeRoomId, setActiveRoomId] = useState<string | undefined>(undefined);

  // Persistence States
  const [favorites, setFavorites] = useState<string[]>(getFavorites());
  const [settings, setSettings] = useState<ReadingSettings>(getReadingSettings());
  const [customDuas, setCustomDuas] = useState<Dua[]>(getCustomDuas());
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('miftah_dark_mode') === 'true' ||
        window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Modals
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAddDuaOpen, setIsAddDuaOpen] = useState<boolean>(false);
  const [telegramShareDua, setTelegramShareDua] = useState<Dua | null>(null);
  const [shareData, setShareData] = useState<{ verse: Verse; dua: Dua } | null>(null);

  // Hijri Date and Today's Dua Calculation
  const [hijriInfo, setHijriInfo] = useState<HijriDateInfo>(getHijriDate());
  const isOnline = useOnlineStatus();

  // Combine initial duas with custom user-added duas
  const allDuas = [...INITIAL_DUAS, ...customDuas];

  // Map today's day of week to today's daily dua
  const dayOfWeek = new Date().getDay(); // 0 is Sunday
  const todayDua = allDuas.find(d => d.category === 'days' && d.dayOfWeek === dayOfWeek) 
    || allDuas.find(d => d.id === 'dua-friday');

  // Last read progress item
  const history = getReadingHistory();
  const lastReadItem = history[0];

  // Dark mode effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('miftah_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('miftah_dark_mode', 'false');
    }
  }, [isDarkMode]);

  // Handle incoming deep link or universal link (WhatsApp / Telegram / App Link)
  useEffect(() => {
    const params = parseCurrentDeepLink();
    if (params?.roomId) {
      setActiveRoomId(params.roomId);
    }
    if (params?.duaId) {
      const target = findDuaMatch(allDuas, params.duaId);
      if (target) {
        setActiveDua(target);
        setActivePage(params.page || 1);
      }
    } else if (params?.groupId) {
      setCurrentTab('group');
    }
  }, []);

  // Handle setting updates
  const handleUpdateSettings = (newSettings: ReadingSettings) => {
    setSettings(newSettings);
    saveReadingSettings(newSettings);
  };

  const handleToggleFavorite = (duaId: string) => {
    const updated = toggleFavorite(duaId);
    setFavorites(updated);
  };

  const handleSelectDua = (dua: Dua, startPage: number = 1, shouldAutoPlay: boolean = false) => {
    setActiveDua(dua);
    setActivePage(startPage);
    setAutoPlay(shouldAutoPlay);
    // Update browser URL query with friendly Arabic slug for easy copying and bookmarking
    if (typeof window !== 'undefined' && window.history) {
      try {
        const url = new URL(window.location.href);
        const slug = getDuaSlug(dua);
        url.searchParams.set('dua', slug);
        if (startPage > 1) {
          url.searchParams.set('p', startPage.toString());
        } else {
          url.searchParams.delete('p');
          url.searchParams.delete('page');
        }
        window.history.replaceState({}, '', url.toString());
      } catch {
        // Fallback
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromReader = () => {
    setActiveDua(null);
    setAutoPlay(false);
    setActiveRoomId(undefined);
    if (typeof window !== 'undefined' && window.history) {
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete('dua');
        url.searchParams.delete('d');
        url.searchParams.delete('p');
        url.searchParams.delete('page');
        url.searchParams.delete('room');
        url.searchParams.delete('voice');
        window.history.replaceState({}, '', url.toString());
      } catch {
        // Fallback
      }
    }
  };

  const handleAddCustomDua = (newDua: Dua) => {
    const updated = saveCustomDua(newDua);
    setCustomDuas(updated);
    setActiveDua(newDua);
  };

  return (
    <div className="min-h-screen bg-[#fcfbf7] dark:bg-slate-950 text-stone-900 dark:text-stone-100 flex flex-col transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={(tab) => {
          setActiveDua(null);
          setCurrentTab(tab);
        }}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Main View Router */}
      {activeDua ? (
        <DuaReader
          dua={activeDua}
          initialPage={activePage}
          initialRoomId={activeRoomId}
          autoPlay={autoPlay}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onBack={handleBackFromReader}
          onShareVerse={(verse, dua) => setShareData({ verse, dua })}
          isFavorite={favorites.includes(activeDua.id)}
          onToggleFavorite={() => handleToggleFavorite(activeDua.id)}
        />
      ) : (
        <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 md:pb-12">
          {currentTab === 'home' && (
            <>
              <HeroBanner
                hijriInfo={hijriInfo}
                todayDua={todayDua}
                lastRead={lastReadItem}
                allDuas={allDuas}
                onSelectDua={handleSelectDua}
                onOpenCalendar={() => setCurrentTab('calendar')}
              />
              <DuaList
                duas={allDuas}
                onSelectDua={handleSelectDua}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                onOpenTelegramShare={(dua) => setTelegramShareDua(dua)}
              />
            </>
          )}

          {currentTab === 'favorites' && (
            <FavoritesBookmarks
              allDuas={allDuas}
              favorites={favorites}
              onSelectDua={handleSelectDua}
              onToggleFavorite={handleToggleFavorite}
            />
          )}

          {currentTab === 'group' && (
            <GroupRecitationView
              allDuas={allDuas}
              onSelectDua={handleSelectDua}
            />
          )}

          {currentTab === 'tasbeeh' && <TasbeehCounter />}

          {currentTab === 'calendar' && (
            <CalendarView
              currentHijri={hijriInfo}
              allDuas={allDuas}
              onSelectDua={handleSelectDua}
            />
          )}
        </div>
      )}

      {/* Mobile Fixed Bottom Navigation Bar */}
      {!activeDua && (
        <BottomTabBar
          currentTab={currentTab}
          onTabChange={(tab) => {
            setActiveDua(null);
            setCurrentTab(tab);
          }}
          onOpenSearch={() => setIsSearchOpen(true)}
          favoritesCount={favorites.length}
        />
      )}

      {/* Offline Status Floating Toast when connection is lost */}
      {!isOnline && (
        <div className="fixed bottom-20 md:bottom-6 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xl animate-bounce">
          <span className="w-2 h-2 rounded-full bg-white" />
          <span>الوضع غير المتصل: نصوص الأدعية والمفضلة متاحة محلياً</span>
        </div>
      )}

      {/* Modals */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        duas={allDuas}
        onSelectDua={handleSelectDua}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onOpenAddDua={() => setIsAddDuaOpen(true)}
      />

      <AddDuaModal
        isOpen={isAddDuaOpen}
        onClose={() => setIsAddDuaOpen(false)}
        onAddDua={handleAddCustomDua}
      />

      <ShareCardModal
        isOpen={!!shareData}
        onClose={() => setShareData(null)}
        verse={shareData?.verse || null}
        dua={shareData?.dua || null}
      />

      {telegramShareDua && (
        <TelegramShareModal
          isOpen={!!telegramShareDua}
          onClose={() => setTelegramShareDua(null)}
          dua={telegramShareDua}
          onOpenGroupRecitation={() => {
            setTelegramShareDua(null);
            setCurrentTab('group');
          }}
        />
      )}
    </div>
  );
}
