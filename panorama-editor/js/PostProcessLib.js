/**
 * Created by sav on 2016/8/18.
 */

(function(){
    
    var SCENE_PIPELINE_NAME = 'scenePipeline';

    var _engine,
        _scene,
        _camera,
        _pipeline,

        _dic = 
        {
            "noise": {label: "雜訊 + 動態模糊", enabled: false, effect: null},
            "drunk": {label: "暈眩", enabled: false, effect: null}
        };

    var self = window.PostProcessLib =
    {
        init: function(engine, scene, camera)
        {
            _engine = engine;
            _scene = scene;
            _camera = camera;

            _pipeline = new BABYLON.PostProcessRenderPipeline(engine, SCENE_PIPELINE_NAME);

            buildNoise();
            buildDrunk();

            _scene.postProcessRenderPipelineManager.addPipeline(_pipeline);
            _scene.postProcessRenderPipelineManager.attachCamerasToRenderPipeline(SCENE_PIPELINE_NAME, camera);

            for(var key in _dic)
            {
                if(!_dic[key].enabled)
                {
                    _scene.postProcessRenderPipelineManager.disableEffectInPipeline(SCENE_PIPELINE_NAME, key, _camera);
                }
            }

            setupGUI();

        },

        enableEffect: function(name)
        {
            if(!_dic[name])
            {
                console.error('effect: ['+name+'] not defined');
                return;
            }

            _dic[name].enabled = true;
            _scene.postProcessRenderPipelineManager.enableEffectInPipeline(SCENE_PIPELINE_NAME, name, _camera);
        },

        disableEffect: function(name)
        {
            if(!_dic[name])
            {
                console.error('effect: ['+name+'] not defined');
                return;
            }

            _dic[name].enabled = false;
            _scene.postProcessRenderPipelineManager.disableEffectInPipeline(SCENE_PIPELINE_NAME, name, _camera);
        }
    };

    function setupGUI()
    {
        var gui = Main.gui,
            folder = gui.addFolder('後製效果');

        //folder.add(_dic.noise, "enabled").name("雜訊 + 動態模糊").onChange(function(v)
        //{
        //    v? self.enableEffect('noise'): self.disableEffect('noise');
        //});

        for(var key in _dic)
        {
            buildOne(key);
        }

        folder.open();

        function buildOne(key)
        {
            var obj = _dic[key];

            folder.add(obj, "enabled").name(obj.label).onChange(function(v)
            {
                v? self.enableEffect(key): self.disableEffect(key);
            });
        }

    }

    function buildNoise()
    {
        var effectName = 'noise',
            time = 0.1,
            __motion = new BABYLON.Vector2(0, 0);

        var postProcess = new BABYLON.PostProcess(effectName, "noise", ["time", "motion"], null, 1, null, null, _engine, false);

        _dic[effectName].effect = new BABYLON.PostProcessRenderEffect(_engine, effectName, function() {return postProcess;});
        _pipeline.addEffect(_dic[effectName].effect);

        postProcess.onApply = function (effect)
        {
            time += .01;
            effect.setFloat("time", time);


            var motion = -_camera.inertialAlphaOffset * 100;
            if(motion > 1) motion = 1;
            if(motion < -1) motion = -1;

            if(Math.abs(motion) > Math.abs(__motion.x)) __motion.x = motion;
            __motion.x *= .87;
            if(__motion.x < .01 && __motion.x > .01) __motion.x = 0;

            motion = -_camera.inertialBetaOffset * 100;
            if(motion > 1) motion = 1;
            if(motion < -1) motion = -1;

            if(Math.abs(motion) > Math.abs(__motion.y)) __motion.y = motion;
            __motion.y *= .87;
            if(__motion.y < .01 && __motion.y > .01) __motion.y = 0;


            effect.setVector2("motion", __motion);

        };
    }

    function buildDrunk()
    {
        var effectName = 'drunk',
            time = 0.1,
            __motion = new BABYLON.Vector2(0, 0);

        var postProcess = new BABYLON.PostProcess(effectName, "drunk", ["time", "motion", "screenSize"], null, 1, null, null, _engine, false);

        _dic[effectName].effect = new BABYLON.PostProcessRenderEffect(_engine, effectName, function() {return postProcess;});
        _pipeline.addEffect(_dic[effectName].effect);

        postProcess.onApply = function (effect)
        {
            time += .01;
            effect.setFloat("time", time);


            var motion = -_camera.inertialAlphaOffset * 100;
            if(motion > 1) motion = 1;
            if(motion < -1) motion = -1;

            if(Math.abs(motion) > Math.abs(__motion.x)) __motion.x = motion;
            __motion.x *= .87;
            if(__motion.x < .01 && __motion.x > .01) __motion.x = 0;

            motion = -_camera.inertialBetaOffset * 100;
            if(motion > 1) motion = 1;
            if(motion < -1) motion = -1;

            if(Math.abs(motion) > Math.abs(__motion.y)) __motion.y = motion;
            __motion.y *= .87;
            if(__motion.y < .01 && __motion.y > .01) __motion.y = 0;


            effect.setVector2("motion", __motion);

        };
    }

}());
