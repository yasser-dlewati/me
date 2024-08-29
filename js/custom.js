
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
    var content = '<li class="active" value="0"><a>Top</a></li><li value="1"><a>About</a></li><li value="2"><a>Experience</a></li><li value="3"><a>Contact</a></li>'
   
    //$('.screen-indicator').html(content)
}

function setScreenIndicator(index) {
    $('.screen-indicator i').each(function () {
        $(this).removeClass('active')
    })
    $($('.screen-indicator i')[index]).addClass('active')
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

    $('footer img').click(function(){
        $(window).scrollTop(0, 0);
        console.log('back to top')
    });


    $('.screen-indicator li').click(function(){
        let sections= $('section');
        let index = $(this).prop('value')
        let top = $(sections[index]).offset().top
        $('html').scrollTop(top+1)
        setScreenIndicator(index)
       console.log('clicking'+$(this).prop('value'))
    })

    $('.screen-indicator').click(function(){
        var x = $(".navigation");
        if (x.css("display") === "block") {
          x.css("display", "none");
        } else {
            x.css("display", "block");
            x.css("height", "100vh");
        }
      })
    
})