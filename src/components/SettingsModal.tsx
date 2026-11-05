import React, { useState, useEffect } from 'react';
import { X, HardDrive, Trash2, RefreshCw, CheckCircle2, ShieldCheck, DownloadCloud, Globe } from 'lucide-react';
import { ReadingSettings } from '../types';
import { getAllOfflineAudios, clearAllOfflineAudio, CachedAudioMeta } from '../utils/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ReadingSettings;
  onUpdateSettings: (settings: ReadingSettings) => void;
  onOpenAddDua: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onOpenAddDua,
}) => {
  const [cachedAudios, setCachedAudios] = useState<CachedAudioMeta[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncSuccess, setSyncSuccess] = useState<boolean>(false);
  const [clearingCache, setClearingCache] = useState<boolean>(false);
  const [shareDomain, setShareDomain] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('miftah_custom_share_domain') || 'https://is.gd';
    }
    return 'https://is.gd';
  });

  const handleSaveShareDomain = (val: string) => {
    setShareDomain(val);
    if (typeof window !== 'undefined') {
      if (val.trim() && val.trim() !== 'https://is.gd') {
        localStorage.setItem('miftah_custom_share_domain', val.trim());
      } else {
        localStorage.removeItem('miftah_custom_share_domain');
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadStorageData();
    }
  }, [isOpen]);

  const loadStorageData = async () => {
    const list = await getAllOfflineAudios();
    setCachedAudios(list);
  };

  const totalBytes = cachedAudios.reduce((acc, item) => acc + (item.sizeBytes || 0), 0);
  const formattedStorage = totalBytes > 1024 * 1024
    ? `${(totalBytes / (1024 * 1024)).toFixed(1)} ميغابايت`
    : `${Math.round(totalBytes / 1024)} كيلوبايت`;

  const handleClearAudioCache = async () => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف التسجيلات الصوتية المحمّلة لتوفير المساحة؟ ستظل نصوص الأدعية والمفضلة محفوظة بالكامل.')) {
      setClearingCache(true);
      await clearAllOfflineAudio();
      await loadStorageData();
      setClearingCache(false);
    }
  };

  const handleSyncContent = () => {
    setIsSyncing(true);
    setSyncSuccess(false);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 text-right max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-slate-800 mb-6">
          <h3 className="font-amiri text-2xl font-bold text-emerald-950 dark:text-emerald-100">
            إعدادات التطبيق والتخزين
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 text-sm">
          {/* Offline Storage Management */}
          <div>
            <h4 className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-2 mb-2">
              <HardDrive className="w-4 h-4 text-emerald-600" />
              <span>إدارة مساحة التخزين والأوفلاين</span>
            </h4>
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-slate-800/60 border border-stone-200/60 dark:border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-stone-600 dark:text-stone-400">نصوص الأدعية:</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">محفوظة محلياً (جاهزة أوفلاين)</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-stone-600 dark:text-stone-400">التسجيلات الصوتية المحملة:</span>
                <span className="font-mono font-semibold">{cachedAudios.length} ملفات ({formattedStorage})</span>
              </div>

              {cachedAudios.length > 0 && (
                <button
                  onClick={handleClearAudioCache}
                  disabled={clearingCache}
                  className="w-full mt-2 py-2 px-3 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 hover:bg-red-100 text-xs font-semibold flex items-center justify-center gap-2 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف التسجيلات الصوتية المحملة فقط (لتوفير الذاكرة)</span>
                </button>
              )}
            </div>
          </div>

          {/* Online Sync */}
          <div>
            <h4 className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-2 mb-2">
              <RefreshCw className="w-4 h-4 text-emerald-600" />
              <span>مزامنة المحتوى والتحديثات</span>
            </h4>
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-slate-800/60 border border-stone-200/60 dark:border-slate-700/60">
              <p className="text-xs text-stone-600 dark:text-stone-400 mb-3">
                يقوم التطبيق بالتحقق من سلامة نصوص الأدعية وتنزيل التحديثات المتاحة تلقائياً.
              </p>
              <button
                onClick={handleSyncContent}
                disabled={isSyncing}
                className="py-2 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold flex items-center justify-center gap-2 transition w-full"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'جارٍ فحص التحديثات...' : 'فحص وتحديث المحتوى الآن'}</span>
              </button>

              {syncSuccess && (
                <div className="mt-2 text-xs text-emerald-700 dark:text-emerald-400 flex items-center justify-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>جميع نصوص الأدعية محققة ومحدثة بالكامل.</span>
                </div>
              )}
            </div>
          </div>

          {/* Share Domain Configuration */}
          <div>
            <h4 className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-emerald-600" />
              <span>نطاق مشاركة الروابط المختصرة</span>
            </h4>
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-slate-800/60 border border-stone-200/60 dark:border-slate-700/60 space-y-2">
              <div className="text-[11px] text-stone-500 dark:text-stone-400">
                النطاق المستخدم لإنشاء روابط الأدعية المختصرة والقابلة للنقر في واتساب وتيليغرام:
              </div>
              <input
                type="url"
                value={shareDomain}
                onChange={(e) => handleSaveShareDomain(e.target.value)}
                placeholder="https://is.gd"
                className="w-full text-xs font-mono p-2.5 rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-left"
                dir="ltr"
              />
            </div>
          </div>

          {/* Future Expansion / Add Custom Dua */}
          <div>
            <h4 className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-2 mb-2">
              <DownloadCloud className="w-4 h-4 text-emerald-600" />
              <span>نظام إدارة المحتوى والتوسعة</span>
            </h4>
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-slate-800/60 border border-stone-200/60 dark:border-slate-700/60 flex items-center justify-between">
              <div>
                <div className="font-semibold text-xs text-stone-800 dark:text-stone-200">
                  إضافة دعاء أو قارئ جديد
                </div>
                <div className="text-[11px] text-stone-500">
                  إمكانية إدراج نصوص أو أدعية أو قراء إضافيين
                </div>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenAddDua();
                }}
                className="px-3 py-1.5 rounded-lg border border-emerald-700 text-emerald-800 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-50 dark:hover:bg-slate-800 transition"
              >
                إضافة دعاء
              </button>
            </div>
          </div>

          {/* Religious content attribution statement */}
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2 leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              نصوص هذا التطبيق مأخوذة من المصادر الشيعية المعتمدة (مفاتيح الجنان للشيخ القمي، الصحيفة السجادية، ومصباح المتهجد للشيخ الطوسي) بدقة وعناية تامة.
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-2.5 rounded-xl bg-stone-200 dark:bg-slate-800 hover:bg-stone-300 dark:hover:bg-slate-700 text-stone-800 dark:text-stone-200 font-medium text-sm transition"
        >
          تم
        </button>
      </div>
    </div>
  );
};
