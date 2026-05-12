const API = "https://cymormoviehub.onrender.com/api";

const IMG = "https://image.tmdb.org/t/p/w500";

const hero = document.getElementById("hero");
const trending = document.getElementById("trending");
const movies = document.getElementById("movies");
const modal = document.getElementById("modal");
const modalContent = document.getElementById("modalContent");

/* INIT */
async function init() {

  const t = await fetch(`${API}/tmdb/trending`).then(r => r.json());
  const m = await fetch(`${API}/tmdb/movies`).then(r => r.json());

  renderHero(t.results[0]);
  renderGrid(t.results, trending);
  renderGrid(m.results, movies);

  loadContinue();
}

function renderHero(movie) {

  hero.style.backgroundImage =
    `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`;

  hero.innerHTML = `
    <div style="position:absolute;bottom:40px;left:20px;z-index:2;">
      <h1>${movie.title || movie.name}</h1>
      <p style="max-width:500px">${movie.overview}</p>

      <button onclick="openMovie(${movie.id}, 'movie')"
        style="padding:10px 20px;background:#00e5ff;border:none;color:black;border-radius:8px;">
        ▶ Watch
      </button>
    </div>
  `;
}

function renderGrid(data, container) {

  container.innerHTML = "";

  data.forEach(m => {

    if (!m.poster_path) return;

    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <img src="${IMG + m.poster_path}">
      <p>${m.title || m.name}</p>
    `;

    div.onclick = () => openMovie(m.id, m.media_type || "movie");

    container.appendChild(div);
  });
}

/* MOVIE MODAL */
async function openMovie(id, type) {

  const res = await fetch(`${API}/tmdb/details/${type}/${id}`);
  const data = await res.json();

  saveContinue(data);

  modal.classList.remove("hidden");

  modalContent.innerHTML = `
    <h2>${data.title || data.name}</h2>
    <p>${data.overview}</p>

    <button onclick="watchMovie(${id}, '${type}')"
      style="padding:10px 20px;background:#00ff9d;border:none;">
      ▶ Play
    </button>
  `;
}

function watchMovie(id, type) {
  window.location.href = `watch.html?id=${id}&type=${type}`;
}

/* CONTINUE WATCHING */
function saveContinue(movie) {

  let list = JSON.parse(localStorage.getItem("continue")) || [];

  list = list.filter(x => x.id !== movie.id);

  list.unshift(movie);

  localStorage.setItem("continue", JSON.stringify(list.slice(0, 10)));

}

function loadContinue() {

  const list = JSON.parse(localStorage.getItem("continue")) || [];

  renderGrid(list, document.getElementById("continue"));
}

/* SEARCH */
document.getElementById("search").addEventListener("input", async (e) => {

  const q = e.target.value;

  if (q.length < 2) return;

  const res = await fetch(`${API}/tmdb/search?q=${q}`);
  const data = await res.json();

  renderGrid(data.results, trending);
});

window.onclick = e => {
  if (e.target === modal) modal.classList.add("hidden");
};

init();
