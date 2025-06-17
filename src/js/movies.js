import {
    loadHeaderFooter,
    setActiveNavLink,
    initializeMobileMenu,
} from "./modules/Utils.mjs";
import DisplayMovies from "./modules/MovieList.mjs";

// Initialize utilities
loadHeaderFooter(() => {
    setActiveNavLink();
});

// Initialize movies functionality
document.addEventListener("DOMContentLoaded", function () {
    const movies = new DisplayMovies();
    movies.init();
});

document.addEventListener("DOMContentLoaded", () => {
    initializeMobileMenu();
});
