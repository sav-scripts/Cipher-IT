/**
 * Created by sav on 2016/8/15.
 */
(function(){

    var _scene,

        _gui,
        _guiFolder,

        _editModeOn = false,
        _hintText = "按住 Ctrl 鍵編輯形狀",

        _editingObject,
        _editorObjectDic = {},
        _editorObjectCache = [],

        _toLastStepButton,
        _completeButton,
        _deleteAllButton,

        _serial = 0;

    var self = window.ShapeEditor =
    {
        renderingGroupId: 2,
        editorRenderingGroupId: 3,

        nodeSample: null,
        focusNodeSample: null,

        container: null,

        init: function(scene)
        {
            _scene = scene;

            setupGUI();
            updateFolderLabel(_hintText);


            this.nodeSample = createNodeSample(BABYLON.Color3.Blue());
            this.focusNodeSample = createNodeSample(BABYLON.Color3.Red());

            this.container = new BABYLON.Mesh("shape container", _scene);
            this.container.renderingGroupId = this.renderingGroupId;

            this.nodeSample.parent = this.container;
            this.nodeSample.renderingGroupId = this.editorRenderingGroupId;

            this.focusNodeSample.parent = this.container;
            this.focusNodeSample.renderingGroupId = this.editorRenderingGroupId;

                KeyboardControl.add("completeEdit", KeyCodeDic.space,
            {
                onKeyUp: function()
                {
                    if(_editModeOn && _editingObject && _editingObject.getNumPoints() > 2)
                    {
                        self.completeEdit();
                    }
                }
            });
        },

        enable: function()
        {
            $(_guiFolder.domElement).css("display", "block");
        },

        disable: function()
        {
            $(_guiFolder.domElement).css("display", "none");

            if(_editModeOn)
            {

                if(_editingObject.getNumPoints() > 2)
                {
                    this.completeEdit();
                }
                else
                {
                    _editingObject.clear();
                }
            }

        },

        editAtPoint: function(point, uv)
        {
            if(!_editModeOn)
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
                        _editingObject = new EditorObject(_serial, _scene);
                    }

                    _editorObjectDic[_editingObject.getSerial()] = _editingObject;
                }

                this.toEditMode();
            }

            _editingObject.setEnabled(true);
            _editingObject.addPoint(point, uv);
        },

        edit: function(serial)
        {
            if(_editingObject) return;

            if(_editorObjectDic[serial])
            {
                _editingObject = _editorObjectDic[serial];
                _editingObject.setEnabled(true);

                //_editingObject.clearMesh();

                this.toEditMode();
            }
        },

        endEditMode: function(putEditingObjectIntoCache)
        {
            if(_editingObject)
            {
                if(putEditingObjectIntoCache)
                {
                    _editorObjectCache.push(_editingObject);
                    delete _editorObjectDic[_editingObject.getSerial()];
                }

                _editingObject = null;
            }

            var key, object;
            for(key in _editorObjectDic)
            {
                object = _editorObjectDic[key];
                if(object._mesh) object._mesh.isPickable = true;
            }

            this.toHintMode();
        },

        toEditMode: function()
        {
            if(_editModeOn) return;
            _editModeOn = true;


            updateFolderLabel("編輯中形狀: #" + _serial);
            _guiFolder.open();

            var key, object;
            for(key in _editorObjectDic)
            {
                object = _editorObjectDic[key];
                if(object._mesh) object._mesh.isPickable = false;
            }

            self.update();
        },

        toHintMode: function()
        {
            if(!_editModeOn) return;
            _editModeOn = false;

            updateFolderLabel(_hintText);

            self.update();
        },

        update: function()
        {
            if(_editModeOn && _editingObject)
            {
                var numPoints = _editingObject.getNumPoints();

                if(_toLastStepButton)
                {
                    _toLastStepButton._active = (numPoints > 0);
                    $(_toLastStepButton.__li).css("display", _toLastStepButton._active? "block": "none");
                }

                if(_completeButton)
                {
                    _completeButton._active = (numPoints > 2);
                    $(_completeButton.__li).css("display", _completeButton._active? "block": "none");
                }

                if(_deleteAllButton)
                {
                    _deleteAllButton._active = (numPoints > 0);
                    $(_deleteAllButton.__li).css("display", _deleteAllButton._active? "block": "none");
                }
            }
            else
            {
                $(_toLastStepButton.__li).css("display", "none");
                $(_completeButton.__li).css("display", "none");
                $(_deleteAllButton.__li).css("display", "none");
            }
        },

        requestToLastStep: function()
        {

            if(_toLastStepButton && _toLastStepButton._active)
            {
                _editingObject.toLastStep();
            }
        },

        completeEdit: function()
        {
            if(_completeButton && _completeButton._active)
            {
                //_editingObject.updateMesh();
                _editingObject.setEnabled(false);
                self.endEditMode();
            }
        },

        clearEditingObject: function()
        {
            if(_deleteAllButton && _deleteAllButton._active)
            {
                if(confirm("確定要刪除這個形狀嗎？"))
                {
                    if(_editingObject) _editingObject.clear();
                }
            }
        }
    };

    function setupGUI()
    {
        _gui = Main.gui;
        _guiFolder = _gui.addFolder('shapeEditorFolder');

        _toLastStepButton = _guiFolder.add(self, "requestToLastStep").name("刪除點 (Ctrl+Z)");
        _deleteAllButton = _guiFolder.add(self, "clearEditingObject").name("刪除全部 (Delete)");
        _completeButton = _guiFolder.add(self, "completeEdit").name("完成 (SPACEBAR)");

        $(_guiFolder.domElement).css("display", "none");
        //console.log(_guiFolder.domElement);

        self.update();
    }

    function updateFolderLabel(hintText)
    {
        _gui.resetFolderLabel(_guiFolder.name, hintText);
    }

    function createNodeSample(color)
    {
        var node, boxmat;

        node = BABYLON.Mesh.CreateBox("nodeSample", 1, _scene);

        boxmat = new BABYLON.StandardMaterial("boxmat", _scene);

        boxmat.emissiveColor = color;

        node.material = boxmat;

        node.setEnabled(false);

        return node;
    }

}());

