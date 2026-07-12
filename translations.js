// Cymor Bible v3 - translation manifest
//
// IMPORTANT: this app does not ship any Bible text. Every verse is fetched
// live, at read time, from the wldeh/bible-api CDN (a free, keyless mirror
// of public-domain and openly-licensed Bible translations):
//   https://github.com/wldeh/bible-api
// Chapters are cached in localStorage after first load so re-reading is
// instant and works offline once a chapter has been opened before.
//
// Every id below was verified against the CDN's own bibles.json listing
// before being added here - do not add a translation id without checking
// https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/bibles.json first,
// since not every version on that list is actually public-domain/open -
// check the "copyright" field for each entry.

const TRANSLATIONS = [
  {
    id: 'en-kjv',
    label: 'King James Version',
    abbrev: 'KJV',
    language: 'English',
    languageCode: 'en',
    license: 'Public Domain'
  },
  {
    id: 'en-web',
    label: 'World English Bible',
    abbrev: 'WEB',
    language: 'English (modern)',
    languageCode: 'en',
    license: 'Public Domain'
  },
  {
    id: 'swh-onen',
    label: 'Biblica Open Kiswahili Contemporary (Neno)',
    abbrev: 'NENO',
    language: 'Kiswahili',
    languageCode: 'sw',
    license: 'Biblica Open License'
  },
  {
    id: 'luo-onlt',
    label: 'Biblica Open New Luo Translation',
    abbrev: 'DHOLUO',
    language: 'Dholuo',
    languageCode: 'luo',
    license: 'Biblica Open License'
  },
  {
    id: 'ki-kgnk',
    label: 'Biblica Open Kikuyu Holy Word of God',
    abbrev: 'GIKUYU',
    language: 'Gĩkũyũ',
    languageCode: 'ki',
    license: 'Biblica Open License'
  }
];

const CDN_BASE = 'https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles';
const CACHE_PREFIX = 'cymorBible:chapter:';
const CACHE_VERSION = 'v3';

function chapterCacheKey(translationId, bookSlug, chapter) {
  return `${CACHE_PREFIX}${CACHE_VERSION}:${translationId}:${bookSlug}:${chapter}`;
}

function getDefaultTranslationId() {
  return localStorage.getItem('cymorBible:translation') || 'en-kjv';
}

function setDefaultTranslationId(id) {
  localStorage.setItem('cymorBible:translation', id);
}

function getTranslationById(id) {
  return TRANSLATIONS.find((t) => t.id === id) || TRANSLATIONS[0];
}

/**
 * Fetches a full chapter (all verses) for a given translation/book/chapter.
 * Tries the primary book slug, then any fallback slugs. Reads from the
 * localStorage cache first; only hits the network on a cache miss.
 * Returns { reference, translation, verses: [{verse, text}] } or throws.
 */
async function fetchChapter(translationId, bookSlug, chapterNum) {
  const cacheKey = chapterCacheKey(translationId, bookSlug, chapterNum);
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (err) {
      localStorage.removeItem(cacheKey); // corrupted cache entry, ignore and refetch
    }
  }

  const slugsToTry = [bookSlug, ...(BOOK_SLUG_FALLBACKS[bookSlug] || [])];
  let lastError = null;

  for (const slug of slugsToTry) {
    try {
      const url = `${CDN_BASE}/${translationId}/books/${slug}/chapters/${chapterNum}.json`;
      const res = await fetch(url);
      if (!res.ok) {
        lastError = new Error(`HTTP ${res.status} for ${slug} ${chapterNum}`);
        continue;
      }
      const data = await res.json();

      // The CDN's chapter shape has varied slightly across versions in the
      // wild, so normalize defensively rather than assuming one exact shape.
      const verses = (data.verses || data.data || []).map((v, i) => ({
        verse: v.verse || v.number || i + 1,
        text: (v.text || v.verse_text || '').trim()
      })).filter((v) => v.text);

      if (verses.length === 0) {
        lastError = new Error(`Empty chapter for ${slug} ${chapterNum}`);
        continue;
      }

      const result = { bookSlug: slug, chapter: chapterNum, translationId, verses };
      localStorage.setItem(cacheKey, JSON.stringify(result));
      return result;
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('Chapter fetch failed');
}

/** Clears every cached chapter (used by Settings > "Free up storage"). */
function clearChapterCache() {
  Object.keys(localStorage)
    .filter((k) => k.startsWith(CACHE_PREFIX))
    .forEach((k) => localStorage.removeItem(k));
}

function estimateCacheSizeKb() {
  let total = 0;
  Object.keys(localStorage)
    .filter((k) => k.startsWith(CACHE_PREFIX))
    .forEach((k) => { total += (localStorage.getItem(k) || '').length; });
  return Math.round(total / 1024);
}
