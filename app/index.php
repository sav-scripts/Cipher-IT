<?php
$titles = array(
    "normal" => "探索秘酩之謎",
    "fingerprint" => "失蹤的Cipher 秘酩黑仍下落不明",
    "badend" => "你要放棄尋找 Cipher 秘酩黑了嗎？",
    "happyend" => "尋獲失蹤的神秘 Cipher 祕酩黑!"
);

$descriptions = array(
    "normal" => "秘酩黑限量瓶，是一款完全沒有品酩筆記的威士忌，所有的謎題都隱藏於內斂沉潛的黑瓶中。想知道格蘭利威Cipher 秘酩黑限量瓶將釋放什麼樣的風味與香氣?一切都可能因為你的決定而有所不同！",
    "fingerprint" => "世紀最大劫案 Cipher 秘酩黑，至今仍下落不明，神祕的指紋會是竊賊的嗎?如果你自稱破案高手，歡迎來挑戰！",
    "badend" => "真可惜，你差一點就能找到失蹤的 Cipher 秘酩黑了！沒關係，只要留下報名資料，也能參加抽獎。歡迎再來挑戰，並號召好友一起破案喔~",
    "happyend" => "尋獲失蹤的 Cipher 秘酩黑！在這麼短的時間內能偵破這宗懸案，絕不簡單！想知道誰才是真正的劫犯？立刻加入偵辦行列吧！"
);

$pictures = array(
    "normal" => "http://www.theglenlivet.com.tw/events/2016Cipher/dist/misc/share_site.jpg",
    "fingerprint" => "http://www.theglenlivet.com.tw/events/2016Cipher/dist/misc/share_fail.jpg",
    "badend" => "http://www.theglenlivet.com.tw/events/2016Cipher/dist/misc/share_fail.jpg",
    "happyend" => "http://www.theglenlivet.com.tw/events/2016Cipher/dist/misc/share_success.jpg"
);

$shareType = @$_GET['sharetype'];
if(!$shareType) $shareType = 'normal';
if(!@$titles[$shareType]) $shareType = 'normal';

//echo $shareType."<br/>";

$url =  'http://'.$_SERVER['HTTP_HOST'].dirname($_SERVER['PHP_SELF']).'/?sharetype='.$shareType;
$title = $titles[$shareType];
$description = $descriptions[$shareType];
$picture = $pictures[$shareType];

//echo $title."<br/>".$description."<br/>".$picture;

?>

<!DOCTYPE html>
<html>
<head lang="en">
    <title>探索秘酩之謎</title>
    <link rel="icon" href="misc/icon.png" type="image/x-icon"/>
    <meta charset="UTF-8">
    <meta name="description" content="<?= $description ?>">

    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="mobile-web-app-capable" content="yes">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">

    <meta property="fb:app_id" content="181926195577872"/>
    <meta property="og:title" content="<?= $title ?>" />
    <meta property="og:type" content="activity" />
    <meta property="og:url" content="<?= $url ?>" />
    <meta property="og:description" content="<?= $description ?>" />

    <meta property="og:image" content="<?= $picture ?>" />
    <meta property="og:image:type" content="image/jpeg">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">


    <!--<meta name="viewport" content="width=device-width, initial-scale=1">-->
    <meta id="myViewport" name="viewport" content="width=640,user-scalable=0">
    <!--<meta id="myViewport" name="viewport" content="width=640,user-scalable=1">-->
    <!--<meta id="myViewport" name="viewport" content="width=device-width">-->

    <link rel="stylesheet" href="styles/main.css">

</head>

