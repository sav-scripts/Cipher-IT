/**
 * Created by sav on 2016/9/11.
 */


(function(){

    window.MyTools =
    {
        setupInput: function($input, activeHint, maxLength, toUpperCase)
        {
            var defaultText = $input.val();

            if(activeHint)
            {
                $input.on("focus", function()
                {
                    $input.toggleClass("hint-mode", false);
                    if($input.val() == defaultText) $input.val('');
                });

                $input.on("blur", function()
                {
                    if($input.val() == '')
                    {
                        $input.val(defaultText);
                        $input.toggleClass("hint-mode", true);
                    }
                    else
                    {
                        $input.toggleClass("hint-mode", false);
                    }
                });

                $input._checkOk = function()
                {
                    return !($input.val() == defaultText);
                };
            }

            $input.on("input", function()
            {
                if(toUpperCase)
                {
                    $input.val($input.val().toUpperCase());
                }
                if(maxLength && $input.val().length > maxLength)
                {
                    $input.val($input.val().substr(0, maxLength));
                }
            });

        }

    };

}());

(function(){

    window.BackgroundAnimation = BackgroundAnimation;

    function BackgroundAnimation($dom)
    {
        this.$dom = $dom;

        $dom.css("background-color", 'transparent');

    }

    function update(self)
    {
        var fadeSize = 1,
            progress, start, end;
        if(self.progress <= .5)
        {
            progress = self.progress * 2 * (1 + fadeSize);
            start = (progress - fadeSize) * 100;
            end = progress * 100;

            //self.$dom.css("background-image", "linear-gradient(to top, rgba(0, 0, 0, .85) "+start+"%, rgba(0, 0, 0, 0) "+end+"%)");
            self.$dom.css("background-image", "radial-gradient(rgba(0, 0, 0, .85) "+start+"%, rgba(0, 0, 0, 0) "+end+"%)");
        }
        else
        {
            progress = (self.progress -.5) * 2 * (1 + fadeSize);
            start = (progress - fadeSize) * 100;
            end = progress * 100;

            //self.$dom.css("background-image", "linear-gradient(to bottom, rgba(0, 0, 0, 0) "+start+"%, rgba(0, 0, 0, .85) "+end+"%)");
            self.$dom.css("background-image", "radial-gradient(rgba(0, 0, 0, 0) "+start+"%, rgba(0, 0, 0, .85) "+end+"%)");
        }
    }

    BackgroundAnimation.prototype =
    {
        progress: 0,
        $dom: null,
        tl: null,
        show: function(cb)
        {
            var tl = new TimelineMax();
            tl.set(this,{progress:0});
            tl.to(this, 1.1, {progress:.5, ease:Power1.easeOut, onUpdate: update, onUpdateParams:[this]});
            if(cb) tl.add(cb, "-=.5");
        },

        hide: function(cb)
        {
            var tl = new TimelineMax();
            tl.set(this,{progress:.5});
            tl.to(this, 1.1, {progress:1, ease:Power1.easeIn, onUpdate: update, onUpdateParams:[this]});
            if(cb) tl.add(cb);
        }
    };



}());