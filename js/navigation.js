"use strict";
import { unlockPage, removeShadowAfterClosing } from "./overlay.js";

// Closing the navigation menu and the settings panel inside it

export function closeNavigationMenu() {
  setTimeout(() => {
    unlockPage("navigation");
    document.querySelector(".navigation").classList.remove("active");
    removeShadowAfterClosing(document.querySelector(".navigation"));
  }, 100);
}

export function closeSettingsMenu() {
  setTimeout(() => {
    document.querySelector(".settings-container").classList.remove("active");
    unlockPage("settings");
    removeShadowAfterClosing(document.querySelector(".settings-container"));
  }, 100);
}
