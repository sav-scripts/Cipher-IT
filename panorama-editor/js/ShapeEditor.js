/**
 * Created by sav on 2016/8/15.
 */
(function(){

    var _scene,

        _gui,
        _guiFolder,
        _guiItems,

        _isEditModeOn = false,
        _hintText = "按住 Ctrl 點擊畫面新增 Shape",

        _serial = 0,
        _editingObject,
        _editorObjectDic = {},
        _editorObjectCache = [],

        _isEnabled = false;

    var self = window.ShapeEditor =
    {
        objectDefaultRenderingOrder: 100,
        objectRenderingGroupId: 1,
        editorRenderingGroupId: 3,

        container: null,

        nodeSample: null,
        focusNodeSample: null,

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

        init: function(scene)
        {
            _scene = scene;

            setupGUI();
            updateFolderLabel(_hintText);

            this.container = new BABYLON.Mesh("shape container", _scene);
            this.container.isPickable = false;

            this.nodeSample = Tools.createNodeSample(_scene, BABYLON.Color3.Blue());
            this.focusNodeSample = Tools.createNodeSample(_scene, BABYLON.Color3.Red());

            this.nodeSample.parent = this.container;
            this.nodeSample.renderingGroupId = this.editorRenderingGroupId;

            this.focusNodeSample.parent = this.container;
            this.focusNodeSample.renderingGroupId = this.editorRenderingGroupId;

            KeyboardControl.add("ShapeEditor complete", KeyCodeDic.space,
            {
                onKeyUp: function()
                {
                    if(_isEnabled && _isEditModeOn && _editingObject && _editingObject.getNumPoints() > 2)
                    {
                        self.completeEdit();
                    }
                }
            }).add("ShapeEditor toLastStep", "Z".charCodeAt(0),
            {
                onKeyDown: function()
                {
                    if(_isEnabled && KeyboardControl.funcKeysDown.ctrl && _editingObject) self.requestToLastStep();
                }
            }).add("ShapeEditor delete", KeyCodeDic.delete,
            {
                onKeyDown: function()
                {
                    if(_isEnabled) self.clearEditingObject();
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

            if(_isEditModeOn)
            {

                if(_editingObject.getNumPoints() > 2)
                {
                    this.completeEdit();
                }
                else
                {
                    _editingObject.clear();
                    self._editModeOff(true);
                }
            }

        },

        editAtPoint: function(point, uv)
        {
            if(!_isEditModeOn)
            {
                if(!_editingObject)
                {
                    if(_editorObjectCache.length)
                    {
                        _editingObject = _editorObjectCache.pop();
                    }
                    else
                    {
                        _serial++;
                        _editingObject = new ShapeObject(_serial, _scene);
                    }

                    if(_editingObject._mesh) _editingObject._mesh.isPickable = false;

                    _editorObjectDic[_editingObject.getSerial()] = _editingObject;

                    //updateFolderLabel("編輯中形狀: #" + _editingObject._serial);
                    updateGUIItems(_editingObject);
                }

                this._editModeOn();
            }

            _editingObject.setEnabled(true);
            _editingObject.addPoint(point, uv);
        },

        edit: function(serial)
        {
            //if(_editingObject) return;


            if(_editorObjectDic[serial])
            {
                if(_editingObject && _editingObject == _editorObjectDic[serial]) return;



                if(_editingObject)
                {
                    if(_editingObject._mesh) _editingObject._mesh.isPickable = true;
                    _editingObject.setEnabled(false);

                    if(_editingObject._points.length < 3)
                    {
                        _editingObject.clear();
                        _editorObjectCache.push(_editingObject);
                        delete _editorObjectDic[_editingObject.getSerial()];
                    }

                }

                _editingObject = _editorObjectDic[serial];
                _editingObject.setEnabled(true);

                if(_editingObject._mesh) _editingObject._mesh.isPickable = false;

                //updateFolderLabel("編輯中形狀: #" + _editingObject._serial);
                updateGUIItems(_editingObject);

                this._editModeOn();
            }
        },

        _editModeOn: function()
        {
            if(_isEditModeOn) return;
            _isEditModeOn = true;


            _guiFolder.open();

            //var key, object;
            //for(key in _editorObjectDic)
            //{
            //    object = _editorObjectDic[key];
            //    if(object._mesh) object._mesh.isPickable = false;
            //}

            self.update();
        },

        _editModeOff: function(putEditingObjectIntoCache)
        {
            if(!_isEditModeOn) return;
            _isEditModeOn = false;

            if(_editingObject)
            {

                if(_editingObject._mesh) _editingObject._mesh.isPickable = true;
                _editingObject.setEnabled(false);

                //if(putEditingObjectIntoCache)
                if(_editingObject._points.length < 3)
                {
                    _editorObjectCache.push(_editingObject);
                    delete _editorObjectDic[_editingObject.getSerial()];
                }

                _editingObject = null;
            }

            //var key, object;
            //for(key in _editorObjectDic)
            //{
            //    object = _editorObjectDic[key];
            //    if(object._mesh) object._mesh.isPickable = true;
            //}

            updateGUIItems();
            updateFolderLabel(_hintText);

            self.update();
        },

        update: function()
        {
            if(_isEditModeOn && _editingObject)
            {
                var numPoints = _editingObject.getNumPoints();

                if(_guiItems.toLastStep)
                {
                    _guiItems.toLastStep._active = (numPoints > 0);
                    $(_guiItems.toLastStep.__li).css("display", _guiItems.toLastStep._active? "block": "none");
                }

                if(_guiItems.complete)
                {
                    _guiItems.complete._active = (numPoints > 2);
                    $(_guiItems.complete.__li).css("display", _guiItems.complete._active? "block": "none");
                }

                if(_guiItems.deleteAll)
                {
                    _guiItems.deleteAll._active = (numPoints > 0);
                    $(_guiItems.deleteAll.__li).css("display", _guiItems.deleteAll._active? "block": "none");
                }
            }
            else
            {
                if(_guiItems)
                {
                    $(_guiItems.toLastStep.__li).css("display", "none");
                    $(_guiItems.complete.__li).css("display", "none");
                    $(_guiItems.deleteAll.__li).css("display", "none");
                }
            }
        },

        requestToLastStep: function()
        {

            if(_guiItems.toLastStep && _guiItems.toLastStep._active)
            {
                _editingObject.toLastStep();
            }
        },

        completeEdit: function()
        {
            //console.log('complete edit');
            //if(_guiItems && _guiItems.complete && _guiItems.complete._active)
            //{
            //    _editingObject.setEnabled(false);
                self._editModeOff();
            //}
        },

        clearEditingObject: function()
        {
            if(_editingObject && _guiItems.deleteAll && _guiItems.deleteAll._active)
            {
                if(confirm("確定要刪除這個形狀嗎？"))
                {
                    _editingObject.clear();
                    self._editModeOff(true);

                }
            }
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
            _editorObjectCache = [];

            self.completeEdit();
        },

        getExportData: function()
        {
            var key, out, dataArray = [];

            for(key in _editorObjectDic)
            {
                out = _editorObjectDic[key].getExportData();
                if(out)
                {
                    dataArray.push(out.data);
                }
            }


            return {dataArray:dataArray};
        },

        applyImportData: function(dataArray)
        {
            self.clearAll();

            //return;

            _serial = 0;
            var i, k, obj;

            for(i=0;i<dataArray.length;i++)
            {
                obj = dataArray[i];

                var serial = obj.serial,
                    vertices = obj.vertices,
                    uvs = obj.uvs,
                    numPoints = vertices.length/ 3,
                    position, uv, index;

                //console.log(imageSrc);
                //console.log(numPoints);

                //continue;

                var newObj = _editorObjectDic[serial] = new ShapeObject(serial, _scene, obj.renderingOrder);

                for(k=0;k<numPoints;k++)
                {
                    index = k*3;
                    position = new BABYLON.Vector3(vertices[index], vertices[index+1], vertices[index+2]);

                    index = k*2;
                    uv = new BABYLON.Vector2(uvs[index], uvs[index+1]);

                    newObj.addPoint(position, uv, true);
                }

                newObj.updateLine();
                newObj.updateMesh();

                newObj._mesh.isPickable = true;

                _serial = Math.max(_serial, serial);
            }

            _serial++;
        }
    };

    function setupGUI()
    {
        _gui = Main.gui;
        _guiFolder = _gui.addFolder('shapeEditorFolder');
        $(_guiFolder.domElement).css("display", "none");

        //self.update();
    }

    function updateGUIItems(editingObject)
    {

        if(_guiItems)
        {
            _guiItems.renderingOrder.remove();

            _guiItems.toLastStep.remove();
            _guiItems.deleteAll.remove();
            _guiItems.complete.remove();

            _guiItems = null;
        }

        if(editingObject)
        {
            updateFolderLabel("編輯中形狀: #" + _editingObject._serial);

            _guiItems =
            {
                renderingOrder: _guiFolder.add(_editingObject, "_renderingOrder")
            };

            _guiItems.renderingOrder = _guiItems.renderingOrder.min(-10).max(10).step(1).name("圖層深度");
            _guiItems.renderingOrder.onChange(function()
            {
                editingObject.updateRenderingOrder();
            });

            _guiItems.toLastStep = _guiFolder.add(self, "requestToLastStep").name("刪除點 (Ctrl+Z)");
            _guiItems.deleteAll = _guiFolder.add(self, "clearEditingObject").name("刪除全部 (Delete)");
            _guiItems.complete = _guiFolder.add(self, "completeEdit").name("完成 (SPACEBAR)");


            _guiFolder.open();
        }
    }

    function updateFolderLabel(hintText)
    {
        _gui.resetFolderLabel(_guiFolder.name, hintText);
    }

}());

(function(){

    window.ShapeObject = ShapeObject;

    function ShapeObject(serial, scene, renderingOrder)
    {
        this._serial = serial;
        this._scene = scene;

        this._renderingOrder = renderingOrder === undefined? 0: renderingOrder;

        this._points = [];
        this._uvs = [];
        this._nodes = [];

        this._focusNode = ShapeEditor.focusNodeSample.createInstance('nodeInstance');
        this._focusNode.setEnabled(false);
    }

    ShapeObject.prototype =
    {
        _scene: null,

        _points: null,
        _uvs: null,

        _meshVertices: null,
        _meshUVs: null,

        _nodes: null,
        _lineMesh: null,
        _focusNode: null,

        _renderingOrder: 0,
        updateRenderingOrder: function()
        {
            if(this._mesh)
            {
                this._mesh.renderingGroupId = ShapeEditor.objectRenderingGroupId;
                this._mesh.alphaIndex = this._renderingOrder + ShapeEditor.objectDefaultRenderingOrder;
            }
        },

        _isEnabled: false,

        _mesh: null,

        _serial: 0,
        getSerial: function(){ return this._serial },

        toString: function()
        {
            return "ShapeObject #" + this._serial;
        },

        getNumPoints: function(){ return this._nodes.length; },

        addPoint: function(position, uv, skipUpdate)
        {
            if(this._nodes.length)
            {
                var lastNode = this._nodes[this._nodes.length-1];
                lastNode.setEnabled(this._isEnabled);
            }

            var node = ShapeEditor.nodeSample.createInstance('nodeInstance');
            this._focusNode.position.x = node.position.x = position.x;
            this._focusNode.position.y = node.position.y = position.y;
            this._focusNode.position.z = node.position.z = position.z;


            node.parent = ShapeEditor.container;

            node.setEnabled(false);

            node.isPickable = false;

            this._points.push(position);
            this._uvs.push(uv);
            this._nodes.push(node);

            this._focusNode.setEnabled(this._isEnabled);

            if(!skipUpdate)
            {
                this.updateLine();
                this.updateMesh();

                ShapeEditor.update();
            }
        },

        toLastStep: function()
        {
            var node;

            if(this._points.length)
            {
                this._points.pop();
                this._uvs.pop();
                node = this._nodes.pop();
                node.dispose();
            }

            if(!this._nodes.length)
            {
                this._focusNode.setEnabled(false);
                ShapeEditor._editModeOff(true);
            }
            else
            {
                node = this._nodes[this._nodes.length-1];
                this._focusNode.position.x = node.position.x;
                this._focusNode.position.y = node.position.y;
                this._focusNode.position.z = node.position.z;

                node.setEnabled(false);

                ShapeEditor.update();
            }

            this.updateLine();
            this.updateMesh();
        },

        setEnabled: function(b)
        {
            if(b === this._isEnabled) return;
            this._isEnabled = b;

            this._updateHintNodes();
        },

        _updateHintNodes: function()
        {
            var i, node;

            if(this._isEnabled)
            {
                if(this._nodes.length)
                {
                    for(i=0;i<this._nodes.length-1;i++)
                    {
                        node = this._nodes[i];
                        node.setEnabled(true);

                        this._focusNode.setEnabled(true);
                        if(this._lineMesh) this._lineMesh.setEnabled(true);
                    }
                }
            }
            else
            {
                for(i=0;i<this._nodes.length;i++)
                {
                    node = this._nodes[i];
                    node.setEnabled(false);

                    this._focusNode.setEnabled(true);
                }

                this._focusNode.setEnabled(false);
                if(this._lineMesh) this._lineMesh.setEnabled(false);
            }
        },

        updateLine: function()
        {
            if(this._lineMesh)
            {
                this._lineMesh.dispose();
                this._lineMesh = null;
            }

            if(this._nodes.length >= 2)
            {
                var mesh = this._lineMesh = BABYLON.MeshBuilder.CreateLines("shape line", {points:this._points, updateAble: false}, this._scene);

                mesh.renderingGroupId = ShapeEditor.editorRenderingGroupId;
                mesh.parent = ShapeEditor.container;

                mesh.setEnabled(this._isEnabled);
            }
        },

        updateMesh: function()
        {
            this.clearMesh();

            if(this._points.length >= 3)
            {
                var minU = 1,
                    maxU = 0,
                    minV = 1,
                    maxV = 0;

                //console.log(triangList);

                var positions = [],
                    indices = [],
                    uvs = [],
                    uvs2 = [];

                var i,
                    point,
                    triangle,
                    uv,
                    uv2Scale = 10,
                    positionScale = .9999,
                    tempUV = [];

                for(i=0;i<this._points.length;i++)
                {
                    point = this._points[i];
                    uv = this._uvs[i];

                    positions.push(point.x*positionScale, point.y*positionScale, point.z*positionScale);
                    uvs.push(uv.x, uv.y);
                    uvs2.push(uv.x*uv2Scale*2, uv.y*uv2Scale);

                    tempUV.push(new BABYLON.Vector2(uv.x, uv.y));

                    minU = Math.min(minU, uv.x);
                    maxU = Math.max(maxU, uv.x);
                    minV = Math.min(minV, uv.y);
                    maxV = Math.max(maxV, uv.y);
                }

                this._meshVertices = positions.concat([]);
                this._meshUVs = uvs.concat([]);

                //console.log(Math.abs(maxU - minU));

                if(Math.abs(maxU - minU) > .8)
                {
                    for(i in tempUV)
                    {
                        uv = tempUV[i];
                        if(uv.x < .5) uv.x += 1;
                    }
                }

                //console.log("minU = " + minU);
                //console.log("maxU = " + maxU);
                //console.log("minV = " + minV);
                //console.log("maxV = " + maxV);


                //var dU = maxU - minU,
                //    dV = maxV - minV;
                //for(i=0;i<this._points.length;i++)
                //{
                //    uv = this._uvs[i];
                //    uvs2.push((uv.x-minU)/dU, (uv.y-minV)/dV);
                //}


                //var example_data = [ this._points ];
                //var example_data = [ this._uvs ];

                //console.log(tempUV);

                var example_data = [ tempUV ];

                var myTriangulator = new PNLTRI.Triangulator();
                var triangList = myTriangulator.triangulate_polygon( example_data );

                for(i=0;i<triangList.length;i++)
                {
                    triangle = triangList[i];
                    indices.push(triangle[0], triangle[1], triangle[2]);
                }


                var vertexData = new BABYLON.VertexData();
                vertexData.positions = positions;
                vertexData.indices = indices;
                vertexData.uvs = uvs;
                vertexData.uvs2 = uvs2;
                //vertexData.normals = normals;

                var mesh = new BABYLON.Mesh("shape", this._scene);
                mesh.position = BABYLON.Vector3.Zero();

                //var mat = new BABYLON.StandardMaterial("randomMesh", this._scene);
                //mat.emissiveColor = new BABYLON.Color3(1,1,1);
                //mesh.material = mat;

                mesh.material = MaterialLib.getMaterial('flashShape');
                //mesh.material = MaterialLib.getMaterial('noise');

                mesh.visibility = .99999;

                vertexData.applyToMesh(mesh, true);

                mesh._editSerial = this._serial;

                mesh.isPickable = false;

                mesh.parent = ShapeEditor.container;

                this._mesh = mesh;

                this.updateRenderingOrder();
            }
        },

        clearMesh: function()
        {
            if(this._mesh)
            {
                this._mesh.dispose();
                this._mesh = null;
            }
        },

        clear: function()
        {
            this._points = [];
            this._uvs = [];
            this._meshUVs = null;
            this._meshVertices = null;

            var i, node;
            for(i=0;i<this._nodes.length;i++)
            {
                node = this._nodes[i];
                node.dispose();
            }
            this._nodes = [];

            this._focusNode.setEnabled(false);

            if(this._lineMesh)
            {
                this._lineMesh.dispose();
                this._lineMesh = null;
            }

            this.clearMesh();
        },

        dispose: function()
        {
            this.clear();
        },

        getExportData: function()
        {
            if(this._points.length < 3) return null;

            return {
                data:
                {
                    serial: this._serial,
                    vertices: this._meshVertices,
                    uvs: this._meshUVs,
                    renderingOrder: this._renderingOrder
                }
            };

        }
    };

}());