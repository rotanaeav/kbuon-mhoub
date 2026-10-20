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
  Check
} from "lucide";

import categoriesData from "./data/categories.json";
import recipesData from "./data/recipes.json";
import communityRecipesData from "./data/community-recipes.json";
import type { Recipe, Category } from "./types/recipe";

const categories = categoriesData as Category[];
const recipes = recipesData as Recipe[];
const categoryMap = new Map(categories.map((c) => [c.id, c]));

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

function toggleFavorite(recipeId: number): boolean {
  const favorites = getFavorites();
  const index = favorites.indexOf(recipeId);
  let isNowFav = false;
  if (index > -1) {
    favorites.splice(index, 1);
    isNowFav = false;
  } else {
    favorites.push(recipeId);
    isNowFav = true;
  }
  localStorage.setItem("kbuon_favorites", JSON.stringify(favorites));
  updateFavoritesBadge();
  return isNowFav;
}

function updateFavoritesBadge(): void {
  const favorites = getFavorites();
  const badge = document.getElementById("favorites-count");
  if (badge) {
    badge.textContent = String(favorites.length);
    badge.classList.toggle("hidden", favorites.length === 0);
  }
}

function getCommunityRecipesList(): Recipe[] {
  let userItems: any[] = [];
  try {
    const raw = localStorage.getItem("kbuon_community_recipes");
    if (raw) userItems = JSON.parse(raw);
  } catch {}
  const allCommunity = [...userItems, ...(communityRecipesData as any[])];
  return allCommunity.map((c) => ({
    id: Number(c.id),
    titleEnglish: c.titleEnglish || c.title || "",
    titleKhmer: c.titleKhmer || "",
    categoryId: c.categoryId || "khmer",
    image: c.image || "",
    description: c.description || "",
    cookTime: c.cookTime || "40 min",
    prepTime: c.prepTime || "15 min",
    servings: c.servings || 4,
    ingredients: c.ingredients && c.ingredients.length > 0
      ? c.ingredients
      : [
          "Fresh local ingredients",
          "Traditional seasonings to taste",
          "Aromatic herbs",
          "Salt and palm sugar"
        ],
    instructions: c.instructions && c.instructions.length > 0
      ? c.instructions
      : [
          c.description || "Cook the dish according to tradition.",
          "Prepare fresh ingredients and seasonings.",
          "Cook until fragrant and thoroughly done.",
          "Serve warm."
        ]
  }));
}

function getCurrentRecipe(): { recipe: Recipe; isCommunity: boolean } {
  const params = new URLSearchParams(window.location.search);
  const idParam = params.get("id");
  const typeParam = params.get("type");
  const recipeId = idParam ? Number(idParam) : 1;

  if (typeParam === "community") {
    const commList = getCommunityRecipesList();
    const foundComm = commList.find((r) => r.id === recipeId);
    if (foundComm) return { recipe: foundComm, isCommunity: true };
  }

  const foundCatalog = recipes.find((r) => r.id === recipeId);
  if (foundCatalog) return { recipe: foundCatalog, isCommunity: false };

  const commList = getCommunityRecipesList();
  const foundComm = commList.find((r) => r.id === recipeId);
  if (foundComm) return { recipe: foundComm, isCommunity: true };

  return { recipe: recipes[0]!, isCommunity: false };
}