(function(){

    window.EditorObject = EditorObject;

    function EditorObject(serial, scene)
    {
        this._serial = serial;
        this._scene = scene;

        this._points = [];
        this._uvs = [];
        this._nodes = [];

        this._focusNode = ShapeEditor.focusNodeSample.createInstance('nodeInstance');
        this._focusNode.setEnabled(false);
    }

    EditorObject.prototype =
    {
        _scene: null,
        _points: null,
        _uvs: null,
        _nodes: null,
        _lineMesh: null,
        _focusNode: null,

        _isEnabled: false,

        _mesh: null,

        _serial: 0,
        getSerial: function(){ return this._serial },

        toString: function()
        {
            return "EditorObject #" + this._serial;
        },

        getNumPoints: function(){ return this._nodes.length; },

        addPoint: function(position, uv)
        {
            if(this._nodes.length)
            {
                var lastNode = this._nodes[this._nodes.length-1];
                lastNode.setEnabled(true);
            }

            var node = ShapeEditor.nodeSample.createInstance('nodeInstance');
            this._focusNode.position.x = node.position.x = position.x;
            this._focusNode.position.y = node.position.y = position.y;
            this._focusNode.position.z = node.position.z = position.z;


            //node.renderingGroupId = ShapeEditor.renderingGroupId;
            node.parent = ShapeEditor.container;

            node.setEnabled(false);

            node.isPickable = false;

            this._points.push(position);
            this._uvs.push(uv);
            this._nodes.push(node);

            this._focusNode.setEnabled(true);

            this.updateLine();
            this.updateMesh();


            ShapeEditor.update();
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
                ShapeEditor.endEditMode(true);
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
                var mesh = this._lineMesh = BABYLON.Mesh.CreateLines("lines", this._points, this._scene, false);

                mesh.renderingGroupId = ShapeEditor.editorRenderingGroupId;
                mesh.parent = ShapeEditor.container;
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

                var mesh = new BABYLON.Mesh("blank", this._scene);
                mesh.position = BABYLON.Vector3.Zero();

                //var mat = new BABYLON.StandardMaterial("randomMesh", this._scene);
                //mat.emissiveColor = new BABYLON.Color3(1,1,1);
                //mesh.material = mat;

                mesh.material = MaterialLib.getMaterial('flashShape');

                mesh.visibility = .5;

                vertexData.applyToMesh(mesh, true);

                mesh._editType = 'editorMesh';

                mesh._editSerial = this._serial;

                mesh.isPickable = false;

                mesh.renderingGroupId = ShapeEditor.renderingGroupId;
                mesh.parent = ShapeEditor.container;

                this._mesh = mesh;
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

            ShapeEditor.endEditMode(true);
        }
    };

}());