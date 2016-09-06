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
        _mainSphere,

        _isCameraControlOn = false,
        _isDragging = false,
        _draggingMesh,

        $imageInput;

    var _gui;

    var _textureDic = {};

    var self = window.SphereScene =
    {
        _gui: null,

        _debugLayerOn: false,

        _rotationY: 0,

        _wireLayerOn: false,

        _cameraBetaLimit: 25,
        _startCameraRadius: 75,

        _loadedImageSrc: null,
        _backgroundImageIsDataUrl: false,

        _firstTextureIndex: 0,
        _textureFileName: null,
        _textureList:
        [
            "外部載入圖片",
            "Scene360_0825_01.jpg",
            'Scene360.jpg',
            '360TEST_02.jpg',
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

        _firstToolIndex: 2,
        _toolIndex: 0,
        _toolIndexTemp: 0,
        _toolList:
        {
            "檢視": 0,
            "shape":1,
            "billboard":2,
            "light": 3
        },

        _shapeDisplaying: true,
        _billboardDisplaying: true,

        init: function(canvas, engine, onReady)
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

            setupImageInput();

            setupGUI();

            PostProcessLib.init(engine, _scene, _arcCamera);

            ShapeEditor.init(_scene);
            BillboardEditor.init(_scene, SCENE_SIZE);
            LightEditor.init(_scene);

            self.setTool(self._firstToolIndex);


            _engine.runRenderLoop(function ()
            {
                _scene.render();
            });

            if(onReady) onReady.call();


            function createScene()
            {
                var scene = new BABYLON.Scene(engine);
                scene.clearColor = new BABYLON.Color3(0,0,0);

                //console.log(scene.actionManager);
                //scene.actionManager = new BABYLON.ActionManager(scene);

                MaterialLib.init(scene);


                var camera = _arcCamera = new BABYLON.ArcRotateCamera("camera1", 0, 0, 0, new BABYLON.Vector3(0, 0, -1), scene);
                //camera.fov = .8;
                camera.setTarget(new BABYLON.Vector3(0,0,0));

                camera.angularSensibilityX = 2500;
                camera.angularSensibilityY = 2500;


                camera.upperRadiusLimit = SCENE_SIZE - 10;
                camera.lowerRadiusLimit = .1;
                camera.radius = self._startCameraRadius;

                camera.alpha = Math.PI *1.90;


                scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
                scene.fogDensity = 0.0018;
                scene.fogColor = new BABYLON.Color3(0.9, 0.9, 0.85);

                //console.log(camera.zoomOnFactor);

                self.setCameraControlOn(true);

                _mainSphere = buildAsImage(scene);
                _wireSphere = buildWireSphere(scene);

                KeyboardControl.add('ctrl', KeyCodeDic.ctrl,
                {
                    onKeyDown: function()
                    {
                        if(!_isDragging) self.setCameraControlOn(false);
                    },

                    onKeyUp: function()
                    {
                        if(!_isDragging) self.setCameraControlOn(true);
                    }
                });

                scene.onPointerDown = function(event)
                {
                    if(self._toolIndex != 0)
                    {
                        if(event.ctrlKey)
                        {
                            var backgrounPickinfo = scene.pick(event.clientX, event.clientY, function(mesh)
                            {
                                return (mesh.isPickable && mesh.name == 'background');
                            });
                            pickedMesh = backgrounPickinfo.pickedMesh;

                            if(pickedMesh)
                            {
                                if(self._toolIndex == 2)
                                {
                                    BillboardEditor.createEmptyObject(backgrounPickinfo.pickedPoint);
                                }
                                else if(self._toolIndex == 1)
                                {
                                    ShapeEditor.editAtPoint(backgrounPickinfo.pickedPoint, backgrounPickinfo.getTextureCoordinates());
                                }
                                else if(self._toolIndex == 3)
                                {
                                    LightEditor.createLight(backgrounPickinfo.pickedPoint, true);
                                }
                            }
                        }
                        else
                        {
                            var nodePickinfo = scene.pick(event.clientX, event.clientY, function(mesh)
                            {
                                return (mesh.isPickable && mesh.name == 'billboardTargetNode');
                            });


                            if(nodePickinfo.pickedMesh)
                            {
                                _isDragging = true;
                                self.setCameraControlOn(false);
                                _draggingMesh = nodePickinfo.pickedMesh;
                                //console.log("check: " + myPickinfo.pickedMesh._editSerial);
                            }
                            else
                            {

                                var objectPickinfo = scene.pick(event.clientX, event.clientY, function(mesh)
                                {
                                    return (mesh.isPickable && (mesh.name == 'billboard' || mesh.name == 'shape' || mesh.name == 'lightNode'));
                                });


                                var pickedMesh = objectPickinfo.pickedMesh;

                                if(pickedMesh)
                                {
                                    if(pickedMesh.name == 'billboard')
                                    {
                                        self.setTool(2);
                                        BillboardEditor.edit(pickedMesh._editSerial);
                                    }
                                    else if(pickedMesh.name == 'shape')
                                    {
                                        self.setTool(1);
                                        ShapeEditor.edit(pickedMesh._editSerial);
                                    }
                                    else if(pickedMesh.name == 'lightNode')
                                    {
                                        self.setTool(3);
                                        LightEditor.edit(pickedMesh._editSerial);
                                    }
                                }
                            }
                        }
                    }
                };

                scene.onPointerMove = function(event)
                {

                    if(_isDragging)
                    {
                        if(self._toolIndex == 2)
                        {
                            var myPickinfo = scene.pick(event.clientX, event.clientY, function(mesh)
                            {
                                return (mesh.isPickable && mesh.name == 'background');
                            });

                            if(myPickinfo.pickedMesh)
                            {
                                BillboardEditor.moveTargetTo(myPickinfo.pickedPoint, myPickinfo.getTextureCoordinates())
                            }

                            //ShapeEditor.editAtPoint(pickinfo.pickedPoint, pickinfo.getTextureCoordinates());
                        }
                    }
                };


                scene.onPointerUp = function (event)
                {
                    if(_isDragging)
                    {
                        _isDragging = false;
                        self.setCameraControlOn(true);

                    }
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

        setCameraControlOn: function(b)
        {
            if(b == _isCameraControlOn) return;
            _isCameraControlOn = b;

            if(_isCameraControlOn)
            {
                _arcCamera.attachControl(_canvas, true, false);
            }
            else
            {
                _arcCamera.detachControl(_canvas);
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
            if(v) self._textureFileName = v;

            //console.log("v = " + v);

            self._backgroundImageIsDataUrl = (self._textureFileName ==  self._textureList[0]);

            var textureName = self._textureFileName,
                texture = _textureDic[textureName],
                mat = _mainSphere.material;
            
            if(!texture)
            {
                if(self._backgroundImageIsDataUrl)
                {
                    //console.log("this should't be executed");
                    texture = _textureDic[textureName] = new BABYLON.Texture(null, _scene);
                }
                else
                {
                    texture = _textureDic[textureName] = new BABYLON.Texture("textures/" + textureName, _scene);
                }
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

            if(self._textureFileName) self.textureUpdate();
        },

        setTool: function(index)
        {
            if(this._toolIndex == index) return;

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
                BillboardEditor.disable();
            }
            else if(oldIndex == 3)
            {
                LightEditor.disable();
            }

            if(self._toolIndex == 0)
            {
                //_arcCamera.attachControl(_canvas, true, false);
                LightEditor.nodeContainer.setEnabled(false);
            }
            if(self._toolIndex == 1)
            {
                ShapeEditor.enable();
                LightEditor.nodeContainer.setEnabled(true);
            }
            else if(self._toolIndex == 2)
            {
                BillboardEditor.enable();
                LightEditor.nodeContainer.setEnabled(true);
            }
            else if(self._toolIndex == 3)
            {
                LightEditor.enable();
                LightEditor.nodeContainer.setEnabled(true);
            }
        },

        shapeDisplaying: function(v)
        {
            ShapeEditor.container.setEnabled(v);
        },

        billboardDisplaying: function(v)
        {
            BillboardEditor.container.setEnabled(v);
        },

        triggerChangeImage: function()
        {
            $imageInput[0].value = null;
            $imageInput[0].click();
        },

        applyBase64Background: function(imageSrc)
        {
            var textureName = self._textureList[0];

            self._loadedImageSrc = imageSrc;

            _textureDic[textureName] = new BABYLON.Texture("data:background"+new Date().getTime(), _scene, null, true, null, null, null, imageSrc, true);

            _gui.map.setValue(textureName);
        },

        getBackgroundData: function()
        {
            //var isDataUrl = self._backgroundImageIsDataUrl;
            var imageSrc = self._backgroundImageIsDataUrl? self._loadedImageSrc: "textures/" + self._textureFileName;

            if(imageSrc == null) return null;

            var obj = ImageObject.HandleImageSrc(imageSrc, self._backgroundImageIsDataUrl);
            var ext = obj.imageHead == DataManager.PNG_HEAD? '.png': '.jpg';

            return new ImageObject('background'+ext, 'textures/', obj.imageSrc, self._backgroundImageIsDataUrl, obj.imageHead);
        },

        updateSeceneRotation: updateSeceneRotation

    };

    function setupGUI()
    {
        var gui = Main.gui,
            folder = gui.addFolder('場景');


        //console.log(f);

        _gui =
        {
            folder: folder,
            triggerChangeImage: folder.add(self, "triggerChangeImage").name('載入場景圖片'),
            rotationY: folder.add(self, "_rotationY").min(0).max(360).name('場景旋轉角度').listen().onChange(updateSeceneRotation),
            map: folder.add(self, '_textureFileName', self._textureList).name("貼圖").onChange(self.textureUpdate),
            shader: folder.add(self, '_sceneMaterial', self._sceneMaterialList).name("著色器").onChange(self.materialUpdate),
            cameraBetaLimit: folder.add(self, '_cameraBetaLimit').min(0).max(90).step(1).name('鏡頭角度限制').onChange(self.cameraBetaLimitUpdate),
            cameraRadiusLimit: folder.add(_arcCamera, 'radius').min(_arcCamera.lowerRadiusLimit).max(_arcCamera.upperRadiusLimit).step(1).name('鏡頭距離').listen(),
            grid: folder.add(self, '_wireLayerOn').name('格線').onChange(self.wireLayerUpdate),
            shapeVisible: folder.add(self, '_shapeDisplaying').name('Shape 顯示').onChange(self.shapeDisplaying),
            billboardVisible: folder.add(self, '_billboardDisplaying').name('Billboard 顯示').onChange(self.billboardDisplaying),
            debugLayer: folder.add(self, '_debugLayerOn').name("DebugLayer").onChange(self.debugLayerUpdate),
            tool: folder.add(self, '_toolIndexTemp', self._toolList).name("編輯模式").onChange(self.toolUpdate)
        };

        self._gui = _gui;

        folder.open();
    }



    function setupImageInput()
    {
        $imageInput = $("#scene-image-input");

        Tools.setupImageInput($imageInput[0], function(imageSrc)
        {
            self.applyBase64Background(imageSrc);
        });
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
        var sphere = _sceneSphere = new BABYLON.Mesh.CreateSphere("background", SPHERE_SEGMENTS, SCENE_SIZE*2, scene);
        sphere.scaling.y = -1;
        //sphere.visibility = .99999;
        //sphere.alphaIndex = 0;

        return sphere;
    }

    function updateSeceneRotation()
    {
        var deg = self._rotationY;
        _mainSphere.rotation.y = deg/180*Math.PI;
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