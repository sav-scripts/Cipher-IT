(function ()
{
    var $doms = {},
        _isInit = false,
        _focusIndex = null,
        _scrolling = false,
        _lastClickedIndex;

    var self = window.Notes =
    {
        stageIn: function (options, cb)
        {
            (!_isInit) ? loadAndBuild(execute) : execute();
            function execute(isFromLoad)
            {
                if (isFromLoad && options.cbContentLoaded) options.cbContentLoaded.call();
                show(cb);
            }

            function loadAndBuild(cb)
            {
                var templates =
                    [
                        {url: "_notes.html", startWeight: 0, weight: 100, dom: null}
                    ];

                SceneHandler.loadTemplate(null, templates, function loadComplete()
                {
                    build(templates);
                    _isInit = true;
                    cb.apply(null);
                }, 0);
            }
        },

        stageOut: function (options, cb)
        {
            hide(cb);
        },

        executeAfterPopupClosed: function()
        {
            Menu.show();
        },

        toContent: function(contentIndex, cb)
        {
            if(!_isInit) return;

            var $content = $doms["section-" + contentIndex];
            var targetTop = $content.offset().top - getTopBleed();
            if(contentIndex == 1) targetTop = 0;

            var dTop = Math.abs(targetTop - $(window).scrollTop());

            var duration = dTop / 1400;
            if(duration < .7) duration = .7;
            if(duration > 2) duration = 2;

            changeFocusIndex(contentIndex);

            if(contentIndex != 1)
            {
                $doms.topMenu.toggleClass('scrolled-mode', true);
            }

            _scrolling = true;

            TweenLite.killTweensOf(window);

            TweenLite.to(window, duration, {scrollTo: targetTop, ease:Power1.easeInOut, onComplete: function()
            {
                _scrolling = false;
                updateScrollTop();
                if(cb) cb.call();
            }});
        },

        resize: function ()
        {
            if(_isInit)
            {
                var vp = Main.settings.viewport;
                var $section = $doms['section-10'];

                var minMb = vp.height * .1 + 20,
                    mb = vp.height - $section.height() - getTopBleed();

                if(mb < minMb) mb = minMb;

                $section.css("margin-bottom", mb);

                updateScrollTop();
            }
        }
    };


    function build(templates)
    {
        $("#invisible-container").append(templates[0].dom);
        $doms.container = $("#notes");

        $doms.topMenu = $doms.container.find(".top-menu");

        $doms.buttonContainer = $doms.container.find(".button-container");
        $doms.sectionContainer = $doms.container.find(".sections");

        $doms.topMenu = $doms.container.find(".top-menu");

        for(var i=1;i<=10;i++)
        {
            setupContent(i);
        }


        $doms.container.detach();
    }

    function setupContent(index)
    {
        $doms["section-" + index] = $doms.sectionContainer.find(".section:nth-child("+index+")");
        var $btn = $doms["button-" + index] = $doms.buttonContainer.find(".button:nth-child("+index+")").on(_CLICK_, function()
        {
            _lastClickedIndex = index;
           self.toContent(index);
        }).on("pointerenter", function()
        {
            $btn.toggleClass("selected-mode", true);
        }).on("pointerout", function()
        {
            if(index !== _lastClickedIndex) $btn.toggleClass("selected-mode", false);
            if(!_scrolling) updateScrollTop();
        });
    }

    function updateScrollTop()
    {
        if(_scrolling) return;

        $doms.topMenu.toggleClass("scrolled-mode", ($(window).scrollTop() > 10));

        var bleed = getTopBleed();
        var top = $(window).scrollTop() + bleed + 50;


        var i, $section, index = 1;
        for(i=1;i<=10;i++)
        {
            $section = $doms['section-' + i];
            //console.log($section.offset().top);

            if($section.offset().top >= top)
            {
                break;
            }

            index = i;
        }
        changeFocusIndex(index);
    }
    
    function getTopBleed()
    {
        var bleed = parseInt($doms["section-1"].css("margin-top"));
        if(Main.settings.viewport.index == 0) bleed -= 82;
        return bleed;
    }

    function changeFocusIndex(index)
    {

        var oldFocusIndex = _focusIndex;
        _focusIndex = index;
        if(oldFocusIndex)
        {
            $doms['button-'+oldFocusIndex].toggleClass("selected-mode", false);
        }

        $doms['button-'+_focusIndex].toggleClass("selected-mode", true);

    }


    function show(cb)
    {
        $("#scene-container").append($doms.container);

        $(window).on("scroll", updateScrollTop);
        updateScrollTop();

        Menu.show();
        //Menu.Logo._show();

        self.resize();

        var tl = new TimelineMax;
        tl.set($doms.container, {autoAlpha: 0});
        tl.to($doms.container, .4, {autoAlpha: 1});
        tl.add(function ()
        {
            cb.apply();
        });
    }

    function hide(cb)
    {
        Menu.hide();
        //Menu.Logo._hide();
        $(window).unbind("scroll", updateScrollTop);

        var tl = new TimelineMax;
        tl.to($doms.container, .4, {autoAlpha: 0});
        tl.add(function ()
        {
            $doms.container.detach();
            cb.apply();
        });
    }

}());