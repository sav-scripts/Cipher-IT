(function ()
{
    var $doms = {},
        _isHiding = true,
        _isInit = false,
        _firstClipIndex = 0,
        _visableCount = 0,
        _numClips = 0,
        _lastUnlockedIndex = null,
        _clipGeom =
        {
            width: 0,
            height: 0,
            gapX: 0
        };

    var self = window.Story.Evidences =
    {
        needHideUI: true,

        init: function ($container, $triggerButton)
        {
            $doms.container = $container;
            $doms.parent = $container.parent();
            $doms.triggerButton = $triggerButton;

            $doms.btnClose = $doms.container.find(".btn-close").on(_CLICK_, function()
            {
                //self.hide();
                SceneHandler.toHash("/Story");
            });

            $doms.centerContainer = $doms.container.find(".center-container");
            $doms.clipContainer = $doms.container.find(".clips");

            $doms.clips = {};

            setupClip('key', 0, "/Key", true);
            setupClip('phone', 1, "/Phone");
            setupClip('map', 2, "/Poster");
            setupClip('billboard', 3, "/Billboard");
            setupClip('wineglass', 4, "/Fingerprint");
            setupClip('medal', 5, "/Medal");
            setupClip('briefcase', 6, "/Briefcase");
            //setupClip('locked', 6);

            var $sampleClip = $doms.clips["/Phone"];

            _clipGeom.width = parseInt($sampleClip.css("width"));
            _clipGeom.height = parseInt($sampleClip.css("height"));
            _clipGeom.gapX = parseInt($sampleClip.css("left"));

            $doms.clipContainer.find(".clip-locked").detach();

            $doms.arrowLeft = $doms.container.find(".arrow-left").on(_CLICK_, function()
            {
                changeFirstIndexTo(_firstClipIndex-1);
            });

            $doms.arrowRight = $doms.container.find(".arrow-right").on(_CLICK_, function()
            {
                changeFirstIndexTo(_firstClipIndex+1);

            });


            $doms.container.detach();

            _isInit = true;

            return self;

            function setupClip(name, index, hash, unlocked)
            {
                var $clip = $doms.clips[hash] = $doms.clipContainer.find(".clip-" + name);
                //$clip.toggleClass("lock-mode", true);

                $clip._index = index;

                setClipUnlocked(hash, unlocked);

                $clip.on(_CLICK_, function()
                {
                    SP.play('click');

                    if($clip._unlocked)
                    {
                        SceneHandler.toHash("/Story" + hash);
                    }
                });

                _numClips ++;
            }
        },
        show: function (cb)
        {
            if (!_isHiding) return;
            _isHiding = false;

            $doms.triggerButton.toggleClass("news-mode", false);

            $doms.parent.append($doms.container);

            $doms.btnClose.toggleClass("showing-mode", true);

            self.resize();

            if(_lastUnlockedIndex !== null)
            {
                var newIndex = _lastUnlockedIndex - _visableCount + 1;
                changeFirstIndexTo(newIndex);
                _lastUnlockedIndex = null;
            }

            var tl = new TimelineMax;
            tl.set($doms.container, {autoAlpha: 0});
            tl.to($doms.container, .4, {autoAlpha: 1});
            tl.add(function ()
            {

                if (cb) cb.apply();
            });

        },
        hide: function (cb)
        {
            if (_isHiding) return;
            _isHiding = true;

            $doms.btnClose.toggleClass("showing-mode", false);

            var tl = new TimelineMax;
            tl.to($doms.container, .4, {autoAlpha: 0});
            tl.add(function ()
            {
                $doms.container.detach();
                if (cb) cb.apply();
            });

        },

        unlockEvidence: function(hash)
        {
            if($doms.clips[hash])
            {

                var wasUnlocked = setClipUnlocked(hash, true);

                if(!wasUnlocked)
                {
                    $doms.triggerButton.toggleClass("news-mode", true);
                    _lastUnlockedIndex = $doms.clips[hash]._index;
                    return true;
                }
            }
            return false;
        },

        isEvidenceUnlocked: function(hash)
        {
            return Boolean($doms.clips[hash]._unlocked);
        },

        resize: function()
        {
            if(_isInit)
            {
                update();
            }
        }
    };

    function setClipUnlocked(hash, unlocked)
    {
        var $clip = $doms.clips[hash];

        var wasUnlocked = $clip._unlocked;

        $clip._unlocked = Boolean(unlocked);
        $clip.toggleClass('lock-mode', !$clip._unlocked);

        return wasUnlocked;
    }

    function changeFirstIndexTo(newIndex)
    {
        _firstClipIndex = newIndex;

        if(_firstClipIndex <= 0) _firstClipIndex = 0;
        if((_firstClipIndex+_visableCount) >= _numClips) _firstClipIndex = _numClips - _visableCount;

        //if(_firstClipIndex != oldIndex)
        //{
            updateClipContainer();
            updateArrows();
        //}
    }

    function update()
    {
        var gap1 = 80, // gap between screen edge and arror
            gap2 = 200,  // gap between arrow and first clip
            maxMyWidth = 1760,
            screenWidth = Main.settings.viewport.width,
            myWidth = screenWidth - gap1*2;

        if(myWidth > maxMyWidth) myWidth = maxMyWidth;

        var clipTotalWidthAllowed = myWidth - gap2 * 2;


        var visableGapCount = parseInt(clipTotalWidthAllowed / _clipGeom.gapX),
            clipTotalWidth = visableGapCount * _clipGeom.gapX,
            clipContainerX = (myWidth - clipTotalWidth) * .5;

        var dx = (clipTotalWidthAllowed - clipTotalWidth) * .5;

        $doms.arrowLeft.css("left", dx);
        $doms.arrowRight.css("right", dx);

        _visableCount = visableGapCount + 1;

        //console.log("clipTotalWidthAllowed = " + clipTotalWidthAllowed + ", clipTotalWidth = " + clipTotalWidth + ", visableGapCount = " + visableGapCount);

        $doms.centerContainer.css("width", myWidth).css("margin-left", -myWidth *.5);
        $doms.clipContainer.css('left', clipContainerX);

        changeFirstIndexTo(_firstClipIndex);


        //updateClipContainer();
        //updateArrows();
    }

    function updateClipContainer()
    {
        var offsetX = -_firstClipIndex * _clipGeom.gapX;

        //var dOffsetX = parseInt($doms.clipContainer.css("margin-left")) - offsetX;
        //var duration = Math.abs(dOffsetX / 300);
        var duration = .9;

        TweenMax.to($doms.clipContainer, duration, {marginLeft: offsetX, ease:Power3.easeInOut});

        for(var key in $doms.clips)
        {
            var $clip = $doms.clips[key];

            //if(key == "briefcase") console.log(($clip._index - _firstClipIndex + _visableCount));

            var needHide = (($clip._index - _firstClipIndex) < 0 || ($clip._index - _firstClipIndex) >= _visableCount);
            $clip.toggleClass("hide-mode", needHide);
        }

    }

    function updateArrows()
    {
        if(_visableCount >= _numClips)
        {
            $doms.arrowLeft.toggleClass("hide-mode", true);
            $doms.arrowRight.toggleClass("hide-mode", true);
        }
        else
        {
            $doms.arrowLeft.toggleClass("hide-mode", _firstClipIndex == 0);
            $doms.arrowRight.toggleClass("hide-mode", ((_firstClipIndex+_visableCount) >= _numClips));
        }
    }

}());