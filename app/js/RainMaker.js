/**
 * Created by sav on 2016/9/5.
 */
(function(){

    var _range = 130,
        _rate = 1000,
        _speed = 50;

    window.RainMaker =
    {
        init: function(scene)
        {
            //return;
            var particleSystem = new BABYLON.ParticleSystem("particles", _rate, scene);
            particleSystem.particleTexture = new BABYLON.Texture("textures/rain-drop.png?v=1232", scene);

            particleSystem.minSize = 20.0;

            particleSystem.minLifeTime = .2;
            particleSystem.maxLifeTime = .2;

            particleSystem.minEmitPower = 50.5;
            //particleSystem.maxEmitPower = 6.0;
            particleSystem.emitter = new BABYLON.Vector3(0, 50, 0);
            particleSystem.emitRate = _rate;
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

            //particleSystem.startDirectionFunction = function(emitPower, worldMatrix, directionToUpdate)
            //{
            //    BABYLON.Vector3.TransformNormalFromFloatsToRef(0, -_speed*emitPower, 0, worldMatrix, directionToUpdate);
            //};

            particleSystem.start();

        }
    };

}());