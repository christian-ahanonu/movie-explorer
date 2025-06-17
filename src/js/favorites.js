import {
    loadHeaderFooter,
    setActiveNavLink,
    initializeMobileMenu,
} from "./modules/Utils.mjs";
import FavoritesManager from "./modules/Favorites.mjs";

// Initialize utilities
loadHeaderFooter(() => {
    setActiveNavLink();
});

// Initialize favorites functionality
document.addEventListener("DOMContentLoaded", function () {
    new FavoritesManager();
});

document.addEventListener("DOMContentLoaded", () => {
    initializeMobileMenu();
});
