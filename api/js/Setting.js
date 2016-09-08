// JavaScript Document
(function ()
{
    "use strict";

    var $doms = {},
        _isInit = false,
        _isActive = false;

    window.Setting =
    {
        init: function ()
        {
            loadAndBuild();
        },

        stageIn: function (options, cb)
        {
            (!_isInit) ? loadAndBuild(execute) : execute();
            function execute()
            {
                show(cb);
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

    function loadAndBuild(cb)
    {
        $doms.container = $("#setting");

        $doms.container.css("visibility", "visible").css("display", "none");
        _isInit = true;
        if (cb) cb.call();
    }

    function show(cb)
    {
        $doms.container.css("display", "block");

        AdminMain.changeCommand('setting');

        var tl = new TimelineMax;
        tl.set($doms.container, {autoAlpha: 0});
        tl.to($doms.container, .4, {autoAlpha: 1});
        tl.add(function ()
        {
            _isActive = true;
            cb.apply();
        });
    }

    function hide(cb)
    {
        _isActive = false;

        $doms.container.css("display", "none");
        cb.apply();
    }

}());
