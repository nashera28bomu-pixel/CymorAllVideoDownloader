# Cymor Bible v3.0 — upgrade package

I don't have your actual repo source (only your screenshots), so this is a
**drop-in supplement**, not a full replacement. It adds real multi-language
support and a much better reading experience, without touching
`audio.html`, `playlist.html`, `trivia.html`, `favorites.html`,
`prayer.html`, `admin.html`, or `/components` — I don't have those files to
safely merge into.

## What's new

- **5 real translations, fetched live, nothing fabricated.** English KJV and
  WEB (public domain), plus Kiswahili, Dholuo and Gĩkũyũ (Biblica Open
  License) — all pulled at read-time from
  [wldeh/bible-api](https://github.com/wldeh/bible-api), a free CDN mirror
  of public-domain/openly-licensed Bible text. **I deliberately did not
  write or paste in any scripture text myself** — for a Bible app, wrong
  wording from an AI's memory is a real problem, so every verse you see
  came from a verified source, not from me.
- **Parallel view** — read two translations side by side, verse by verse.
- **Highlights** (4 colors) and **private notes**, per verse, saved locally.
- **Adjustable text size** and **3 themes** (dark / light / sepia).
- **Offline reading** — every chapter you open is cached in `localStorage`,
  so it re-opens instantly and works with no connection afterward.
- **Search** — full-text search across all 31,102 KJV verses via a second
  free API (see "Known limitations" below for why it's KJV-only for now).
- **Share as image** — regenerated as a canvas-drawn share card (works for
  both full chapters and single verses now, not just chapter readings).

## Files in this package

```
index.html*          — reference only, see note below
bible.html            — REPLACES your existing bible.html
settings.html         — NEW page (link to it from your existing settings icon/nav)
manifest.json         — REPLACES yours (bumped to v3.0.0)
styles.css             — NEW shared stylesheet, used by bible.html + settings.html
css/reader.css         — NEW, reader-specific styles
css/settings.css       — NEW, settings-specific styles
js/bible-data.js       — NEW, the 66-book/chapter-count table (structural data only)
js/translations.js     — NEW, the 5-translation manifest + live fetch/cache layer
js/search.js           — NEW, KJV search
js/reader.js           — NEW, all reader logic
js/settings.js         — NEW, settings page logic
```

`index.html` in this package is **not meant to overwrite yours** — your
home screen already looks right in the screenshots. It's included only so
you can see the expected nav structure. Just confirm your existing Home's
"Bible" button links to `/bible.html`, and add a way to reach
`/settings.html` (your screenshot already shows a "Settings" button top
right — point it here).

## How to install (phone-first, GitHub mobile)

1. Open your `nashera28bomu-pixel` repo on GitHub mobile.
2. For each file listed above except `index.html`: use **Add file → Upload
   files** (or **Add file → Create new file** and paste contents) at the
   matching path, overwriting `bible.html` and `manifest.json`, adding the
   rest as new files.
3. Commit directly to your main branch (or a branch if you want to preview
   on Render first).
4. Redeploy on Render/Vercel — no build step, so this should just work.

## Known limitations (be upfront about these)

- **Search is KJV-only.** None of the other four translations have a free
  full-text search API available. If you want Swahili/Dholuo/Gikuyu search
  later, the realistic options are: (a) pre-index each translation's text
  into a small search JSON as you read chapters (crowd-sourced over time),
  or (b) self-host a search index — both are bigger projects than this
  upgrade.
- **Audio Bible stays English-only** for now — I didn't touch `audio.html`,
  and none of the free sources I found had synced audio for the new
  languages.
- **Book coverage varies by translation.** A few of the smaller-scope
  translations (e.g. some regional ones) may not include every book. The
  reader shows a clear message rather than a blank screen if a chapter
  isn't available in the selected translation.
- **Offline reading only covers chapters you've actually opened.** There's
  no "download the whole Bible" button in this version — that would mean
  thousands of requests against a free CDN, which isn't a great look for a
  shared free resource. If you want a real bulk-download/offline mode
  later, that's a good v3.1 candidate.

## If you want to add more languages later

Check `https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/bibles.json` for
the full list, and look at the `copyright` field for each entry before
adding it to `TRANSLATIONS` in `js/translations.js` — some entries on that
list are not actually free-to-use, only "downloadable." Public domain or an
explicit open license (like the Biblica Open ones used here) are the ones
that are safe to ship.
