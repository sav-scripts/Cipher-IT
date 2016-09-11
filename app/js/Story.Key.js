/**
 * Created by sav on 2016/9/1.
 */


(function ()
{
    var $doms = {},
        _isHiding = true,
        _ba,
        _dialogText = '<span>嫌犯棄車匆匆逃逸，在現場掉了一把刻有</span><span class="green">Ｃ的鑰匙</span><span>，這也許是某種線索</span>';

    var self = window.Story.Key=
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

            TweenMax.to($doms.content,.4, {autoAlpha: 0, ease:Linear.easeNone});

            _ba.hide(function()
            {
                $doms.container.detach();
                if (cb) cb.apply();
            });
        }

    };

}());