/* ==========================================================================
   CYMOR BIBLE APP — CORE ORCHESTRATOR v1.4.0
   File: app.js • Brand: CymorTechServices
   ========================================================================== */

const APP_VERSION = "1.4.0";
const BIBLE_PATH = "./en_kjv.json";

const state = {
  bibleData: [],
  vIndex: 0,
  pIndex: 0,
  currentViewContent: null,
  favorites: JSON.parse(localStorage.getItem("cymorFavorites")) || [],
};

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

  // Share Template Elements
  shareTemplate: document.getElementById("share-template"),
  shareContent: document.getElementById("share-content"),
  shareRef: document.getElementById("share-ref")
};

/* ==========================================================================
   DAILY ENCOURAGEMENT ENGINE
   ========================================================================== */

const DAILY_VERSES = [
  {
    reference: "Jeremiah 29:11",
    text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future."
  },
  {
    reference: "Philippians 4:13",
    text: "I can do all things through Christ which strengtheneth me."
  },
  {
    reference: "Psalm 23:1",
    text: "The Lord is my shepherd; I shall not want."
  },
  {
    reference: "Isaiah 41:10",
    text: "Fear thou not; for I am with thee: be not dismayed; for I am thy God."
  },
  {
    reference: "Romans 8:28",
    text: "And we know that all things work together for good to them that love God."
  },

  // NEW VERSES
  {
    reference: "Joshua 1:9",
    text: "Be strong and of a good courage; be not afraid, neither be thou dismayed: for the Lord thy God is with thee whithersoever thou goest."
  },
  {
    reference: "Psalm 46:1",
    text: "God is our refuge and strength, a very present help in trouble."
  },
  {
    reference: "Matthew 11:28",
    text: "Come unto me, all ye that labour and are heavy laden, and I will give you rest."
  },
  {
    reference: "2 Timothy 1:7",
    text: "For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind."
  },
  {
    reference: "Lamentations 3:22-23",
    text: "It is of the Lord's mercies that we are not consumed, because his compassions fail not. They are new every morning: great is thy faithfulness."
  }
];

const DAILY_PRAYERS = [
  {
    title: "Morning Strength",
    content:
      "Heavenly Father, thank You for the gift of a new day. Fill my heart with courage, wisdom, and strength as I step into every opportunity before me. Guide my thoughts, words, and actions so that I may walk in peace and purpose. Protect me from fear, discouragement, and confusion. Let Your favor surround me and let Your light shine through my life today. Amen."
  },

  {
    title: "Divine Peace",
    content:
      "Lord Jesus, calm every storm within my heart and mind. Remove every burden, anxiety, and worry that tries to steal my peace. Teach me to trust in You completely even when life becomes difficult. Let Your presence bring comfort to my soul and clarity to my thoughts. Fill my home, family, and future with divine peace that surpasses all understanding. Amen."
  },

  // NEW LENGTHY PRAYERS
  {
    title: "Prayer For Guidance",
    content:
      "Dear God, I ask for Your divine guidance in every area of my life. Help me make wise decisions and walk on the path You have prepared for me. When I feel uncertain, remind me that Your plans are perfect. Open doors that align with my destiny and close every door that will bring harm or confusion. Give me patience to wait on Your timing and faith to trust Your direction even when I cannot see the full picture. Lead me with Your wisdom and let Your Spirit guide me daily. Amen."
  },

  {
    title: "Prayer For Protection",
    content:
      "Almighty Father, I place myself and my loved ones under Your protection today. Guard our hearts, minds, and bodies from danger, sickness, negativity, and evil. Surround us with Your angels and let no weapon formed against us prosper. Keep us safe while traveling, working, studying, and resting. Strengthen us during difficult times and remind us that You are always near. Cover our homes with peace, unity, and joy. Thank You for being our refuge and shield forever. Amen."
  },

  {
    title: "Prayer For Faith",
    content:
      "Lord, strengthen my faith when doubts begin to rise. Help me believe in Your promises even when circumstances seem impossible. Teach me to trust You during seasons of waiting and uncertainty. Fill my heart with confidence that You are working all things together for good. Let my faith grow deeper through every challenge I face. Help me encourage others and remain hopeful no matter what happens around me. Thank You for never abandoning me and for always remaining faithful. Amen."
  },

  {
    title: "Prayer For Success",
    content:
      "Heavenly Father, bless the work of my hands and help me succeed in every good thing I pursue. Give me discipline, creativity, focus, and determination. Help me use my talents wisely and honor You through my work and achievements. Remove distractions, laziness, and fear from my path. Connect me with opportunities and people that will help me grow into the person You created me to be. May my success become a testimony of Your goodness and grace in my life. Amen."
  },

  {
    title: "Prayer Of Gratitude",
    content:
      "Gracious Lord, thank You for every blessing You have given me, both seen and unseen. Thank You for life, health, family, provision, and Your endless mercy. Even in difficult moments, I choose to remain grateful because I know You are still working in my life. Help me never take Your goodness for granted. Teach me to appreciate each day, to love others sincerely, and to walk with humility and joy. Fill my heart with thanksgiving and let my life reflect gratitude always. Amen."
  }
];

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */

