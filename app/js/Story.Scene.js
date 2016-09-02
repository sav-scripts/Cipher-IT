/**
 * Created by sav on 2016/8/30.
 */
(function(){

    var SCENE_SIZE = 200,
        SPHERE_SEGMENTS = 64,
        START_CAMERA_RADIUS = 75,
        CAMERA_BETA_LIMIT_DEG = 25;

    var _canvas,
        _engine,
        _scene,
        _customCamera,

        _sceneDataPath = "scenedata/",

        _sceneSphere,
        _isUserControlEnabled = false,
        _isActive = false;

    var self = window.Story.Scene =
    {
        engine: null,
        customCamera: null,

        init: function(canvas, onReady)
        {
            _canvas = canvas;
            _engine = this.engine = new BABYLON.Engine(_canvas, true);

            $(_canvas).on("pointerdown", function(event)
            {
                event.preventDefault();
            });


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
            _customCamera = this.customCamera = new CustomCamera(_canvas, _scene, SCENE_SIZE, START_CAMERA_RADIUS, CAMERA_BETA_LIMIT_DEG);

            _sceneSphere = new BABYLON.Mesh.CreateSphere("background", SPHERE_SEGMENTS, SCENE_SIZE*2, scene);
            _sceneSphere.scaling.y = -1;
            _sceneSphere.isPickable = false;

            _sceneSphere.material = MaterialLib.createNormal();
            _sceneSphere.disableLighting = true;
            //disableLighting

            ShaderLoader.defaultPath = "../editor/shaders/";

            ShaderLoader.loadFiles(["shape", "for-scene"],function()
            {
                DataManager.loadFromExtracedData(_sceneDataPath, self, function ()
                {
                    BillboardEditor.setAllUnPickable();

                    Story.ObjectManager.init(_scene);

                    Loading.hide(onReady);
                });
            });
        },

        setActive: function(b)
        {
            if(b == _isActive) return;
            _isActive = b;

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
        }
    };

    function renderFunction()
    {
        _scene.render();
    }

}());