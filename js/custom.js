
'use strict'
$(function () {
    // MENU
    $('.navbar .nav-link').on('click', function () {
        $(".navbar-collapse").collapse('hide');
    });

    $(window).on('scroll', function () {

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
        $('.navbar .nav-link').on('click', function (event) {
            var $anchor = $(this);
            $('html, body').stop().animate({
                scrollTop: $($anchor.attr('href')).offset().top - 49
            }, 1000);
            event.preventDefault();
        });
    });

});

$('#scroll-down').click(function () {
    var current = 0;
    $('html, body').animate({
        scrollTop: ($("section").next()).offset().top
    }, 500);
})

function renderScreenIndicator() {
    var count = $('section').length
    var content = ''
    for (var i = 0; i < count; i++) {
        content += '<li></li>'
    }

    $('.screen-indicator').html(content)
}

function setScreenIndicator(index) {
    if (index === 0) {
        $('.screen-indicator').html('<li class="active"></li><li></li><li></li><li></li>')
    }
    if (index === 1) {
        $('.screen-indicator').html('<li></li><li class="active"></li><li></li><li></li>')
    }
    if (index === 2) {
        $('.screen-indicator').html('<li></li><li></li><li class="active"></li><li></li>')
    }
    if (index === 3) {
        $('.screen-indicator').html('<li></li><li></li><li></li><li class="active"></li>')
    }
}

$(document).ready(function () {
    setTimeout(() => {
        window.scrollTo(0, 0);
        var $loader = $(".loader").removeClass("loader");
        $loader.remove();
    }, 800);

    renderScreenIndicator()
    setScreenIndicator(0)
    $(window).scroll(function () {
        var b = $(window).scrollTop();
        var sections = $("section")
        if (b > $(sections[0]).offset().top && b < $(sections[1]).offset().top) {
            setScreenIndicator(0)
        }
        else if (b > $(sections[1]).offset().top && b < $(sections[2]).offset().top) {
            setScreenIndicator(1)
        }
        else if (b > $(sections[2]).offset().top && b < $(sections[3]).offset().top) {
            setScreenIndicator(2)
        }
        else if (b > $(sections[3]).offset().top) {
            setScreenIndicator(3)
        }
        console.log(b);
    })
})