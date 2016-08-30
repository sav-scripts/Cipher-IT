/**
 * Created by sav on 2016/3/14.
 */
(function(){

    var _dom,
        _text,
        _history = [],
        MAX_MESSAGE = 10,
        _isOpen = false,
        _cLog,
        _overrideLog = false,
        _basicHeight = 26;

    var _p = window.Logger =
    {
        init: function(overrideConsole)
        {
            _dom = document.createElement("div");
            _dom.style.position = "fixed";
            _dom.style.width = "100%";
            _dom.style.height = _basicHeight + "px";
            _dom.style.bottom = "0";
            _dom.style.backgroundColor = "black";
            _dom.style.zIndex = 8000;
            _dom.style.color = "white";
            _dom.style.overflow = "hidden";

            _text = document.createElement("div");
            _text.style.position = "absolute";
            _text.style.width = "100%";
            _text.style.height = "auto";
            _text.style.bottom = "5px";
            _text.style.left = "5px";
            _dom.appendChild(_text);

            overrideConsoleLog();

            update();

            _dom.addEventListener("click", function()
            {
                _isOpen? _p.close(): _p.open();
            });

            return _p;
        },
        show: function()
        {
            document.body.appendChild(_dom);

            return _p;
        },
        hide: function()
        {
            if(_dom.parentNode) document.body.removeChild(_dom);

            return _p;
        },
        open: function()
        {
            if(_isOpen) return;
            _isOpen = true;

            update();

            return _p;
        },
        close: function()
        {
            if(!_isOpen) return;
            _isOpen = false;

            update();

            return _p;
        },
        add: function(message)
        {
            _history.push(message);
            if(_history.length > MAX_MESSAGE) _history.shift();

            update();

            if(_overrideLog)
            {
                _cLog.call(null, message);
            }

            return _p;
        }
    };

    function overrideConsoleLog()
    {
        _overrideLog = true;
        _cLog = console.log.bind(console);
        console.log = _p.add;
    }

    function update()
    {
        var string = "";

        if(_isOpen)
        {

            for (var i = 0; i < _history.length; i++)
            {
                if (i > 0) string += "<br/>";
                string += "> " + _history[i];
            }
        }
        else
        {
            string = "> " + _history[_history.length-1];
        }
        _text.innerHTML = string;

        _dom.style.height = _text.clientHeight + 8 + "px";

    }

    //_p.init(true);
    //_p.show();

    //_p.add("hellow world 1");
    //_p.add("hellow world 2");
    //_p.add("hellow world 3");
    //_p.add("hellow world 4<br/>sfsdf");

}());