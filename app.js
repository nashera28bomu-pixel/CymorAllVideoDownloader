/* ==========================================================================
   CYMOR BIBLE APP — CORE ORCHESTRATOR v2.0.0
   File: app.js • Brand: CymorTechServices
   New in v2.0: Audio Bible, Music Playlist, Bible Trivia, Update Notifications
   ========================================================================== */

const APP_VERSION = "2.0.0";
const BIBLE_PATH = "./en_kjv.json";

/* ==========================================================================
   GLOBAL STATE
   ========================================================================== */

const state = {
  bibleData: [],
  vIndex: 0,
  pIndex: 0,
  currentViewContent: null,
  favorites: JSON.parse(localStorage.getItem("cymorFavorites")) || [],
};

/* ==========================================================================
   DOM REFERENCES
   ========================================================================== */

const DOM = {
  verseCardAnchor: document.getElementById("verseCardAnchor"),
  prayerCardAnchor: document.getElementById("prayerCardAnchor"),

  testamentSelect: document.getElementById("testament-select"),
  bookSelect: document.getElementById("book-select"),
  chapterSelect: document.getElementById("chapter-select"),

  bibleDisplay: document.getElementById("bible-display"),

  pwaInstallBtn: document.getElementById("pwaInstallBtn"),

  currentDateStr: document.getElementById("currentDateStr"),
  greetingText: document.getElementById("greetingText"),

  searchInput: document.getElementById("searchInput"),

  shareTemplate: document.getElementById("share-template"),
  shareContent: document.getElementById("share-content"),
  shareRef: document.getElementById("share-ref")
};

/* ==========================================================================
   DAILY VERSES
   ========================================================================== */

