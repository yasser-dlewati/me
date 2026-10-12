import { resetClientsView, clearClientDetailsCache } from "./clients.js";
import { experienceStartDate, setExperienceDuration } from "./experience.js";
import { renderServices } from "./services.js";
import { renderCharacteristics } from "./characteristics.js";
import { translations, getNestedValue } from "./i18n.js";

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

    const elements = document.querySelectorAll("[data-translate]");
    elements.forEach((el) => {
        // A text field shows its placeholder, not its content, so only that gets translated
        if(el.id == "txtFeedback") {
            el.setAttribute("placeholder", getNestedValue(translations[lang], el.getAttribute("data-translate")));
            return;
        }

        const key = el.getAttribute("data-translate");
        let translation = getNestedValue(translations[lang], key);
        if (translation) {
            if(key === "about.description"){
                translation = translation.replace('<span class="experience-duration"></span>', '<span class="experience-duration">'+ setExperienceDuration(experienceStartDate) + '</span>');
            }

            el.innerHTML = translation;
        }
    });

    // Attributes translate the same way: data-title-translate, data-label-translate (aria-label)
    // and data-alt-translate (alt)
    const attributes = { title: "data-title-translate", "aria-label": "data-label-translate", alt: "data-alt-translate" };
    for (const [attribute, marker] of Object.entries(attributes)) {
        document.querySelectorAll(`[${marker}]`).forEach((el) => {
            const translation = getNestedValue(translations[lang], el.getAttribute(marker));
            if (translation) el.setAttribute(attribute, translation);
        });
    }

    resetClientsView();
    clearClientDetailsCache();
    renderServices();
    renderCharacteristics();
}

