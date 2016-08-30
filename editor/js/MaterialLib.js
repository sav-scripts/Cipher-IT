/**
 * Created by sav on 2016/8/16.
 */
(function(){

    var _scene,
        _materialDic = {};

    var self = window.MaterialLib =
    {
        defaultPath: 'textures/',

        init: function(scene)
        {
            _scene = scene;

            createWireframe();
            createNormal();
            createFlashShape();
            createNoise();

        },

        getMaterial: function(name)
        {
            return _materialDic[name];
        }
    };

    function createWireframe()
    {
        var material = new BABYLON.StandardMaterial("wireframe", _scene);
        material.wireframe = true;
        material.hasAlpha = true;
        material.alpha = .5;

        _materialDic['wireframe'] = material;
    }

    function createNormal()
    {
        var material = new BABYLON.StandardMaterial("material1", _scene);
        material.emissiveColor = new BABYLON.Color3(1,1,1);
        material.backFaceCulling = false;
        //material.alphaMode = BABYLON.Engine.ALPHA_COMBINE;

        _materialDic['normal'] = material;
    }

    function createFlashShape()
    {
        var time = 0,
            dTime = .0001;

        var shaderMaterial = new BABYLON.ShaderMaterial("shapeShader", _scene, "shape",
            {
                //needAlphaBlending: true,
                attributes: ["position", "normal", "uv", "uv2"],
                uniforms: ["worldViewProjection"]
            });

        var mainTexture = new BABYLON.Texture(self.defaultPath + "amiga.jpg", _scene);

        shaderMaterial.setTexture("textureSampler", mainTexture);
        shaderMaterial.setFloat("time", time);
        shaderMaterial.backFaceCulling = false;

        _scene.registerBeforeRender(function()
        {
            //time = (time + dTime) % 1;
            time = time + dTime;

            shaderMaterial.setFloat('time', time);

        });

        _materialDic['flashShape'] = shaderMaterial;
    }

    function createNoise()
    {
        var time = 0,
            dTime = .01;

        var shaderMaterial = new BABYLON.ShaderMaterial("noiseShader", _scene, "noise",
        {
            //needAlphaBlending: true,
            attributes: ["position", "normal", "uv"],
            uniforms: ["worldViewProjection"]
        });

        shaderMaterial.__motion = new BABYLON.Vector2(0, 0);

        shaderMaterial.setFloat("time", time);
        shaderMaterial.setVector2("motion", shaderMaterial.__motion);

        shaderMaterial.backFaceCulling = false;

        //shaderMaterial.alphaMode = BABYLON.Engine.ALPHA_ONEONE;

        _scene.registerBeforeRender(function()
        {
            //time = (time + dTime) % 1;
            time = time + dTime;

            shaderMaterial.setFloat('time', time);

            //shaderMaterial.__motion.x *= .91;
            //shaderMaterial.setVector2("motion", shaderMaterial.__motion);

        });

        _materialDic['noise'] = shaderMaterial;
    }


}());