/* ============================================================
   CYMOR BIBLE — SHARED CORE
   Developed by Legendary Smiley Cymor · Victorious Production
   Include this file on every page (before page-specific scripts):
   <script src="./cymor-shared.js"></script>
   ============================================================ */

const CYMOR = (function () {

  // ---------- LANGUAGE / VERSION CONFIG ----------
  // "source" tells fetchVerse/fetchChapter which API shape to use.
  // wldeh  -> https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/{id}/books/{book}/chapters/{c}/verses/{v}.json
  // bibleapi -> https://bible-api.com/{book}+{c}:{v}?translation={code}   (used only where wldeh has no version)
  const LANGS = {
    en:  { label: "English",  flag: "🇬🇧", source: "wldeh",   id: "en-kjv",     name: "King James Version" },
    sw:  { label: "Swahili",  flag: "🇰🇪", source: "wldeh",   id: "swh-onen",   name: "Neno: Biblia Takatifu" },
    fr:  { label: "Français", flag: "🇫🇷", source: "bibleapi", id: "lsg",       name: "Louis Segond 1910" },
    de:  { label: "Deutsch",  flag: "🇩🇪", source: "wldeh",   id: "de-luther1912", name: "Lutherbibel 1912" },
    ki:  { label: "Gĩkũyũ",   flag: "🇰🇪", source: "wldeh",   id: "ki-kgnk",    name: "Kiugo Gĩtheru Kĩa Ngai" },
    luo: { label: "Dholuo",   flag: "🇰🇪", source: "wldeh",   id: "luo-onlt",   name: "Loko Manyien" }
  };

  // English reading version options (for the main reader, independent of parallel language)
  const EN_VERSIONS = {
    kjv: { id: "en-kjv", label: "King James Version (KJV)" },
    web: { id: "en-web", label: "World English Bible (WEB)" }
  };

  // ---------- BOOK LIST (66 books, wldeh slug convention: lowercase, numbers glued to name) ----------
  const BOOKS = [
    ["genesis","Genesis",50],["exodus","Exodus",40],["leviticus","Leviticus",27],["numbers","Numbers",36],
    ["deuteronomy","Deuteronomy",34],["joshua","Joshua",24],["judges","Judges",21],["ruth","Ruth",4],
    ["1samuel","1 Samuel",31],["2samuel","2 Samuel",24],["1kings","1 Kings",22],["2kings","2 Kings",25],
    ["1chronicles","1 Chronicles",29],["2chronicles","2 Chronicles",36],["ezra","Ezra",10],["nehemiah","Nehemiah",13],
    ["esther","Esther",10],["job","Job",42],["psalms","Psalms",150],["proverbs","Proverbs",31],
    ["ecclesiastes","Ecclesiastes",12],["songofsolomon","Song of Solomon",8],["isaiah","Isaiah",66],
    ["jeremiah","Jeremiah",52],["lamentations","Lamentations",5],["ezekiel","Ezekiel",48],["daniel","Daniel",12],
    ["hosea","Hosea",14],["joel","Joel",3],["amos","Amos",9],["obadiah","Obadiah",1],["jonah","Jonah",4],
    ["micah","Micah",7],["nahum","Nahum",3],["habakkuk","Habakkuk",3],["zephaniah","Zephaniah",3],
    ["haggai","Haggai",2],["zechariah","Zechariah",14],["malachi","Malachi",4],
    ["matthew","Matthew",28],["mark","Mark",16],["luke","Luke",24],["john","John",21],["acts","Acts",28],
    ["romans","Romans",16],["1corinthians","1 Corinthians",16],["2corinthians","2 Corinthians",13],
    ["galatians","Galatians",6],["ephesians","Ephesians",6],["philippians","Philippians",4],
    ["colossians","Colossians",4],["1thessalonians","1 Thessalonians",5],["2thessalonians","2 Thessalonians",3],
    ["1timothy","1 Timothy",6],["2timothy","2 Timothy",4],["titus","Titus",3],["philemon","Philemon",1],
    ["hebrews","Hebrews",13],["james","James",5],["1peter","1 Peter",5],["2peter","2 Peter",3],
    ["1john","1 John",5],["2john","2 John",1],["3john","3 John",1],["jude","Jude",1],["revelation","Revelation",22]
  ];

  // ---------- CURATED DAILY VERSE POOL (rotates by day-of-year, same verse for everyone that day) ----------
  const DAILY_REFS = [
    ["john",3,16],["psalms",23,1],["philippians",4,13],["jeremiah",29,11],["proverbs",3,5],
    ["romans",8,28],["isaiah",41,10],["joshua",1,9],["psalms",46,1],["matthew",6,33],
    ["2corinthians",5,17],["psalms",119,105],["romans",12,2],["philippians",4,6],["1corinthians",13,4],
    ["galatians",5,22],["ephesians",2,8],["hebrews",11,1],["psalms",27,1],["isaiah",40,31],
    ["matthew",11,28],["romans",5,8],["psalms",34,18],["proverbs",16,3],["1peter",5,7],
    ["psalms",121,1],["deuteronomy",31,6],["john",14,27],["romans",8,38],["psalms",37,4],
    ["nahum",1,7],["ephesians",6,10],["2timothy",1,7],["colossians",3,23],["psalms",91,1],
    ["isaiah",26,3],["philippians",4,19],["matthew",28,20],["psalms",118,24],["james",1,2],
    ["1john",4,19],["psalms",103,1],["lamentations",3,22],["romans",15,13],["proverbs",18,10],
    ["psalms",139,14],["habakkuk",3,19],["hebrews",13,8],["psalms",56,3],["isaiah",43,2]
  ];

  function seededDayIndex(poolLength) {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now - start) / 86400000);
    return dayOfYear % poolLength;
  }

  function getTodayVerseRef() {
    return DAILY_REFS[seededDayIndex(DAILY_REFS.length)];
  }

  // ---------- FETCH LAYER (normalizes every source to { text, book, chapter, verse, version }) ----------
  async function fetchVerse(bookSlug, chapter, verse, versionCode) {
    const lang = LANGS[versionCode] || { source: "wldeh", id: versionCode };
    const cacheKey = `cymor:v:${versionCode}:${bookSlug}:${chapter}:${verse}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);

    let result;
    if (lang.source === "bibleapi") {
      const bookName = (BOOKS.find(b => b[0] === bookSlug) || [,bookSlug])[1];
      const url = `https://bible-api.com/${encodeURIComponent(bookName)}+${chapter}:${verse}?translation=${lang.id}`;
      const res = await fetch(url);
      const data = await res.json();
      result = { text: (data.text || "").trim(), book: bookName, chapter, verse, version: lang.id };
    } else {
      const id = lang.id || versionCode;
      const url = `https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/${id}/books/${bookSlug}/chapters/${chapter}/verses/${verse}.json`;
      const res = await fetch(url);
      const data = await res.json();
      result = { text: (data.text || "").trim(), book: bookSlug, chapter, verse, version: id };
    }
    try { localStorage.setItem(cacheKey, JSON.stringify(result)); } catch (e) {}
    return result;
  }

  async function fetchChapter(bookSlug, chapter, versionCode) {
    const lang = LANGS[versionCode] || { source: "wldeh", id: versionCode };
    const cacheKey = `cymor:c:${versionCode}:${bookSlug}:${chapter}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);

    let verses = [];
    if (lang.source === "bibleapi") {
      const bookName = (BOOKS.find(b => b[0] === bookSlug) || [,bookSlug])[1];
      const url = `https://bible-api.com/${encodeURIComponent(bookName)}+${chapter}?translation=${lang.id}`;
      const res = await fetch(url);
      const data = await res.json();
      verses = (data.verses || []).map(v => ({ verse: v.verse, text: v.text.trim() }));
    } else {
      const id = lang.id || versionCode;
      const url = `https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/${id}/books/${bookSlug}/chapters/${chapter}.json`;
      const res = await fetch(url);
      const data = await res.json();
      const raw = data.data || data.verses || [];
      verses = raw.map((v, i) => ({ verse: v.verse || i + 1, text: (v.text || "").trim() }));
    }
    const result = { verses };
    try { localStorage.setItem(cacheKey, JSON.stringify(result)); } catch (e) {}
    return result;
  }

  // ---------- SETTINGS ----------
  const DEFAULT_SETTINGS = {
    fontSize: 18,
    fontFamily: "serif",
    theme: "dark",
    version: "kjv",
    parallelLang: null,
    name: null
  };

  function getSettings() {
    try {
      return Object.assign({}, DEFAULT_SETTINGS, JSON.parse(localStorage.getItem("cymorSettings") || "{}"));
    } catch (e) { return { ...DEFAULT_SETTINGS }; }
  }
  function setSettings(patch) {
    const merged = Object.assign(getSettings(), patch);
    localStorage.setItem("cymorSettings", JSON.stringify(merged));
    return merged;
  }

  // ---------- STREAKS ----------
  function bumpStreak(key) {
    const today = new Date().toDateString();
    const raw = JSON.parse(localStorage.getItem(`cymorStreak:${key}`) || '{"count":0,"last":null}');
    if (raw.last === today) return raw.count;
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    raw.count = (raw.last === yesterday) ? raw.count + 1 : 1;
    raw.last = today;
    localStorage.setItem(`cymorStreak:${key}`, JSON.stringify(raw));
    return raw.count;
  }
  function getStreak(key) {
    return JSON.parse(localStorage.getItem(`cymorStreak:${key}`) || '{"count":0,"last":null}').count;
  }

  // ---------- SHARE-AS-IMAGE WITH WATERMARK ----------
  // Draws a vertical-format card (good for stories) with gold-leaf accent + watermark, then
  // triggers the native share sheet (falls back to download).
  async function shareAsImage({ title, body, reference, accent = "#f59e0b" }) {
    const W = 1080, H = 1350;
    const canvas = document.createElement("canvas");
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d");

    // background
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#0F172A");
    bg.addColorStop(1, "#1e293b");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // gold hairline frame
    ctx.strokeStyle = accent;
    ctx.lineWidth = 3;
    ctx.strokeRect(48, 48, W - 96, H - 96);

    // eyebrow label
    ctx.fillStyle = accent;
    ctx.font = "600 28px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(title.toUpperCase(), W / 2, 200);

    // body text, wrapped
    ctx.fillStyle = "#F1F5F9";
    ctx.font = "italic 48px Georgia, serif";
    const words = body.split(" ");
    let line = "", y = 480, lines = [];
    const maxWidth = W - 200;
    for (const w of words) {
      const test = line + w + " ";
      if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = w + " "; }
      else line = test;
    }
    lines.push(line);
    const startY = H / 2 - (lines.length * 60) / 2;
    lines.forEach((l, i) => ctx.fillText(l.trim(), W / 2, startY + i * 64));

    // reference
    ctx.fillStyle = accent;
    ctx.font = "600 34px Inter, sans-serif";
    ctx.fillText(reference, W / 2, startY + lines.length * 64 + 80);

    // watermark
    ctx.fillStyle = "rgba(241,245,249,0.55)";
    ctx.font = "600 26px Inter, sans-serif";
    ctx.fillText("✝ Cymor Bible  ·  by Legendary Smiley Cymor", W / 2, H - 90);

    const blob = await new Promise(res => canvas.toBlob(res, "image/png"));
    const file = new File([blob], "cymor-bible-share.png", { type: "image/png" });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title, text: `${body} — ${reference}` });
    } else {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "cymor-bible-share.png";
      link.click();
    }
  }

  // ---------- PUSH / NOTIFICATIONS ----------
  async function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return null;
    try { return await navigator.serviceWorker.register("./sw.js"); }
    catch (e) { console.warn("SW registration failed", e); return null; }
  }

  function scheduleLocalReminder(hour, minute, title, body) {
    // Lightweight client-side reminder using Notification API when the tab/PWA is open,
    // paired with a daily check in sw.js for background delivery where supported.
    const reminders = JSON.parse(localStorage.getItem("cymorReminders") || "[]");
    reminders.push({ hour, minute, title, body, id: Date.now() });
    localStorage.setItem("cymorReminders", JSON.stringify(reminders));
  }

  return {
    LANGS, EN_VERSIONS, BOOKS, DAILY_REFS,
    getTodayVerseRef, fetchVerse, fetchChapter,
    getSettings, setSettings,
    bumpStreak, getStreak,
    shareAsImage, registerServiceWorker, scheduleLocalReminder
  };
})();
