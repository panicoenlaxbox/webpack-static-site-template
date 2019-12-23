(function ($) {
    $.fn.bold = function () {
        return this.each(function () {
            $(this).css("font-weight", "bold");
        });
    };
})(jQuery);