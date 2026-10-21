"use strict";
import { unlockPage, removeShadowAfterClosing } from "./overlay.js";
import { navigation, settingsContainer } from "./dom.js";

// Closing the navigation menu and the settings panel inside it

export function closeNavigationMenu() {
  setTimeout(() => {
    unlockPage("navigation");
    navigation.classList.remove("active");
    removeShadowAfterClosing(navigation);
  }, 100);
}

export function closeSettingsMenu() {
  setTimeout(() => {
    settingsContainer.classList.remove("active");
    unlockPage("settings");
    removeShadowAfterClosing(settingsContainer);
  }, 100);
}
