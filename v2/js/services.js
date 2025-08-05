"use strict"

$('.service').click( function() { 
    $('.service i').removeClass('fa-square-minus').addClass('fa-square-plus');
    let targetDescription = $(this).next('div'); 
    setTimeout(() => {
        let isTargetDescriptionOpen = targetDescription.hasClass('show');
        if (isTargetDescriptionOpen) {
            $(this).find('i').removeClass('fa-square-plus').addClass('fa-square-minus');
            //$(this).css('border-bottom', 'none');
            $(this).css('border-bottom', 'none');
            $('.service').not(this).css('border-bottom', '1px solid #ccc');
            // targetDescription.css('border-bottom', '1px solid #ccc');
        } else {
            $(this).find('i').removeClass('fa-square-minus').addClass('fa-square-plus');
             //$(this).css('border-bottom', 'none');
            // targetDescription.css('border-bottom', 'none');
        }
    }, 400);
});
