import "preline";
import {
  createIcons,
  Search,
  Heart,
  Clock,
  Utensils,
  CookingPot,
  ChefHat,
  Soup,
  Flame,
  Cake,
  Sun,
  Moon,
  Menu,
  X,
  ArrowRight,
  ChevronRight
} from "lucide";

import recipesData from "./data/recipes.json";
import type { Recipe } from "./types/recipe";

const allRecipes = recipesData as Recipe[];
const recipeMap = new Map<number, Recipe>(allRecipes.map((r) => [r.id, r]));

const categoryLabels: Record<string, string> = {
  all: "All",
  rice: "Rice",
  dessert: "Dessert",
  soup: "Soup",
  khmer: "Rice",
  snack: "Snack"
};

function initIcons(): void {
  createIcons({
    icons: {
      Search,
      Heart,
      Clock,
      Utensils,
      CookingPot,
      ChefHat,
      Soup,
      Flame,
      Cake,
      Sun,
      Moon,
      Menu,
      X,
      ArrowRight,
      ChevronRight
    }
  });
}

function initTheme(): void {
  const savedTheme = localStorage.getItem("kbuon_theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }

  const themeToggle = document.getElementById("theme-toggle");
  themeToggle?.addEventListener("click", () => {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("kbuon_theme", isDark ? "dark" : "light");
    updateThemeIcon(isDark);
  });

  updateThemeIcon(document.documentElement.classList.contains("dark"));
}

function updateThemeIcon(isDark: boolean): void {
  const sunIcon = document.getElementById("sun-icon");
  const moonIcon = document.getElementById("moon-icon");
  if (sunIcon && moonIcon) {
    if (isDark) {
      sunIcon.classList.remove("hidden");
      moonIcon.classList.add("hidden");
    } else {
      sunIcon.classList.add("hidden");
      moonIcon.classList.remove("hidden");
    }
  }
}

function getFavorites(): number[] {
  try {
    const raw = localStorage.getItem("kbuon_favorites");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function toggleFavorite(recipeId: number): void {
  const favorites = getFavorites();
  const index = favorites.indexOf(recipeId);
  if (index > -1) {
    favorites.splice(index, 1);
  } else {
    favorites.push(recipeId);
  }
  localStorage.setItem("kbuon_favorites", JSON.stringify(favorites));
  updateFavoritesBadge();
  renderSavedRecipes();
  renderRecommendedRecipes();
}

function updateFavoritesBadge(): void {
  const favorites = getFavorites();
  const badge = document.getElementById("favorites-count");
  if (badge) {
    badge.textContent = String(favorites.length);
    badge.classList.toggle("hidden", favorites.length === 0);
  }
}

function renderSavedRecipes(): void {
  const container = document.getElementById("saved-recipes-grid");
  const countBadge = document.getElementById("saved-count-badge");
  if (!container) return;

  const favIds = getFavorites();
  const savedRecipes = favIds.map((id) => recipeMap.get(id)).filter((r): r is Recipe => Boolean(r));

  if (countBadge) {
    countBadge.textContent = `${savedRecipes.length} saved`;
  }

  if (savedRecipes.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-16 text-center">
        <div class="size-16 rounded-full bg-bg-section text-brand-primary flex items-center justify-center mx-auto mb-4">
          <i data-lucide="heart" class="size-8"></i>
        </div>
        <h3 class="text-2xl font-bold text-text-primary">No saved recipes yet</h3>
        <p class="text-base text-text-secondary mt-2 max-w-md mx-auto">
          Explore authentic Khmer dishes and save your favorites to view them anytime.
        </p>
        <a href="/pages/recipes.html" class="mt-6 inline-flex items-center justify-center px-6 py-3 rounded-full bg-brand-primary text-white font-medium hover:bg-brand-primary-hover transition shadow-sm cursor-pointer">
          Explore recipes
        </a>
      </div>
    `;
    initIcons();
    return;
  }

  container.innerHTML = savedRecipes.map((recipe) => {
    const catName = categoryLabels[recipe.categoryId] ?? "Rice";
    return `
      <article class="relative group w-full bg-bg-card border border-border-subtle rounded-2xl overflow-hidden shadow-sm hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:border-border-default transition-all duration-300 flex flex-col">
        <div class="aspect-[4/3] w-full relative overflow-hidden bg-bg-section">
          <a href="/pages/recipe-detail.html?id=${recipe.id}" class="block w-full h-full cursor-pointer" aria-label="View ${recipe.titleEnglish} recipe">
            <img src="${recipe.image}" alt="${recipe.titleEnglish}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
          </a>
          <button type="button" data-favorite-id="${recipe.id}" aria-label="Remove ${recipe.titleEnglish} from favorites" class="absolute top-3 right-3 z-10 size-9 rounded-full bg-bg-card/95 backdrop-blur shadow flex items-center justify-center cursor-pointer text-red-500 hover:text-text-secondary transition">
            <i data-lucide="heart" class="size-5 fill-red-500 text-red-500"></i>
          </button>
        </div>
        <div class="p-4 flex items-center justify-between mt-auto">
          <div>
            <a href="/pages/recipe-detail.html?id=${recipe.id}" class="hover:text-brand-primary transition">
              <h3 class="text-xl font-semibold text-text-primary group-hover:text-brand-primary transition leading-7">${recipe.titleEnglish}</h3>
            </a>
            <p class="text-sm text-text-secondary leading-5 mt-0.5">${catName}</p>
          </div>
          <div class="text-sm text-brand-primary font-medium flex items-center gap-1.5 shrink-0">
            <i data-lucide="clock" class="size-4"></i>
            <span>${recipe.cookTime}</span>
          </div>
        </div>
      </article>
    `;
  }).join("");

  initIcons();
  attachFavoriteListeners();
}

function renderRecommendedRecipes(): void {
  const container = document.getElementById("recommended-recipes-grid");
  if (!container) return;

  const favIds = getFavorites();
  const recRecipes = allRecipes
    .filter((recipe) => !favIds.includes(recipe.id))
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  container.innerHTML = recRecipes.map((recipe) => {
    const isFav = favIds.includes(recipe.id);
    const catName = categoryLabels[recipe.categoryId] ?? "Rice";
    return `
      <article class="relative group w-full bg-bg-card border border-border-subtle rounded-2xl overflow-hidden shadow-sm hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:border-border-default transition-all duration-300 flex flex-col">
        <div class="aspect-[4/3] w-full relative overflow-hidden bg-bg-section">
          <a href="/pages/recipe-detail.html?id=${recipe.id}" class="block w-full h-full cursor-pointer" aria-label="View ${recipe.titleEnglish} recipe">
            <img src="${recipe.image}" alt="${recipe.titleEnglish}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
          </a>
          <button type="button" data-favorite-id="${recipe.id}" aria-label="Save ${recipe.titleEnglish} to favorites" class="absolute top-3 right-3 z-10 size-9 rounded-full bg-bg-card/95 backdrop-blur shadow flex items-center justify-center cursor-pointer transition ${isFav ? "text-red-500" : "text-text-secondary hover:text-red-500"}">
            <i data-lucide="heart" class="size-5 ${isFav ? "fill-red-500 text-red-500" : ""}"></i>
          </button>
        </div>
        <div class="p-4 flex items-center justify-between mt-auto">
          <div>
            <a href="/pages/recipe-detail.html?id=${recipe.id}" class="hover:text-brand-primary transition">
              <h3 class="text-xl font-semibold text-text-primary group-hover:text-brand-primary transition leading-7">${recipe.titleEnglish}</h3>
            </a>
            <p class="text-sm text-text-secondary leading-5 mt-0.5">${catName}</p>
          </div>
          <div class="text-sm text-brand-primary font-medium flex items-center gap-1.5 shrink-0">
            <i data-lucide="clock" class="size-4"></i>
            <span>${recipe.cookTime}</span>
          </div>
        </div>
      </article>
    `;
  }).join("");

  initIcons();
  attachFavoriteListeners();
}

function attachFavoriteListeners(): void {
  document.querySelectorAll<HTMLButtonElement>("[data-favorite-id]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const id = Number(btn.getAttribute("data-favorite-id"));
      toggleFavorite(id);
    });
  });
}

function initMobileMenu(): void {
  const toggleBtn = document.getElementById("mobile-menu-toggle");
  const menu = document.getElementById("mobile-menu");
  toggleBtn?.addEventListener("click", () => {
    menu?.classList.toggle("hidden");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  renderSavedRecipes();
  renderRecommendedRecipes();
  initIcons();
  updateFavoritesBadge();
  initMobileMenu();
});
