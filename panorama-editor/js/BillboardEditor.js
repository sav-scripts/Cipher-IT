/**
 * Created by sav on 2016/8/17.
 */
(function(){

    var _scene,
        _gui,
        _guiFolder,
        _guiItems,

        _isEditModeOn = false,
        _hintText = '按住 Ctrl 編輯 Billboard',

        _sceneSize = 200,

        _serial = 0,
        _editingObject,
        _editorObjectDic = {},

        $imageInput = null,

        _isEnabled = false;

    var self = window.BillboardEditor =
    {
        renderingGroupId: 1,
        editorRenderingGroupId: 3,

        container: null,

        nodeSample: null,
        focusNodeSample: null,

        sceneSize: 200,

        init: function(scene, sceneSize)
        {
            _scene = scene;
            _sceneSize = sceneSize;


            BillboardObject.sceneSize = _sceneSize;

            this.container = new BABYLON.Mesh("shape container", _scene);
            this.container.renderingGroupId = this.renderingGroupId;
            this.container.isPickable = false;

            this.nodeSample = Tools.createNodeSample(_scene, BABYLON.Color3.Blue());
            this.focusNodeSample = Tools.createNodeSample(_scene, BABYLON.Color3.Red(), 2);

            this.nodeSample.parent = this.container;
            this.nodeSample.renderingGroupId = this.editorRenderingGroupId;

            this.focusNodeSample.parent = this.container;
            this.focusNodeSample.renderingGroupId = this.editorRenderingGroupId;


            //self.addSprite("./textures/d1.png", 0, -15, 150);
            createObject("./textures/d2.png", 0, 0, -200);
            createObject("./textures/d3.png", 200, 0, 0);
            createObject("./textures/d4.png", -200, 0, 0);

            //self.addSprite("./textures/popu02.png", 0, 5, 150,.1);
            createObject("./textures/char.png", 0, 0, 200);
            //self.addSprite("./textures/popu02.png", 0, 5, 150,.1);

            setupImageInput();
            setupGUI();


            KeyboardControl.add("BillboardEditor complete", KeyCodeDic.space,
            {
                onKeyUp: function()
                {
                    if(_isEditModeOn && _editingObject)
                    {
                        self.completeEdit();
                    }
                }
            }).add("BillboardEditor delete", KeyCodeDic.delete,
            {
                onKeyDown: function()
                {
                    if(_isEnabled) self.deleteEditingObject();
                }
            });

        },

        enable: function()
        {
            if(_isEnabled) return;
            _isEnabled = true;

            $(_guiFolder.domElement).css("display", "block");
        },

        disable: function()
        {
            if(!_isEnabled) return;
            _isEnabled = false;
            
            $(_guiFolder.domElement).css("display", "none");

            if(_isEditModeOn && _editingObject)
            {
                self.completeEdit();
            }
        },

        createEmptyObject: createEmptyObject,

        edit: function(serial)
        {
            //console.log("edit on: " + serial);

            //console.log(window.prompt("test"));

            if(_editingObject && _editingObject._serial == serial) return;

            if(_editorObjectDic[serial])
            {
                this._changeEditTarget(_editorObjectDic[serial]);
            }

            this._editModeOn();
        },

        moveTargetTo: function(targetPosition, targetUV)
        {
            if(!_editingObject) return;

            _editingObject.updatePosition(targetPosition);
        },

        _changeEditTarget: function(targetObject)
        {
            if(_editingObject == targetObject) return;

            if(_editingObject) _editingObject.setEnabled(false);

            _editingObject = targetObject;
            _editingObject.setEnabled(true);

            updateGUIItems(_editingObject);

        },

        _editModeOn: function()
        {
            if(_isEditModeOn) return;
            _isEditModeOn = true;
        },

        _editModeOff: function()
        {
            if(!_isEditModeOn) return;
            _isEditModeOn = false;

            updateFolderLabel(_hintText);
        },

        triggerChangeImage: function()
        {
            $imageInput[0].value = null;
            $imageInput[0].click();
        },

        deleteEditingObject: function()
        {
            if(_editingObject && confirm("確定要刪除這個 Billboard 嗎？"))
            {
                delete _editorObjectDic[_editingObject._serial];
                _editingObject.dispose();

                _editingObject = null;

                self.completeEdit();
            }
        },

        completeEdit: function()
        {
            if(_editingObject)
            {
                _editingObject.setEnabled(false);
                _editingObject = null;
            }

            updateGUIItems();

            self._editModeOff();
        }

    };

    function setupGUI()
    {
        _gui = Main.gui;
        _guiFolder = _gui.addFolder('billboardEditorFolder');

        updateFolderLabel(_hintText);

        $(_guiFolder.domElement).css("display", "none");
    }

    function setupImageInput()
    {
        $imageInput = $("#billboard-image-input");

        Tools.setupImageInput($imageInput[0], function(img)
        {
            if(_editingObject)
            {
                _editingObject.changeImage(img, true);
            }
        });
    }

    function updateGUIItems(editingObject)
    {

        if(_guiItems)
        {
            _guiItems.offsetX.remove();
            _guiItems.offsetY.remove();
            _guiItems.radius.remove();
            _guiItems.scale.remove();
            _guiItems.billboardMode.remove();
            _guiItems.changeImageBuggon.remove();
            _guiItems.deleteButton.remove();
            _guiItems.completeButton.remove();

            _guiItems = null;
        }



        if(_editingObject)
        {
            updateFolderLabel("編輯目標: #" + _editingObject._serial);

            _guiItems =
            {
                offsetX: _guiFolder.add(editingObject, "_offsetX"),
                offsetY: _guiFolder.add(editingObject, "_offsetY"),
                radius: _guiFolder.add(editingObject, "_radius"),
                scale: _guiFolder.add(editingObject, "_scale")
            };

            var obj =
            {
                "對準場景 Y 軸": 0,
                "對準鏡頭": 1,
                "對準場景中心": 2
            };

            // fix for dat gui chain bug
            _guiItems.offsetX = _guiItems.offsetX.min(0).max(1).step(.001).name("水平中心");
            _guiItems.offsetX.onChange(function(){ editingObject._updateGeom.call(editingObject);});

            _guiItems.offsetY = _guiItems.offsetY.min(0).max(1).step(.001).name("垂直中心");
            _guiItems.offsetY.onChange(function(){ editingObject._updateGeom.call(editingObject);});

            _guiItems.radius = _guiItems.radius.min(0).max(_sceneSize).step(.01).name("深度");
            _guiItems.radius.onChange(function()
            {
                _editingObject.updatePosition();
            });

            _guiItems.scale = _guiItems.scale.min(0).max(1).step(.001).name("縮放尺寸");
            _guiItems.scale.onChange(function(){ editingObject._updateGeom.call(editingObject);});

            _guiItems.billboardMode = _guiFolder.add(_editingObject, "_billboardMode", obj).name("對準方式").onChange(function()
            {
                _editingObject.updateBillboardMode();
            });

            _guiItems.changeImageBuggon = _guiFolder.add(self, "triggerChangeImage").name("改變圖片");
            _guiItems.deleteButton = _guiFolder.add(self, "deleteEditingObject").name("刪除 (Delete)");
            _guiItems.completeButton = _guiFolder.add(self, "completeEdit").name("完成 (SPACEBAR)");

            _guiFolder.open();
        }
    }

    function createEmptyObject(position)
    {
        if(!_isEnabled) return;

        _serial++;
        _editorObjectDic[_serial] = new BillboardObject(_serial, _scene, position, _sceneSize);

        self.edit(_serial);
    }

    function createObject(imageSrc, x, y, z, scale)
    {
        _serial++;
        _editorObjectDic[_serial] = new BillboardObject(_serial, _scene, new BABYLON.Vector3(x, y, z), _sceneSize, imageSrc, scale);
    }

    function updateFolderLabel(label)
    {
        _gui.resetFolderLabel(_guiFolder.name, label);
    }

}());

