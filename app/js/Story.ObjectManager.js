/**
 * Created by sav on 2016/8/31.
 */
(function(){

    var _scene,
        _isInteractiveEnabled = false,
        _pointFingerMesh,
        _pointFingerMeshContainer,
        _currentPointFingerHash,

        _lightTexture,

        _newDialogTexture,

        _objectDic =
        {
            "/TattooMan":
            {
                type: 'dialog',
                nameHead: 'trigger',
                name: "tattoo-man",
                isNpc: true,
                dialogs: ['<span>我喜歡跟朋友參加派對，</span><span class="green">格蘭利威威士忌</span><span>是我的最愛！</span>', '<span>新對話</span>'],
                dialogEvent: null,
                triggerPhase: null,
                y: 20
            },
            "/Backpacker":
            {
                type: 'dialog',
                nameHead: 'trigger',
                name: "backpacker",
                isNpc: true,
                dialogs: ["<span>昨晚在酒吧聽說有神秘新酒登台，全台僅600瓶!跟這案子有關嗎？</span>"],
                y: 10
            },
            "/Bartender":
            {
                type: 'dialog',
                nameHead: 'trigger',
                name: "bartender",
                numNpcActions: 2,
                currentAction: 0,
                isNpc: true,
                dialogs: [  "<span>對人最好的觀察就是從喝酒後開始</span>",
                            "<span>最近確實有個新來的客人，他都拿著一個公事包獨自坐在這喝酒，他剛剛才來過！</span></br><span>這就是他喝的杯子，也許您可以查查這杯子上的指紋？</span>"],
                changePhaseAfterDialog: null,
                changeActionWhenDialoging: null,
                changeHashAfterDialog: null,
                y: 10
            },

            "/SportGirl":
            {
                type: 'dialog',
                nameHead: 'trigger',
                name: "sport-girl",
                isNpc: true,
                dialogs: [  "<span>沒有證據請不要碰我，小心我告你性騷擾！</span>",
                            '<span>這裡的</span><span class="green">&nbsp;RAEP&nbsp;Bar&nbsp;</span><span>是我們社區鄰居喜歡聚集的地方，但最近好像有個不認識的人常進出這裡…</span>'],
                changePhaseAfterDialog: null,
                y: 10
            },

            "/Businessman":
            {
                type: 'dialog',
                nameHead: 'trigger',
                name: "businessman",
                isNpc: true,
                dialogs: [
                            "<span>我只是個商人，請問我什麼時候可以離開，我還得去趕飛機去參加名酒拍賣會啊！</span>",
                            ["<span>...</span>", "<span>不回答！想必是心虛…他的公事包真的非常可疑！</span>"]
                        ],
                dialogEvent: null,
                y: 10
            },

            "/Door":
            {
                type: 'dialog',
                nameHead: 'hint',
                name: "door",
                dialogs: ["<span>打不開！果然沒有我想得那麼簡單！</span>"],
                dialogAnimeType: 'shake',
                clearAble: true,
                y: 10
            },

            "/Phone":
            {
                type: 'hint',
                name: "mailbox"
            },

            "/Poster":
            {
                type: 'hint',
                name: "poster",
                disableInStart: true
            },

            "/Billboard":
            {
                type: 'hint',
                name: "billboard",
                disableInStart: true
            },

            "/Medal":
            {
                type: 'hint',
                name: "medal",
                disableInStart: true
            },

            "/Briefcase":
            {
                type: 'hint',
                name: "briefcase",
                disableInStart: true
            }
        };

    var self = window.Story.ObjectManager =
    {
        getObjectDic: function(){ return _objectDic; },

        init: function(scene)
        {
            _scene = scene;

            _lightTexture = new BABYLON.Texture("textures/lightdemo.png", _scene);

            _newDialogTexture = new BABYLON.Texture("textures/information_icon_new.png", _scene);


            var dic = BillboardEditor.getDicByName(),
                hash,
                obj;

            for(hash in _objectDic)
            {
                obj = _objectDic[hash];

                setupObject(dic, hash, obj);
            }

            updateEnabled();
            createPointFinger();
        },

        getObject: function(hash)
        {
            return _objectDic[hash];
        },

        setObjectEnabled: function(hash, enabled)
        {
            var obj = _objectDic[hash];
            obj.isEnabled= enabled;

            updateObjectEnabled(hash);
        },

        clearObject: function(hash)
        {
            var obj = _objectDic[hash];

            if(obj)
            {
                if(obj.flashTriggerTl) obj.flashTriggerTl.kill();

                if(obj.editorObject)
                {
                    obj.editorObject._mesh.setEnabled(false);
                    TweenMax.delayedCall(5, function()
                    {
                        obj.editorObject.dispose();
                    });
                }
                delete _objectDic[hash];
            }
        },

        setEnabled: function(b)
        {
            if(b == _isInteractiveEnabled) return;
            _isInteractiveEnabled = b;

            updateEnabled();
        },

        setObjectDialog: function(hash, index, changePhaseAfterDialog, changeActionWhenDialoging, changeHashAfterDialog, changePhaseAfterActionChange)
        {
            var obj = _objectDic[hash];
            if(obj && obj.dialogs)
            {
                obj.currentDialog = obj.dialogs[index];
                obj.changePhaseAfterDialog = changePhaseAfterDialog;
                obj.changeActionWhenDialoging = changeActionWhenDialoging;
                obj.changeHashAfterDialog = changeHashAfterDialog;
                obj.changePhaseAfterActionChange = changePhaseAfterActionChange;
            }
        },

        changeNpcAction: function(hash, toIndex, duration, cb)
        {
            if(!duration && duration != 0) duration = .8;

            var obj = _objectDic[hash];
            if(obj && obj.npcArray)
            {
                if(toIndex == obj.currentAction) return;

                var newNpcObject = obj.npcArray[toIndex];
                if(!newNpcObject)
                {
                    throw "npc object index: " + toIndex + " for " + hash + " not found.";
                }
                var oldNpcObject = obj.npcArray[obj.currentAction];

                obj.currentAction = toIndex;

                newNpcObject._mesh.setEnabled(true);

                var tl = new TimelineMax();
                tl.set(newNpcObject._mesh, {visibility: 0});
                tl.to(newNpcObject._mesh,duration, {visibility: 1, ease:Power2.easeInOut});
                tl.to(oldNpcObject._mesh,duration, {visibility: 0, ease:Power2.easeInOut}, 0);

                tl.add(function()
                {
                    oldNpcObject._mesh.setEnabled(false);
                    if(cb) cb.call();
                });



            }
        },

        hideObject: function(hash)
        {
            var obj = _objectDic[hash],
                mesh = obj.editorObject._mesh;

            obj.isHiding = true;

            if(obj.flashTriggerTl) obj.flashTriggerTl.pause();

            TweenMax.to(mesh,.5, {visibility: 0});
        },

        showObject: function(hash)
        {
            var obj = _objectDic[hash],
                mesh = obj.editorObject._mesh;

            obj.isHiding = false;

            if(obj.flashTriggerTl) obj.flashTriggerTl.resume();

            TweenMax.to(mesh,.5, {visibility: 1});
        },

        showPointFingerAt: function(hash, offsetY)
        {
            if(offsetY == undefined) offsetY = 3;

            var obj = _objectDic[hash],
                position = obj.editorObject._mesh.position.clone();

            position.y += offsetY;

            _pointFingerMeshContainer.position = position;
            //_pointFingerMesh.position
            _pointFingerMesh.setEnabled(true);

            TweenMax.to(_pointFingerMesh,.5, {visibility: 1});

            _currentPointFingerHash = hash;
        },

        hidePointerFinger: function()
        {
            _currentPointFingerHash = null;
            TweenMax.to(_pointFingerMesh,.5, {visibility: 0, onComplete: function()
            {
                _pointFingerMesh.setEnabled(false);
            }});
        },

        setDialogToNew: function(hash)
        {
            var obj = _objectDic[hash];
            obj.newDialogMesh.setEnabled(true);
            //self.changeObjectTexture(hash, 'new');
            obj.newDialogMeshTl.restart();
        },

        setDialogToNormal: function(hash)
        {
            //console.log("set to normal: " + hash);
            var obj = _objectDic[hash];
            obj.newDialogMesh.setEnabled(false);

            obj.newDialogMeshTl.pause();
            //self.changeObjectTexture(hash, 'normal');
        },

        disableFlash: function(hash)
        {
            _objectDic[hash].flashDisabled = true;
        }
    };

    function createPointFinger()
    {
        var imageWidth = 64, imageHeight = 95;

        var container = _pointFingerMeshContainer = new BABYLON.Mesh("pointfinger container", _scene);
        container.isPickable = false;

        var mesh = _pointFingerMesh = BABYLON.MeshBuilder.CreatePlane("point-finger", {width:6.4, height:9.5, updatable: true}, _scene);
        mesh.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
        mesh.renderingGroupId = 3;
        mesh.parent = container;
        mesh.isPickable = false;

        var texture = new BABYLON.Texture("textures/finger.png", _scene);
        var mat = MaterialLib.createNormal();
        mesh.material = mat;

        mat.specularColor = BABYLON.Color3.Black();

        //mat.emissiveColor = BABYLON.Color3.White();
        mat.opacityTexture = mat.diffuseTexture = texture;

        mesh.visibility = 0;

        updateGeom(mesh, imageWidth, imageHeight,.17,.65, 0);


        var position = mesh.position;
        var tl = new TimelineMax({repeat:-1});
        tl.set(position, {y: 0});
        tl.to(position,.6, {y: -1, ease:Power2.easeIn});
        tl.to(position,.6, {y: 0, ease:Power2.easeOut});

        mesh.setEnabled(false);
    }


    function updateGeom(mesh, imageWidth, imageHeight, scale, offsetX, offsetY)
    {
        var data = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind),
            width = imageWidth * scale,
            height = imageHeight * scale;

        var left = -width*offsetX,
            right = width*(1-offsetX),
            top = -height*offsetY,
            bottom = height*(1-offsetY);

        data[0] = left;
        data[1] = top;

        data[3] = right;
        data[4] = top;

        data[6] = right;
        data[7] = bottom;

        data[9] = left;
        data[10] = bottom;

        mesh.updateVerticesData(BABYLON.VertexBuffer.PositionKind, data, true);
        //self._mesh.setVerticesData(BABYLON.VertexBuffer.PositionKind, data, true);
    }

    function updateEnabled()
    {
        for(var hash in _objectDic)
        {
            updateObjectEnabled(hash);
        }
    }

    function updateObjectEnabled(hash)
    {
        var obj = _objectDic[hash],
            mesh = obj.editorObject._mesh;

        if(_isInteractiveEnabled && obj.isEnabled)
        {
            mesh.actionManager.actions = mesh.actionManager.__actions;
        }
        else
        {
            mesh.actionManager.actions = [];
        }


        obj.editorObject._mesh.setEnabled(obj.isEnabled);
    }

    function setupObject(dic, hash, obj)
    {

        var objectName, editorObject;

        objectName = obj.name;

        var nameHead = obj.nameHead? obj.nameHead: obj.type,
            fullName = nameHead + "-" + objectName;

        obj.nameHead = nameHead;

        editorObject = dic[fullName];

        //console.log(fullName);

        if(!editorObject)
        {
            alert("object: " + objectName + " is lacking from scene data");
            return;
        }

        obj.hash = hash;
        if(obj.dialogs) obj.currentDialog = obj.dialogs[0];
        obj.editorObject = editorObject;

        if(obj.isNpc)
        {
            if(!obj.numNpcActions) obj.numNpcActions = 1;

            var npcArray = [];

            for(var i=1;i<=obj.numNpcActions;i++)
            {
                var npcName = "npc-" + objectName;
                if(i>1) npcName += "-" + i;
                var npcObj = dic[npcName];

                if(!npcObj)
                {
                    alert("object: " + npcName + " is lacking from scene data");
                    return;
                }

                if(i>1)
                {
                    npcObj._mesh.setEnabled(false);
                }

                npcArray.push(npcObj);
            }

            obj.npcArray = npcArray;
            obj.position = obj.npcArray[0]._mesh.position.clone();

        }
        else
        {
            obj.position = editorObject._mesh.position.clone();
        }


        obj.position.y = obj.y;


        obj.isEnabled = !Boolean(obj.disableInStart);

        //if(obj.disableInStart)
        //{
        //    obj.editorObject._mesh.setEnabled(false);
        //}


        var mesh = obj.editorObject._mesh;
        mesh.isPickable = true;

        if(obj.nameHead == 'hint')
        {
            obj.editorObject._imageWidth = 139;
            obj.editorObject._imageHeight = 141;
            obj.editorObject._updateGeom();

            mesh.material.diffuseTexture = mesh.material.opacityTexture = _lightTexture;
            mesh.visibility = 0;

            var flashMesh = mesh.clone("myFlash");
            flashMesh.parent = mesh;
            flashMesh.position = BABYLON.Vector3.Zero();
            flashMesh.isPickable = false;
            obj.flashMesh = flashMesh;

            mesh.material = null;

            var tl = obj.flashTriggerTl =  new TimelineMax();
            tl.to(obj, 0, {onComplete: triggerFlash, onCompleteParams:[obj]},.1);
            //tl.set(rotation, {z: 0});
            //tl.to(rotation, 1, {z: Math.PI*2});
        }

        if(obj.nameHead == 'trigger')
        {
            var newMesh = obj.newDialogMesh = mesh.clone();

            var mat = MaterialLib.createNormal();
            mat.opacityTexture = mat.diffuseTexture = _newDialogTexture;
            mat.specularColor = BABYLON.Color3.Black();
            newMesh.material = mat;
            newMesh.position = BABYLON.Vector3.Zero();
            newMesh.parent = mesh;
            newMesh.alphaIndex = mesh.alphaIndex + 1;
            newMesh.isPickable = false;

            mesh.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;


            var tl2 = obj.newDialogMeshTl = new TimelineMax({repeat:-1, paused: true});

            //var d = "+=.1";
            //var position = newMesh.position;
            //tl2.set(position, {x: -0}, 0);
            //tl2.set(position, {x: -.5}, 3);
            //tl2.set(position, {x: .5}, d);
            //tl2.set(position, {x: -.5}, d);
            //tl2.set(position, {x: .5}, d);

            //tl2.to(position,1, {x: 0, ease: Elastic.easeOut.config(1.0, 0.2)});
            //tl2.set(position, {x: 0}, 3);

            //tl2.set(newMesh, {visibility: 1});
            //tl2.set(newMesh, {visibility: 0}, 2);
            //tl2.set(newMesh, {visibility: 1}, "+=.1");
            //tl2.set(newMesh, {visibility: 0}, "+=.1");
            //tl2.set(newMesh, {visibility: 1}, "+=.1");

            tl2.to(newMesh,.5, {visibility:.2, ease:Linear.easeNone},0);
            tl2.to(newMesh,.5, {visibility:1, ease:Linear.easeNone});


            //tl2.set(newMesh, {visibility: 0}, 0);
            //tl2.set(newMesh, {visibility: 1},.1);
            //tl2.set(newMesh, {visibility: 0},.2);
            //tl2.set(newMesh, {visibility: 1},.3);
            //tl2.set(newMesh, {visibility: 0}, 2);


            self.setDialogToNew(hash);
        }

        mesh.actionManager = new BABYLON.ActionManager(_scene);
        mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function()
        {
            //self.setPointFingerAt(hash);
            if(_currentPointFingerHash)
            {
                self.hidePointerFinger();
            }
            SceneHandler.toHash("/Story" + obj.hash);
        }));

        mesh.actionManager.__actions = mesh.actionManager.actions;
        mesh.actionManager.actions = [];

    }


    function triggerFlash(obj)
    {
        if(obj.flashDisabled) return;

        if(!obj.isHiding)
        {
            var mesh = obj.flashMesh,
                rotation = mesh.rotation,
                tl = new TimelineMax;

            tl.set(mesh, {visibility: 0, scalingDeterminant: 0});
            tl.set(rotation, {z: 0});
            tl.to(mesh,.3, {visibility: 1, scalingDeterminant:1, ease:Power2.easeIn});
            tl.to(mesh,.3, {visibility: 0, scalingDeterminant:0, ease:Power2.easeOut});

            tl.to(rotation,.6, {z:1, ease:Power2.easeInOut}, "-=.6");
            tl.set(mesh, {scalingDeterminant: 1});
        }

        var delay = 1 + Math.random()*2;
        TweenMax.delayedCall(delay, function()
        {
            obj.flashTriggerTl.restart();
        });
    }

}());