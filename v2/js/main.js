"use strict";
import { language, renderClients, setBodyScroll, toggleCloseMenuOnOutsideClick, closeNavigationMenu, closeSettingsMenu } from "./common.js";
import { feedbackIcon } from "./feedback.js";
import { switchLanguage, getNestedValue, translations } from "./translation.js";

const setSectionsStylesForScrolling = () => {
  $("section").each(function (index) {
    $(this).css("z-index", index + 1);
    $(this).css("top", `${index * 8}px`);
    $(this).height(`calc(100dvh - ${index * 8}px)`);
  });
};

const renderNavigationLinks = () => {
  var content = getSectionsCount(true);
  $(".links").html(content);
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
$(document).ready(function () {
  readSavedSettings();
  topScrollDiv.hideForInSeconds(1.5);
  aboutSection.addBouncyAnimationAfterInSeconds(1.5);
  setSectionsStylesForScrolling();
  window.scrollTo(0, 0);

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
      document.querySelector(".content").style.overflow = "hidden";
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
  }

  const showUnderGraduate = localStorage.getItem("underGraduate");
  if (showUnderGraduate === "true") {
    document.querySelector("#showUnderGraduateExperience").checked = true;
  }

  const savedLanguage = localStorage.getItem("language")
  switchLanguage(savedLanguage ?? "en")
  if(savedLanguage){
    document.querySelector("#language").value = savedLanguage
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
  const currentSection = this.parentElement;
  const nextSection = currentSection.nextElementSibling;
  window.scrollTo({
    top: nextSection.offsetTop,
    behavior: "smooth",
  });
});

$(window).on("scroll", function () {
  topScrollDiv.classList.remove("bouncy");
  aboutSection.classList.remove("bouncy");
  menuIcon.style.removeProperty("display");
  screenIndicator.style.removeProperty("display");
  feedbackIcon.style.removeProperty("display");
});