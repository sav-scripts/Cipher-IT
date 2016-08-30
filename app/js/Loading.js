/**
 * Created by sav on 2016/8/23.
 */
(function(){
    /**
     * Created by sav on 2015/12/6.
     */
    (function(){


        var _isInit = false,
            _isHiding = true,
            _container,
            _text,
            _progress = .0,
            _timeout,
            _emptyProgressMode = false;

        var _p = window.Loading =
        {
            show: function()
            {
                if(!_isInit) init();

                if(!_isHiding) return;
                _isHiding = false;

                //console.log(document.getElementsByTagName("body")[0]);
                if(_timeout !== null) update();


                document.body.appendChild(_container);

                if(window.TweenMax)
                {
                    TweenMax.killTweensOf(_container);
                    TweenMax.set(_container, {opacity:0});
                    TweenMax.to(_container,.3, {opacity: 1});
                }


                return _p;
            },
            hide: function(cb)
            {
                if(!_isInit) init();

                if(_isHiding) return;
                _isHiding = true;

                if(window.TweenMax)
                {
                    TweenMax.killTweensOf(_container);
                    TweenMax.to(_container,.5, {opacity: 0, onComplete: removeSelf});
                }
                else
                {
                    removeSelf();
                }

                function removeSelf()
                {
                    if(_container.parentNode) _container.parentNode.removeChild(_container);
                    clearTimeout(_timeout);

                    if(cb) cb.call();
                }

                return _p;
            },

            progress: function(progress)
            {
                if(!_isInit) init();

                if((typeof progress) == "number")
                {
                    _emptyProgressMode = false;
                    _progress = progress;
                    _text.innerHTML = parseInt(_progress * 100);
                }
                else
                {
                    _emptyProgressMode = true;
                    _text.innerHTML = '';
                }


                return _p;
            }
        };


        function init()
        {
            if(_isInit) return;
            _isInit = true;

            _container = document.getElementById("loading");
            _text = document.getElementById("loading-text");
        }

        function update()
        {
            if(_emptyProgressMode)
            {
                for(var i=0;i<100;i++)
                {
                    var s = String.fromCharCode(parseInt(Math.random()*26)+65);
                    if(s != _text.innerHTML)
                    {
                        _text.innerHTML = s;
                        break;
                    }
                }
            }

            _timeout = setTimeout(update, 233);
        }

    }());

}());