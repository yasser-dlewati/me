"use strict";
$(function () {
  // MENU
  $(".navbar .nav-link").on("click", function () {
    $(".navbar-collapse").collapse("hide");
  });

  $(window).on("scroll", function () {
    /*----------------------------------------------------*/
    /*  Navigtion Menu Scroll
        /*----------------------------------------------------*/

    var b = $(window).scrollTop();

    if (b > 72) {
      $(".navbar").addClass("scroll");
    } else {
      $(".navbar").removeClass("scroll");
    }
  });

  // SMOOTHSCROLL
  $(function () {
    $(".navbar .nav-link").on("click", function (event) {
      var $anchor = $(this);
      $("html, body")
        .stop()
        .animate(
          {
            scrollTop: $($anchor.attr("href")).offset().top - 49,
          },
          1000
        );
      event.preventDefault();
    });
  });
});

$("#scroll-down").click(function () {
  var current = 0;
  $("html, body").animate(
    {
      scrollTop: $("section").next().offset().top,
    },
    500
  );
});

function renderScreenIndicator() {
  var count = $("section").length;
  var content =
    '<li class="active" value="0"><a>Top</a></li><li value="1"><a>About</a></li><li value="2"><a>Experience</a></li><li value="3"><a>Contact</a></li>';
}

function setScreenIndicator(index) {
  $(".screen-indicator i").each(function () {
    $(this).removeClass("active");
  });
  $($(".screen-indicator i")[index]).addClass("active");
}

$(document).ready(function () {
  window.scrollTo(0, 0);
  setTimeout(() => {
    var $loader = $(".loader").removeClass("loader");
    $loader.remove();
  }, 1000);

  $(".img-banner").hide();
  setTimeout(() => {
    $(".img-banner").fadeIn(1000);
  }, 2000);
  $(".hero-text .message");
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
  setScreenIndicator(0);
  $(window).scroll(function () {
    var b = $(window).scrollTop();
    var sections = $("section");
    if (b > $(sections[0]).offset().top && b < $(sections[1]).offset().top) {
      setScreenIndicator(0);
    } else if (
      b > $(sections[1]).offset().top &&
      b < $(sections[2]).offset().top
    ) {
      setScreenIndicator(1);
    } else if (
      b > $(sections[2]).offset().top &&
      b < $(sections[3]).offset().top
    ) {
      setScreenIndicator(2);
    } else if (b > $(sections[3]).offset().top) {
      setScreenIndicator(3);
    }
  });

  $("footer img").click(function () {
    $(window).scrollTop(0, 0);
    console.log("back to top");
  });

  $(".navigation .close").click(function () {
    $(".content").animate({ "margin-left": 0 }, 500);
    $("section").css("filter", "");
    $(".screen-indicator i").css("font-size", "20px");
    $(".screen-indicator i").css("padding", "");
  });

  $(".screen-indicator").click(function () {
    if ($(".content").css("margin-left") === "0px") {
      $(".content").animate({ "margin-left": "-30%" }, 500);
      $("section").css("filter", "blur(8px)");
      $(".screen-indicator i").css("font-size", "32px");
      $(".screen-indicator i").css("padding", "20px");
    }
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
});