function renderRecipeDetail(): void {
  const { recipe, isCommunity } = getCurrentRecipe();
  const cat = categoryMap.get(recipe.categoryId);
  const catName = cat?.name ?? (recipe.categoryId.charAt(0).toUpperCase() + recipe.categoryId.slice(1));
  const catKhmer = cat?.nameKhmer ?? "";

  document.title = `${recipe.titleEnglish} — ក្បួនម្ហូប`;

  const navBack = document.getElementById("nav-back-link") as HTMLAnchorElement | null;
  if (navBack) {
    if (isCommunity) {
      navBack.textContent = "Share Recipe";
      navBack.href = "/pages/share-recipe.html";
    } else {
      navBack.textContent = "Explore Recipes";
      navBack.href = "/pages/recipes.html";
    }
  }

  const currentCategory = document.getElementById("current-category");
  const currentTitle = document.getElementById("current-title");
  if (currentCategory) currentCategory.textContent = isCommunity ? catName : (catName === "Khmer" || catName === "Rice" ? "Main Dish" : catName);
  if (currentTitle) currentTitle.textContent = recipe.titleEnglish;

  const heroImg = document.getElementById("recipe-hero-image") as HTMLImageElement | null;
  const heroPlaceholder = document.getElementById("recipe-hero-placeholder");
  const iconBox = document.getElementById("recipe-category-icon-box");
  const heroKhmer = document.getElementById("recipe-hero-khmer");

  if (recipe.image) {
    if (heroImg) {
      heroImg.src = recipe.image;
      heroImg.alt = recipe.titleEnglish;
      heroImg.classList.remove("hidden");
    }
    if (heroPlaceholder) {
      heroPlaceholder.classList.add("hidden");
      heroPlaceholder.classList.remove("flex");
    }
  } else {
    if (heroImg) {
      heroImg.classList.add("hidden");
    }
    if (heroPlaceholder) {
      heroPlaceholder.classList.remove("hidden");
      heroPlaceholder.classList.add("flex");
    }
    const iconName = cat?.icon || "chef-hat";
    if (iconBox) {
      iconBox.innerHTML = `<i data-lucide="${iconName}" class="size-14"></i>`;
    }
    if (heroKhmer) {
      heroKhmer.textContent = recipe.titleKhmer || recipe.titleEnglish;
    }
  }

  const catTag = document.getElementById("recipe-category-tag");
  if (catTag) {
    catTag.textContent = catKhmer ? `${catName} / ${catKhmer}` : catName;
  }
  const titleEl = document.getElementById("recipe-title");
  if (titleEl) {
    titleEl.textContent = recipe.titleEnglish;
  }
  const descEl = document.getElementById("recipe-description");
  if (descEl) {
    descEl.textContent = recipe.description;
  }

  const prepTime = document.getElementById("prep-time");
  const cookTime = document.getElementById("cook-time");
  const servings = document.getElementById("servings");
  if (prepTime) prepTime.textContent = `Prep: ${recipe.prepTime || "15 min"}`;
  if (cookTime) cookTime.textContent = `Cook: ${recipe.cookTime}`;
  if (servings) servings.textContent = `Serves: ${recipe.servings}`;

  const saveBtn = document.getElementById("save-recipe-btn");
  const isFav = getFavorites().includes(recipe.id);
  updateSaveButtonUI(isFav);

  saveBtn?.addEventListener("click", () => {
    const isNowFav = toggleFavorite(recipe.id);
    updateSaveButtonUI(isNowFav);
  });

  const servingNote = document.getElementById("ingredients-serving-note");
  if (servingNote) {
    servingNote.textContent = `For ${recipe.servings} servings · ${recipe.ingredients.length} ingredients`;
  }

  const ingredientsList = document.getElementById("ingredients-list");
  if (ingredientsList) {
    ingredientsList.innerHTML = recipe.ingredients.map((ing, i) => `
      <label class="ingredient-row h-14 px-4 rounded-xl bg-bg-card shadow-xs transition cursor-pointer select-none flex items-center gap-3">
        <input type="checkbox" class="sr-only ingredient-checkbox" data-index="${i}" />
        <div class="checkbox-visual size-6 rounded-[8px] border border-border-default bg-[#f8f4ee] flex items-center justify-center shrink-0 transition">
          <i data-lucide="check" class="size-4 text-white opacity-0 transition"></i>
        </div>
        <span class="ingredient-label text-base text-text-primary transition">${ing}</span>
      </label>
    `).join("");

    ingredientsList.querySelectorAll<HTMLInputElement>(".ingredient-checkbox").forEach((cb) => {
      cb.addEventListener("change", () => {
        const row = cb.closest(".ingredient-row");
        const visual = row?.querySelector(".checkbox-visual");
        const checkIcon = visual?.querySelector("svg");
        const label = row?.querySelector(".ingredient-label");

        if (cb.checked) {
          visual?.classList.add("bg-brand-primary", "border-brand-primary");
          visual?.classList.remove("border-border-default", "bg-[#f8f4ee]");
          checkIcon?.classList.remove("opacity-0");
          label?.classList.add("line-through", "text-text-secondary", "opacity-75");
        } else {
          visual?.classList.remove("bg-brand-primary", "border-brand-primary");
          visual?.classList.add("border-border-default", "bg-[#f8f4ee]");
          checkIcon?.classList.add("opacity-0");
          label?.classList.remove("line-through", "text-text-secondary", "opacity-75");
        }
      });
    });
  }

  const methodSteps = recipe.methodSteps || deriveMethodSteps(recipe.instructions);
  const methodNote = document.getElementById("method-note");
  if (methodNote) {
    const stepCountWord = methodSteps.length === 4 ? "four" : String(methodSteps.length);
    methodNote.textContent = `Follow the ${stepCountWord} steps below.`;
  }

  const methodList = document.getElementById("method-steps-list");
  if (methodList) {
    methodList.innerHTML = methodSteps.map((step, idx) => `
      <div class="p-6 rounded-xl bg-bg-card shadow-xs flex items-start gap-5 transition">
        <div class="size-12 rounded-full bg-bg-section text-brand-primary font-bold text-lg flex items-center justify-center shrink-0 select-none">
          ${String(idx + 1).padStart(2, "0")}
        </div>
        <div class="flex-1">
          <h3 class="text-2xl font-medium leading-8 text-text-primary">${step.title}</h3>
          <p class="text-base leading-6 text-text-secondary mt-2">${step.description}</p>
        </div>
      </div>
    `).join("");
  }

  initIcons();
  updateJsonLd(recipe);
}

