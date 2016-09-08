/**
 * Created by sav on 2016/9/1.
 */


(function ()
{
    var $doms = {},
        _isHiding = true,
        _dialogText = '<span>這些是我前一小時拍的照片，不知道能不能給您一點幫助？</span>';

    var self = window.Story.Photos=
    {
        needHideUI: true,

        init: function ($container)
        {
            $doms.container = $container;
            $doms.parent = $container.parent();

            $doms.content = $doms.container.find(".content");

            $doms.btnClose = $doms.container.find(".btn-close").on(_CLICK_, function()
            {
                SceneHandler.toHash("/Story");
            });

            $doms.container.detach();

            return self;
        },
        show: function (cb)
        {
            if (!_isHiding) return;
            _isHiding = false;

            $doms.parent.append($doms.container);

            $doms.btnClose.toggleClass("showing-mode", true);


            Story.ObjectManager.setDialogToNormal("/Backpacker");

            ScalableContent.updateResizeAble();

            Story.DialogText.show(_dialogText, null, cb);

            var tl = new TimelineMax;
            tl.set([$doms.container, $doms.content], {autoAlpha: 0});
            tl.to($doms.container, .4, {autoAlpha: 1});
            tl.to($doms.content, 1, {autoAlpha: 1, ease:Linear.easeNone}, 0);
            //tl.add(function ()
            //{
            //    if (cb) cb.apply();
            //});

        },
        hide: function (cb)
        {
            if (_isHiding) return;
            _isHiding = true;

            $doms.btnClose.toggleClass("showing-mode", false);

            Story.DialogText.hide();

            var tl = new TimelineMax;
            tl.to($doms.container, .4, {autoAlpha: 0});
            tl.add(function ()
            {
                $doms.container.detach();
                if (cb) cb.apply();
            });
        }

    };

}());