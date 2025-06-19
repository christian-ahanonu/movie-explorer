// retrieve data from localstorage
export function getLocalStorage(key) {
    return JSON.parse(localStorage.getItem(key));
}

// save data to local storage
export function setLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// Update current year in footer
export function updateCurrentYear() {
    const currentYear = new Date().getFullYear();
    const yearElement = document.getElementById("c-date");
    if (yearElement) {
        yearElement.textContent = currentYear;
    }
}

// Load header and footer
export async function loadHeaderFooter(callback) {
    const headerTemplate = await loadTemplate("../../partials/header.html");
    const footerTemplate = await loadTemplate("../../partials/footer.html");

    const headerElement = document.getElementById("headerData");
    const footerElement = document.getElementById("footerData");
    renderWithTemplate(headerTemplate, headerElement);
    renderWithTemplate(footerTemplate, footerElement);

    // Initialize favorites count after header is loaded
    const favorites = getLocalStorage("movieFavorites") || [];
    updateFavoritesCount(favorites.length);

    // Update the year in the footer
    updateCurrentYear();

    // Initialize mobile menu
    initializeMobileMenu();

    // callback fn is called after the header & footer is loaded into the DOM.
    if (typeof callback === "function") {
        callback();
    }
}

// Render header and footer using template
export function renderWithTemplate(template, parentElement, data, callback) {
    parentElement.innerHTML = template;

    if (callback) {
        callback(data);
    }
}

// fetch content based on the path
export async function loadTemplate(path) {
    const res = await fetch(path);
    const template = await res.text();
    return template;
}

// set active link
export function setActiveNavLink() {
    // Get the current path from the URL
    let currentPath = window.location.pathname;
    // console.log(currentPath);

    // Handle the root path
    if (currentPath === "/" || currentPath === "") {
        currentPath = "/index.html";
    }

    // Remove any src/ prefix if it exists
    currentPath = currentPath.replace(/^\/src\//, "/");

    const navLinks = document.querySelectorAll(".nav-links a, .logo");

    navLinks.forEach((link) => {
        // Remove any existing active class
        link.classList.remove("active");

        // Get the href and ensure it starts with /
        const href = link.getAttribute("href");
        // console.log(href);

        // Exact match comparison
        if (currentPath === href) {
            link.classList.add("active");
        }
    });

    // console.log("Current path:", currentPath); // For debugging
}

export function addToFavorites(movie) {
    const favorites = getLocalStorage("movieFavorites") || [];

    // Check if movie is already in favorites
    if (!favorites.some((fav) => fav.id === movie.id)) {
        favorites.push(movie);
        setLocalStorage("movieFavorites", favorites);
        updateFavoritesCount(favorites.length);
        showNotification(`Added ${movie.title} to favorites`);
    }
}

export function removeFromFavorites(movie) {
    const favorites = getLocalStorage("movieFavorites") || [];
    const updatedFavorites = favorites.filter((fav) => fav.id !== movie.id);

    setLocalStorage("movieFavorites", updatedFavorites);
    updateFavoritesCount(updatedFavorites.length);
    showNotification(`Removed ${movie.title} from favorites`);
}

export function updateFavoritesCount(count) {
    const countElements = document.querySelectorAll(".favorites-count");

    countElements.forEach((element) => {
        if (element) {
            element.textContent = count;
        }
    });

    // Update empty states across pages
    const emptyStates = document.querySelectorAll(".empty-state");
    emptyStates.forEach((state) => {
        if (state) {
            state.style.display = count === 0 ? "block" : "none";
        }
    });
}

export function showNotification(message) {
    // Check if notification container exists, if not create it
    let notificationContainer = document.querySelector(
        ".notification-container",
    );
    if (!notificationContainer) {
        notificationContainer = document.createElement("div");
        notificationContainer.className = "notification-container";
        document.body.appendChild(notificationContainer);
    }

    // Create notification element
    const notification = document.createElement("div");
    notification.className = "notification";
    notification.textContent = message;

    // Add to container
    notificationContainer.appendChild(notification);

    // Remove after animation (4 seconds total)
    setTimeout(() => {
        notification.classList.add("fade-out");
        setTimeout(() => {
            notification.remove();
            // Only remove container if no notifications left
            if (notificationContainer.children.length === 0) {
                notificationContainer.remove();
            }
        }, 300); // Animation duration
    }, 4000); // Show duration before fade starts
}

// Mobile Menu functionality
export function initializeMobileMenu() {
    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");

    if (menuToggle && navLinks) {
        menuToggle.addEventListener("click", () => {
            menuToggle.classList.toggle("active");
            navLinks.classList.toggle("active");
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => {
                menuToggle.classList.remove("active");
                navLinks.classList.remove("active");
            });
        });
    }
}
