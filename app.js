/* ==========================================================================
   CYMOR BIBLE APP — CORE APPLICATION ENGINE & SYSTEM ORCHESTRATOR
   File: app.js • Brand: CymorTechServices
   ========================================================================== */

/* ==========================================================================
   GLOBAL CORE STORAGE STATE
   ========================================================================== */
const APP_VERSION = "1.0.0";
const BIBLE_PATH = "./en_kjv.json";

const state = {
  bibleData: [],
  dailyVerse: null,
  currentBook: null,
  currentChapter: null,
  favorites: JSON.parse(localStorage.getItem("cymorFavorites")) || [],
};

/* ==========================================================================
   DOM SELECTORS MATRIX
   ========================================================================== */
const DOM = {
  verseCardAnchor: document.getElementById("verseCardAnchor"),
  prayerCardAnchor: document.getElementById("prayerCardAnchor"),
  pwaInstallBtn: document.getElementById("pwaInstallBtn"),
  currentDateStr: document.getElementById("currentDateStr"),
  greetingText: document.getElementById("greetingText"),
};

/* ==========================================================================
   STATIC DEVOTIONAL LOGIC (Curated Content Pool)
   ========================================================================== */
const DAILY_VERSES = [
  { reference: "Jeremiah 29:11", text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future." },
  { reference: "Philippians 4:13", text: "I can do all things through Christ who strengthens me." },
  { reference: "Psalm 23:1", text: "The Lord is my shepherd; I shall not want." },
  { reference: "Romans 8:28", text: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose." },
  { reference: "Isaiah 41:10", text: "Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee." }
];

const DAILY_PRAYERS = [
  { title: "Prayer For Strength", content: "Lord, strengthen my faith today. Guide my steps away from distraction, and help me walk boldly in wisdom, love, and your transcendent peace." },
  { title: "Prayer For Peace", content: "Father, calm every internal storm within me. Direct my mind away from anxiety and fill my heart with precision, focus, and peace beyond human understanding." },
  { title: "Prayer For Wisdom", content: "God, grant me divine discernment today. Help me make structural decisions that align with purpose and lead those around me into truth." }
];

/* ==========================================================================
   APPLICATION ENTRY ENGINE INITIALIZATION
   ========================================================================== */
document.addEventListener("DOMContentLoaded", async () => {
  console.log(`%c📖 Cymor Bible App v${APP_VERSION} [CymorTechServices]`, "color: #3B82F6; font-weight: bold; font-size: 12px;");
  await initializeApp();
});

async function initializeApp() {
  try {
    initializeTemporalContext();
    initializePWAHook();
    await loadBibleDataset();
    renderDailyVerseComponent();
    renderDailyPrayerComponent();
    registerCoreServiceWorker();
    
    console.log("%c✅ Core Application Architecture Synchronized Safely", "color: #10B981; font-weight: bold;");
  } catch (error) {
    console.error("❌ App Initialization System Fault:", error);
    showNotificationToast("System error during initialization.");
  }
}

/* ==========================================================================
   DATA ENGINE & OFFLINE PERSISTENCE
   ========================================================================== */
async function loadBibleDataset() {
  try {
    const response = await fetch(BIBLE_PATH);
    if (!response.ok) throw new Error(`HTTP network anomaly detected. Status: ${response.status}`);
    
    const bible = await response.json();
    state.bibleData = bible;
    
    console.log(`%c📚 Engine parsed ${bible.length} canonical books successfully`, "color: #6366F1;");
    
    persistBibleToLocalStorage(bible);
    verifyBibleStructuralIntegrity();
  } catch (error) {
    console.warn("⚠ Network pipeline down or dataset parsing broken. Checking local storage cache...", error);
    loadCachedBibleFallback();
  }
}

function verifyBibleStructuralIntegrity() {
  const EXPECTED_BOOKS = 66;
  if (state.bibleData.length !== EXPECTED_BOOKS) {
    console.warn(`⚠ Structural Anomaly: Canonical book count shows ${state.bibleData.length} entries instead of standard ${EXPECTED_BOOKS}.`);
    return;
  }

  let totalChapters = 0;
  let totalVerses = 0;

  state.bibleData.forEach(book => {
    if (book.chapters && Array.isArray(book.chapters)) {
      totalChapters += book.chapters.length;
      book.chapters.forEach(chapter => {
        if (Array.isArray(chapter)) totalVerses += chapter.length;
      });
    }
  });

  console.log(`%c📊 Verification Summary -> Books: 66 | Chapters: ${totalChapters} | Verses: ${totalVerses}`, "color: #F59E0B;");
}

function persistBibleToLocalStorage(data) {
  try {
    localStorage.setItem("cymorBibleCache", JSON.stringify(data));
  } catch (error) {
    console.warn("⚠ Local Storage quota exceeded. Fast parsing local data engine skipped storage caching.", error);
  }
}

function loadCachedBibleFallback() {
  const cached = localStorage.getItem("cymorBibleCache");
  if (!cached) {
    showNotificationToast("Offline dataset absent. Internet required.");
    return;
  }
  state.bibleData = JSON.parse(cached);
  console.log("📦 Active fallback channel: Local Storage JSON dataset parsed successfully.");
  verifyBibleStructuralIntegrity();
}

/* ==========================================================================
   CORE QUERY API WRAPPERS
   ========================================================================== */
function getBookEntity(bookName) {
  if (!bookName) return null;
  return state.bibleData.find(b => b.name.toLowerCase() === bookName.toLowerCase()) || null;
}

function getChapterArray(bookName, chapterNum) {
  const book = getBookEntity(bookName);
  if (!book || !book.chapters || chapterNum < 1 || chapterNum > book.chapters.length) return null;
  return book.chapters[chapterNum - 1];
}

function getVerseString(bookName, chapterNum, verseNum) {
  const chapter = getChapterArray(bookName, chapterNum);
  if (!chapter || verseNum < 1 || verseNum > chapter.length) return null;
  return chapter[verseNum - 1];
}

/* ==========================================================================
   UI COMPONENT RENDERING ENGINE
   ========================================================================== */
function renderDailyVerseComponent() {
  if (!DOM.verseCardAnchor) return;

  const operationalDayIndex = new Date().getDate();
  const verse = DAILY_VERSES[operationalDayIndex % DAILY_VERSES.length];
  state.dailyVerse = verse;

  const isFavorited = state.favorites.some(f => f.reference === verse.reference);

  DOM.verseCardAnchor.innerHTML = `
    <div class="relative overflow-hidden rounded-[32px] border border-blue-500/10 bg-gradient-to-br from-slate-900/90 to-slate-800/80 backdrop-blur-2xl p-6 shadow-2xl shadow-blue-500/10 transition-transform duration-300">
      <div class="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div class="relative z-10">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs uppercase tracking-[0.25em] text-blue-300 font-semibold">Verse of the Day</p>
            <div class="w-14 h-1 rounded-full bg-blue-500/60 mt-3"></div>
          </div>
          <button id="favoriteVerseBtn" class="w-10 h-10 rounded-2xl bg-slate-800/70 border border-slate-700/50 flex items-center justify-center text-xl transition-all active:scale-90 hover:bg-slate-700 hover:text-red-400" aria-label="Favorite Verse">
            ${isFavorited ? "❤️" : "♡"}
          </button>
        </div>
        <blockquote class="mt-8 text-xl sm:text-2xl leading-relaxed font-serif text-slate-100 italic">
          "${verse.text}"
        </blockquote>
        <p class="mt-5 text-blue-400 font-semibold tracking-wide text-sm">${verse.reference}</p>
        <div class="mt-8 flex gap-3">
          <button id="shareVerseBtn" class="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 active:scale-[0.97] transition-all text-white py-3 rounded-2xl text-sm font-semibold shadow-lg shadow-blue-500/20">
            Share Devotional
          </button>
          <button id="copyVerseBtn" class="w-14 flex items-center justify-center rounded-2xl bg-slate-800/70 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-700 active:scale-[0.95] transition-all" title="Copy Text">
            📋
          </button>
        </div>
      </div>
    </div>
  `;
  attachVerseInteractiveEvents();
}

function renderDailyPrayerComponent() {
  if (!DOM.prayerCardAnchor) return;

  const operationalDayIndex = new Date().getDate();
  const prayer = DAILY_PRAYERS[operationalDayIndex % DAILY_PRAYERS.length];

  DOM.prayerCardAnchor.innerHTML = `
    <div class="relative overflow-hidden rounded-[32px] border border-amber-500/10 bg-gradient-to-br from-slate-900/90 to-slate-800/80 backdrop-blur-2xl p-6 shadow-2xl shadow-amber-500/10">
      <div class="absolute bottom-0 left-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div class="relative z-10">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs uppercase tracking-[0.25em] text-amber-300 font-semibold">Daily Prayer</p>
            <div class="w-14 h-1 rounded-full bg-amber-400/60 mt-3"></div>
          </div>
          <span class="text-2xl animate-pulse">🙏</span>
        </div>
        <h3 class="mt-6 text-lg font-semibold text-white tracking-wide">${prayer.title}</h3>
        <p class="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed font-normal">${prayer.content}</p>
      </div>
    </div>
  `;
}

/* ==========================================================================
   INTERACTIVE USER EVENT BINDINGS
   ========================================================================== */
function attachVerseInteractiveEvents() {
  document.getElementById("shareVerseBtn")?.addEventListener("click", executeSharePipeline);
  document.getElementById("copyVerseBtn")?.addEventListener("click", executeClipboardCopy);
  document.getElementById("favoriteVerseBtn")?.addEventListener("click", toggleFavoriteVerseState);
}

async function executeSharePipeline() {
  const verse = state.dailyVerse;
  if (!verse) return;

  const cleanSharePayload = `✨ *Verse of the Day*\n\n"${verse.text}"\n\n— *${verse.reference}*\n\n📖 _Shared via Cymor Bible App_`;

  try {
    if (navigator.share) {
      await navigator.share({
        title: "Cymor Bible Inspiration",
        text: cleanSharePayload,
      });
    } else {
      // Fallback target: Advanced WhatsApp Direct App Intent API Routing Link
      const universalWhatsAppUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(cleanSharePayload)}`;
      window.open(universalWhatsAppUrl, "_blank", "noopener,noreferrer");
      showNotificationToast("Routing target: WhatsApp Share Link Generated");
    }
  } catch (error) {
    console.error("Application runtime ecosystem share exception:", error);
  }
}

async function executeClipboardCopy() {
  const verse = state.dailyVerse;
  if (!verse) return;
  
  try {
    await navigator.clipboard.writeText(`"${verse.text}" — ${verse.reference}`);
    showNotificationToast("Verse text clamped to clipboard! 📋");
  } catch (error) {
    console.error("Clipboard capture context execution failed:", error);
    showNotificationToast("Copy sequence blocked by browser parameters.");
  }
}

function toggleFavoriteVerseState(e) {
  const verse = state.dailyVerse;
  if (!verse) return;

  const index = state.favorites.findIndex(f => f.reference === verse.reference);
  
  if (index > -1) {
    state.favorites.splice(index, 1);
    e.target.innerText = "♡";
    showNotificationToast("Removed from bookmarks");
  } else {
    state.favorites.push(verse);
    e.target.innerText = "❤️";
    showNotificationToast("Saved to bookmarks! ❤️");
  }

  localStorage.setItem("cymorFavorites", JSON.stringify(state.favorites));
}

/* ==========================================================================
   SYSTEM INFRASTRUCTURE LOGIC (Temporal Context & PWA Engine)
   ========================================================================== */
function initializeTemporalContext() {
  const temporalInstance = new Date();
  
  if (DOM.currentDateStr) {
    DOM.currentDateStr.textContent = temporalInstance.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  }

  if (DOM.greetingText) {
    const hours = temporalInstance.getHours();
    let currentGreetingString = "Welcome";
    
    if (hours < 12) currentGreetingString = "Good Morning";
    else if (hours < 18) currentGreetingString = "Good Afternoon";
    else currentGreetingString = "Good Evening";
    
    DOM.greetingText.textContent = currentGreetingString;
  }
}

let deferredPromptInstance;
function initializePWAHook() {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPromptInstance = e;
    DOM.pwaInstallBtn?.classList.remove("hidden");
  });

  DOM.pwaInstallBtn?.addEventListener("click", async () => {
    if (!deferredPromptInstance) return;
    
    deferredPromptInstance.prompt();
    const { outcome } = await deferredPromptInstance.userChoice;
    console.log(`PWA Deployment request authorization verdict: ${outcome}`);
    
    deferredPromptInstance = null;
    DOM.pwaInstallBtn.classList.add("hidden");
  });
}

async function registerCoreServiceWorker() {
  if ("serviceWorker" in navigator) {
    try {
      await navigator.serviceWorker.register("./sw.js");
      console.log("⚙ Service Worker: Native Application Cache Engine Registered.");
    } catch (error) {
      console.error("⚙ Service Worker: Scope registration parameters thrown:", error);
    }
  }
}

/* ==========================================================================
   TOAST NOTIFICATION ENGINE
   ========================================================================== */
function showNotificationToast(message) {
  const notificationContainer = document.createElement("div");
  
  notificationContainer.className = `
    fixed bottom-24 left-1/2 -translate-x-1/2
    bg-slate-900/95 border border-slate-700/80
    text-slate-100 text-xs sm:text-sm font-medium px-5 py-3 rounded-2xl
    z-[9999] backdrop-blur-xl shadow-2xl tracking-wide
    transition-all duration-300 opacity-0 transform translate-y-2
  `;
  
  notificationContainer.textContent = message;
  document.body.appendChild(notificationContainer);

  // Trigger browser paint cycles smoothly
  requestAnimationFrame(() => {
    notificationContainer.style.opacity = "1";
    notificationContainer.style.transform = "translateX(-50%) translateY(0px)";
  });

  setTimeout(() => {
    notificationContainer.style.opacity = "0";
    notificationContainer.style.transform = "translateX(-50%) translateY(12px)";
    setTimeout(() => notificationContainer.remove(), 300);
  }, 2800);
}

/* ==========================================================================
   GLOBAL BACKDOOR SYSTEM DEBUGGING BRIDGE
   ========================================================================== */
window.CymorBibleDebugBridge = {
  fetchBook: getBookEntity,
  fetchChapter: getChapterArray,
  fetchVerse: getVerseString,
  inspectAppState: () => ({ ...state }),
  triggerToast: showNotificationToast
};
