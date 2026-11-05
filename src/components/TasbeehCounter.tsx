import React, { useState, useEffect } from 'react';
import { RotateCcw, Volume2, VolumeX, Sparkles, Award, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TasbeehMode {
  id: string;
  title: string;
  description: string;
  phrases: { text: string; target: number }[];
}

export const TasbeehCounter: React.FC = () => {
  const [selectedModeId, setSelectedModeId] = useState<string>('zahra');
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState<number>(0);
  const [count, setCount] = useState<number>(0);
  const [totalSessionCount, setTotalSessionCount] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [hapticEnabled, setHapticEnabled] = useState<boolean>(true);

  // Modes definition
  const modes: TasbeehMode[] = [
    {
      id: 'zahra',
      title: 'تسبيحة الزهراء (ع)',
      description: 'أفضل التسابيح التي علّمها رسول الله (ص) لابنته فاطمة الزهراء (ع)',
      phrases: [
        { text: 'اللهُ أَكْبَرُ', target: 34 },
        { text: 'الْحَمْدُ لِلَّهِ', target: 33 },
        { text: 'سُبْحَانَ اللَّهِ', target: 33 },
      ]
    },
    {
      id: 'daily',
      title: 'أذكار الأيام (100 مرة)',
      description: 'الأذكار المخصوصة لكل يوم من أيام الأسبوع لقضاء الحوائج والبركة',
      phrases: [
        { text: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَآلِ مُحَمَّدٍ', target: 100 },
        { text: 'يَا حَيُّ يَا قَيُّومُ', target: 100 },
        { text: 'يَا ذَا الْجَلالِ وَالإِكْرَامِ', target: 100 },
      ]
    },
    {
      id: 'istighfar',
      title: 'الاستغفار المبارك',
      description: 'أَسْتَغْفِرُ اللَّهَ رَبِّي وَأَتُوبُ إِلَيْهِ لمحو الذنوب وتوسيع الرزق',
      phrases: [
        { text: 'أَسْتَغْفِرُ اللَّهَ رَبِّي وَأَتُوبُ إِلَيْهِ', target: 70 },
      ]
    },
    {
      id: 'free',
      title: 'العداد المفتوح',
      description: 'تسبيح وذكر حر مفتوح لأي ورد تختاره',
      phrases: [
        { text: 'لا إِلَهَ إِلا اللَّهُ', target: 1000 },
      ]
    }
  ];

  const currentMode = modes.find(m => m.id === selectedModeId) || modes[0];
  const currentPhrase = currentMode.phrases[currentPhraseIndex];
  const progressPercent = Math.min(100, Math.round((count / currentPhrase.target) * 100));

  // Audio Click Generator via Web Audio API
  const playClickSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.04);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.06);
      }
    } catch {
      // Ignore
    }
  };

  const triggerHaptic = () => {
    if (hapticEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(25);
    }
  };

  const handleIncrement = () => {
    playClickSound();
    triggerHaptic();

    const nextCount = count + 1;
    setTotalSessionCount(prev => prev + 1);

    if (nextCount >= currentPhrase.target) {
      // Completed current phrase
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([40, 50, 40]);
      }

      if (currentPhraseIndex < currentMode.phrases.length - 1) {
        // Move to next phrase (e.g. from Allahu Akbar to Alhamdulillah)
        setCurrentPhraseIndex(prev => prev + 1);
        setCount(0);
      } else {
        // Completed whole tasbeeh sequence!
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });
        setCount(currentPhrase.target);
      }
    } else {
      setCount(nextCount);
    }
  };

  const handleReset = () => {
    setCount(0);
    setCurrentPhraseIndex(0);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header and Mode Selector */}
      <div className="text-center mb-8">
        <h2 className="font-amiri text-3xl font-bold text-emerald-950 dark:text-emerald-100 mb-2">
          السُّبْحَةُ الإِلِكْتْرُونِيَّةُ
        </h2>
        <p className="text-sm text-stone-600 dark:text-stone-400">
          اذكر الله في كل حين مع العداد التفاعلي لتسبيحة الزهراء وأذكار الأيام
        </p>

        {/* Mode switcher tabs */}
        <div className="flex items-center justify-center gap-2 mt-5 flex-wrap">
          {modes.map(mode => (
            <button
              key={mode.id}
              onClick={() => {
                setSelectedModeId(mode.id);
                setCount(0);
                setCurrentPhraseIndex(0);
              }}
              className={`px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-xl transition ${
                selectedModeId === mode.id
                  ? 'bg-emerald-800 text-white shadow-sm font-semibold'
                  : 'bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-slate-700'
              }`}
            >
              {mode.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Tasbeeh Card */}
      <div className="relative rounded-3xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 shadow-xl overflow-hidden p-6 sm:p-10 text-center">
        {/* Subtle Background Ornament */}
        <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-amber-400 via-emerald-600 to-amber-400" />

        {/* Current Phrase Title */}
        <div className="mb-6">
          <div className="text-xs text-amber-700 dark:text-amber-400 font-semibold mb-2">
            {currentMode.title} · الخطوة {currentPhraseIndex + 1} من {currentMode.phrases.length}
          </div>
          <h3 className="font-amiri text-3xl sm:text-4xl lg:text-5xl font-bold text-emerald-900 dark:text-emerald-100 tracking-wide select-none">
            {currentPhrase.text}
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-2">
            الهدف: {currentPhrase.target} مرة
          </p>
        </div>

        {/* Giant Interactive Circular Tap Area */}
        <div className="flex justify-center my-6">
          <button
            onClick={handleIncrement}
            className="group relative w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-gradient-to-br from-emerald-800 to-emerald-950 text-white shadow-2xl flex flex-col items-center justify-center p-6 border-4 border-amber-400/40 active:scale-95 transition-all cursor-pointer focus:outline-none"
          >
            {/* SVG Circular Progress Track */}
            <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="4"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="4"
                strokeDasharray="282.7"
                strokeDashoffset={282.7 - (282.7 * progressPercent) / 100}
                strokeLinecap="round"
                className="transition-all duration-150"
              />
            </svg>

            {/* Inner Counter Number */}
            <span className="font-mono text-5xl sm:text-6xl font-bold text-amber-300 tracking-tight drop-shadow-md">
              {count}
            </span>
            <span className="text-xs text-emerald-200/90 mt-2 font-medium">
              اضغط للتسبيح ({progressPercent}%)
            </span>
          </button>
        </div>

        {/* Tasbeeh sequence dots indicator */}
        <div className="flex justify-center items-center gap-2 mb-6">
          {currentMode.phrases.map((phrase, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition ${
                idx === currentPhraseIndex
                  ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40'
                  : idx < currentPhraseIndex
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                  : 'text-stone-400 bg-stone-100 dark:bg-slate-800'
              }`}
            >
              <span>{phrase.text}</span>
              <span className="font-mono">({phrase.target})</span>
            </div>
          ))}
        </div>

        {/* Utility actions: Reset, Sound, Haptic */}
        <div className="flex items-center justify-center gap-4 text-xs text-stone-600 dark:text-stone-400 pt-4 border-t border-stone-100 dark:border-slate-800">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-slate-800 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إعادة ضبط العداد</span>
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-slate-800 transition"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>صوت النقر: {soundEnabled ? 'مفعّل' : 'مكتوم'}</span>
          </button>

          <div className="font-mono">
            إجمالي التسابيح: {totalSessionCount}
          </div>
        </div>
      </div>
    </div>
  );
};
