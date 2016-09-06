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


            /*
            // texture and material
            var url = "textures/rain-drop-3.png";
            var mat = new BABYLON.StandardMaterial("mat1", scene);
            //mat.backFaceCulling = false;
            var texture = new BABYLON.Texture(url, scene);
            texture.hasAlpha = true;

            mat.emissiveColor = new BABYLON.Color3(1,1,1);
            mat.opacityTexture = texture;
            mat.diffuseTexture = texture;

            mat.backfaceCulling = false;


            var SPS = new BABYLON.SolidParticleSystem("SPS", scene);
            var plane = BABYLON.MeshBuilder.CreatePlane('plane', {width:.6, height: 12.8}, scene);
            SPS.addShape(plane, 500);      // 20 spheres

            var mesh = SPS.buildMesh();  // finally builds and displays the real mesh

            mesh.material = mat;
            mesh.position.y = 0;

            mesh.renderingGroupId = 2;

            mesh.visibility = .999;

            plane.dispose();

            //SPS.billboard = true; // or false by default
            //SPS.setParticles();


            // SPS behavior definition
            var speed = 100;
            var gravity = -0.01;

            // init
            SPS.initParticles = function() {
                // just recycle everything
                for (var p = 0; p < this.nbParticles; p++) {
                    this.recycleParticle(this.particles[p]);
                }
            };

            // recycle
            SPS.recycleParticle = function(particle) {
                // Set particle new velocity, scale and rotation
                // As this function is called for each particle, we don't allocate new
                // memory by using "new BABYLON.Vector3()" but we set directly the
                // x, y, z particle properties instead
                particle.position.x = Math.random()*_range*2 - _range;
                particle.position.y = 200;
                particle.position.z = Math.random()*_range*2 - _range;
                //particle.velocity.x = (Math.random() - 0.5) * speed;
                particle.velocity.y = -Math.random() * speed;
                //particle.velocity.z = (Math.random() - 0.5) * speed;
                var scale = Math.random() + 0.5;
                particle.scale.x = scale;
                particle.scale.y = scale;
                particle.scale.z = scale;
                //particle.rotation.x = Math.random() * 3.5;
                particle.rotation.y = Math.random() * 3.5;
                //particle.rotation.z = Math.random() * 3.5;

                //particle.rotation.y = Math.atan2(particle.position.z, -particle.position.x);
            };

            // update : will be called by setParticles()
            SPS.updateParticle = function(particle) {
                // some physics here
                if (particle.position.y < -200) {
                    this.recycleParticle(particle);
                }
                particle.velocity.y += gravity;                         // apply gravity to y
                (particle.position).addInPlace(particle.velocity);      // update particle new position
                particle.position.y += speed / 2;

                //var sign = (particle.idx % 2 == 0) ? 1 : -1;            // rotation sign and new value
                //particle.rotation.z += 0.1 * sign;
                //particle.rotation.x += 0.05 * sign;
                //particle.rotation.y += 0.008 * sign;
                //particle.rotation.x = Math.PI*.5;

                //particle.rotation.y = _cameraAlpha + Math.PI * .5;
            };


            // init all particle values and set them once to apply textures, colors, etc
            SPS.initParticles();
            SPS.setParticles();

            // Tuning :
            SPS.computeParticleColor = false;
            SPS.computeParticleTexture = false;

            //scene.debugLayer.show();
            // animation
            scene.registerBeforeRender(function() {
                _cameraAlpha = Story.Scene.customCamera.getAlpha();

                //console.log(_cameraAlpha);

                SPS.setParticles();
                //pl.position = camera.position;
                //SPS.mesh.rotation.y += 0.01;
            });
*/

        }
    };

}());