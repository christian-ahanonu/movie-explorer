import ApiService from "./Api.mjs";
import {
    addToFavorites,
    removeFromFavorites,
    getLocalStorage,
} from "./Utils.mjs";

export default class DisplayMovies {
    constructor() {
        this.api = new ApiService();
        this.currentMovies = [];
        this.filteredMovies = [];
        this.currentSearchQuery = "";
        this.currentGenre = "All";
        this.currentPage = 1;
        this.genres = [];
    }

    async init() {
        await this.setupGenreFilter();
        this.setupSearchFunctionality();

        // Check for search parameter in URL
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get("search");

        if (searchQuery) {
            // If there's a search query in the URL, perform the search
            const searchInput = document.querySelector(".movies-search-input");
            if (searchInput) {
                searchInput.value = searchQuery;
                await this.handleSearch();
            }
        } else {
            // If no search query, load initial movies
            await this.loadInitialMovies();
        }

        this.setupLoadMore();
    }

    async loadInitialMovies() {
        try {
            const response = await this.api.getPopularMovies();
            this.currentMovies = this.transformMovieData(response.results);
            this.filteredMovies = [...this.currentMovies];
            this.renderMovies(this.filteredMovies);
        } catch (error) {
            console.error("Error loading initial movies:", error);
            this.showError("Failed to load movies. Please try again later.");
        }
    }

    transformMovieData(movies) {
        return movies.map((movie) => ({
            id: movie.id,
            title: movie.title,
            year: new Date(movie.release_date).getFullYear(),
            rating: movie.vote_average,
            genre: this.getGenreName(movie.genre_ids[0]), // Using first genre for simplicity
            description: movie.overview,
            posterPath: movie.poster_path,
        }));
    }

    getGenreName(genreId) {
        const genre = this.genres.find((g) => g.id === genreId);
        return genre ? genre.name : "Unknown";
    }

    async setupGenreFilter() {
        const genreSelect = document.querySelector(".genre-select");
        if (!genreSelect) return;

        try {
            this.genres = await this.api.fetchGenres();
            const genreOptions = [
                "All",
                ...this.genres.map((genre) => genre.name),
            ];

            genreSelect.innerHTML = genreOptions
                .map((genre) => `<option value="${genre}">${genre}</option>`)
                .join("");

            genreSelect.addEventListener("change", (e) => {
                this.currentGenre = e.target.value;
                this.applyFilters();
            });
        } catch (error) {
            console.error("Error fetching genres:", error);
        }
    }

    setupSearchFunctionality() {
        const searchInput = document.querySelector(".movies-search-input");
        const searchBtn = document.querySelector(".movies-search-btn");

        if (searchInput && searchBtn) {
            searchBtn.addEventListener("click", () => this.handleSearch());
            searchInput.addEventListener("keypress", (e) => {
                if (e.key === "Enter") this.handleSearch();
            });

            // Debounced search
            let searchTimeout;
            searchInput.addEventListener("input", () => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => this.handleSearch(), 300);
            });
        }
    }

    async handleSearch() {
        const searchInput = document.querySelector(".movies-search-input");
        this.currentSearchQuery = searchInput.value.trim();

        if (this.currentSearchQuery) {
            try {
                const response = await this.api.searchMovies(
                    this.currentSearchQuery,
                );
                this.currentMovies = this.transformMovieData(response.results);
                this.filteredMovies = [...this.currentMovies];
                this.renderMovies(this.filteredMovies);

                // Update URL without reloading the page
                const newUrl = new URL(window.location.href);
                newUrl.searchParams.set("search", this.currentSearchQuery);
                window.history.pushState({}, "", newUrl);
            } catch (error) {
                console.error("Error searching movies:", error);
                this.showError("Failed to search movies. Please try again.");
            }
        } else {
            // If search is cleared, load initial movies and update URL
            await this.loadInitialMovies();
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete("search");
            window.history.pushState({}, "", newUrl);
        }
    }

    applyFilters() {
        this.filteredMovies = this.currentMovies.filter((movie) => {
            const matchesGenre =
                this.currentGenre === "All" ||
                movie.genre === this.currentGenre;
            const matchesSearch =
                !this.currentSearchQuery ||
                movie.title
                    .toLowerCase()
                    .includes(this.currentSearchQuery.toLowerCase()) ||
                movie.description
                    .toLowerCase()
                    .includes(this.currentSearchQuery.toLowerCase());
            return matchesGenre && matchesSearch;
        });

        this.renderMovies(this.filteredMovies);
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
                    <button class="favorite-btn" data-movie-id="${movie.id}">
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
                            ⭐ <span>${movie.rating.toFixed(1)}</span>
                        </div>
                        <div class="genre">${movie.genre}</div>
                    </div>
                    <p class="movie-description">${movie.description}</p>
                </div>
            </div>
        `;
    }

    renderMovies(movies) {
        const moviesGrid = document.querySelector(".movies-grid");
        if (!moviesGrid) return;

        if (movies.length === 0) {
            this.showEmptyState();
            return;
        }

        moviesGrid.innerHTML = movies
            .map((movie) => this.createMovieCard(movie))
            .join("");

        this.initializeFavoriteButtons();
    }

    setupLoadMore() {
        const loadMoreBtn = document.querySelector(".load-more-btn");
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener("click", async () => {
                this.currentPage++;
                try {
                    const response = await this.api.getPopularMovies(
                        this.currentPage,
                    );
                    const newMovies = this.transformMovieData(response.results);
                    this.currentMovies = [...this.currentMovies, ...newMovies];
                    this.applyFilters();
                } catch (error) {
                    console.error("Error loading more movies:", error);
                    this.showError(
                        "Failed to load more movies. Please try again.",
                    );
                }
            });
        }
    }

    showEmptyState() {
        const moviesGrid = document.querySelector(".movies-grid");
        if (moviesGrid) {
            moviesGrid.innerHTML = `
                <div class="empty-state">
                    <h3>No movies found</h3>
                    <p>Try adjusting your search or filters</p>
                </div>
            `;
        }
    }

    showError(message) {
        const moviesGrid = document.querySelector(".movies-grid");
        if (moviesGrid) {
            moviesGrid.innerHTML = `
                <div class="error-state">
                    <h3>Error</h3>
                    <p>${message}</p>
                </div>
            `;
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
