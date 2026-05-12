// Paste your actual API Key here
const API_KEY = '2d1c54be44c1c27b0d5eaf172050f257'; 

// TMDB Configuration
const API_URL = 'https://api.themoviedb.org/3';
const IMG_PATH = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_PATH = 'https://image.tmdb.org/t/p/original';

// URL Builders
const TRENDING_URL = `${API_URL}/trending/movie/week?api_key=${API_KEY}`;
const NEW_RELEASES_URL = `${API_URL}/movie/now_playing?api_key=${API_KEY}&region=US`;
const SEARCH_URL = `${API_URL}/search/movie?api_key=${API_KEY}&query=`;

// DOM Elements
const heroSection = document.getElementById('hero');
const heroTitle = document.getElementById('hero-title');
const heroDesc = document.getElementById('hero-desc');
const heroBackdrop = document.getElementById('hero-backdrop');
const trendingGrid = document.getElementById('trending-grid');
const newGrid = document.getElementById('new-grid');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');

const modal = document.getElementById('movie-modal');
const modalDetails = document.getElementById('modal-details');
const closeModal = document.querySelector('.close-modal');

/**
 * -------------------------------------
 * CORE FUNCTIONS
 * -------------------------------------
 */

// Universal function to fetch and display movies in a specific grid
async function fetchAndDisplay(url, gridElement, isHero = false) {
    try {
        const res = await fetch(url);
        const data = await res.json();
        
        if (!data.results || data.results.length === 0) return;

        // If it's the hero section, populate the top banner
        if (isHero) {
            populateHero(data.results[0]);
        }
        
        // Render the remaining movies in the grid
        renderMovies(data.results, gridElement);
    } catch (error) {
        console.error('Fetch Error:', error);
    }
}

// Populate the top Hero featured banner
function populateHero(movie) {
    heroSection.classList.remove('hidden');
    heroTitle.innerText = movie.title;
    heroDesc.innerText = movie.overview;
    heroBackdrop.style.backgroundImage = `url(${BACKDROP_PATH + movie.backdrop_path})`;
}

// Generate movie cards and add to grid
function renderMovies(movies, container) {
    container.innerHTML = '';
    
    movies.forEach(movie => {
        if (!movie.poster_path) return; // Skip movies without posters

        const card = document.createElement('div');
        card.classList.add('movie-card');
        card.addEventListener('click', () => openMovieModal(movie.id));

        card.innerHTML = `
            <img src="${IMG_PATH + movie.poster_path}" alt="${movie.title}" loading="lazy">
            <div class="movie-title-wrap">
                <p class="card-title">${movie.title}</p>
                <span class="card-rating"><i class="fas fa-star"></i> ${movie.vote_average.toFixed(1)}</span>
            </div>
        `;
        container.appendChild(card);
    });
}

/**
 * -------------------------------------
 * SEARCH FUNCTIONALITY
 * -------------------------------------
 */
function handleSearch() {
    const query = searchInput.value.trim();
    if (!query) return;

    // Reset grids and populate with search results
    trendingGrid.innerHTML = '<p class="text-muted text-xs">Searching...</p>';
    newGrid.innerHTML = '';
    heroSection.classList.add('hidden'); // Hide hero during search

    fetchAndDisplay(SEARCH_URL + query, trendingGrid);
}

searchBtn.addEventListener('click', handleSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});

/**
 * -------------------------------------
 * MODAL (MOVIE DETAILS) POPUP
 * -------------------------------------
 */
async function openMovieModal(movieId) {
    try {
        modal.classList.remove('hidden');
        modalDetails.innerHTML = '<p class="text-muted">Loading...</p>';

        const res = await fetch(`${API_URL}/movie/${movieId}?api_key=${API_KEY}`);
        const movie = await res.json();

        modalDetails.innerHTML = `
            <h2>${movie.title}</h2>
            <img src="${IMG_PATH + movie.poster_path}" alt="${movie.title}">
            <p><strong>Rating:</strong> <span class="text-purple">${movie.vote_average.toFixed(1)}</span></p>
            <p><strong>Released:</strong> ${movie.release_date.split('-')[0]}</p>
            <p class="text-muted mt-2">${movie.overview}</p>
        `;
    } catch (error) {
        modalDetails.innerHTML = '<p class="text-muted">Error loading details.</p>';
    }
}

closeModal.addEventListener('click', () => modal.classList.add('hidden'));
window.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
});

/**
 * -------------------------------------
 * INITIALIZE SITE
 * -------------------------------------
 */
// 1. Fetch data for Hero and Trending Row
fetchAndDisplay(TRENDING_URL, trendingGrid, true); 

// 2. Fetch data for New Releases Row
fetchAndDisplay(NEW_RELEASES_URL, newGrid); 
