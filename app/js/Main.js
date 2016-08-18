(function(){

    "use strict";
    var self = window.Main =
    {
        init: function()
        {
            ScalableContent.init([640, 1280]);
            ScalableContent.enableFixFullImage = true;
            ScalableContent.enableDrawBounds = true;

            $(window).on("resize", onResize);
            onResize();
        }
    };

    function onResize()
    {
        var width = $(window).width(),
            height = $(window).height();


        //ScalableContent.updateView(1280, height);

        ScalableContent.updateView(width, height);
        ScalableContent.updateResizeAble();
    }

}());
