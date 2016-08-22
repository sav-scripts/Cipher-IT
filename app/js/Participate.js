(function ()
{
    var $doms = {},
        _dateCombo,
        _isInit = false;

    var self = window.Participate =
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
                        {url: "_participate.html", startWeight: 0, weight: 100, dom: null}
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

        resize: function (width, height, scale)
        {

        }
    };


    function build(templates)
    {
        $("#invisible-container").append(templates[0].dom);
        $doms.container = $("#participate");

        $doms.part2 = $doms.container.find(".part-2");

        $doms.arrowDown = $doms.container.find(".arrow-down").on(_CLICK_, function()
        {
            var targetTop = $doms.part2.offset().top;
            TweenLite.to(window,.8, {scrollTo: targetTop, ease:Power1.easeInOut});
        });

        $doms.year = $doms.container.find("#select-year");
        $doms.month = $doms.container.find("#select-month");
        $doms.day = $doms.container.find("#select-day");

        _dateCombo = new DateCombo($doms.year[0], $doms.month[0], $doms.day[0], null, null, null, null, '年', '月', '日');


        $doms.fields =
        {
            name: $doms.container.find(".user-name"),
            phone: $doms.container.find(".user-phone"),
            email: $doms.container.find(".user-email")
        };

        MyTools.setupInput($doms.fields.name, true, 20);
        MyTools.setupInput($doms.fields.phone, true, 10);
        MyTools.setupInput($doms.fields.email, true, 50);

        $doms.container.detach();
    }

    function show(cb)
    {
        $("#scene-container").append($doms.container);

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
        var tl = new TimelineMax;
        tl.to($doms.container, .4, {autoAlpha: 0});
        tl.add(function ()
        {
            $doms.container.detach();
            cb.apply();
        });
    }

}());