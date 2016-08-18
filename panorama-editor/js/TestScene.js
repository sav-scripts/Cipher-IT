/**
 * Created by sav on 2016/8/15.
 */
(function(){

    var SCENE_SIZE = 200,
        SPHERE_SEGMENTS = 16;

    window.TestScene =
    {
        init: function(canvas, engine)
        {

            var scene = createScene();


            engine.runRenderLoop(function () {
                scene.render();
            });





            function createScene()
            {
                var scene = new BABYLON.Scene(engine);
                //var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 0, 0), scene);
                var camera = new BABYLON.ArcRotateCamera("camera1", 0, 0, 0, new BABYLON.Vector3(0, 0, -1), scene);
                //camera.fov = .8;
                camera.setTarget(new BABYLON.Vector3(0,0,0));
                camera.attachControl(canvas, true);


                //buildAsImage(scene);
                buildAsVideo(scene);
                var wireSphere = buildWireSphere(scene);


                scene.onPointerUp = function (event)
                {
                    if(event.ctrlKey)
                    {
                        var pickinfo = scene.pick(event.clientX, event.clientY);
                        console.log(pickinfo.getTextureCoordinates());
                        //console.log(pickinfo);
                    }

                    //videoTexture._autoLaunch = true;
                    //videoTexture.update();

                    //if(!videoTexture.video.isPlaying())
                    //{
                    //    videoTexture.video.play();
                    //}
                };


                KeyboardControl.add('f', 70,
                    {
                        onKeyUp: function()
                        {
                            var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;
                            if(!fullscreenElement)
                            {
                                requestFullScreen();
                            }
                            else
                            {
                                exitFullScreen();
                            }
                        }
                    }).add('d', 68,
                    {
                        onKeyUp: function()
                        {
                            if(scene.debugLayer.isVisible())
                            {
                                scene.debugLayer.hide();
                            }
                            else
                            {
                                scene.debugLayer.show();
                            }
                        }
                    }).add('a', 65,
                    {
                        onKeyUp: function()
                        {
                            wireSphere.setEnabled(!wireSphere.isEnabled());
                        }
                    });


                scene.registerBeforeRender(function()
                {
                    if(camera.radius > (SCENE_SIZE-2))
                    {
                        camera.radius = (SCENE_SIZE-2);
                    }
                    else if(camera.radius < .1)
                    {
                        camera.radius = .1;
                    }
                });

                return scene;
            }


            //Tools.generateSkyboxTexture();
            //
            //KeyboardControl.add("zoomIn", 109,
            //{
            //    onUpdate: function()
            //    {
            //        scene.activeCamera.fov -= .01;
            //    }
            //});
            //
            //KeyboardControl.add("zoomOut", 107,
            //{
            //    onUpdate: function()
            //    {
            //        scene.activeCamera.fov += .01;
            //    }
            //});
        }
    };


    function buildWireSphere(scene)
    {
        var wireMaterial = new BABYLON.StandardMaterial("wireframe", scene);
        wireMaterial.wireframe = true;
        wireMaterial.hasAlpha = true;

        var wireSphere = new BABYLON.Mesh.CreateSphere("wire sphere", SPHERE_SEGMENTS, SCENE_SIZE*2, scene);
        wireSphere.material = wireMaterial;
        wireMaterial.alpha = .5;

        //wireSphere.setEnabled(false);

        wireSphere.isPickable = false;

        return wireSphere;
    }

    function buildAsImage(scene)
    {
        var sphere = new BABYLON.Mesh.CreateSphere("sphere", SPHERE_SEGMENTS, SCENE_SIZE*2, scene);
        sphere.scaling.y = -1;

        var material = new BABYLON.StandardMaterial("material1", scene);
        material.emissiveColor = new BABYLON.Color3(1,1,1);
        material.diffuseTexture = new BABYLON.Texture("textures/03.jpg", scene);
        material.backFaceCulling = false;

        sphere.material = material;
    }

    function buildAsVideo(scene)
    {
        var video = document.createElement('video');
        video.src = "textures/skyrim360.mp4";
        video.autoplay = false;

        video.className = 'test-layer';
//            document.body.appendChild(video);

//        video.currentTime = 1;
//        video.addEventListener('timeupdate', onFirstPlay);
//        function onFirstPlay(event)
//        {
//            if(event.target.currentTime >= 1)
//            {
////                    console.log("check");
//                //event.target.currentTime = 0;
//                event.target.pause();
//                event.target.removeEventListener('timeupdate', onFirstPlay);
//            }
//        }

        var videoTexture = new BABYLON.VideoTexture("video", video, scene, true, true);
//            videoTexture._autoLaunch = false;

        var sphere = new BABYLON.Mesh.CreateSphere("sphere", SPHERE_SEGMENTS, SCENE_SIZE*2, scene);
        var material = new BABYLON.StandardMaterial("material1", scene);
        material.emissiveColor = new BABYLON.Color3(1,1,1);
        material.diffuseTexture = videoTexture;
        material.backFaceCulling = false;

        sphere.material = material;



        videoTexture.video.constructor.prototype.isPlaying = function()
        {
            return Boolean(this.currentTime > 0 && !this.paused && !this.ended);

        };

        KeyboardControl.add("spacebar", KeyCodeDic.space,
            {
                onKeyUp: function()
                {
                    if(videoTexture.video.isPlaying())
                    {
                        videoTexture.video.pause();
                    }
                    else
                    {
                        videoTexture.video.play();
                    }
                }
            });

    }

    function requestFullScreen()
    {
        var element = document.body;

        var func = element.requestFullscreen ||
            element.mozRequestFullScreen ||
            element.webkitRequestFullscreen ||
            element.msRequestFullscreen || null;

        if(func) func.call(document.body);
    }

    function exitFullScreen()
    {
        var func = document.exitFullscreen ||
            document.mozCancelFullScreen ||
            document.webkitExitFullscreen ||
            document.msCancelFullScreen || null;
        if(func) func.call(document);
    }

}());