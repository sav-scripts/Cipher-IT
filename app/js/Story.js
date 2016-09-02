(function ()
{
    var $doms = {},
        _isInit = false,
        _currentContent,
        _contentDic,
        _phaseDic =
        {
            0: "start",
            1: "phone unlocked, poster enabled",
            2: "poster unlocked, billboard enabled, backpacker dialog changed",
            3: "billboard unlocked, sport girl dialog changed",
            4: "bartender dialog changed",
            5: "fingerprint unlocked"
        };

    var self = window.Story =
    {
        _phaseIndex: 0,
        //getCurrentPhase: function(){ return _phaseList[self._phaseIndex]; },

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

                        if(Utility.urlParams.startPhase && _phaseDic[Utility.urlParams.startPhase])
                        {
                            self.setPhaseTo(parseInt(Utility.urlParams.startPhase));
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
        
        setPhaseTo: function(phaseIndex)
        {
            if(self._phaseIndex >= phaseIndex) return;

            var oldPhaseIndex;

            while(self._phaseIndex < phaseIndex)
            {
                oldPhaseIndex = self._phaseIndex;
                self._phaseIndex ++;
                update();
            }

            function update()
            {
                console.log("new index: " + self._phaseIndex);

                if(oldPhaseIndex == 0)
                {

                }

                if(self._phaseIndex == 0)
                {

                }
                else if(self._phaseIndex == 1)
                {
                    Story.ObjectManager.clearObject("/Phone");
                    Story.Evidences.unlockEvidence("/Phone");

                    Story.ObjectManager.setObjectEnabled("/Poster", true);
                }
                else if(self._phaseIndex == 2)
                {
                    Story.ObjectManager.clearObject("/Poster");
                    Story.Evidences.unlockEvidence("/Poster");

                    Story.ObjectManager.getObject("/Backpacker").contentClass = _contentDic["/Photos"];

                    Story.ObjectManager.setObjectEnabled("/Billboard", true);
                }
                else if(self._phaseIndex == 3)
                {
                    Story.ObjectManager.clearObject("/Billboard");
                    Story.Evidences.unlockEvidence("/Billboard");

                    Story.ObjectManager.setObjectDialog("/SportGirl", 1, 4);
                }
                else if(self._phaseIndex == 4)
                {
                    Story.ObjectManager.setObjectDialog("/Bartender", 1, 5, 1);
                }
                else if(self._phaseIndex == 5)
                {
                    Story.Evidences.unlockEvidence("/Fingerprint");
                }

            }
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

        _contentDic =
        {
            "/Evidences": self.Evidences.init($doms.container.find(".evidences")),
            "/Key": self.Key.init($doms.container.find(".key-popup")),
            "/Phone": self.Phone.init($doms.container.find(".phone-popup")),
            "/Poster": self.Poster.init($doms.container.find(".poster-popup")),
            "/Photos": self.Photos.init($doms.container.find(".photos-popup")),
            "/Billboard": self.Billboard.init($doms.container.find(".billboard-popup")),
            "/Fingerprint": self.Fingerprint.init($doms.container.find(".fingerprint-popup"))
        };

        self.DialogText.init($doms.container.find(".dialog"));
        self.DialogTrigger.init();

        $doms.buttons =
        {
            container: $doms.container.find(".buttons"),
            exit: $doms.container.find(".btn-exit"),
            help: $doms.container.find(".btn-help"),
            evidences: $doms.container.find(".btn-evidence").on(_CLICK_, function()
            {
                //self.Evidences.show();
                SceneHandler.toHash("/Story/Evidences");
            })
        };

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
        tl.to($doms.container, .4, {autoAlpha: 0});
        tl.add(function ()
        {
            Story.Scene.setActive(false);
            $doms.container.detach();
            cb.apply();
        });
    }

}());