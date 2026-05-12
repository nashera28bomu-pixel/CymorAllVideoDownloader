const BACKEND = "/api";

// Fetch Trending
async function loadHome() {
    const res = await fetch(`${BACKEND}/movies/trending`);
    const data = await res.json();
    // Use your existing UI render logic here
}

// Zero-Cost Download Trigger
function downloadMovie(id, type) {
    // This opens the external download page directly
    window.open(`${BACKEND}/watch/download?id=${id}&type=${type}`, '_blank');
}

loadHome();
