"use strict"

$('.service').click( function() { 
    $('.service i').removeClass('fa-square-minus').addClass('fa-square-plus');
    let targetDescription = $(this).next('div'); 
    setTimeout(() => {
        let isTargetDescriptionOpen = targetDescription.hasClass('show');
        if (isTargetDescriptionOpen) {
            $(this).find('i').removeClass('fa-square-plus').addClass('fa-square-minus');
            $(this).css('border-bottom', 'none');
            $('.service').not(this).css('border-bottom', '1px solid #ccc');
        } else {
            $(this).find('i').removeClass('fa-square-minus').addClass('fa-square-plus');
            $(this).css('border-bottom', '1px solid #ccc');
            $(this).css('background-color', 'var(--bg-light-color)')
            $(this).css('color', 'var(--text-dark-color)')
        }
    }, 400);
});