function updateJsonLd(recipe: Recipe): void {
  const scriptEl = document.getElementById("recipe-jsonld");
  if (!scriptEl) return;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    "name": recipe.titleEnglish,
    "alternateName": recipe.titleKhmer,
    "description": recipe.description,
    "image": recipe.image ? [recipe.image] : [],
    "recipeCategory": recipe.categoryId,
    "cookTime": recipe.cookTime,
    "prepTime": recipe.prepTime || "15 min",
    "recipeYield": `${recipe.servings || 4} servings`,
    "recipeIngredient": recipe.ingredients || [],
    "recipeInstructions": (recipe.instructions || []).map((step, idx) => ({
      "@type": "HowToStep",
      "position": idx + 1,
      "text": step
    }))
  };

  scriptEl.textContent = JSON.stringify(schema, null, 2);
}

function updateSaveButtonUI(isFav: boolean): void {
  const saveBtn = document.getElementById("save-recipe-btn");
  if (!saveBtn) return;

  if (isFav) {
    saveBtn.textContent = "Saved";
    saveBtn.className = "w-40 h-12 rounded-full bg-brand-primary-hover text-white font-medium transition shadow-sm cursor-pointer flex items-center justify-center text-base";
  } else {
    saveBtn.textContent = "Save recipe";
    saveBtn.className = "w-40 h-12 rounded-full bg-brand-primary text-white font-medium hover:bg-brand-primary-hover transition shadow-sm cursor-pointer flex items-center justify-center text-base";
  }
}

function deriveMethodSteps(instructions: string[]): { title: string; description: string }[] {
  return instructions.map((inst) => {
    const periodIdx = inst.indexOf(".");
    if (periodIdx !== -1 && periodIdx < 45) {
      return {
        title: inst.substring(0, periodIdx).trim(),
        description: inst.substring(periodIdx + 1).trim() || inst
      };
    }
    return {
      title: inst.split(",")[0] || "Step",
      description: inst
    };
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
  renderRecipeDetail();
  initIcons();
  updateFavoritesBadge();
  initMobileMenu();
});
