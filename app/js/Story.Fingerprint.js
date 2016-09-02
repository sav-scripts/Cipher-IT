/**
 * Created by sav on 2016/9/1.
 */


(function ()
{
    var $doms = {},
        _isHiding = true,
        _dialogText = '<span>嫌犯棄車匆匆逃逸，在現場掉了一把刻有</span><span class="green">Ｃ的鑰匙</span><span>，這也許是某種線索</span>';

    var self = window.Story.Fingerprint=
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

            ScalableContent.updateResizeAble();

            //Story.DialogText.show(_dialogText, null, cb);

            var tl = new TimelineMax;
            tl.set([$doms.container, $doms.content], {autoAlpha: 0});
            tl.to($doms.container, .4, {autoAlpha: 1});
            tl.to($doms.content, 1, {autoAlpha: 1, ease:Linear.easeNone}, 0);
            tl.add(cb);
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

            //Story.DialogText.hide();

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