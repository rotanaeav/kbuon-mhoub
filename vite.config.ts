import { resolve } from "node:path";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        home: resolve(import.meta.dirname, "pages/home.html"),
        recipes: resolve(import.meta.dirname, "pages/recipes.html"),
        recipeDetail: resolve(import.meta.dirname, "pages/recipe-detail.html"),
        favorites: resolve(import.meta.dirname, "pages/favorites.html"),
        about: resolve(import.meta.dirname, "pages/about.html"),
        shareRecipe: resolve(import.meta.dirname, "pages/share-recipe.html")
      }
    }
  }
});
