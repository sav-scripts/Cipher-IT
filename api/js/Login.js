// JavaScript Document
(function ()
{
    "use strict";

    var $doms = {},
        _isInit = false,
        _isActive = false;

    window.Login =
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
            if (!_isInit) return;

        }

    };

    function loadAndBuild(cb)
    {
        $doms.container = $("#login-dialog");

        $doms.inputs =
        {
            userName: $("#user-name").val('').keyup(function(event){
                if(event.keyCode == 13){
                    $doms.btnSend.click();
                }
            }),
            userPassword: $("#user-password").val('').keyup(function(event){
                if(event.keyCode == 13){
                    $doms.btnSend.click();
                }
            })
        };

        $doms.btnSend = $(".btn-send").on("click", function()
        {
            ApiProxy.callApi("admin_cmds",
                {
                    cmd: "login",
                    username: $doms.inputs.userName[0].value,
                    password: $doms.inputs.userPassword[0].value

                }, null, function(response)
                {
                    if(response.error)
                    {
                        alert(response.error);
                    }
                    else
                    {
                        SceneHandler.toHash("/Participate");
                    }
                });
        });

        $doms.container.css("visibility", "visible");
        _isInit = true;
        if (cb) cb.call();
    }

    function show(cb)
    {
        $doms.container.toggleClass("open-mode", true);


        AdminMain.$doms.commandContainer.toggleClass("open-mode", false);
        AdminMain.$doms.background.toggleClass("command-mode", false);

        cb.apply();

        //$doms.container.css("display", "block");

        //var tl = new TimelineMax;
        //tl.set($doms.container, {autoAlpha: 0});
        //tl.to($doms.container, .4, {autoAlpha: 1});
        //tl.add(function ()
        //{
        //    _isActive = true;
        //    cb.apply();
        //});
    }

    function hide(cb)
    {
        $doms.container.toggleClass("open-mode", false);
        AdminMain.$doms.commandContainer.toggleClass("open-mode", true);
        AdminMain.$doms.background.toggleClass("command-mode", true);
        //_isActive = false;
        //
        //var tl = new TimelineMax;
        //tl.to($doms.container, .4, {autoAlpha: 0});
        //tl.add(function ()
        //{
        //    $doms.container.css("display", "none");
        //    cb.apply();
        //});
        cb.apply();
    }

}());
