"use strict";
import { closeNavigationMenu, closeSettingsMenu } from "./navigation.js";
import { observeReveal } from "./reveal.js";
import { openCalendly, closeCalendly } from "./calendly.js";
import { feedbackIcon, initFeedback } from "./feedback.js";
import { setSwipeMode, initClients, renderClients } from "./clients.js";
import { initServices } from "./services.js";
import { initTraits } from "./characteristics.js";
import { initNeonFlicker } from "./neon.js";
import { switchLanguage } from "./translation.js";
import { t } from "./i18n.js";
import { escapeHtml } from "./html.js";
import { lockPage, unlockPage } from "./overlay.js";
import { attachLiquidDrop } from "./liquidIndicator.js";
import { initPageScrollBar } from "./scrollBar.js";
import { getSetting, setSetting, onSettingChange } from "./settings.js";
import { initSectionScroll, scrollToSection, SECTION_STACK_OFFSET } from "./sectionScroll.js";

const setSectionsStylesForScrolling = () => {
  document.querySelectorAll("section").forEach((section, index) => {
    section.style.zIndex = index + 1;
    section.style.top = `${index * SECTION_STACK_OFFSET}px`;
    section.style.height = `calc(100dvh - ${index * SECTION_STACK_OFFSET}px)`;
  });
};

// The footer overlaps the last section by exactly its own height, so the page ends with that section
const syncFooterHeight = () => {
  const footer = document.querySelector("footer");
  new ResizeObserver(() => {
    document.documentElement.style.setProperty("--footer-height", `${footer.offsetHeight}px`);
  }).observe(footer);
};

const renderNavigationLinks = () => {
  var content = getSectionsCount(true);
  document.querySelector(".links").innerHTML = content;

  const links = document.querySelectorAll(".links a");
  links.forEach((link, index) => {
    link.style.setProperty("--reveal-delay", `${0.2 + index * 0.1}s`);
    link.style.setProperty("--reveal-hide-delay", `${(links.length - 1 - index) * 0.05}s`);
  });
};

const renderScreenIndicator = () => {
  var content = getSectionsCount();
  document.querySelector(".screen.indicator").style.display = "none";
  document.querySelector(".screen.indicator").innerHTML = content;
};

function getSectionsCount(withNames) {
  var sections = document.querySelectorAll("section")
  var content = "";
  for (let i = 0; i < sections.length; i++) {
    if (withNames) {
      let sectionId = escapeHtml(sections[i].id);
      let sectionTitle = escapeHtml(t(sections[i].getAttribute("data-title")))
      content = content.concat(
        '<a href="#' + sectionId + '"><h4 data-translate="' + sectionId + '.navigation">' + sectionTitle + "</h4></a>"
      );
    } else {
      content = content.concat("<li></li>");
    }
  }
  return content;
}

function setScreenIndicator(index) {
  document.querySelectorAll(".screen.indicator li").forEach((li, i) => {
    li.classList.toggle("active", i === index);
  });

  // Keep the menu button at the same spot relative to the current stacked section
  document.documentElement.style.setProperty("--section-stack-top", `${index * SECTION_STACK_OFFSET}px`);
}

// Where each section starts in the page's flow, ignoring the sticky stacking. Measured once and again
// whenever a section's size changes, so scrolling only compares numbers
let sectionStarts = [];
let currentSection = -1;

function measureSectionStarts() {
  let top = 0;
  sectionStarts = [...document.querySelectorAll("section")].map((section) => {
    const start = top;
    top += section.offsetHeight;
    return start;
  });
}

// A section is current once its top passes the middle of the viewport. Sections already stuck at the
// top sit above that line, so this only needs their flow positions, not their on-screen ones
function setScreenIndicatorAccordingToScroll() {
  // The viewport without the scrollbar, as jQuery's $(window).height() measured it
  const line = window.scrollY + 4 + document.documentElement.clientHeight / 2;
  let index = 0;
  sectionStarts.forEach((start, i) => {
    if (start <= line) index = i;
  });
  if (index !== currentSection) {
    currentSection = index;
    setScreenIndicator(index);
  }
}

