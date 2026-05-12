const API_KEY = '2d1c54be44c1c27b0d5eaf172050f257';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_PATH = 'https://image.tmdb.org/t/p/w500';

async function init() {
  const trending = await (await fetch(`${BASE_URL}/trending/all/day?api_key=${API_KEY}`)).json();
  const tv = await (await fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}`)).json();
  const movies = await (await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`)).json();

  renderHero(trending.results[0]);
  renderGrid(tv.results, 'popular-series', true);
  renderGrid(movies.results, 'popular-movies', false);
}

function renderGrid(data, containerId, isWide) {
  const container = document.getElementById(containerId);
  container.innerHTML = data.map(m => `
    <div class="movie-card" onclick="showDetails(${m.id}, '${isWide ? 'tv' : 'movie'}')">
      <img src="${IMG_PATH + (isWide ? m.backdrop_path : m.poster_path)}">
      <div class="card-title">${m.title || m.name}</div>
    </div>
  `).join('');
}

function renderHero(m) {
  const hero = document.getElementById('hero');
  hero.style.backgroundImage = `url(https://image.tmdb.org/t/p/original${m.backdrop_path})`;
  hero.innerHTML = `<div class="hero-overlay"><h1>${m.title || m.name}</h1></div>`;
  hero.onclick = () => showDetails(m.id, m.media_type || 'movie');
}

/* --- SEARCH SYSTEM --- */
document.getElementById('search-input').addEventListener('input', async (e) => {
  const query = e.target.value.trim();
  const title = document.getElementById('movies-title');
  if (query.length < 2) {
    title.innerText = "🎬 Popular Movies";
    init(); // Reset to popular
    return;
  }
  const res = await (await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${query}`)).json();
  title.innerText = `🔍 Results for "${query}"`;
  renderGrid(res.results.filter(i => i.poster_path), 'popular-movies', false);
});

/* --- DETAIL SYSTEM & BACK BUTTON --- */
async function showDetails(id, type) {
  document.getElementById('movie-modal').classList.remove('hidden');
  document.getElementById('home-content').classList.add('hidden');
  
  const details = await (await fetch(`${BASE_URL}/${type}/${id}?api_key=${API_KEY}`)).json();
  const credits = await (await fetch(`${BASE_URL}/${type}/${id}/credits?api_key=${API_KEY}`)).json();

  document.getElementById('modal-body').innerHTML = `
    <img class="modal-header-img" src="${IMG_PATH + details.backdrop_path}">
    <h2 style="margin-top:20px;">${details.title || details.name}</h2>
    <div class="rating">⭐ ${details.vote_average.toFixed(1)} / 10</div>
    <p style="color:#9ca3af; line-height:1.6;">${details.overview}</p>
    <h3 style="margin-top:25px;">Top Cast</h3>
    <div class="cast-row">
      ${credits.cast.slice(0, 8).map(c => `
        <div class="cast-card">
          <img src="${c.profile_path ? IMG_PATH + c.profile_path : 'https://via.placeholder.com/100'}">
          <p>${c.name}</p>
        </div>
      `).join('')}
    </div>
  `;
}

document.querySelector('.back-btn').onclick = () => {
  document.getElementById('movie-modal').classList.add('hidden');
  document.getElementById('home-content').classList.remove('hidden');
};

/* --- BOTTOM NAV CLICK HANDLER --- */
document.querySelectorAll('.nav-item').forEach(item => {
  item.onclick = () => {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    // For navigation: if clicking home, ensure modal is closed
    if (item.dataset.nav === 'home') {
       document.getElementById('movie-modal').classList.add('hidden');
       document.getElementById('home-content').classList.remove('hidden');
    }
  };
});

init();
