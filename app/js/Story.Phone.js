/**
 * Created by sav on 2016/9/1.
 */


(function ()
{
    var $doms = {},
        _isHiding = true,
        _isLocking = false,
        _isDetecting = false,
        _isDetectComplete = false,
        _matchCount = 0,
        _myPhase = 0,
        _btnCloseClicked = false,
        _tlPlayHint,
        _tlPlayHintTimer,
        _quezNumberDic =
        {
            3: true,
            2: true,
            1: true,
            4: true,
            7: true,
            8: true,
            9: true
        },
        _dialogTexts =
        [
            '<span>Bingo！啊..有隻手機！解鎖瞧瞧是否有更多線索，密碼可能跟</span><span class="green">英文字母Ｃ的形狀</span><span>有些關聯</span>',
            '<span>嗯...</span><span class="green">Honey</span><span>！</span><br/><span>　看來我知道下個該找的線索了</span>'
        ];

    var self = window.Story.Phone=
    {
        needHideUI: true,

        init: function ($container)
        {
            $doms.container = $container;
            $doms.parent = $container.parent();

            $doms.content = $doms.container.find(".content");

            $doms.btnClose = $doms.container.find(".btn-close").on(_CLICK_, function()
            {
                if(_isLocking)
                {
                    _btnCloseClicked = true;
                }
                else
                {
                    SceneHandler.toHash("/Story");
                }
            });

            $doms.cLetter = $doms.container.find(".c-letter").css("visibility", "hidden");

            var tl = _tlPlayHint = new TimelineMax;
            tl.set($doms.cLetter, {autoAlpha:0});
            tl.to($doms.cLetter, 1.5, {autoAlpha:1, ease:Power1.easeInOut});
            tl.to($doms.cLetter, 1.5, {autoAlpha:0, ease:Power1.easeInOut});
            tl.pause();

            tl = _tlPlayHintTimer = new TimelineMax;
            tl.add(function()
            {
                _tlPlayHint.restart();
            }, 15);
            tl.pause();

            setupQuez();

            setupBingo();

            $doms.container.detach();

            return self;
        },
        show: function (cb)
        {
            if (!_isHiding) return;
            _isHiding = false;

            _btnCloseClicked = false;
            _isLocking = false;

            //Story.ObjectManager.clearObject("/Phone");
            Story.Evidences.unlockEvidence("/Phone");

            $doms.parent.append($doms.container);

            $doms.btnClose.toggleClass("showing-mode", true);

            ScalableContent.updateResizeAble();

            Story.DialogText.show(_dialogTexts[_myPhase], null, cb);

            var tl = new TimelineMax;
            tl.set([$doms.container, $doms.content], {autoAlpha: 0});
            tl.to($doms.container, .4, {autoAlpha: 1});
            tl.to($doms.content, 1, {autoAlpha: 1, ease:Linear.easeNone}, 0);
            tl.add(function ()
            {
                if(!_isDetectComplete) startDetect();
            },.6);

        },
        hide: function (cb)
        {
            if (_isHiding) return;
            _isHiding = true;

            stopDetect();

            $doms.btnClose.toggleClass("showing-mode", false);

            Story.DialogText.hide();

            var tl = new TimelineMax;
            tl.to($doms.container, .4, {autoAlpha: 0});
            tl.add(function ()
            {
                $doms.container.detach();
                if (cb) cb.apply();
            });
        },

        toCompleteMode: function()
        {
            if(_isDetectComplete) return;

            _myPhase = 1;
            _isDetectComplete = true;
            $doms.bingo._toCompleteMode();
        }

    };

    function setupBingo()
    {
        $doms.bingo = $doms.container.find(".bingo").detach();
        
        var $icon = $doms.bingo.find(".icon"),
            $honey = $doms.container.find(".honey").detach();

        $doms.bingo._play = function()
        {
            $doms.content.append($doms.bingo);
            var tl = new TimelineMax();
            tl.set($doms.bingo, {autoAlpha: 1});
            tl.set($honey, {autoAlpha: 0});
            tl.set($icon, {autoAlpha:0},.1);
            tl.set($icon, {autoAlpha:1},.2);
            tl.set($icon, {autoAlpha:0},.3);
            tl.set($icon, {autoAlpha:1},.4);

            tl.to($doms.bingo,.6, {autoAlpha: 0, ease:Power2.easeIn}, "+=1.4");

            tl.to($doms.quez,.6, {autoAlpha: 0, ease:Power2.easeIn}, "-=.6");

            tl.add(function()
            {
                $doms.quez.detach();
                $doms.bingo.detach();

                $doms.content.append($honey);
            });

            tl.to($honey,.7, {autoAlpha:1, ease:Power2.easeIn});

            tl.add(function()
            {
                _isLocking = true;

                Story.DialogText.hide("fadeOut", function()
                {
                    Story.DialogText.show(_dialogTexts[_myPhase], null, function()
                    {
                        _isLocking = false;
                        if(_btnCloseClicked)
                        {
                            _btnCloseClicked = false;
                            SceneHandler.toHash("/Story");
                        }
                    });
                });

            }, "-=.6");
        };

        $doms.bingo._toCompleteMode = function()
        {
            $doms.quez.detach();
            $doms.bingo.detach();

            $doms.content.append($honey);
        }
    }

    function setupQuez()
    {
        var $quez = $doms.quez = $doms.container.find(".quez-container");

        var i;
        $doms.numberContainer = $quez.find(".numbers");
        $doms.numbers = {};
        for(i=0;i<10;i++)
        {
            setupOneNumber(i);
        }

        $doms.nodeContainer = $quez.find(".nodes");
        $doms.nodes = {};
        for(i=1;i<=7;i++)
        {
            setupOneNode(i);
        }

        function setupOneNumber(index)
        {
            var $dom = $doms.numbers[index] = $doms.numberContainer.find(".number-" + index);

            $dom.toggleClass("hide-mode", true);

            $dom[0].__index = index;
            $dom.find(".hover-state")[0].__index = index;
        }

        function setupOneNode(index)
        {
            var $dom = $doms.nodes[index] = $doms.nodeContainer.find(".node:nth-child(" + index + ")");

            $dom.toggleClass("hide-mode", true);
        }
    }

    function startDetect()
    {
        if(_isDetecting) return;
        _isDetecting = true;

        _tlPlayHintTimer.restart();
        $doms.container.on("pointerdown", detectDrag);
    }

    function detectDrag(event)
    {
        event.preventDefault();
        event.stopPropagation();

        $(window).on("pointerup", onrelease);


        //var $numbers = $doms.numberContainer.children();
        //
        //$numbers.each(function(index ,dom)
        //{
        //    dom.__triggered = false;
        //});

        if($.contains($doms.numberContainer[0], event.target))
        {

            var $num = $doms.numbers[event.target.__index];
            checkCount.call($num[0]);
        }


        //$numbers.on("pointerenter", onpointerenter);
        //
        //function onpointerenter()
        //{
        //    checkCount.call(this);
        //}


        function onrelease()
        {
            //$numbers.unbind("pointerenter", onpointerenter);
            $(window).unbind("pointerup", onrelease);

            if(!_isDetectComplete)
            {
                //updateMatchCount(0);
                //
                //$numbers.each(function(index ,dom)
                //{
                //    dom.__triggered = false;
                //    $(dom).toggleClass('hide-mode', true);
                //});
            }
        }

        function checkCount()
        {
            //_tlPlayHintTimer.restart();

            this.__triggered = !this.__triggered;

            if(_quezNumberDic[this.__index])
            {
                (this.__triggered)? _matchCount++: _matchCount--;
            }
            else
            {
                (this.__triggered)? _matchCount--: _matchCount++;
            }

            $(this).toggleClass("hide-mode", !this.__triggered);

            updateMatchCount(_matchCount);

            if(_matchCount >= 7)
            {
                Story.setPhaseTo(StoryPhases.POSTER);
                _myPhase = 1;
                $doms.bingo._play();
                _isDetectComplete = true;
                stopDetect();
                onrelease();
            }
        }
    }

    function updateMatchCount(count)
    {
        if(count < 0) count = 0;

        var i, $node;
        for(i=1;i<=7;i++)
        {
            $node = $doms.nodes[i];
            $node.toggleClass("hide-mode", !(i <= count));
        }

    }

    function stopDetect()
    {
        if(!_isDetecting) return;
        _isDetecting = false;

        _tlPlayHintTimer.pause();
        $doms.container.unbind("pointerdown", detectDrag);

    }

}());