function trackCurrentSection() {
  const resized = new ResizeObserver(() => {
    measureSectionStarts();
    setScreenIndicatorAccordingToScroll();
  });
  document.querySelectorAll("section").forEach((section) => resized.observe(section));
  window.addEventListener("scroll", setScreenIndicatorAccordingToScroll, { passive: true });
  measureSectionStarts();
  setScreenIndicatorAccordingToScroll();
}

// Hides an element now and shows it again after the given time
function hideFor(element, seconds) {
  element.style.display = "none";
  setTimeout(() => {
    element.style.display = "";
  }, seconds * 1000);
}

function addBouncyAfter(element, seconds) {
  setTimeout(() => {
    element.classList.add("bouncy");
  }, seconds * 1000);
}

const topScrollDiv = document.querySelector("#top .scroll");
const aboutSection = document.querySelector("section#about");
const menuIcon = document.querySelector(".menu-icon");
const swipeClientsToggle = document.querySelector("#swipeClients");
const settingsIcon = document.querySelector(".settings");
const screenIndicator = document.querySelector("ul.screen.indicator");
const INTRO_SECONDS = 1.5;

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch((error) => {
      console.warn("Image caching unavailable:", error);
    });
  }
}

// Let the intro play without scrolling; the scroll cue appears when it's over
function playIntro() {
  hideFor(topScrollDiv, INTRO_SECONDS);
  addBouncyAfter(aboutSection, INTRO_SECONDS);
  window.scrollTo(0, 0);
  document.documentElement.style.overflow = "hidden";
  setTimeout(() => {
    document.documentElement.style.overflow = "";
    initSectionScroll();
  }, INTRO_SECONDS * 1000);
}

// The menu, settings and Calendly buttons, the section links, the copy button and the scroll cue
function initPageControls() {
  document.querySelector(".navigation .close").addEventListener("click", closeNavigationMenu);
  document.querySelector(".settings-container .close").addEventListener("click", closeSettingsMenu);
  document.querySelector(".calendly-container .close").addEventListener("click", closeCalendly);

  document.querySelectorAll(".schedule-session").forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      openCalendly();
    });
  });

  menuIcon.addEventListener("click", function () {
    if (!document.querySelector(".navigation").classList.contains("active")) {
      document.querySelector(".navigation").classList.add("active");
      lockPage("navigation", {
        elements: [document.querySelector(".navigation")],
        close: closeNavigationMenu,
      });
      document.querySelector(".navigation").style.boxShadow = "var(--menu-box-shadow)";
    }
  });

  settingsIcon.addEventListener("click", function () {
    document.querySelector(".settings-container").classList.add("active");
    document.querySelector(".settings-container").style.boxShadow = "var(--menu-box-shadow)";
    lockPage("settings", {
      elements: [document.querySelector(".settings-container")],
      // A click on the menu, or Escape (no event), goes back to it; a click on the page closes both
      close: (event) => {
        closeSettingsMenu();
        if (event && !document.querySelector(".navigation").contains(event.target)) closeNavigationMenu();
      },
    });
  });

  document.querySelectorAll(".links a").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute("href"));
      // Unlock the page before scrolling: toggling overflow mid-scroll cancels a smooth scroll
      unlockPage("navigation");
      scrollToSection([...document.querySelectorAll("section")].indexOf(target));
      closeNavigationMenu();
    });
  });

  const copyButton = document.querySelector(".copy");
  const copyTooltip = copyButton.querySelector(".copy-tooltip");
  let copyTooltipTimer;
  // Shows "Copied" or the failure message. The key goes on data-translate too, so a language
  // switch while it is showing re-translates the same message rather than resetting it to "Copied"
  function showCopyResult(succeeded) {
    const key = succeeded ? "contact.copied" : "contact.copyFailed";
    copyTooltip.setAttribute("data-translate", key);
    copyTooltip.textContent = t(key);
    copyTooltip.classList.toggle("copy-tooltip--error", !succeeded);
    copyTooltip.style.display = "inline";

    clearTimeout(copyTooltipTimer);
    copyTooltipTimer = setTimeout(() => {
      // Back to the stylesheet's display: none
      copyTooltip.style.removeProperty("display");
    }, succeeded ? 1500 : 4000); // longer for the error so it can be read
  }

  copyButton.addEventListener("click", (e) => {
    e.preventDefault();
    const email = document.querySelector(".email h5").textContent.trim();
    // navigator.clipboard is undefined outside a secure context (plain http other than localhost)
    if (!navigator.clipboard?.writeText) {
      showCopyResult(false);
      return;
    }
    navigator.clipboard.writeText(email).then(
      () => showCopyResult(true),
      () => showCopyResult(false)
    );
  });

  topScrollDiv.addEventListener("click", function () {
    this.classList.remove("bouncy");
    scrollToSection(1);
  });

  window.addEventListener("scroll", () => {
    topScrollDiv.classList.remove("bouncy");
    aboutSection.classList.remove("bouncy");
    screenIndicator.style.removeProperty("display");
    feedbackIcon.style.removeProperty("display");
    // The menu button waits for the first real scroll; the intro's jump back to the top doesn't count
    if (window.scrollY > 0) menuIcon.style.removeProperty("display");
  });
}

