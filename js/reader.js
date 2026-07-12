(function () {
  const state = {
    translationId: getDefaultTranslationId(),
    parallelId: localStorage.getItem('cymorBible:parallelTranslation') || '',
    bookSlug: '',
    chapter: 1,
    fontStep: parseInt(localStorage.getItem('cymorBible:fontSize') || '2', 10),
    theme: localStorage.getItem('cymorBible:theme') || 'dark',
    activeVerse: null
  };

  const FONT_SIZES = [15, 17, 19, 21, 24]; // px, indexed by fontStep
  const THEMES = ['dark', 'light', 'sepia'];

  const el = (id) => document.getElementById(id);
  const bookSelect = el('book-select');
  const chapterSelect = el('chapter-select');
  const translationSelect = el('translation-select');
  const parallelSelect = el('parallel-translation-select');
  const readerMain = el('reader-main');

  function toast(msg) {
    const t = el('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2400);
  }

  function escapeHtml(str = '') {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  // ---------- Setup: dropdowns ----------
  function populateTranslationSelects() {
    [translationSelect, parallelSelect].forEach((select, isParallel) => {
      select.innerHTML = '';
      TRANSLATIONS.forEach((t) => {
        const opt = document.createElement('option');
        opt.value = t.id;
        opt.textContent = `${t.abbrev} — ${t.language}`;
        select.appendChild(opt);
      });
      select.value = isParallel ? (state.parallelId || TRANSLATIONS[1].id) : state.translationId;
    });
  }

  function populateBookSelect() {
    bookSelect.innerHTML = '';
    BIBLE_BOOKS.forEach((b) => {
      const opt = document.createElement('option');
      opt.value = b.slug;
      opt.textContent = b.name;
      bookSelect.appendChild(opt);
    });
  }

  function populateChapterSelect(bookSlug) {
    const book = BIBLE_BOOKS.find((b) => b.slug === bookSlug);
    chapterSelect.innerHTML = '';
    for (let i = 1; i <= (book?.chapters || 1); i++) {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = `Chapter ${i}`;
      chapterSelect.appendChild(opt);
    }
  }

  // ---------- Font & theme ----------
  function applyFontSize() {
    document.documentElement.style.setProperty('--reader-font-size', `${FONT_SIZES[state.fontStep]}px`);
    localStorage.setItem('cymorBible:fontSize', String(state.fontStep));
  }

  function applyTheme() {
    document.body.setAttribute('data-theme', state.theme);
    localStorage.setItem('cymorBible:theme', state.theme);
  }

  // ---------- Highlights & notes (localStorage) ----------
  function highlightKey(translationId, bookSlug, chapter, verse) {
    return `cymorBible:hl:${translationId}:${bookSlug}:${chapter}:${verse}`;
  }
  function noteKey(bookSlug, chapter, verse) {
    return `cymorBible:note:${bookSlug}:${chapter}:${verse}`;
  }

  function getHighlight(translationId, bookSlug, chapter, verse) {
    return localStorage.getItem(highlightKey(translationId, bookSlug, chapter, verse)) || 'none';
  }
  function setHighlight(translationId, bookSlug, chapter, verse, color) {
    const key = highlightKey(translationId, bookSlug, chapter, verse);
    if (color === 'none') localStorage.removeItem(key);
    else localStorage.setItem(key, color);
  }
  function getNote(bookSlug, chapter, verse) {
    return localStorage.getItem(noteKey(bookSlug, chapter, verse)) || '';
  }
  function setNote(bookSlug, chapter, verse, text) {
    const key = noteKey(bookSlug, chapter, verse);
    if (!text.trim()) localStorage.removeItem(key);
    else localStorage.setItem(key, text.trim());
  }

  // ---------- Rendering ----------
  function bookNameFromSlug(slug) {
    return BIBLE_BOOKS.find((b) => b.slug === slug)?.name || slug;
  }

  async function loadAndRenderChapter() {
    readerMain.innerHTML = '<div class="loading-state">Loading scripture…</div>';
    localStorage.setItem('cymorBible:lastLocation', JSON.stringify({ bookSlug: state.bookSlug, chapter: state.chapter }));

    try {
      const primary = await fetchChapter(state.translationId, state.bookSlug, state.chapter);
      let parallel = null;
      if (state.parallelId) {
        try {
          parallel = await fetchChapter(state.parallelId, state.bookSlug, state.chapter);
        } catch (err) {
          toast('Parallel translation unavailable for this chapter.');
        }
      }
      renderVerses(primary, parallel);
    } catch (err) {
      readerMain.innerHTML = `<div class="loading-state">Couldn't load this chapter right now. Check your connection and try again — some translations don't cover every book.</div>`;
      console.error('[reader] chapter load failed:', err);
    }
  }

  function renderVerses(primary, parallel) {
    const bookName = bookNameFromSlug(state.bookSlug);
    const translation = getTranslationById(state.translationId);

    const parallelMap = new Map();
    if (parallel) parallel.verses.forEach((v) => parallelMap.set(v.verse, v.text));

    const heading = `
      <div class="chapter-heading">
        <span class="eyebrow">Holy Scripture</span>
        <h2>${escapeHtml(bookName)} ${state.chapter}</h2>
        <span class="translation-badge">${translation.abbrev}${parallel ? ` + ${getTranslationById(state.parallelId).abbrev}` : ''}</span>
      </div>`;

    const versesHtml = primary.verses.map((v) => {
      const hl = getHighlight(state.translationId, state.bookSlug, state.chapter, v.verse);
      const hasNote = !!getNote(state.bookSlug, state.chapter, v.verse);
      const parallelText = parallelMap.get(v.verse);

      return `
        <div class="verse-block ${parallel ? 'verse-block--parallel' : ''}" data-verse="${v.verse}">
          <div class="verse-line hl-${hl}">
            <span class="verse-num">${v.verse}</span>
            <span class="verse-text">${escapeHtml(v.text)}</span>
            ${hasNote ? '<span class="note-dot" title="Has a note">●</span>' : ''}
          </div>
          ${parallel ? `<div class="verse-line verse-line--parallel">
            <span class="verse-num">${v.verse}</span>
            <span class="verse-text">${parallelText ? escapeHtml(parallelText) : '<em>Not available in this translation</em>'}</span>
          </div>` : ''}
        </div>`;
    }).join('');

    readerMain.innerHTML = heading + `<div class="verse-list">${versesHtml}</div>`;

    readerMain.querySelectorAll('.verse-block').forEach((elVerse) => {
      elVerse.addEventListener('click', () => openVerseSheet(parseInt(elVerse.dataset.verse, 10), primary));
    });
  }

  // ---------- Verse action sheet ----------
  function openVerseSheet(verseNum, chapterData) {
    const verse = chapterData.verses.find((v) => v.verse === verseNum);
    if (!verse) return;

    state.activeVerse = verseNum;
    el('verse-sheet-ref').textContent = `${bookNameFromSlug(state.bookSlug)} ${state.chapter}:${verseNum}`;
    el('verse-sheet-text').textContent = verse.text;
    el('verse-note-input').value = getNote(state.bookSlug, state.chapter, verseNum);

    const currentHl = getHighlight(state.translationId, state.bookSlug, state.chapter, verseNum);
    document.querySelectorAll('.swatch').forEach((sw) => {
      sw.classList.toggle('swatch--active', sw.dataset.color === currentHl);
    });

    el('verse-backdrop').classList.add('open');
    el('verse-sheet').classList.add('open');
  }

  function closeVerseSheet() {
    el('verse-backdrop').classList.remove('open');
    el('verse-sheet').classList.remove('open');
    state.activeVerse = null;
  }

  document.querySelectorAll('.swatch').forEach((sw) => {
    sw.addEventListener('click', () => {
      if (state.activeVerse == null) return;
      setHighlight(state.translationId, state.bookSlug, state.chapter, state.activeVerse, sw.dataset.color);
      document.querySelectorAll('.swatch').forEach((s) => s.classList.toggle('swatch--active', s === sw));
      loadAndRenderChapter();
    });
  });

  el('verse-note-save-btn').addEventListener('click', () => {
    if (state.activeVerse == null) return;
    setNote(state.bookSlug, state.chapter, state.activeVerse, el('verse-note-input').value);
    toast('Note saved.');
    loadAndRenderChapter();
  });

  el('verse-sheet-close-btn').addEventListener('click', closeVerseSheet);
  el('verse-backdrop').addEventListener('click', closeVerseSheet);

  // ---------- Controls wiring ----------
  translationSelect.addEventListener('change', () => {
    state.translationId = translationSelect.value;
    setDefaultTranslationId(state.translationId);
    loadAndRenderChapter();
  });

  el('parallel-toggle-btn').addEventListener('click', () => {
    const row = el('parallel-row');
    const nowOpen = row.hidden;
    row.hidden = !nowOpen;
    el('parallel-toggle-btn').setAttribute('aria-pressed', String(nowOpen));
    if (nowOpen) {
      state.parallelId = parallelSelect.value;
      localStorage.setItem('cymorBible:parallelTranslation', state.parallelId);
    } else {
      state.parallelId = '';
      localStorage.removeItem('cymorBible:parallelTranslation');
    }
    loadAndRenderChapter();
  });

  el('parallel-remove-btn').addEventListener('click', () => {
    el('parallel-row').hidden = true;
    el('parallel-toggle-btn').setAttribute('aria-pressed', 'false');
    state.parallelId = '';
    localStorage.removeItem('cymorBible:parallelTranslation');
    loadAndRenderChapter();
  });

  parallelSelect.addEventListener('change', () => {
    state.parallelId = parallelSelect.value;
    localStorage.setItem('cymorBible:parallelTranslation', state.parallelId);
    loadAndRenderChapter();
  });

  bookSelect.addEventListener('change', () => {
    state.bookSlug = bookSelect.value;
    state.chapter = 1;
    populateChapterSelect(state.bookSlug);
    chapterSelect.value = '1';
    loadAndRenderChapter();
  });

  chapterSelect.addEventListener('change', () => {
    state.chapter = parseInt(chapterSelect.value, 10);
    loadAndRenderChapter();
  });

  el('font-increase-btn').addEventListener('click', () => {
    state.fontStep = Math.min(state.fontStep + 1, FONT_SIZES.length - 1);
    applyFontSize();
  });
  el('font-decrease-btn').addEventListener('click', () => {
    state.fontStep = Math.max(state.fontStep - 1, 0);
    applyFontSize();
  });

  el('theme-cycle-btn').addEventListener('click', () => {
    const idx = THEMES.indexOf(state.theme);
    state.theme = THEMES[(idx + 1) % THEMES.length];
    applyTheme();
    toast(`Theme: ${state.theme}`);
  });

  // ---------- Save reading ----------
  el('save-reading-btn').addEventListener('click', () => {
    const saved = JSON.parse(localStorage.getItem('cymorBible:savedReadings') || '[]');
    saved.unshift({
      bookSlug: state.bookSlug,
      bookName: bookNameFromSlug(state.bookSlug),
      chapter: state.chapter,
      translationId: state.translationId,
      savedAt: new Date().toISOString()
    });
    localStorage.setItem('cymorBible:savedReadings', JSON.stringify(saved.slice(0, 200)));
    toast('Reading saved.');
  });

  // ---------- Share as image ----------
  function drawShareCanvas(refText, bodyText) {
    const canvas = el('share-canvas');
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    ctx.fillStyle = '#0B1220';
    ctx.fillRect(0, 0, W, H);
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, 'rgba(59,130,246,0.25)');
    grad.addColorStop(1, 'rgba(168,85,247,0.20)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#E6E9F5';
    ctx.textAlign = 'center';
    ctx.font = '600 34px Georgia, serif';
    ctx.fillText('CYMOR BIBLE', W / 2, 130);

    ctx.font = '400 44px Georgia, serif';
    wrapText(ctx, `"${bodyText}"`, W / 2, 420, W - 160, 58);

    ctx.font = '600 30px Georgia, serif';
    ctx.fillStyle = '#9AB6FF';
    ctx.fillText(refText, W / 2, H - 130);

    return canvas;
  }

  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    const lines = [];
    words.forEach((word) => {
      const test = line + word + ' ';
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word + ' ';
      } else {
        line = test;
      }
    });
    lines.push(line);

    const startY = y - ((lines.length - 1) * lineHeight) / 2;
    lines.forEach((l, i) => ctx.fillText(l.trim(), x, startY + i * lineHeight));
  }

  async function shareCanvasAsImage(canvas, filename) {
    canvas.hidden = false;
    canvas.toBlob(async (blob) => {
      canvas.hidden = true;
      if (!blob) return;
      const file = new File([blob], filename, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: 'Cymor Bible' });
          return;
        } catch (err) {
          // user cancelled or share failed - fall through to download
        }
      }

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      toast('Image saved to your downloads.');
    }, 'image/png');
  }

  el('share-image-btn').addEventListener('click', () => {
    const bookName = bookNameFromSlug(state.bookSlug);
    const firstFewVerses = readerMain.querySelectorAll('.verse-text');
    const preview = firstFewVerses[0]?.textContent || '';
    const canvas = drawShareCanvas(`${bookName} ${state.chapter}`, preview.slice(0, 220));
    shareCanvasAsImage(canvas, `cymor-bible-${state.bookSlug}-${state.chapter}.png`);
  });

  el('verse-share-btn').addEventListener('click', () => {
    if (state.activeVerse == null) return;
    const ref = `${bookNameFromSlug(state.bookSlug)} ${state.chapter}:${state.activeVerse}`;
    const text = el('verse-sheet-text').textContent;
    const canvas = drawShareCanvas(ref, text);
    shareCanvasAsImage(canvas, `cymor-bible-${state.bookSlug}-${state.chapter}-${state.activeVerse}.png`);
  });

  // ---------- Search ----------
  el('search-open-btn').addEventListener('click', () => { el('search-overlay').hidden = false; el('search-input').focus(); });
  el('search-close-btn').addEventListener('click', () => { el('search-overlay').hidden = true; });

  let searchDebounce;
  el('search-input').addEventListener('input', (e) => {
    clearTimeout(searchDebounce);
    const q = e.target.value;
    searchDebounce = setTimeout(() => runSearch(q), 350);
  });

  async function runSearch(query) {
    const resultsEl = el('search-results');
    if (!query || query.trim().length < 2) {
      resultsEl.innerHTML = '';
      return;
    }
    resultsEl.innerHTML = '<div class="loading-state">Searching…</div>';
    try {
      const results = await searchKjv(query);
      if (results.length === 0) {
        resultsEl.innerHTML = '<div class="loading-state">No matches found.</div>';
        return;
      }
      resultsEl.innerHTML = results.slice(0, 40).map((r) => `
        <button class="search-result" data-book="${escapeHtml(r.book)}" data-chapter="${r.chapter}" data-verse="${r.verse}">
          <span class="search-result-ref">${escapeHtml(r.reference)}</span>
          <span class="search-result-text">${escapeHtml(r.text)}</span>
        </button>`).join('');

      resultsEl.querySelectorAll('.search-result').forEach((btn) => {
        btn.addEventListener('click', () => {
          const bookMatch = BIBLE_BOOKS.find((b) => b.name.toLowerCase() === btn.dataset.book.toLowerCase());
          if (!bookMatch) { toast("Couldn't open that book automatically."); return; }
          state.translationId = 'en-kjv';
          translationSelect.value = 'en-kjv';
          state.bookSlug = bookMatch.slug;
          bookSelect.value = bookMatch.slug;
          populateChapterSelect(bookMatch.slug);
          state.chapter = parseInt(btn.dataset.chapter, 10);
          chapterSelect.value = String(state.chapter);
          el('search-overlay').hidden = true;
          loadAndRenderChapter();
        });
      });
    } catch (err) {
      resultsEl.innerHTML = '<div class="loading-state">Search is temporarily unavailable.</div>';
    }
  }

  // ---------- Init ----------
  function init() {
    populateTranslationSelects();
    populateBookSelect();

    if (state.parallelId) {
      el('parallel-row').hidden = false;
      el('parallel-toggle-btn').setAttribute('aria-pressed', 'true');
    }

    const lastLocation = JSON.parse(localStorage.getItem('cymorBible:lastLocation') || 'null');
    const params = new URLSearchParams(window.location.search);
    const qBook = params.get('book');
    const qChapter = params.get('chapter');

    state.bookSlug = qBook || lastLocation?.bookSlug || 'genesis';
    state.chapter = parseInt(qChapter || lastLocation?.chapter || 1, 10);

    bookSelect.value = state.bookSlug;
    populateChapterSelect(state.bookSlug);
    chapterSelect.value = String(state.chapter);

    applyFontSize();
    applyTheme();
    loadAndRenderChapter();
  }

  init();
})();
