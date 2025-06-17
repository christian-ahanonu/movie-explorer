import {
    loadHeaderFooter,
    setActiveNavLink,
    initializeMobileMenu,
} from "./modules/Utils.mjs";
import HomeFeatures from "./modules/HomeFeatures.mjs";

// Initialize utilities
loadHeaderFooter(() => {
    setActiveNavLink();
});

// Initialize mobile menu
document.addEventListener("DOMContentLoaded", () => {
    initializeMobileMenu();
});

// Initialize home page functionality
document.addEventListener("DOMContentLoaded", function () {
    const home = new HomeFeatures();
    home.init();
});
