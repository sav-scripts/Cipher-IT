/**
 * Created by sav on 2016/8/30.
 */
(function(){

    window.CustomCamera = CustomCamera;

    function CustomCamera(canvas, scene, sceneSize, startCameraRadius, dBetaLimitDeg)
    {
        this._canvas = canvas;
        this._scene = scene;

        var camera = this._camera = new BABYLON.ArcRotateCamera("camera1", 0, 0, 0, new BABYLON.Vector3(0, 0, -1), scene);
        //camera.fov = .8;
        camera.setTarget(new BABYLON.Vector3(0,0,0));

        camera.angularSensibilityX = 2500;
        camera.angularSensibilityY = 2500;


        camera.upperRadiusLimit = sceneSize - 10;
        camera.lowerRadiusLimit = .1;
        camera.radius = this._defaultCameraRadius = startCameraRadius;


        var dArc = this._dBetaLimitArc = Math.PI*dBetaLimitDeg/180;
        camera.upperBetaLimit = Math.PI*.5 + dArc;
        camera.lowerBetaLimit = Math.PI*.5 - dArc;

        this._tweenObj.alpha = this._tweenObj.targetAlpha = camera.alpha = Math.PI *1.90;
        this._tweenObj.beta = this._tweenObj.targetBeta = camera.beta;

        this._useDeviceOrientation = ($.browser.mobile && Modernizr.deviceorientation);

        this.setControlOn(true);
    }

    CustomCamera.prototype =
    {
        _canvas: null,
        _scene: null,

        _camera: null,

        _defaultCameraRadius: 0,
        _dBetaLimitArc: 0,

        _tweenObj:
        {
            pointerDownPosition: null,

            targetAlpha: 0,
            alpha:0,

            targetBeta: 0,
            beta: 0
        },

        _isControlOn: false,
        _useDeviceOrientation: false,

        setControlOn: function(b)
        {
            if(this._isControlOn == b) return;
            this._isControlOn = b;

            if(this._isControlOn)
            {
                bindControl.call(this);
            }
            else
            {
                unbindControl.call(this);
            }
        }
    };

    function bindControl()
    {
        //console.log(this._useDeviceOrientation);

        if(this._useDeviceOrientation)
        {

        }
        else
        {
            $(this._canvas).on("pointerdown", {self:this}, onPointerDown);
            $(window).on("pointermove", {self:this}, onPointerMove).on("pointerup", {self:this}, onPointerUp);
        }

    }

    function unbindControl()
    {
        if(this._useDeviceOrientation)
        {

        }
        else
        {
            $(this._canvas).unbind("pointerdown", onPointerDown);
            $(window).unbind("pointermove", onPointerMove).unbind("pointerup", onPointerUp);
        }
    }

    function onPointerDown(event)
    {
        var self = event.data.self;
        //console.log(self);
        self._tweenObj.pointerDownPosition = {x: event.clientX, y: event.clientY};
        //console.log(event);
        //self.setControlOn(false);
    }

    function onPointerMove(event)
    {
        var self = event.data.self;


        var startPosition = self._tweenObj.pointerDownPosition;
        if(startPosition)
        {
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
        self._camera.alpha = self._tweenObj.alpha;
    }


}());