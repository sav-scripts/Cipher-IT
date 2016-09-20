/**
 * Created by sav on 2016/8/30.
 */
(function(){

    var PI = Math.PI,
        PI_HALF = PI * .5,
        PI_2 = PI*2;

    window.CustomCamera = CustomCamera;

    function CustomCamera(canvas, scene, sceneSize, startCameraRadius, dUpperBetaLimitDeg, dLowerBetaLimitDeg)
    {
        this._canvas = canvas;
        this._scene = scene;

        var camera = this._camera = new BABYLON.ArcRotateCamera("camera1", 0, 0, 0, new BABYLON.Vector3(0, 0, -1), scene);
        //camera.fov = .8;
        camera.setTarget(new BABYLON.Vector3(0,0,0));

        camera.angularSensibilityX = 2500;
        camera.angularSensibilityY = 2500;


        //camera.upperRadiusLimit = sceneSize - 10;
        //camera.lowerRadiusLimit = .1;
        camera.radius = this._defaultCameraRadius = startCameraRadius;


        //var dArc = this._dBetaLimitArc = PI*dBetaLimitDeg/180;
        camera.upperBetaLimit = PI_HALF + PI*dUpperBetaLimitDeg/180;
        camera.lowerBetaLimit = PI_HALF - PI*dLowerBetaLimitDeg/180;

        this._tweenObj.alpha = this._tweenObj.targetAlpha = camera.alpha = 0;
        this._tweenObj.beta = this._tweenObj.targetBeta = camera.beta;

        //this._useDeviceOrientation = ($.browser.mobile && Modernizr.deviceorientation);

        //this.setEnabled(true);
    }

    CustomCamera.prototype =
    {
        _canvas: null,
        _scene: null,

        _camera: null,

        _oldAlpha: null,
        _oldBeta: null,
        _oldPosition: null,
        _oldRadius: null,
        _oldRadius2: null,

        _defaultCameraRadius: 0,
        _dBetaLimitArc: 0,

        _cbOnDrag: null,

        _tweenObj:
        {
            pointerDownPosition: null,

            targetAlpha: 0,
            alpha:0,

            targetBeta: 0,
            beta: 0
        },

        _isEnabled: false,
        _useDeviceOrientation: false,

        listenDrag: function(cb)
        {
            this._cbOnDrag = cb;
        },

        setEnabled: function(b)
        {
            if(this._isEnabled == b) return;
            this._isEnabled = b;

            if(this._isEnabled)
            {
                bindControl.call(this);
            }
            else
            {
                unbindControl.call(this);
            }
        },

        getAlpha: function()
        {
            return this._camera.alpha;
        },

        lookAt: function(position, cb)
        {
            this._camera.alpha %= PI_2;

            this._oldAlpha = this._camera.alpha;
            this._oldBeta = this._camera.beta;

            var newAlpha = Math.atan2(-position.z, -position.x),
                length = Math.sqrt(position.x * position.x + position.z*position.z),
                newBeta = Math.atan2(-position.y, -length) - PI_HALF;

            if(newBeta < 0) newBeta += PI_2;

            if(Math.abs(this._oldAlpha - newAlpha) > PI)
            {
                (newAlpha > this._oldAlpha)? newAlpha -= PI_2: newAlpha += PI_2;
            }

            var tl = new TimelineMax;


            tl.to(this._camera, 1, {alpha: newAlpha, beta: newBeta, ease:Power1.easeInOut});

            tl.add(cb);

        },

        focusOn: function(position, cb)
        {
            var self = this;

            this._camera.alpha %= PI_2;

            this._oldAlpha = this._camera.alpha;
            this._oldBeta = this._camera.beta;

            var newAlpha = Math.atan2(-position.z, -position.x),
                length = Math.sqrt(position.x * position.x + position.z*position.z),
                newBeta = Math.atan2(-position.y, -length) - PI_HALF;

            if(newBeta < 0) newBeta += PI_2;

            if(Math.abs(this._oldAlpha - newAlpha) > PI)
            {
                (newAlpha > this._oldAlpha)? newAlpha -= PI_2: newAlpha += PI_2;
            }

            //console.log("old beta: " + this._oldBeta);
            //console.log("new beta: " + newBeta);

            //console.log("old alpha: " + this._oldAlpha);
            //console.log("new alpha: " + newAlpha);

            //var dAlpha = Math.abs(newAlpha - this._camera.alpha) % (PI_2),
            //    duration = dAlpha*5;
            //
            //console.log(duration);
            //
            //if(duration < .5) duration = .5;
            //if(duration > 1.5) duration = 1.5;
            //
            //TweenMax.to(this._camera, duration, {alpha: newAlpha, ease:Power1.easeInOut, onComplete: cb});

            //this._camera.setTarget(position);


            var tl = new TimelineMax;


            tl.to(this._camera, 1, {alpha: newAlpha, beta: newBeta, ease:Power1.easeInOut});

            tl.add(function()
            {
                //SP.play('zoom');
                SP.play('zoom', {delay:400});

                var radius = self._camera.position.subtract(position).length();

                self._oldPosition = self._camera.position.clone();
                self._oldRadius = self._camera.radius;
                self._oldRadius2 = radius;

                self._camera.setTarget(position);

                self._camera.radius = radius;
            });

            var t = tl.duration();

            tl.to(this._camera,1.5, {radius:60, ease:Linear.easeNone}, t);
            tl.to(this._camera, 1.5, {fov:1.6, ease:Linear.easeNone}, t);

            tl.add(cb);

            //this.resetCamera(newAlpha, 0, cb);

        },

        recover: function(cb)
        {
            var self = this;

            var tl = new TimelineMax;
            tl.to(this._camera, 1.5, {radius:this._oldRadius2, fov:.8, ease:Linear.easeNone});
            tl.add(function()
            {
                self._camera.setTarget(BABYLON.Vector3.Zero());
                self._camera.radius = self._oldRadius;

                var newAlpha = self._camera.alpha;
                if(Math.abs(self._oldAlpha - newAlpha) > PI)
                {
                    (newAlpha > self._oldAlpha)? newAlpha -= PI_2: newAlpha += PI_2;
                    self._camera.alpha = newAlpha;
                }


            });

            //tl.to(this._camera, 1, {alpha: this._oldAlpha, beta: this._oldBeta, radius: 75, fov:.8, ease:Power1.easeInOut});
            tl.to(this._camera, 1, {beta: PI *.5, radius: 75, fov:.8, ease:Power1.easeInOut});
            tl.add(cb);

        },

        resetCamera: function (alpha, beta, cb)
        {
            var alphaAnim 	= new BABYLON.Animation ("alphaAnim", "alpha", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
            var betaAnim 	= new BABYLON.Animation ("betaAnim", "beta", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

            var alphaKeys 	= [{frame: 0, value: this._camera.alpha}, {frame: 100, value: alpha}];
            //var betaKeys 	= [{frame: 0, value: this._camera.beta},  {frame: 100, value: 0}];

            alphaAnim.setKeys (alphaKeys);
            //betaAnim.setKeys (betaKeys);

            this._camera.animations.push (alphaAnim);
            //this._camera.animations.push (betaAnim);
            this._scene.beginAnimation (this._camera, 0, 100, false, 1, cb);

        }
    };

    function bindControl()
    {
        //console.log(this._useDeviceOrientation);
        var self = this;

        if(this._useDeviceOrientation)
        {
            this.handleOrientation = handleOrientation;
            window.addEventListener("deviceorientation", handleOrientation);

        }
        else
        {
            $(this._canvas).on("pointerdown", {self:this}, onPointerDown);
            $(window).on("pointermove", {self:this}, onPointerMove).on("pointerup", {self:this}, onPointerUp);
        }



        function handleOrientation(event)
        {

            //if((targetAlpha - self._tweenObj.alpha) > PI) self._tweenObj.alpha += PI * 2;
            //if((targetAlpha - self._tweenObj.alpha) < -PI_2) self._tweenObj.alpha -= PI * 2;

            var alpha = event.alpha,
                beta = event.beta;

            //if(Math.abs(alpha - self._tweenObj.alpha) > 180)
            //{
            //    (alpha > self._tweenObj.alpha)? self._tweenObj.alpha += 360: self._tweenObj.alpha -= 360;
            //}

            beta = 90 - (beta - 60) * .5;

            //TweenMax.killTweensOf(self._tweenObj);
            //TweenMax.to(self._tweenObj,.5,{alpha: alpha, beta: beta, onUpdate:updateCamera, onUpdateParams:[self]});

            //self._camera.alpha = alpha/180*PI;
            //self._camera.beta = beta/180*PI;

            var targetAlpha = alpha/180*PI,
                targetBeta = beta/180*PI;

            self._camera.alpha = self._camera.alpha%PI_2;
            if(Math.abs(targetAlpha - self._camera.alpha) > PI)
            {
                (targetAlpha > self._camera.alpha)? self._camera.alpha += PI_2: self._camera.alpha -= PI_2;
                console.log(self._camera.alpha);
            }

            self._camera.inertialAlphaOffset = (targetAlpha - self._camera.alpha)*.1;
            self._camera.inertialBetaOffset = (targetBeta - self._camera.beta)*.1;

        }

    }

    function unbindControl()
    {
        if(this._useDeviceOrientation)
        {
            window.removeEventListener("deviceorientation", this.handleOrientation);
        }
        else
        {
            $(this._canvas).unbind("pointerdown", onPointerDown);
            $(window).unbind("pointermove", onPointerMove).unbind("pointerup", onPointerUp);

            this._tweenObj.pointerDownPosition = null;
        }
    }

    function onPointerDown(event)
    {
        //console.log("on pointer down");
        var self = event.data.self;
        self._tweenObj.pointerDownPosition = {x: event.clientX, y: event.clientY};
    }

    function onPointerMove(event)
    {
        //console.log("on pointer move");
        var self = event.data.self;


        var startPosition = self._tweenObj.pointerDownPosition;
        if(startPosition)
        {
            if(self._cbOnDrag)
            {
                self._cbOnDrag.call();
                self._cbOnDrag = null;
            }

            var canvasWidth = $(self._canvas).width(),
                canvasHeight = $(self._canvas).height(),
                dx = event.clientX - startPosition.x,
                dy = event.clientY - startPosition.y,
                dAlpha = dx / canvasWidth * .2,
                dBeta = dy / canvasHeight * .1;

            self._tweenObj.pointerDownPosition = {x: event.clientX, y: event.clientY};
            //console.log(dAlpha);
            //self._camera.alpha += dAlpha;
            //self._camera.beta += dBeta;

            //self._tweenObj.targetAlpha += dAlpha;
            //self._camera.inertialAlphaOffset = self._tweenObj.targetAlpha - self._camera.alpha;

            //var duration = Math.abs(self._tweenObj.targetAlpha - self._tweenObj.alpha) * 5;
            //console.log(duration);

            //TweenMax.to(self._tweenObj, duration, {alpha: self._tweenObj.targetAlpha, onUpdate: updateCamera, onUpdateParams: [self]});


            self._camera.inertialAlphaOffset += dAlpha;
            self._camera.inertialBetaOffset += dBeta;


        }
    }

    function onPointerUp(event)
    {
        var self = event.data.self;
        self._tweenObj.pointerDownPosition = null;
    }

    function updateCamera(self)
    {
        self._camera.alpha = self._tweenObj.alpha/180*PI;
        var beta = self._tweenObj.beta/180*PI;
        if(beta > self._camera.upperBetaLimit) beta = self._camera.upperBetaLimit;
        if(beta < self._camera.lowerBetaLimit) beta = self._camera.lowerBetaLimit;
        self._camera.beta = beta;
    }


}());