document.addEventListener("DOMContentLoaded", async () => {
  initializeTemporalContext();
  initializePWAHook();
  registerCoreServiceWorker();

  await loadBibleDataset();

  setupBibleNavigation();

  // Start Rotations
  cycleVerse();
  cyclePrayer();

  // UPDATED ROTATION TIMES
  setInterval(cycleVerse, 40000);
  setInterval(cyclePrayer, 40000);
});

/* ==========================================================================
   UI ENGINE & ROTATION
   ========================================================================== */

function cycleVerse() {
  if (!DOM.verseCardAnchor) return;

  DOM.verseCardAnchor.classList.add('opacity-0', 'translate-y-2');

  setTimeout(() => {
    const verse = DAILY_VERSES[state.vIndex];

    state.currentViewContent = {
      text: verse.text,
      ref: verse.reference
    };

    const isFav = state.favorites.some(
      f => f.reference === verse.reference
    );

    DOM.verseCardAnchor.innerHTML = `
      <div class="relative overflow-hidden rounded-[32px] border border-blue-500/10 bg-slate-900/90 backdrop-blur-2xl p-6 shadow-2xl transition-all duration-500">

        <div class="flex items-center justify-between">
          <p class="text-xs uppercase tracking-[0.25em] text-blue-300 font-semibold">
            Verse of the Day
          </p>

          <button
            onclick="window.CymorBibleDebugBridge.toggleFav()"
            class="text-xl"
          >
            ${isFav ? "❤️" : "♡"}
          </button>
        </div>

        <blockquote class="mt-6 text-xl leading-relaxed text-slate-100 italic">
          "${verse.text}"
        </blockquote>

        <p class="mt-4 text-blue-400 font-semibold text-sm">
          ${verse.reference}
        </p>

        <button
          onclick="window.CymorBibleDebugBridge.shareAsImage('${verse.text.replace(/'/g, "\\'")}', '${verse.reference}')"
          class="mt-6 w-full bg-blue-600/20 border border-blue-500/30 text-blue-400 py-3 rounded-2xl text-xs font-bold active:scale-95 transition-all"
        >
          SHARE AS IMAGE
        </button>
      </div>
    `;

    DOM.verseCardAnchor.classList.remove(
      'opacity-0',
      'translate-y-2'
    );

    state.vIndex =
      (state.vIndex + 1) % DAILY_VERSES.length;

  }, 500);
}

function cyclePrayer() {
  if (!DOM.prayerCardAnchor) return;

  DOM.prayerCardAnchor.classList.add(
    'opacity-0',
    'translate-y-2'
  );

  setTimeout(() => {
    const prayer = DAILY_PRAYERS[state.pIndex];

    DOM.prayerCardAnchor.innerHTML = `
      <div class="relative overflow-hidden rounded-[32px] border border-amber-500/10 bg-slate-900/90 backdrop-blur-2xl p-6 shadow-2xl">

        <p class="text-xs uppercase tracking-[0.25em] text-amber-300 font-semibold mb-4">
          Focus for Today
        </p>

        <h3 class="text-lg font-bold text-white mb-3">
          ${prayer.title}
        </h3>

        <p class="text-slate-300 text-sm leading-relaxed mb-5">
          ${prayer.content}
        </p>

        <button
          onclick="window.CymorBibleDebugBridge.shareAsImage('${prayer.content.replace(/'/g, "\\'")}', '${prayer.title}')"
          class="w-full bg-amber-500/10 border border-amber-500/20 text-amber-400 py-3 rounded-xl text-[10px] font-bold active:scale-95 transition-all"
        >
          SHARE PRAYER IMAGE
        </button>
      </div>
    `;

    DOM.prayerCardAnchor.classList.remove(
      'opacity-0',
      'translate-y-2'
    );

    state.pIndex =
      (state.pIndex + 1) % DAILY_PRAYERS.length;

  }, 500);
}

/* ==========================================================================
   BIBLE LOGIC
   ========================================================================== */

