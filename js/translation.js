import { resetClientsView, clearClientDetailsCache } from "./clients.js";
import { renderServices } from "./services.js";
import { renderCharacteristics } from "./characteristics.js";
import { applyPageText } from "./pageText.js";

// Function to switch language
export function switchLanguage(lang) {
    const html = document.documentElement;
    // Flipping direction moves the hidden side panels to the other edge; without this they slide across the screen
    html.classList.add("switching-direction");
    if (lang === "ar") {
        html.setAttribute("dir", "rtl"); // Set direction to RTL
        html.setAttribute("lang", "ar"); // Set language to Arabic
    } else {
        html.setAttribute("dir", "ltr"); // Set direction to LTR
        html.setAttribute("lang", "en"); // Set language to English
    }
    void html.offsetWidth; // apply the new positions before re-enabling transitions
    html.classList.remove("switching-direction");

    applyPageText(lang);

    resetClientsView();
    clearClientDetailsCache();
    renderServices();
    renderCharacteristics();
}

