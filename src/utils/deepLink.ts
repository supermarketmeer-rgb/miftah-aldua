import type { Dua, Verse } from '../types';

export interface DeepLinkParams {
  duaId?: string;
  page?: number;
  verseId?: number;
  reciterId?: string;
  groupId?: string;
  roomId?: string;
}

/**
 * Standard friendly Arabic slugs for all Duas and Ziyarats
 * Provides shortened, beautiful links with the exact name of the Dua
 */
export const DUA_SLUGS: Record<string, string> = {
  'dua-saturday': 'دعاء_السبت',
  'dua-sunday': 'دعاء_الأحد',
  'dua-monday': 'دعاء_الاثنين',
  'dua-tuesday': 'دعاء_الثلاثاء',
  'dua-wednesday': 'دعاء_الأربعاء',
  'dua-thursday': 'دعاء_الخميس',
  'dua-friday': 'دعاء_الجمعة',
  'dua-kumayl': 'دعاء_كميل',
  'kumayl': 'دعاء_كميل',
  'dua-tawassul': 'دعاء_التوسل',
  'tawassul': 'دعاء_التوسل',
  'dua-nudba': 'دعاء_الندبة',
  'nudba': 'دعاء_الندبة',
  'nudbah': 'دعاء_الندبة',
  'dua-simat': 'دعاء_السمات',
  'samaat': 'دعاء_السمات',
  'dua-iftitah': 'دعاء_الافتتاح',
  'iftitah': 'دعاء_الافتتاح',
  'dua-sahar': 'دعاء_السحر',
  'sehar': 'دعاء_السحر',
  'dua-rajab': 'دعاء_رجب',
  'munajat-shabaniyah': 'المناجاة_الشعبانية',
  'dua-arafah': 'دعاء_عرفة',
  'dua-ahd': 'دعاء_العهد',
  'ahad': 'دعاء_العهد',
  'dua-faraj': 'دعاء_الفرج',
  'faraj': 'دعاء_الفرج',
  'dua-sabah': 'دعاء_الصباح',
  'sabah': 'دعاء_الصباح',
  'dua-mujir': 'دعاء_مجير',
  'mujeer': 'دعاء_مجير',
  'ziyarat-ashura': 'زيارة_عاشوراء',
  'ashura': 'زيارة_عاشوراء',
  'ziyarat-al-yasin': 'زيارة_آل_ياسين',
  'alyasin': 'زيارة_آل_ياسين',
  'hadith-kisa': 'حديث_الكساء',
  'kisaa': 'حديث_الكساء',
};

/**
 * Normalizes Arabic text by removing diacritics (tashkeel), unifying hamzas and letters,
 * and turning underscores and hyphens into spaces.
 */
