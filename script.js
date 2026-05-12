const API_KEY = '2d1c54be44c1c27b0d5eaf172050f257';

const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_PATH = 'https://image.tmdb.org/t/p/w500';

const hero = document.getElementById('hero');

const popularSeriesGrid =
document.getElementById('popular-series');

const popularMoviesGrid =
document.getElementById('popular-movies');

const searchResults =
document.getElementById('search-results');

const searchInput =
document.getElementById('search-input');

/* =========================
   LOAD MAIN CONTENT
========================= */

async function loadContent() {

  try {

    /* HERO SECTION */

    const trendingRes = await fetch(
      `${BASE_URL}/trending/all/day?api_key=${API_KEY}`
    );

    const trendingData = await trendingRes.json();

    const heroMovie =
      trendingData.results &&
      trendingData.results.length > 0
      ? trendingData.results[0]
      : null;

    if (heroMovie) {

      const heroImage =
        heroMovie.backdrop_path ||
        heroMovie.poster_path;

      hero.style.backgroundImage =
        `url(https://image.tmdb.org/t/p/original${heroImage})`;

      hero.innerHTML = `
        <div class="hero-overlay">

          <h1 class="hero-title">
            ${heroMovie.title || heroMovie.name}
          </h1>

          <p class="hero-description">
            ${
              heroMovie.overview
              ? heroMovie.overview.substring(0, 180) + '...'
              : 'No description available.'
            }
          </p>

        </div>
      `;
    }

    /* POPULAR SERIES */

    const tvRes = await fetch(
      `${BASE_URL}/tv/popular?api_key=${API_KEY}`
    );

    const tvData = await tvRes.json();

    renderMovies(
      tvData.results || [],
      popularSeriesGrid,
      true
    );

    /* POPULAR MOVIES */

    const movieRes = await fetch(
      `${BASE_URL}/movie/popular?api_key=${API_KEY}`
    );

    const movieData = await movieRes.json();

    renderMovies(
      movieData.results || [],
      popularMoviesGrid,
      false
    );

  } catch (error) {

    console.error(
      'Error loading content:',
      error
    );

    hero.innerHTML = `
      <div class="hero-overlay">
        <h1 class="hero-title">
          Failed to load movies
        </h1>

        <p class="hero-description">
          Please check your internet connection.
        </p>
      </div>
    `;
  }

}

/* =========================
   RENDER MOVIES
========================= */

function renderMovies(
  movies,
  container,
  wide = false
) {

  container.innerHTML = '';

  if (!movies.length) {

    container.innerHTML = `
      <p style="
        color: #9ca3af;
        padding: 10px;
      ">
        No movies found.
      </p>
    `;

    return;
  }

  movies.forEach(movie => {

    const card =
      document.createElement('div');

    card.classList.add('movie-card');

    /* IMAGE FALLBACK */

    const image =
      wide
      ? (
          movie.backdrop_path ||
          movie.poster_path
        )
      : (
          movie.poster_path ||
          movie.backdrop_path
        );

    /* SKIP EMPTY IMAGES */

    if (!image) return;

    card.innerHTML = `

      <img
        src="${IMG_PATH}${image}"
        alt="${movie.title || movie.name}"
        loading="lazy"
      >

      <div class="card-info">

        <h4>
          ${movie.title || movie.name}
        </h4>

        <p>
          ${
            movie.overview
            ? movie.overview.substring(0, 80) + '...'
            : 'No description available.'
          }
        </p>

      </div>

    `;

    /* CLICK EFFECT */

    card.addEventListener('click', () => {

      alert(
        `${movie.title || movie.name}\n\n` +
        `${
          movie.overview ||
          'No description available.'
        }`
      );

    });

    container.appendChild(card);

  });

}

/* =========================
   SEARCH SYSTEM
========================= */

let searchTimeout;

searchInput.addEventListener(
  'keyup',
  (e) => {

    clearTimeout(searchTimeout);

    searchTimeout = setTimeout(
      async () => {

        const query =
          e.target.value.trim();

        if (query.length < 2) {

          searchResults.innerHTML = '';

          return;
        }

        try {

          const res = await fetch(

            `${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}`

          );

          const data = await res.json();

          const filteredResults =
            data.results.filter(
              item =>
                item.media_type === 'movie' ||
                item.media_type === 'tv'
            );

          renderMovies(
            filteredResults,
            searchResults,
            false
          );

        } catch (error) {

          console.error(
            'Search error:',
            error
          );

        }

      },

      400
    );

  }
);

/* =========================
   BOTTOM NAVIGATION
========================= */

const navItems =
document.querySelectorAll('.nav-item');

navItems.forEach(item => {

  item.addEventListener('click', () => {

    navItems.forEach(nav =>
      nav.classList.remove('active')
    );

    item.classList.add('active');

  });

});

/* =========================
   CATEGORY CHIPS
========================= */

const chips =
document.querySelectorAll('.chip');

chips.forEach(chip => {

  chip.addEventListener('click', () => {

    chips.forEach(c =>
      c.classList.remove('active')
    );

    chip.classList.add('active');

  });

});

/* =========================
   START APP
========================= */

loadContent();
