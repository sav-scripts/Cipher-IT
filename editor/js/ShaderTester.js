/**
 * Created by sav on 2016/8/16.
 */
(function(){

    var _time = .5,
        _dTime = .0001,
        _shaderMaterial,
        _debugLayerOn = false;

    var self = window.ShaderTester =
    {
        init: function()
        {
            KeyboardControl.init();

            var canvas = document.getElementById('render-canvas'),
                engine = new BABYLON.Engine(canvas, true);

            //engine.setAlphaMode(BABYLON.Engine.ALPHA_COMBINE);


            window.addEventListener("resize", function () {
                engine.resize();
            });

            ShaderLoader.loadFiles(["shape"], function()
            {

                var scene = createScene();

                engine.runRenderLoop(function ()
                {
                    scene.render();
                });

                //scene.debugLayer.show();
                KeyboardControl.add("space", KeyCodeDic.space,
                {
                    onKeyUp: function()
                    {
                        _debugLayerOn = !_debugLayerOn;
                        (_debugLayerOn)? scene.debugLayer.show(): scene.debugLayer.hide();
                    }
                });
            });


            function createScene()
            {
                var scene = new BABYLON.Scene(engine);
                scene.clearColor = new BABYLON.Color4(0,0,0,0.0000000000000001);
                //scene.autoClear = false;
                var camera = new BABYLON.ArcRotateCamera("camera1", 0, 0, 0, new BABYLON.Vector3(0, 0, -10), scene);
                //camera.fov = .8;
                camera.setTarget(new BABYLON.Vector3(0,0,0));
                camera.attachControl(canvas, true, false);

                camera.angularSensibilityX = 2500;
                camera.angularSensibilityY = 2500;


                camera.upperRadiusLimit = 100;
                camera.lowerRadiusLimit = 1;
                camera.radius = 10;
                camera.wheelPrecision = 50;

                var plane = BABYLON.Mesh.CreatePlane("plane", 1, scene);

                //var mat = new BABYLON.StandardMaterial('mat', scene);
                //mat.emissiveColor = new BABYLON.Color3(1,1,1);
                //plane.material = mat;


                var mainTexture = new BABYLON.Texture("textures/amiga.jpg", scene);



                 var shaderMaterial = new BABYLON.ShaderMaterial("shader", scene, "shape-test",
                 {
                     needAlphaBlending: true,
                     attributes: ["position", "normal", "uv"],
                     uniforms: ["worldViewProjection"]
                 });

                 shaderMaterial.setTexture("textureSampler", mainTexture);
                shaderMaterial.setTexture("noiseSampler", new BABYLON.Texture("textures/noise-good.png", scene));
                 shaderMaterial.setFloat("time", _time);
                //shaderMaterial.alphaMode = BABYLON.Engine.ALPHA_ADD;
                 shaderMaterial.backFaceCulling = false;

                scene.registerBeforeRender(function()
                {
                    _time += _dTime;
                    //_time %= 1;

                    shaderMaterial.setFloat("time", _time);
                });

                //console.log(plane.setVerticesData);

                 //_shaderMaterial = plane.material = shaderMaterial;


                var plane2 = BABYLON.Mesh.CreatePlane("plane", 1, scene);
                plane2.position.x = .5;
                plane2.position.y = .3;
                plane2.position.z = .5;


                var material = new BABYLON.StandardMaterial("material1", scene);
                material.emissiveColor = new BABYLON.Color3(1,1,1);
                material.backFaceCulling = false;
                //material.alphaMode = BABYLON.Engine.ALPHA_COMBINE;
                material.diffuseTexture = mainTexture;

                plane.material = material;
                plane2.material = shaderMaterial;

                //plane.renderingGroupId = 1;
                //plane2.renderingGroupId = 2;

                plane.visibility = .999;
                plane2.visibility = .999;

                plane.alphaIndex = 1;
                plane2.alphaIndex = 2;


                return scene;
            }
        }
    };

}());
