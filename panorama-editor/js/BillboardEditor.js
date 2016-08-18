/**
 * Created by sav on 2016/8/17.
 */
(function(){

    var _scene,
        _gui,
        _guiFolder,
        _hintText = '按住 Shift 編輯 Billboard';

    var self = window.BillboardManager =
    {
        init: function(scene)
        {
            _scene = scene;

            //self.addSprite("./textures/d1.png", 0, -15, 150);
            self.add("./textures/d2.png", 0, -15, -150);
            self.add("./textures/d3.png", 150, -15, 0);
            self.add("./textures/d4.png", -150, -15, 0);

            //self.addSprite("./textures/popu02.png", 0, 5, 150,.1);
            self.add("./textures/char.png", 0, -1, 200);
            //self.addSprite("./textures/popu02.png", 0, 5, 150,.1);

            setupGUI();

        },

        add: function(imageSrc, x, y, z, scale)
        {
            new Billboard(_scene, imageSrc, x, y, z, scale);
        }

    };

    function setupGUI()
    {
        _gui = Main.gui;
        _guiFolder = _gui.addFolder('billboardEditorFolder');

        //_toLastStepButton = _guiFolder.add(self, "requestToLastStep").name("刪除點 (Ctrl+Z)");
        //_deleteAllButton = _guiFolder.add(self, "clearEditingObject").name("刪除全部 (Delete)");
        //_completeButton = _guiFolder.add(self, "completeEdit").name("完成 (SPACEBAR)");

        //self.update();

        updateFolderLabel(_hintText);
    }

    function updateFolderLabel(label)
    {
        _gui.resetFolderLabel(_guiFolder.name, label);
    }

}());

(function(){

    const GLOBAL_SCALE = .2;

    window.Billboard = Billboard;

    function Billboard(scene, imageSrc, x, y, z, scale)
    {
        var self = this;

        this._scene = scene;

        this._scale = scale || 1;

        //var img = document.createElement("img");
        //img.src = imageSrc;
        //img.onload = build;

        self.changeImage(imageSrc);


        //var mesh = self._mesh = new BABYLON.MeshBuilder.CreatePlane("mesh", {width: img.width*imageScale, height:img.height*imageScale, updatable: true}, scene);
        var mesh = self._mesh = new BABYLON.MeshBuilder.CreatePlane("mesh", {width: 10, height:10, updatable: true}, scene);
        //mesh.parent = self._node;

        mesh.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;



        mesh.renderingGroupId = 1;

        //mesh.showBoundingBox = true;

        var material = self._material = new BABYLON.StandardMaterial("material1", scene);
        material.emissiveColor = new BABYLON.Color3(1,1,1);



        mesh.material = material;
        mesh.visibility = 0;

        self.updatePosition(x, y, z);
    }

    Billboard.prototype =
    {
        _scene: null,

        _mesh: null,

        _texture: null,
        _material: null,

        _scale: 1,
        _imageWidth: 0,
        _imageHeight: 0,

        _offsetX:.5,
        _offsetY:.5,

        changeImage: function(imageSrc)
        {
            var self = this;

            if(this._texture)
            {
                this._texture.dispose();
                this._texture = null;
            }

            var img = document.createElement("img");
            img.src = imageSrc;
            img.onload = build;

            function build()
            {
                var texture = self._texture = new BABYLON.Texture(imageSrc, self._scene);

                self._imageWidth = img.width;
                self._imageHeight = img.height;

                self._material.opacityTexture = texture;
                self._material.diffuseTexture = texture;

                self.updateGeom();

                self._mesh.visibility = 1;
            }
        },

        updatePosition: function(x, y, z)
        {
            this._mesh.position.x = x;
            this._mesh.position.y = y;
            this._mesh.position.z = z;
        },

        updateGeom: function()
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
        }

    };


}());