<body onload="Main.init();">

    <!-- Google Tag Manager -->
    <noscript><iframe src="//www.googletagmanager.com/ns.html?id=GTM-PV2D26"
                      height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            '//www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-PV2D26');</script>
    <!-- End Google Tag Manager -->

    <div id="loading">

        <div id="loading-icon"></div>
        <div id="loading-text">99</div>

    </div>

    <script src="js/Loading.js"></script>
    <script>
        Loading.progress('').show();
    </script>

    <div id="invisible-container"></div>
    <div id="scene-container">


    </div>

    <div id="landing-page">

        <!--<div class="layout"></div>-->
        <div class="content">

            <div class="logo"></div>

            <div class="gif-1"></div>
            <div class="gif-2"></div>
            <div class="gif-3"></div>

            <div class="birthday-fields">
                <select class="select-year form_input_select" name="year" title="">
                    <option>年</option>
                </select>
                <select class="select-month form_input_select" name="month" title="">
                    <option>月</option>
                </select>
                <select class="select-day form_input_select" name="day" title="">
                    <option>日</option>
                </select>
            </div>


            <div class="btn-send"><div class="normal-state"></div><div class="hover-state"></div></div>

        </div>

    </div>

    <div id="logo" class="hide-mode">
    </div>

    <div id="menu">


        <div class="icon hide-mode">
            <div class="bar-1"></div>
            <div class="bar-2"></div>
            <div class="bar-3"></div>
        </div>
        <div class="container">

            <div class="wrapper">
                <!--<div class="layout"></div>-->

                <div class="button-group">
                    <div class="item-1"><div class="normal-state"></div><div class="hover-state"></div></div>
                    <div class="item-2"><div class="normal-state"></div><div class="hover-state"></div></div>
                    <div class="item-3"><div class="normal-state"></div><div class="hover-state"></div></div>
                    <div class="item-4 hide-mode"><div class="normal-state"></div><div class="hover-state"></div></div>
                    <div class="item-5"><div class="normal-state"></div><div class="hover-state"></div></div>
                    <div class="item-6"><div class="normal-state"></div><div class="hover-state"></div></div>
                    <div class="item-7"><div class="normal-state"></div><div class="hover-state"></div></div>
                    <div class="item-8"><div class="normal-state"></div><div class="hover-state"></div></div>
                    <div class="item-9"><div class="normal-state"></div><div class="hover-state"></div></div>
                    <div class="item-10"><div class="normal-state"></div><div class="hover-state"></div></div>
                    <div class="item-11"><div class="normal-state"></div><div class="hover-state"></div></div>
                    <div class="item-12"><div class="normal-state"></div><div class="hover-state"></div></div>
                    <div class="item-13"><div class="normal-state"></div><div class="hover-state"></div></div>
                </div>

            </div>
        </div>

    </div>

    <div id="sound-switch" class="hide-mode">

        <div class="btn-sound"><div class="normal-state"></div><div class="hover-state"></div></div>

    </div>

    <div class="footer"></div>

    <div id="rotate-screen-hint" class="hide-mode">
        <div class="pic"></div>
    </div>

    <div id="fb-root"></div>

    <script src="js/lib/LAB.min.js"></script>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/1.19.0/TweenMax.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/1.19.0/plugins/ModifiersPlugin.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/1.19.0/plugins/ScrollToPlugin.min.js"></script>

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>
    <script>window.jQuery || document.write('<script src="js/lib/jquery.1.11.3.min.js"><\/script>')</script>
    <script src="js/lib/js.cookie.js"></script>

    <script src="js/lib/pep.min.js"></script>
    <script src="js/lib/jquery.waitforimages.min.js"></script>
    <script src="js/lib/jquery.mousewheel.min.js"></script>
    <script src="js/lib/jquery.detectmobilebrowser.min.js"></script>
    <script src="js/lib/jquery.lettering-0.6.1.min.js"></script>

    <!-- build:js js/optimized.js -->
    <script src="js/lib/modernizr-custom.js"></script>
    <script src="js/lib/FBHelper.1.0.2.js"></script>
    <script src="js/lib/FormHelper.0.0.5.js"></script>
    <script src="js/lib/Helper.1.0.4.js"></script>
    <script src="js/lib/SceneHandler.1.0.5.js"></script>
    <script src="js/lib/Logger.js"></script>
    <script src="js/ApiProxy.js"></script>
    <script src="js/lib/Utility.0.0.15.js"></script>
    <script src="js/lib/ScalableContent.1.0.1.js"></script>
    <script src="js/Main.js"></script>
    <script src="js/MyTools.js"></script>
    <script src="js/UI.js"></script>
    <script src="js/LandingPage.js"></script>
    <script src="js/Intro.js"></script>
    <script src="js/Story.js"></script>
    <script src="js/Story.Scene.js"></script>
    <script src="js/Story.ExitConfirm.js"></script>
    <script src="js/Story.Key.js"></script>
    <script src="js/Story.Phone.js"></script>
    <script src="js/Story.Poster.js"></script>
    <script src="js/Story.Photos.js"></script>
    <script src="js/Story.Billboard.js"></script>
    <script src="js/Story.Fingerprint.js"></script>
    <script src="js/Story.Medal.js"></script>
    <script src="js/Story.Briefcase.js"></script>
    <script src="js/Story.DialogTrigger.js"></script>
    <script src="js/Story.DialogText.js"></script>
    <script src="js/Story.ObjectManager.js"></script>
    <script src="js/Story.Evidences.js"></script>
    <script src="js/StoryRule.js"></script>
    <script src="js/HappyEnd.js"></script>
    <script src="js/Roulette.js"></script>
    <script src="js/Notes.js"></script>
    <script src="js/Participate.js"></script>
    <script src="js/ParticipateRule.js"></script>
    <script src="js/CustomCamera.js"></script>
    <script src="js/RainMaker.js"></script>
    <script src="js/PostProcessLib.js"></script>
    <script src="../editor/js/DataManager.js"></script>
    <script src="../editor/js/ShaderLoader.js"></script>
    <script src="../editor/js/MaterialLib.js"></script>
    <script src="../editor/js/ShapeEditor.js"></script>
    <script src="../editor/js/BillboardEditor.js"></script>
    <script src="../editor/js/LightEditor.js"></script>
    <script src="../editor/js/Tools.js"></script>
    <script src="../editor/js/lib/FileSaver.min.js"></script>
    <script src="../editor/js/lib/pnltri.js"></script>
    <script src="../editor/js/lib/jszip.js"></script>
    <script src="../editor/js/lib/jszip-utils.min.js"></script>
    <!-- endbuild -->
</body>
</html>