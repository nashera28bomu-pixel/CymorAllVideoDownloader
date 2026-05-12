const API = "https://cymormoviehub.onrender.com/api";

const params = new URLSearchParams(window.location.search);

const id = params.get("id");
const type = params.get("type");

async function load() {

  const res = await fetch(`${API}/trailers/${type}/${id}`);
  const data = await res.json();

  const key = data.trailers[0]?.key;

  document.getElementById("player").src =
    `https://www.youtube.com/embed/${key}?autoplay=1&mute=1`;
}

load();
