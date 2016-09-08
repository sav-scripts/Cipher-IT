createjs.MovieClip.prototype.getLabel = function(label)
{
    var labels = this.getLabels();
    var i, obj;
    for(i=0;i<labels.length;i++)
    {
        obj = labels[i];
        if(obj.label == label) return obj;
    }

    return null;
};

createjs.MovieClip.prototype.playTo = function(frameOrLabel, fixDuration, cb, offset, ease)
{
    var clip = this;

    var fps = lib? lib.properties.fps: 30;

    if(typeof (frameOrLabel) == "string")
    {
        var obj = clip.getLabel(frameOrLabel);
        if(!obj)
        {
            console.error("label: " + frameOrLabel + " not exist");
            return;
        }

        frameOrLabel = obj.position;
    }

    if(offset != null) frameOrLabel += offset;

    if(fixDuration == 0)
    {
        clip.gotoAndStop(frameOrLabel);
        if(cb) cb.apply();
    }
    else
    {
        if(ease == null) ease = Linear.easeNone;

        if(!clip.tweenObj) clip.tweenObj = {frame:0};

        var targetFrame = frameOrLabel,
            currentFrame = this.currentFrame,
            duration = Math.abs(targetFrame - currentFrame) / fps,
            tweenObj = clip.tweenObj;
        tweenObj.frame = currentFrame;

        TweenMax.killTweensOf(tweenObj);

        if(fixDuration != null) duration = fixDuration;

        var tl = clip.__tl = new TimelineMax;
        tl.to(tweenObj, duration, {ease:ease, frame:targetFrame, onUpdate:function()
        {
            //_clip.currentFrame = tweenObj.frame;
            clip.gotoAndStop(tweenObj.frame);
        }, onComplete:function()
        {
            if(cb) cb.apply();
        }});

        return duration;
    }

    return null;
};

createjs.MovieClip.prototype.killPlayTo = function()
{
    var clip = this;
    if(clip.__tl) clip.__tl.kill();
};

createjs.MovieClip.prototype.addRollOver = function()
{
    var clip = this;

    var isHover = false;

    clip.addEventListener("mouseover", function()
    {
        var wasHover = isHover;
        isHover = true;

        if(wasHover != isHover)
        {
            clip.playTo("Focused");
        }
    });

    clip.addEventListener("mouseout", function()
    {
        var wasHover = isHover;
        isHover = false;

        if(wasHover != isHover)
        {
            clip.playTo("Normal");
        }

    });

};