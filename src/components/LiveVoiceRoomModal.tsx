import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  PhoneOff,
  Users,
  Share2,
  Copy,
  Check,
  Minimize2,
  Maximize2,
  Volume2,
  Radio,
  Sparkles,
  MessageCircle,
  Send,
  AlertCircle
} from 'lucide-react';
import { Dua } from '../types';
import {
  liveVoiceEngine,
  LiveVoiceState
} from '../utils/liveVoiceEngine';
import {
  formatLiveVoiceInvitation,
  generateWhatsAppShareUrl,
  generateTelegramShareUrl
} from '../utils/deepLink';

interface LiveVoiceRoomModalProps {
  dua: Dua;
  initialRoomId?: string;
  isJoiningDirectly?: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export const LiveVoiceRoomModal: React.FC<LiveVoiceRoomModalProps> = ({
  dua,
  initialRoomId,
  isJoiningDirectly = false,
  isOpen,
  onClose,
}) => {
  const [voiceState, setVoiceState] = useState<LiveVoiceState>({
    status: 'idle',
    isHost: false,
    roomId: '',
    isMuted: false,
    isRemoteMuted: false,
    isLocalSpeaking: false,
    isRemoteSpeaking: false,
    localVolume: 0,
    remoteVolume: 0,
    remoteConnected: false,
  });

  const [isMinimized, setIsMinimized] = useState<boolean>(Boolean(initialRoomId || isJoiningDirectly));
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [shortRoomLink, setShortRoomLink] = useState<string>('');

  useEffect(() => {
    const unsubscribe = liveVoiceEngine.subscribe((state) => {
      setVoiceState(state);
    });
    return () => unsubscribe();
  }, []);

  // Initialize room on open if not already active
  useEffect(() => {
    if (isOpen && voiceState.status === 'idle') {
      if (initialRoomId) {
        liveVoiceEngine.joinRoom(initialRoomId).catch(() => {});
      } else {
        const roomSlug = dua.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8);
        liveVoiceEngine.startRoom(`miftah-${roomSlug}-${Math.random().toString(36).substring(2, 7)}`).catch(() => {});
      }
    }
  }, [isOpen, initialRoomId, dua.id]);

