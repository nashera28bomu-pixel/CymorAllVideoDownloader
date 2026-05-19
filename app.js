/* ==========================================================================
   CYMOR BIBLE APP — CORE ORCHESTRATOR v1.2.0
   File: app.js • Brand: CymorTechServices
   ========================================================================== */

/* ==========================================================================
   GLOBAL CORE STORAGE STATE
   ========================================================================== */
const APP_VERSION = "1.2.0";
const BIBLE_PATH = "./en_kjv.json";

const state = {
  bibleData: [],
  vIndex: 0,
  pIndex: 0,
  dailyVerse: null,
  favorites: JSON.parse(localStorage.getItem("cymorFavorites")) || [],
};

/* ==========================================================================
   DOM SELECTORS MATRIX
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
};

/* ==========================================================================
   CONSTANT CONTENT POOLS
   ========================================================================== */
const DAILY_VERSES = [
  { reference: "Jeremiah 29:11", text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future." },
  { reference: "Philippians 4:13", text: "I can do all things through Christ who strengthens me." },
  { reference: "Psalm 23:1", text: "The Lord is my shepherd; I shall not want." },
  { reference: "Isaiah 41:10", text: "Fear thou not; for I am with thee: be not dismayed; for I am thy God; I will strengthen thee; yea, I will help thee." },
  { reference: "Romans 8:28", text: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose." },
  { reference: "Matthew 11:28", text: "Come unto me, all ye that labour and are heavy laden, and I will give you rest." },
  { reference: "Psalm 46:1", text: "God is our refuge and strength, a very present help in trouble." },
  { reference: "Proverbs 3:5-6", text: "Trust in the Lord with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths." },
  { reference: "Joshua 1:9", text: "Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the Lord thy God is with thee whithersoever thou goest." },
  { reference: "Hebrews 11:1", text: "Now faith is the substance of things hoped for, the evidence of things not seen." }
];

const DAILY_PRAYERS = [
  { title: "Morning Strength", content: "Heavenly Father, I come before You this morning seeking the strength that only You can provide. As I step into this day, let Your Holy Spirit guide my thoughts and actions. Remove any spirit of heaviness or doubt, and replace it with a renewed mind. I declare that no weapon formed against me shall prosper, and Your favor surrounds me like a shield. Amen." },
  { title: "Divine Peace", content: "Lord Jesus, You are the Prince of Peace. I ask that You calm the storms within my heart and mind today. When the world feels chaotic, remind me that You are in control. I cast every burden, every anxiety, and every fear at Your feet. Guard my heart with Your peace that surpasses all human understanding, and let me be a vessel of tranquility to everyone I meet. Amen." },
  { title: "Wisdom & Discernment", content: "Abba Father, grant me the wisdom of Solomon and the discernment of Your Spirit. As I navigate complex decisions and interactions today, let me not lean on my own understanding. Open my eyes to see opportunities where others see obstacles. Let my words be seasoned with grace and my choices reflect Your divine purpose for my life. Amen." },
  { title: "Provision & Blessings", content: "Jehovah Jireh, my Provider, I thank You for Your faithfulness. I trust that You will supply all my needs according to Your riches in glory. Open the windows of heaven and pour out blessings that I cannot contain. I pray for success in my handiwork and that You would enlarge my territory so I may be a blessing to others in need. Amen." },
  { title: "Protection & Safety", content: "Lord, I dwell in the secret place of the Most High and abide under the shadow of the Almighty. I ask for Your divine protection over my home, my family, and my travels today. Surround us with Your hedge of fire and charge Your angels to keep us in all our ways. Keep us safe from seen and unseen dangers, and lead us home in peace. Amen." },
  { title: "Healing & Restoration", content: "Father God, I pray for Your healing touch to manifest in my body, soul, and spirit. You are the Great Physician who heals all diseases. Restore the years that the locusts have eaten and bring back the joy of my salvation. I speak life over every dead situation and declare that by Your stripes, I am made whole and complete. Amen." },
  { title: "Grace to Forgive", content: "Merciful God, help me to walk in love just as You have loved me. Remove any root of bitterness or resentment from my heart. Give me the grace to forgive those who have wronged me, understanding that Your mercy is new every morning. Let my life be a reflection of Your unconditional love and let Your light shine through my forgiveness. Amen." }
];

/* ==========================================================================
   APPLICATION ENTRY ENGINE
   ========================================================================== */
document.addEventListener("DOMContentLoaded", async () => {
  console.log(`%c📖 Cymor Bible App v${APP_VERSION}`, "color: #3B82F6; font-weight: bold;");
  await initializeApp();
});

async function initializeApp() {
  try {
    initializeTemporalContext();
    initializePWAHook();
    await loadBibleDataset();
    setupBibleNavigation();
    registerCoreServiceWorker();
    
    // Initial Render
    cycleVerse();
    cyclePrayer();

    // Start Rotation Timers
    setInterval(cycleVerse, 8000);
    setInterval(cyclePrayer, 10000);
    
    console.log("%c✅ System Architecture Synchronized", "color: #10B981; font-weight: bold;");
  } catch (error) {
    console.error("❌ App Initialization System Fault:", error);
  }
}

/* ==========================================================================
   ROTATION LOGIC (UI ENGINE)
   ========================================================================== */
function cycleVerse() {
  if (!DOM.verseCardAnchor) return;
  DOM.verseCardAnchor.classList.add('opacity-0', 'translate-y-2');
  
  setTimeout(() => {
    const verse = DAILY_VERSES[state.vIndex];
    state.dailyVerse = verse;
    const isFavorited = state.favorites.some(f => f.reference === verse.reference);

    DOM.verseCardAnchor.innerHTML = `
      <div class="relative overflow-hidden rounded-[32px] border border-blue-500/10 bg-slate-900/90 backdrop-blur-2xl p-6 shadow-2xl transition-all duration-500">
        <div class="flex items-center justify-between">
          <p class="text-xs uppercase tracking-[0.25em] text-blue-300 font-semibold">Verse of the Day</p>
          <button onclick="window.CymorBibleDebugBridge.toggleFav()" class="text-xl">${isFavorited ? "❤️" : "♡"}</button>
        </div>
        <blockquote class="mt-6 text-xl leading-relaxed text-slate-100 italic">"${verse.text}"</blockquote>
        <p class="mt-4 text-blue-400 font-semibold text-sm">${verse.reference}</p>
        <div class="mt-6 flex gap-2">
            <button onclick="window.CymorBibleDebugBridge.share()" class="flex-1 bg-blue-600 text-white py-3 rounded-2xl text-xs font-bold">Share</button>
        </div>
      </div>
    `;
    DOM.verseCardAnchor.classList.remove('opacity-0', 'translate-y-2');
    state.vIndex = (state.vIndex + 1) % DAILY_VERSES.length;
  }, 500);
}

function cyclePrayer() {
  if (!DOM.prayerCardAnchor) return;
  DOM.prayerCardAnchor.classList.add('opacity-0', 'translate-y-2');

  setTimeout(() => {
    const prayer = DAILY_PRAYERS[state.pIndex];
    DOM.prayerCardAnchor.innerHTML = `
      <div class="relative overflow-hidden rounded-[32px] border border-amber-500/10 bg-slate-900/90 backdrop-blur-2xl p-6 shadow-2xl transition-all duration-500">
        <p class="text-xs uppercase tracking-[0.25em] text-amber-300 font-semibold mb-4">Focus for Today</p>
        <h3 class="text-lg font-bold text-white mb-2">${prayer.title}</h3>
        <p class="text-slate-300 text-sm leading-relaxed font-normal">${prayer.content}</p>
      </div>
    `;
    DOM.prayerCardAnchor.classList.remove('opacity-0', 'translate-y-2');
    state.pIndex = (state.pIndex + 1) % DAILY_PRAYERS.length;
  }, 500);
}

/* ==========================================================================
   BIBLE NAVIGATION ENGINE
   ========================================================================== */
function setupBibleNavigation() {
  if (!DOM.testamentSelect || !DOM.bookSelect) return;

  DOM.testamentSelect.addEventListener('change', (e) => {
    const selectedT = e.target.value;
    DOM.bookSelect.innerHTML = '<option value="">Select Book</option>';
    DOM.chapterSelect.innerHTML = '<option value="">Select Chapter</option>';
    DOM.chapterSelect.disabled = true;

    const filteredBooks = state.bibleData.filter(book => 
      selectedT === 'OT' ? book.id <= 39 : book.id > 39
    );

    filteredBooks.forEach(book => {
      DOM.bookSelect.add(new Option(book.name, book.name));
    });
    DOM.bookSelect.disabled = false;
  });

  DOM.bookSelect.addEventListener('change', (e) => {
    const book = state.bibleData.find(b => b.name === e.target.value);
    DOM.chapterSelect.innerHTML = '<option value="">Select Chapter</option>';
    if (book) {
      book.chapters.forEach((_, i) => DOM.chapterSelect.add(new Option(`Chapter ${i + 1}`, i)));
      DOM.chapterSelect.disabled = false;
    }
  });

  DOM.chapterSelect.addEventListener('change', (e) => {
    const book = state.bibleData.find(b => b.name === DOM.bookSelect.value);
    if (book && e.target.value !== "") {
      const verses = book.chapters[e.target.value];
      DOM.bibleDisplay.innerHTML = `
        <h2 class="text-2xl font-serif text-white mb-6">${book.name} ${parseInt(e.target.value) + 1}</h2>
        ${verses.map((v, i) => `<div class="mb-4 flex gap-4"><span class="text-blue-400 font-bold text-sm">${i + 1}</span><p class="text-slate-200">${v}</p></div>`).join('')}
      `;
    }
  });
}

/* ==========================================================================
   DATA & PERSISTENCE
   ========================================================================== */
async function loadBibleDataset() {
  try {
    const response = await fetch(BIBLE_PATH);
    state.bibleData = await response.json();
    localStorage.setItem("cymorBibleCache", JSON.stringify(state.bibleData));
  } catch (error) {
    const cached = localStorage.getItem("cymorBibleCache");
    if (cached) state.bibleData = JSON.parse(cached);
  }
}

/* ==========================================================================
   SYSTEM UTILITIES
   ========================================================================== */
function initializeTemporalContext() {
  const now = new Date();
  if (DOM.currentDateStr) DOM.currentDateStr.textContent = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  if (DOM.greetingText) {
    const hrs = now.getHours();
    DOM.greetingText.textContent = hrs < 12 ? "Good Morning" : hrs < 18 ? "Good Afternoon" : "Good Evening";
  }
}

function initializePWAHook() {
  let deferredPrompt;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    DOM.pwaInstallBtn?.classList.remove("hidden");
  });
  DOM.pwaInstallBtn?.addEventListener("click", async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt = null;
      DOM.pwaInstallBtn.classList.add("hidden");
    }
  });
}

async function registerCoreServiceWorker() {
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js");
}

/* ==========================================================================
   DEBUG BRIDGE & HELPERS
   ========================================================================== */
window.CymorBibleDebugBridge = {
  share: async () => {
    const v = state.dailyVerse;
    const text = `✨ *Verse of the Day*\n"${v.text}"\n— *${v.reference}*`;
    if (navigator.share) await navigator.share({ text });
    else window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`);
  },
  toggleFav: () => {
    const v = state.dailyVerse;
    const idx = state.favorites.findIndex(f => f.reference === v.reference);
    if (idx > -1) state.favorites.splice(idx, 1);
    else state.favorites.push(v);
    localStorage.setItem("cymorFavorites", JSON.stringify(state.favorites));
    cycleVerse(); // Refresh UI
  }
};
