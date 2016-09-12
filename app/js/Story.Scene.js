/**
 * Created by sav on 2016/8/30.
 */
(function(){

    var SCENE_SIZE = 200,
        SPHERE_SEGMENTS = 64,
        START_CAMERA_RADIUS = 75,
        UPPER_CAMERA_BETA_LIMIT_DEG = 25,
        LOWER_CAMERA_BETA_LIMIT_DEG = 5;

    var _canvas,
        _engine,
        _scene,
        _customCamera,

        _sceneDataPath = "scenedata/",

        _sceneSphere,
        _isUserControlEnabled = false,
        _isLightAnimating = false,
        _isActive = false;

    var _lightSetting =
    {
        "white-1": {
            mode: "fastFlash2"
        },
        "white-2": {
            mode: "fastFlash2"
        },
        "blue-1":{
            mode: "fastFlash"
        }
    };

    var self = window.Story.Scene =
    {
        engine: null,
        customCamera: null,

        init: function(canvas, useSmallTextures, onReady)
        {
            _canvas = canvas;
            _engine = this.engine = new BABYLON.Engine(_canvas, false);

            $(_canvas).on("pointerdown", function(event)
            {
                event.preventDefault();
            });

            //var webgl = _canvas.getContext("webgl");
            //console.log(webgl.getParameter(webgl.MAX_TEXTURE_SIZE));

            var scene = _scene = new BABYLON.Scene(_engine);
            scene.clearColor = new BABYLON.Color3(0,0,0);

            //console.log(scene.actionManager);
            //scene.actionManager = new BABYLON.ActionManager(scene);

            MaterialLib.defaultPath = "../editor/textures/";
            MaterialLib.init(scene);

            BillboardEditor.init(_scene, SCENE_SIZE, true);
            ShapeEditor.init(_scene, true);
            LightEditor.init(_scene, true);

            //setupCamera();
            _customCamera = this.customCamera = new CustomCamera(_canvas, _scene, SCENE_SIZE, START_CAMERA_RADIUS, UPPER_CAMERA_BETA_LIMIT_DEG, LOWER_CAMERA_BETA_LIMIT_DEG);

            _sceneSphere = new BABYLON.Mesh.CreateSphere("background", SPHERE_SEGMENTS, SCENE_SIZE*2, scene);
            _sceneSphere.scaling.y = -1;
            _sceneSphere.isPickable = false;

            _sceneSphere.material = MaterialLib.createNormal();
            _sceneSphere.material.disableLighting = true;
            //disableLighting

            if(Utility.urlParams.fog == 1)
            {
                scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
                scene.fogDensity = 0.0018;
                scene.fogColor = new BABYLON.Color3(0.9, 0.9, 0.85);
            }


            ShaderLoader.defaultPath = "./shaders/";

            ShaderLoader.loadFiles(["for-scene"],function()
            {
                //DataManager.loadFromExtractedData(_sceneDataPath, self, null, function ()
                DataManager.loadFromExtractedData(_sceneDataPath, self, useSmallTextures, function ()
                {
                    BillboardEditor.setAllUnPickable();

                    setupLights();

                    Story.ObjectManager.init(_scene);

                    RainMaker.init(_scene);

                    PostProcessLib.init(_engine, _scene, _customCamera._camera);
                    PostProcessLib.enableEffect("scene");

                    Loading.hide(onReady);
                });
            });
        },

        setActive: function(b)
        {
            if(b == _isActive) return;
            _isActive = b;

            self.setLightAnimation(_isActive);

            if(b)
            {
                _engine.runRenderLoop(renderFunction);
            }
            else
            {

                _engine.stopRenderLoop(renderFunction);
            }
        },

        setUserControlEnabled: function(b)
        {
            if(b == _isUserControlEnabled) return;
            _isUserControlEnabled = b;


            _customCamera.setEnabled(_isUserControlEnabled);
            Story.ObjectManager.setEnabled(_isUserControlEnabled);
        },

        applyBase64Background: function(imageSrc)
        {
            var texture = new BABYLON.Texture("data:background"+new Date().getTime(), _scene, null, true, null, null, null, imageSrc, true);

            var mat = _sceneSphere.material;

            if(mat.constructor.name == 'StandardMaterial')
            {
                mat.diffuseTexture = texture;
            }
            else if(mat.constructor.name == 'ShaderMaterial')
            {
                mat.setTexture('textureSampler', texture);
            }
        },

        applyBackground: function(imageSrc, cb)
        {
            var texture = new BABYLON.Texture(imageSrc, _scene, null, true, null, function()
            {
                var mat = _sceneSphere.material;

                if(mat.constructor.name == 'StandardMaterial')
                {
                    mat.diffuseTexture = texture;
                }
                else if(mat.constructor.name == 'ShaderMaterial')
                {
                    mat.setTexture('textureSampler', texture);
                }

                if(cb) cb.call();
            });
        },

        setLightAnimation: function(b)
        {
            if(b == _isLightAnimating) return;
            _isLightAnimating = b;

            var key;
            for(key in _lightSetting)
            {
                _isLightAnimating? _lightSetting[key].tl.restart(): _lightSetting[key].tl.pause();
            }
        }
    };

    function setupLights()
    {

        var lightDic = LightEditor.getDicByName(),
            billboardDic = BillboardEditor.getDicByName();

        var name,
            billboardName,
            obj,
            light,
            billboard,
            billboardArray,
            meshArray;

        for(name in _lightSetting)
        {
            obj = _lightSetting[name];

            if(!lightDic["light-" + name])
            {
                alert("[light-" + name + "] is missing in scenedata");
                return;
            }

            light = obj.light = lightDic["light-" + name]._light;

            billboardArray = obj.relatedBillboardArray = [];
            meshArray = obj.relatedMeshArray = [];

            for(billboardName in billboardDic)
            {
                billboard = billboardDic[billboardName];
                if(billboard._linkedLight)
                {
                    if(billboard._linkedLight.match(name))
                    {
                        //console.log(billboardName);
                        billboardArray.push(billboard);
                        meshArray.push(billboard._mesh);
                    }
                }
            }


            if(obj.mode == 'simpleFlash')
            {
                obj.tl = makeSimpleFlash(light, meshArray);
            }
            else if(obj.mode == 'fastFlash')
            {
                obj.tl = makeFastFlash(light, meshArray);
            }
            else if(obj.mode == 'fastFlash2')
            {
                obj.tl = makeFastFlash2(light, meshArray);
            }

            //billboard = billboardDic["light-" + name];
        }

        //BillboardEditor.updateAllVisibility();
    }

    function makeSimpleFlash(light, meshArray)
    {
        var tl;

        tl = new TimelineMax({repeat:-1, paused:true});

        tl.to(light, 1, {intensity: 0});
        tl.to(meshArray, 1, {visibility: 0}, "-=1");
        tl.to(light, 1, {intensity: 1});
        tl.to(meshArray, 1, {visibility: 1}, "-=1");

        return tl;
    }

    function makeFastFlash(light, meshArray)
    {

        var d = .1, tl;

        tl = new TimelineMax({repeat:-1, paused:true});

        tl.to(light,d, {intensity: 0});
        tl.to(meshArray,d, {visibility:.3}, "-="+d);
        tl.to(light,d, {intensity: 1});
        tl.to(meshArray, d, {visibility: 1}, "-="+d);

        return tl;
    }

    function makeFastFlash2(light, meshArray)
    {
        var tl = new TimelineMax({paused:true});

        tl.add(function()
        {
            Math.random() > .5? triggerFlash(light, meshArray): triggerFlash2(light, meshArray);

            if(_isActive)
            {
                TweenMax.delayedCall(Math.random()*2+1, function()
                {
                    tl.restart();
                });
            }

        }, 1);

        return tl;
    }

    function triggerFlash(light, meshArray)
    {
        var tl = new TimelineMax,
            count = parseInt(1 + Math.random()*3),
            i,
            d = .05,
            t = 0;
        for(i=0;i<count;i++)
        {
            //tl.to(light,d, {intensity:.3});
            //tl.to(meshArray,d, {visibility:.8}, "-="+d);
            //tl.to(light,d, {intensity:.6});
            //tl.to(meshArray, d, {visibility: 1}, "-="+d);
            var start = d* i*2,
                end = start+d;


            tl.set(light, {intensity:.3}, start + t);
            tl.set(meshArray, {visibility:.8}, start + t);
            tl.set(light, {intensity:.6}, end + t);
            tl.set(meshArray,  {visibility: 1}, end + t);

            t += Math.random()*.1;
        }
    }

    function triggerFlash2(light, meshArray)
    {
        var tl = new TimelineMax();
        var d = Math.random()*.5 + .5,
            t = 0;

        if(Math.random() > .5)
        {
            tl.set(light, {intensity:.3}, 0);
            tl.set(meshArray, {visibility:.8}, 0);
            t+=.1;
            tl.set(light, {intensity:.6}, t);
            tl.set(meshArray,  {visibility: 1}, t);
            t+=.1;
        }

        tl.set(light, {intensity:.3}, t);
        tl.set(meshArray, {visibility:.8}, t);
        tl.set(light, {intensity:.6}, t+d);
        tl.set(meshArray,  {visibility: 1}, t+d);
    }

    function renderFunction()
    {
        _scene.render();
    }

}());