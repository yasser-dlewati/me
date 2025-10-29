"use strict";
import { renderClients, setBodyScroll } from "./common.js";
import { feedbackIcon } from "./feedback.js";

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
  var sections = $("section");

  var content = "";
  for (let i = 0; i < sections.length; i++) {
    if (withNames) {
      let sectionId = $($(sections)[i]).attr("id");
      content = content.concat(
        '<a href="#' + sectionId + '" data-translate="'+sectionId+'.navigation"><h4>' + sectionId + "</h4></a>"
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
    console.log('Adding bouncy class to', this);
    this.classList.add('bouncy');
  }, seconds * 1000);
};

const topScrollDiv = document.querySelector("#top .scroll");
const aboutSection = document.querySelector("section#about");
const menuIcon = document.querySelector(".menu-icon");
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

function closeNavigationMenu() {
    setTimeout(() => {
      setBodyScroll(true);
      $(".navigation").removeClass("active");
      $(".navigation").css("box-shadow", "none");
      document.querySelector(".feedback-icon").classList.remove('navigation-active');
    }, 500);
    $(".content").css("overflow", "");
}

  $(".navigation .close").click(function () {
    closeNavigationMenu();
  });

  $(".settings-container .close").click(function () {
      $(".settings-container").removeClass("active");
      setTimeout(() => {
        $(".navigation > *").css("filter", "");
        $(".settings-container").css("box-shadow", "none");
        document.querySelector(".feedback-icon").classList.add('navigation-active');
      }, 500);
    
  });

  menuIcon.addEventListener("click", function () {
    if (!document.querySelector(".navigation").classList.contains("active")) {
      document.querySelector(".navigation").classList.add("active");
      setBodyScroll(false);
      document.querySelector(".navigation").style.boxShadow = "var(--menu-box-shadow)";
      feedbackIcon.classList.add('navigation-active')
    }
  });

  $(".settings").click(() => {
    $(".settings-container").addClass("active");
    $(".navigation > :not(.settings-container)").css("filter", "blur(8px)");
    $(".settings-container").css("box-shadow", "var(--menu-box-shadow)");
    document.querySelector(".feedback-icon").classList.remove('navigation-active');
  });

  const messages = [];
  $(function () {
    var index = 0;

    messages.push("tech enthusiast");
    messages.push("car lover");
    messages.push("Marvel fan");
    messages.push("dad");
    messages.push("millennium");

    function cycle() {
      $(".adjectives").html(messages[index]);
      index++;

      if (index === messages.length) {
        index = 0;
      }

      setTimeout(cycle, 1500);
    }

    cycle();
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
  } else {
    localStorage.removeItem("theme");
    localStorage.removeItem("underGraduate");
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
  console.log("scroll statrted");
  screenIndicator.style.removeProperty("display");
  feedbackIcon.style.removeProperty("display");
});