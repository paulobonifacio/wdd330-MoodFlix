const favoritesContainer = document.getElementById("favoritesContainer");
function getFavorites() {
  const stored = localStorage.getItem("favorites");
  return stored ? JSON.parse(stored) : [];
}

function saveFavorites(favs) {
  localStorage.setItem("favorites", JSON.stringify(favs));
}

function removeFavorite(id) {
  const favorites = getFavorites();
  const updated = favorites.filter(fav => fav.id !== id);
  saveFavorites(updated);
  loadFavorites();
}

function loadFavorites() {
  const favorites = getFavorites();
  favoritesContainer.innerHTML = "";

  if (favorites.length === 0) {
    favoritesContainer.innerHTML = "<p>No favorites saved yet.</p>";
    return;
  }

  favorites.forEach(movie => {
    const card = document.createElement("div");
    card.className = "movie-card";

    card.innerHTML = `
      <span class="favorite-icon favorited" data-id="${movie.id}">★</span>
      <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title}" />
      <p>${movie.title}</p>
    `;

    favoritesContainer.appendChild(card);
  });

  const icons = document.querySelectorAll(".favorite-icon");
  icons.forEach(icon => {
    icon.addEventListener("click", () => {
      const id = parseInt(icon.dataset.id);
      removeFavorite(id);
    });
  });
}

loadFavorites();
