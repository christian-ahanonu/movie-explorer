import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
    root: "src/",

    build: {
        outDir: "../dist",
        rollupOptions: {
            input: {
                main: resolve(__dirname, "src/index.html"),
                movies: resolve(__dirname, "src/movies/movies.html"),
                favorites: resolve(__dirname, "src/favorites/favorites.html"),
                about: resolve(__dirname, "src/about/about.html"),
            },
        },
    },
});
