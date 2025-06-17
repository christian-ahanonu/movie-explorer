import {
    getLocalStorage,
    setLocalStorage,
    updateFavoritesCount,
    addToFavorites,
    removeFromFavorites,
    showNotification,
} from "./Utils.mjs";

export default class FavoritesManager {
    constructor() {
        this.favorites = getLocalStorage("movieFavorites") || [];
        this.favoritesGrid = document.querySelector("#favorites-grid");
        this.emptyState = document.querySelector(".empty-state");
        this.favoritesCount = document.querySelector(".favorites-count");
        this.init();
    }

    init() {
        updateFavoritesCount(this.favorites.length);
        this.renderFavorites();
        this.setupEventListeners();
    }

    setupEventListeners() {
        if (this.favoritesGrid) {
            this.favoritesGrid.addEventListener("click", (e) => {
                const favoriteBtn = e.target.closest(".favorite-btn");
                if (favoriteBtn) {
                    const movieId = favoriteBtn.dataset.movieId;
                    this.handleFavoriteClick(movieId);
                }
            });
        }
    }

    handleFavoriteClick(movieId) {
        const movie = this.favorites.find((m) => m.id === movieId);
        if (movie) {
            removeFromFavorites(movie);
            this.favorites = getLocalStorage("movieFavorites") || [];
            this.renderFavorites();
        }
    }

    createMovieCard(movie) {
        return `
            <div class="movie-card" data-movie-id="${movie.id}">
                <div class="movie-poster">
                    ${
                        movie.posterPath
                            ? `<img src="https://image.tmdb.org/t/p/w500${movie.posterPath}" alt="${movie.title} poster">`
                            : '<div class="matrix-text"></div>'
                    }
                    <button class="favorite-btn favorited" data-movie-id="${movie.id}">
                        <span class="heart-icon">❤️</span>
                    </button>
                </div>
                <div class="movie-info">
                    <div class="movie-header">
                        <h3 class="movie-title">${movie.title}</h3>
                        <span class="movie-year">${movie.year}</span>
                    </div>
                    <div class="movie-meta">
                        <div class="rating">
                            ⭐ <span>${movie.rating}</span>
                        </div>
                        <div class="genre">${movie.genre}</div>
                    </div>
                    <p class="movie-description">${movie.description}</p>
                </div>
            </div>
        `;
    }

    renderFavorites() {
        if (!this.favoritesGrid) return;

        if (this.favorites.length === 0) {
            this.showEmptyState();
        } else {
            this.showFavorites();
        }

        updateFavoritesCount(this.favorites.length);
    }

    showEmptyState() {
        if (this.favoritesGrid && this.emptyState) {
            this.favoritesGrid.style.display = "none";
            this.emptyState.style.display = "block";
        }
    }

    showFavorites() {
        if (this.favoritesGrid && this.emptyState) {
            this.favoritesGrid.style.display = "grid";
            this.emptyState.style.display = "none";
            this.favoritesGrid.innerHTML = this.favorites
                .map((movie) => this.createMovieCard(movie))
                .join("");
        }
    }
}
