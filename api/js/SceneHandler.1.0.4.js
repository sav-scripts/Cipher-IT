/**
 * Created by sav on 2015/10/20.
 */
(function(){

    var _p = window.SceneHandler = {};


    var _hashDic = {},
        _isPlaying = false,
        _currentHash = null,
        _lastHash = null,
        _cbAfterToContent = null,
        _cbContentLoaded = null,
        _defaultHash = "/Index",
        _version,
        _cbBeforeChange,
        _cbAfterChange,
        _cbContentChange,
        _hashChangeTester,
        _isLocking = false,
        _ignoreNextHashChange,
        _listeningHashChange = true,
        _loadedTemplates = {},
        _blockHashDic = {},
        _lastNonPopupHash = null,
        _Loading;

    _p.currentScene = null;

    _p.processHashNames = function(nameArray)
    {
        var array = [];
        for(var i=0;i<nameArray.length;i++)
        {
            var name = nameArray[i];
            _contentClasses.push(window[name]);
            array.push("/" + name);
        }
        return array;
    };

    _p.getLastHash = function()
    {
        return _lastHash;
    };

    _p.init = function(scenes, opts)
    {
        opts = opts||{};
        _version = opts.version||"0";
        _cbBeforeChange = opts.cbBeforeChange;
        _cbAfterChange = opts.cbAfterChange;
        _hashChangeTester = opts.hashChangeTester;
        _cbContentChange = opts.cbContentChange;
        _cbContentLoaded = opts.cbContentLoaded;
        _Loading = opts.loadingClass;
        _defaultHash = opts.defaultHash || "/Index";

        _listeningHashChange = opts.listeningHashChange !== undefined? opts.listeningHashChange: true;

        var i, hash, obj;

        if(opts.blockHashs)
        {
            for(i=0;i<opts.blockHashs.length;i++)
            {
                _blockHashDic[opts.blockHashs[i]] = true;
            }
        }

        for(i=0;i<scenes.length;i++)
        {
            hash = scenes[i];
            obj = {hash:hash, index:i, stageClass: window[hash.replace("/", "")]};

            if(!obj.stageClass)
            {
                console.error("class for: "+hash+" is not exist");
            }

            _hashDic[hash] = obj;
        }

        if(_listeningHashChange)
        {
            _p.onHashChange(function(hashName)
            {
                if(hashName == "") hashName = "/Index";

                hashName = prefixHash(hashName);

                if(hashName && _hashDic[hashName] && !_blockHashDic[hashName])
                {
                    //ga("send", "pageview", hashName);
                    if(_isPlaying)
                    {
                        _cbAfterToContent = function()
                        {
                            _p.toContent(hashName);
                        };
                    }
                    else _p.toContent(hashName);
                }
            });
        }

    };

    _p.setLock = function(isLock)
    {
        _isLocking = isLock;
    };

    function prefixHash(hash)
    {
        if(_hashChangeTester)
        {
            hash = _hashChangeTester.call(null, hash);
        }

        return hash;
    }

    _p.onHashChange = function(cb)
    {
        if ("onhashchange" in window) { // event supported?

            window.onhashchange = function () {
                hashChanged();
            }
        }
        else { // event not supported:
            var storedHash = window.location.hash;
            window.setInterval(function () {
                if (window.location.hash != storedHash) {
                    storedHash = window.location.hash;
                    hashChanged();
                }
            }, 100);
        }

        function hashChanged()
        {
            if(!_isLocking)
            {
                if(_ignoreNextHashChange)
                {
                    //console.log("one hash change ignored");
                    _ignoreNextHashChange = false;
                }
                else
                {
                    cb.apply(null, [_p.getHash()]);
                }
            }
        }
    };

    _p.toLastHash = function()
    {
        if(window.history)
        {
            history.back();
        }
        else
        {
            _p.toHash(_lastHash);
        }
    };

    _p.toLastNonPopupHash = function()
    {
        _p.toHash(_lastNonPopupHash);
    };

    _p.getHash = function()
    {
        return window.location.hash.replace("#", "");
    };

    _p.setHash = function(targetHash, noUpdate)
    {
        if(noUpdate) _ignoreNextHashChange = true;
        window.location.hash = "#" + targetHash;

        //console.log("setHash: " + targetHash);
    };

    _p.toFirstHash = function(options)
    {
        var firstHash = _p.getHash();
        if(!_listeningHashChange || !_hashDic[firstHash] || _blockHashDic[firstHash]) firstHash = _defaultHash;

        firstHash = prefixHash(firstHash);
        if(!firstHash) return;

        var targetObj = _hashDic[firstHash];
        if(targetObj.stageClass._isPopup)
        {
            var nextHash = firstHash;

            _cbAfterToContent = function()
            {
                _p.toContent(nextHash);
            };

            firstHash = _defaultHash;
        }

        //ga("send", "pageview", firstHash);
        _p.toContent(firstHash, options);

        return firstHash;
    };

    _p.toHash = function(hashName)
    {
        if(_blockHashDic[hashName])
        {
            _p.toContent(hashName);
        }
        else
        {
            _toHash(hashName);
        }

    };

    function _toHash(hashName)
    {
        if(!hashName) hashName = _defaultHash;





        if(_listeningHashChange)
        {
            if(_p.getHash() != hashName)
            {
                _p.setHash(hashName);
            }
            else
            {
                _p.toContent(hashName);
            }
        }
        else
        {
            _p.toContent(hashName);
        }
    }

    _p.toContent = function(hashName, options)
    {
        if(_isPlaying) return;



        if(hashName == "") hashName = _defaultHash;
        if(_currentHash == hashName) return;

        var targetObj, currentObj;

        if(!options) options = {};
        options.firstIn = false;
        options.cbContentLoaded = _cbContentLoaded;

        _isPlaying = true;

        if(_cbContentChange) _cbContentChange.call(null, hashName);

        options.lastHash = _currentHash;

        if(_currentHash == null)
        {
            options.isFirstIn = true;

            _lastHash = _currentHash;
            _currentHash = hashName;
            targetObj = _hashDic[hashName];

            _p.currentScene = targetObj.stageClass;

            if(!_p.currentScene._isPopup) _lastNonPopupHash = _currentHash;

            targetObj.stageClass.stageIn(options, toContentComplete);

        }
        else if(_hashDic[_currentHash] && _hashDic[hashName])
        {
            if(_cbBeforeChange) _cbBeforeChange.apply();

            currentObj = _hashDic[_currentHash];
            targetObj = _hashDic[hashName];

            _p.currentScene = targetObj.stageClass;

            _lastHash = _currentHash;
            _currentHash = hashName;

            var currentClass = currentObj.stageClass,
                targetClass = targetObj.stageClass,
                oldNonPopupHash = _lastNonPopupHash;

            if(!_p.currentScene._isPopup) _lastNonPopupHash = _currentHash;


            //console.log(!currentClass);
            //console.log(targetClass);

            if(currentClass._isPopup == true && !targetClass._isPopup)
            {
                if(oldNonPopupHash && oldNonPopupHash !== _currentHash)
                {
                    currentClass.hide();

                    _hashDic[oldNonPopupHash].stageClass.stageOut(options, function()
                    {
                        targetObj.stageClass.stageIn(options, toContentComplete);
                    });

                }
                else
                {
                    currentClass.hide(toContentComplete);
                }
            }
            else if(!currentClass._isPopup && targetClass._isPopup == true)
            {
                targetClass.show(toContentComplete);
            }
            else if(currentClass._isPopup == true && targetClass._isPopup == true)
            {
                //currentClass.hide(function()
                //{
                //    targetClass.show(toContentComplete);
                //});
                currentClass.hide();
                targetClass.show(toContentComplete);

            }
            else
            {
                currentObj.stageClass.stageOut(options, function()
                {
                    targetObj.stageClass.stageIn(options, toContentComplete);
                });
            }
        }
    };

    function toContentComplete()
    {
        _isPlaying = false;
        if(_cbAfterToContent != null)
        {
            _cbAfterToContent.apply();
            _cbAfterToContent = null;
        }

        if(_cbAfterChange) _cbAfterChange.apply();
    }


    _p.loadTemplate = function(imageSetting, templates, cb)
    {
        if(_Loading) _Loading.show();

        if(imageSetting != null)
        {
            Utility.preloadImages(imageSetting.list, loadOne ,function(progress)
            {
                if(_Loading) _Loading.progress(progress/100);
            });
        }
        else loadOne(0);

        function loadOne(index)
        {
            if(templates.length == 0)
            {
                if(_Loading) _Loading.hide();
                cb.apply(null); return;
            }
            if(index == null) index = 0;

            var url = templates[index].url,
                frameDom;
            
            if(_loadedTemplates[url])
            {
                templates[index].dom = _loadedTemplates[url];
                loadComplete();
            }
            else
            {
                if(_Loading) _Loading.progress(0);

                frameDom = document.createElement("div");

                $(frameDom).load(templates[index].url + "?v=" + _version, function()
                {
                    _loadedTemplates[url] = frameDom;

                    var extractClass= templates.extractClass;
                    if(!extractClass) extractClass = "extract-point";
                    var extractDom = templates[index].dom = $(frameDom).find("." + extractClass)[0];
                    $(extractDom).toggleClass(extractClass, false);

                    $("#invisible-container").append(extractDom);

                    $(extractDom).waitForImages(function()
                    {
                        if(extractDom.parentNode) extractDom.parentNode.removeChild(extractDom);
                        loadComplete();
                    }, function(loaded, count)
                    {
                        var progress = loaded/count;
                        if(_Loading) _Loading.progress(progress);
                    }, true);
                });
            }

            function loadComplete()
            {
                index ++;
                if(index >= templates.length)
                {
                    if(_Loading) _Loading.hide();
                    cb.apply(null);
                }
                else loadOne(index);
            }

            
        }
    };

}());