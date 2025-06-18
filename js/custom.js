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

const setSectionsStylesForScrolling = () => {
  $('section').each(function(index) {
    $(this).css('z-index', index + 1);
    $(this).css('top', `${index * 8}px`);
    $(this).height(`calc(100vh - ${index * 8}px)`)
  });
};

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

$('#teaser #close').click(function(){
    $('#teaser').hide();
    $('.navbar').css('margin-top','0');
})

$(document).ready(function () {
  setSectionsStylesForScrolling();
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
  hoverOnNavLinksWithIcons();
  renderScreenIndicator();
  $(window).scroll(function () {
      setScreenIndicatorAccordingToScroll();
    });
    setScreenIndicator(0);

  function setScreenIndicatorAccordingToScroll() {
    var b = $(window).scrollTop() + 4;
    var sections = $("section");
    if (
      b > $(sections[0]).offset().top - $(window).height() / 2 &&
      b < $(sections[1]).offset().top - $(window).height() / 2
    ) {
      setScreenIndicator(0);
    } else if (
      b > $(sections[1]).offset().top - $(window).height() / 2 &&
      b < $(sections[2]).offset().top - $(window).height() / 2
    ) {
      setScreenIndicator(1);
    } else if (
      b > $(sections[2]).offset().top - $(window).height() / 2 &&
      b < $(sections[3]).offset().top - $(window).height() / 2
    ) {
      setScreenIndicator(2);
    } else if (b > $(sections[3]).offset().top - $(window).height() / 2) {
      setScreenIndicator(3);
    }
  }

  $("footer .logo").click(function () {
    $(window).scrollTop(0, 0);
    console.log("back to top");
  });

  $(".navigation .close").click(function () {
    if(document.querySelector('.navigation').style.marginLeft!=='50%'){
    $(".content").animate({ "margin-left": 0 }, 500);
    $("section").css("filter", "");
    $(".screen-indicator").removeClass("show-nav");
    $(".screen-indicator").css("right", "0");
    $(".menu-icon").show();
    }
  });

  $(".menu-icon").click(function () {
    console.log('show menu');
    if ($(".content").css("margin-left") === "0px") {
      $(".content").animate({ "margin-left": "-100%" }, 500);
      $("section").css("filter", "blur(8px)");
    }
  });

  $('.settings').click(()=>{
    console.log('this is coming soon')
return;
      $(".navigation").animate({ "margin-left": "50%" }, 500);
      $("section").css("filter", "blur(8px)");
      $('.navigation > :not(.settings-container)').css("filter", "blur(8px)");
  })

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

  $(".links a").click(function () {
    $(".navigation .close").click();
  });
});

function hoverOnNavLinksWithIcons() {
  $(".links a")
    .on("mouseenter", function () {
      var index = $(this).index();
      $($(".screen-indicator i")[index]).css("color", "var(--white-color)");
    })
    .on("mouseleave", function () {
      var index = $(this).index();
      $($(".screen-indicator i")[index]).css("color", "");
    });
}
