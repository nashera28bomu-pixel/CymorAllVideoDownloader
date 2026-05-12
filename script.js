const API_KEY = '2d1c54be44c1c27b0d5eaf172050f257'; 
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_PATH = 'https://image.tmdb.org/t/p/w500';

const hero = document.getElementById('hero');
const popularSeriesGrid = document.getElementById('popular-series');
const popularMoviesGrid = document.getElementById('popular-movies');

async function loadContent() {
    // 1. Load Hero
    const trendingRes = await fetch(`${BASE_URL}/trending/all/day?api_key=${API_KEY}`);
    const trendingData = await trendingRes.json();
    const heroMovie = trendingData.results[0];
    hero.style.backgroundImage = `url(https://image.tmdb.org/t/p/original${heroMovie.backdrop_path})`;
    hero.innerHTML = `<div style="position:absolute; bottom:20px; left:20px;">
                        <h2 style="font-size:1.5rem;">${heroMovie.title || heroMovie.name}</h2>
                        <p style="font-size:0.8rem; color:#ccc;">${heroMovie.release_date || '2026'} | Action</p>
                      </div>`;

    // 2. Load Wide Cards (Series)
    const tvRes = await fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}`);
    const tvData = await tvRes.json();
    renderMovies(tvData.results, popularSeriesGrid, true);

    // 3. Load Tall Cards (Movies)
    const movieRes = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`);
    const movieData = await movieRes.json();
    renderMovies(movieData.results, popularMoviesGrid, false);
}

function renderMovies(movies, container, isWide) {
    container.innerHTML = '';
    movies.forEach(m => {
        const div = document.createElement('div');
        div.classList.add('movie-card');
        const imgPath = isWide ? m.backdrop_path : m.poster_path;
        
        div.innerHTML = `
            <img src="${IMG_PATH}${imgPath}" alt="${m.title || m.name}">
            <div class="card-info">
                <h4>${m.title || m.name}</h4>
            </div>
        `;
        container.appendChild(div);
    });
}

loadContent();
