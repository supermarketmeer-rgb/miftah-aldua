import React, { useState } from 'react';
import { X, Plus, BookOpen, AlertCircle } from 'lucide-react';
import { Dua, DuaCategory, Verse } from '../types';

interface AddDuaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDua: (dua: Dua) => void;
}

export const AddDuaModal: React.FC<AddDuaModalProps> = ({
  isOpen,
  onClose,
  onAddDua,
}) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState<DuaCategory>('year');
  const [occasion, setOccasion] = useState('');
  const [source, setSource] = useState('');
  const [fullText, setFullText] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !fullText.trim()) {
      setError('يرجى كتابة عنوان الدعاء ونصه كاملاً.');
      return;
    }

    // Split text into stanzas/verses by double newlines or full stops
    const lines = fullText
      .split(/\n\n+|\n/)
      .map(l => l.trim())
      .filter(l => l.length > 0);

    const verses: Verse[] = lines.map((text, idx) => ({
      id: idx + 1,
      textAr: text,
      timingSec: idx * 10,
    }));

    const newDua: Dua = {
      id: `custom_${Date.now()}`,
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      category,
      occasion: occasion.trim() || 'دعاء مبارك',
      source: source.trim() || 'كتاب الأدعية',
      fullText: fullText.trim(),
      verses,
      audioTracks: audioUrl ? {
        custom: {
          url: audioUrl.trim(),
          durationSec: verses.length * 10
        }
      } : {
        abathar: {
          url: '',
          durationSec: verses.length * 10
        }
      },
      estimatedMinutes: Math.max(1, Math.ceil(verses.length / 3)),
      isCustom: true
    };

    onAddDua(newDua);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 text-right max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-slate-800 mb-5">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-700" />
            <h3 className="font-amiri text-2xl font-bold text-emerald-950 dark:text-emerald-100">
              إضافة دعاء جديد للكتاب
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
              عنوان الدعاء *
            </label>
            <input
              type="text"
              required
              placeholder="مثال: دعاء يستشير / مناجاة التائبين..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-emerald-700 text-right"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                القسم / التصنيف
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DuaCategory)}
                className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-emerald-700 text-right"
              >
                <option value="days">أدعية الأيام</option>
                <option value="week">أدعية الأسبوع</option>
                <option value="months">أدعية الأشهر</option>
                <option value="year">أدعية السنة والمناسبات</option>
                <option value="ziyarat">الزيارات الشريفة</option>
                <option value="munajat">المناجاة</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                المصدر الموثوق (اسم الكتاب)
              </label>
              <input
                type="text"
                placeholder="مفاتيح الجنان / الصحيفة السجادية..."
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-emerald-700 text-right"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
              المناسبة أو وقت القراءة المستحب
            </label>
            <input
              type="text"
              placeholder="مثال: ليلة النصف من شعبان / كل صباح..."
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-emerald-700 text-right"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
              نص الدعاء كاملاً (افصل بين الفقرات بسطر فارغ) *
            </label>
            <textarea
              required
              rows={6}
              placeholder="اكتب أو الصق نص الدعاء هنا بالتشكيل أو بدونه..."
              value={fullText}
              onChange={(e) => setFullText(e.target.value)}
              className="w-full p-3 rounded-xl border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-emerald-700 text-right font-amiri leading-relaxed"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
              رابط التسجيل الصوتي (اختياري)
            </label>
            <input
              type="url"
              placeholder="https://example.com/audio.mp3"
              value={audioUrl}
              onChange={(e) => setAudioUrl(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-emerald-700 text-left font-mono"
            />
          </div>

          <div className="pt-3 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-stone-200 dark:border-slate-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-slate-800 font-medium"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>حفظ الدعاء</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
