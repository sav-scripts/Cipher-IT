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
            "scene": {label: "雜訊 + 動態模糊", enabled: false, effect: null}
        };

    var self = window.PostProcessLib =
    {
        init: function(engine, scene, camera)
        {
            _engine = engine;
            _scene = scene;
            _camera = camera;

            _pipeline = new BABYLON.PostProcessRenderPipeline(engine, SCENE_PIPELINE_NAME);

            buildSceneEffect();

            _scene.postProcessRenderPipelineManager.addPipeline(_pipeline);
            _scene.postProcessRenderPipelineManager.attachCamerasToRenderPipeline(SCENE_PIPELINE_NAME, camera);

            for(var key in _dic)
            {
                if(!_dic[key].enabled)
                {
                    _scene.postProcessRenderPipelineManager.disableEffectInPipeline(SCENE_PIPELINE_NAME, key, _camera);
                }
            }
        },

        getEffect: function(name)
        {
            return _dic[name];
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

    function buildSceneEffect()
    {
        var effectName = 'scene',
            time = 0.1,
            __motion = new BABYLON.Vector2(0, 0);

        //var postProcess = new BABYLON.PostProcess(effectName, effectName, ["time", "motion", 'radialMotionPower'], ['videoTexture'], 1, null, null, _engine, false);
        var postProcess = new BABYLON.PostProcess(effectName, effectName, ["time", "motion", 'radialMotionPower'], null, 1, null, null, _engine, false);

        var obj = _dic[effectName];

        obj.effect = new BABYLON.PostProcessRenderEffect(_engine, effectName, function() {return postProcess;});
        _pipeline.addEffect(obj.effect);

        var tweenObj = {radialMotionPower: 0};

        //var tl = new TimelineMax({repeat:-1});
        //tl.to(tweenObj, 1, {radialMotionPower: 1, ease:Power1.easeIn});
        //tl.to(tweenObj, 1, {radialMotionPower: 0, ease:Power1.easeOut});

        obj.raidalMotionTo = function(power, duration, ease, cb)
        {
            if(!ease) ease = Power1.easeInOut;

            if(duration == 0)
            {
                tweenObj.radialMotionPower = power;
                if(cb) cb.call();
                return;
            }

            var tl = new TimelineMax;
            tl.to(tweenObj, duration, {radialMotionPower: power, ease:ease});
            if(cb) tl.add(cb);
        };


        //var videoTexture = new BABYLON.VideoTexture("video", ["misc/rain.webm"], _scene, true, false);

        postProcess.onApply = function (effect)
        {
            //effect.setTexture('videoTexture', videoTexture);

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

            effect.setFloat('radialMotionPower', tweenObj.radialMotionPower);

        };
    }

}());
