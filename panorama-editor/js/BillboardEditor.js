/**
 * Created by sav on 2016/8/17.
 */
(function(){

    var _scene,
        _gui,
        _guiFolder,
        _guiItems,

        _isEditModeOn = false,
        _hintText = '按住 Ctrl 點擊畫面新增 Billboard',

        _sceneSize = 200,

        _serial = 0,
        _editingObject,
        _editorObjectDic = {},

        $imageInput = null,

        _isEnabled = false;

    var self = window.BillboardEditor =
    {
        objectDefaultRenderingOrder: 100,
        objectRenderingGroupId: 1,
        editorRenderingGroupId: 3,

        container: null,

        nodeSample: null,
        focusNodeSample: null,

        sceneSize: 200,

        getEditorObjectDic: function()
        {
            return _editorObjectDic;
        },

        setEditorRenderingGroupId: function(v)
        {
            self.editorRenderingGroupId = v;

            if(self.nodeSample) self.nodeSample.renderingGroupId = v;
            if(self.focusNodeSample) self.focusNodeSample.renderingGroupId = v;
        },

        init: function(scene, sceneSize)
        {
            _scene = scene;
            _sceneSize = sceneSize;


            BillboardObject.sceneSize = _sceneSize;

            this.container = new BABYLON.Mesh("shape container", _scene);
            this.container.isPickable = false;

            this.nodeSample = Tools.createNodeSample(_scene, BABYLON.Color3.Blue());
            this.focusNodeSample = Tools.createNodeSample(_scene, BABYLON.Color3.Red(), 2);

            this.nodeSample.parent = this.container;
            this.nodeSample.renderingGroupId = this.editorRenderingGroupId;

            this.focusNodeSample.parent = this.container;
            this.focusNodeSample.renderingGroupId = this.editorRenderingGroupId;


            //createObject("./textures/d2.png", 0, 0, -200);
            //createObject("./textures/d3.png", 200, 0, 0);
            //createObject("./textures/d4.png", -200, 0, 0);
            //createObject("./textures/char.png", 0, 0, 200);

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

            updateGUIItems();

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
        },

        clearAll: function()
        {
            var key, obj;
            for(key in _editorObjectDic)
            {
                obj = _editorObjectDic[key];
                obj.dispose();
            }

            _editorObjectDic = {};

            self.completeEdit();
        },

        getExportData: function()
        {
            var key, out, dataArray = [], imageArray = [];

            for(key in _editorObjectDic)
            {
                if(_editorObjectDic[key]._imageSrc)
                {
                    out = _editorObjectDic[key].getExportData();
                    dataArray.push(out.data);
                    imageArray.push(out.image);
                }
            }


            return {dataArray:dataArray, imageArray: imageArray};
        },

        applyImportData: function(dataArray, imageDic)
        {
            self.clearAll();

            _serial = 0;
            var i, obj;
            for(i=0;i<dataArray.length;i++)
            {
                obj = dataArray[i];

                var serial =obj.serial,
                    imagePath = DataManager.BILLBOARD_FOLDER_PATH + obj.image,
                    imageHead = obj.imageDataHead,
                    imageSrc = imageHead + imageDic[imagePath];

                //console.log(imageSrc);

                _editorObjectDic[serial] = new BillboardObject(serial, _scene, new BABYLON.Vector3(obj.targetX, obj.targetY, obj.targetZ), obj.radius, obj.scale, imageSrc, true, obj.offsetX, obj.offsetY, obj.renderingOrder);

                _serial = Math.max(_serial, serial);

            }


            _serial++;
            //console.log("_serial = " + _serial);
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

        Tools.setupImageInput($imageInput[0], function(imageSrcBase64)
        {
            if(_editingObject)
            {
                _editingObject.changeImage(imageSrcBase64, true);
            }
        });
    }

    function updateGUIItems()
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
            _guiItems.renderingOrder.remove();

            _guiItems = null;
        }

        if(_editingObject)
        {
            updateFolderLabel("編輯目標: #" + _editingObject._serial);

            _guiItems =
            {
                offsetX: _guiFolder.add(_editingObject, "_offsetX"),
                offsetY: _guiFolder.add(_editingObject, "_offsetY"),
                radius: _guiFolder.add(_editingObject, "_radius"),
                scale: _guiFolder.add(_editingObject, "_scale"),
                renderingOrder: _guiFolder.add(_editingObject, "_renderingOrder")
            };

            var obj =
            {
                "對準鏡頭 Y 軸": 0,
                "對準鏡頭 中心": 1
            };

            // fix for dat gui chain bug
            _guiItems.offsetX = _guiItems.offsetX.min(0).max(1).step(.001).name("水平中心");
            _guiItems.offsetX.onChange(function(){ _editingObject._updateGeom.call(_editingObject);});

            _guiItems.offsetY = _guiItems.offsetY.min(0).max(1).step(.001).name("垂直中心");
            _guiItems.offsetY.onChange(function(){ _editingObject._updateGeom.call(_editingObject);});

            _guiItems.radius = _guiItems.radius.min(0).max(_sceneSize).step(.01).name("3D 深度");
            _guiItems.radius.onChange(function()
            {
                _editingObject.updatePosition();
            });

            _guiItems.renderingOrder = _guiItems.renderingOrder.min(-10).max(10).step(1).name("圖層深度");
            _guiItems.renderingOrder.onChange(function()
            {
                _editingObject.updateRenderingOrder();
            });

            _guiItems.scale = _guiItems.scale.min(0).max(1).step(.001).name("縮放尺寸");
            _guiItems.scale.onChange(function(){ _editingObject._updateGeom.call(_editingObject);});

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

    //function createObject(imageSrc, x, y, z, scale)
    //{
    //    _serial++;
    //    _editorObjectDic[_serial] = new BillboardObject(_serial, _scene, new BABYLON.Vector3(x, y, z), _sceneSize, scale, imageSrc);
    //}

    function updateFolderLabel(label)
    {
        _gui.resetFolderLabel(_guiFolder.name, label);
    }

}());

(function(){

    const GLOBAL_SCALE = .2;

    window.BillboardObject = BillboardObject;

    BillboardObject.sceneSize = 200;

    function BillboardObject(serial, scene, targetVector, radius, scale, imageSrc, isDataUrl, offsetX, offsetY, renderingOrder)
    {
        var self = this;

        this._scene = scene;
        this._serial = serial;

        this._scale = scale || 1;

        if(offsetX === undefined) offsetX = .5;
        if(offsetY === undefined) offsetY = .5;

        this._offsetX = offsetX;
        this._offsetY = offsetY;

        this._renderingOrder = renderingOrder === undefined? 0: renderingOrder;

        radius = radius || BillboardObject.sceneSize;


        var mesh = self._mesh = new BABYLON.MeshBuilder.CreatePlane("billboard", {width: 16, height:16, updatable: true}, scene);
        mesh.parent = BillboardEditor.container;
        mesh.visibility = .3;

        self.updateRenderingOrder();

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
        this._targetNode.actionManager.registerAction(new BABYLON.Action(BABYLON.ActionManager.OnPointerOverTrigger));


        if(imageSrc) self.changeImage(imageSrc, isDataUrl);
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

        _renderingOrder: 0,
        updateRenderingOrder: function()
        {
            this._mesh.renderingGroupId = BillboardEditor.objectRenderingGroupId;
            this._mesh.alphaIndex = this._renderingOrder + BillboardEditor.objectDefaultRenderingOrder;
        },

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

        _imageSrc: null,
        _imageIsDataUrl : false,

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

        changeImage: function(imageSrc, isDataURL)
        {
            var self = this;

            self._mesh.visibility = .3;

            if(this._texture)
            {
                this._texture.dispose();
                this._texture = null;
            }

            this._imageSrc = imageSrc;
            this._imageIsDataUrl = Boolean(isDataURL);


            var texture;

            if(isDataURL)
            {
                // BABYLON.Texture.TRILINEAR_SAMPLINGMODE make more smooth result when texture scaled down
                //texture = self._texture = new BABYLON.Texture("data:billboard-" + self._serial + "-" + new Date().getTime(), self._scene, false, true, BABYLON.Texture.TRILINEAR_SAMPLINGMODE, onload, null, imageSrc, true);

                texture = self._texture = new BABYLON.Texture("data:billboard-" + self._serial + "-" + new Date().getTime(), self._scene, false, true, null, onload, null, imageSrc, true);
            }
            else
            {
                texture = self._texture = new BABYLON.Texture(imageSrc, self._scene, false, true, null, onload);
            }

            function onload()
            {
                if(self._isDisposed) return;

                var size = texture.getBaseSize();


                self._imageWidth = size.width;
                self._imageHeight = size.height;

                self._material.opacityTexture = texture;
                self._material.diffuseTexture = texture;

                self._updateGeom();

                self._mesh.visibility = .99999;
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
                this._mesh.billboardMode = BABYLON.Mesh.BILLBOARDMODE_Y;
                //this._mesh.lookAt(new BABYLON.Vector3(0, this._mesh.position.y, 0));
            }
            else if(this._billboardMode == 1)
            {
                this._mesh.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
                //this._mesh.lookAt(new BABYLON.Vector3(0, 0, 0));
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

            this._isDisposed = true;
        },

        getExportData: function()
        {
            var imageName = "billboard."+this._serial+".png";

            var obj = ImageObject.HandleImageSrc(this._imageSrc, this._imageIsDataUrl);

            return {
                data:
                {
                    serial: this._serial,
                    offsetX: this._offsetX,
                    offsetY: this._offsetY,
                    radius: this._radius,
                    scale: this._scale,
                    targetX: this._targetPosition.x,
                    targetY: this._targetPosition.y,
                    targetZ: this._targetPosition.z,
                    image: imageName,
                    imageDataHead: obj.imageHead,
                    renderingOrder: this._renderingOrder
                },
                image: new ImageObject(imageName, DataManager.BILLBOARD_FOLDER_PATH, obj.imageSrc, this._imageIsDataUrl, obj.imageHead)
            };

        }

    };


}());