(function(){

    const GLOBAL_SCALE = .2;

    window.BillboardObject = BillboardObject;

    BillboardObject.sceneSize = 200;

    function BillboardObject(serial, scene, targetVector, radius, imageSrc, scale)
    {
        var self = this;

        this._scene = scene;
        this._serial = serial;

        this._scale = scale || 1;

        radius = radius || BillboardObject.sceneSize;


        var mesh = self._mesh = new BABYLON.MeshBuilder.CreatePlane("billboard", {width: 16, height:16, updatable: true}, scene);
        mesh.parent = BillboardEditor.container;
        mesh.renderingGroupId = BillboardEditor.renderingGroupId;
        mesh.visibility = .3;

        mesh._editSerial = this._serial;



        var material = self._material = new BABYLON.StandardMaterial("material1", scene);
        material.emissiveColor = new BABYLON.Color3(1,1,1);

        material.backFaceCulling = false;

        mesh.material = material;

        this._centerNode = BillboardEditor.nodeSample.createInstance('centerNode');
        this._targetNode = BillboardEditor.focusNodeSample.createInstance('billboardTargetNode');

        this._centerNode.isPickable = false;

        this._targetNode._editSerial = this._serial;


        self.updatePosition(targetVector, radius);






        this._targetNode.actionManager = new BABYLON.ActionManager(scene);
        //var action = new BABYLON.Action(BABYLON.ActionManager.OnPointerOverTrigger);
        //var action2 = new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, mouseOutUnit);
        this._targetNode.actionManager.registerAction(new BABYLON.Action(BABYLON.ActionManager.OnPointerOverTrigger));
        //this._targetNode.actionManager.registerAction(new BABYLON.Action(BABYLON.ActionManager.OnPointerOutTrigger));

        //this._targetNode.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickDownTrigger, function()
        //{
        //    console.log("check");
        //}));




        if(imageSrc) self.changeImage(imageSrc);
    }

    BillboardObject.prototype =
    {
        _scene: null,

        _serial: 0,

        _mesh: null,

        _texture: null,
        _material: null,

        _scale: 1,
        _imageWidth: 0,
        _imageHeight: 0,

        _offsetX: .5,
        _offsetY:.5,

        _billboardMode: 0,

        _isEnabled: false,

        _targetNode: null,
        _centerNode: null,
        _lineMesh: null,

        _radius: 0,

        _targetVector: null,
        _targetPosition: null,
        _centerPosition: null,

        _isDisposed: false,

        setEnabled: function(b)
        {
            if(b === this._isEnabled) return;
            this._isEnabled = b;

            this._updateEnabled();
        },

        _updateEnabled: function()
        {
            if(this._isEnabled)
            {
                this._mesh.showBoundingBox = true;
                this._mesh.isPickable = false;

                this._lineMesh.setEnabled(true);
                this._targetNode.setEnabled(true);
                this._centerNode.setEnabled(true);

                this._targetNode.isPickable = true;

            }
            else
            {
                this._mesh.showBoundingBox = false;
                this._mesh.isPickable = true;

                this._lineMesh.setEnabled(false);
                this._targetNode.setEnabled(false);
                this._centerNode.setEnabled(false);

                this._targetNode.isPickable = false;
            }
        },

        changeImage: function(imageOrSrc, isDataURL)
        {
            var self = this;

            self._mesh.visibility = .3;

            if(this._texture)
            {
                this._texture.dispose();
                this._texture = null;
            }

            if(typeof  imageOrSrc === 'string')
            {
                var img = document.createElement("img");
                img.src = imageOrSrc;
                img.onload = function()
                {
                    build(img);
                };
            }
            else
            {
                build(imageOrSrc);
            }

            function build(img)
            {
                if(self._isDisposed) return;

                var texture;

                if(isDataURL)
                {
                    //Texture('data:my_image_name', scene, noMipmap, invertY, samplingMode, onLoad, onError, buffer, deleteBuffer);

                    texture = self._texture = new BABYLON.Texture("data:myimage", self._scene, null, true, null, null, null, img.src, true);
                }
                else
                {
                    texture = self._texture = new BABYLON.Texture(img.src, self._scene);
                }

                self._imageWidth = img.width;
                self._imageHeight = img.height;

                self._material.opacityTexture = texture;
                self._material.diffuseTexture = texture;

                self._updateGeom();

                self._mesh.visibility = 1;
            }
        },

        updatePosition: function(targetVector, radius)
        {
            radius = radius || this._radius;
            targetVector = targetVector || this._targetVector;

            this._targetVector = targetVector;
            this._radius = radius;

            var n = targetVector.normalize();

            this._targetPosition = n.scale(BillboardObject.sceneSize);
            this._centerPosition = n.scale(this._radius);

            this._mesh.position.x = this._centerNode.position.x = this._centerPosition.x;
            this._mesh.position.y = this._centerNode.position.y = this._centerPosition.y;
            this._mesh.position.z = this._centerNode.position.z = this._centerPosition.z;

            this._targetNode.position.x = this._targetPosition.x;
            this._targetNode.position.y = this._targetPosition.y;
            this._targetNode.position.z = this._targetPosition.z;

            this.updateLine();

            this._updateEnabled();

            this.updateBillboardMode();

        },

        updateBillboardMode: function()
        {
            if(this._billboardMode == 0)
            {
                this._mesh.billboardMode = BABYLON.Mesh.BILLBOARDMODE_NONE;
                var position = new BABYLON.Vector3(0, this._centerPosition.y, 0);
                this._mesh.lookAt(position);
            }
            else if(this._billboardMode == 1)
            {
                this._mesh.rotation = BABYLON.Vector3.Zero();
                this._mesh.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
                //this._mesh.lookAt(this._scene.activeCamera.position);
            }
            else if(this._billboardMode == 2)
            {
                this._mesh.billboardMode = BABYLON.Mesh.BILLBOARDMODE_NONE;
                //console.log(BABYLON.Vector3.Zero());
                this._mesh.lookAt(BABYLON.Vector3.Zero());
            }

        },

        updateLine: function()
        {
            if(this._lineMesh)
            {
                this._lineMesh.dispose();
                this._lineMesh = null;
            }

            var points = [BABYLON.Vector3.Zero(), this._targetPosition];

            var mesh = this._lineMesh = BABYLON.MeshBuilder.CreateDashedLines("shape line", {points:points, updateAble: false}, this._scene);

            mesh.renderingGroupId = BillboardEditor.editorRenderingGroupId;
            mesh.parent = BillboardEditor.container;

            mesh.isPickable = false;

            mesh.alpha = .46;
        },

        _updateGeom: function()
        {
            var self = this;

            var data = self._mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind),
                width = self._imageWidth * self._scale * GLOBAL_SCALE,
                height = self._imageHeight * self._scale * GLOBAL_SCALE;

            var left = -width*self._offsetX,
                right = width*(1-self._offsetX),
                top = -height*self._offsetY,
                bottom = height*(1-self._offsetY);

            data[0] = left;
            data[1] = top;

            data[3] = right;
            data[4] = top;

            data[6] = right;
            data[7] = bottom;

            data[9] = left;
            data[10] = bottom;

            self._mesh.updateVerticesData(BABYLON.VertexBuffer.PositionKind, data, true);
            //self._mesh.setVerticesData(BABYLON.VertexBuffer.PositionKind, data, true);
        },

        dispose: function()
        {
            if(this._centerNode) this._centerNode.dispose();
            if(this._targetNode) this._targetNode.dispose();
            if(this._mesh) this._mesh.dispose();
            if(this._lineMesh) this._lineMesh.dispose();

            if(this._texture) this._texture.dispose();
            if(this._material) this._material.dispose();
        }

    };


}());