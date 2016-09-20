(function ()
{
    var $doms = {},
        _isInit = false;

    var self = window.Roulette =
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
                    Loading.hide();
                    build();
                    _isInit = true;
                    cb.apply(null);
            }
        },

        stageOut: function (options, cb)
        {
            hide(cb);
        },

        resize: function ()
        {

        }
    };


    function build()
    {
        var iframeUrl = 'http://cipher-demo.gl-azhdanov.demo.terricone.com/?language=tw&country=tw';
        $doms.container = $('<iframe id="roulette" src="'+iframeUrl+'" width="100%" height="100%"></iframe>');

        $doms.container.attr("width", "100%").attr("height", "100%");
    }

    function show(cb)
    {
        $("#scene-container").append($doms.container);

        self.resize();

        $("#logo").toggleClass("roulette-mode", true);
        $("#menu").find(".icon").toggleClass("roulette-mode", true);
        $("body").toggleClass("roulette-mode", true);


        Menu.show();
        Menu.Logo._show();

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
        Menu.Logo._hide();

        var tl = new TimelineMax;
        tl.to($doms.container, .4, {autoAlpha: 0});
        tl.add(function ()
        {
            $("#logo").toggleClass("roulette-mode", false);
            $("#menu").find(".icon").toggleClass("roulette-mode", false);
            $("body").toggleClass("roulette-mode", false);
            $doms.container.detach();
            cb.apply();
        });
    }

}());