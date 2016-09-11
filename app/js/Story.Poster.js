/**
 * Created by sav on 2016/9/1.
 */


(function ()
{
    var $doms = {},
        _ba,
        _isHiding = true,
        _dialogText = '<span>這是海報的一角！</span><span class="green">地圖</span><span>似乎在哪裡看過，這絕對不是巧合</span>';

    var self = window.Story.Poster =
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

            _ba = new BackgroundAnimation($doms.container);

            $doms.container.detach();

            return self;
        },
        show: function (cb)
        {
            if (!_isHiding) return;
            _isHiding = false;


            Story.setPhaseTo(StoryPhases.BILLBOARD);

            $doms.parent.append($doms.container);

            $doms.btnClose.toggleClass("showing-mode", true);

            ScalableContent.updateResizeAble();

            Story.DialogText.show(_dialogText, null, cb);

            TweenMax.set($doms.container, {autoAlpha: 1});
            TweenMax.set($doms.content, {autoAlpha: 0});

            _ba.show(function()
            {
                TweenMax.to($doms.content, 1, {autoAlpha: 1, ease:Linear.easeNone});
            });

        },
        hide: function (cb)
        {
            if (_isHiding) return;
            _isHiding = true;

            $doms.btnClose.toggleClass("showing-mode", false);

            Story.DialogText.hide();

            TweenMax.to($doms.content,.4, {autoAlpha: 0, ease:Linear.easeNone});

            _ba.hide(function()
            {
                $doms.container.detach();
                if (cb) cb.apply();
            });
        }

    };

}());