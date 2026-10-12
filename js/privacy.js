"use strict";

// Privacy page: language and theme. Loaded as a plain script in <head>, so the saved (or URL)
// language and theme apply before first paint and the page doesn't flash. The controls work like
// the settings panel: a change is remembered only if "Save settings locally" is on on the main site.

(function () {
  const OPTION_LABELS = {
    en: { en: "English", ar: "Arabic" },
    ar: { en: "الانجليزية", ar: "العربية" },
  };

  const html = document.documentElement;

  function read(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  // Same rule as the main site (js/settings.js): changing a setting saves it, and turns saving on
  // if it was off, unless the visitor turned saving off themselves. Saving stores the theme and the
  // language together, since a stored "theme" is what marks saving as on
  function remember() {
    if (read("saveSettingsOff") === "true") return;
    try {
      localStorage.setItem("theme", html.dataset.theme);
      localStorage.setItem("language", html.lang);
    } catch (error) {
      console.log("Couldn't save setting:", error);
    }
  }

  function applyLanguage(lang) {
    html.lang = lang;
    html.dir = lang === "ar" ? "rtl" : "ltr";
    document.title = lang === "ar" ? "الخصوصية · Yas Dle" : "Privacy · Yas Dle";
  }

  function applyTheme(theme) {
    html.dataset.theme = theme;
  }

  // Before first paint
  const urlLang = new URLSearchParams(location.search).get("lang");
  applyLanguage((urlLang || read("language")) === "ar" ? "ar" : "en");
  applyTheme(
    read("theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
  );

  // Leaving: note this page's direction, so the site slides back the way this page came in
  addEventListener("pageswap", () => {
    try {
      sessionStorage.setItem("pageSlideFrom", html.dir);
    } catch {}
  });

  // Once the controls exist
  document.addEventListener("DOMContentLoaded", () => {
    const languageSelect = document.querySelector("#language");
    const darkModeSwitch = document.querySelector("#darkModeSwitch");
    const settingsToggle = document.querySelector(".privacy-settings-toggle");
    const settingsCard = document.querySelector("#privacySettings");

    function setSettingsOpen(open) {
      settingsCard.hidden = !open;
      settingsToggle.setAttribute("aria-expanded", String(open));
    }

    settingsToggle.addEventListener("click", () => setSettingsOpen(settingsCard.hidden));

    // Close on a click anywhere outside the card and the gear
    document.addEventListener("click", (e) => {
      if (!settingsCard.hidden && !settingsCard.contains(e.target) && !settingsToggle.contains(e.target)) {
        setSettingsOpen(false);
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !settingsCard.hidden) {
        setSettingsOpen(false);
        settingsToggle.focus();
      }
    });

    function syncLanguageSelect() {
      const lang = html.lang;
      languageSelect.value = lang;
      settingsToggle.setAttribute("aria-label", lang === "ar" ? "الإعدادات" : "Settings");
      for (const option of languageSelect.options) {
        option.textContent = OPTION_LABELS[lang][option.value];
      }
    }

    syncLanguageSelect();
    darkModeSwitch.checked = html.dataset.theme === "dark";

    languageSelect.addEventListener("change", () => {
      const lang = languageSelect.value;
      applyLanguage(lang);
      syncLanguageSelect();
      remember();
      // Keep the address shareable in the chosen language
      const url = new URL(location.href);
      url.searchParams.set("lang", lang);
      history.replaceState(null, "", url);
    });

    darkModeSwitch.addEventListener("change", () => {
      const theme = darkModeSwitch.checked ? "dark" : "light";
      applyTheme(theme);
      remember();
    });
  });
})();
