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
  ChevronRight,
  RotateCcw
} from "lucide";

import recipesData from "./data/recipes.json";
import categoriesData from "./data/categories.json";
import type { Recipe } from "./types/recipe";

const allRecipes = recipesData as Recipe[];

function getCategoryName(id: string): string {
  return categoriesData.find((cat) => cat.id === id)?.name ?? id;
}

let currentCategory: string = "all";
let currentSearch: string = "";
let filterOnlyFavorites: boolean = false;
let currentPage: number = 1;

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
      ChevronRight,
      RotateCcw
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
  if (filterOnlyFavorites) {
    renderRecipes();
  }
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

function getFilteredRecipes(): Recipe[] {
  const favorites = getFavorites();
  const q = currentSearch.trim().toLowerCase();

  return allRecipes.filter((recipe) => {
    if (filterOnlyFavorites && !favorites.includes(recipe.id)) {
      return false;
    }

    if (currentCategory !== "all" && recipe.categoryId !== currentCategory) {
      return false;
    }

    if (q) {
      const matchTitleEng = recipe.titleEnglish.toLowerCase().includes(q);
      const matchTitleKh = recipe.titleKhmer.toLowerCase().includes(q);
      const matchDesc = recipe.description.toLowerCase().includes(q);
      const matchCategory = getCategoryName(recipe.categoryId).toLowerCase().includes(q);
      const matchIngredients = recipe.ingredients.some((ing) => ing.toLowerCase().includes(q));

      if (!matchTitleEng && !matchTitleKh && !matchDesc && !matchCategory && !matchIngredients) {
        return false;
      }
    }

    return true;
  });
}

function getItemsPerPage(): number {
  if (window.innerWidth >= 1024) return 12;
  return 6;
}

