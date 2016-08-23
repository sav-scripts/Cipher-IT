/**
 * Created by sav on 2016/8/23.
 */
(function(){

    var $doms = {},
        _isOpen = false,
        _iconTl;

    var self = window.Menu =
    {
        init: function()
        {
            $doms.container = $("#menu");

            $doms.buttonContainer = $doms.container.find(".container");

            $doms.icon = $doms.container.find(".icon").on("mouseover", function()
            {
                if(_isOpen) return;
                _iconTl.tweenTo('hoverComplete');
            }).on("mouseout", function(event)
            {
                if(_isOpen) return;
                if($.contains($doms.icon[0], event.relatedTarget) === false && event.relatedTarget !== $doms.icon[0])
                {
                    _iconTl.tweenTo('start');
                }
            }).on(_CLICK_, function()
            {
                _isOpen? self.close(): self.open();
            });

            setupIconTL();

            setupButton(6, 'participate to part2', function()
            {
                Participate.toContent('part2');
            });

            setupButton(7, 'participate to part3', function()
            {
                Participate.toContent('part3');
            });


            //self.open();
        },

        open: function()
        {
            if(_isOpen) return;
            _isOpen = true;

            _iconTl.tweenTo('end');

            $doms.buttonContainer.toggleClass("open-mode", true);
            $("#scene-container").toggleClass("menu-open-mode", true);
            $("#footer").toggleClass("menu-open-mode", true);

        },

        close: function()
        {
            if(!_isOpen) return;
            _isOpen = false;

            _iconTl.tweenTo('start');

            $doms.buttonContainer.toggleClass("open-mode", false);
            $("#scene-container").toggleClass("menu-open-mode", false);
            $("#footer").toggleClass("menu-open-mode", false);
        }
    };

    function setupButton(divIndex, name, onClick)
    {
        var $button = $doms.container.find(".item-" + divIndex);
        $button.on(_CLICK_, function()
        {
           self.close();
            if(onClick) onClick.call();
        });
    }

    function setupIconTL()
    {
        $doms.bar1 = $doms.icon.find(".bar-1");
        $doms.bar2 = $doms.icon.find(".bar-2");
        $doms.bar3 = $doms.icon.find(".bar-3");

        var bars = [$doms.bar1[0], $doms.bar2[0], $doms.bar3[0]];

        var tl = _iconTl = new TimelineMax({paused:true});
        tl.addLabel("start");

        tl.set($doms.bar1, {marginTop: -9, transformOrigin:"center center"});
        tl.set($doms.bar2, {marginTop: -1, transformOrigin:"center center"});
        tl.set($doms.bar3, {marginTop: 7, transformOrigin:"center center"});
        tl.to($doms.bar1,.4, {marginTop: -1, ease:Power1.easeIn}, 0);
        tl.to($doms.bar3,.4, {marginTop: -1, ease:Power1.easeIn}, 0);
        tl.set($doms.bar2, {autoAlpha: 0});
        tl.set($doms.bar1, {marginLeft:-1, width: 2, height: 2});
        tl.to($doms.bar1,.4, {marginTop:-6, height: 12, ease:Power1.easeOut});
        tl.addLabel("hoverComplete");
        tl.to($doms.bar1,.4, {rotation: 45});
        tl.to($doms.bar3,.4, {rotation: 45}, "-=.4");
        tl.addLabel("end");
    }

}());