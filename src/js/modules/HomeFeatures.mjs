import ApiService from "./Api.mjs";
import {
    addToFavorites,
    removeFromFavorites,
    getLocalStorage,
} from "./Utils.mjs";

export default class HomeFeatures {
    constructor() {
        this.api = new ApiService();
        this.searchInput = document.querySelector(".search-input");
        this.searchBtn = document.querySelector(".search-btn");
        this.featuredMoviesContainer = document.querySelector(".movies-grid");
        this.searchError = document.querySelector(".search-error");
        this.genres = [];
    }

    async init() {
        await this.fetchGenres();
        this.setupSearchFunctionality();
        await this.loadFeaturedMovies();
    }

    async fetchGenres() {
        try {
            this.genres = await this.api.fetchGenres();
        } catch (error) {
            console.error("Error fetching genres:", error);
        }
    }

    getGenreName(genreId) {
        const genre = this.genres.find((g) => g.id === genreId);
        return genre ? genre.name : "Unknown";
    }

    setupSearchFunctionality() {
        if (this.searchBtn && this.searchInput) {
            this.searchBtn.addEventListener("click", () => this.handleSearch());
            this.searchInput.addEventListener("keypress", (e) => {
                if (e.key === "Enter") {
                    this.handleSearch();
                }
            });
        }
    }

    async handleSearch() {
        const query = this.searchInput.value.trim();

        if (!query) {
            return;
        }

        this.searchBtn.disabled = true;

        try {
            // Directly redirect to movies page with search query
            window.location.href = `/movies/movies.html?search=${encodeURIComponent(query)}`;
        } finally {
            this.searchBtn.disabled = false;
        }
    }

    showError(message) {
        if (this.searchError) {
            this.searchError.textContent = message;
            this.searchError.style.display = "block";
        }
    }

    hideError() {
        if (this.searchError) {
            this.searchError.style.display = "none";
        }
    }

    async loadFeaturedMovies() {
        if (!this.featuredMoviesContainer) return;

        this.showLoadingState();

        try {
            const response = await this.api.getPopularMovies();
            const movies = response.results;

            // Randomly select 3 movies from the popular movies
            const featuredMovies = this.getRandomMovies(movies, 3);

            this.renderFeaturedMovies(featuredMovies);
        } catch (error) {
            this.showFeaturedMoviesError();
        }
    }

    getRandomMovies(movies, count) {
        const shuffled = [...movies].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    showLoadingState() {
        if (this.featuredMoviesContainer) {
            this.featuredMoviesContainer.innerHTML = `
                <div class="loading-state">
                    <div class="loading-spinner"></div>
                    <p>Loading featured movies...</p>
                </div>
            `;
        }
    }

    showFeaturedMoviesError() {
        if (this.featuredMoviesContainer) {
            this.featuredMoviesContainer.innerHTML = `
                <div class="error-state">
                    <p>Failed to load featured movies. Please try again later.</p>
                </div>
            `;
        }
    }

    createMovieCard(movie) {
        const year = new Date(movie.release_date).getFullYear();
        const genre = this.getGenreName(movie.genre_ids[0]);

        return `
            <div class="movie-card featured-movie" data-movie-id="${movie.id}">
                <div class="movie-poster">
                    ${
                        movie.poster_path
                            ? `<img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title} poster">`
                            : '<div class="matrix-text"></div>'
                    }
                    <button class="favorite-btn" data-movie-id="${movie.id}">
                        <span class="heart-icon">❤️</span>
                    </button>
                </div>
                <div class="movie-info">
                    <div class="movie-header">
                        <h3 class="movie-title">${movie.title}</h3>
                        <span class="movie-year">${year}</span>
                    </div>
                    <div class="movie-meta">
                        <div class="rating">
                            ⭐ <span>${movie.vote_average.toFixed(1)}</span>
                        </div>
                        <div class="genre">${genre}</div>
                    </div>
                    <p class="movie-description">${movie.overview}</p>
                </div>
            </div>
        `;
    }

    renderFeaturedMovies(movies) {
        if (this.featuredMoviesContainer) {
            this.featuredMoviesContainer.innerHTML = movies
                .map((movie) => this.createMovieCard(movie))
                .join("");

            this.initializeFavoriteButtons();
        }
    }

    initializeFavoriteButtons() {
        const favoritesButtons = document.querySelectorAll(".favorite-btn");
        const favorites = getLocalStorage("movieFavorites") || [];

        favoritesButtons.forEach((btn) => {
            const movieId = btn.dataset.movieId;
            // Update button state based on favorite status
            if (favorites.some((fav) => fav.id === movieId)) {
                btn.classList.add("favorited");
            }

            btn.addEventListener("click", (e) => {
                const movieCard = e.currentTarget.closest(".movie-card");
                const movie = this.getMovieDataFromCard(movieCard);

                if (e.currentTarget.classList.contains("favorited")) {
                    removeFromFavorites(movie);
                    e.currentTarget.classList.remove("favorited");
                } else {
                    addToFavorites(movie);
                    e.currentTarget.classList.add("favorited");
                }
            });
        });
    }

    getMovieDataFromCard(movieCard) {
        if (!movieCard) return null;

        return {
            id: movieCard.dataset.movieId,
            title: movieCard.querySelector(".movie-title").textContent,
            year: movieCard.querySelector(".movie-year").textContent,
            rating: parseFloat(
                movieCard.querySelector(".rating span").textContent,
            ),
            genre: movieCard.querySelector(".genre").textContent,
            description:
                movieCard.querySelector(".movie-description").textContent,
            posterPath:
                movieCard.querySelector("img")?.src.split("/w500")[1] || null,
        };
    }
}
