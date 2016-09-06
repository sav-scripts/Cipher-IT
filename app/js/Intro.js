(function ()
{
    var $doms = {},
        _isBtnStoryClicked = false,
        _movieclipRoot = null,
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
                        {url: "_intro.html", startWeight: 0, weight: 50, dom: null}
                    ];

                SceneHandler.loadTemplate(null, templates, function loadComplete()
                {
                    loadCanvasAnimation(function()
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
                var canvasWidth = 1920,
                    canvasHeight = 936;

                var containerWidth = $doms.container.width(),
                    containerHeight = $doms.container.height();

                var bound = Helper.getSize_cover(containerWidth, containerHeight, canvasWidth, canvasHeight);

                if($doms.introCanvas)
                {
                    var offsetX = (containerWidth - bound.width)*.5,
                        offsetY = (containerHeight - bound.height)*.5;
                    $doms.introCanvas.css("width", bound.width).css("height", bound.height).css("left", offsetX).css("top", offsetY);
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

        setupIntroAnimation();

        $doms.container.detach();
    }

    function show(cb)
    {
        $("#scene-container").append($doms.container);

        self.resize();
        ScalableContent.updateResizeAble();

        play();

        var tl = new TimelineMax;
        tl.set($doms.container, {autoAlpha: 0});
        tl.to($doms.container, .3, {autoAlpha: 1});
        tl.add(function ()
        {
            cb.apply();
        });
    }


    function setupIntroAnimation()
    {
        var $canvas = $doms.introCanvas = $doms.container.find(".intro-animation");
        var canvas, stage, exportRoot;


        canvas = $canvas[0];
        _movieclipRoot = exportRoot = new lib.intro();

        stage = new createjs.Stage(canvas);
        stage.addChild(exportRoot);
        stage.update();

        createjs.Ticker.setFPS(lib.properties.fps);
        createjs.Ticker.addEventListener("tick", stage);

        _movieclipRoot.stop();
    }

    function loadCanvasAnimation(cb)
    {
        var numScripts = 1, numScriptLoaded = 0, animeScript= 'intro.js';

        $LAB.script(animeScript).wait(scriptLoaded);

        function scriptLoaded()
        {
            numScriptLoaded ++;

            //Loading.updateProgress(numScriptLoaded / numScripts*100, 0, 20, false);

            if(numScriptLoaded < numScripts)
            {

            }
            else
            {
                loadCanvasImages(cb);
            }
        }
    }


    function loadCanvasImages(cb)
    {
        var startWeight = 50, weight = 50,
            count = lib.properties.manifest.length, loaded = 0;

        var images = window.images||{};

            var loader = new createjs.LoadQueue(true);
            loader.addEventListener("fileload", handleFileLoad);
            loader.addEventListener("complete", cb);
            loader.loadManifest(lib.properties.manifest);

        function handleFileLoad(evt)
        {
            loaded++;

            var progress = (startWeight + loaded/count * weight) / 100;
            Loading.progress(progress);

            if (evt.item.type == "image") { images[evt.item.id] = evt.result; }
        }
    }

    function play(cb)
    {
        var tl = new TimelineMax();
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
        tl.add(cb);
    }

    function hide(cb)
    {
        var tl = new TimelineMax;
        tl.to($doms.container, .4, {autoAlpha: 0});
        tl.add(function ()
        {
            $doms.container.detach();
            cb.apply();
        });
    }

}());