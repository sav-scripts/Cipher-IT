/**
 * Created by sav on 2016/8/30.
 */
(function(){

    var _canvas,
        _engine,
        _scene;

    var self = window.StoryScene =
    {
        init: function(canvas, onReady)
        {
            _canvas = canvas;
            _engine = new BABYLON.Engine(_canvas, true);
        }
    };

}());