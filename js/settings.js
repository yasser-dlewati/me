"use strict";

// The visitor's settings, in one place. Code reads them with getSetting() and reacts to changes
// with onSettingChange(), instead of reading the settings panel's controls.
// They're kept in localStorage while "Save settings locally" is on. Changing any setting turns it on,
// unless the visitor turned it off themselves: that choice is remembered (SAVE_OPT_OUT_KEY), and
// is the only thing kept once saving is off. The keys and formats are shared with the inline script
// in index.html's <head> and with js/privacy.js: a stored "theme" is what marks saving as on.

const SAVE_OPT_OUT_KEY = "saveSettingsOff";

const STORAGE_KEYS = {
  theme: "theme",
  language: "language",
  showUndergraduate: "underGraduate",
  swipeClients: "swipeClients",
};

function read(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key, value) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, String(value));
  } catch (error) {
    console.log("Couldn't save setting:", error);
  }
}

const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

const values = {
  saveLocally: read(STORAGE_KEYS.theme) !== null,
  theme: read(STORAGE_KEYS.theme) ?? (systemPrefersDark ? "dark" : "light"),
  language: read(STORAGE_KEYS.language) === "ar" ? "ar" : "en",
  showUndergraduate: read(STORAGE_KEYS.showUndergraduate) === "true",
  swipeClients: read(STORAGE_KEYS.swipeClients) === "true",
};

let optedOutOfSaving = read(SAVE_OPT_OUT_KEY) === "true";

const listeners = new Map();

export function getSetting(name) {
  return values[name];
}

export function onSettingChange(name, callback) {
  if (!listeners.has(name)) listeners.set(name, []);
  listeners.get(name).push(callback);
}

export function setSetting(name, value) {
  if (values[name] === value) return;
  values[name] = value;

  if (name === "saveLocally") {
    // Turning saving on stores every setting; turning it off forgets them all
    for (const [setting, key] of Object.entries(STORAGE_KEYS)) {
      write(key, value ? values[setting] : null);
    }
    optedOutOfSaving = !value;
    write(SAVE_OPT_OUT_KEY, value ? null : "true");
  } else if (values.saveLocally) {
    write(STORAGE_KEYS[name], value);
  } else if (!optedOutOfSaving) {
    setSetting("saveLocally", true);
  }

  listeners.get(name)?.forEach((callback) => callback(value));
}
