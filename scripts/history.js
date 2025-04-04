const historyContainer = document.getElementById("historyContainer");

function getWatchHistory() {
  const stored = localStorage.getItem("watchHistory");
  return stored ? JSON.parse(stored) : [];
}

function removeFromHistory(id) {
  const history = getWatchHistory();
  const updated = history.filter(item => item.id !== id);
  localStorage.setItem("watchHistory", JSON.stringify(updated));
  loadHistory();
}

function loadHistory() {
  const history = getWatchHistory();
  historyContainer.innerHTML = "";

  if (history.length === 0) {
    historyContainer.innerHTML = "<p>No watch history yet.</p>";
    return;
  }

  history.forEach(movie => {
    const card = document.createElement("div");
    card.className = "movie-card";

    card.innerHTML = `
      <span class="favorite-icon" data-id="${movie.id}" title="Remove">🗑️</span>
      <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title}" />
      <p>${movie.title}</p>
    `;

    historyContainer.appendChild(card);
  });

  const icons = document.querySelectorAll(".favorite-icon");
  icons.forEach(icon => {
    icon.addEventListener("click", () => {
      const id = parseInt(icon.dataset.id);
      removeFromHistory(id);
    });
  });
}

loadHistory();
