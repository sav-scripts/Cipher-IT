// createjs.Sound extend for 0.6.1 version
/* init example
createjs.Sound.initAndLoad(
    [
        {id:"bgm", src:"bgm.mp3?v=2", defaultPlayProps:{loop: -1, volume: 1}}
    ],
    {
        folder: "./misc/",
        globalClassName: "SP",
        defaultFadeDuration: 2
    }, function()
    {
        SP.playTrack("bgm");
    }
);
 */
(function(){

    var _trackDic = {},
        _manifestDic = {},
        _folder,
        _defaultFadeDuration,
        _isInit = false;

    var self = window.createjs.Sound;

    self.init = function (options)
    {
        if(_isInit) return;
        _isInit = true;

        options = options || {};
        _folder = options.folder || "./";
        _defaultFadeDuration = options.defaultFadeDuration || 1;
        if(options.globalClassName) registerGlobalClassName(options.globalClassName);
    };

    self.load = function(manifest, onProgress, cb)
    {

        createjs.Sound.alternateExtensions = ["mp3"];
        createjs.Sound.addEventListener("fileload", handleLoad);

        createjs.Sound.registerSounds(manifest, _folder);


        var count = 0, total = manifest.length;

        //for(var i=0;i<manifest.length;i++)
        //{
        //    var obj = manifest[i];
        //    createjs.Sound.registerSound(obj.src, obj.id, obj.data, _folder, obj.defaultPlayProps);
        //}

        function handleLoad(event)
        {
            var obj = manifest[count];
            _manifestDic[obj.id] = obj;
            count++;

            if(onProgress) onProgress.call(null, count, total);

            if (count >= manifest.length)
            {
                createjs.Sound.removeEventListener("fileload", handleLoad);

                if(cb) cb.apply();
            }
        }
    };

    self.playTrack = self.resumeTrack = function(id, fadeDuration, startPosition)
    {
        fadeInTrack(id, fadeDuration, startPosition);
    };

    self.restartTrack = function(id, fadeDuration, startPosition)
    {
        fadeInTrack(id, fadeDuration, startPosition || 0);
    };

    self.pauseTrack = function(id, fadeDuration)
    {
        fadeOutTrack(id, fadeDuration);
    };

    self.stopTrack = function(id, fadeDuration)
    {
        fadeOutTrack(id, fadeDuration);
    };

    self.getTrack = getTrack;

    function getTrack(id)
    {
        var track = _trackDic[id] = _trackDic[id] || self.createInstance(id);
        if(TimelineLite && !track._tween) track._tween = new TimelineLite;

        return track;
    }

    function fadeInTrack(id, fadeDuration, startPosition)
    {
        var track = getTrack(id);

        if(fadeDuration === null || fadeDuration === undefined || fadeDuration === true) fadeDuration = _defaultFadeDuration;
        else if(fadeDuration === false) fadeDuration = 0;


        var obj = _manifestDic[id];
        var volume = obj.defaultPlayProps && obj.defaultPlayProps.volume? obj.defaultPlayProps.volume: 1;


        if(startPosition !== undefined && startPosition !== null)
        {
            track.position = startPosition * 1000;
        }

        var tween = track._tween;
        if(!tween)
        {
            track.play();
            track.volume = volume;
        }
        else
        {
            track.volume = 0;
            track.play();
            tween.clear();
            tween.to(track, fadeDuration, {volume:volume});
        }
    }

    function fadeOutTrack(id, fadeDuration, isStopInEnd)
    {
        var track = getTrack(id);

        if(fadeDuration === null || fadeDuration === undefined || fadeDuration === true) fadeDuration = _defaultFadeDuration;
        else if(fadeDuration === false) fadeDuration = 0;


        var tween = track._tween;
        if(!tween)
        {
            isStopInEnd? track.stop(): track.paused = true;
            track.volume = volume;
        }
        else
        {
            track.play();
            tween.clear();
            tween.to(track, fadeDuration, {volume:0, onComplete:function()
            {
                isStopInEnd? track.stop(): track.paused = true;
            }});
        }
    }

    function registerGlobalClassName(globalName)
    {
        if(window[globalName]) console.warn("window variable: " + globalName + " already used");
        window[globalName] = self;
    }
	
}());