export function normalizeArabicText(str: string): string {
  if (!str) return '';
  return str
    .replace(/[\u064B-\u065F\u0670]/g, '') // remove Arabic diacritics / tashkeel
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[_\-+]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Gets a clean, concise Arabic slug representing the Dua
 */
export function getDuaSlug(dua: Dua | string): string {
  if (typeof dua === 'string') {
    return DUA_SLUGS[dua] || dua.replace(/\s+/g, '_');
  }

  if (DUA_SLUGS[dua.id]) {
    return DUA_SLUGS[dua.id];
  }

  // Derive a clean slug from the title (strip brackets, extra words, etc.)
  const cleanTitle = normalizeArabicText(dua.title)
    .replace(/[()«»]/g, '')
    .trim();
  const words = cleanTitle.split(' ').slice(0, 3);
  return words.join('_') || dua.id;
}

/**
 * Returns the canonical base URL for deep links.
 * Avoids localhost, 127.0.0.1, or capacitor:// so that links shared
 * to WhatsApp / Telegram can be recognized as valid clickable hyperlinks.
 */
export function getAppBaseUrl(): string {
  if (typeof window !== 'undefined') {
    // 1. Check if user configured a custom domain in localStorage
    try {
      const customDomain = localStorage.getItem('miftah_custom_share_domain');
      if (customDomain && customDomain.trim().startsWith('http')) {
        return customDomain.trim().replace(/\/+$/, '');
      }
    } catch {
      // LocalStorage not available
    }

    const origin = window.location.origin;
    const hostname = window.location.hostname;

    // Detect if running inside Capacitor Android APK, file://, localhost, or private dev server
    const isLocalOrInternal =
      !origin ||
      origin.startsWith('capacitor:') ||
      origin.startsWith('file:') ||
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.endsWith('.local') ||
      /^10\.|^172\.(1[6-9]|2[0-9]|3[0-1])\.|^192\.168\./.test(hostname);

    // If running on a live public domain (e.g. Vercel, Netlify, custom domain), use it
    if (!isLocalOrInternal && origin.startsWith('http')) {
      const pathname = window.location.pathname === '/' ? '' : window.location.pathname.replace(/\/+$/, '');
      return `${origin}${pathname}`;
    }
  }

  // Public web domain for the app hosted on GitHub Pages
  return 'https://supermarketmeer-rgb.github.io/miftah-aldua';
}

/**
 * Generates a shortened, clickable URL for a specific Dua with its Arabic name
 * Example: https://miftah-duas.app/?dua=دعاء_كميل
 */
export function generateDuaDeepLink(
  duaOrId: string | Dua,
  page: number = 1,
  reciterId?: string
): string {
  const base = getAppBaseUrl();
  const slug = typeof duaOrId === 'string'
    ? (DUA_SLUGS[duaOrId] || duaOrId)
    : getDuaSlug(duaOrId);

  try {
    const url = new URL(base);
    url.searchParams.set('dua', slug);
    if (page > 1) {
      url.searchParams.set('p', page.toString());
    }
    if (reciterId && reciterId !== 'abathar') {
      url.searchParams.set('reciter', reciterId);
    }
    return url.toString();
  } catch {
    // Fallback if URL parsing fails
    const pageParam = page > 1 ? `&p=${page}` : '';
    return `${base}/?dua=${encodeURIComponent(slug)}${pageParam}`;
  }
}

/**
 * Finds a Dua from the collection matching an ID, slug, title, or Arabic keyword
 */
export function findDuaMatch(duas: Dua[], query: string): Dua | undefined {
  if (!query) return undefined;
  const decodedQuery = decodeURIComponent(query).trim();

  // 1. Exact ID match
  const byId = duas.find(d => d.id === decodedQuery);
  if (byId) return byId;

  // 2. Slug dictionary match
  for (const [id, slug] of Object.entries(DUA_SLUGS)) {
    if (
      slug === decodedQuery ||
      slug.replace(/_/g, '-') === decodedQuery ||
      slug.replace(/_/g, ' ') === decodedQuery
    ) {
      const found = duas.find(d => d.id === id);
      if (found) return found;
    }
  }

  // 3. Normalized Title Matching
  const normQuery = normalizeArabicText(decodedQuery);
  if (!normQuery) return undefined;

  // Exact title match
  const exactTitle = duas.find(d => normalizeArabicText(d.title) === normQuery);
  if (exactTitle) return exactTitle;

  // Title includes query (e.g. query "دعاء كميل" inside "دعاء كميل بن زياد")
  const containsTitle = duas.find(d => normalizeArabicText(d.title).includes(normQuery));
  if (containsTitle) return containsTitle;

  // Query includes title
  const reverseTitle = duas.find(d => normQuery.includes(normalizeArabicText(d.title)));
  if (reverseTitle) return reverseTitle;

  // Match significant keyword (e.g. "كميل", "التوسل", "عاشوراء", "الندبة")
  const keywords = normQuery
    .split(' ')
    .filter(w => w.length > 2 && w !== 'دعاء' && w !== 'زيارة' && w !== 'يوم');

  if (keywords.length > 0) {
    const keywordMatch = duas.find(d => {
      const normTitle = normalizeArabicText(d.title);
      return keywords.some(k => normTitle.includes(k));
    });
    if (keywordMatch) return keywordMatch;
  }

  return undefined;
}

/**
 * Parses deep link parameters from current browser URL.
 * Handles:
 * - ?dua=دعاء_كميل or ?d=دعاء_كميل
 * - #دعاء_كميل or #dua=دعاء_كميل
 * - /d/دعاء_كميل
 */
export function parseCurrentDeepLink(): DeepLinkParams | null {
  if (typeof window === 'undefined') return null;

  try {
    const searchParams = new URLSearchParams(window.location.search);
    const rawHash = window.location.hash.replace(/^#\/?/, '');
    const hashParams = new URLSearchParams(rawHash);

    // 1. Check query parameters
    let duaQuery =
      searchParams.get('dua') ||
      searchParams.get('d') ||
      hashParams.get('dua') ||
      hashParams.get('d');

    // 2. Check hash directly (e.g. #دعاء_كميل or #kumayl)
    if (!duaQuery && rawHash && !rawHash.includes('=')) {
      duaQuery = rawHash;
    }

    // 3. Check path directly (e.g. /d/دعاء_كميل)
    if (!duaQuery) {
      const pathParts = window.location.pathname.split('/').filter(Boolean);
      const dIndex = pathParts.findIndex(p => p === 'd' || p === 'dua');
      if (dIndex !== -1 && pathParts[dIndex + 1]) {
        duaQuery = pathParts[dIndex + 1];
      }
    }

    const pageStr =
      searchParams.get('p') ||
      searchParams.get('page') ||
      hashParams.get('p') ||
      hashParams.get('page');

    const verseStr =
      searchParams.get('v') ||
      searchParams.get('verse') ||
      hashParams.get('v') ||
      hashParams.get('verse');

    const reciterId =
      searchParams.get('reciter') ||
      searchParams.get('r') ||
      hashParams.get('reciter') ||
      undefined;

    const groupId =
      searchParams.get('group') ||
      searchParams.get('g') ||
      hashParams.get('group') ||
      undefined;

    const roomId =
      searchParams.get('room') ||
      searchParams.get('voice') ||
      hashParams.get('room') ||
      hashParams.get('voice') ||
      undefined;

    if (!duaQuery && !groupId && !roomId) return null;

    return {
      duaId: duaQuery ? decodeURIComponent(duaQuery) : undefined,
      page: pageStr ? parseInt(pageStr, 10) : 1,
      verseId: verseStr ? parseInt(verseStr, 10) : undefined,
      reciterId,
      groupId,
      roomId
    };
  } catch {
    return null;
  }
}

/**
 * Creates WhatsApp share URL with pre-filled message text including the clickable link
 */
export function generateWhatsAppShareUrl(text: string): string {
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}

/**
 * Clean, short, permanent URLs without any Gmail username or GitHub name
 */
export const DUA_CLEAN_SHORT_LINKS: Record<string, string> = {
  'dua-kumayl': 'https://is.gd/miftah_kumayl',
  'kumayl': 'https://is.gd/miftah_kumayl',
  'dua-tawassul': 'https://is.gd/miftah_tawassul',
  'tawassul': 'https://is.gd/miftah_tawassul',
  'ziyarat-ashura': 'https://is.gd/miftah_ashura',
  'ashura': 'https://is.gd/miftah_ashura',
  'dua-nudba': 'https://is.gd/miftah_nudba',
  'nudba': 'https://is.gd/miftah_nudba',
  'nudbah': 'https://is.gd/miftah_nudba',
  'dua-simat': 'https://is.gd/miftah_simat',
  'samaat': 'https://is.gd/miftah_simat',
  'dua-iftitah': 'https://is.gd/miftah_iftitah',
  'iftitah': 'https://is.gd/miftah_iftitah',
  'dua-sahar': 'https://is.gd/miftah_sahar',
  'sehar': 'https://is.gd/miftah_sahar',
  'dua-rajab': 'https://is.gd/miftah_rajab',
  'munajat-shabaniyah': 'https://is.gd/miftah_shaban',
  'dua-arafah': 'https://is.gd/miftah_arafah',
  'dua-ahd': 'https://is.gd/miftah_ahd',
  'ahad': 'https://is.gd/miftah_ahd',
  'dua-faraj': 'https://is.gd/miftah_faraj',
  'faraj': 'https://is.gd/miftah_faraj',
  'dua-sabah': 'https://is.gd/miftah_sabah',
  'sabah': 'https://is.gd/miftah_sabah',
  'dua-mujir': 'https://is.gd/miftah_mujir',
  'mujeer': 'https://is.gd/miftah_mujir',
  'ziyarat-al-yasin': 'https://is.gd/miftah_alyasin',
  'alyasin': 'https://is.gd/miftah_alyasin',
  'hadith-kisa': 'https://is.gd/miftah_kisa',
  'kisaa': 'https://is.gd/miftah_kisa',
  'dua-saturday': 'https://is.gd/miftah_sabt',
  'dua-sunday': 'https://is.gd/miftah_ahad_day',
  'dua-monday': 'https://is.gd/miftah_ithnayn',
  'dua-tuesday': 'https://is.gd/miftah_thulatha',
  'dua-wednesday': 'https://is.gd/miftah_arbaa',
  'dua-thursday': 'https://is.gd/miftah_khamis',
  'dua-friday': 'https://is.gd/miftah_jumua',
};

/**
 * Gets clean short link free from Gmail handle and GitHub domain
 */
export function getCleanDuaLink(duaOrId: string | Dua): string {
  const id = typeof duaOrId === 'string' ? duaOrId : duaOrId.id;
  if (DUA_CLEAN_SHORT_LINKS[id]) {
    return DUA_CLEAN_SHORT_LINKS[id];
  }
  return generateDuaDeepLink(duaOrId, 1);
}

/**
 * Creates Telegram Web and App share URL
 */
export function generateTelegramShareUrl(url: string, text: string): string {
  return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
}

/**
 * Generates a Live Voice Recitation invitation link with room ID
 */
export function generateLiveVoiceShareLink(duaOrId: string | Dua, roomId: string): string {
  const baseLink = generateDuaDeepLink(duaOrId, 1);
  try {
    const url = new URL(baseLink);
    url.searchParams.set('room', roomId);
    return url.toString();
  } catch {
    return `${baseLink}&room=${roomId}`;
  }
}

/**
 * Formats a Live Voice Recitation invitation message for WhatsApp and Telegram
 * Polished, spiritual invitation without Gmail or GitHub names
 */
export function formatLiveVoiceInvitation(dua: Dua, roomId: string, customShortUrl?: string): {
  link: string;
  shareMessage: string;
} {
  const link = customShortUrl || generateLiveVoiceShareLink(dua, roomId);
  const shareMessage = [
    `🕊️ بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ`,
    `🎙️ نَدْعُوكُمْ لِلاِشْتِرَاكِ مَعَنَا فِي قِرَاءَةِ «${dua.title}» صَوْتِيّاً وَمُبَاشَرَةً`,
    dua.occasion ? `✨ المناسبة: ${dua.occasion}` : '',
    dua.source ? `📚 المصدر: ${dua.source}` : '',
    ``,
    `📲 اضغط هنا للانضمام إلى القراءة الصوتية المباشرة فوراً:`,
    link,
    ``,
    `📌 (يفتح الدعاء مباشرة أمامكم مع إمكانية القراءة بالصوت أو الاستماع)`,
    `«تطبيق مفتاح الدعاء»`
  ].filter(Boolean).join('\n');

  return { link, shareMessage };
}

/**
 * Formats a prayer invitation / sharing text with the clean shortened link
 */
export function formatDuaShareMessage(dua: Dua, page: number = 1): {
  link: string;
  shareMessage: string;
} {
  const link = getCleanDuaLink(dua);
  const shareMessage = [
    `🕊️ بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ`,
    `📖 نَدْعُوكُمْ لِلاِشْتِرَاكِ مَعَنَا فِي قِرَاءَةِ «${dua.title}»`,
    dua.occasion ? `✨ المناسبة: ${dua.occasion}` : '',
    dua.source ? `📚 المصدر: ${dua.source}` : '',
    ``,
    `📲 رابط فتح واستماع الدعاء مباشرة:`,
    link,
    ``,
    `«تطبيق مفتاح الدعاء - كتاب الأدعية والزيارات»`
  ].filter(Boolean).join('\n');

  return { link, shareMessage };
}

/**
 * Formats a prayer invitation for Telegram & WhatsApp groups
 */
export function formatTelegramGroupInvitation(
  dua: Dua,
  page: number = 1,
  groupNote?: string
): { shareUrl: string; fullMessageText: string; link: string } {
  const { link, shareMessage } = formatDuaShareMessage(dua, page);

  const lines = [
    `🕊️ بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ`,
    `📖 نَدْعُوكُمْ لِقِرَاءَةِ «${dua.title}» جَمَاعِيّاً`,
    dua.occasion ? `✨ المُنَاسَبَة: ${dua.occasion}` : '',
    dua.source ? `📚 المَصْدَر: ${dua.source}` : '',
    groupNote ? `📌 مُلاحظة: ${groupNote}` : '',
    ``,
    `📲 افتح الدعاء واستمع للتلاوة الصوتية المتزامنة مباشرة عبر الرابط:`,
    link,
    ``,
    `«تطبيق كتاب الأدعية الشيعية - مفتاح الدعاء»`
  ].filter(Boolean);

  const fullMessageText = lines.join('\n');
  const shareUrl = generateTelegramShareUrl(link, `📖 قراءة مباركة: ${dua.title}\n${dua.occasion}`);

  return { shareUrl, fullMessageText, link };
}

/**
 * Splits text into chunks conforming to Telegram's 4096 character limit
 */
export function splitDuaForTelegram(verses: Verse[], maxChars: number = 3800): string[] {
  const chunks: string[] = [];
  let currentChunk = '';

  for (const v of verses) {
    const addition = `${v.textAr}\n\n`;
    if (currentChunk.length + addition.length > maxChars && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = addition;
    } else {
      currentChunk += addition;
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}
