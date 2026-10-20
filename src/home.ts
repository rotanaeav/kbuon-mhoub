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
  ChevronLeft,
  ChevronRight,
  Check
} from "lucide";

import categoriesData from "./data/categories.json";
import recipesData from "./data/recipes.json";
import type { Recipe, Category } from "./types/recipe";

const categories = categoriesData as Category[];
const recipes = recipesData as Recipe[];

type PrelineGlobal = {
  HSStaticMethods?: {
    autoInit: () => void;
  };
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
      ChevronLeft,
      ChevronRight,
      Check
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
  updateFavoriteButtons();
}

function updateFavoriteButtons(): void {
  const favorites = getFavorites();
  document.querySelectorAll<HTMLButtonElement>("[data-favorite-id]").forEach((btn) => {
    const id = Number(btn.getAttribute("data-favorite-id"));
    const isFav = favorites.includes(id);
    const icon = btn.querySelector("svg");
    if (icon) {
      if (isFav) {
        icon.classList.add("fill-red-500", "text-red-500");
      } else {
        icon.classList.remove("fill-red-500", "text-red-500");
      }
    }
  });

  const favoritesCountBadge = document.getElementById("favorites-count");
  if (favoritesCountBadge) {
    favoritesCountBadge.textContent = String(favorites.length);
    favoritesCountBadge.classList.toggle("hidden", favorites.length === 0);
  }
}

function renderPopularRecipes(): void {
  const container = document.getElementById("popular-recipes-grid");
  if (!container) return;

  const popular = [...recipes].sort(() => Math.random() - 0.5).slice(0, 8);
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  container.innerHTML = popular.map((recipe) => {
    const catName = categoryMap.get(recipe.categoryId) ?? "Khmer";
    return `
      <article class="relative group w-full bg-bg-card border border-border-subtle rounded-2xl overflow-hidden shadow-sm hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:border-border-default transition-all duration-300 flex flex-col">
        <div class="aspect-[4/3] w-full relative overflow-hidden bg-bg-section">
          <a href="/pages/recipe-detail.html?id=${recipe.id}" class="block w-full h-full cursor-pointer" aria-label="View ${recipe.titleEnglish} recipe">
            <img src="${recipe.image}" alt="${recipe.titleEnglish}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          </a>
          <button type="button" data-favorite-id="${recipe.id}" aria-label="Save ${recipe.titleEnglish} to favorites" class="absolute top-3 right-3 z-10 size-10 rounded-full bg-bg-card/90 backdrop-blur shadow flex items-center justify-center cursor-pointer text-text-secondary hover:text-red-500 transition">
            <i data-lucide="heart" class="size-5"></i>
          </button>
        </div>
        <div class="p-4 flex items-center justify-between mt-auto">
          <div>
            <a href="/pages/recipe-detail.html?id=${recipe.id}" class="hover:text-brand-primary transition">
              <h3 class="text-lg sm:text-xl font-semibold group-hover:text-brand-primary transition">${recipe.titleEnglish}</h3>
            </a>
            <p class="text-base text-text-secondary mt-0.5">${catName}</p>
          </div>
          <div class="text-base text-brand-primary font-medium flex items-center gap-1.5 shrink-0">
            <i data-lucide="clock" class="size-4"></i>
            <span>${recipe.cookTime}</span>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function renderFeaturedSlideshow(): void {
  const container = document.getElementById("featured-carousel-slides");
  if (!container) return;

  const featured = recipes.slice(0, 4);

  container.innerHTML = featured.map((recipe) => `
    <div class="hs-carousel-slide w-full h-full p-6 sm:p-8 md:p-8 lg:p-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 lg:gap-10 shrink-0">
      <div class="flex-1 max-w-lg">
        <span class="inline-block px-3.5 py-1.5 rounded-full bg-bg-section text-brand-primary font-medium text-base mb-3 sm:mb-4">Featured Recipe</span>
        <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">${recipe.titleEnglish}</h2>
        <p class="text-base sm:text-lg text-text-secondary mt-2 sm:mt-3 line-clamp-2 sm:line-clamp-3">${recipe.description}</p>
        <div class="grid grid-cols-2 gap-3 sm:gap-4 my-4 sm:my-5 text-center max-w-xs sm:max-w-sm">
          <div class="p-2.5 sm:p-3 rounded-xl bg-bg-section">
            <p class="text-base text-text-secondary">Cook Time</p>
            <p class="text-lg sm:text-xl font-bold text-text-primary mt-0.5 sm:mt-1">${recipe.cookTime}</p>
          </div>
          <div class="p-2.5 sm:p-3 rounded-xl bg-bg-section">
            <p class="text-base text-text-secondary">Servings</p>
            <p class="text-lg sm:text-xl font-bold text-text-primary mt-0.5 sm:mt-1">${recipe.servings} Persons</p>
          </div>
        </div>
        <a href="/pages/recipe-detail.html?id=${recipe.id}" class="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-brand-primary text-white font-medium hover:bg-brand-primary-hover transition shadow-sm">
          <span>View Recipe Guide</span>
          <i data-lucide="arrow-right" class="size-5"></i>
        </a>
      </div>
      <div class="w-full max-w-xs sm:max-w-sm md:w-[320px] lg:w-[400px] aspect-[16/9] sm:aspect-[4/3] rounded-2xl overflow-hidden shadow-sm border border-border-subtle shrink-0 bg-bg-section">
        <a href="/pages/recipe-detail.html?id=${recipe.id}" class="block w-full h-full cursor-pointer" aria-label="View ${recipe.titleEnglish} recipe">
          <img src="${recipe.image}" alt="${recipe.titleEnglish}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
        </a>
      </div>
    </div>
  `).join("");
}

function initFavoriteListeners(): void {
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

function initNewsletter(): void {
  const form = document.getElementById("newsletter-form") as HTMLFormElement | null;
  const message = document.getElementById("newsletter-message");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (message && form) {
      form.style.display = "none";
      message.style.display = "block";
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  renderPopularRecipes();
  renderFeaturedSlideshow();
  initIcons();
  initFavoriteListeners();
  updateFavoriteButtons();
  initMobileMenu();
  initNewsletter();
  ((window as unknown) as PrelineGlobal).HSStaticMethods?.autoInit();
});
