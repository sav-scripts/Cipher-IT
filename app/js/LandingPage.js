// JavaScript Document
(function ()
{
    "use strict";

    var $doms = {},
        _dateCombo,
        _isInit = false,
        _isActive = false;

    window.LandingPage =
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
        $doms.container = $("#landing-page");

        $doms.year = $doms.container.find(".select-year");
        $doms.month = $doms.container.find(".select-month");
        $doms.day = $doms.container.find(".select-day");

        var date = new Date();
        //date.setFullYear(date.getFullYear()-18);

        _dateCombo = new DateCombo($doms.year[0], $doms.month[0], $doms.day[0], null, null, null, null, '年', '月', '日', date);
        _dateCombo.to(1998, 1, 1);



        $doms.btnSend = $doms.container.find(".btn-send").on(_CLICK_, function()
        {
            if(_dateCombo.getDateString())
            {
                var value = _dateCombo.getDateValue();

                //console.log(value);

                var checkDate = new Date();
                checkDate.setFullYear(value.year);
                checkDate.setMonth(value.month-1);
                checkDate.setDate(value.day);

                var compareDate = new Date();
                compareDate.setFullYear(compareDate.getFullYear()-18);

                if(checkDate.getTime() > compareDate.getTime())
                {
                    alert("很抱歉，您必須滿 18 歲才能參加活動");
                    return;
                }


                Main.settings.isBirthValided = true;

                if(Main.firstHash)
                {
                    SceneHandler.toHash(Main.firstHash);
                    Main.firstHash = null;
                }
                else
                {
                    SceneHandler.toHash(Main.defaultHash);
                }
            }
            else
            {
                alert("請先選擇您的生日");
            }
        });

        $doms.container.css("visibility", "visible").css("display", "none");


        _isInit = true;
        Loading.hide();

        if (cb) cb.call();
    }

    function show(cb)
    {
        $doms.container.css("display", "block");

        Menu.hide();

        //Menu.Logo._show();

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

        var tl = new TimelineMax;
        tl.to($doms.container, .4, {autoAlpha: 0});
        tl.add(function ()
        {
            Menu.show();
            $doms.container.css("display", "none");
            cb.apply();
        });
    }

}());
