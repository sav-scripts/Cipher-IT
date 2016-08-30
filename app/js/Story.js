(function ()
{
    var $doms = {},
        _isInit = false;

    var self = window.Story =
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
                        {url: "_story.html", startWeight: 0, weight: 100, dom: null}
                    ];

                SceneHandler.loadTemplate(null, templates, function loadComplete()
                {
                    build(templates);

                    //console.log($doms.sceneCanvas[0]);

                    //Loading.show();

                    StoryScene.init($doms.sceneCanvas[0], function()
                    {
                        _isInit = true;
                        $doms.container.detach();
                        cb.call();
                    });
                    //cb.apply(null);
                }, true);
            }
        },

        stageOut: function (options, cb)
        {
            hide(cb);
        },

        resize: function (width, height, scale)
        {
            if(_isInit)
            {
                StoryScene.engine.resize();
            }
        }
    };


    function build(templates)
    {
        $("#invisible-container").append(templates[0].dom);
        $doms.container = $("#story");

        $doms.sceneCanvas = $doms.container.find(".scene-canvas");


    }

    function show(cb)
    {
        $("#scene-container").append($doms.container);

        self.resize();

        Menu.show();
        Menu.Logo._show();

        StoryScene.setActive(true);

        var tl = new TimelineMax;
        tl.set($doms.container, {autoAlpha: 0});
        tl.to($doms.container, 1.0, {autoAlpha: 1, ease:Power3.easeIn});
        tl.add(function ()
        {
            cb.apply();
        });
    }

    function hide(cb)
    {
        Menu.Logo._hide();
        Menu.hide();

        var tl = new TimelineMax;
        tl.to($doms.container, .4, {autoAlpha: 0});
        tl.add(function ()
        {
            StoryScene.setActive(false);
            $doms.container.detach();
            cb.apply();
        });
    }

}());