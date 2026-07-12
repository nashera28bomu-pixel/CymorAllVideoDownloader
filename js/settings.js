(function () {
  const el = (id) => document.getElementById(id);

  function toast(msg) {
    const t = el('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2200);
  }

  // Default translation
  const translationSelect = el('default-translation-select');
  TRANSLATIONS.forEach((t) => {
    const opt = document.createElement('option');
    opt.value = t.id;
    opt.textContent = `${t.label} (${t.language})`;
    translationSelect.appendChild(opt);
  });
  translationSelect.value = getDefaultTranslationId();
  translationSelect.addEventListener('change', () => {
    setDefaultTranslationId(translationSelect.value);
    toast('Default translation updated.');
  });

  // Theme
  const theme = localStorage.getItem('cymorBible:theme') || 'dark';
  document.querySelectorAll('#theme-segmented button').forEach((btn) => {
    btn.setAttribute('aria-pressed', String(btn.dataset.theme === theme));
    btn.addEventListener('click', () => {
      localStorage.setItem('cymorBible:theme', btn.dataset.theme);
      document.querySelectorAll('#theme-segmented button').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      toast('Theme updated — applies next time you open the reader.');
    });
  });

  // Cache size
  function refreshCacheHint() {
    const kb = estimateCacheSizeKb();
    el('cache-size-hint').textContent = kb > 0
      ? `You have about ${kb} KB of scripture cached for offline reading.`
      : 'No scripture cached yet — chapters you read are saved automatically for offline access.';
  }
  refreshCacheHint();

  el('clear-cache-btn').addEventListener('click', () => {
    clearChapterCache();
    refreshCacheHint();
    toast('Offline cache cleared.');
  });

  // License list
  const licenseList = el('license-list');
  TRANSLATIONS.forEach((t) => {
    const li = document.createElement('li');
    li.innerHTML = `<span class="lic-name">${t.label} (${t.language})</span><span class="lic-badge">${t.license}</span>`;
    licenseList.appendChild(li);
  });
})();
