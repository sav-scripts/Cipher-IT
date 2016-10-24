(function ()
{
    var $doms = {},
        _isInit = false;

    var self = window.Winners =
    {
        _isPopup: true,

        show: function (cb)
        {
            _isInit ? execute() : loadAndBuild(execute);

            function execute()
            {
                $(".safety-text").toggleClass("scroll-mode", true);

                Menu.hide();
                $doms.btnClose.toggleClass("showing-mode", true);
                $("body").toggleClass("no-scroll-mode", true).append($doms.container);
                //$("body").append($doms.container);

                self.resize();

                var tl = new TimelineMax;
                tl.set($doms.container, {autoAlpha: 0});
                tl.to($doms.container, .4, {autoAlpha: 1});
                tl.add(function ()
                {
                    $doms.container.on("scroll", updateScrollTop);
                    $doms.container.trigger("scroll");

                    if (cb) cb.apply();
                });
            }
        },

        hide: function (cb)
        {
            $doms.container.unbind("scroll", updateScrollTop);
            //Menu.show();
            $doms.btnClose.toggleClass("showing-mode", false);

            $(".safety-text").toggleClass("scroll-mode", false);

            var tl = new TimelineMax;
            tl.to($doms.container, .4, {autoAlpha: 0});
            tl.add(function ()
            {
                $doms.container.detach();
                $("body").toggleClass("no-scroll-mode", false);
                if (cb) cb.apply();
            });
        },

        resize: function (width, height, scale)
        {

        }
    };


    function updateScrollTop()
    {
        $doms.topBar.toggleClass("open-mode", ($doms.container.scrollTop() > 101));
    }

    function loadAndBuild(cb)
    {
        var templates =
            [
                {url: "_winners.html", startWeight: 0, weight: 100, dom: null}
            ];

        SceneHandler.loadTemplate(null, templates, function loadComplete()
        {
            build(templates);
            _isInit = true;
            cb.apply(null);
        }, 0);
    }


    function build(templates)
    {
        $("#invisible-container").append(templates[0].dom);
        $doms.container = $("#winners");

        $doms.contentContainer = $doms.container.find(".container");
        $doms.topBar = $doms.container.find(".top-bar");

        $doms.btnClose = $doms.container.find(".btn-close").on(_CLICK_, function()
        {
            if(SceneHandler.getLastHash() == "/LandingPage")
            {
                SceneHandler.toHash("/Intro");
            }
            else
            {
                SceneHandler.toLastHash();
            }
        });

        $doms.container.detach();
    }

}());