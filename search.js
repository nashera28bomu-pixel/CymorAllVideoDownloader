// Full-text search. Currently backed by the JudeaSoftware KJV API
// (https://github.com/JudeaSoftware/kjv-bible-api) - free, keyless, CORS
// enabled, and covers all 31,102 KJV verses.
//
// KNOWN LIMITATION: this only searches the English KJV. None of the other
// four translations in this app expose a free full-text search endpoint,
// so search is disabled (with an explanatory note) when a non-KJV
// translation is active. See README-v3-upgrade.md, section "Known
// limitations", for options if you want to lift this later.

const SEARCH_API = 'https://judeasoftware.com/api/kjv/search.php';

async function searchKjv(query) {
  if (!query || query.trim().length < 2) return [];

  const url = `${SEARCH_API}?q=${encodeURIComponent(query.trim())}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Search failed (HTTP ${res.status})`);

  const data = await res.json();
  return (data.results || []).map((r) => ({
    reference: r.ref,
    book: r.book,
    chapter: r.chapter,
    verse: r.verse,
    text: r.text
  }));
}
