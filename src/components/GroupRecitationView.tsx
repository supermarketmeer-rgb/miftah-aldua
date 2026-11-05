import React, { useState } from 'react';
import { Users, Send, CheckCircle2, Plus, Sparkles, BookOpen, Share2, Award, ArrowLeft } from 'lucide-react';
import { Dua } from '../types';
import { generateDuaDeepLink, generateTelegramShareUrl } from '../utils/deepLink';
import confetti from 'canvas-confetti';

interface GroupRecitationSession {
  id: string;
  duaId: string;
  title: string;
  occasion: string;
  targetCount: number;
  currentCount: number;
  hasUserParticipated: boolean;
  notes?: string;
}

interface GroupRecitationViewProps {
  allDuas: Dua[];
  onSelectDua: (dua: Dua) => void;
}

export const GroupRecitationView: React.FC<GroupRecitationViewProps> = ({
  allDuas,
  onSelectDua,
}) => {
  const [sessions, setSessions] = useState<GroupRecitationSession[]>([
    {
      id: 'session-kumayl-juma',
      duaId: 'dua-kumayl',
      title: 'ختمة قراءة دعاء كميل ليلة الجمعة',
      occasion: 'ليلة الجمعة المباركة',
      targetCount: 40,
      currentCount: 28,
      hasUserParticipated: false,
      notes: 'نهدي ثواب هذه القراءة لسلامة وتعجيل فرج إمام زماننا (عج) وشفاء المرضى.'
    },
    {
      id: 'session-tawassul-wed',
      duaId: 'dua-tawassul',
      title: 'مجلس التوسل بالأئمة الأطهار لقضاء الحوائج',
      occasion: 'ليلة الأربعاء',
      targetCount: 14,
      currentCount: 14,
      hasUserParticipated: true,
      notes: 'توسل بالأئمة المعصومين الأربعة عشر لقضاء الحوائج المستعصية.'
    },
    {
      id: 'session-ashura-40',
      duaId: 'ziyarat-ashura',
      title: 'ختمة زيارة عاشوراء الأربعينية المباركة',
      occasion: 'مستمر يومياً',
      targetCount: 40,
      currentCount: 31,
      hasUserParticipated: false,
      notes: 'قراءة زيارة عاشوراء مع اللعن والسلام ودعاء علقمة.'
    },
    {
      id: 'session-kisa-family',
      duaId: 'hadith-kisa',
      title: 'قراءة حديث الكساء الشريف لنزول البركات',
      occasion: 'مجلس الأهل والمؤمنين',
      targetCount: 12,
      currentCount: 9,
      hasUserParticipated: false,
      notes: 'ونزلت عليهم الرحمة وحفت بهم الملائكة.'
    }
  ]);

  const [copiedSessionId, setCopiedSessionId] = useState<string | null>(null);

  const handleParticipate = (sessionId: string) => {
    setSessions(prev =>
      prev.map(s => {
        if (s.id === sessionId) {
          const newCount = s.hasUserParticipated ? s.currentCount - 1 : s.currentCount + 1;
          const nextParticipated = !s.hasUserParticipated;

          if (nextParticipated) {
            confetti({
              particleCount: 50,
              spread: 50,
              origin: { y: 0.7 }
            });
          }

          return {
            ...s,
            currentCount: Math.max(0, newCount),
            hasUserParticipated: nextParticipated
          };
        }
        return s;
      })
    );
  };

  const handleShareToTelegram = (session: GroupRecitationSession) => {
    const matchedDua = allDuas.find(d => d.id === session.duaId);
    const link = generateDuaDeepLink(matchedDua || session.duaId, 1);

    const message = [
      `🕊️ بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ`,
      `🕌 ${session.title}`,
      `✨ المناسبة: ${session.occasion}`,
      `👥 المشاركون حتى الآن: ${session.currentCount} من أصل ${session.targetCount}`,
      session.notes ? `📌 ${session.notes}` : '',
      ``,
      `📲 شارك معنا واقرأ الدعاء مباشرة عبر الرابط:`,
      link,
      ``,
      `«تطبيق كتاب الأدعية الشيعية - مفتاح الدعاء»`
    ].filter(Boolean).join('\n');

    const telegramUrl = generateTelegramShareUrl(link, message);
    window.open(telegramUrl, '_blank');
  };

  const handleCopyTelegramUpdate = (session: GroupRecitationSession) => {
    const matchedDua = allDuas.find(d => d.id === session.duaId);
    const link = generateDuaDeepLink(matchedDua || session.duaId, 1);
    const message = [
      `🕊️ بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ`,
      `🕌 ${session.title}`,
      `✨ المناسبة: ${session.occasion}`,
      `👥 المشاركون حتى الآن: ${session.currentCount} من ${session.targetCount}`,
      session.notes ? `📌 ${session.notes}` : '',
      ``,
      `📲 افتح الدعاء واستمع للتلاوة الصوتية:`,
      link
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(message);
    setCopiedSessionId(session.id);
    setTimeout(() => setCopiedSessionId(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-3">
          <Users className="w-4 h-4" />
          <span>التكامل مع مجموعات وقنوات Telegram</span>
        </div>
        <h2 className="font-amiri text-3xl font-bold text-emerald-950 dark:text-emerald-100 mb-2">
          القِرَاءَاتُ وَالخَتَمَاتُ الجَمَاعِيَّةُ
        </h2>
        <p className="text-sm text-stone-600 dark:text-stone-400 max-w-xl mx-auto leading-relaxed">
          نظّم مجالس القراءة والختمات مع أصدقائك ومجموعات Telegram، وتابع عداد المشاركين، واقرأ الدعاء متزامناً مع الجميع
        </p>
      </div>

      {/* Sessions Grid */}
      <div className="space-y-4">
        {sessions.map(session => {
          const matchedDua = allDuas.find(d => d.id === session.duaId);
          const percent = Math.min(100, Math.round((session.currentCount / session.targetCount) * 100));
          const isComplete = session.currentCount >= session.targetCount;

          return (
            <div
              key={session.id}
              className={`p-6 rounded-3xl border transition-all text-right ${
                session.hasUserParticipated
                  ? 'bg-gradient-to-br from-emerald-500/10 via-white to-white dark:from-emerald-950/30 dark:via-slate-900 dark:to-slate-900 border-emerald-600/40 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-stone-200/80 dark:border-slate-800 shadow-xs hover:border-emerald-500/40'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mb-1">
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">{session.occasion}</span>
                    <span aria-hidden="true">·</span>
                    <span>الهدف: {session.targetCount} مشارك</span>
                    {isComplete && (
                      <span className="text-amber-600 font-bold flex items-center gap-1 mr-1">
                        <Award className="w-3.5 h-3.5" />
                        <span>مكتملة بحمد الله</span>
                      </span>
                    )}
                  </div>
                  <h3 className="font-amiri text-xl font-bold text-emerald-950 dark:text-emerald-100">
                    {session.title}
                  </h3>
                  {session.notes && (
                    <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                      {session.notes}
                    </p>
                  )}
                </div>

                {/* Counter & Action */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleParticipate(session.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                      session.hasUserParticipated
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'border border-emerald-700 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{session.hasUserParticipated ? 'سُجلت مشاركتك' : 'سأشارك في القراءة'}</span>
                  </button>

                  {matchedDua && (
                    <button
                      onClick={() => onSelectDua(matchedDua)}
                      className="px-3.5 py-2 rounded-xl bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 text-stone-700 dark:text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition"
                      title="فتح الدعاء للقراءة"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                      <span>قراءة</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 mb-4">
                <div className="flex justify-between text-xs text-stone-500 font-mono">
                  <span>تم إنجاز: {session.currentCount} من {session.targetCount} مشاركة</span>
                  <span>{percent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-stone-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isComplete ? 'bg-amber-500' : 'bg-emerald-600'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              {/* Telegram Sharing Strip */}
              <div className="pt-3 border-t border-stone-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-stone-500 text-[11px]">
                  مشاركة وتحديث العداد في مجموعات Telegram:
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyTelegramUpdate(session)}
                    className="px-3 py-1.5 rounded-lg border border-stone-200 dark:border-slate-700 hover:bg-stone-100 dark:hover:bg-slate-800 text-stone-700 dark:text-stone-300 text-[11px] font-semibold transition"
                  >
                    {copiedSessionId === session.id ? 'تم نسخ التحديث' : 'نسخ نص التحديث'}
                  </button>

                  <button
                    onClick={() => handleShareToTelegram(session)}
                    className="px-3 py-1.5 rounded-lg bg-[#229ED9] hover:bg-[#1e8ec4] text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-xs transition"
                  >
                    <Send className="w-3 h-3 -rotate-45" />
                    <span>إرسال لمجموعة Telegram</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
