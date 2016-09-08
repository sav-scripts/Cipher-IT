(function(){

    "use strict";
    var self = window.Main =
    {
        version: "0.0.0",
        demoSettings:
        {
            fb_appid: "917314775079865",
            path: "demo.ogilvyrw.com/website/theglenlivet-Cipher/phase2/phase2.html"
        },
        localSettings:
        {
            fb_appid: "917314171746592",
            path: "http://local.savorks.com/projects/hogarth-ogilvy/Cipher-IT/app/phase2.html"
        },
        settings:
        {
            fb_appid: "917311835080159",
            fbPermissions: [],

            path: "http://www.theglenlivet.com.tw/events/2016Cipher/dist/phase2.html",

            isLocal: false,
            isMobile: false,

            useFakeData: false,

            isiOS: false,
            isLineBrowser: false,

            isBirthValided: false,

            deadTime: null,

            startPhase: 0,

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

            if( window.location.host == "local.savorks.com" || window.location.host == "socket.savorks.com")
            {
                $.extend(self.settings, self.localSettings);
            }
            else if( window.location.host == "demo.ogilvyrw.com")
            {
                $.extend(self.settings, self.demoSettings);
            }

            self.settings.isLineBrowser = Boolean(navigator.userAgent.match('Line'));
            self.settings.isiOS = Utility.isiOS();

            self.version = new Date().getTime();

            if ('scrollRestoration' in history) {
                history.scrollRestoration = 'manual';
            }

            if(Utility.urlParams.startPhase) self.settings.startPhase = parseInt(Utility.urlParams.startPhase);

            if(Modernizr.touchevents && Utility.urlParams.debug == '1') Logger.init(true).show();

            ScalableContent.init([640, 1920]);
            ScalableContent.enableFixFullImage = false;
            ScalableContent.enableDrawBounds = Utility.urlParams.drawbound == '1';

            if(Utility.urlParams.skipLaw == '1') self.settings.isBirthValided = true;

            self.settings.isiOS = Utility.isiOS();

            window._CLICK_ = (self.settings.isiOS)? "touchend": "click";

            checkAccessToken();

            Menu.init();

            //startApp();
            //FBHelper.init(Main.settings.fb_appid, startApp);

            FBHelper.init(Main.settings.fb_appid, function()
            {
                FBHelper.checkLoginStatus(Main.settings.fbPermissions, function(error, authResponse)
                {
                    if(error == null)
                    {
                        Main.settings.fbToken = authResponse.accessToken;
                        Main.settings.fbUid = authResponse.userID;
                        startApp();
                    }
                    else if(self.settings.fbToken)
                    {
                        FB.api('/me?access_token=' + self.settings.fbToken + '', function (response)
                        {
                            if(response.id)
                            {
                                self.settings.fbUid = response.id;
                                startApp();
                            }
                            else
                            {
                                startApp();
                            }
                        });
                    }
                    else
                    {
                        startApp();
                    }
                });
            });



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

                if(self.settings.isBirthValided)
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
        },

        loginFB: loginFB
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

    function checkAccessToken()
    {
        if(location.hash.match("access_token") && location.hash.match("state"))
        {
            self.settings.isBirthValided = true;

            var string = location.hash.replace("#", "?");

            if(string)
            {
                self.settings.fbToken = Helper.getParameterByName("access_token", string);

                var state = Helper.getParameterByName("state", string);
                window.location.hash = "#" + state;

                if(state == "/Story/Fingerprint")
                {
                    self.settings.startPhase = 6;
                }

                //removeFBParams();
            }
        }
    }

    function removeFBParams()
    {
        if(history && history.replaceState)
        {
            var hash = Main.settings.fbState;
            var uri = Helper.removeURLParameter(location.href, 'code');
            uri = Helper.removeURLParameter(uri, 'state');

            var currentHash = SceneHandler.getHash();

            uri = uri.replace('?#' + currentHash, '').replace('#' + currentHash, '');

            uri += "#" + hash;

            //console.log("final uri = " + uri);
            window.history.replaceState({path: uri}, '', uri);

            //history.go(-length);
            //window.location.replace(Utility.getPath() + "#" + Utility.urlParams.state);
        }
    }

    function loginFB(targetHash, cb, redirectUrl)
    {
        if(!targetHash) targetHash = "/Index";

        Loading.progress("登入 Facebook 中...請稍候").show();

        if(Main.settings.fbUid)
        {
            complete();
        }
        else
        {
            if(Main.settings.isiOS || Main.settings.isLineBrowser)
            //if(true)
            {
                //doRedirectLogin(); return;

                FB.getLoginStatus(function(response)
                {
                    if (response.status === 'connected')
                    {
                        //checkPermissions(response.authResponse, true);
                        complete(response.authResponse);
                    }
                    else
                    {
                        doRedirectLogin();
                    }
                });
            }
            else
            {
                FB.login(function(response)
                {
                    if(response.error)
                    {
                        alert("登入 Facebook 失敗");
                    }
                    else if(response.authResponse)
                    {
                        //checkPermissions(response.authResponse, false);

                        complete(response.authResponse);

                    }
                    else
                    {
                        //alert("您必須登入 Facebook 才能參加本活動");
                        Loading.hide();
                    }

                },
                {
                    scope: Main.settings.fbPermissions,
                    return_scopes: true,
                    auth_type: "rerequest"
                });
            }

        }

        function checkPermissions(authResponse, redirectToLogin)
        {
            FB.api('/me/permissions', function(response)
            {
                if (response && response.data && response.data.length)
                {

                    var i, obj, permObj = {};
                    for(i=0;i<response.data.length;i++)
                    {
                        obj = response.data[i];
                        permObj[obj.permission] = obj.status;
                    }

                    if (permObj.publish_actions != 'granted')
                    {
                        fail("您必須給予發佈權限才能製作分享影片");
                    }
                    else
                    {
                        complete(authResponse);
                    }
                }
                else
                {
                    alert("fail when checking permissions");
                    Loading.hide();
                }
            });

            function fail(message)
            {
                alert(message);
                Loading.hide();
                if(redirectToLogin) doRedirectLogin();
            }
        }

        function doRedirectLogin()
        {
            //var uri = redirectUrl? encodeURI(redirectUrl): encodeURI(Utility.getPath());
            var uri = redirectUrl? encodeURI(redirectUrl): encodeURI(Utility.getPathWithFilename());

            //console.log(uri); return;

            var url = "https://www.facebook.com/dialog/oauth?"+
                "response_type=token"+
                "&client_id="+Main.settings.fb_appid+
                "&scope="+Main.settings.fbPermissions.join(",")+
                "&state="+ targetHash +
                "&redirect_uri=" + uri;

            window.open(url, "_self");
        }


        function complete(authResponse)
        {
            if(authResponse)
            {
                Main.settings.fbToken = authResponse.accessToken;
                Main.settings.fbUid = authResponse.userID;
            }

            Loading.hide();
            if(cb) cb.apply();
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