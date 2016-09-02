/**
 * Created by sav on 2016/8/31.
 */
(function(){

    var _scene,
        _isInteractiveEnabled = false,
        _objectDic =
        {
            "/TattooMan":
            {
                type: 'dialog',
                nameHead: 'trigger',
                name: "tattoo-man",
                isNpc: true,
                dialogs: ['<span>我喜歡跟朋友參加派對，</span><span class="green">格蘭利威威士忌</span><span>是我的最愛！</span>'],
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
                            '<span>這裡的</span><span class="green">RAEP Bar</span><span>是我們社區鄰居喜歡聚集的地方，但最近好像有個不認識的人常進出這裡…</span>'],
                changePhaseAfterDialog: null,
                y: 10
            },

            "/Businessman":
            {
                type: 'dialog',
                nameHead: 'trigger',
                name: "businessman",
                isNpc: true,
                dialogs: ["<span>我只是個商人，請問我什麼時候可以離開，我還得去趕飛機去參加名酒拍賣會啊！</span>"],
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
            }
        };

    window.Story.ObjectManager =
    {
        getObjectDic: function(){ return _objectDic; },

        init: function(scene)
        {
            _scene = scene;

            var dic = BillboardEditor.getDicByName(),
                hash,
                objectName,
                obj,
                editorObject;

            for(hash in _objectDic)
            {
                obj = _objectDic[hash];

                setupObject(dic, hash, obj);
            }

            updateEnabled();
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
                if(obj.editorObject) obj.editorObject.dispose();
                delete _objectDic[hash];
            }
        },

        setEnabled: function(b)
        {
            if(b == _isInteractiveEnabled) return;
            _isInteractiveEnabled = b;

            updateEnabled();
        },

        setObjectDialog: function(hash, index, changePhaseAfterDialog, changeActionWhenDialoging, changeHashAfterDialog)
        {
            var obj = _objectDic[hash];
            if(obj && obj.dialogs)
            {
                obj.currentDialog = obj.dialogs[index];
                obj.changePhaseAfterDialog = changePhaseAfterDialog;
                obj.changeActionWhenDialoging = changeActionWhenDialoging;
                obj.changeHashAfterDialog = changeHashAfterDialog;
            }
        },

        changeNpcAction: function(hash, toIndex)
        {
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

                newNpcObject._mesh.setEnabled(true);

                var tl = new TimelineMax();
                tl.set(newNpcObject._mesh, {visibility: 0});
                tl.to(newNpcObject._mesh,.8, {visibility: 1, ease:Power2.easeInOut});
                tl.to(oldNpcObject._mesh,.8, {visibility: 0, ease:Power2.easeInOut}, 0);

                tl.add(function()
                {
                    oldNpcObject._mesh.setEnabled(false);
                });



            }
        }
    };

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

        mesh.actionManager = new BABYLON.ActionManager(_scene);
        mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function(event)
        {
            //console.log(obj.name);
            SceneHandler.toHash("/Story" + obj.hash);
        }));

        mesh.actionManager.__actions = mesh.actionManager.actions;
        mesh.actionManager.actions = [];

    }

}());