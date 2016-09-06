/**
 * Created by sav on 2016/9/1.
 */


(function ()
{
    var $doms = {},
        _isInit = false,
        _isHiding = true,
        _hidingTL = null,
        _letterArray = null;

    var self = window.Story.DialogText =
    {
        init: function ($container)
        {
            $doms.container = $container;
            $doms.parent = $container.parent();

            $doms.textContainer = $doms.container.find(".text-container");

            $doms.cover = $doms.container.find(".cover");
            TweenMax.set($doms.cover, {autoAlpha: 0});

            //self.playTextAnimation(_testText);

            $doms.container.detach();

            _isInit = true;
        },

        playDialogs: function(textOrArray, animeType, cb)
        {
            var array;

            if(typeof textOrArray == 'string')
            {
                self.show(textOrArray, animeType, cb);
            }
            else
            {
                array = textOrArray.concat([]);
                playText();
            }

            function playText()
            {
                var text = array.shift();

                self.show(text, animeType, function()
                {
                    if(array.length)
                    {
                        TweenMax.delayedCall(2, function()
                        {
                            self.hide(null);
                            playText();
                        });
                    }
                    else
                    {
                        cb.call();
                    }
                });
            }
        },

        show: function(text, animeType, cb)
        {
            if (!_isHiding) return;
            _isHiding = false;

            if(_hidingTL)
            {
                _hidingTL.kill();
                _hidingTL = null;
            }

            $doms.parent.append($doms.container);

            $doms.textContainer.empty().html(text);

            var $letters = $doms.textContainer.children("span").lettering();

            var array = [];

            $letters.each(function(index, dom)
            {
                array = array.concat($(dom).children('span').toArray());
            });

            array = Utility.shuffleArray(array);

            var heldDuration = array.length / 10 * 1.1;

            if(heldDuration < 2) heldDuration = 2;
            if(heldDuration > 3.5) heldDuration = 3.5;

            var tl = new TimelineMax();
            //var tl = new TimelineMax({repeat:-1});

            //tl.set(array, {transformOrigin: "0% 50% -40", perspective: 300, scale: 3, alpha:0, y: -50, rotationX: 180, rotationY: 90, x: 0});
            //tl.staggerTo(array, 1.3, {rotationX: 0, rotationY: 0, alpha:1, y: 0, scale:1, ease:Back.easeOut},.015, 0);

            if(animeType == 'shake')
            {
                var i, dx = 10, duration = .1;
                tl.set(array, {transformOrigin: "center center", perspective: 300, scale: 1, alpha:1, x: 0, y: 0, rotationX: 0, rotationY: 0});

                for(i=0;i<7;i++)
                {
                    tl.to(array, duration, {x:dx});
                    dx *= -.9;
                    duration *= .9;
                }
                tl.to(array, duration, {x:0});
            }
            else
            {
                tl.set(array, {transformOrigin: "center center", perspective: 300, scale: 1, alpha:0, x: 0, y: 0, rotationX: 0, rotationY: 0});
                tl.staggerTo(array, 1.3, {rotationX: 0, rotationY: 0, alpha:1, x:0, y: 0, scale:1, ease:Linear.easeNone},.03, 0);
            }
            tl.to($doms.cover,tl.duration() -.2, {autoAlpha: 1, ease:Linear.easeNone}, 0);


            if(cb) tl.add(cb);

            _letterArray = array;

            return heldDuration;
        },

        hide: function (animeType, cb)
        {
            if (_isHiding) return;
            _isHiding = true;

            if(_letterArray)
            {
                hideLetters(animeType, cb);
            }
            else
            {
                if(cb) cb.call();
            }
        },

        resize: function()
        {

        }
    };

    function hideLetters(animeType, cb)
    {
        var tl2 = _hidingTL = new TimelineMax();

        tl2.to($doms.cover,.8, {autoAlpha: 0, ease:Power2.easeOut});

        if(animeType == 'fadeOut')
        {
            tl2.staggerTo(_letterArray,.5, {alpha: 0, ease:Power2.easeOut},.01, 0);
        }
        else
        {
            tl2.to(_letterArray, 2, {alpha: 0, x:r1, y: r1, scale:r2, transformOrigin:"center center 0", rotationX: r3, rotationY: r3, ease:Power2.easeOut}, 0);
        }


        tl2.add(function()
        {
            _letterArray = null;
            $doms.container.detach();
            _hidingTL = null;
            if(cb) cb.call();
        });
    }

    function r1()
    {
        return -100 + Math.random()*200;
    }

    function r2()
    {
        return -2 + Math.random()*4;
    }

    function r3()
    {
        return -360 + Math.random()*720;
    }

    function r4()
    {
        return Math.random()*2;
    }

}());