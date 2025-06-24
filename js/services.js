"use strict"

$('.service').click( function() { 
    $('.service i').removeClass('fa-square-minus').addClass('fa-square-plus');
    let targetDescription = $(this).next('div'); 
    setTimeout(() => {
        let isTargetDescriptionOpen = targetDescription.hasClass('show');
        if (isTargetDescriptionOpen) {
            $(this).find('i').removeClass('fa-square-plus').addClass('fa-square-minus');
        } else {
            $(this).find('i').removeClass('fa-square-minus').addClass('fa-square-plus');
        }
    }, 400);
});
