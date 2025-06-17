
const key = import.meta.env.VITE_API_KEY;
const baseURL = import.meta.env.VITE_BASE_URL;

// console.log("Api Key:", import.meta.env.VITE_API_KEY);
// console.log("Base URL:", import.meta.env.VITE_BASE_URL);

export default class ApiService {
  
    async discoverByGenres(genreIds = [], page = 1) {
        const withGenres = genreIds.join(",");
        const res = await fetch(
            `${baseURL}/discover/movie?api_key=${key}&language=en-US&sort_by=popularity.desc&include_adult=false&page=${page}&with_genres=${withGenres}`,
        );
        return await res.json();
    }

    async fetchGenres() {
        const res = await fetch(
            `${baseURL}/genre/movie/list?api_key=${key}&language=en-US`,
        );
        const data = await res.json();
        return data.genres; // [{id, name}, …]
    }

    async searchMovies(query, page = 1) {
        const res = await fetch(
            `${baseURL}/search/movie?api_key=${key}&language=en-US&query=${encodeURIComponent(query)}&page=${page}&include_adult=false`,
        );
        return await res.json();
    }

    async getMovieDetails(movieId) {
        const res = await fetch(
            `${baseURL}/movie/${movieId}?api_key=${key}&language=en-US`,
        );
        return await res.json();
    }

    async getPopularMovies(page = 1) {
        const res = await fetch(
            `${baseURL}/movie/popular?api_key=${key}&language=en-US&page=${page}`,
        );
        return await res.json();
    }
}
