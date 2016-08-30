/**
 * Created by sav on 2016/8/29.
 */
(function(){

    var _scene,
        _serial = 0,

        _isEnabled = false,
        _isEditModeOn = false,

        _editorObjectDic = {},
        _editingObject,

        _hintText = '按住 Ctrl 點擊畫面新增 Light',

        _gui,
        _guiFolder,
        _guiItems;

    var self = window.LightEditor =
    {
        lightNodeSample: null,
        container: null,
        nodeContainer: null,

        init: function(scene)
        {
            _scene = scene;


            this.container = new BABYLON.Mesh("light container", _scene);
            this.container.isPickable = false;

            this.nodeContainer = new BABYLON.Mesh("light node container", _scene);
            this.nodeContainer.isPickable = false;
            this.nodeContainer.setEnabled(false);

            this.lightNodeSample = Tools.createNodeSample(scene, new BABYLON.Color3.Yellow(), 5, null, 'sphere');
            this.lightNodeSample.renderingGroupId = 3;

            setupGUI();

            //this.createLight(new BABYLON.Vector3(-150, 0, 20), false);
            //createLightAt(new BABYLON.Vector3(0, 50, -50));

            KeyboardControl.add("LightEditor complete", KeyCodeDic.space,
            {
                onKeyUp: function()
                {
                    if(_isEditModeOn && _editingObject)
                    {
                        self.completeEdit();
                    }
                }
            }).add("LightEditor delete", KeyCodeDic.delete,
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

        getLightNames: function()
        {
            var array = [],
                key;

            for(key in _editorObjectDic)
            {
                array.push(_editorObjectDic[key]._name);
            }

            return array;
        },

        find: function(name)
        {
            for(var key in _editorObjectDic)
            {
                if(_editorObjectDic[key]._name == name) return _editorObjectDic[key];
            }
            return null;
        },

        createLight: function(position, editIt)
        {
            _serial ++;
            _editorObjectDic[_serial] = new LightObject(_scene, _serial, position.x, position.y, position.z);

            if(editIt) self.edit(_serial);
            //this._changeEditTarget(newObject);
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

        deleteEditingObject: function()
        {
            if(_editingObject && confirm("確定要刪除這個 Light 嗎？"))
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

        triggerChangeName: function()
        {
            if(_editingObject)
            {
                var newName = prompt("請輸入新的名稱", _editingObject._name);
                if(newName !== null && newName !== '')
                {
                    var check = false;
                    for(var key in _editorObjectDic)
                    {
                        var eo = _editorObjectDic[key];
                        if(eo._name === newName)
                        {
                            alert("這個名稱已經被使用了");
                            check = true;
                            break;
                        }
                    }

                    if(!check)
                    {
                        _editingObject._name = newName;
                        updateFolderLabel("Light: " + _editingObject._name);
                    }
                }
                //console.log("newName = " + newName);
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

            if(!dataArray) dataArray = [];

            _serial = 0;
            var i, obj;

            for(i=0;i<dataArray.length;i++)
            {
                obj = dataArray[i];


                var newObj = _editorObjectDic[obj.serial] = LightObject.CreateFromData(_scene, obj);

                _serial = Math.max(_serial, parseInt(newObj._serial));
            }

            _serial++;
        }
    };

    function setupGUI()
    {
        _gui = Main.gui;
        _guiFolder = _gui.addFolder('lightEditorFolder');

        updateFolderLabel(_hintText);

        $(_guiFolder.domElement).css("display", "none");
    }

    function updateGUIItems()
    {

        if(_guiItems)
        {
            for(var key in _guiItems)
            {
                _guiItems[key].remove();
            }

            _guiItems = null;
        }

        if(_editingObject)
        {
            updateFolderLabel("Light: " + _editingObject._name);

            _guiItems =
            {
                name: _guiFolder.add(self, "triggerChangeName").name("改變名稱"),

                x: _guiFolder.add(_editingObject, "_x"),
                y: _guiFolder.add(_editingObject, "_y"),
                z: _guiFolder.add(_editingObject, "_z"),
                intensity: _guiFolder.add(_editingObject, "_intensity"),
                range: _guiFolder.add(_editingObject, "_range")
            };

            // fix for dat gui chain bug

            var r = 200;

            _guiItems.x = _guiItems.x.min(-r).max(r).step(1).name("X");
            _guiItems.x.onChange(function(){ _editingObject.update.call(_editingObject);});

            _guiItems.y = _guiItems.y.min(-r).max(r).step(1).name("Y");
            _guiItems.y.onChange(function(){ _editingObject.update.call(_editingObject);});

            _guiItems.z = _guiItems.z.min(-r).max(r).step(1).name("Z");
            _guiItems.z.onChange(function(){ _editingObject.update.call(_editingObject);});

            _guiItems.intensity = _guiItems.intensity.min(0).max(1).step(.01).name("亮度");
            _guiItems.intensity.onChange(function()
            {
                _editingObject.update.call(_editingObject);
                BillboardEditor.updateAllVisibility();
            });

            _guiItems.range = _guiItems.range.min(10).max(1000).step(1).name("範圍");
            _guiItems.range.onChange(function(){ _editingObject.update.call(_editingObject);});

            _guiItems.deleteButton = _guiFolder.add(self, "deleteEditingObject").name("刪除 (Delete)");
            _guiItems.completeButton = _guiFolder.add(self, "completeEdit").name("完成 (SPACEBAR)");

            _guiFolder.open();
        }
    }

    function updateFolderLabel(label)
    {
        _gui.resetFolderLabel(_guiFolder.name, label);
    }

}());

(function(){

    window.LightObject = LightObject;

    LightObject.CreateFromData = function(scene, data)
    {
        return new LightObject(scene, data.serial, data.x, data.y, data.z, data.range, data.intensity, data.name);
    };

    function LightObject(scene, serial, x, y, z, range, intensity, name)
    {
        this._scene = scene;
        this._serial = serial;
        this._name = name || ("#" + this._serial);

        this._x = x;
        this._y = y;
        this._z = z;
        
        this._range = range || 200;
        this._intensity = intensity || 1;

        var mesh = this._nodeMesh = LightEditor.lightNodeSample.clone();
        mesh.parent = LightEditor.nodeContainer;
        mesh._editSerial = this._serial;
        mesh.setEnabled(true);

        mesh.name = 'lightNode';

        //console.log(mesh.name);

        var light = this._light = new BABYLON.PointLight("pointlight", BABYLON.Vector3.Zero(), scene);
        //light.diffuse = new BABYLON.Color3(1, 0, 0);
        //light.specular = new BABYLON.Color3(1, 1, 1);
        light.range = this._range;

        //var tl = new TimelineMax({repeat:-1});
        //tl.to(light, 1, {range:300, ease:Power1.easeIn});
        //tl.to(light, 1, {range:400, ease:Power1.easeOut});

        this.update();
    }

    LightObject.prototype =
    {
        _scene: null,
        _serial: null,
        _name: null,

        _enabled: false,

        _x: 0,
        _y: 0,
        _z: 0,

        _range: 0,
        _intensity: 1,
        
        _nodeMesh: null,
        _light: null,

        update: function()
        {
            this._nodeMesh.position.x = this._light.position.x = this._x;
            this._nodeMesh.position.y = this._light.position.y = this._y;
            this._nodeMesh.position.z = this._light.position.z = this._z;
            
            this._light.range = this._range;
            this._light.intensity = this._intensity;
        },

        setEnabled: function(b)
        {
            this._enabled = b;
        },

        dispose: function()
        {
            if(this._nodeMesh) this._nodeMesh.dispose();
            if(this._light) this._light.dispose();
        },

        getExportData: function()
        {
            return {
                data:
                {
                    name: this._name,
                    serial: this._serial,
                    x: this._x,
                    y: this._y,
                    z: this._z,
                    range: this._range,
                    intensity: this._intensity
                }
            };

        }
    };

}());