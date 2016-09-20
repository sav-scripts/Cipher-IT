(function ()
{
    var $doms = {},
        _isInit = false,
        _currentContent,
        _contentDic,
        _isActive,
        _phaseIndex = 0,
        _spHidingActivated = false,
        _isBabylonSupported,
        _phaseDic =
        {
            0: {description: "start", type:"", helpObjectHash:"/Phone"},
            1: {description: "phone enabled", type:"", helpObjectHash:"/Phone"},
            2: {description: "poster enabled (phone puzzle complete)", type:"", helpObjectHash:"/Poster"},
            3: {description: "billboard enabled", type:"", helpObjectHash:"/Billboard"},
            4: {description: "sport girl key dialog enabled", type:"", helpObjectHash:"/SportGirlSP"},
            5: {description: "bartender key dialog enabled", type:"", helpObjectHash:"/Bartender"},
            6: {description: "fingerprint enabled", type:"", helpObjectHash:"/Bartender"},
            7: {description: "medal enabled, briefcase enabled (fingerprint puzzle complete)", type:"", helpObjectHash:"/Medal"}
        };

    window.StoryPhases =
    {
        START: 0,
        PHONE: 1,
        POSTER: 2,
        BILLBOARD: 3,
        SPORT_GIRL: 4,
        BARTENDER: 5,
        FINGERPRINT: 6,
        MEDAL_AND_BRIEFCASE: 7
    };

    var self = window.Story =
    {
        stageIn: function (options, cb)
        {
            (!_isInit) ? loadScripts(execute) : execute();
            function execute(isFromLoad)
            {
                if(!_isBabylonSupported)
                {
                    alert('您的瀏覽器不支援需要的 WebGL 功能');
                    Loading.hide();
                    cb.call();
                    SceneHandler.toHash('/Participate/Product');
                    return;
                }

                if (isFromLoad && options.cbContentLoaded) options.cbContentLoaded.call();
                show(function()
                {
                    if(options.contentHash)
                    {
                        self.toContent(options.contentHash, cb);
                    }
                    else
                    {
                        cb.call();
                    }


                });
            }

            function loadScripts(cb)
            {
                Loading.progress(0).show();


                var startWeight = .0, weight = .3;
                var scripts =
                    [
                        'js/lib/babylon.2.4.js',
                        'js/lib/createjs-2015.11.26.min.js',
                        //'js/lib/soundjs-0.6.2.min.js',
                        'js/lib/SoundjsExtend.js'
                    ];

                var total = scripts.length,
                    count = 0,
                    i, chain = $LAB;

                for(i=0;i<scripts.length;i++)
                {
                    chain = chain.script(scripts[i]).wait(scriptLoaded);
                }

                function scriptLoaded()
                {
                    count ++;

                    Loading.progress(startWeight + weight*count/total);

                    if(count == total)
                    {
                        _isBabylonSupported = BABYLON.Engine.isSupported();
                        //_isBabylonSupported = false;

                        if(!_isBabylonSupported)
                        {
                            cb.call();
                        }
                        else
                        {
                            setupSounds(function()
                            {
                                loadAndBuild(cb);
                            });
                        }
                    }
                }
            }

            function setupSounds(cb)
            {
                var startWeight = .3, weight = .1;

                if(!window.SP) createjs.Sound.init(Main.soundSettings);

                SP.load(
                    [
                        {id:"game-bgm", src:"game_bg.mp3?v=2", defaultPlayProps:{loop: -1, volume: 1}},
                        {id:"zoom", src:"zoom.mp3"},
                        {id:"click", src:"click.mp3"},
                        {id:"click_2", src:"click_2.mp3"},
                        {id:"click_3", src:"click_3.mp3"},
                        {id:"bingo", src:"bingo.mp3"},
                        {id:"stageClear", src:"stage_clear.mp3"}
                    ],
                    function(count, total)
                    {
                        Loading.progress(startWeight + weight*count/total);
                    },
                    function()
                    {
                        SoundSwitch.update();
                        if(cb) cb.call();
                    });
            }

            function loadAndBuild(cb)
            {
                var templates =
                [
                    {url: "_story.html", startWeight: 40, weight: 30, dom: null}
                ];

                SceneHandler.loadTemplate(null, templates, function loadComplete()
                {
                    build(templates);


                    var useSmallTextures = (Main.settings.viewport.index == 0);
                    //var useSmallTextures = true;

                    Story.Scene.init($doms.sceneCanvas[0], useSmallTextures, function(progress)
                    {
                        //console.log(progress);
                        Loading.progress(.7 + progress *.3);
                    }, function()
                    {
                        _isInit = true;

                        Loading.hide();

                        HappyEnd.preload();

                        if(Main.settings.startPhase && _phaseDic[Main.settings.startPhase])
                        {

                            var index = parseInt(Main.settings.startPhase);
                            for(var key in StoryPhases)
                            {
                                if(StoryPhases[key] == index)
                                {
                                    self.setPhaseTo(index, true);
                                    break;
                                }
                            }
                            //self.setPhaseTo(), true);
                        }

                        $doms.container.detach();
                        cb.call();
                    });

                }, true);
            }
        },

        stageOut: function (options, cb)
        {
            if(_currentContent)
            {
                _currentContent.hide(function()
                {
                    _currentContent = null;
                    hide(cb);
                });
            }
            else
            {
                hide(cb);
            }
        },

        executeAfterPopupClosed: function()
        {
            Menu.show();
        },

        activeSpHiding: function()
        {
            _spHidingActivated = true;
        },

        toContent: function(contentHash, cb)
        {
            var nextContent = _contentDic[contentHash],
                dialogContentObj;

            if(!nextContent)
            {
                dialogContentObj = Story.DialogTrigger.searchForContent(contentHash);
                if(dialogContentObj)
                {
                    nextContent = (dialogContentObj.contentClass)? dialogContentObj.contentClass: Story.DialogTrigger;
                    //nextContent = Story.DialogTrigger;
                }
            }

            if(nextContent && nextContent.needHideUI)
            {
                Menu.hide();
                $doms.buttons.container.toggleClass("hide-mode", true);
            }
            else
            {
                //Menu.show();
                //$doms.buttons.container.toggleClass("hide-mode", false);
            }

            if(_currentContent)
            {
                _currentContent.hide(nextContentShow);
            }
            else
            {
                nextContentShow();
            }

            function nextContentShow()
            {
                _currentContent = nextContent;

                if(_currentContent == Story.DialogTrigger) Story.DialogTrigger.setContent(dialogContentObj);

                if(!_currentContent)
                {
                    Story.Scene.setUserControlEnabled(true);
                    complete();
                }
                else
                {
                    Story.Scene.setUserControlEnabled(false);
                    _currentContent.show(complete);
                }
            }

            function complete()
            {
                if(!(nextContent && nextContent.needHideUI))
                {
                    Menu.show();
                    $doms.buttons.container.toggleClass("hide-mode", false);
                }
                cb.call();
            }
        },

        setPhaseTo: function(phaseIndex, isHardSet)
        {
            if(_phaseIndex >= phaseIndex) return;

            var oldPhaseIndex;

            while(_phaseIndex < phaseIndex)
            {
                oldPhaseIndex = _phaseIndex;
                _phaseIndex ++;
                update();
            }

            return true;

            function update()
            {
                console.log("story progress to "+_phaseIndex +" => " + _phaseDic[_phaseIndex].description);

                if(_phaseIndex == 0)
                {

                }
                else if(_phaseIndex == 1)
                {
                    Story.Evidences.unlockEvidence("/Phone");
                }
                else if(_phaseIndex == 2)
                {
                    Story.Phone.toCompleteMode();
                    Story.ObjectManager.disableFlash("/Phone");

                    Story.ObjectManager.setObjectDialog("/TattooMan", 1);
                    Story.ObjectManager.setDialogToNew("/TattooMan");

                    Story.ObjectManager.setObjectEnabled("/Poster", true);
                }
                else if(_phaseIndex == 3)
                {
                    Story.Evidences.unlockEvidence("/Poster");

                    Story.ObjectManager.disableFlash("/Poster");

                    Story.ObjectManager.getObject("/Backpacker").contentClass = _contentDic["/Photos"];
                    Story.ObjectManager.setDialogToNew("/Backpacker");

                    Story.ObjectManager.setObjectEnabled("/Billboard", true);
                }
                else if(_phaseIndex == 4)
                {
                    Story.Evidences.unlockEvidence("/Billboard");
                    Story.ObjectManager.disableFlash("/Billboard");

                    Story.ObjectManager.setObjectEnabled("/SportGirlSP", true);

                    Story.ObjectManager.setObjectDialog("/SportGirl", 1, StoryPhases.BARTENDER);
                    Story.ObjectManager.setDialogToNew("/SportGirl");
                }
                else if(_phaseIndex == 5)
                {
                    Story.ObjectManager.disableFlash("/SportGirlSP");

                    Story.ObjectManager.changeNpcAction("/Bartender", 1, 0);
                    Story.ObjectManager.setObjectDialog("/Bartender", 1, StoryPhases.FINGERPRINT, null, "/Story/Fingerprint", null);
                    Story.ObjectManager.setDialogToNew("/Bartender");
                }
                else if(_phaseIndex == 6)
                {
                    Story.Evidences.unlockEvidence("/Fingerprint");
                }
                else if(_phaseIndex == 7)
                {
                    if(isHardSet) Story.Fingerprint.toCompleteMode();

                    Story.ObjectManager.setObjectDialog("/Businessman", 1);
                    Story.ObjectManager.setDialogToNew("/Businessman");

                    Story.ObjectManager.setObjectEnabled("/Medal", true);
                    Story.ObjectManager.setObjectEnabled("/Briefcase", true);
                }

            }
        },

        changePhaseHelpHash: function(phaseIndex, newHelpHash)
        {
            var phaseObj = _phaseDic[phaseIndex];
            phaseObj.helpObjectHash = newHelpHash;
        },

        triggerHelp: function()
        {
            var phaseData = _phaseDic[_phaseIndex],
                hash = phaseData.helpObjectHash,
                obj = Story.ObjectManager.getObject(hash),
                position = obj.editorObject._mesh.position.clone();

            if(obj.y) position.y += obj.y;

            Story.Scene.customCamera.lookAt(position, function()
            {
                Story.ObjectManager.showPointFingerAt(hash);
            });
        },

        changeFullScreen: function()
        {
            var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;
            if(!fullscreenElement)
            {
                requestFullScreen();
            }
            else
            {
                exitFullScreen();
            }
        },

        enableDragHint: function()
        {
            $doms.dragHint.toggleClass("hide-mode", false);
            Story.Scene.customCamera.listenDrag(this.disableDragHint);
        },

        disableDragHint: function()
        {
            $doms.dragHint.toggleClass("hide-mode", true);

            TweenMax.delayedCall(1, function()
            {
                $doms.dragHint.detach();
            });
        },

        resize: function ()
        {
            if(_isInit)
            {
                Story.Scene.engine.resize();
                self.Evidences.resize();
                self.Fingerprint.resize();

                if(_isActive)
                {
                    var vp = Main.settings.viewport;

                    if(vp.index == 0)
                    {
                        $doms.rotateScreenHint.toggleClass('hide-mode', !(vp.width > vp.height));
                    }
                }
            }
        }
    };


    function build(templates)
    {
        $("#invisible-container").append(templates[0].dom);
        $doms.container = $("#story");


        $doms.rotateScreenHint = $("#rotate-screen-hint");

        $doms.buttons =
        {
            container: $doms.container.find(".buttons"),
            exit: $doms.container.find(".btn-exit").on(_CLICK_, function()
            {
                SP.play('click_2');
                SceneHandler.toHash("/Story/ExitConfirm");
            }),

            fullscreen: $doms.container.find(".btn-fullscreen").on(_CLICK_, function()
            {
                SP.play('click_2');
                self.changeFullScreen();
            }),

            soundSwitch: $doms.container.find(".btn-sound").on(_CLICK_, function()
            {
                SP.play('click_2');
                SoundSwitch.setSoundOn(!SoundSwitch.getSoundOn());
                $doms.buttons.soundSwitch.toggleClass("off-mode", !SoundSwitch.getSoundOn());
            }),

            help: $doms.container.find(".btn-help").on(_CLICK_, function()
            {
                SP.play('click_2');
                //$doms.buttons.help.toggleClass('flash-mode', false);
                self.triggerHelp();
            }),

            evidences: $doms.container.find(".btn-evidence").on(_CLICK_, function()
            {
                SP.play('click_2');
                SceneHandler.toHash("/Story/Evidences");

            })
        };

        _contentDic =
        {
            "/Evidences": self.Evidences.init($doms.container.find(".evidences"), $doms.buttons.evidences),
            "/Key": self.Key.init($doms.container.find(".key-popup")),
            "/Phone": self.Phone.init($doms.container.find(".phone-popup")),
            "/Poster": self.Poster.init($doms.container.find(".poster-popup")),
            "/Photos": self.Photos.init($doms.container.find(".photos-popup")),
            "/Billboard": self.Billboard.init($doms.container.find(".billboard-popup")),
            "/Fingerprint": self.Fingerprint.init($doms.container.find(".fingerprint-popup")),
            "/Medal": self.Medal.init($doms.container.find(".medal-popup")),
            "/Briefcase": self.Briefcase.init($doms.container.find(".briefcase-popup")),
            "/ExitConfirm": self.ExitConfirm.init($doms.container.find(".exit-confirm-popup"))
        };

        self.DialogText.init($doms.container.find(".dialog"));
        self.DialogTrigger.init();

        $doms.dragHint = $doms.container.find(".drag-hint").toggleClass("hide-mode", true);

        $doms.sceneCanvas = $doms.container.find(".scene-canvas");
    }

    function show(cb)
    {
        $("#scene-container").append($doms.container);


        _isActive = true;

        self.resize();

        if(Story.Scene.enablePostEffect) PostProcessLib.getEffect("scene").raidalMotionTo(0, 0);

        Menu.show();
        Menu.Logo._show();

        $doms.buttons.soundSwitch.toggleClass("off-mode", !SoundSwitch.getSoundOn());

        SP.playTrack('game-bgm');

        $doms.buttons.container.toggleClass("hide-mode", false);

        Story.Scene.setActive(true);

        var tl = new TimelineMax;
        tl.set($doms.container, {autoAlpha: 0});
        tl.to($doms.container, 1.0, {autoAlpha: 1, ease:Power3.easeIn});
        tl.add(function ()
        {
            Story.Scene.setUserControlEnabled(true);
            cb.apply();
        });
    }

    function hide(cb)
    {
        if(!_isInit)
        {
            cb.call();
            return;
        }

        Menu.Logo._hide();
        Menu.hide();

        SP.stopTrack('game-bgm');

        Story.Scene.setUserControlEnabled(false);

        var tl = new TimelineMax;
        
        if(_spHidingActivated)
        //if(true)
        {
            _spHidingActivated = false;

            var d;

            if(Story.Scene.enablePostEffect)
            {
                d = 1.2;
                PostProcessLib.getEffect("scene").raidalMotionTo(1, d, Power1.easeIn);
            }
            else
            {
                d = .4;
            }

            tl.add(Main.showWhiteCover, d - .4);
            //tl.to($doms.container,.4, {autoAlpha: 0, ease:Power3.easeOut}, 1);
            tl.add(complete, d);
        }
        else
        {
            tl.to($doms.container, 1, {autoAlpha: 0, ease:Power3.easeOut});
            tl.add(complete);
        }

        function complete()
        {
            Story.Scene.setActive(false);
            $doms.container.detach();
            _isActive = false;
            $doms.rotateScreenHint.toggleClass("hide-mode", true);
            cb.apply();
        }
    }

    function requestFullScreen()
    {
        //var element = document.body;
        var element = document.getElementById("scene-container");

        var func = element.requestFullscreen ||
            element.mozRequestFullScreen ||
            element.webkitRequestFullscreen ||
            element.msRequestFullscreen || null;


        if(func) func.call(document.body);
    }

    function exitFullScreen()
    {
        var func = document.exitFullscreen ||
            document.mozCancelFullScreen ||
            document.webkitExitFullscreen ||
            document.msCancelFullScreen || null;

        if(func) func.call(document);
    }

}());