(function ()
{
    var $doms = {},
        _isInit = false;

    var self = window.ParticipateRule =
    {
        _isPopup: true,

        show: function (cb)
        {
            _isInit ? execute() : loadAndBuild(execute);

            function execute()
            {
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
                    if (cb) cb.apply();
                });
            }
        },

        hide: function (cb)
        {
            Menu.show();
            $doms.btnClose.toggleClass("showing-mode", false);

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

    function loadAndBuild(cb)
    {
        var templates =
            [
                {url: "_participate_rule.html", startWeight: 0, weight: 100, dom: null}
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
        $doms.container = $("#participate-rule");

        $doms.btnClose = $doms.container.find(".btn-close").on(_CLICK_, function()
        {
            SceneHandler.toLastHash();
        });

        $doms.container.detach();
    }

}());