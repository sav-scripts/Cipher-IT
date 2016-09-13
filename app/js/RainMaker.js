/**
 * Created by sav on 2016/9/5.
 */
(function(){

    var _range = 200,
        _speed = 50,
        _cameraAlpha = 0;

    window.RainMaker =
    {
        init: function(scene)
        {
            //return;
            var particleSystem = new BABYLON.ParticleSystem("particles", 2000, scene);
            particleSystem.particleTexture = new BABYLON.Texture("textures/rain-drop.png?v=1232", scene);

            particleSystem.minSize = 20.0;

            particleSystem.minLifeTime = .2;
            particleSystem.maxLifeTime = .2;

            particleSystem.minEmitPower = 50.5;
            //particleSystem.maxEmitPower = 6.0;
            particleSystem.emitter = new BABYLON.Vector3(0, 50, 0);
            particleSystem.emitRate = 2000;
            particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
            //particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
            particleSystem.direction1 = new BABYLON.Vector3(0, -_speed, 0);
            particleSystem.direction2 = new BABYLON.Vector3(0, -_speed, 0);

            //particleSystem.color1 = new BABYLON.Color4(1, 1, 0, 1);
            //particleSystem.color2 = new BABYLON.Color4(1, 0.5, 0, 1);

            particleSystem.gravity = new BABYLON.Vector3(0, -5.0, 0);

            particleSystem.minEmitBox = new BABYLON.Vector3(-_range, 0, -_range);
            particleSystem.maxEmitBox = new BABYLON.Vector3(_range, 0, _range);

            particleSystem.renderingGroupId = 2;

            //particleSystem.minAngularSpeed = 1;

            particleSystem.start();

        }
    };

}());