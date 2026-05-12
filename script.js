const API_KEY = '2d1c54be44c1c27b0d5eaf172050f257';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_PATH = 'https://image.tmdb.org/t/p/w500';

// Elements
const hero = document.getElementById('hero');
const seriesGrid = document.getElementById('popular-series');
const moviesGrid = document.getElementById('popular-movies');
const searchInput = document.getElementById('search-input');
const modal = document.getElementById('movie-modal');
const modalBody = document.getElementById('modal-body');

/* --- MAIN LOADER --- */
async function init() {
  const trending = await (await fetch(`${BASE_URL}/trending/all/day?api_key=${API_KEY}`)).json();
  const tv = await (await fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}`)).json();
  const movies = await (await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`)).json();

  if(trending.results[0]) setHero(trending.results[0]);
  renderGrid(tv.results, seriesGrid, true);
  renderGrid(movies.results, moviesGrid, false);
}

function setHero(m) {
  hero.style.backgroundImage = `url(https://image.tmdb.org/t/p/original${m.backdrop_path})`;
  hero.innerHTML = `<div class="hero-overlay"><h1>${m.title || m.name}</h1></div>`;
  hero.onclick = () => showDetails(m.id, m.media_type || 'movie');
}

/* --- RENDERER --- */
function renderGrid(list, container, isWide) {
  container.innerHTML = '';
  list.forEach(m => {
    if(!m.poster_path) return;
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.innerHTML = `<img src="${IMG_PATH + (isWide ? m.backdrop_path : m.poster_path)}" loading="lazy">`;
    card.onclick = () => showDetails(m.id, isWide ? 'tv' : 'movie');
    container.appendChild(card);
  });
}

/* --- DETAIL PANEL (MODAL) --- */
async function showDetails(id, type) {
  modal.classList.remove('hidden');
  modalBody.innerHTML = `<p style="padding:40px; text-align:center;">Loading details...</p>`;

  const [details, credits] = await Promise.all([
    fetch(`${BASE_URL}/${type}/${id}?api_key=${API_KEY}`).then(r => r.json()),
    fetch(`${BASE_URL}/${type}/${id}/credits?api_key=${API_KEY}`).then(r => r.json())
  ]);

  modalBody.innerHTML = `
    <img class="modal-header-img" src="${IMG_PATH + details.backdrop_path}">
    <h2>${details.title || details.name}</h2>
    <div class="rating"><i class="fas fa-star"></i> ${details.vote_average.toFixed(1)} / 10</div>
    <p style="font-size:0.9rem; color:#9ca3af; line-height:1.6;">${details.overview}</p>
    
    <h3 style="margin-top:20px; font-size:1rem;">Top Cast</h3>
    <div class="cast-list">
      ${credits.cast.slice(0, 8).map(c => `
        <div class="cast-item">
          <img src="${c.profile_path ? IMG_PATH + c.profile_path : 'https://via.placeholder.com/60'}">
          <p>${c.name}</p>
        </div>
      `).join('')}
    </div>
    <button style="width:100%; padding:15px; background:var(--accent); border:none; border-radius:12px; margin-top:20px; font-weight:bold;">
      <i class="fas fa-play"></i> Watch Now
    </button>
  `;
}

// Close Modal
document.querySelector('.close-modal').onclick = () => modal.classList.add('hidden');

/* --- SEARCH --- */
let timer;
searchInput.onkeyup = (e) => {
  clearTimeout(timer);
  timer = setTimeout(async () => {
    const query = e.target.value.trim();
    if(query.length < 2) return;
    const res = await (await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${query}`)).json();
    // Search renders in the movie grid for space
    renderGrid(res.results.filter(i => i.poster_path), moviesGrid, false);
    document.getElementById('movies-section').querySelector('h3').innerText = `Search: ${query}`;
  }, 500);
};

/* --- BOTTOM NAV INTERACTION --- */
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    const target = btn.dataset.target;
    if(target === 'home') location.reload();
    if(target === 'series') window.scrollTo({top: document.getElementById('trending-section').offsetTop - 100, behavior: 'smooth'});
  };
});

init();
