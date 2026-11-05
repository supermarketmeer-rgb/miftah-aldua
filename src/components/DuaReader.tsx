import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Bookmark,
  BookmarkCheck,
  Share2,
  Copy,
  Check,
  Download,
  Settings2,
  BookOpen,
  Scroll,
  Headphones,
  Eye,
  Info,
  Sparkles,
  Repeat,
  Repeat1,
  Send,
  Radio
} from 'lucide-react';
import { Dua, Verse, ReadingSettings, Reciter } from '../types';
import { RECITERS } from '../data/reciters';
import { audioEngine, AudioRepeatMode } from '../utils/audioEngine';
import { saveReadingProgress, saveBookmark, getBookmarks, removeBookmark } from '../utils/storage';
import { TelegramShareModal } from './TelegramShareModal';
import { LiveVoiceRoomModal } from './LiveVoiceRoomModal';

interface DuaReaderProps {
  dua: Dua;
  initialPage?: number;
  initialRoomId?: string;
  autoPlay?: boolean;
  settings: ReadingSettings;
  onUpdateSettings: (settings: ReadingSettings) => void;
  onBack: () => void;
  onShareVerse: (verse: Verse, dua: Dua) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export const DuaReader: React.FC<DuaReaderProps> = ({
  dua,
  initialPage = 1,
  initialRoomId,
  autoPlay = false,
  settings,
  onUpdateSettings,
  onBack,
  onShareVerse,
  isFavorite,
  onToggleFavorite,
}) => {
  // Page calculation: 3-5 verses per page for authentic book feel
  const VERSES_PER_PAGE = 3;
  const totalPages = Math.max(1, Math.ceil(dua.verses.length / VERSES_PER_PAGE));
  const [currentPage, setCurrentPage] = useState<number>(initialPage);

  // Audio state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [currentVerseIndex, setCurrentVerseIndex] = useState<number>(0);
  const [selectedReciterId, setSelectedReciterId] = useState<string>('abathar');
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [repeatMode, setRepeatMode] = useState<AudioRepeatMode>('none');
  const [isAudioOffline, setIsAudioOffline] = useState<boolean>(false);
  const [downloadingAudio, setDownloadingAudio] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [isListenMode, setIsListenMode] = useState<boolean>(true); // Listen & Read vs Read Only

  // Reader UI controls
  const [showSettingsDrawer, setShowSettingsDrawer] = useState<boolean>(false);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);
  const [showTelegramShareModal, setShowTelegramShareModal] = useState<boolean>(false);
  const [showLiveVoiceModal, setShowLiveVoiceModal] = useState<boolean>(!!initialRoomId);
  const [copiedVerseId, setCopiedVerseId] = useState<number | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);

  // Touch gesture support for swipe paging
  const touchStartXRef = useRef<number | null>(null);
  const activeVerseRef = useRef<HTMLDivElement | null>(null);

  // Current page verses
  const currentVerses = settings.displayMode === 'paged'
    ? dua.verses.slice((currentPage - 1) * VERSES_PER_PAGE, currentPage * VERSES_PER_PAGE)
    : dua.verses;

  // Initialize bookmarks
  useEffect(() => {
    const bms = getBookmarks().filter(b => b.duaId === dua.id);
    setBookmarkedIds(bms.map(b => b.verseId));
  }, [dua.id]);

  // Load audio and set audio engine listeners
  useEffect(() => {
    let isMounted = true;

    audioEngine.loadDua(dua, selectedReciterId, 0);

    audioEngine.setListeners({
      onPlayStateChange: (playing) => {
        if (isMounted) setIsPlaying(playing);
      },
      onTimeUpdate: (time, dur, verseIdx) => {
        if (isMounted) {
          setCurrentTime(time);
          setDuration(dur);
          setCurrentVerseIndex(verseIdx);

          // If in paged mode and auto-scroll/paging is on, keep current page synced with active verse
          if (settings.displayMode === 'paged') {
            const versePage = Math.floor(verseIdx / VERSES_PER_PAGE) + 1;
            if (versePage !== currentPage) {
              setCurrentPage(versePage);
            }
          }
        }
      },
      onEnded: () => {
        if (isMounted) setIsPlaying(false);
      }
    });

    audioEngine.isCurrentAudioOffline().then(offline => {
      if (isMounted) setIsAudioOffline(offline);
    });

    // Auto-play audio if requested via direct play button
    if (autoPlay) {
      setTimeout(() => {
        if (isMounted) {
          audioEngine.play().catch(() => {});
        }
      }, 350);
    }

    return () => {
      isMounted = false;
      audioEngine.stop();
    };
  }, [dua.id, selectedReciterId]);

  // Auto-scroll to active verse when audio is playing in scroll mode
  useEffect(() => {
    if (settings.displayMode === 'scroll' && settings.autoScrollWithAudio && isPlaying) {
      activeVerseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentVerseIndex, settings.displayMode, isPlaying]);

  // Save reading progress on page or verse change
  useEffect(() => {
    const percent = Math.round((currentPage / totalPages) * 100);
    saveReadingProgress(dua.id, dua.verses[currentVerseIndex]?.id || 1, currentPage, percent);
  }, [currentPage, currentVerseIndex, dua.id, totalPages]);

  // Paging controls
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Touch handlers for swiping pages
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartXRef.current;
    touchStartXRef.current = null;

    // RTL logic: Swiping to left goes to next page, swiping right goes to previous page
    if (diff < -50) {
      handleNextPage();
    } else if (diff > 50) {
      handlePrevPage();
    }
  };

  // Audio Playback Controls
  const togglePlayAudio = () => {
    audioEngine.togglePlay();
  };

  const handleScrubAudio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    audioEngine.seek(val);
  };

  const handleVerseClick = (index: number) => {
    if (isListenMode) {
      audioEngine.seekToVerse(index);
      if (!isPlaying) {
        audioEngine.play();
      }
    }
  };

  const handleToggleRepeat = () => {
    const modes: AudioRepeatMode[] = ['none', 'verse', 'all'];
    const nextIndex = (modes.indexOf(repeatMode) + 1) % modes.length;
    const nextMode = modes[nextIndex];
    setRepeatMode(nextMode);
    audioEngine.setRepeatMode(nextMode);
  };

  const handleCycleSpeed = () => {
    const speeds = [0.75, 1.0, 1.25, 1.5];
    const nextIndex = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    const nextSpeed = speeds[nextIndex];
    setPlaybackRate(nextSpeed);
    audioEngine.setPlaybackRate(nextSpeed);
  };

  const handleDownloadAudio = async () => {
    setDownloadingAudio(true);
    setDownloadProgress(20);
    const success = await audioEngine.downloadCurrentAudio((p) => setDownloadProgress(p));
    setDownloadingAudio(false);
    if (success) {
      setIsAudioOffline(true);
    }
  };

  const handleCopyVerse = (verse: Verse) => {
    navigator.clipboard.writeText(`${verse.textAr}\n\n[من: ${dua.title} - ${dua.source}]`);
    setCopiedVerseId(verse.id);
    setTimeout(() => setCopiedVerseId(null), 2000);
  };

  const handleToggleBookmark = (verse: Verse) => {
    if (bookmarkedIds.includes(verse.id)) {
      const bms = getBookmarks().filter(b => b.duaId === dua.id && b.verseId === verse.id);
      bms.forEach(b => removeBookmark(b.id));
      setBookmarkedIds(prev => prev.filter(id => id !== verse.id));
    } else {
      saveBookmark({
        duaId: dua.id,
        verseId: verse.id,
        pageNumber: currentPage,
        snippet: verse.textAr.substring(0, 60) + '...',
      });
      setBookmarkedIds(prev => [...prev, verse.id]);
    }
  };

  // Format time mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Reading Theme Classes
  const getThemeContainerClass = () => {
    switch (settings.theme) {
      case 'night':
        return 'bg-slate-950 text-slate-100';
      case 'sepia':
        return 'theme-sepia bg-[#f4ecd8] text-[#3d2d1d]';
      case 'emerald':
        return 'bg-[#03231a] text-emerald-100';
      case 'cream':
      default:
        return 'bg-[#fcfbf7] text-[#1c1917]';
    }
  };

  const getThemeCardClass = () => {
    switch (settings.theme) {
      case 'night':
        return 'bg-slate-900 border-slate-800 text-slate-100 shadow-xl';
      case 'sepia':
        return 'reading-card bg-[#ede3cb] border-[#d8cbb1] text-[#322314] shadow-md';
      case 'emerald':
        return 'bg-[#053225] border-emerald-800/60 text-emerald-50 shadow-xl';
      case 'cream':
      default:
        return 'bg-[#fffefb] border-[#e7e1d3] text-[#1c1917] shadow-lg';
    }
  };

  // Font class
  const getFontFamilyClass = () => {
    switch (settings.fontFamily) {
      case 'scheherazade':
        return 'font-scheherazade';
      case 'naskh':
        return 'font-naskh';
      case 'cairo':
        return 'font-cairo';
      case 'amiri':
      default:
        return 'font-amiri';
    }
  };

  return (
    <div className={`min-h-screen pb-32 transition-colors duration-200 ${getThemeContainerClass()}`}>
      {/* Top Header Bar for Reader */}
      <div className="sticky top-0 z-30 border-b border-stone-200/40 dark:border-slate-800 bg-inherit/95 backdrop-blur-md px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 -mr-2 rounded-xl text-stone-600 dark:text-stone-300 hover:text-emerald-700 dark:hover:text-amber-400 hover:bg-stone-200/50 dark:hover:bg-slate-800 transition"
              title="العودة لقائمة الأدعية"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            <div>
              <h2 className="font-amiri text-lg sm:text-xl font-bold tracking-tight line-clamp-1">
                {dua.title}
              </h2>
              <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                <span>{dua.occasion}</span>
                <span aria-hidden="true">·</span>
                <span>الصفحة {currentPage} من {totalPages}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {/* Live Voice Recitation Button */}
            <button
              onClick={() => setShowLiveVoiceModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 border border-amber-500/30 text-xs font-semibold transition active:scale-[0.98]"
              title="بدء قراءة صوتية مباشرة مع شخص آخر (مكالمة)"
            >
              <Radio className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span className="hidden sm:inline">قراءة صوتية مباشرة</span>
              <span className="sm:hidden">مباشر 🎙️</span>
            </button>

            <button
              onClick={() => setShowTelegramShareModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-800 dark:text-emerald-300 text-xs font-semibold transition"
              title="مشاركة الدعاء والرابط المباشر"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">مشاركة الدعاء</span>
            </button>

            <button
              onClick={onToggleFavorite}
              className={`p-2 rounded-xl transition ${
                isFavorite
                  ? 'text-amber-500 bg-amber-500/10'
                  : 'text-stone-500 dark:text-stone-400 hover:text-amber-500 hover:bg-stone-200/50 dark:hover:bg-slate-800'
              }`}
              title={isFavorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
            >
              <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={() => setShowInfoModal(true)}
              className="p-2 rounded-xl text-stone-500 dark:text-stone-400 hover:text-emerald-700 dark:hover:text-amber-400 hover:bg-stone-200/50 dark:hover:bg-slate-800 transition"
              title="معلومات الدعاء وفضله ومصدره"
            >
              <Info className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
              className="p-2 rounded-xl text-stone-500 dark:text-stone-400 hover:text-emerald-700 dark:hover:text-amber-400 hover:bg-stone-200/50 dark:hover:bg-slate-800 transition"
              title="تخصيص الخط والمظهر"
            >
              <Settings2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Reader Settings Drawer (Inline accordion or popup) */}
      {showSettingsDrawer && (
        <div className="max-w-4xl mx-auto px-4 py-4 mb-4 border-b border-stone-200/50 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm rounded-b-2xl shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            {/* Font Family Selection */}
            <div>
              <label className="block font-semibold mb-1.5 text-stone-700 dark:text-stone-300">
                نوع الخط العربي
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'amiri', name: 'الخط الأميري' },
                  { id: 'scheherazade', name: 'خط شهرزاد' },
                  { id: 'naskh', name: 'خط النسخ' },
                  { id: 'cairo', name: 'خط كايرو الحديث' }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => onUpdateSettings({ ...settings, fontFamily: f.id as any })}
                    className={`py-1.5 px-2 rounded-lg border text-center transition ${
                      settings.fontFamily === f.id
                        ? 'border-emerald-700 bg-emerald-700 text-white font-medium'
                        : 'border-stone-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size & Line Height */}
            <div>
              <div className="flex justify-between font-semibold mb-1 text-stone-700 dark:text-stone-300">
                <span>حجم الخط</span>
                <span className="font-mono">{settings.fontSize}px</span>
              </div>
              <input
                type="range"
                min="18"
                max="36"
                step="1"
                value={settings.fontSize}
                onChange={(e) => onUpdateSettings({ ...settings, fontSize: parseInt(e.target.value) })}
                className="w-full accent-emerald-700 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400 mt-0.5">
                <span>صغير (18)</span>
                <span>كبير (36)</span>
              </div>
            </div>

            {/* Reading Theme */}
            <div>
              <label className="block font-semibold mb-1.5 text-stone-700 dark:text-stone-300">
                مظهر القراءة
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'cream', name: 'ورقي', bg: 'bg-[#fffefb] border-[#d8d0c0] text-stone-800' },
                  { id: 'night', name: 'ليلي', bg: 'bg-slate-900 border-slate-700 text-white' },
                  { id: 'sepia', name: 'سيبيا', bg: 'bg-[#ede3cb] border-[#cfc1a5] text-[#3d2d1d]' },
                  { id: 'emerald', name: 'زمردي', bg: 'bg-[#064e3b] border-emerald-600 text-emerald-100' }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => onUpdateSettings({ ...settings, theme: t.id as any })}
                    className={`h-9 rounded-lg border flex flex-col items-center justify-center text-[10px] transition ${t.bg} ${
                      settings.theme === t.id ? 'ring-2 ring-amber-400 font-bold' : ''
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Display Mode */}
            <div>
              <label className="block font-semibold mb-1.5 text-stone-700 dark:text-stone-300">
                نمط التصفح
              </label>
              <div className="flex items-center gap-1.5 p-1 bg-stone-100 dark:bg-slate-800 rounded-lg">
                <button
                  onClick={() => onUpdateSettings({ ...settings, displayMode: 'paged' })}
                  className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md transition ${
                    settings.displayMode === 'paged'
                      ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-xs font-semibold'
                      : 'text-stone-600 dark:text-stone-400'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>صفحات</span>
                </button>
                <button
                  onClick={() => onUpdateSettings({ ...settings, displayMode: 'scroll' })}
                  className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md transition ${
                    settings.displayMode === 'scroll'
                      ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-xs font-semibold'
                      : 'text-stone-600 dark:text-stone-400'
                  }`}
                >
                  <Scroll className="w-3.5 h-3.5" />
                  <span>مستمر</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Electronic Book Page Container */}
      <main
        className="max-w-4xl mx-auto px-4 sm:px-6 pt-4"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className={`relative rounded-3xl p-6 sm:p-10 lg:p-12 transition-all ${getThemeCardClass()} islamic-frame`}
        >
          {/* Subtle Decorative Islamic Header Motif */}
          <div className="flex items-center justify-center gap-3 mb-8 opacity-75">
            <div className="h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent flex-1" />
            <div className="text-amber-600 dark:text-amber-400 font-amiri text-sm tracking-widest px-2">
              ✤ {dua.title} ✤
            </div>
            <div className="h-px bg-gradient-to-l from-transparent via-amber-500/50 to-transparent flex-1" />
          </div>

          {/* If on first page, show opening Bismillah banner */}
          {currentPage === 1 && (
            <div className="text-center mb-8">
              <div className="font-amiri text-2xl sm:text-3xl font-bold text-amber-700 dark:text-amber-400 mb-2">
                بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
              </div>
              <div className="text-xs text-stone-500 dark:text-stone-400 font-serif">
                المصدر: {dua.source}
              </div>
            </div>
          )}

          {/* Book Stanzas / Verses */}
          <div className="space-y-6">
            {currentVerses.map((verse, idx) => {
              const globalIndex = settings.displayMode === 'paged'
                ? (currentPage - 1) * VERSES_PER_PAGE + idx
                : idx;
              const isActiveVerse = globalIndex === currentVerseIndex && isPlaying;
              const isBookmarked = bookmarkedIds.includes(verse.id);

              return (
                <div
                  key={verse.id}
                  ref={isActiveVerse ? activeVerseRef : null}
                  onClick={() => handleVerseClick(globalIndex)}
                  className={`group relative rounded-2xl p-4 sm:p-5 transition-all cursor-pointer ${
                    isActiveVerse
                      ? 'bg-amber-400/15 dark:bg-amber-500/20 ring-1 ring-amber-400/40 shadow-xs'
                      : 'hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  {/* Verse Text with Custom Font and Size */}
                  <p
                    className={`${getFontFamilyClass()} text-right leading-loose tracking-wide select-text`}
                    style={{
                      fontSize: `${settings.fontSize}px`,
                      lineHeight: settings.lineHeight
                    }}
                  >
                    {verse.textAr}
                  </p>

                  {/* Micro Actions Bar for Verse */}
                  <div className="mt-3 pt-2.5 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                    <span className="font-mono text-[11px] opacity-60">
                      فقرة #{verse.id}
                    </span>

                    <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleBookmark(verse);
                        }}
                        className={`p-1.5 rounded-lg transition ${
                          isBookmarked
                            ? 'text-amber-600 dark:text-amber-400 bg-amber-500/15'
                            : 'hover:text-amber-600 hover:bg-stone-200/50 dark:hover:bg-slate-800'
                        }`}
                        title={isBookmarked ? 'إزالة العلامة المرجعية' : 'وضع علامة مرجعية هنا'}
                      >
                        {isBookmarked ? (
                          <BookmarkCheck className="w-3.5 h-3.5" />
                        ) : (
                          <Bookmark className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyVerse(verse);
                        }}
                        className="p-1.5 rounded-lg hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-stone-200/50 dark:hover:bg-slate-800 transition"
                        title="نسخ نص الفقرة"
                      >
                        {copiedVerseId === verse.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onShareVerse(verse, dua);
                        }}
                        className="p-1.5 rounded-lg hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-stone-200/50 dark:hover:bg-slate-800 transition"
                        title="مشاركة كبطاقة مصممة"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Book Pagination Controls (for paged mode) */}
          {settings.displayMode === 'paged' && (
            <div className="mt-12 pt-6 border-t border-black/10 dark:border-white/10 flex items-center justify-between">
              <button
                onClick={handlePrevPage}
                disabled={currentPage <= 1}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition"
              >
                <ChevronRight className="w-4 h-4" />
                <span>الصفحة السابقة</span>
              </button>

              <div className="font-mono text-xs text-stone-500 dark:text-stone-400">
                {currentPage} / {totalPages}
              </div>

              <button
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition"
              >
                <span>الصفحة التالية</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Floating Synced Audio Player Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#fcfbf7]/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-emerald-900/10 dark:border-emerald-800/30 shadow-2xl pb-safe">
        <div className="max-w-4xl mx-auto px-4 py-3">
          {/* Audio Scrubber Bar */}
          <div className="flex items-center gap-3 text-[11px] font-mono text-stone-500 dark:text-stone-400 mb-2">
            <span>{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.5"
              value={currentTime}
              onChange={handleScrubAudio}
              className="w-full accent-emerald-700 cursor-pointer h-1.5 bg-stone-200 dark:bg-slate-700 rounded-lg"
            />
            <span>{formatTime(duration)}</span>
          </div>

          {/* Audio Controls Row */}
          <div className="flex items-center justify-between gap-2">
            {/* Left: Reciter Selector & Offline Status */}
            <div className="flex items-center gap-2">
              <select
                value={selectedReciterId}
                onChange={(e) => setSelectedReciterId(e.target.value)}
                className="text-xs bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-stone-800 dark:text-stone-200 focus:outline-none focus:border-emerald-700"
              >
                {RECITERS.map(r => (
                  <option key={r.id} value={r.id}>
                    بصوت: {r.nameAr}
                  </option>
                ))}
              </select>

              <button
                onClick={handleDownloadAudio}
                disabled={isAudioOffline || downloadingAudio}
                className={`p-1.5 rounded-lg text-xs transition flex items-center gap-1 ${
                  isAudioOffline
                    ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10'
                    : 'text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-slate-800'
                }`}
                title={isAudioOffline ? 'تم التنزيل للاستماع دون اتصال' : 'تحميل للاستماع بدون اتصال'}
              >
                {downloadingAudio ? (
                  <span className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline text-[11px]">
                  {isAudioOffline ? 'محفوظ أوفلاين' : 'تحميل'}
                </span>
              </button>
            </div>

            {/* Center: Playback Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => audioEngine.prevVerse()}
                className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-slate-800 transition"
                title="الفقرة السابقة"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <button
                onClick={togglePlayAudio}
                className="w-11 h-11 rounded-2xl bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white flex items-center justify-center shadow-md active:scale-95 transition-all"
                title={isPlaying ? 'إيقاف مؤقت' : 'استماع للدعاء'}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 mr-0.5" />}
              </button>

              <button
                onClick={() => audioEngine.nextVerse()}
                className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-slate-800 transition"
                title="الفقرة التالية"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>

            {/* Right: Audio Speed & Repeat Mode */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCycleSpeed}
                className="px-2 py-1 rounded-lg text-xs font-mono font-medium border border-stone-200 dark:border-slate-700 hover:bg-stone-100 dark:hover:bg-slate-800 transition"
                title="سرعة التشغيل"
              >
                {playbackRate}x
              </button>

              <button
                onClick={handleToggleRepeat}
                className={`p-1.5 rounded-lg transition ${
                  repeatMode !== 'none'
                    ? 'text-amber-600 dark:text-amber-400 bg-amber-500/15'
                    : 'text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-slate-800'
                }`}
                title={
                  repeatMode === 'verse'
                    ? 'تكرار الفقرة الحالية'
                    : repeatMode === 'all'
                    ? 'تكرار الدعاء كاملاً'
                    : 'بدون تكرار'
                }
              >
                {repeatMode === 'verse' ? (
                  <Repeat1 className="w-4 h-4" />
                ) : (
                  <Repeat className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Info & Virtues Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-emerald-900/15 dark:border-emerald-800/30 p-6 sm:p-8 shadow-2xl text-right max-h-[85vh] overflow-y-auto">
            <h3 className="font-amiri text-2xl font-bold text-emerald-950 dark:text-emerald-100 mb-2">
              {dua.title}
            </h3>
            {dua.subtitle && (
              <p className="text-xs text-amber-700 dark:text-amber-400 mb-4 font-medium">
                {dua.subtitle}
              </p>
            )}

            <div className="space-y-4 text-sm text-stone-700 dark:text-stone-300">
              <div>
                <span className="font-bold text-emerald-900 dark:text-emerald-300 block mb-1">
                  المصدر والرواية:
                </span>
                <p className="bg-stone-50 dark:bg-slate-800/60 p-3 rounded-xl border border-stone-200/50 dark:border-slate-700/50 text-xs leading-relaxed">
                  {dua.source}
                  {dua.narrator && ` — ${dua.narrator}`}
                </p>
              </div>

              {dua.virtues && (
                <div>
                  <span className="font-bold text-emerald-900 dark:text-emerald-300 block mb-1">
                    فضله وثواب قراءته:
                  </span>
                  <p className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 text-xs leading-relaxed">
                    {dua.virtues}
                  </p>
                </div>
              )}

              <div>
                <span className="font-bold text-emerald-900 dark:text-emerald-300 block mb-1">
                  المناسبة ووقت القراءة:
                </span>
                <p className="text-xs">{dua.occasion}</p>
              </div>
            </div>

            <button
              onClick={() => setShowInfoModal(false)}
              className="mt-6 w-full py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-sm transition"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      {/* Telegram and Universal Link Sharing Modal */}
      <TelegramShareModal
        isOpen={showTelegramShareModal}
        onClose={() => setShowTelegramShareModal(false)}
        dua={dua}
        currentPage={currentPage}
        currentReciterId={selectedReciterId}
      />

      {/* Live Voice Interactive Recitation Modal / Floating Bar */}
      <LiveVoiceRoomModal
        isOpen={showLiveVoiceModal}
        onClose={() => setShowLiveVoiceModal(false)}
        dua={dua}
        initialRoomId={initialRoomId}
      />
    </div>
  );
};
