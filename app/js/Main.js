(function(){

    "use strict";
    var self = window.Main =
    {
        settings:
        {
            isLocal: false,
            isMobile: false,

            useFakeData: false,

            isiOS: false,
            isLineBrowser: false,

            isBirthValided: false,

            deadTime: null,

            viewport:
            {
                width: 0,
                height: 0,
                ranges: [640],
                index: -1,
                changed: false
            }
        },

        hashArray:
        [
            "/LandingPage",
            "/Participate",
            "/ParticipateRule"
        ],

        init: function()
        {
            if ('scrollRestoration' in history) {
                history.scrollRestoration = 'manual';
            }

            if(Utility.urlParams.skipLaw == '1') self.settings.isBirthValided = true;

            self.settings.isiOS = Utility.isiOS();

            window._CLICK_ = (self.settings.isiOS)? "touchend": "click";

            Menu.init();

            //ApiProxy.callApi("get_event_data", null, null, function(response)
            //{
            //    console.log(response);
            //});

            startApp();

            function startApp()
            {
                SceneHandler.init(Main.hashArray,
                {
                    defaultHash: "/Participate",
                    listeningHashChange: true,
                    loadingClass: Loading,
                    version: new Date().getTime(),
                    hashChangeTester: function(hashName)
                    {
                        if(!self.settings.isBirthValided && hashName != "/LandingPage")
                        {
                            hashName = null; // cancel content change
                            SceneHandler.setHash('/LandingPage');

                            return null;
                        }

                        //if(hashName == "/SerialInput")
                        //{
                        //    if(new Date().getTime() > self.settings.deadTime)
                        //    {
                        //        //console.log("is end");
                        //        alert("活動已結束，感謝您的參與");
                        //
                        //        hashName = null; // cancel content change
                        //        SceneHandler.setHash('/Index');
                        //
                        //        return null;
                        //    }
                        //}


                        return hashName;
                    }
                });

                if(Utility.urlParams.skipLaw == '1')
                {
                    SceneHandler.toFirstHash();
                }
                else
                {
                    SceneHandler.toHash("/LandingPage");
                }
            }


            $(window).on("resize", onResize);
            onResize();
        }
    };

    function onResize()
    {
        var width = $(window).width(),
            height = $(window).height();


        var i,
            vp = self.settings.viewport;
        for(i=0;i<vp.ranges.length;i++)
        {
            if(vp.ranges[i] >= width) break;
        }

        var oldIndex = vp.index;

        vp.index = i;
        vp.width = width;
        vp.height = height;
        vp.changed = (oldIndex !== vp.index);

        if(SceneHandler.currentScene)
        {
            SceneHandler.currentScene.resize();
        }
    }

}());



(function(){

    window.MyTools =
    {
        setupInput: function($input, activeHint, maxLength, toUpperCase)
        {
            var defaultText = $input.val();

            if(activeHint)
            {
                $input.on("focus", function()
                {
                    $input.toggleClass("hint-mode", false);
                    if($input.val() == defaultText) $input.val('');
                });

                $input.on("blur", function()
                {
                    if($input.val() == '')
                    {
                        $input.val(defaultText);
                        $input.toggleClass("hint-mode", true);
                    }
                    else
                    {
                        $input.toggleClass("hint-mode", false);
                    }
                });

                $input._checkOk = function()
                {
                    return !($input.val() == defaultText);
                };
            }

            $input.on("input", function()
            {
                if(toUpperCase)
                {
                    $input.val($input.val().toUpperCase());
                }
                if(maxLength && $input.val().length > maxLength)
                {
                    $input.val($input.val().substr(0, maxLength));
                }
            });

        }

    };

}());