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
            //if(_isInit)
            //{
            //    var vp = Main.settings.viewport;
            //
            //    var bleed = 100,
            //        contentWidth = 1200,
            //        contentHeight = 677;
            //
            //    var bound = Helper.getSize_contain(vp.width-bleed, vp.height *.9 - 180, contentWidth, contentHeight);
            //    console.log(bound);
            //    $doms.container.css('width', bound.width).css('height', bound.height).css("left", "50%").css("top", "45%").css("margin-left", -bound.width *.5).css("margin-top", -bound.height *.5 + 40);
            //
            //}
        }
    };


    function build()
    {
        //var iframeUrl = 'http://cipher-demo.gl-azhdanov.demo.terricone.com/?language=tw&country=tw';
        var iframeUrl = 'https://cipherapp.theglenlivet.com/?language=tw&country=tw';
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
        $(".footer").toggleClass("roulette-mode", true);


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
            $(".footer").toggleClass("roulette-mode", false);
            $doms.container.detach();
            cb.apply();
        });
    }

}());