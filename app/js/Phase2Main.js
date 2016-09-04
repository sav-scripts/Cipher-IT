(function(){

    "use strict";
    var self = window.Main =
    {
        version: "0.0.0",
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
            "/Intro",

            "/Story",

            "/Story/Evidences",
            "/Story/TattooMan",
            "/Story/Backpacker",
            "/Story/Bartender",
            "/Story/SportGirl",
            "/Story/Businessman",
            "/Story/Door",

            "/Story/Key",
            "/Story/Phone",
            "/Story/Poster",
            "/Story/Photos",
            "/Story/Billboard",
            "/Story/Fingerprint",
            "/Story/Medal",
            "/Story/Briefcase",

            "/HappyEnd",

            "/Participate",
            "/Participate/Product",
            "/Participate/Form",
            "/ParticipateRule"
        ],

        firstHash: '',
        defaultHash: '/Intro',

        init: function()
        {
            CSSPlugin.defaultTransformPerspective = 400;

            self.version = new Date().getTime();

            if ('scrollRestoration' in history) {
                history.scrollRestoration = 'manual';
            }

            if(Modernizr.touchevents && Utility.urlParams.debug == '1') Logger.init(true).show();

            ScalableContent.init([640, 1920]);
            ScalableContent.enableFixFullImage = false;
            ScalableContent.enableDrawBounds = Utility.urlParams.drawbound == '1';

            if(Utility.urlParams.skipLaw == '1') self.settings.isBirthValided = true;

            self.settings.isiOS = Utility.isiOS();

            window._CLICK_ = (self.settings.isiOS)? "touchend": "click";

            Menu.init();

            startApp();

            function startApp()
            {
                SceneHandler.init(Main.hashArray,
                {
                    defaultHash: self.defaultHash,
                    listeningHashChange: true,
                    loadingClass: Loading,
                    version: new Date().getTime(),

                    cbBeforeChange: function()
                    {
                        Menu.close();
                    },

                    hashChangeTester: function(hashName)
                    {
                        if(!self.settings.isBirthValided && hashName != "/LandingPage")
                        {
                            hashName = null; // cancel content change
                            SceneHandler.setHash('/LandingPage');

                            return null;
                        }


                        return hashName;
                    }
                });

                self.firstHash = SceneHandler.getHash();

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

        var $dom = $("#scene-container");
        ScalableContent.updateView($dom.width(), $dom.height());

        //ScalableContent.updateView(width, height);
        ScalableContent.updateResizeAble();
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