function setupBibleNavigation() {
  if (!DOM.testamentSelect) return;

  DOM.testamentSelect.addEventListener('change', (e) => {
    const val = e.target.value;

    DOM.bookSelect.innerHTML =
      '<option value="">Select Book</option>';

    DOM.chapterSelect.disabled = true;

    if (!val) return;

    const filtered = state.bibleData.filter(
      b => val === 'OT' ? b.id <= 39 : b.id > 39
    );

    filtered.forEach(b =>
      DOM.bookSelect.add(new Option(b.name, b.name))
    );

    DOM.bookSelect.disabled = false;
  });

  DOM.bookSelect.addEventListener('change', (e) => {
    const book = state.bibleData.find(
      b => b.name === e.target.value
    );

    DOM.chapterSelect.innerHTML =
      '<option value="">Select Chapter</option>';

    if (book) {
      book.chapters.forEach((_, i) =>
        DOM.chapterSelect.add(
          new Option(`Chapter ${i + 1}`, i)
        )
      );

      DOM.chapterSelect.disabled = false;
    }
  });

  DOM.chapterSelect.addEventListener('change', (e) => {
    const book = state.bibleData.find(
      b => b.name === DOM.bookSelect.value
    );

    if (book && e.target.value !== "") {
      const idx = parseInt(e.target.value);

      const verses = book.chapters[idx];

      DOM.bibleDisplay.innerHTML = `
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-blue-400 font-bold text-xs uppercase tracking-[0.2em]">
            ${book.name} ${idx + 1}
          </h2>
        </div>

        ${verses.map((v, i) => `
          <div
            class="mb-4 flex gap-4 verse p-2 rounded-lg transition-all"
            onclick="window.CymorBibleDebugBridge.shareAsImage('${v.replace(/'/g, "\\'")}', '${book.name} ${idx+1}:${i+1}')"
          >
            <span class="text-blue-500/50 font-bold text-xs mt-1">
              ${i + 1}
            </span>

            <p class="text-slate-200 text-sm">
              ${v}
            </p>
          </div>
        `).join('')}
      `;
    }
  });
}

async function loadBibleDataset() {
  try {
    const res = await fetch(BIBLE_PATH);

    state.bibleData = await res.json();

    if (DOM.bibleDisplay) {
      DOM.bibleDisplay.innerHTML = `
        <p class="text-slate-500 text-center py-10 text-xs uppercase tracking-widest font-bold">
          Select a testament to begin
        </p>
      `;
    }

  } catch (err) {
    DOM.bibleDisplay.innerHTML = `
      <p class="text-red-400 text-center py-10">
        Error loading scriptures.
      </p>
    `;
  }
}

/* ==========================================================================
   IMAGE SHARING ENGINE
   ========================================================================== */

window.CymorBibleDebugBridge = {

  shareAsImage: async (text, reference) => {
    if (!DOM.shareTemplate) return;

    DOM.shareContent.innerText = `"${text}"`;
    DOM.shareRef.innerText = reference;

    try {
      const canvas = await html2canvas(
        DOM.shareTemplate,
        {
          backgroundColor: "#0F172A",
          scale: 2,
          logging: false,
          useCORS: true
        }
      );

      canvas.toBlob(async (blob) => {

        const file = new File(
          [blob],
          "cymor-bible-share.png",
          { type: "image/png" }
        );

        if (
          navigator.share &&
          navigator.canShare({ files: [file] })
        ) {

          await navigator.share({
            files: [file],
            title: 'Cymor Bible App',
            text: `Check out this word from Cymor Bible: ${reference}`
          });

        } else {

          const link = document.createElement('a');

          link.download = `CymorBible_${reference}.png`;

          link.href = canvas.toDataURL();

          link.click();
        }

      }, "image/png", 1.0);

    } catch (err) {
      console.error("Image generation failed", err);
    }
  },

  toggleFav: () => {
    const v = state.currentViewContent;

    const idx = state.favorites.findIndex(
      f => f.reference === v.ref
    );

    if (idx > -1) {
      state.favorites.splice(idx, 1);
    } else {
      state.favorites.push({
        reference: v.ref,
        text: v.text
      });
    }

    localStorage.setItem(
      "cymorFavorites",
      JSON.stringify(state.favorites)
    );

    cycleVerse();
  }
};

/* ==========================================================================
   UTILITIES
   ========================================================================== */

function initializeTemporalContext() {
  const now = new Date();

  if (DOM.currentDateStr) {
    DOM.currentDateStr.textContent =
      now.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric"
      });
  }

  if (DOM.greetingText) {
    const hrs = now.getHours();

    DOM.greetingText.textContent =
      hrs < 12
        ? "Good Morning"
        : hrs < 18
        ? "Good Afternoon"
        : "Good Evening";
  }
}

function initializePWAHook() {
  let prompt;

  window.addEventListener(
    "beforeinstallprompt",
    (e) => {
      e.preventDefault();

      prompt = e;

      DOM.pwaInstallBtn?.classList.remove("hidden");
    }
  );

  DOM.pwaInstallBtn?.addEventListener(
    "click",
    () => {
      if (prompt) {
        prompt.prompt();

        prompt = null;

        DOM.pwaInstallBtn.classList.add("hidden");
      }
    }
  );
}

async function registerCoreServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("./sw.js")
      .catch(() => {});
  }
}
