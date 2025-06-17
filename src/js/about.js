import {
    loadHeaderFooter,
    setActiveNavLink,
    initializeMobileMenu,
} from "./modules/Utils.mjs";

// Initialize utilities
loadHeaderFooter(() => {
    setActiveNavLink();
});

// Initialize about functionality
document.addEventListener("DOMContentLoaded", () => {
    initializeMobileMenu();
});
