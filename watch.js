const API = "https://cymormoviehub.onrender.com/api";
const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const type = params.get("type");

let currentSeason = 1;
let currentEpisode = 1;

async function initWatch() {
  if (!id || !type) return (window.location.href = "index.html");

  await loadDetails();
  await loadVideoSource();
  
  // Setup Download and Subtitle buttons with tracking
  setupActionButtons();

  setInterval(saveProgress, 30000);
}

async function loadDetails() {
  try {
    const res = await fetch(`${API}/tmdb/details/${type}/${id}`);
    const data = await res.json();

    document.getElementById("movieTitle").innerText = data.title || data.name;
    document.getElementById("movieDesc").innerText = data.overview;
    
    // Store poster globally so we can save it to downloads later
    window.currentPoster = `https://image.tmdb.org/t/p/w500${data.poster_path}`;

    if (type === "tv") {
      renderEpisodeSelector(data.seasons);
    }
  } catch (err) {
    console.error("Error loading details:", err);
  }
}

async function loadVideoSource() {
  const player = document.getElementById("player");
  
  // THE AD-KILLER: Trap pop-ups by sandboxing the iframe
  player.setAttribute("sandbox", "allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation");

  let endpoint = `${API}/watch/sources/${type}/${id}`;
  if (type === "tv") endpoint += `/${currentSeason}/${currentEpisode}`;

  try {
    const res = await fetch(endpoint);
    const data = await res.json();

    if (data.success) {
      player.src = data.stream.embedUrl;
      // Store download link for the button
      window.currentDownloadUrl = data.stream.downloadUrl || "#";
    }
  } catch (err) {
    player.srcdoc = "<h2 style='color:white;text-align:center;padding-top:20%;'>Source Offline. Try again later.</h2>";
  }
}

function setupActionButtons() {
  const dlBtn = document.getElementById("downloadBtn");
  const subBtn = document.getElementById("subBtn");

  if (dlBtn) {
    dlBtn.onclick = () => {
      // 1. Get the current movie data for the Downloads Tab
      const downloadItem = {
        id: id,
        title: document.getElementById("movieTitle").innerText,
        poster: window.currentPoster || "", 
        date: new Date().toLocaleDateString()
      };

      // 2. Save to localStorage so it appears in the Downloads tab
      let downloads = JSON.parse(localStorage.getItem("my_downloads") || "[]");
      
      if (!downloads.find(d => d.id === downloadItem.id)) {
        downloads.push(downloadItem);
        localStorage.setItem("my_downloads", JSON.stringify(downloads));
      }

      // 3. Trigger the real download
      if (window.currentDownloadUrl && window.currentDownloadUrl !== "#") {
        window.open(window.currentDownloadUrl, '_blank');
      } else {
        alert("Fetching download link... Try again in a second.");
      }
    };
  }

  if (subBtn) {
    subBtn.onclick = () => {
      alert("Subtitles are managed inside the player settings (CC button).");
    };
  }
}

function renderEpisodeSelector(seasons) {
  const container = document.getElementById("episodeList");
  if (!container) return;
  container.innerHTML = "";

  const season = seasons.find(s => s.season_number === currentSeason) || seasons[0];
  
  for (let i = 1; i <= season.episode_count; i++) {
    const btn = document.createElement("button");
    btn.className = `ep-btn ${i === currentEpisode ? 'active' : ''}`;
    btn.innerText = `E${i}`;
    btn.onclick = () => {
      currentEpisode = i;
      loadVideoSource();
      renderEpisodeSelector(seasons);
    };
    container.appendChild(btn);
  }
}

async function saveProgress() {
  try {
    await fetch(`${API}/watch/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, type, season: currentSeason, episode: currentEpisode })
    });
  } catch (e) {
    console.log("Progress save failed.");
  }
}

initWatch();
