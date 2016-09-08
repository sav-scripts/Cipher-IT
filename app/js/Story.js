(function ()
{
    var $doms = {},
        _isInit = false,
        _currentContent,
        _contentDic,
        _phaseIndex = 0,
        _phaseDic =
        {
            0: {description: "start", type:"", helpObjectHash:"/Phone"},
            1: {description: "phone enabled", type:"", helpObjectHash:"/Phone"},
            2: {description: "poster enabled (phone puzzle complete)", type:"", helpObjectHash:"/Poster"},
            3: {description: "billboard enabled", type:"", helpObjectHash:"/Billboard"},
            4: {description: "sport girl key dialog enabled", type:"", helpObjectHash:"/SportGirl"},
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
            (!_isInit) ? loadAndBuild(execute) : execute();
            function execute(isFromLoad)
            {
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

            function loadAndBuild(cb)
            {
                var templates =
                    [
                        {url: "_story.html", startWeight: 0, weight: 100, dom: null}
                    ];

                SceneHandler.loadTemplate(null, templates, function loadComplete()
                {
                    build(templates);

                    Story.Scene.init($doms.sceneCanvas[0], function()
                    {
                        _isInit = true;

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
                Menu.show();
                $doms.buttons.container.toggleClass("hide-mode", false);
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
                    cb.call();
                }
                else
                {
                    Story.Scene.setUserControlEnabled(false);
                    _currentContent.show(cb);
                }
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

                    Story.ObjectManager.setObjectDialog("/SportGirl", 1, StoryPhases.BARTENDER);
                    Story.ObjectManager.setDialogToNew("/SportGirl");
                }
                else if(_phaseIndex == 5)
                {
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

            Story.Scene.customCamera.lookAt(position, function()
            {
                Story.ObjectManager.showPointFingerAt(hash);
            });
        },

        resize: function ()
        {
            if(_isInit)
            {
                Story.Scene.engine.resize();
                self.Evidences.resize();
            }
        }
    };


    function build(templates)
    {
        $("#invisible-container").append(templates[0].dom);
        $doms.container = $("#story");


        $doms.buttons =
        {
            container: $doms.container.find(".buttons"),
            exit: $doms.container.find(".btn-exit").on(_CLICK_, function()
            {
                SceneHandler.toHash("/HappyEnd");
            }),
            help: $doms.container.find(".btn-help").on(_CLICK_, function()
            {
                self.triggerHelp();
            }),
            evidences: $doms.container.find(".btn-evidence").on(_CLICK_, function()
            {
                //self.Evidences.show();
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
            "/Briefcase": self.Briefcase.init($doms.container.find(".briefcase-popup"))
        };

        self.DialogText.init($doms.container.find(".dialog"));
        self.DialogTrigger.init();

        $doms.sceneCanvas = $doms.container.find(".scene-canvas");
    }

    function show(cb)
    {
        $("#scene-container").append($doms.container);

        self.resize();

        Menu.show();
        Menu.Logo._show();

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
        Menu.Logo._hide();
        Menu.hide();

        Story.Scene.setUserControlEnabled(false);
        
        

        var tl = new TimelineMax;
        tl.to($doms.container, 1, {autoAlpha: 0, ease:Power3.easeOut});
        tl.add(function ()
        {
            Story.Scene.setActive(false);
            $doms.container.detach();
            cb.apply();
        });
    }

}());