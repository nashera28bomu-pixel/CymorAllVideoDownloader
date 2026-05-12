const API = "https://cymormoviehub.onrender.com/api";
const IMG = "https://image.tmdb.org/t/p/w500";

/* SAFE ELEMENT GETTERS */
const hero = document.getElementById("hero");
const trending = document.getElementById("trending");
const movies = document.getElementById("movies");
const modal = document.getElementById("modal");
const modalContent = document.getElementById("modalContent");
const searchInput = document.getElementById("search");

/* INIT */
async function init() {
  try {

    const t = await fetch(`${API}/tmdb/trending`).then(r => r.json());
    const m = await fetch(`${API}/tmdb/movies`).then(r => r.json());

    if (t?.results?.length) {
      renderHero(t.results[0]);
      renderGrid(t.results, trending);
    }

    if (m?.results?.length) {
      renderGrid(m.results, movies);
    }

    loadContinue();

  } catch (err) {
    console.error("Init error:", err);
  }
}

/* HERO */
function renderHero(movie) {
  if (!movie) return;

  const bg = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : "";

  hero.style.backgroundImage = bg ? `url(${bg})` : "none";

  hero.innerHTML = `
    <div style="position:absolute;bottom:40px;left:20px;z-index:2;">
      <h1>${movie.title || movie.name || "Trending"}</h1>
      <p style="max-width:500px">
        ${(movie.overview || "No description available.").substring(0, 180)}
      </p>

      <button onclick="openMovie(${movie.id}, 'movie')"
        style="padding:10px 20px;background:#00e5ff;border:none;color:black;border-radius:8px;">
        ▶ Watch
      </button>
    </div>
  `;
}

/* GRID */
function renderGrid(data, container) {
  if (!container || !Array.isArray(data)) return;

  container.innerHTML = "";

  data.forEach(m => {
    if (!m) return;

    const img = m.poster_path || m.backdrop_path;
    if (!img) return;

    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <img src="${IMG + img}" loading="lazy">
      <p>${m.title || m.name || "Untitled"}</p>
    `;

    div.onclick = () =>
      openMovie(m.id, m.media_type || (m.title ? "movie" : "tv"));

    container.appendChild(div);
  });
}

/* MOVIE MODAL */
async function openMovie(id, type) {
  try {

    const res = await fetch(`${API}/tmdb/details/${type}/${id}`);
    const data = await res.json();

    if (!data) return;

    saveContinue(data);

    modal.classList.remove("hidden");

    modalContent.innerHTML = `
      <h2>${data.title || data.name}</h2>
      <p>${(data.overview || "").substring(0, 300)}</p>

      <button onclick="watchMovie(${id}, '${type}')"
        style="padding:10px 20px;background:#00ff9d;border:none;">
        ▶ Play
      </button>
    `;

  } catch (err) {
    console.error("openMovie error:", err);
  }
}

function watchMovie(id, type) {
  window.location.href = `watch.html?id=${id}&type=${type}`;
}

/* CONTINUE WATCHING */
function saveContinue(movie) {
  if (!movie) return;

  let list = JSON.parse(localStorage.getItem("continue")) || [];

  list = list.filter(x => x?.id !== movie.id);

  list.unshift(movie);

  localStorage.setItem("continue", JSON.stringify(list.slice(0, 10)));
}

function loadContinue() {
  const list = JSON.parse(localStorage.getItem("continue")) || [];
  renderGrid(list, document.getElementById("continue"));
}

/* SEARCH (SAFE + FIXED) */
if (searchInput) {
  searchInput.addEventListener("input", async (e) => {

    const q = e.target.value.trim();
    if (q.length < 2) return;

    try {

      const res = await fetch(`${API}/tmdb/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();

      if (data?.results) {
        renderGrid(data.results, trending);
      }

    } catch (err) {
      console.error("Search error:", err);
    }

  });
}

/* MODAL CLOSE */
window.onclick = (e) => {
  if (e.target === modal) modal.classList.add("hidden");
};

init();