  // Generate dynamic clean short link (via is.gd) without exposing github/gmail
  useEffect(() => {
    const activeRoomId = voiceState.roomId || initialRoomId;
    if (!activeRoomId) return;

    let isMounted = true;
    const longLink = generateLiveVoiceShareLink(dua, activeRoomId);

    fetch(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(longLink)}`)
      .then(res => res.text())
      .then(text => {
        if (isMounted && text && text.startsWith('https://is.gd/')) {
          setShortRoomLink(text.trim());
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [dua, voiceState.roomId, initialRoomId]);

  if (!isOpen) return null;

  const { link: shareLink, shareMessage } = formatLiveVoiceInvitation(
    dua,
    voiceState.roomId || initialRoomId || '',
    shortRoomLink || undefined
  );
  const whatsappUrl = generateWhatsAppShareUrl(shareMessage);
  const telegramUrl = generateTelegramShareUrl(shareLink, `🎙️ دعوة للاشتراك بقراءة «${dua.title}» مباشرة`);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleToggleMute = () => {
    liveVoiceEngine.toggleMute();
  };

  const handleEndCall = () => {
    liveVoiceEngine.leaveRoom();
    onClose();
  };

  // -------------------------------------------------------------
  // MINIMIZED FLOATING STRIP (Allows comfortable reading of Dua)
  // -------------------------------------------------------------
  if (isMinimized) {
    return (
      <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 animate-in fade-in slide-in-from-bottom-4">
        <div className="rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-stone-900 text-white p-3.5 shadow-2xl border-2 border-emerald-500/40 backdrop-blur-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            {/* Live Pulsing Dot */}
            <span className="relative flex h-3 w-3 shrink-0">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                voiceState.remoteConnected ? 'bg-emerald-400' : 'bg-amber-400'
              }`} />
              <span className={`relative inline-flex rounded-full h-3 w-3 ${
                voiceState.remoteConnected ? 'bg-emerald-500' : 'bg-amber-500'
              }`} />
            </span>

            <div className="truncate text-right">
              <div className="text-xs font-bold text-amber-200 truncate flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span>قراءة صوتية مباشرة</span>
              </div>
              <div className="text-[10px] text-stone-300 truncate">
                {voiceState.remoteConnected
                  ? voiceState.isRemoteSpeaking
                    ? 'الطرف الآخر يقرأ بصوته الآن 🔊'
                    : voiceState.isLocalSpeaking
                      ? 'أنت تقرأ الآن 🎙️'
                      : 'متصلان معاً جاهزان للقراءة'
                  : 'بانتظار انضمام الطرف الآخر...'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Mute Button */}
            <button
              onClick={handleToggleMute}
              className={`p-2 rounded-xl transition ${
                voiceState.isMuted
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}
              title={voiceState.isMuted ? 'إلغاء كتم المايك' : 'كتم المايك'}
            >
              {voiceState.isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Expand Modal */}
            <button
              onClick={() => setIsMinimized(false)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 transition"
              title="تكبير اللوحة"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* End Call */}
            <button
              onClick={handleEndCall}
              className="p-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition"
              title="إنهاء المكالمة"
            >
              <PhoneOff className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // FULL MODAL VIEW
  // -------------------------------------------------------------
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 text-right max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-slate-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-amiri text-xl font-bold text-emerald-950 dark:text-emerald-100">
                القراءة الصوتية المشتركة (مباشر)
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {dua.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1.5 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-slate-800 transition"
              title="تصغير اللوحة ومتابعة قراءة الدعاء"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Hero Card */}
        <div className="relative rounded-2xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-stone-900 text-white p-5 sm:p-6 border border-emerald-500/30 shadow-lg text-center mb-5 overflow-hidden">
          <div className="relative z-10 space-y-3">
            {/* Connection Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold">
              <span className={`w-2 h-2 rounded-full ${
                voiceState.status === 'connected' ? 'bg-emerald-400 animate-ping' :
                voiceState.status === 'connecting' || voiceState.status === 'waiting' ? 'bg-amber-400 animate-pulse' :
                voiceState.status === 'error' ? 'bg-rose-400' : 'bg-stone-400'
              }`} />
              <span>
                {voiceState.status === 'connected' ? 'متصلان صوتياً بنجاح' :
                 voiceState.status === 'waiting' ? 'الغرفة جاهزة · بانتظار انضمام الطرف الآخر' :
                 voiceState.status === 'connecting' ? 'جارٍ الاتصال بالطرف الآخر...' :
                 voiceState.status === 'initializing' ? 'جارٍ تهيئة المايكروفون والغرفة...' :
                 voiceState.status === 'error' ? 'تنبيه الاتصال' : 'جاهز'}
              </span>
            </div>

            {/* Central Speaking Indicator / Dynamic Wave Visualizer */}
            <div className="py-2 flex items-center justify-center gap-1 h-14">
              {[0.4, 0.7, 1, 0.6, 0.9, 0.5, 0.8, 1, 0.6, 0.4].map((multiplier, i) => {
                const height = voiceState.isLocalSpeaking
                  ? Math.max(8, (voiceState.localVolume * multiplier * 0.5))
                  : voiceState.isRemoteSpeaking
                    ? Math.max(8, (voiceState.remoteVolume * multiplier * 0.5))
                    : 6;

                return (
                  <span
                    key={i}
                    style={{ height: `${height}px` }}
                    className={`w-1 rounded-full transition-all duration-100 ${
                      voiceState.isLocalSpeaking
                        ? 'bg-emerald-400'
                        : voiceState.isRemoteSpeaking
                          ? 'bg-amber-400'
                          : 'bg-white/20'
                    }`}
                  />
                );
              })}
            </div>

            {/* Speaking Status Text */}
            <div className="text-xs font-amiri font-bold text-amber-200">
              {voiceState.isRemoteSpeaking
                ? 'الطرف الآخر يقرأ بصوته الآن وأنت تستمع 🔊'
                : voiceState.isLocalSpeaking
                  ? 'أنت تقرأ بصوتك الآن والطرف الآخر يستمع 🎙️'
                  : voiceState.remoteConnected
                    ? 'الخط الصوتي مفتوح ومباشر — تفضل بالقراءة'
                    : 'شارك الرابط بالأسفل مع من ترغب بالقراءة معه'}
            </div>
          </div>
        </div>

        {/* Error notification banner if any */}
        {voiceState.errorMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{voiceState.errorMessage}</span>
          </div>
        )}

        {/* Controls Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {/* Mute Toggle Button */}
          <button
            onClick={handleToggleMute}
            className={`py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.98] ${
              voiceState.isMuted
                ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                : 'bg-emerald-800 hover:bg-emerald-900 text-white'
            }`}
          >
            {voiceState.isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            <span>{voiceState.isMuted ? 'المايك مكتوم (تشغيل)' : 'المايك يعمل (كتم)'}</span>
          </button>

          {/* End Call Button */}
          <button
            onClick={handleEndCall}
            className="py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.98]"
          >
            <PhoneOff className="w-4 h-4" />
            <span>إنهاء المكالمة</span>
          </button>
        </div>

        {/* Share Invitation Section */}
        <div className="p-4 rounded-2xl bg-stone-50 dark:bg-slate-800/60 border border-stone-200/70 dark:border-slate-700/70 space-y-3 mb-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>رابط دعوة الطرف الآخر للقراءة الصوتية:</span>
            </span>
            <span className="text-[10px] text-stone-500 font-mono">
              غرفة: {voiceState.roomId || initialRoomId}
            </span>
          </div>

          {/* Link box with copy */}
          <div className="flex items-center gap-2 p-2 rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <input
              type="text"
              readOnly
              value={shareLink}
              className="flex-1 text-[11px] font-mono text-stone-700 dark:text-stone-300 truncate focus:outline-none text-left bg-transparent"
              dir="ltr"
            />
            <button
              onClick={handleCopyLink}
              className="p-1.5 px-2.5 rounded-lg bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 text-xs font-semibold shrink-0 flex items-center gap-1 transition"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'تم النسخ' : 'نسخ'}</span>
            </button>
          </div>

          {/* Direct WhatsApp & Telegram Invite Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-white text-[#25D366]" />
              <span>إرسال عبر واتساب</span>
            </a>

            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-3 rounded-xl bg-[#229ED9] hover:bg-[#1e8ec4] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition"
            >
              <Send className="w-3.5 h-3.5 -rotate-45" />
              <span>إرسال عبر تيليغرام</span>
            </a>
          </div>
        </div>

        {/* Read Dua While Connected Button */}
        <button
          onClick={() => setIsMinimized(true)}
          className="w-full py-2.5 px-4 rounded-xl border border-emerald-600/30 bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 text-emerald-900 dark:text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition"
        >
          <Minimize2 className="w-4 h-4" />
          <span>تصغير اللوحة ومتابعة قراءة وتقليب صفحات الدعاء معاً</span>
        </button>
      </div>
    </div>
  );
};

