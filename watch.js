const API = "https://cymormoviehub.onrender.com/api";
const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const type = params.get("type");

// State management
let currentSeason = 1;
let currentEpisode = 1;

/**
 * INIT: Loads the video and the metadata
 */
async function initWatch() {
  if (!id || !type) return (window.location.href = "index.html");

  // 1. Fetch Movie/Show Details for the UI
  await loadDetails();

  // 2. Load the actual video source
  await loadVideoSource();

  // 3. Start saving progress every 30 seconds
  setInterval(saveProgress, 30000);
}

/**
 * Loads metadata (Title, Description, and Episode list if TV)
 */
async function loadDetails() {
  try {
    const res = await fetch(`${API}/tmdb/details/${type}/${id}`);
    const data = await res.json();

    document.getElementById("movieTitle").innerText = data.title || data.name;
    document.getElementById("movieDesc").innerText = data.overview;

    if (type === "tv") {
      renderEpisodeSelector(data.seasons);
    }
  } catch (err) {
    console.error("Error loading details:", err);
  }
}

/**
 * Switches the iframe source to the actual stream
 */
async function loadVideoSource() {
  const player = document.getElementById("player");
  
  // Use the new sources route we created in the backend
  let endpoint = `${API}/watch/sources/${type}/${id}`;
  if (type === "tv") endpoint += `/${currentSeason}/${currentEpisode}`;

  try {
    const res = await fetch(endpoint);
    const data = await res.json();

    if (data.success) {
      // Point the iframe to our streaming provider
      player.src = data.stream.embedUrl;
    }
  } catch (err) {
    player.srcdoc = "<h2 style='color:white;text-align:center;'>Source temporarily unavailable</h2>";
  }
}

/**
 * Renders the Episode Grid for TV Shows
 */
function renderEpisodeSelector(seasons) {
  const container = document.getElementById("episodeList");
  if (!container) return;
  container.innerHTML = "";

  // For simplicity, we'll show episodes of the current selected season
  const season = seasons.find(s => s.season_number === currentSeason) || seasons[0];
  
  for (let i = 1; i <= season.episode_count; i++) {
    const btn = document.createElement("button");
    btn.className = `ep-btn ${i === currentEpisode ? 'active' : ''}`;
    btn.innerText = `Ep ${i}`;
    btn.onclick = () => {
      currentEpisode = i;
      loadVideoSource();
      renderEpisodeSelector(seasons); // Refresh active state
    };
    container.appendChild(btn);
  }
}

/**
 * Sends current watch data to our Render backend
 */
async function saveProgress() {
  const timestamp = 0; // If using a custom player, get player.currentTime
  
  await fetch(`${API}/watch/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id,
      type,
      season: currentSeason,
      episode: currentEpisode,
      timestamp: timestamp
    })
  });
}

// Start the page
initWatch();
