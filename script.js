const API_KEY = '2d1c54be44c1c27b0d5eaf172050f257';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_PATH = 'https://image.tmdb.org/t/p/w500';

// Multi-Server Embed Links (Change these if you have your own servers)
const SERVERS = {
  vidsrc: (id, type) => `https://vidsrc.me/embed/${type}?tmdb=${id}`,
  superembed: (id, type) => `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1`
};

let debounceTimer;
let favorites = JSON.parse(localStorage.getItem('myList')) || [];

async function init() {
  const genres = await (await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}`)).json();
  renderGenres(genres.genres);
  
  const trending = await (await fetch(`${BASE_URL}/trending/all/day?api_key=${API_KEY}`)).json();
  const movies = await (await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`)).json();

  renderHero(trending.results[0]);
  renderGrid(trending.results.filter(i => i.media_type === 'tv'), 'popular-series', true);
  renderGrid(movies.results, 'main-grid', false);
}

/* --- 1. SEARCH WITH DEBOUNCING --- */
document.getElementById('search-input').addEventListener('input', (e) => {
  clearTimeout(debounceTimer);
  const query = e.target.value.trim();
  
  debounceTimer = setTimeout(async () => {
    if (query.length < 2) {
      document.getElementById('search-overlay').classList.add('hidden');
      return;
    }
    const res = await (await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${query}`)).json();
    renderSearch(res.results);
  }, 500); // 500ms delay to save API calls
});

function renderSearch(results) {
  const overlay = document.getElementById('search-overlay');
  const container = document.getElementById('search-suggestions');
  overlay.classList.remove('hidden');
  container.innerHTML = results.slice(0, 8).map(m => `
    <div class="search-item" onclick="showDetails(${m.id}, '${m.media_type}')">
      <img src="${IMG_PATH + m.poster_path}">
      <div>
        <h4>${m.title || m.name}</h4>
        <p>⭐ ${m.vote_average.toFixed(1)} | ${m.release_date || m.first_air_date || ''}</p>
      </div>
    </div>
  `).join('');
}

/* --- 2. GENRE FILTERING --- */
function renderGenres(list) {
  const container = document.getElementById('genre-container');
  container.innerHTML = list.slice(0, 10).map(g => `
    <div class="genre-tab" onclick="filterByGenre(${g.id}, '${g.name}')">${g.name}</div>
  `).join('');
}

async function filterByGenre(id, name) {
  document.querySelectorAll('.genre-tab').forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');
  const res = await (await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${id}`)).json();
  document.getElementById('grid-title').innerText = `🎬 ${name} Movies`;
  renderGrid(res.results, 'main-grid', false);
}

/* --- 3. VIDEO PLAYER & SUBTITLES --- */
function startStreaming(id, type) {
  const overlay = document.getElementById('player-overlay');
  const iframe = document.getElementById('video-iframe');
  const serverBox = document.getElementById('server-buttons');

  overlay.classList.remove('hidden');
  iframe.src = SERVERS.vidsrc(id, type); // Default server

  serverBox.innerHTML = Object.keys(SERVERS).map(key => `
    <button class="server-btn" onclick="switchServer('${key}', ${id}, '${type}')">Server ${key.toUpperCase()}</button>
  `).join('');
}

function switchServer(key, id, type) {
  document.getElementById('video-iframe').src = SERVERS[key](id, type);
}

document.querySelector('.close-player').onclick = () => {
  document.getElementById('player-overlay').classList.add('hidden');
  document.getElementById('video-iframe').src = ""; // Stop video
};

/* --- 4. DETAILS & MY LIST --- */
async function showDetails(id, type) {
  document.getElementById('search-overlay').classList.add('hidden');
  document.getElementById('movie-modal').classList.remove('hidden');
  document.getElementById('home-content').classList.add('hidden');
  
  const details = await (await fetch(`${BASE_URL}/${type}/${id}?api_key=${API_KEY}`)).json();
  const isFav = favorites.includes(id);

  document.getElementById('modal-body').innerHTML = `
    <img class="modal-header-img" src="${IMG_PATH + (details.backdrop_path || details.poster_path)}">
    <h2>${details.title || details.name}</h2>
    <div class="rating">⭐ ${details.vote_average.toFixed(1)} / 10</div>
    <p>${details.overview}</p>
    <div style="margin-top:20px;">
      <button onclick="startStreaming(${id}, '${type}')" style="background:var(--accent2); color:black; padding:12px 30px; border:none; border-radius:8px; font-weight:bold;">WATCH NOW</button>
      <button onclick="toggleFavorite(${id})" class="favorite-btn ${isFav ? 'active' : ''}">${isFav ? 'In My List' : '+ My List'}</button>
    </div>
  `;
}

function toggleFavorite(id) {
  if (favorites.includes(id)) {
    favorites = favorites.filter(fav => fav !== id);
  } else {
    favorites.push(id);
  }
  localStorage.setItem('myList', JSON.stringify(favorites));
  alert("List Updated!");
}

function renderGrid(data, containerId, isWide) {
  const container = document.getElementById(containerId);
  container.innerHTML = data.map(m => `
    <div class="movie-card" onclick="showDetails(${m.id}, '${m.media_type || (isWide ? 'tv' : 'movie')}')">
      <img src="${IMG_PATH + (isWide ? m.backdrop_path : m.poster_path)}">
      <div class="card-title">${m.title || m.name}</div>
    </div>
  `).join('');
}

function renderHero(m) {
  const hero = document.getElementById('hero');
  hero.style.backgroundImage = `url(https://image.tmdb.org/t/p/original${m.backdrop_path})`;
  hero.innerHTML = `<div class="hero-overlay"><h1>${m.title || m.name}</h1></div>`;
}

document.querySelector('.back-btn').onclick = () => {
  document.getElementById('movie-modal').classList.add('hidden');
  document.getElementById('home-content').classList.remove('hidden');
};

init();
