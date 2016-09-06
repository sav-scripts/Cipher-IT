/**
 * Created by sav on 2016/9/1.
 */


(function ()
{
    var $doms = {},
        _isHiding = true,
        _password = "1824",
        _isCompleted = false,
        _isLocking = false,
        _dialogText = '<span>(公事包提示文字?)</span>';

    var self = window.Story.Briefcase =
    {
        needHideUI: true,

        init: function ($container)
        {
            $doms.container = $container;
            $doms.parent = $container.parent();

            $doms.content = $doms.container.find(".content");

            $doms.btnClose = $doms.container.find(".btn-close").on(_CLICK_, function()
            {
                SceneHandler.toHash("/Story");
            });

            setupPasswordPad();
            setupBtnUnlock();

            $doms.container.detach();

            return self;
        },
        show: function (cb)
        {
            if (!_isHiding) return;
            _isHiding = false;

            //Story.setPhaseTo(3);
            //Story.ObjectManager.clearObject("/Briefcase");
            Story.Evidences.unlockEvidence("/Briefcase");

            $doms.parent.append($doms.container);

            $doms.btnClose.toggleClass("showing-mode", true);

            ScalableContent.updateResizeAble();

            Story.DialogText.show(_dialogText, null, cb);

            var tl = new TimelineMax;
            tl.set([$doms.container, $doms.content], {autoAlpha: 0});
            tl.to($doms.container, .4, {autoAlpha: 1});
            tl.to($doms.content, 1, {autoAlpha: 1, ease:Linear.easeNone}, 0);
            //tl.add(function ()
            //{
            //    if (cb) cb.apply();
            //});

        },
        hide: function (cb)
        {
            if (_isHiding) return;
            _isHiding = true;

            $doms.btnClose.toggleClass("showing-mode", false);

            Story.DialogText.hide();

            var tl = new TimelineMax;
            tl.to($doms.container, .4, {autoAlpha: 0});
            tl.add(function ()
            {
                $doms.container.detach();
                if (cb) cb.apply();
            });
        }

    };

    function setupBtnUnlock()
    {
        $doms.btnUnlock = $doms.container.find(".btn-unlock");

        var $btnState = $doms.btnUnlock.find(".btn-state"),
            $errorState = $doms.btnUnlock.find(".error-state"),
            $correctState = $doms.btnUnlock.find(".correct-state");

        $doms.btnUnlock.on(_CLICK_, function()
        {

            if(_isLocking) return;

            if(_isCompleted)
            {
                SceneHandler.toHash("/HappyEnd");
                return;
            }

            var inputPassword = getNumbers();

            (inputPassword === _password)?  playCorrect(): playError();

        });

        function playError()
        {
            _isLocking = true;
            var tl = new TimelineMax, t = 0;

            tl.set($errorState, {autoAlpha: 1}, t);
            tl.set($btnState, {autoAlpha: 0}, t);
            t += .15;

            tl.set($errorState, {autoAlpha: 0}, t);
            t += .15;

            tl.set($errorState, {autoAlpha: 1}, t);
            t += 1;


            tl.set($errorState, {autoAlpha: 0}, t);
            tl.set($btnState, {autoAlpha: 1}, t);

            tl.add(function()
            {
                _isLocking = false;
            });

        }

        function playCorrect()
        {
            _isCompleted = true;

            _isLocking = true;
            var tl = new TimelineMax, t = 0;

            tl.set($correctState, {autoAlpha: 1}, t);
            tl.set($btnState, {autoAlpha: 0}, t);
            t += .1;

            tl.set($correctState, {autoAlpha: 0}, t);
            t += .1;

            tl.set($correctState, {autoAlpha: 1}, t);
            t += .1;

            tl.set($correctState, {autoAlpha: 0}, t);
            t += .1;

            tl.set($correctState, {autoAlpha: 1}, t);

            tl.add(function()
            {
                _isLocking = false;
                SceneHandler.toHash("/HappyEnd");

            }, "+=2");
        }

    }

    function getNumbers()
    {
        var string = "";
        for(var i=0;i<$doms.slots.length;i++)
        {
            string += $doms.slots[i]._getNumber();
        }

        return string;
    }

    function setupPasswordPad()
    {
        $doms.slots = [];

        setupSlot(1);
        setupSlot(2);
        setupSlot(3);
        setupSlot(4);

        function setupSlot(index)
        {
            var $slot = $doms.container.find(".slot-" + index),
                $numberClip = $slot.find(".number-clip");

            $doms.container.find(".arrow-up-" + index).on(_CLICK_, toPrevNum);
            $doms.container.find(".arrow-down-" + index).on(_CLICK_, toNextNum);

            $doms.slots.push($slot);

            var gapY = 14.2857,
                tweenObj = {y: 0};

            $slot._number = 1;

            toNumber(0);

            $slot._getNumber = function()
            {
                var n = $slot._number;
                n %= 10;
                if(n<0) n += 10;

                return String(n);
            };


            function toPrevNum()
            {
                if(_isLocking || _isCompleted) return;
                var num = $slot._number - 1;
                //if(num < 0) num = 9;
                toNumber(num);
            }

            function toNextNum()
            {
                if(_isLocking || _isCompleted) return;
                var num = $slot._number + 1;
                //if(num < 0) num = 9;
                toNumber(num);
            }

            function toNumber(num, duration, cb)
            {
                if($slot._number == num) return;
                $slot._number = num;

                if(duration === undefined || duration === null) duration = .5;

                var targetY = gapY * (num -1);

                TweenMax.to(tweenObj,duration, {y: targetY, onUpdate: updatePosition, onComplete: cb});
            }

            function updatePosition()
            {
                var targetY = tweenObj.y;
                TweenMax.set($numberClip, {backgroundPosition: "0 " + targetY +"%"});
            }
        }
    }

}());