const DAILY_VERSES = [
  { reference: "Jeremiah 29:11", text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future." },
  { reference: "Philippians 4:13", text: "I can do all things through Christ which strengtheneth me." },
  { reference: "Psalm 23:1", text: "The Lord is my shepherd; I shall not want." },
  { reference: "Isaiah 41:10", text: "Fear thou not; for I am with thee: be not dismayed; for I am thy God." },
  { reference: "Romans 8:28", text: "And we know that all things work together for good to them that love God." },
  { reference: "Joshua 1:9", text: "Be strong and of a good courage; be not afraid, neither be thou dismayed: for the Lord thy God is with thee whithersoever thou goest." },
  { reference: "Psalm 46:1", text: "God is our refuge and strength, a very present help in trouble." },
  { reference: "Matthew 11:28", text: "Come unto me, all ye that labour and are heavy laden, and I will give you rest." },
  { reference: "2 Timothy 1:7", text: "For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind." },
  { reference: "Lamentations 3:22-23", text: "It is of the Lord's mercies that we are not consumed, because his compassions fail not. They are new every morning: great is thy faithfulness." }
];

/* ==========================================================================
   DAILY PRAYERS
   ========================================================================== */

const DAILY_PRAYERS = [
  { title: "Morning Strength", content: "Heavenly Father, thank You for the gift of a new day. Fill my heart with courage, wisdom, and strength as I step into every opportunity before me. Guide my thoughts, words, and actions so that I may walk in peace and purpose. Protect me from fear, discouragement, and confusion. Let Your favor surround me and let Your light shine through my life today. Amen." },
  { title: "Divine Peace", content: "Lord Jesus, calm every storm within my heart and mind. Remove every burden, anxiety, and worry that tries to steal my peace. Teach me to trust in You completely even when life becomes difficult. Let Your presence bring comfort to my soul and clarity to my thoughts. Fill my home, family, and future with divine peace that surpasses all understanding. Amen." },
  { title: "Prayer For Guidance", content: "Dear God, I ask for Your divine guidance in every area of my life. Help me make wise decisions and walk on the path You have prepared for me. When I feel uncertain, remind me that Your plans are perfect. Open doors that align with my destiny and close every door that will bring harm or confusion. Give me patience to wait on Your timing and faith to trust Your direction even when I cannot see the full picture. Lead me with Your wisdom and let Your Spirit guide me daily. Amen." },
  { title: "Prayer For Protection", content: "Almighty Father, I place myself and my loved ones under Your protection today. Guard our hearts, minds, and bodies from danger, sickness, negativity, and evil. Surround us with Your angels and let no weapon formed against us prosper. Keep us safe while traveling, working, studying, and resting. Cover our homes with peace, unity, and joy. Thank You for being our refuge and shield forever. Amen." },
  { title: "Prayer For Faith", content: "Lord, strengthen my faith when doubts begin to rise. Help me believe in Your promises even when circumstances seem impossible. Teach me to trust You during seasons of waiting and uncertainty. Fill my heart with confidence that You are working all things together for good. Thank You for never abandoning me. Amen." },
  { title: "Prayer For Success", content: "Heavenly Father, bless the work of my hands and help me succeed in every good thing I pursue. Give me discipline, creativity, focus, and determination. Help me use my talents wisely and honor You through my work. May my success become a testimony of Your goodness and grace in my life. Amen." },
  { title: "Prayer Of Gratitude", content: "Gracious Lord, thank You for every blessing You have given me, both seen and unseen. Thank You for life, health, family, provision, and Your endless mercy. Teach me to appreciate each day, to love others sincerely, and to walk with humility and joy. Amen." }
];

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */

document.addEventListener("DOMContentLoaded", async () => {

  initializeTemporalContext();
  initializePWAHook();
  registerCoreServiceWorker();
  injectUpdateToast();
  injectV2FeatureCards();

  await loadBibleDataset();

  setupBibleNavigation();
  setupSearch();

  cycleVerse();
  cyclePrayer();

  setInterval(cycleVerse, 20000);
  setInterval(cyclePrayer, 30000);
});

/* ==========================================================================
   UPDATE TOAST — Shown when SW broadcasts v2.0 activation
   ========================================================================== */

function injectUpdateToast() {
  // Create toast element
  const toast = document.createElement("div");
  toast.id = "updateToast";
  toast.innerHTML = `
    <div class="bg-slate-900 border border-blue-500/40 rounded-[24px] p-4 shadow-2xl shadow-blue-900/30">
      <div class="flex items-start gap-3">
        <div class="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 text-lg">🚀</div>
        <div class="flex-1 min-w-0">
          <p class="text-white font-bold text-sm mb-0.5">Cymor Bible v2.0 is here!</p>
          <p class="text-slate-400 text-xs leading-relaxed mb-3">Audio Bible 🎙, Music Center 🎵 & Bible Trivia ❓ are now available.</p>
          <div class="flex gap-2">
            <a href="audio.html" class="px-3 py-1.5 bg-blue-600 text-white text-[10px] font-bold rounded-xl">Explore Now</a>
            <button onclick="dismissUpdateToast()" class="px-3 py-1.5 bg-slate-800 text-slate-400 text-[10px] font-bold rounded-xl">Dismiss</button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(toast);

  // Listen for SW message
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data && event.data.type === "CYMOR_UPDATE") {
        showUpdateToast();
      }
    });
  }

  // Also show if first time on v2.0
  const lastVersion = localStorage.getItem("cymorLastVersion");
  if (lastVersion !== APP_VERSION) {
    setTimeout(showUpdateToast, 2000);
    localStorage.setItem("cymorLastVersion", APP_VERSION);
  }
}

function showUpdateToast() {
  const toast = document.getElementById("updateToast");
  if (toast) toast.classList.add("show");
}

window.dismissUpdateToast = function () {
  const toast = document.getElementById("updateToast");
  if (toast) toast.classList.remove("show");
};

/* ==========================================================================
   V2 FEATURE CARDS — Injected below prayer card on home screen
   ========================================================================== */

function injectV2FeatureCards() {
  // Only inject on index.html (check for verseCardAnchor)
  if (!DOM.verseCardAnchor) return;

  const container = document.createElement("div");
  container.id = "v2FeatureCards";
  container.className = "px-4 space-y-3 mt-2";
  container.innerHTML = `
    <p class="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-bold px-2 pt-2">New in v2.0</p>

    <div class="grid grid-cols-3 gap-3">

      <a href="audio.html" class="flex flex-col items-center gap-2 p-4 rounded-[22px] border border-blue-500/15 bg-slate-900/70 active:scale-95 transition-all">
        <div class="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-xl">🎙</div>
        <p class="text-[10px] font-bold text-slate-300 text-center leading-tight">Audio Bible</p>
      </a>

      <a href="playlist.html" class="flex flex-col items-center gap-2 p-4 rounded-[22px] border border-purple-500/15 bg-slate-900/70 active:scale-95 transition-all">
        <div class="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center text-xl">🎵</div>
        <p class="text-[10px] font-bold text-slate-300 text-center leading-tight">Music Center</p>
      </a>

      <a href="trivia.html" class="flex flex-col items-center gap-2 p-4 rounded-[22px] border border-amber-500/15 bg-slate-900/70 active:scale-95 transition-all">
        <div class="w-10 h-10 rounded-xl bg-amber-600/20 flex items-center justify-center text-xl">❓</div>
        <p class="text-[10px] font-bold text-slate-300 text-center leading-tight">Bible Trivia</p>
      </a>

    </div>
  `;

  // Insert after main content area
  const main = document.querySelector("main");
  if (main) main.appendChild(container);
}

/* ==========================================================================
   VERSE ROTATION
   ========================================================================== */

function cycleVerse() {
  if (!DOM.verseCardAnchor) return;
  DOM.verseCardAnchor.classList.add("opacity-0", "translate-y-2");

  setTimeout(() => {
    const verse = DAILY_VERSES[state.vIndex];
    state.currentViewContent = { text: verse.text, ref: verse.reference };
    const isFav = state.favorites.some(f => f.reference === verse.reference);

    DOM.verseCardAnchor.innerHTML = `
      <div class="relative overflow-hidden rounded-[32px] border border-blue-500/10 bg-slate-900/90 backdrop-blur-2xl p-6 shadow-2xl transition-all duration-500">
        <div class="flex items-center justify-between">
          <p class="text-xs uppercase tracking-[0.25em] text-blue-300 font-semibold">Verse of the Day</p>
          <button onclick="window.CymorBibleDebugBridge.toggleFav()" class="text-xl">${isFav ? "❤️" : "♡"}</button>
        </div>
        <blockquote class="mt-6 text-xl leading-relaxed text-slate-100 italic">"${verse.text}"</blockquote>
        <p class="mt-4 text-blue-400 font-semibold text-sm">${verse.reference}</p>
        <button
          onclick="window.CymorBibleDebugBridge.shareAsImage('${verse.text.replace(/'/g, "\\'")}', '${verse.reference}')"
          class="mt-6 w-full bg-blue-600/20 border border-blue-500/30 text-blue-400 py-3 rounded-2xl text-xs font-bold active:scale-95 transition-all">
          SHARE AS IMAGE
        </button>
      </div>
    `;

    DOM.verseCardAnchor.classList.remove("opacity-0", "translate-y-2");
    state.vIndex = (state.vIndex + 1) % DAILY_VERSES.length;
  }, 500);
}

/* ==========================================================================
   PRAYER ROTATION
   ========================================================================== */

function cyclePrayer() {
  if (!DOM.prayerCardAnchor) return;
  DOM.prayerCardAnchor.classList.add("opacity-0", "translate-y-2");

  setTimeout(() => {
    const prayer = DAILY_PRAYERS[state.pIndex];
    DOM.prayerCardAnchor.innerHTML = `
      <div class="relative overflow-hidden rounded-[32px] border border-amber-500/10 bg-slate-900/90 backdrop-blur-2xl p-6 shadow-2xl">
        <p class="text-xs uppercase tracking-[0.25em] text-amber-300 font-semibold mb-4">Focus for Today</p>
        <h3 class="text-lg font-bold text-white mb-3">${prayer.title}</h3>
        <p class="text-slate-300 text-sm leading-relaxed mb-5">${prayer.content}</p>
        <button
          onclick="window.CymorBibleDebugBridge.shareAsImage('${prayer.content.replace(/'/g, "\\'")}', '${prayer.title}')"
          class="w-full bg-amber-500/10 border border-amber-500/20 text-amber-400 py-3 rounded-xl text-[10px] font-bold active:scale-95 transition-all">
          SHARE PRAYER IMAGE
        </button>
      </div>
    `;
    DOM.prayerCardAnchor.classList.remove("opacity-0", "translate-y-2");
    state.pIndex = (state.pIndex + 1) % DAILY_PRAYERS.length;
  }, 500);
}

/* ==========================================================================
   BIBLE NAVIGATION
   ========================================================================== */

function setupBibleNavigation() {
  if (!DOM.testamentSelect) return;

  const OLD_TESTAMENT_BOOKS = [
    "Genesis","Exodus","Leviticus","Numbers","Deuteronomy",
    "Joshua","Judges","Ruth","1 Samuel","2 Samuel",
    "1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra",
    "Nehemiah","Esther","Job","Psalms","Proverbs",
    "Ecclesiastes","Song of Solomon","Isaiah","Jeremiah","Lamentations",
    "Ezekiel","Daniel","Hosea","Joel","Amos",
    "Obadiah","Jonah","Micah","Nahum","Habakkuk",
    "Zephaniah","Haggai","Zechariah","Malachi"
  ];

  const NEW_TESTAMENT_BOOKS = [
    "Matthew","Mark","Luke","John","Acts",
    "Romans","1 Corinthians","2 Corinthians","Galatians","Ephesians",
    "Philippians","Colossians","1 Thessalonians","2 Thessalonians","1 Timothy",
    "2 Timothy","Titus","Philemon","Hebrews","James",
    "1 Peter","2 Peter","1 John","2 John","3 John",
    "Jude","Revelation"
  ];

  DOM.testamentSelect.addEventListener("change", (e) => {
    const val = e.target.value;
    DOM.bookSelect.innerHTML = '<option value="">Select Book</option>';
    DOM.chapterSelect.innerHTML = '<option value="">Select Chapter</option>';
    DOM.bookSelect.disabled = true;
    DOM.chapterSelect.disabled = true;
    DOM.bookSelect.classList.add("opacity-50");
    DOM.chapterSelect.classList.add("opacity-50");
    if (!val) return;

    const allowedBooks = val === "OT" ? OLD_TESTAMENT_BOOKS : NEW_TESTAMENT_BOOKS;
    const filtered = state.bibleData.filter(b => allowedBooks.includes(b.name));
    filtered.forEach(book => {
      const option = document.createElement("option");
      option.value = book.name;
      option.textContent = book.name;
      DOM.bookSelect.appendChild(option);
    });
    DOM.bookSelect.disabled = false;
    DOM.bookSelect.classList.remove("opacity-50");
  });

  DOM.bookSelect.addEventListener("change", (e) => {
    const book = state.bibleData.find(b => b.name === e.target.value);
    DOM.chapterSelect.innerHTML = '<option value="">Select Chapter</option>';
    if (!book) return;
    book.chapters.forEach((_, i) => {
      const option = document.createElement("option");
      option.value = i;
      option.textContent = `Chapter ${i + 1}`;
      DOM.chapterSelect.appendChild(option);
    });
    DOM.chapterSelect.disabled = false;
    DOM.chapterSelect.classList.remove("opacity-50");
  });

  DOM.chapterSelect.addEventListener("change", (e) => {
    const book = state.bibleData.find(b => b.name === DOM.bookSelect.value);
    if (!book || e.target.value === "") return;
    const idx = parseInt(e.target.value);
    const verses = book.chapters[idx];

    DOM.bibleDisplay.innerHTML = `
      <div class="fade-in">
        <div class="mb-6">
          <p class="text-blue-400 uppercase tracking-[0.3em] text-xs font-bold mb-2">Holy Scripture</p>
          <h2 class="text-2xl font-bold text-white">${book.name} ${idx + 1}</h2>
        </div>
        <div class="space-y-5">
          ${verses.map((v, i) => `
            <div class="mb-4 flex gap-4 verse p-3 rounded-2xl transition-all bg-slate-800/30 active:scale-[0.99]"
              onclick="window.CymorBibleDebugBridge.shareAsImage('${v.replace(/'/g, "\\'")}', '${book.name} ${idx + 1}:${i + 1}')">
              <span class="text-blue-500/50 font-bold text-xs mt-1">${i + 1}</span>
              <p class="text-slate-200 text-sm leading-relaxed">${v}</p>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  });
}

/* ==========================================================================
   SEARCH
   ========================================================================== */

function setupSearch() {
  if (!DOM.searchInput) return;
  DOM.searchInput.addEventListener("input", (e) => {
    const query = e.target.value.trim().toLowerCase();
    if (!query) return;
    const results = [];
    state.bibleData.forEach(book => {
      book.chapters.forEach((chapter, cIndex) => {
        chapter.forEach((verse, vIndex) => {
          if (verse.toLowerCase().includes(query)) {
            results.push({ reference: `${book.name} ${cIndex + 1}:${vIndex + 1}`, text: verse });
          }
        });
      });
    });

    DOM.bibleDisplay.innerHTML = `
      <div class="space-y-4">
        <div class="mb-6">
          <p class="text-blue-400 uppercase tracking-[0.3em] text-xs font-bold mb-2">Search Results</p>
          <h2 class="text-2xl font-bold text-white">${results.length} Verse(s) Found</h2>
        </div>
        ${results.length > 0
          ? results.slice(0, 50).map(r => `
            <div class="p-4 rounded-2xl bg-slate-800/40 border border-slate-700">
              <p class="text-blue-400 text-xs font-bold mb-3">${r.reference}</p>
              <p class="text-slate-200 text-sm leading-relaxed">${r.text}</p>
            </div>
          `).join("")
          : `<div class="text-center py-10"><p class="text-slate-400">No verses found.</p></div>`
        }
      </div>
    `;
  });
}

/* ==========================================================================
   LOAD BIBLE DATA
   ========================================================================== */

async function loadBibleDataset() {
  try {
    const res = await fetch(BIBLE_PATH);
    if (!res.ok) throw new Error("Bible JSON failed to load");
    state.bibleData = await res.json();
    console.log("Bible Loaded:", state.bibleData.length, "books");

    if (DOM.bibleDisplay) {
      DOM.bibleDisplay.innerHTML = `
        <div class="text-center py-16">
          <p class="text-blue-400 uppercase tracking-[0.4em] text-xs font-bold mb-6">Cymor Bible v2.0 Ready</p>
          <h2 class="text-4xl font-black text-white mb-5 leading-tight">Select Testament To Begin</h2>
          <p class="text-slate-400 text-lg">Browse scriptures beautifully offline.</p>
        </div>
      `;
    }
  } catch (err) {
    console.error(err);
    if (DOM.bibleDisplay) {
      DOM.bibleDisplay.innerHTML = `
        <div class="text-center py-16">
          <p class="text-red-400 text-xl font-bold mb-4">Failed To Load Bible Data</p>
          <p class="text-slate-400 text-sm break-all">${err.message}</p>
        </div>
      `;
    }
  }
}

/* ==========================================================================
   SHARE ENGINE
   ========================================================================== */

window.CymorBibleDebugBridge = {

  shareAsImage: async (text, reference) => {
    if (!DOM.shareTemplate) return;
    DOM.shareContent.innerText = `"${text || "Cymor Bible"}"`;
    DOM.shareRef.innerText = reference || "Holy Scripture";

    try {
      const canvas = await html2canvas(DOM.shareTemplate, {
        backgroundColor: "#0F172A",
        scale: 2,
        logging: false,
        useCORS: true
      });
      canvas.toBlob(async (blob) => {
        const file = new File([blob], "cymor-bible-share.png", { type: "image/png" });
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: "Cymor Bible", text: reference || "Holy Scripture" });
        } else {
          const link = document.createElement("a");
          link.download = `CymorBible_${Date.now()}.png`;
          link.href = canvas.toDataURL("image/png");
          link.click();
        }
      });
    } catch (err) {
      console.error("Image generation failed", err);
    }
  },

  toggleFav: () => {
    const v = state.currentViewContent;
    if (!v) return;
    const idx = state.favorites.findIndex(f => f.reference === v.ref);
    if (idx > -1) {
      state.favorites.splice(idx, 1);
    } else {
      state.favorites.push({ reference: v.ref, text: v.text });
    }
    localStorage.setItem("cymorFavorites", JSON.stringify(state.favorites));
    cycleVerse();
  },

  saveProgress: () => {
    const progress = {
      testament: DOM.testamentSelect?.value || "",
      book: DOM.bookSelect?.value || "",
      chapter: DOM.chapterSelect?.value || ""
    };
    localStorage.setItem("cymorBibleProgress", JSON.stringify(progress));
    alert("Reading progress saved.");
  }
};

/* ==========================================================================
   UTILITIES
   ========================================================================== */

function initializeTemporalContext() {
  const now = new Date();
  if (DOM.currentDateStr) {
    DOM.currentDateStr.textContent = now.toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric"
    });
  }
  if (DOM.greetingText) {
    const hrs = now.getHours();
    DOM.greetingText.textContent = hrs < 12 ? "Good Morning" : hrs < 18 ? "Good Afternoon" : "Good Evening";
  }
}

function initializePWAHook() {
  let prompt;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    prompt = e;
    DOM.pwaInstallBtn?.classList.remove("hidden");
  });
  DOM.pwaInstallBtn?.addEventListener("click", () => {
    if (prompt) { prompt.prompt(); prompt = null; DOM.pwaInstallBtn.classList.add("hidden"); }
  });
}

async function registerCoreServiceWorker() {
  if ("serviceWorker" in navigator) {
    try {
      const reg = await navigator.serviceWorker.register("./sw.js");
      console.log("SW registered:", reg.scope);

      // Listen for a new SW waiting (update available)
      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            // New SW installed, show update toast
            showUpdateToast();
          }
        });
      });
    } catch (err) {
      console.error("SW registration failed", err);
    }
  }
}
