/**
 * Created by sav on 2016/6/22.
 */
(function(){

    window.KeyCodeDic =
    {
        shift: 16,
        ctrl: 17,
        alt: 18,
        up: 38,
        delete: 46,
        down: 40,
        left: 37,
        right: 39,
        w: 87,
        s: 83,
        a: 65,
        d: 68,
        space: 32
    };

    var _isInit = false,
        _registedKeyDic = {},
        _pressedKeyDic = {},
        _updateInterval = 33,
        _isWindowOnFocus = false,
        _preventDefault,
        _logKeyCode;

    var self = window.KeyboardControl =
    {
        funcKeysDown:
        {
            ctrl: false,
            shift: false,
            alt: false
        },

        init: function(preventDefault, logKeyCode)
        {
            _preventDefault = preventDefault || false;
            _logKeyCode = logKeyCode || false;

            if(_isInit) return; _isInit = true;

            window.onfocus = function()
            {
                _isWindowOnFocus = true;
            };

            window.onblur = function()
            {
                _isWindowOnFocus = false;
                _pressedKeyDic = {};
            };


            window.addEventListener('keydown', function(event)
            {
                self.funcKeysDown.ctrl = event.ctrlKey;
                self.funcKeysDown.shift = event.shiftKey;
                self.funcKeysDown.alt = event.altKey;

                if(_preventDefault) event.preventDefault();
                if(_logKeyCode) console.log("key down: " + event.keyCode);
                if(!_pressedKeyDic[event.keyCode])
                {
                    var obj = _pressedKeyDic[event.keyCode] =
                    {
                        keyCode: event.keyCode
                    };

                    update(obj, true);
                }
            });

            window.addEventListener('keyup', function(event)
            {
                self.funcKeysDown.ctrl = event.ctrlKey;
                self.funcKeysDown.shift = event.shiftKey;
                self.funcKeysDown.alt = event.altKey;

                if(_preventDefault) event.preventDefault();

                if(_pressedKeyDic[event.keyCode])
                {
                    update(_pressedKeyDic[event.keyCode], false, true);
                    delete _pressedKeyDic[event.keyCode];
                }
            });

            return self;
        },

        add: function(eventName, keyCode, options)
        {

            var registedObj =
            {
                eventName: eventName,
                keyCode: keyCode
            };

            var supportedOptions =
            [
                'onUpdate',
                'onKeyDown',
                'onKeyUp'
            ];


            if(typeof options === 'function')
            {
                registedObj.onUpdate = registedObj.onKeyDown = options;
            }
            else if(typeof options === 'object')
            {
                var i, key;
                for(i=0;i<supportedOptions.length;i++)
                {
                    key = supportedOptions[i];
                    if(options[key]) registedObj[key] = options[key];
                }
            }
            else
            {
                console.error('illegal options param type');
            }

            if(!_registedKeyDic[keyCode]) _registedKeyDic[keyCode] = [];
            _registedKeyDic[keyCode].push(registedObj);

            return self;
        },

        remove: function(eventName, keyCode)
        {


            return self;
        }
    };

    function update(obj, isKeyDown, isKeyUp)
    {
        if(_pressedKeyDic[obj.keyCode])
        {
            if(_registedKeyDic[obj.keyCode])
            {
                var array = _registedKeyDic[obj.keyCode],
                    i,
                    registedObj;

                for(i=0;i<array.length;i++)
                {
                    registedObj = array[i];

                    if(registedObj.onKeyDown && isKeyDown)
                    {
                        registedObj.onKeyDown.call();
                    }

                    if(registedObj.onKeyUp && isKeyUp)
                    {
                        registedObj.onKeyUp.call();
                    }

                    if(registedObj.onUpdate && !isKeyDown && !isKeyUp)
                    {
                        registedObj.onUpdate.call();
                    }

                }
            }

            if(!isKeyUp)
            {
                setTimeout(update, _updateInterval, obj);
            }
        }
    }


}());