// theme-color tints the browser bars on older iOS and Android; values mirror --bg-dark-color
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  document.querySelector('meta[name="theme-color"]').setAttribute("content", theme === "dark" ? "#333333" : "#f2f2f2");
}

const darkModeToggle = document.querySelector("#darkModeSwitch");
const languageSelect = document.querySelector("#language");
const showUndergraduateToggle = document.querySelector("#showUnderGraduateExperience");
const saveSettingsCheckbox = document.querySelector("#saveSettingsLocally");

function initSettings() {
  // The settings panel starts from the stored settings and writes changes back
  darkModeToggle.checked = getSetting("theme") === "dark";
  languageSelect.value = getSetting("language");
  showUndergraduateToggle.checked = getSetting("showUndergraduate");
  saveSettingsCheckbox.checked = getSetting("saveLocally");
  // Optional chaining keeps the rest of the page working if a cached index.html lacks this toggle
  if (swipeClientsToggle) swipeClientsToggle.checked = getSetting("swipeClients");

  darkModeToggle.addEventListener("change", () => setSetting("theme", darkModeToggle.checked ? "dark" : "light"));
  languageSelect.addEventListener("change", () => setSetting("language", languageSelect.value));
  showUndergraduateToggle.addEventListener("change", () => setSetting("showUndergraduate", showUndergraduateToggle.checked));
  saveSettingsCheckbox.addEventListener("change", () => setSetting("saveLocally", saveSettingsCheckbox.checked));
  swipeClientsToggle?.addEventListener("change", () => setSetting("swipeClients", swipeClientsToggle.checked));

  // What each setting does when it changes
  onSettingChange("theme", applyTheme);
  onSettingChange("language", switchLanguage);
  onSettingChange("showUndergraduate", renderClients);
  onSettingChange("swipeClients", setSwipeMode);
  // Saving can also turn on by itself, when the first setting changes
  onSettingChange("saveLocally", (saving) => (saveSettingsCheckbox.checked = saving));

  applyTheme(getSetting("theme"));
  setSwipeMode(getSetting("swipeClients"));
  switchLanguage(getSetting("language"));
}

// Start-up, in order. Module scripts run once the page's HTML is parsed, so the DOM is ready here
function start() {
  registerServiceWorker();
  initClients();
  initFeedback();
  initServices();
  initTraits();
  // Applies the theme and swipe mode, and the language: that renders the translated page, including
  // the services and the trait chips
  initSettings();

  setSectionsStylesForScrolling();
  syncFooterHeight();
  playIntro();

  // About's content column isn't animated directly since a transform would re-anchor its absolute side image
  document.querySelectorAll("section:not(#top)").forEach((section) => {
    observeReveal(section.querySelectorAll(
      ".container > .row > .col-md-3, #about .col-md-8 > p, #about .buttons > .button, #clients .col-md-8 .col-md-1, #clients .experience.indicator, #clients .hint, #clients .download, #contact .col-md-8"
    ), 0.15);
  });

  renderScreenIndicator();
  attachLiquidDrop(screenIndicator, { vertical: true });
  initPageScrollBar();
  renderNavigationLinks();
  trackCurrentSection();

  initPageControls();
  initNeonFlicker();
}

start();
