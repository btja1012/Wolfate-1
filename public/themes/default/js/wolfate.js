$(function(){
    // Scroll menu change
    var $mainMenu = $('.main-nav');
    $(window).scroll(function() {
        if ($(window).scrollTop() >= (40)){
            $mainMenu.addClass('scroll-down');
        } else {
            $mainMenu.removeClass('scroll-down');
        }
    });
});