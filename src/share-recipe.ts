import "preline";
import {
  createIcons,
  Search,
  Heart,
  Moon,
  Sun,
  Menu,
  Clock,
  Check
} from "lucide";

import communityRecipesData from "./data/community-recipes.json";

type CommunityRecipe = {
  id: number;
  titleEnglish: string;
  titleKhmer: string;
  title: string;
  description: string;
  category: string;
  categoryId: string;
  cookTime: string;
  ingredientsCount: number;
  ingredients?: string[];
  instructions?: string[];
};

const categoryNames: Record<string, string> = {
  rice: "Rice",
  dessert: "Dessert",
  soup: "Soup",
  khmer: "Khmer",
  snack: "Snack"
};

function initIcons(): void {
  createIcons({
    icons: {
      Search,
      Heart,
      Moon,
      Sun,
      Menu,
      Clock,
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
  updateFavoritesBadge();
  updateFavoriteButtonsUI();
}

function updateFavoritesBadge(): void {
  const favorites = getFavorites();
  const badge = document.getElementById("favorites-count");
  if (badge) {
    badge.textContent = String(favorites.length);
    badge.classList.toggle("hidden", favorites.length === 0);
  }
}

function updateFavoriteButtonsUI(): void {
  const favorites = getFavorites();
  document.querySelectorAll<HTMLButtonElement>("[data-favorite-id]").forEach((btn) => {
    const id = Number(btn.getAttribute("data-favorite-id"));
    const isFav = favorites.includes(id);
    const icon = btn.querySelector("svg");
    if (isFav) {
      btn.classList.add("text-red-500", "border-red-300");
      icon?.classList.add("fill-red-500", "text-red-500");
    } else {
      btn.classList.remove("text-red-500", "border-red-300");
      icon?.classList.remove("fill-red-500", "text-red-500");
    }
  });
}

function initCategoryPills(): void {
  const pills = document.querySelectorAll<HTMLButtonElement>(".category-pill");
  const hiddenInput = document.getElementById("selected-category") as HTMLInputElement | null;

  pills.forEach((pill) => {
    pill.addEventListener("click", () => {
      const cat = pill.getAttribute("data-category") || "rice";
      if (hiddenInput) hiddenInput.value = cat;

      pills.forEach((p) => {
        p.className = "category-pill h-11 px-5 rounded-full bg-bg-card border border-border-default hover:bg-bg-section text-text-primary font-medium text-base transition cursor-pointer";
      });

      pill.className = "category-pill h-11 px-5 rounded-full bg-brand-primary text-white font-medium text-base transition shadow-sm cursor-pointer";
    });
  });
}

function getCommunityRecipes(): CommunityRecipe[] {
  let userItems: CommunityRecipe[] = [];
  try {
    const raw = localStorage.getItem("kbuon_community_recipes");
    if (raw) userItems = JSON.parse(raw);
  } catch {}
  return [...userItems, ...(communityRecipesData as CommunityRecipe[])];
}

function renderCommunityRecipes(): void {
  const container = document.getElementById("community-recipes-grid");
  if (!container) return;

  const items = getCommunityRecipes();
  const favIds = getFavorites();

  container.innerHTML = items.map((item) => {
    const isFav = favIds.includes(item.id);
    return `
      <article class="bg-bg-card border border-border-subtle rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition relative group">
        <div>
          <div class="flex items-center justify-between">
            <span class="inline-flex items-center px-3.5 py-1 rounded-full bg-brand-secondary text-brand-primary text-xs font-semibold">
              Community Recipe
            </span>
            <button
              type="button"
              data-favorite-id="${item.id}"
              aria-label="Save ${item.titleEnglish} to favorites"
              class="size-10 rounded-full border border-border-default bg-bg-card hover:bg-bg-section flex items-center justify-center cursor-pointer transition relative z-10 ${isFav ? "text-red-500 border-red-300" : "text-text-secondary hover:text-red-500"}"
            >
              <i data-lucide="heart" class="size-5 ${isFav ? "fill-red-500 text-red-500" : ""}"></i>
            </button>
          </div>
          <a href="/pages/recipe-detail.html?id=${item.id}&type=community" class="block focus:outline-none">
            <h3 class="text-xl font-bold text-text-primary mt-4 group-hover:text-brand-primary transition">
              ${item.title}
            </h3>
            <p class="text-sm text-text-secondary mt-2 leading-relaxed line-clamp-3">
              ${item.description}
            </p>
          </a>
        </div>
        <a href="/pages/recipe-detail.html?id=${item.id}&type=community" class="flex items-center justify-between text-sm text-text-secondary pt-4 mt-6 border-t border-border-subtle group-hover:text-text-primary transition">
          <span>${item.category}</span>
          <div class="flex items-center gap-1.5">
            <i data-lucide="clock" class="size-4"></i>
            <span>${item.cookTime}</span>
          </div>
          <span>${item.ingredientsCount} Ingredients</span>
        </a>
      </article>
    `;
  }).join("");

  initIcons();
  initFavoriteButtons();
}

function initForm(): void {
  const form = document.getElementById("share-recipe-form") as HTMLFormElement | null;
  const successBox = document.getElementById("recipe-submit-success");

  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const titleEn = (document.getElementById("dish-name-en") as HTMLInputElement).value.trim();
    const titleKm = (document.getElementById("dish-name-km") as HTMLInputElement).value.trim();
    const category = ((document.getElementById("selected-category") as HTMLInputElement)?.value || "rice");
    const categoryName = categoryNames[category] || "Rice";
    const cookTime = (document.getElementById("cooking-time") as HTMLInputElement).value.trim() || "40 min";
    const ingredientsRaw = (document.getElementById("ingredients") as HTMLTextAreaElement).value.trim();
    const instructionsRaw = (document.getElementById("cooking-instructions") as HTMLTextAreaElement).value.trim();

    const ingLines = ingredientsRaw.split("\n").map((s) => s.trim()).filter(Boolean);
    const instLines = instructionsRaw.split("\n").map((s) => s.trim()).filter(Boolean);
    const desc = instLines[0] || `A traditional ${categoryName.toLowerCase()} recipe shared by community.`;

    const newRecipe: CommunityRecipe = {
      id: Date.now(),
      titleEnglish: titleEn,
      titleKhmer: titleKm,
      title: titleKm ? `${titleEn} / ${titleKm}` : titleEn,
      description: desc,
      category: categoryName,
      categoryId: category,
      cookTime,
      ingredientsCount: ingLines.length || 1,
      ingredients: ingLines.length > 0 ? ingLines : [
        "Fresh local ingredients",
        "Traditional seasonings to taste",
        "Aromatic herbs",
        "Salt and palm sugar"
      ],
      instructions: instLines.length > 0 ? instLines : [
        desc,
        "Prepare all ingredients and slice fresh vegetables.",
        "Cook gently over medium heat until tender and aromatic.",
        "Season to taste and serve warm with steamed rice."
      ]
    };

    try {
      const existingRaw = localStorage.getItem("kbuon_community_recipes");
      const list: CommunityRecipe[] = existingRaw ? JSON.parse(existingRaw) : [];
      list.unshift(newRecipe);
      localStorage.setItem("kbuon_community_recipes", JSON.stringify(list));
    } catch {}

    renderCommunityRecipes();

    form.reset();
    if (successBox) {
      successBox.classList.remove("hidden");
    }

    const grid = document.getElementById("community-recipes-grid");
    grid?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function initFavoriteButtons(): void {
  document.querySelectorAll<HTMLButtonElement>("[data-favorite-id]").forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const id = Number(btn.getAttribute("data-favorite-id"));
      toggleFavorite(id);
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
  initCategoryPills();
  initForm();
  renderCommunityRecipes();
  initIcons();
  updateFavoritesBadge();
  initMobileMenu();
});
