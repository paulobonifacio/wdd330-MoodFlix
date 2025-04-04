const moodMap = {
  happy: "I feel joyful and full of love",
  neutral: "I feel balanced and peaceful",
  sad: "I feel sad and lonely",
  excited: "I feel surprised and adventurous",
  angry: "I feel very angry and frustrated",
  scared: "I feel fear and anxiety"
};

function getFavorites() {
  const stored = localStorage.getItem("favorites");
  return stored ? JSON.parse(stored) : [];
}

function saveFavorites(favs) {
  localStorage.setItem("favorites", JSON.stringify(favs));
}

function getWatchHistory() {
  const stored = localStorage.getItem("watchHistory");
  return stored ? JSON.parse(stored) : [];
}

function saveToWatchHistory(movie) {
  const history = getWatchHistory();
  const exists = history.some(item => item.id === movie.id);
  if (!exists) {
      history.push({
          id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path
      });
      localStorage.setItem("watchHistory", JSON.stringify(history));
  }
}

function toggleFavorite(movie) {
  const favorites = getFavorites();
  const index = favorites.findIndex(fav => fav.id === movie.id);
  if (index !== -1) {
      favorites.splice(index, 1);
  } else {
      favorites.push({
          id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path
      });
  }
  saveFavorites(favorites);
}

const moodButtons = document.querySelectorAll(".mood-buttons button");
const recommendationContainer = document.getElementById("recommendationCards");

const HF_API_URL = "https://router.huggingface.co/hf-inference/models/bhadresh-savani/distilbert-base-uncased-emotion";
const HF_API_KEY = "Bearer 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";

async function getEmotionFromText(text) {
  const response = await fetch(HF_API_URL, {
      headers: {
          Authorization: HF_API_KEY,
          "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ inputs: text }),
  });
  const result = await response.json();
  const topEmotion = result[0][0].label;
  console.log("Detected Emotion:", topEmotion);
  return topEmotion;
}

const emotionToGenre = {
  joy: 35,
  sadness: 18,
  anger: 28,
  fear: 27,
  love: 10749,
  surprise: 12
};

const TMDB_API_KEY = "7980428403999719e2cdd03e43e9a631";
const TMDB_API_URL = "https://api.themoviedb.org/3/discover/movie";

async function fetchRecommendations(genreId) {
  const url = `${TMDB_API_URL}?api_key=${TMDB_API_KEY}&with_genres=${genreId}&sort_by=popularity.desc`;
  const response = await fetch(url);
  const data = await response.json();
  document.getElementById("resultsLabel").textContent = "Recommendations based on your mood:";
  displayRecommendations(data.results.slice(0, 4));
}

function displayRecommendations(movies) {
  recommendationContainer.innerHTML = "";
  const favorites = getFavorites();

  movies.forEach(movie => {
      saveToWatchHistory(movie);

      const card = document.createElement("div");
      card.className = "movie-card";

      const isFavorited = favorites.some(fav => fav.id === movie.id);

      card.innerHTML = `
          <span class="favorite-icon ${isFavorited ? "favorited" : ""}" data-id="${movie.id}">★</span>
          <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title}" />
          <p>${movie.title}</p>
      `;

      recommendationContainer.appendChild(card);
  });

  const favoriteIcons = document.querySelectorAll(".favorite-icon");
  favoriteIcons.forEach(icon => {
      icon.addEventListener("click", () => {
          const movieId = parseInt(icon.dataset.id);
          const movie = movies.find(m => m.id === movieId);
          toggleFavorite(movie);
          icon.classList.toggle("favorited");
      });
  });
}

moodButtons.forEach(btn => {
  btn.addEventListener("click", async () => {
      const mood = btn.dataset.mood;
      const moodSentence = moodMap[mood];
      const emotion = await getEmotionFromText(moodSentence);
      const genreId = emotionToGenre[emotion] || 35;
      await fetchRecommendations(genreId);
      saveMoodPreference(mood, emotion, genreId);
      applyMoodTheme(emotion);
  });
});

function applyMoodTheme(emotion) {
  document.body.className = "";
  document.body.classList.add(`theme-${emotion}`);
}

function saveMoodPreference(mood, emotion, genreId) {
  const moodPrefs = JSON.parse(localStorage.getItem("moodPreferences")) || [];
  moodPrefs.push({ mood, emotion, genreId, time: new Date().toISOString() });
  localStorage.setItem("moodPreferences", JSON.stringify(moodPrefs));
}

const searchInput = document.getElementById("searchInput");
const TMDB_SEARCH_URL = "https://api.themoviedb.org/3/search/multi";
let searchTimeout = null;

searchInput.addEventListener("input", () => {
  clearTimeout(searchTimeout);
  const query = searchInput.value.trim();

  if (query.length > 2) {
      searchTimeout = setTimeout(() => {
          searchMovies(query);
      }, 500);
  } else {
      recommendationContainer.innerHTML = "";
  }
});

async function searchMovies(query) {
  const url = `${TMDB_SEARCH_URL}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`;
  const response = await fetch(url);
  const data = await response.json();
  const filtered = data.results.filter(item => item.poster_path);
  document.getElementById("resultsLabel").textContent = `Search Results for "${query}"`;
  displayRecommendations(filtered.slice(0, 6));
}

window.addEventListener("DOMContentLoaded", async () => {
  const response = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}`);
  const data = await response.json();
  document.getElementById("resultsLabel").textContent = "Trending Now";
  displayRecommendations(data.results.slice(0, 6));
});
