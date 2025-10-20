"use strict";
// main.js
import { renderClients } from "./clients.js";

const setSectionsStylesForScrolling = () => {
  $("section").each(function (index) {
    $(this).css("z-index", index + 1);
    $(this).css("top", `${index * 8}px`);
    $(this).height(`calc(100vh - ${index * 8}px)`);
  });
};

const renderNavigationLinks = () => {
  var content = getSectionsCount(true);
  $(".links").html(content);
};

const renderScreenIndicator = () => {
  var content = getSectionsCount();
  document.querySelector(".screen-indicator").style.display = "none";
  $(".screen-indicator").html(content);
};

function getSectionsCount(withNames) {
  var sections = $("section");

  var content = "";
  for (let i = 0; i < sections.length; i++) {
    if (withNames) {
      let sectionId = $($(sections)[i]).attr("id");
      content = content.concat(
        '<a href="#' + sectionId + '"><h4>' + sectionId + "</h4></a>"
      );
    } else {
      content = content.concat("<li></li>");
    }
  }
  return content;
}

function setScreenIndicator(index) {
  $(".screen-indicator li").each(function () {
    $(this).removeClass("active");
  });
  $($(".screen-indicator li")[index]).addClass("active");
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

  $(".navigation .close").click(function () {
    if (document.querySelector(".navigation").classList.contains("active")) {
      setTimeout(() => {
        $("section, footer").css("filter", "");
        $(".screen-indicator").removeClass("show-nav");
        $(".navigation").removeClass("active");
        $(".navigation").css("box-shadow", "none");
      }, 500);
    }
    $(".content").css("overflow", "");
    document.querySelector("body").style.removeProperty("overflow-y");
  });

  $(".settings-container .close").click(function () {
    if (
      document.querySelector(".settings-container").classList.contains("active")
    ) {
      $(".settings-container").removeClass("active");
      setTimeout(() => {
        $(".navigation > *").css("filter", "");
        $(".settings-container").css("box-shadow", "none");
      }, 500);
    }
  });

  $(".menu-icon").click(function () {
    if (!document.querySelector(".navigation").classList.contains("active")) {
      $(".navigation").addClass("active");
      $("section, footer").css("filter", "blur(8px)");
      $(".navigation").css("box-shadow", "var(--menu-box-shadow)");
      document.querySelector("body").style.overflowY = "hidden";
      document.querySelector("body").style.background = "var(--bg-dark-color)";
    }
  });

  $(".settings").click(() => {
    $(".settings-container").addClass("active");
    $(".navigation > :not(.settings-container)").css("filter", "blur(8px)");
    $(".settings-container").css("box-shadow", "var(--menu-box-shadow)");
    $(".content").css("overflow", "hidden");
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

  $(".links a").click(function (e) {
    e.preventDefault();
    $(".content").css("overflow", "hidden");
    const targetId = $(this).attr("href");
    const target = $(targetId);
    $("html, body").animate(
      {
        scrollTop: target.offset().top,
      },
      600
    ); // 600 =
    $(".navigation .close").click();
  });
});

$(document).on("wheel", function (e) {
  $(".content").css("overflow", "");
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

const screenIndicator = document.querySelector(".screen-indicator");

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
});

const feedbackIcon = document.getElementById('toggleIcon');
const feedbackForm = document.querySelector('.feedback-form');
const submitFeedbackButton = document.querySelector('#btnSubmitFeedback');
const feedbackMessage = document.getElementById('messageInput');
const closeFeedbackFormButton = document.querySelector('.feedback-form .close');
feedbackIcon.addEventListener('click', () => {
  console.log('showing feedback form');
  feedbackForm.classList.add('active');
});

submitFeedbackButton.addEventListener('click', () => {
  alert('You submitted: ' + messageInput.value);
  feedbackMessage.value = '';
});

closeFeedbackFormButton.addEventListener('click', () => {
  feedbackForm.classList.remove('active');
});
