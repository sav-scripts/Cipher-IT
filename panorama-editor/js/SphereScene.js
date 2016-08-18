/**
 * Created by sav on 2016/8/15.
 */
(function(){

    var SCENE_SIZE = 200,
        SPHERE_SEGMENTS = 64;

    var _canvas,
        _engine,
        _scene,
        _sceneSphere,
        _arcCamera,
        _wireSphere,
        _mainSphere;

    var _gui;

    var _textureDic = {};

    var self = window.SpehereScene =
    {
        _debugLayerOn: false,

        _wireLayerOn: false,

        _cameraBetaLimit: 90,

        _firstTextureIndex: 0,
        _textureFile: null,
        _textureList:
        [
            '360TEST.jpg',
            '360TEST-透明.png',
            '01.jpg',
            '02.jpg',
            '03.jpg',
            '04.jpg',
            '05.jpg',
            '06.jpg'
        ],

        _firstMaterialIndex: 0,
        _sceneMaterial: null,
        _sceneMaterialList:
        [
            "normal",
            "noise"
        ],

        _firstToolIndex: 1,
        _toolIndex: 0,
        _toolIndexTemp: 0,
        _toolList:
        {
            "none": 0,
            "shape":1,
            "billboard":2
        },

        init: function(canvas, engine)
        {
            _canvas = canvas;
            _engine = engine;
            _scene = createScene();

            //applySkybox(_scene);


            self.debugLayerUpdate();
            self.wireLayerUpdate();
            self.cameraBetaLimitUpdate();

            self.materialUpdate(self._sceneMaterialList[self._firstMaterialIndex]);
            self.textureUpdate(self._textureList[self._firstTextureIndex]);


            setupGUI();

            PostProcessLib.init(engine, _scene, _arcCamera);

            ShapeEditor.init(_scene);
            BillboardManager.init(_scene);



            self.setTool(self._firstToolIndex);


            _engine.runRenderLoop(function ()
            {
                _scene.render();
            });


            function createScene()
            {
                var scene = new BABYLON.Scene(engine);
                scene.clearColor = new BABYLON.Color3(0,0,0);

                MaterialLib.init(scene);


                var camera = _arcCamera = new BABYLON.ArcRotateCamera("camera1", 0, 0, 0, new BABYLON.Vector3(0, 0, -1), scene);
                //camera.fov = .8;
                camera.setTarget(new BABYLON.Vector3(0,0,0));
                camera.attachControl(canvas, true, false);

                camera.angularSensibilityX = 2500;
                camera.angularSensibilityY = 2500;


                camera.upperRadiusLimit = SCENE_SIZE - 2;
                camera.lowerRadiusLimit = camera.radius = .1;

                //console.log(camera.zoomOnFactor);


                _mainSphere = buildAsImage(scene);
                _wireSphere = buildWireSphere(scene);

                KeyboardControl.add('ctrl', KeyCodeDic.ctrl,
                {
                    onKeyDown: function()
                    {
                        _arcCamera.detachControl(_canvas);
                    },

                    onKeyUp: function()
                    {
                        _arcCamera.attachControl(_canvas, true, false);
                    }
                });

                KeyboardControl.add("ctrl+Z", "Z".charCodeAt(0),
                {
                    onKeyDown: function()
                    {
                        if(KeyboardControl.funcKeysDown.ctrl) ShapeEditor.requestToLastStep();
                    }
                }).add("delete", KeyCodeDic.delete,
                {
                    onKeyDown: function()
                    {
                        ShapeEditor.clearEditingObject();
                    }
                });


                scene.onPointerUp = function (event)
                {
                    /*
                    if(event.ctrlKey)
                    {
                        event.preventDefault();
                        event.stopPropagation();

                        var pickinfo = scene.pick(event.clientX, event.clientY);
                        //console.log(pickinfo.getTextureCoordinates());
                        //console.log(pickinfo);

                        if(pickinfo.pickedMesh._editType == 'background')
                        {
                            ShapeEditor.editAtPoint(pickinfo.pickedPoint, pickinfo.getTextureCoordinates());
                        }
                        else if(pickinfo.pickedMesh._editType == "editorMesh")
                        {
                            ShapeEditor.edit(pickinfo.pickedMesh._editSerial);
                        }
                    }
                    */
                    if(event.ctrlKey && self._toolIndex == 1)
                    {
                        var pickinfo = scene.pick(event.clientX, event.clientY);
                        //console.log(pickinfo.getTextureCoordinates());
                        //console.log(pickinfo);

                        if(pickinfo.pickedMesh._editType == 'background')
                        {
                            ShapeEditor.editAtPoint(pickinfo.pickedPoint, pickinfo.getTextureCoordinates());
                        }
                        else if(pickinfo.pickedMesh._editType == "editorMesh")
                        {
                            ShapeEditor.edit(pickinfo.pickedMesh._editSerial);
                        }
                    }
                };

                scene.onPointerMove = function(event)
                {
                    event.preventDefault();
                    event.stopPropagation();
                };

                scene.registerBeforeRender(function()
                {
                    //if(engine.getAlphaMode() != BABYLON.Engine.ALPHA_COMBINE)
                    //{
                    //    engine.setAlphaMode(BABYLON.Engine.ALPHA_COMBINE);
                    //}
                });

                scene.registerAfterRender(function()
                {
                });


                KeyboardControl.add("zoomOut", 109, function()
                {
                    //scene.activeCamera.alpha += 1;
                });

                KeyboardControl.add("zoomOut", 107, function()
                {
                    //scene.activeCamera.alpha -= 1;
                });

                return scene;
            }
        },

        debugLayerUpdate: function()
        {
            (self._debugLayerOn)? _scene.debugLayer.show(): _scene.debugLayer.hide();
        },

        wireLayerUpdate: function()
        {
            _wireSphere.setEnabled(self._wireLayerOn);
        },

        cameraBetaLimitUpdate: function()
        {
            var dArc = Math.PI*self._cameraBetaLimit/180;
            _arcCamera.upperBetaLimit = Math.PI*.5 + dArc;
            _arcCamera.lowerBetaLimit = Math.PI*.5 - dArc;
        },

        textureUpdate: function(v)
        {
            if(v) self._textureFile = v;

            var textureName = self._textureFile,
                texture = _textureDic[textureName],
                mat = _mainSphere.material;
            
            if(!texture)
            {
                texture = _textureDic[textureName] = new BABYLON.Texture("textures/" + textureName, _scene);
            }


            if(textureName == self._textureList[1])
            {
                texture.hasAlpha = true;

                mat.opacityTexture = texture;

            }
            else
            {
                mat.opacityTexture = null;

                //mat.setTexture("textureSampler", texture);
            }
            
            if(mat.constructor.name == 'StandardMaterial')
            {
                mat.diffuseTexture = texture;
            }
            else if(mat.constructor.name == 'ShaderMaterial')
            {
                mat.setTexture('textureSampler', texture);
            }

            //mat.alpha = .5;
        },

        materialUpdate: function(v)
        {
            if(v) self._sceneMaterial = v;

            _sceneSphere.material = MaterialLib.getMaterial(v);

            if(self._textureFile) self.textureUpdate();
        },

        setTool: function(index)
        {
            _gui.tool.setValue(index);
        },

        toolUpdate: function(v)
        {
            var oldIndex = self._toolIndex;
            self._toolIndex = self._toolIndexTemp;

            if(oldIndex == 0)
            {
                //_arcCamera.detachControl(_canvas);
            }
            else if(oldIndex == 1)
            {
                ShapeEditor.disable();
            }
            else if(oldIndex == 2)
            {

            }

            if(self._toolIndex == 0)
            {
                //_arcCamera.attachControl(_canvas, true, false);
            }
            if(self._toolIndex == 1)
            {
                ShapeEditor.enable();

            }
            else if(self._toolIndex == 2)
            {

            }
        }
    };

    function setupGUI()
    {
        var gui = Main.gui,
            folder = gui.addFolder('場景');

        folder.add(self, '_textureFile', self._textureList).name("貼圖").onChange(self.textureUpdate);
        folder.add(self, '_sceneMaterial', self._sceneMaterialList).name("著色器").onChange(self.materialUpdate);
        folder.add(self, '_cameraBetaLimit').min(0).max(90).step(1).name('鏡頭上下角度限制').onChange(self.cameraBetaLimitUpdate);
        folder.add(self, '_wireLayerOn').name('格線').onChange(self.wireLayerUpdate);
        folder.add(self, '_debugLayerOn').name("DebugLayer").onChange(self.debugLayerUpdate);

        _gui =
        {
            folder: folder,
            tool: folder.add(self, '_toolIndexTemp', self._toolList).name("編輯模式").onChange(self.toolUpdate)
        };

        folder.open();
    }


    function buildWireSphere(scene)
    {
        var wireSphere = new BABYLON.Mesh.CreateSphere("wire sphere", SPHERE_SEGMENTS, SCENE_SIZE*2, scene);
        wireSphere.material = MaterialLib.getMaterial('wireframe');

        wireSphere.isPickable = false;

        return wireSphere;
    }

    function buildAsImage(scene)
    {
        var sphere = _sceneSphere = new BABYLON.Mesh.CreateSphere("sphere", SPHERE_SEGMENTS, SCENE_SIZE*2, scene);
        sphere.scaling.y = -1;

        sphere._editType = 'background';

        sphere.isBlocked = true;

        //sphere.material = MaterialLib.getMaterial('normal');

        return sphere;
    }

    function applySkybox(scene)
    {
        var skyMaterial = new BABYLON.SkyMaterial('skyMaterial', scene);
        skyMaterial.backFaceCulling = false;
        skyMaterial.luminance = .1;
        skyMaterial.inclination = .6;

        var skyBox = BABYLON.Mesh.CreateBox('skybox', 500, scene);
        skyBox.material = skyMaterial;
    }

}());