/**
 * Created by sav on 2016/8/23.
 */
(function(){

    var $doms = {},
        _isOpen = false,
        _isHiding = true,
        _iconTl;

    var self = window.Menu =
    {
        init: function()
        {
            SoundSwitch.init();

            $doms.container = $("#menu");

            $doms.buttonContainer = $doms.container.find(".container");

            $doms.icon = $doms.container.find(".icon").on("mouseover", function()
            {
                if(_isOpen) return;
                _iconTl.tweenTo('hoverComplete');
            }).on("mouseout", function(event)
            {
                if(_isOpen) return;
                if($.contains($doms.icon[0], event.relatedTarget) === false && event.relatedTarget !== $doms.icon[0])
                {
                    _iconTl.tweenTo('start');
                }
            }).on("mousedown", function()
            {
                _isOpen? self.close(): self.open();
            });

            setupIconTL();

            setupButton(2, 'story', function()
            {
                SceneHandler.toHash("/Story");
            });

            setupButton(3, 'story rule', function()
            {
                SceneHandler.toHash("/StoryRule");
            });

            setupButton(6, 'participate to part2', function()
            {
                //Participate.toContent('part2');
                SceneHandler.toHash("/Participate/Product");
            });

            setupButton(7, 'participate to part3', function()
            {
                //Participate.toContent('part3');
                SceneHandler.toHash("/Participate/Form");
            });

            setupButton(8, 'participate rule', function()
            {
                SceneHandler.toHash("/ParticipateRule");
            });

            setupButton(10, 'Roulette', function()
            {
                SceneHandler.toHash("/Roulette");
            });

            setupButton(12, 'to offical site', function()
            {
                window.open('http://www.theglenlivet.com.tw/');
            });

            setupButton(13, 'to FB', function()
            {
                window.open('https://www.facebook.com/TheGlenlivetTW/');
            });

            //console.log("check");
            self.Logo = createHideAble($("#logo"), true);

            self.Logo.on(_CLICK_, function()
            {
                SceneHandler.toHash("/Intro");
            });

            //self.show();
            //self.open();
        },

        open: function()
        {
            if(_isOpen) return;
            _isOpen = true;

            _iconTl.tweenTo('end');

            $doms.buttonContainer.toggleClass("open-mode", true);
            $("#scene-container").toggleClass("menu-open-mode", true);
            $(".footer").toggleClass("menu-open-mode", true);

        },

        close: function()
        {
            if(!_isOpen) return;
            _isOpen = false;

            _iconTl.tweenTo('start');

            $doms.buttonContainer.toggleClass("open-mode", false);
            $("#scene-container").toggleClass("menu-open-mode", false);
            $(".footer").toggleClass("menu-open-mode", false);
        },

        show: function()
        {
            if(!_isHiding) return;
            _isHiding = false;

            $doms.icon.toggleClass("hide-mode", false);
        },

        hide: function()
        {
            if(_isHiding) return;
            _isHiding = true;

            $doms.icon.toggleClass("hide-mode", true);
            self.close();
        }
    };

    function setupButton(divIndex, name, onClick)
    {
        var $button = $doms.container.find(".item-" + divIndex);
        $button.on(_CLICK_, function()
        {
           self.close();
            if(onClick) onClick.call();
        });
    }

    function setupIconTL()
    {
        $doms.bar1 = $doms.icon.find(".bar-1");
        $doms.bar2 = $doms.icon.find(".bar-2");
        $doms.bar3 = $doms.icon.find(".bar-3");

        //var bars = [$doms.bar1[0], $doms.bar2[0], $doms.bar3[0]];

        var tl = _iconTl = new TimelineMax();
        tl.addLabel("start");

        tl.set($doms.bar1, {marginLeft: -6, marginTop: -9, width:12, autoAlpha:1, transformOrigin:"center center"});
        tl.set($doms.bar2, {marginLeft: -6, marginTop: -1, width:12, autoAlpha:1, transformOrigin:"center center"});
        tl.set($doms.bar3, {marginLeft: -6, marginTop: 7, width:12, autoAlpha:1, transformOrigin:"center center"});

        tl.to($doms.bar1,.3, {marginTop: -1, ease:Power1.easeIn}, 0);
        tl.to($doms.bar3,.3, {marginTop: -1, ease:Power1.easeIn}, 0);
        tl.set($doms.bar2, {autoAlpha: 0});
        tl.set($doms.bar1, {marginLeft:-1, width: 2, height: 2});
        tl.to($doms.bar1,.3, {marginTop:-6, height: 12, ease:Power1.easeOut});
        tl.addLabel("hoverComplete");
        tl.to($doms.bar1,.3, {rotation: 45});
        tl.to($doms.bar3,.3, {rotation: 45}, "-=.3");
        tl.addLabel("end");

        tl.pause();
    }

    function createHideAble($dom, isHiding)
    {
        if(isHiding === undefined) isHiding = true;

        $dom.toggleClass("hide-mode", isHiding);

        $dom._show = function()
        {
            if(!isHiding) return;
            isHiding = false;

            $dom.toggleClass("hide-mode", isHiding);
        };

        $dom._hide = function()
        {
            if(isHiding) return;
            isHiding = true;

            $dom.toggleClass("hide-mode", isHiding);
        };

        return $dom;
    }

}());



(function(){

    var _isHiding = true,
        _isSoundOn = true,
        $doms = {};

    var self = window.SoundSwitch =
    {
        $doms: null,

        init: function()
        {
            self.$doms = $doms;

            $doms.container = $("#sound-switch");

            $doms.btn = $doms.container.find(".btn-sound").on(_CLICK_, function()
            {
                self.setSoundOn(!_isSoundOn);
            });



            //console.log('soundOn = ' + Cookies.get("soundOn"));

            if(Cookies.get("soundOn") === undefined)
            {
                Cookies.set("soundOn", _isSoundOn, { expires: 7 });
            }

            _isSoundOn = (Cookies.get("soundOn") === 'true');

            //console.log(_isSoundOn);

            update();
        },

        getSoundOn: function(){ return _isSoundOn; },

        setSoundOn: function(b)
        {
            _isSoundOn = b;
            update();
        },

        show: function (cb)
        {
            if (!_isHiding) return;
            _isHiding = false;

            $doms.container.toggleClass("hide-mode", _isHiding);

        },
        hide: function (cb)
        {
            if (_isHiding) return;
            _isHiding = true;

            $doms.container.toggleClass("hide-mode", _isHiding);
        },

        update: update
    };

    function update()
    {
        Cookies.set("soundOn", _isSoundOn, { expires: 7 });
        //console.log("sound on = " + _isSoundOn);

        $doms.btn.toggleClass('off-mode', !_isSoundOn);

        if(window.SP)
        {
            TweenMax.to(window.SP,1, {volume: _isSoundOn? 1: 0});
            //window.SP.volume = _isSoundOn? 1: 0;
        }
    }


}());