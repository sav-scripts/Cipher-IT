/**
 * Created by sav on 2016/4/7.
 */
(function(){

    var _currentView =
    {
        width: 0,
        height: 0,
        viewWidthRanges: [640, 1280], // change content type when screen width between [0 ~ 640], [640 ~ 1280], [1280+] (3 modes total)
        modeIndex: -1,
        modeChanged: false
    };

    window.ScalableContent =
    {
        enableFixFullImage: true,
        enableDrawBounds: true,

        init: function(viewWidthRanges)
        {
            _currentView.viewWidthRanges = viewWidthRanges;
        },

        updateView: function(width, height)
        {

            var cv = _currentView,
                oldModeIndex = cv.modeIndex,
                index = 0;

            while(width > cv.viewWidthRanges[index] && index < cv.viewWidthRanges.length) index++;

            cv.modeIndex = index;
            cv.modeChanged = oldModeIndex != cv.modeIndex;

            cv.width = width;
            cv.height = height;

        },
        updateResizeAble: function()
        {
            var $doms = $(document).find("[resizable]");
            $.each($doms, function(index, dom)
            {
                resizeDom(dom);
            });
        },

        fixFullImage: function($container)
        {
            //if(Modernizr.bgsizecover) return;
            if(!ScalableContent.enableFixFullImage) return;

            var $doms = $container.find("[full-image='']");

            $.each($doms, function(index, dom)
            {
                var imageSrc, $dom = $(dom);

                $dom.attr("full-image", "handled");

                imageSrc = $dom.css("background-image");
                if(!imageSrc) return;
                imageSrc = imageSrc.slice(5, imageSrc.length-2);
                //console.log(imageSrc);

                var img = document.createElement("img");
                img.setAttribute("width", "100%");
                img.setAttribute("height", "100%");
                img.setAttribute("full-size-image-for", dom.className);
                //img.setAttribute("src", imageSrc);
                img.src = imageSrc;

                img.className = "full-size-image";

                $(dom).prepend(img).css("background-image", "none");
            });

            $doms = $container.find("[full-btn]");

            $.each($doms, function(index, dom)
            {
                var $dom = $(dom);
                $dom.removeAttr("full-btn");

                $dom.toggleClass("full-size-btn", true);
                $dom.find("img").toggleClass("full-size-btn-image", true);
            });

            $doms = $container.find("[hover-fix]");

            $.each($doms, function(index, dom)
            {
                var $dom = $(dom);
                $dom.removeAttr("hover-fix");

                $dom.on("mouseover", function()
                {
                    $dom.toggleClass("hovered", true);
                });
                $dom.on("mouseout", function()
                {
                    $dom.toggleClass("hovered", false);
                });
            });
        }
    };

    function resizeDom(dom)
    {
        var $dom = $(dom);
        if(!dom._viewports)
        {
            var string = $dom.attr("resizable"),
                array = string.split(";");

            dom._viewports = [];

            for(var i=0;i<array.length;i++)
            {
                var a3 = array[i].split('p'),
                    sizeArray = a3[0]? a3[0].split("x"): [0, 0],
                    paddingArray = a3[1]?  a3[1].split("x"): [0, 0];

                var hasPadding = paddingArray? true: false;

                dom._viewports.push(
                    {
                        w:parseInt(sizeArray[0]),
                        h: parseInt(sizeArray[1]),
                        paddingW: parseInt(paddingArray[0]),
                        paddingH: parseInt(paddingArray[1]),
                        hasPadding: hasPadding
                    });
            }
        }
        var bound = dom._viewports[_currentView.modeIndex];
        if(!bound) return;

        if(ScalableContent.enableDrawBounds && !dom._boundDom)
        {
            drawBound($dom, bound);
        }

        if(dom._boundDom)
        {
            $(dom._boundDom).css("width", bound.w+"%").css("height", bound.h+"%").css("left", (-bound.w *.5)+"%").css("top", (-bound.h *.5)+"%");
            var s = bound.w + " x " + bound.h;
            if(bound.paddingW || bound.paddingH) s = "size: " + s + "</br>padding: " + bound.paddingW + " x " + bound.paddingH;
            dom._boundDom.textDom.innerHTML = s;
        }

        var scale = Helper.getSize_contain(
            _currentView.width - bound.paddingW*2,
            _currentView.height - bound.paddingH*2,
            bound.w,
            bound.h).ratio;

        if(scale > 1) scale = 1;
        $dom.css("width", 100*scale).css("height", 100*scale);
    }

    function drawBound($dom, bound)
    {
        if(!ScalableContent.enableDrawBounds) return;

        var textDom = document.createElement("div");
        textDom.className = "text";
        //textDom.innerHTML = bound.w + " x " + bound.h;

        var dom = document.createElement("div");
        dom.className = "bound";
        $(dom).css("width", bound.w+"%").css("height", bound.h+"%").css("left", (-bound.w *.5)+"%").css("top", (-bound.h *.5)+"%");
        dom.appendChild(textDom);

        dom.textDom = textDom;

        $dom.prepend(dom);

        $dom[0]._boundDom = dom;
    }

}());