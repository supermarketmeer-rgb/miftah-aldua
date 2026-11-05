import React, { useState } from 'react';
import { X, Copy, Check, Share2, MessageCircle, Send } from 'lucide-react';
import { Verse, Dua } from '../types';
import { generateDuaDeepLink, generateWhatsAppShareUrl, generateTelegramShareUrl } from '../utils/deepLink';

interface ShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  verse: Verse | null;
  dua: Dua | null;
}

export const ShareCardModal: React.FC<ShareCardModalProps> = ({
  isOpen,
  onClose,
  verse,
  dua,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen || !verse || !dua) return null;

  const shortLink = generateDuaDeepLink(dua);
  const fullShareText = `«${verse.textAr}»\n\n— من: ${dua.title}\n— المصدر: ${dua.source}\n\n📲 رابط فتح الدعاء والاستماع مباشرة:\n${shortLink}\n\n— تطبيق مفتاح الدعاء`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullShareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `مفتاح الدعاء - ${dua.title}`,
          text: fullShareText,
          url: shortLink,
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopy();
    }
  };

  const whatsappUrl = generateWhatsAppShareUrl(fullShareText);
  const telegramUrl = generateTelegramShareUrl(shortLink, `«${verse.textAr}»\n— ${dua.title}`);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 shadow-2xl p-6 text-right">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-slate-800 mb-4">
          <h3 className="font-amiri text-lg font-bold text-emerald-950 dark:text-emerald-100">
            مشاركة قبس من الدعاء
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* The Visual Islamic Card */}
        <div className="relative rounded-2xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-stone-900 text-amber-100 p-6 sm:p-8 border-2 border-amber-400/40 shadow-xl overflow-hidden mb-4 text-center">
          <div className="absolute top-2 right-2 text-amber-400/30 text-xs">✤</div>
          <div className="absolute top-2 left-2 text-amber-400/30 text-xs">✤</div>
          <div className="absolute bottom-2 right-2 text-amber-400/30 text-xs">✤</div>
          <div className="absolute bottom-2 left-2 text-amber-400/30 text-xs">✤</div>

          <div className="text-[11px] text-amber-300/80 mb-3 font-semibold">
            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
          </div>

          <p className="font-amiri text-lg sm:text-xl font-bold leading-relaxed text-white mb-4 select-text">
            «{verse.textAr}»
          </p>

          <div className="pt-3 border-t border-amber-400/20 text-xs text-amber-200/90 flex flex-col items-center justify-center gap-1">
            <span className="font-bold">{dua.title}</span>
            <span className="text-[10px] text-emerald-200/70">{dua.source}</span>
          </div>
        </div>

        {/* Link preview badge */}
        <div className="mb-4 p-2 rounded-xl bg-stone-50 dark:bg-slate-800 border border-stone-200/70 dark:border-slate-700 text-[11px] flex items-center justify-between gap-2">
          <span className="text-stone-500 dark:text-stone-400 font-mono text-[10px] truncate" dir="ltr">
            {shortLink}
          </span>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold shrink-0">
            رابط مختصر مباشر
          </span>
        </div>

        {/* Quick Share Buttons (WhatsApp & Telegram) */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition"
          >
            <MessageCircle className="w-4 h-4 fill-white text-[#25D366]" />
            <span>واتساب (WhatsApp)</span>
          </a>
          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 px-3 rounded-xl bg-[#229ED9] hover:bg-[#1e8ec4] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition"
          >
            <Send className="w-3.5 h-3.5 -rotate-45" />
            <span>تيليغرام (Telegram)</span>
          </a>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleCopy}
            className="py-2.5 px-3 rounded-xl border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 hover:bg-stone-100 dark:hover:bg-slate-700 text-stone-800 dark:text-stone-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>تم نسخ الرابط والنص!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>نسخ النص مع الرابط</span>
              </>
            )}
          </button>

          <button
            onClick={handleNativeShare}
            className="py-2.5 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition"
          >
            <Share2 className="w-4 h-4" />
            <span>مشاركة عبر الهاتف</span>
          </button>
        </div>
      </div>
    </div>
  );
};
