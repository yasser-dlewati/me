"use strict";
import { language, renderClients, setBodyScroll, toggleCloseMenuOnOutsideClick, closeNavigationMenu, closeSettingsMenu, observeReveal, openCalendly, closeCalendly } from "./common.js";
import { feedbackIcon } from "./feedback.js";
import { switchLanguage, getNestedValue, translations } from "./translation.js";
import { initSectionScroll, scrollToSection, SECTION_STACK_OFFSET } from "./sectionScroll.js";

const setSectionsStylesForScrolling = () => {
  $("section").each(function (index) {
    $(this).css("z-index", index + 1);
    $(this).css("top", `${index * SECTION_STACK_OFFSET}px`);
    $(this).height(`calc(100dvh - ${index * SECTION_STACK_OFFSET}px)`);
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
  $(".links").html(content);

  const links = document.querySelectorAll(".links a");
  links.forEach((link, index) => {
    link.style.setProperty("--reveal-delay", `${0.2 + index * 0.1}s`);
    link.style.setProperty("--reveal-hide-delay", `${(links.length - 1 - index) * 0.05}s`);
  });
};

const renderScreenIndicator = () => {
  var content = getSectionsCount();
  document.querySelector(".screen.indicator").style.display = "none";
  $(".screen.indicator").html(content);
};

function getSectionsCount(withNames) {
  var sections = document.querySelectorAll("section")
  var content = "";
  for (let i = 0; i < sections.length; i++) {
    if (withNames) {
      let sectionId = sections[i].id;
      let sectionTitle = getNestedValue(translations[language.value], sections[i].getAttribute("data-title"))
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
  $(".screen.indicator li").each(function () {
    $(this).removeClass("active");
  });
  $($(".screen.indicator li")[index]).addClass("active");

  // Keep the menu button at the same spot relative to the current stacked section
  document.documentElement.style.setProperty("--section-stack-top", `${index * SECTION_STACK_OFFSET}px`);
}

function setScreenIndicatorAccordingToScroll() {
  const scrollTop = $(window).scrollTop() + 4;
  const sections = $("section");
  const windowHeight = $(window).height();
  for (let i = 0; i < sections.length; i++) {
    const currentTop = $(sections[i]).offset().top - windowHeight / 2;
    const nextTop =
      i + 1 < sections.length
        ? $(sections[i + 1]).offset().top - windowHeight / 2
        : Infinity;

    if (scrollTop >= currentTop && scrollTop < nextTop) {
      setScreenIndicator(i);
      break;
    }
  }
}

Element.prototype.hideForInSeconds = function(seconds) {
  this.style.display = 'none';
  setTimeout(() => {
    this.style.display = '';
  }, seconds * 1000);
};

Element.prototype.addBouncyAnimationAfterInSeconds = function(seconds) {
  setTimeout(() => {
    this.classList.add('bouncy');
  }, seconds * 1000);
};

const topScrollDiv = document.querySelector("#top .scroll");
const aboutSection = document.querySelector("section#about");
const menuIcon = document.querySelector(".menu-icon");
const settingsIcon = document.querySelector(".settings");

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch((error) => {
    console.warn("Image caching unavailable:", error);
  });
}
const INTRO_SECONDS = 1.5;

$(document).ready(function () {
  readSavedSettings();
  topScrollDiv.hideForInSeconds(INTRO_SECONDS);
  aboutSection.addBouncyAnimationAfterInSeconds(INTRO_SECONDS);
  setSectionsStylesForScrolling();
  syncFooterHeight();
  window.scrollTo(0, 0);

  // Let the intro play without scrolling; the menu button appears when it's over
  document.documentElement.style.overflow = "hidden";
  setTimeout(() => {
    document.documentElement.style.overflow = "";
    menuIcon.style.removeProperty("display");
    initSectionScroll();
  }, INTRO_SECONDS * 1000);

  // About's content column isn't animated directly since a transform would re-anchor its absolute side image
  document.querySelectorAll("section:not(#top)").forEach((section) => {
    observeReveal(section.querySelectorAll(
      ".container > .row > .col-md-3, #about .col-md-8 > p, #about .buttons > a, #clients .col-md-8 .col-md-1, #clients .experience.indicator, #clients .hint, #clients .download, #contact .col-md-8"
    ), 0.15);
  });

  $(".hero-text .message").each(function (i) {
    var $this = $(this);
    if (i >= 3) {
      $this.hide();
      setTimeout(function () {
        $this
          .hide()
          .delay((i + 1) * 1000)
          .fadeIn(1000);
      }, 6500);
    } else {
      $this
        .hide()
        .delay((i + 1) * 1000)
        .fadeIn(1000);
    }
  });
  renderScreenIndicator();
  renderNavigationLinks();
  $(window).scroll(function () {
    setScreenIndicatorAccordingToScroll();
  });
  setScreenIndicator(0);

  $(".navigation .close").click(function () {
    closeNavigationMenu();
  });

  $(".settings-container .close").click(function () {
    closeSettingsMenu();
  });

  $(".calendly-container .close").click(function () {
    closeCalendly();
  });

  document.querySelectorAll(".schedule-session").forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      // Stop the click reaching .content, which would close the panel straight away
      e.stopPropagation();
      openCalendly();
    });
  });

  menuIcon.addEventListener("click", function () {
    if (!document.querySelector(".navigation").classList.contains("active")) {
      document.querySelector(".navigation").classList.add("active");
      setBodyScroll(false);
      document.querySelector(".navigation").style.boxShadow = "var(--menu-box-shadow)";
      toggleCloseMenuOnOutsideClick(true);
    }

  });

  settingsIcon.addEventListener("click", function () {
    document.querySelector(".settings-container").classList.add("active");
    document.querySelectorAll(".navigation > :not(.settings-container)").forEach((el) => {
        el.style.filter = "blur(8px)";
    });
    document.querySelector(".settings-container").style.boxShadow = "var(--menu-box-shadow)";
    toggleCloseMenuOnOutsideClick(true);
  });

  document.querySelectorAll('.links a').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      // Unlock the page before scrolling: toggling overflow mid-scroll cancels a smooth scroll
      setBodyScroll(true);
      scrollToSection([...document.querySelectorAll("section")].indexOf(target));
      closeNavigationMenu();
    });
  });  
});

