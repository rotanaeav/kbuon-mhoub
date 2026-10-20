import "preline";
import {
  createIcons,
  Search,
  Heart,
  Sun,
  Moon,
  Menu,
  X,
  ArrowRight,
  Check,
  Send,
  Mail,
  User,
  MessageSquare
} from "lucide";

function initIcons(): void {
  createIcons({
    icons: {
      Search,
      Heart,
      Sun,
      Moon,
      Menu,
      X,
      ArrowRight,
      Check,
      Send,
      Mail,
      User,
      MessageSquare
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

function updateFavoritesBadge(): void {
  try {
    const raw = localStorage.getItem("kbuon_favorites");
    const favorites = raw ? JSON.parse(raw) : [];
    const badge = document.getElementById("favorites-count");
    if (badge) {
      badge.textContent = String(favorites.length);
      badge.classList.toggle("hidden", favorites.length === 0);
    }
  } catch {
    // ignore
  }
}

function initContactForm(): void {
  const form = document.getElementById("contact-form") as HTMLFormElement | null;
  const successMsg = document.getElementById("contact-success-message");

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (form && successMsg) {
      form.style.display = "none";
      successMsg.classList.remove("hidden");
    }
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
  initIcons();
  updateFavoritesBadge();
  initContactForm();
  initMobileMenu();
});
