/**
 * Created by sav on 2016/8/15.
 */
(function(){

    var self = window.Main =
    {
        gui: null,
        guiWidth: 250,

        init: function()
        {
            KeyboardControl.init(false, false);

            //console.log(String.fromCharCode(90));
            //console.log("Z".charCodeAt(0));

            var canvas = document.getElementById('render-canvas'),
                engine = new BABYLON.Engine(canvas, true);

            //engine.setAlphaMode(BABYLON.Engine.ALPHA_COMBINE);

            setupGUI();

            ShaderLoader.loadFiles(["shape", "for-scene"],function()
            {
                SpehereScene.init(canvas, engine);
            });

            window.addEventListener("resize", function () {
                engine.resize();
            });
        }
    };

    function setupGUI()
    {
        // prefix
        dat.GUI.prototype.removeFolder = function(name) {


            var folder = this.__folders[name];
            if (!folder) {
                return;
            }



            folder.close();
            this.__ul.removeChild(folder.domElement.parentNode);
            delete this.__folders[name];
            this.onResize();
        };

        // prefix
        dat.GUI.prototype.resetFolderLabel = function(name, label) {


            var folder = this.__folders[name];
            if (!folder) {
                return;
            }

            //console.log(folder.domElement.innerHTML);

            $(folder.domElement).find(".title").text(label);
            this.onResize();
        };


        var gui = self.gui = new dat.GUI({width: Main.guiWidth});

        var obj =
        {
            changeFullScreen: function()
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
        };

        gui.add(obj, 'changeFullScreen').name("全螢幕模式切換");
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