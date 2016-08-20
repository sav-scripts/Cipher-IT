/**
 * Created by sav on 2016/8/17.
 */
(function(){

    var $zipInput,
        _version = "0.0.2";

    var self = window.DataManager =
    {
        BILLBOARD_FOLDER_PATH: "textures/billboard/",
        PNG_HEAD: "data:image/png;base64,",
        JPEG_HEAD: "data:image/jpeg;base64,",

        init: function()
        {
            setupInput();

            setupGUI();
        },

        loadFromZip: function(zipPath)
        {
            Loading.progress("載入場景資料中").show();

            JSZipUtils.getBinaryContent(zipPath, function(err, data)
            {
                if(err) {
                    throw err; // or handle err
                }

                JSZip.loadAsync(data).then(handleZip);
            });
        },

        loadFromExtracedZip: function()
        {

        },

        _triggerLoad: function()
        {
            $zipInput.value = null;
            $zipInput.click();
        },

        _triggerSave: function()
        {
            save();
        }
    };

    function setupGUI()
    {
        Main.gui.add(self, '_triggerLoad').name("讀入場景");
        Main.gui.add(self, '_triggerSave').name("儲存場景");
    }

    function save()
    {

        Loading.progress('打包檔案中').show();

        var backgroundImageData = SphereScene.getBackgroundData();

        if(!backgroundImageData)
        {
            alert("缺乏背景影像，請選取或讀入不同場景圖片");
            Loading.hide();
        }
        else
        {
            var billboardData = BillboardEditor.getExportData();

            var imageArray = [backgroundImageData].concat(billboardData.imageArray);

            var out =
            {
                version: _version,
                backgroundImage: backgroundImageData.name,
                backgroundImageHead: backgroundImageData.imageHead,
                billboardData: billboardData.dataArray
            };


            var zip = new JSZip();

            zip.file("config.json", JSON.stringify(out));

            processImages(zip, imageArray, function()
            {
                console.log("image process complete");

                zip.generateAsync({type:"blob"}).then(function(content)
                {
                    saveAs(content, "scenedata.zip");

                    Loading.hide();
                });

            });

        }
    }

    function setupInput()
    {
        $zipInput = $("#scene-input");

        var inputDom = $zipInput[0];

        $zipInput.on("change", function()
        {
            Loading.progress('載入場景資料中').show();
            loadFile(inputDom);
        });

        function loadFile(inputDom)
        {
            if (inputDom.files && inputDom.files[0])
            {
                var f = inputDom.files[0];
                JSZip.loadAsync(f).then(handleZip);
            }
        }
    }

    function handleZip(zip)
    {
        var zipData = zip.file("config.json");
        if(zipData)
        {
            zipData.async("string").then(function(dataString)
            {
                var data;

                try{
                    data = JSON.parse(dataString);
                }catch(e)
                {
                    alert("file error: illegal data format");
                    return;
                }

                if(data.version !== _version)
                {
                    alert("file error: file version ["+data.version+"] outdated");
                }
                else
                {
                    Loading.progress('資料分析中').show();

                    var billbaordData = data.billboardData;

                    extractImages(zip, function(imageDic)
                    {
                        BillboardEditor.applyImportData(billbaordData, imageDic);

                        //console.log(data.backgroundImage);
                        //console.log(data.backgroundImageHead);
                        //console.log(imageDic['textures/'+data.backgroundImage]);

                        SphereScene.applyBase64Background(data.backgroundImageHead + imageDic['textures/'+data.backgroundImage]);

                        Loading.hide();
                    });
                }
            });
        }
        else
        {
            alert("file error: missing data");
        }
    }

    function extractImages(zip, onComplete)
    {
        var imageDic = {}, count = 0;

        zip.folder("textures/").forEach(function(relativePath, zipEntry)
        {
            if(!zipEntry.dir)
            {
                count++;
                zip.file(zipEntry.name).async("base64").then(function (data)
                {
                    count --;
                    //console.log("data = " + data);
                    imageDic[zipEntry.name] = data;

                    if(count == 0) onComplete.call(null, imageDic);
                });
            }
        });

        if(count == 0) onComplete.call(null, imageDic);
    }

    function processImages(zip, imageArray, onComplete)
    {
        var index = -1;

        execute();

        function execute()
        {
            index++;
            if(index >= imageArray.length)
            {
                onComplete.call();
                return;
            }

            var imageObject = imageArray[index];
            if(imageObject.isDataUrl)
            {

                zip.file(imageObject.folderPath + imageObject.name, imageObject.data, {base64:true});
                execute();
            }
            else
            {

                JSZipUtils.getBinaryContent(imageObject.data, function (err, data)
                {
                    if(err) { throw err; }

                    zip.file(imageObject.folderPath + imageObject.name, data, {binary:true});
                    execute();
                });
            }

        }
    }

}());

(function(){

    window.ImageObject = ImageObject;

    function ImageObject(name, folderPath, data, isDataUrl, imageHead)
    {
        this.name = name;
        this.data = data;
        this.folderPath = folderPath;
        this.isDataUrl = isDataUrl;
        this.imageHead = imageHead

        //if(isDataUrl)

        //var extension = imageSrc.split(".");
        //extension = extension.pop();
        //
        ////console.log(extension);
        //if(extension == 'png') imageHead = DataManager.PNG_HEAD;
        //if(extension == 'jpg' || extension == 'jpeg') imageHead = DataManager.JPEG_HEAD;
    }

    ImageObject.prototype =
    {
        name: null,
        data: null,
        folderPath: null,
        isDataUrl: false,
        imageHead: null
    };


    ImageObject.HandleImageSrc = function(imageSrc, isDataUrl)
    {
        var imageHead;
        if(isDataUrl)
        {
            var base64String = imageSrc,
            index = base64String.indexOf(',')+1;

            imageHead = base64String.substr(0,index);

            imageSrc = base64String.substr(index);
        }
        else
        {
            var extension = imageSrc.split(".");
            extension = extension.pop();

            //console.log(extension);
            if(extension == 'png') imageHead = DataManager.PNG_HEAD;
            if(extension == 'jpg' || extension == 'jpeg') imageHead = DataManager.JPEG_HEAD;
        }

        return {imageSrc: imageSrc, imageHead: imageHead};
    };

}());