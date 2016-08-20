(function(){

    window.Tools =
    {

        setupImageInput: function(inputDom, onLoad, returnAsImage)
        {
            $(inputDom).on("change", function()
            {
                Loading.progress('empty').show();
                loadFile(inputDom);


            });

            function loadFile(inputDom)
            {
                if (inputDom.files && inputDom.files[0])
                {
                    var reader = new FileReader();

                    reader.onload = function ()
                    {
                        if(returnAsImage)
                        {
                            loadImg(reader.result);
                        }
                        else
                        {
                            //console.log(reader.result);
                            Loading.hide();
                            if(onLoad) onLoad.call(null, reader.result);
                        }
                    };

                    reader.readAsDataURL(inputDom.files[0]);
                }
            }


            function loadImg(src)
            {
                var img = document.createElement("img");

                img.onload = function()
                {
                    Loading.hide();
                    if(onLoad) onLoad.call(null, img);
                };

                img.src = src;
            }

        },

        createNodeSample: function(scene, color, size)
        {
            color = color || new BABYLON.Color3.Blue();
            size = size || 1;

            var node, boxmat;

            node = BABYLON.Mesh.CreateBox("nodeSample", size, scene);

            boxmat = new BABYLON.StandardMaterial("boxmat", scene);

            boxmat.emissiveColor = color;

            node.material = boxmat;

            node.setEnabled(false);

            return node;
        },

        generateSkyboxTexture: function()
        {
            var canvas = document.createElement("canvas"),
                ctx = canvas.getContext('2d');

            var sampleSize = 200;


            canvas.width = sampleSize*6;
            canvas.height = sampleSize*3;
            canvas.className = 'test-canvas';
        //        document.body.appendChild(canvas);
            $(canvas).css("width", canvas.width).css('height', canvas.height);

            var image = document.createElement("img");
            image.src = "images/01.jpg";
            image.onload = function()
            {
                ctx.drawImage(image, 0, 0, image.width, image.height, 0,0,canvas.width, canvas.height);
                var imageData = ctx.getImageData(0,0,canvas.width, canvas.height);

                var i,
                    data = imageData.data,
                    float32Array = new Float32Array(imageData.width*imageData.height*3),
                    index = 0;

                for(i=0;i<data.length;i+=4)
                {
                    float32Array[index] = data[i];
                    float32Array[index+1] = data[i+1];
                    float32Array[index+2] = data[i+2];
                    index+=3;
                }

                var cubeMapInfo = BABYLON.Internals.PanoramaToCubeMapTools.ConvertPanoramaToCubemap(float32Array, canvas.width, canvas.height, sampleSize);

                var pCanvas = document.createElement("canvas"),
                    pCtx = pCanvas.getContext('2d');

                pCanvas.width = sampleSize*4;
                pCanvas.height = sampleSize*3;
                pCanvas.className = 'test-canvas';
                document.body.appendChild(pCanvas);
                $(pCanvas).css("width", pCanvas.width).css('height', pCanvas.height);

                handleFace(cubeMapInfo, pCtx, 0, 1, 'left');
                handleFace(cubeMapInfo, pCtx, 1, 1, 'front');
                handleFace(cubeMapInfo, pCtx, 2, 1, 'right');
                handleFace(cubeMapInfo, pCtx, 3, 1, 'back');
                handleFace(cubeMapInfo, pCtx, 1, 0, 'up');
                handleFace(cubeMapInfo, pCtx, 1, 2, 'down');

            };


            function handleFace(cubeMapInfo, ctx, xIndex, yIndex, faceName)
            {

                var faceImageData = ctx.createImageData(sampleSize, sampleSize),
                    float32Array = cubeMapInfo[faceName],
                    data = faceImageData.data,
                    index = 0,
                    i;

                for(i=0;i<data.length;i+=4)
                {
                    data[i] = float32Array[index];
                    data[i+1] = float32Array[index+1];
                    data[i+2] = float32Array[index+2];
                    data[i+3] = 255;

                    index += 3;
                }
                ctx.putImageData(faceImageData, xIndex*sampleSize, yIndex*sampleSize);

            }
        }
    };

}());