$(".copy").on("click", function (e) {
  e.preventDefault();
  const email = $(".email h5").text().trim();
  navigator.clipboard.writeText(email).then(() => {
    const $tooltip = $(this).find(".copy-tooltip");
    $tooltip.show();

    setTimeout(() => {
      $tooltip.hide();
    }, 1500);
  });
});

function readSavedSettings() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    $("body").attr("data-theme", savedTheme);
    document.querySelector("#darkModeSwitch").checked = savedTheme === "dark";
    document.querySelector("#saveSettingsLocally").checked = true;
  } else {
    const isSystemDarkMode = window.matchMedia("(prefers-color-scheme: dark)");
    $("body").attr("data-theme", isSystemDarkMode.matches ? "dark" : "light");
    document.querySelector("#darkModeSwitch").checked = isSystemDarkMode.matches;
  }

  const showUnderGraduate = localStorage.getItem("underGraduate");
  if (showUnderGraduate === "true") {
    document.querySelector("#showUnderGraduateExperience").checked = true;
  }

  const savedLanguage = localStorage.getItem("language");
  switchLanguage(savedLanguage ?? "en");
  if (savedLanguage) {
    document.querySelector("#language").value = savedLanguage;
  }
}

var darkModeToggle = document.querySelector("#darkModeSwitch");
darkModeToggle.addEventListener("change", function () {
  if (saveSettingsCheckbox.checked) {
    localStorage.setItem("theme", this.checked ? "dark" : "light");
  }

  if (this.checked) {
    $("body").attr("data-theme", "dark");
  } else {
    $("body").attr("data-theme", "light");
  }
});

var languageSelect = document.querySelector("#language")
languageSelect.addEventListener("change", function () {
  if (saveSettingsCheckbox.checked) {
    localStorage.setItem("language", this.value);
  }
})

var saveSettingsCheckbox = document.querySelector("#saveSettingsLocally");
saveSettingsCheckbox.addEventListener("change", function () {
  if (document.querySelector("#saveSettingsLocally").checked) {
    if (this.checked)
      localStorage.setItem(
        "theme",
        document.querySelector("#darkModeSwitch").checked ? "dark" : "light"
      );
    localStorage.setItem(
      "underGraduate",
      document.querySelector("#showUnderGraduateExperience").checked
    );
    localStorage.setItem(
      "language",
      document.querySelector("#language").value
    )
  } else {
    localStorage.removeItem("theme");
    localStorage.removeItem("underGraduate");
    localStorage.removeItem("language")
  }
});

var showUnderGraduateExperienceToggle = document.querySelector(
  "#showUnderGraduateExperience"
);
showUnderGraduateExperienceToggle.addEventListener("change", function () {
  if (saveSettingsCheckbox.checked) {
    localStorage.setItem("underGraduate", this.checked);
  } else {
    localStorage.removeItem("underGraduate");
  }

  renderClients();
});

const screenIndicator = document.querySelector("ul.screen.indicator");

topScrollDiv.addEventListener("click", function () {
  this.classList.remove("bouncy");
  scrollToSection(1);
});

$(window).on("scroll", function () {
  topScrollDiv.classList.remove("bouncy");
  aboutSection.classList.remove("bouncy");
  screenIndicator.style.removeProperty("display");
  feedbackIcon.style.removeProperty("display");
});