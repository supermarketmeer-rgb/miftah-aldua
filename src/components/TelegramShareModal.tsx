import React, { useState } from 'react';
import {
  X,
  Share2,
  Send,
  Copy,
  Check,
  Volume2,
  Users,
  Smartphone,
  Wifi,
  MessageCircle,
  ExternalLink
} from 'lucide-react';
import { Dua } from '../types';
import {
  getCleanDuaLink,
  generateTelegramShareUrl,
  generateWhatsAppShareUrl,
  formatTelegramGroupInvitation,
  formatDuaShareMessage,
  getDuaSlug
} from '../utils/deepLink';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface TelegramShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  dua: Dua;
  currentPage?: number;
  currentReciterId?: string;
  onOpenGroupRecitation?: (dua: Dua) => void;
}

export const TelegramShareModal: React.FC<TelegramShareModalProps> = ({
  isOpen,
  onClose,
  dua,
  currentPage = 1,
  currentReciterId = 'abathar',
  onOpenGroupRecitation,
}) => {
  const isOnline = useOnlineStatus();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedFullText, setCopiedFullText] = useState(false);
  const [copiedAudioLink, setCopiedAudioLink] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'link' | 'text' | 'group'>('link');

  if (!isOpen) return null;

  // Shortened permanent link without Gmail or GitHub names
  const deepLink = getCleanDuaLink(dua);
  const { shareMessage } = formatDuaShareMessage(dua, currentPage);

  // Sharing URLs
  const telegramShareUrl = generateTelegramShareUrl(deepLink, shareMessage);
  const whatsappShareUrl = generateWhatsAppShareUrl(shareMessage);

  // Audio track URL
  const audioTrack = dua.audioTracks[currentReciterId] || Object.values(dua.audioTracks)[0];
  const audioUrl = audioTrack?.url || '';

  // Copy direct link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(deepLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Copy full message with link
  const handleCopyFormattedMessage = () => {
    navigator.clipboard.writeText(shareMessage);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Native share sheet (Android / iOS)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: dua.title,
          // Crucial: URL must be included inside text so WhatsApp and messaging apps render it as a clickable link!
          text: shareMessage,
          url: deepLink,
        });
      } catch {
        // User dismissed
      }
    } else {
      handleCopyFormattedMessage();
    }
  };

  // Copy full Dua text formatted for messaging
  const handleCopyFullText = () => {
    const formattedHeader = `بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ\n✤ ${dua.title} ✤\n[${dua.source}]\n\n`;
    const fullBody = dua.verses.map(v => v.textAr).join('\n\n');
    const footer = `\n\n${dua.title}\n${deepLink}`;

    navigator.clipboard.writeText(formattedHeader + fullBody + footer);
    setCopiedFullText(true);
    setTimeout(() => setCopiedFullText(false), 2000);
  };

  // Copy Audio Link
  const handleCopyAudioLink = () => {
    if (!audioUrl) return;
    navigator.clipboard.writeText(audioUrl);
    setCopiedAudioLink(true);
    setTimeout(() => setCopiedAudioLink(false), 2000);
  };

  // Copy Group Invitation
  const { fullMessageText, link: inviteLink } = formatTelegramGroupInvitation(dua, currentPage);
  const handleCopyInvite = () => {
    navigator.clipboard.writeText(fullMessageText);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  const whatsappInviteUrl = generateWhatsAppShareUrl(fullMessageText);
  const telegramInviteUrl = generateTelegramShareUrl(inviteLink, fullMessageText);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 text-right max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-slate-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-amiri text-xl font-bold text-emerald-950 dark:text-emerald-100">
                مشاركة الدعاء والرابط المباشر
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {dua.title} · الصفحة {currentPage}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 dark:bg-slate-800 rounded-xl mb-5 text-xs font-medium">
          <button
            onClick={() => setSelectedTab('link')}
            className={`flex-1 py-1.5 rounded-lg transition ${
              selectedTab === 'link'
                ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-xs font-semibold'
                : 'text-stone-600 dark:text-stone-400'
            }`}
          >
            رابط مختصر ومباشر
          </button>
          <button
            onClick={() => setSelectedTab('text')}
            className={`flex-1 py-1.5 rounded-lg transition ${
              selectedTab === 'text'
                ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-xs font-semibold'
                : 'text-stone-600 dark:text-stone-400'
            }`}
          >
            نص الدعاء كاملاً
          </button>
          <button
            onClick={() => setSelectedTab('group')}
            className={`flex-1 py-1.5 rounded-lg transition ${
              selectedTab === 'group'
                ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-xs font-semibold'
                : 'text-stone-600 dark:text-stone-400'
            }`}
          >
            دعوة لقراءة جماعية
          </button>
        </div>

        {/* Tab 1: Direct Link & Social Share */}
        {selectedTab === 'link' && (
          <div className="space-y-4 text-xs">
            {/* Primary Action Buttons: WhatsApp & Telegram */}
            <div className="space-y-2">
              <a
                href={whatsappShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-semibold text-sm flex items-center justify-center gap-2.5 shadow-md transition active:scale-[0.98]"
              >
                <MessageCircle className="w-5 h-5 fill-white text-[#25D366]" />
                <span>إرسال عبر واتساب (رابط فوري قابل للتشغيل)</span>
              </a>

              <a
                href={telegramShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-2xl bg-[#229ED9] hover:bg-[#1e8ec4] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.98]"
              >
                <Send className="w-4 h-4 -rotate-45" />
                <span>إرسال عبر تيليغرام (Telegram)</span>
              </a>

              <button
                onClick={handleNativeShare}
                className="w-full py-2.5 px-4 rounded-xl border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 hover:bg-stone-100 dark:hover:bg-slate-700 text-stone-800 dark:text-stone-200 font-medium flex items-center justify-center gap-2 transition"
              >
                <Share2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span>مشاركة عبر قائمة الهاتف (تطبيقات أخرى)</span>
              </button>
            </div>

            {/* Permanent Link Box */}
            <div className="pt-2">
              <label className="block text-stone-600 dark:text-stone-400 font-semibold mb-1">
                الرابط المختصر باسم الدعاء:
              </label>
              <div className="flex items-center gap-2 p-2 rounded-xl border border-emerald-500/30 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20">
                <input
                  type="text"
                  readOnly
                  value={deepLink}
                  className="flex-1 text-[11px] font-mono text-emerald-900 dark:text-emerald-200 truncate focus:outline-none text-left bg-transparent select-all"
                  dir="ltr"
                />
                <button
                  onClick={handleCopyLink}
                  className="p-1.5 px-2.5 rounded-lg bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50 text-xs shrink-0 flex items-center gap-1 font-semibold transition"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'تم النسخ' : 'نسخ الرابط'}</span>
                </button>
              </div>
            </div>

            {/* Audio Stream Link */}
            {audioUrl && (
              <div className="pt-2 border-t border-stone-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>رابط التسجيل الصوتي المباشر:</span>
                </span>
                <button
                  onClick={handleCopyAudioLink}
                  className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
                >
                  {copiedAudioLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAudioLink ? 'تم نسخ رابط الصوت' : 'نسخ رابط الصوت'}</span>
                </button>
              </div>
            )}

            {/* Technical clarification */}
            <div className="p-3 rounded-2xl bg-stone-50 dark:bg-slate-800/60 border border-stone-200/60 dark:border-slate-700/60 text-[11px] text-stone-500 dark:text-stone-400 space-y-1">
              <div className="flex items-center gap-1 font-semibold text-stone-700 dark:text-stone-300">
                <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                <span>كيف يعمل هذا الرابط؟</span>
              </div>
              <p>
                • الرابط مختصر ومكتوب باسم الدعاء (<strong>{getDuaSlug(dua)}</strong>) ليظهر كرابط إلكتروني أزرق قابل للنقر مباشرة في واتساب وتيليغرام.
              </p>
              <p>
                • عند الضغط عليه، يفتح الدعاء مباشرة في التطبيق أو المتصفح في نفس الصفحة المحددة.
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Full text copy */}
        {selectedTab === 'text' && (
          <div className="space-y-4 text-xs">
            <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
              يمكنك نسخ نص الدعاء كاملًا مرفقاً بالرابط المباشر لمشاركته في المجموعات والمحادثات:
            </p>

            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-slate-800 border border-stone-200/60 dark:border-slate-700 max-h-48 overflow-y-auto font-amiri text-sm leading-relaxed text-stone-800 dark:text-stone-200">
              <div className="font-bold text-amber-700 dark:text-amber-400 mb-1">
                بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ — {dua.title}
              </div>
              {dua.verses.slice(0, 3).map(v => (
                <p key={v.id} className="mb-2">«{v.textAr}»</p>
              ))}
              <div className="text-stone-400 text-xs">... ويستمر الدعاء بإجمالي {dua.verses.length} فقرة.</div>
            </div>

            <button
              onClick={handleCopyFullText}
              className="w-full py-3 px-4 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold flex items-center justify-center gap-2 shadow-sm transition"
            >
              {copiedFullText ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>تم نسخ نص الدعاء مع الرابط للحافظة!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>نسخ نص الدعاء كاملاً مع الرابط المباشر</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Tab 3: Group Recitation Invitation */}
        {selectedTab === 'group' && (
          <div className="space-y-4 text-xs">
            <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
              قم بإنشاء دعوة للقراءة الجماعية أو الختمة وأرسلها مباشرة إلى مجموعتك على WhatsApp أو Telegram:
            </p>

            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-stone-800 dark:text-stone-200 font-mono text-[11px] whitespace-pre-line leading-relaxed text-right">
              {fullMessageText}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={handleCopyInvite}
                className="py-2.5 px-3 rounded-xl border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 hover:bg-stone-100 text-stone-800 dark:text-stone-200 font-semibold flex items-center justify-center gap-1.5 transition"
              >
                {copiedInvite ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedInvite ? 'تم النسخ' : 'نسخ الدعوة'}</span>
              </button>

              <a
                href={whatsappInviteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-semibold flex items-center justify-center gap-1.5 shadow-sm transition"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-white text-[#25D366]" />
                <span>واتساب</span>
              </a>

              <a
                href={telegramInviteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-xl bg-[#229ED9] hover:bg-[#1e8ec4] text-white font-semibold flex items-center justify-center gap-1.5 shadow-sm transition"
              >
                <Send className="w-3.5 h-3.5 -rotate-45" />
                <span>تيليغرام</span>
              </a>
            </div>

            {onOpenGroupRecitation && (
              <div className="pt-2 border-t border-stone-100 dark:border-slate-800 text-center">
                <button
                  onClick={() => {
                    onClose();
                    onOpenGroupRecitation(dua);
                  }}
                  className="text-emerald-800 dark:text-emerald-300 font-bold hover:underline inline-flex items-center gap-1"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>فتح لوحة القراءة والختمات الجماعية التفاعلية</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Offline Disclaimer Banner */}
        {!isOnline && (
          <div className="mt-4 p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-[11px] text-amber-900 dark:text-amber-300 flex items-center gap-2">
            <Wifi className="w-3.5 h-3.5 shrink-0" />
            <span>
              أنت حالياً في وضع عدم الاتصال؛ نصوص الأدعية محفوظة لديك، بينما تتطلب مشاركة الروابط مع التطبيقات توفر اتصال بالإنترنت.
            </span>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-6 w-full py-2.5 rounded-xl bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 dark:hover:bg-slate-700 text-stone-800 dark:text-stone-200 font-medium text-xs transition"
        >
          إغلاق
        </button>
      </div>
    </div>
  );
};
