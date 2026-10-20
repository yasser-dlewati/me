"use strict";

// Fills the page's static text ([data-translate] and the translated attributes) in the given language.
// index.html loads this module ahead of main.js, so the text shows as soon as this small module is in,
// without waiting for the rest of the site's modules to load.

import { experienceStartDate, setExperienceDuration } from "./experience.js";
import { translations, getNestedValue } from "./i18n.js";
import { getSetting } from "./settings.js";

export function applyPageText(lang) {
    document.querySelectorAll("[data-translate]").forEach((el) => {
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
}

applyPageText(getSetting("language"));