function renderRecipes(): void {
  const container = document.getElementById("recipes-grid");
  const paginationWrapper = document.getElementById("recipes-pagination-wrapper");
  if (!container) return;

  const filtered = getFilteredRecipes();
  const itemsPerPage = getItemsPerPage();
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  if (currentPage > totalPages && totalPages > 0) {
    currentPage = totalPages;
  }

  if (filtered.length === 0) {
    if (paginationWrapper) paginationWrapper.innerHTML = "";
    container.innerHTML = `
      <div class="col-span-full py-16 text-center">
        <div class="size-16 rounded-full bg-bg-section text-text-secondary flex items-center justify-center mx-auto mb-4">
          <i data-lucide="search" class="size-8"></i>
        </div>
        <h3 class="text-xl font-bold">No recipes found</h3>
        <p class="text-base text-text-secondary mt-1 max-w-md mx-auto">
          ${
            filterOnlyFavorites
              ? "You haven't saved any favorites yet. Tap the heart on any recipe to add it here!"
              : "We couldn't find any dish matching your search or filter. Try a different keyword or category."
          }
        </p>
        <button id="reset-filters-btn" class="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-brand-primary text-white font-medium hover:bg-brand-primary-hover transition shadow-sm cursor-pointer">
          <i data-lucide="rotate-ccw" class="size-4"></i>
          <span>Reset Filters</span>
        </button>
      </div>
    `;
    initIcons();
    document.getElementById("reset-filters-btn")?.addEventListener("click", () => {
      currentCategory = "all";
      currentSearch = "";
      filterOnlyFavorites = false;
      currentPage = 1;
      const searchInput = document.getElementById("search-input") as HTMLInputElement | null;
      if (searchInput) searchInput.value = "";
      updateFilterButtonsUI();
      updateUrlParams();
      renderRecipes();
    });
    return;
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRecipes = filtered.slice(startIndex, endIndex);

  container.innerHTML = paginatedRecipes.map((recipe) => {
    const catName = getCategoryName(recipe.categoryId);
    return `
      <article class="relative group w-full bg-bg-card border border-border-subtle rounded-2xl overflow-hidden shadow-sm hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:border-border-default transition-all duration-300 flex flex-col">
        <div class="aspect-[4/3] w-full relative overflow-hidden bg-bg-section">
          <a href="/pages/recipe-detail.html?id=${recipe.id}" class="block w-full h-full cursor-pointer" aria-label="View ${recipe.titleEnglish} recipe">
            <img src="${recipe.image}" alt="${recipe.titleEnglish}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
          </a>
          <button type="button" data-favorite-id="${recipe.id}" aria-label="Save ${recipe.titleEnglish} to favorites" class="absolute top-3 right-3 z-10 size-9 rounded-full bg-bg-card/95 backdrop-blur shadow flex items-center justify-center cursor-pointer text-text-secondary hover:text-red-500 transition">
            <i data-lucide="heart" class="size-5"></i>
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

  renderPagination(totalPages);
  initIcons();
  attachFavoriteListeners();
  updateFavoriteButtons();
}

function renderPagination(totalPages: number): void {
  const paginationWrapper = document.getElementById("recipes-pagination-wrapper");
  if (!paginationWrapper) return;

  if (totalPages <= 1) {
    paginationWrapper.innerHTML = "";
    return;
  }

  const prevDisabled = currentPage === 1;
  const nextDisabled = currentPage === totalPages;

  let pageButtonsHtml = "";
  for (let i = 1; i <= totalPages; i++) {
    const isActive = i === currentPage;
    if (isActive) {
      pageButtonsHtml += `
        <button type="button" data-page="${i}" class="min-h-9.5 min-w-9.5 flex justify-center items-center bg-surface-1 text-foreground py-2 px-3 text-sm rounded-lg focus:outline-hidden disabled:opacity-50 disabled:pointer-events-none cursor-pointer font-medium" aria-current="page">${i}</button>
      `;
    } else {
      pageButtonsHtml += `
        <button type="button" data-page="${i}" class="min-h-9.5 min-w-9.5 flex justify-center items-center text-foreground hover:bg-muted-hover py-2 px-3 text-sm rounded-lg focus:outline-hidden focus:bg-muted-focus disabled:opacity-50 disabled:pointer-events-none cursor-pointer">${i}</button>
      `;
    }
  }

  paginationWrapper.innerHTML = `
    <!-- Pagination -->
    <nav class="flex items-center gap-x-1" aria-label="Pagination">
      <button id="pagination-prev-btn" type="button" class="min-h-9.5 min-w-9.5 py-2 px-2.5 inline-flex justify-center items-center gap-x-1.5 text-sm rounded-lg text-foreground hover:bg-muted-hover focus:outline-hidden focus:bg-muted-focus disabled:opacity-50 disabled:pointer-events-none cursor-pointer" aria-label="Previous" ${prevDisabled ? "disabled" : ""}>
        <svg class="shrink-0 size-3.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        <span>Previous</span>
      </button>
      <div class="flex items-center gap-x-1">
        ${pageButtonsHtml}
      </div>
      <button id="pagination-next-btn" type="button" class="min-h-9.5 min-w-9.5 py-2 px-2.5 inline-flex justify-center items-center gap-x-1.5 text-sm rounded-lg text-foreground hover:bg-muted-hover focus:outline-hidden focus:bg-muted-focus disabled:opacity-50 disabled:pointer-events-none cursor-pointer" aria-label="Next" ${nextDisabled ? "disabled" : ""}>
        <span>Next</span>
        <svg class="shrink-0 size-3.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
      </button>
    </nav>
    <!-- End Pagination -->
  `;

  document.getElementById("pagination-prev-btn")?.addEventListener("click", () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  });

  document.getElementById("pagination-next-btn")?.addEventListener("click", () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  });

  paginationWrapper.querySelectorAll<HTMLButtonElement>("[data-page]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const page = Number(btn.getAttribute("data-page"));
      if (page && page !== currentPage) {
        goToPage(page);
      }
    });
  });
}

function goToPage(page: number): void {
  currentPage = page;
  updateUrlParams();
  renderRecipes();
  const sectionTitle = document.getElementById("recipes-section-title");
  if (sectionTitle) {
    sectionTitle.scrollIntoView({ behavior: "smooth", block: "start" });
  }
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

function updateFilterButtonsUI(): void {
  document.querySelectorAll<HTMLButtonElement>("[data-category-filter]").forEach((btn) => {
    const cat = btn.getAttribute("data-category-filter");
    const isActive = !filterOnlyFavorites && cat === currentCategory;
    if (isActive) {
      btn.className = "h-11 px-5 rounded-full bg-brand-primary text-white font-medium text-base transition shadow-sm cursor-pointer shrink-0 flex items-center justify-center";
    } else {
      btn.className = "h-11 px-5 rounded-full bg-bg-card border border-border-default hover:bg-bg-section text-text-primary font-medium text-base transition cursor-pointer shrink-0 flex items-center justify-center";
    }
  });
}

function initCategoryFilters(): void {
  document.querySelectorAll<HTMLButtonElement>("[data-category-filter]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cat = btn.getAttribute("data-category-filter") || "all";
      filterOnlyFavorites = false;
      currentCategory = cat;
      currentPage = 1;
      updateUrlParams();
      updateFilterButtonsUI();
      renderRecipes();
    });
  });
}

function updateUrlParams(): void {
  const url = new URL(window.location.href);
  if (filterOnlyFavorites) {
    url.searchParams.set("filter", "favorites");
    url.searchParams.delete("category");
  } else {
    url.searchParams.delete("filter");
    if (currentCategory !== "all") {
      url.searchParams.set("category", currentCategory);
    } else {
      url.searchParams.delete("category");
    }
  }

  if (currentSearch) {
    url.searchParams.set("q", currentSearch);
  } else {
    url.searchParams.delete("q");
  }

  if (currentPage > 1) {
    url.searchParams.set("page", String(currentPage));
  } else {
    url.searchParams.delete("page");
  }

  window.history.replaceState({}, "", url.toString());
}

function initSearchInput(): void {
  const input = document.getElementById("search-input") as HTMLInputElement | null;
  const clearBtn = document.getElementById("search-clear-btn");

  if (!input) return;

  if (currentSearch) {
    input.value = currentSearch;
    clearBtn?.classList.remove("hidden");
  }

  input.addEventListener("input", () => {
    currentSearch = input.value;
    currentPage = 1;
    clearBtn?.classList.toggle("hidden", currentSearch.length === 0);
    updateUrlParams();
    renderRecipes();
  });

  clearBtn?.addEventListener("click", () => {
    input.value = "";
    currentSearch = "";
    currentPage = 1;
    clearBtn.classList.add("hidden");
    updateUrlParams();
    renderRecipes();
    input.focus();
  });
}

function parseUrlParams(): void {
  const params = new URLSearchParams(window.location.search);
  const filter = params.get("filter");
  const category = params.get("category");
  const q = params.get("q");
  const page = params.get("page");

  if (filter === "favorites") {
    filterOnlyFavorites = true;
    currentCategory = "all";
  } else if (category && categoriesData.some((c) => c.id === category)) {
    currentCategory = category;
  }

  if (q) {
    currentSearch = q;
  }

  if (page && Number(page) > 0) {
    currentPage = Number(page);
  }
}

function initMobileMenu(): void {
  const toggleBtn = document.getElementById("mobile-menu-toggle");
  const menu = document.getElementById("mobile-menu");
  toggleBtn?.addEventListener("click", () => {
    menu?.classList.toggle("hidden");
  });
}

let resizeTimeout: number | undefined;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = window.setTimeout(() => {
    renderRecipes();
  }, 150);
});

document.addEventListener("DOMContentLoaded", () => {
  parseUrlParams();
  initTheme();
  initCategoryFilters();
  initSearchInput();
  updateFilterButtonsUI();
  renderRecipes();
  initMobileMenu();
});
