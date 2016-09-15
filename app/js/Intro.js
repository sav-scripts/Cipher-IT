(function ()
{
    var $doms = {},
        _canvasStage = null,
        _isBtnStoryClicked = false,
        _movieclipRoot = null,
        _introPlaying = false,
        _introTl,
        _isActive = false,
        _isInit = false;

    var self = window.Intro =
    {
        stageIn: function (options, cb)
        {
            (!_isInit) ? loadAndBuild(execute) : execute();
            function execute(isFromLoad)
            {
                if (isFromLoad && options.cbContentLoaded) options.cbContentLoaded.call();
                show(cb);
            }

            function loadAndBuild(cb)
            {
                var templates =
                    [
                        {url: "_intro.html", startWeight: 0, weight: 30, dom: null}
                    ];

                SceneHandler.loadTemplate(null, templates, function loadComplete()
                {
                    loadLibAndAnimation(function()
                    {
                        Loading.hide();
                        build(templates);
                        _isInit = true;
                        cb.apply(null);
                    });
                }, true);
            }
        },

        stageOut: function (options, cb)
        {
            hide(cb);
        },

        resize: function ()
        {
            if(_isInit)
            {

                if($doms.introCanvas)
                {
                    var vp = Main.settings.viewport;

                    var canvasWidth = 1920,
                        canvasHeight = 936;

                    if(vp.index == 0)
                    {
                        canvasWidth = 640;
                        canvasHeight = 855;
                    }

                    var containerWidth = $doms.container.width(),
                        containerHeight = $doms.container.height();

                    var bound = Helper.getSize_cover(containerWidth, containerHeight, canvasWidth, canvasHeight);

                    var offsetX = (containerWidth - bound.width)*.5,
                        offsetY = (containerHeight - bound.height)*.5;
                    //$doms.introCanvas.css("width", bound.width).css("height", bound.height).css("left", offsetX).css("top", offsetY).attr('width', bound.width + "px").attr("height", bound.height + "px");
                    $doms.introCanvas.css("width", bound.width).css("height", bound.height).css("left", offsetX).css("top", offsetY).attr('width', bound.width).attr("height", bound.height);


                    _canvasStage.scaleX = bound.width / canvasWidth;
                    _canvasStage.scaleY = bound.height / canvasHeight;
                }
            }
        }
    };


    function build(templates)
    {
        $("#invisible-container").append(templates[0].dom);
        $doms.container = $("#intro");

        $doms.leftContent = $doms.container.find(".left-content");

        $doms.btnPlay = $doms.container.find(".btn-play").on(_CLICK_, function()
        {
            if(_isBtnStoryClicked)
            {
                SceneHandler.toHash("/Story");
            }
            else
            {
                SceneHandler.toHash("/Story/Key");
            }


            _isBtnStoryClicked = true;
        });

        $doms.video = $doms.container.find(".intro-video");

        $doms.btnSkip = $doms.container.find(".btn-skip").on(_CLICK_, function()
        {
            skipIntro();
        });

        setupIntroAnimation();

        //applyVideo();

        $doms.container.detach();
    }

    function show(cb)
    {
        _isActive = true;

        $("#scene-container").append($doms.container);

        self.resize();

        ScalableContent.updateResizeAble();

        Menu.hide();
        //SoundSwitch.hide();

        play();

        SP.restartTrack("intro-bgm", null, 14);

        //$doms.video[0].play();

        var tl = new TimelineMax;
        tl.set($doms.container, {autoAlpha: 0});
        tl.to($doms.container, .3, {autoAlpha: 1});
        tl.add(function ()
        {
            cb.apply();
        });
    }

    function hide(cb)
    {
        _isActive = false;

        SP.stopTrack("intro-bgm");

        Menu.hide();
        SoundSwitch.hide();

        var tl = new TimelineMax;
        tl.to($doms.container, .4, {autoAlpha: 0});
        tl.add(function ()
        {
            $doms.container.detach();
            cb.apply();
        });
    }

    function applyVideo()
    {


        window.requestAnimFrame = (function(callback) {
            return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
                function(callback) {
                    window.setTimeout(callback, 1000 / 60);
                };
        })();

        $doms.video = $doms.container.find(".intro-video");
        $doms.videoCanvas = $doms.container.find('.intro-video-canvas');

            var v = $doms.video[0];
            var canvas = $doms.videoCanvas[0];
            var context = canvas.getContext('2d');

        console.log(context.globalCompositeOperation);
        //context.globalCompositeOperation = 'lighter';
        context.globalCompositeOperation = 'multiply';

        //v.addEventListener("loadeddata", function()
        //{
        //    console.log("check");
        //});

        drawVideo();

        function drawVideo()
        {
            context.clearRect(0, 0, 1920, 1080);
            context.drawImage(v, 0, 0, 1920, 1080);
            requestAnimFrame(drawVideo);
        }

        function draw(v,c,w,h) {
            if(v.paused || v.ended) return false;
            c.drawImage(v,0,0,w,h);
            //setTimeout(draw,20,v,c,w,h);
        }


    }

    function skipIntro()
    {
        if(_introPlaying)
        {
            _introPlaying = false;
            _movieclipRoot.killPlayTo();
            _movieclipRoot.gotoAndStop(_movieclipRoot.totalFrames-1);
            if(_introTl) _introTl.progress(1);
        }
    }


    function setupIntroAnimation()
    {
        var $canvas = $doms.introCanvas = $doms.container.find(".intro-animation");
        var canvas, stage, exportRoot;


        canvas = $canvas[0];
        _movieclipRoot = exportRoot = new lib.intro();

        stage = _canvasStage = new createjs.Stage(canvas);
        stage.addChild(exportRoot);
        stage.update();

        createjs.Ticker.setFPS(lib.properties.fps);
        createjs.Ticker.addEventListener("tick", stage);

        _movieclipRoot.stop();
    }

    function loadLibAndAnimation(cb)
    {
        var startWeight = .3, weight = .2;
        var animeScript= Main.settings.viewport.index == 0? 'js/animes/intro_m.js': 'js/animes/intro.js';
        var scripts =
            [
                'js/lib/createjs-2015.11.26.min.js',
                //'js/lib/soundjs-0.6.2.min.js',
                'js/lib/CreatejsExtend.js',
                'js/lib/SoundjsExtend.js',
                animeScript
            ];

        var total = scripts.length,
            count = 0,
            i, chain = $LAB;

        for(i=0;i<scripts.length;i++)
        {
            chain = chain.script(scripts[i]).wait(scriptLoaded);
        }

        function scriptLoaded()
        {
            count ++;

            Loading.progress(startWeight + weight*count/total);

            if(count == total)
            {
                setupSounds(function()
                {
                    loadCanvasImages(cb);
                });
            }
        }
    }

    function setupSounds(cb)
    {
        var startWeight = .5, weight = .1;

        if(!window.SP) createjs.Sound.init(Main.soundSettings);

        SP.load(
        [
            {id:"intro-bgm", src:"intro_bg.mp3?v=2", defaultPlayProps:{loop: -1, volume: 1}}
        ],
        function(count, total)
        {
            Loading.progress(startWeight + weight*count/total);
        },
        function()
        {
            SoundSwitch.update();
            if(cb) cb.call();
        });
    }

    function loadCanvasImages(cb)
    {
        var startWeight = .6, weight = .4,
            total = lib.properties.manifest.length, count = 0;

        var images = window.images||{};

            var loader = new createjs.LoadQueue(true);
            loader.addEventListener("fileload", handleFileLoad);
            loader.addEventListener("complete", cb);
            loader.loadManifest(lib.properties.manifest);

        function handleFileLoad(evt)
        {
            count++;

            Loading.progress(startWeight + count/total * weight);

            if (evt.item.type == "image") { images[evt.item.id] = evt.result; }
        }
    }

    function play(cb)
    {
        _introPlaying = true;

        SoundSwitch.show();
        SoundSwitch.$doms.container.toggleClass('intro-mode', true);

        $doms.btnSkip.toggleClass("hide-mode", false);

        var tl = _introTl = new TimelineMax();
        tl.set([$doms.leftContent[0], $doms.btnPlay[0]], {autoAlpha:0, x:200});

        _movieclipRoot.gotoAndStop(1);
        var t = _movieclipRoot.playTo(_movieclipRoot.totalFrames-1, null, function()
        {
            //tl.resume();
            //if(cb) cb.call();

        });

        t-=.3;

        tl.to($doms.leftContent,.8, {autoAlpha:1, x:0, ease:Back.easeOut}, t);
        tl.to($doms.btnPlay,.8, {autoAlpha:1, x:0, ease:Back.easeOut}, t + .3);
        tl.add(function()
        {
            if(_isActive)
            {
                SoundSwitch.$doms.container.toggleClass('intro-mode', false);
                Menu.show();
            }
            $doms.btnSkip.toggleClass("hide-mode", true);
            _introPlaying = false;
            if(cb) cb.call();
        });
    }

}());