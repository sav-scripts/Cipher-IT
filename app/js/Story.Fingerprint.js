/**
 * Created by sav on 2016/9/1.
 */


(function ()
{
    var $doms = {},
        _introPlayed= false,
        _isCompleted = false,
        _isHiding = true;

    var self = window.Story.Fingerprint=
    {
        needHideUI: true,

        init: function ($container)
        {
            $doms.container = $container;
            $doms.parent = $container.parent();

            $doms.content = $doms.container.children(".content");

            $doms.btnClose = $doms.container.find(".btn-close").on(_CLICK_, function()
            {
                SceneHandler.toHash("/Story");
            });

            $doms.wineglass = $doms.container.find(".wineglass").css("visibility", "hidden");
            $doms.badge = $doms.container.find(".big-badge").css("visibility", "hidden");

            $doms.systemContainer = $doms.container.find(".system").css("visibility", "hidden");
            $doms.systemBackground = $doms.container.find(".system-background").css("visibility", "hidden");


            setupResults();
            setupSysttem();

            //self.toSystem();

            //$doms.wineglass= $doms.container.find(".wineglass").css("visibility", "hidden");

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

            self.resize();

            //Story.DialogText.show(_dialogText, null, cb);

            var tl = new TimelineMax;
            tl.set([$doms.container, $doms.content], {autoAlpha: 0});
            tl.to($doms.container, .4, {autoAlpha: 1});
            tl.to($doms.content, 1, {autoAlpha: 1, ease:Linear.easeNone}, 0);



            if(!_introPlayed && !_isCompleted)
            {
                playIntro(cb);
            }
            else
            {
                tl.add(cb);
            }

        },

        toSystem: function()
        {
            _introPlayed = true;
            TweenMax.set([$doms.systemContainer[0], $doms.systemBackground[0]], {autoAlpha:1});
        },

        toCompleteMode: function()
        {
            _isCompleted = true;
            self.toSystem();
            TweenMax.set($doms.systemContainer, {autoAlpha:0});
            TweenMax.set([$doms.results[0], $doms.bingo[0]], {autoAlpha:1});
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
        },

        resize: function()
        {
            $doms.container.scrollTop(0);
            self.updateFingerprint(0);
        },

        updateFingerprint: null

    };

    function playIntro(cb)
    {
        _introPlayed = true;

        var tl = new TimelineMax;
        tl.set($doms.badge, {scale:.5});
        tl.to($doms.wineglass,.4, {autoAlpha: 1});
        tl.to($doms.wineglass,1, {autoAlpha: 0, ease:Power1.easeIn}, "+=1");
        tl.to($doms.badge,1, {autoAlpha: 1, ease:Power1.easeOut}, "-=1");
        tl.to($doms.badge, 3, {scale: 1.5, ease:SlowMo.ease.config(0.5, 0.7, false)}, "-=1");
        tl.to($doms.badge,1, {autoAlpha: 0, ease:Power1.easeIn}, "-=1");

        tl.to($doms.systemBackground,.6,{autoAlpha:1, ease:Power1.easeIn}, "-=.4");
        tl.to($doms.systemContainer,.6,{autoAlpha:1}, "-=.3");

        tl.add(function()
        {
            $doms.container.toggleClass("scrollable-mode", true);
            if(cb) cb.call();
        });
    }

    function setupResults()
    {
        $doms.results = $doms.container.find(".results");
        $doms.misMatch = $doms.results.find(".mis-match");
        $doms.bingo = $doms.results.find(".bingo");

        TweenMax.set([$doms.results[0], $doms.misMatch[0], $doms.bingo[0]], {autoAlpha:0});


        $doms.btnAsk = $doms.container.find(".btn-ask").on(_CLICK_, function()
        {
            SceneHandler.toHash("/Story/Businessman");
        });
        //TweenMax.set([$doms.misMatch[0]], {autoAlpha:0});
    }

    function playMisMatch(cb)
    {
        var $target = $doms.misMatch,
            $icon = $target.find(".icon");

        var tl = new TimelineMax;
        tl.to($doms.results,.4, {autoAlpha:1});
        tl.set($target, {autoAlpha:1});
        tl.set($icon, {autoAlpha:0},"+=.05");
        tl.set($icon, {autoAlpha:1},"+=.1");
        tl.set($icon, {autoAlpha:0},"+=.15");
        tl.set($icon, {autoAlpha:1},"+=.2");

        tl.to($target,.5, {autoAlpha:0}, "+=1");
        tl.to($doms.results,.4, {autoAlpha:0}, "-=.3");
        tl.add(cb);
    }

    function playMatched(cb)
    {
        var $target = $doms.bingo;

        var tl = new TimelineMax;
        tl.set($target, {autoAlpha:1});
        tl.to($doms.systemContainer,.5, {autoAlpha: 0}, 0);
        tl.to($doms.results,.8, {autoAlpha:1, ease:Power3.easeIn}, 0);
        tl.add(cb);
    }

    function setupSysttem()
    {
        var i,
            currentRow = 0,
            numCols = 5,
            numRows = 6,
            visableRows = 2,
            minRowIndex = 0,
            maxRowIndex = numRows - visableRows,
            numSamples = 30,
            rowGapY = 135,
            $samples = [],
            isLocking = false,
            tlRowShift;
        
        //var matchIndex = 0;
        var isShared = false,
            sharedMatchIndex = 0,
            matchIndex = 26;

        $doms.btnSend = $doms.container.find(".btn-send");
        $doms.arrowUp = $doms.container.find(".arrow-up").on(_CLICK_, function()
        {
            toRow(currentRow-1);
        });

        $doms.arrowDown = $doms.container.find(".arrow-down").on(_CLICK_, function()
        {
            toRow(currentRow+1);
        });

        $doms.btnShare = $doms.container.find(".btn-share").on(_CLICK_, function()
        {
            if(!isLocking)
            {

                //alert("_shareEntrySerial = " + _shareEntrySerial);
                Main.loginFB('/Story/Fingerprint', function()
                {
                    var picture = Utility.getPath() + "misc/share_fail.jpg";
                    FB.ui
                    (
                        {
                            method:"share",
                            display: "iframe",
                            href: Utility.getPathWithFilename(),
                            title: "失蹤的Cipher 秘酩黑仍下落不明",
                            description: '世紀最大劫案 Cipher 秘酩黑，至今仍下落不明，神祕的指紋會是竊賊的嗎?如果你自稱破案高手，歡迎來挑戰！',
                            picture: picture
                        },function()
                        {
                            toSharedMode();
                        }
                    );
                });


            }
        });

        var $rawSampleMatchCircle = $doms.container.find(".raw-sample-match-circle"),
            $sampleContainer = $doms.container.find(".fingerprints .wrapper"),
            $sampleContainer2 = $doms.container.find(".fingerprints-2"),
            $selectedSample = null;

        var $matchCircle = $rawSampleMatchCircle.clone().toggleClass('raw-sample-match-circle', true);

        TweenMax.set($matchCircle, {left:0, top:0, autoAlpha: 0});
        TweenMax.set($rawSampleMatchCircle, {autoAlpha: 0});

        $matchCircle.css("left", 0).css("top", 0);

        $sampleContainer.append($matchCircle);

        for(i=0; i<numSamples;i++)
        {
            setupSample($sampleContainer, i, true);
        }

        for(i=0; i<3;i++)
        {
            setupSample($sampleContainer2, i);
        }

        function toRow(rowIndex)
        {
            if(isLocking) return;

            if(rowIndex < minRowIndex) rowIndex = minRowIndex;
            if(rowIndex > maxRowIndex) rowIndex = maxRowIndex;
            if(rowIndex == currentRow) return;
            currentRow = rowIndex;

            update();
        }

        self.updateFingerprint = update;
        update();


        function setupSample($container, index, putIntoArray)
        {
            var row = parseInt(index/numCols),
                col = index - numCols * row;

            var $sample = $container.find(".sample:nth-child("+(index+1)+")");

            $sample._row = row;
            $sample._col = col;
            $sample._index = index;

            $sample._container = $container;

            if(putIntoArray) $samples.push($sample);

            $sample.on("pointerenter", function()
            {
                if(!isLocking) updateSelectedSample($sample);
            });

            $sample.on("pointerleave", function()
            {
                if(!isLocking) updateSelectedSample(null);
            });

            $sample.on("pointerdown", function()
            {
                if(!isLocking) startMatch($sample);
            })

        }

        function updateSelectedSample($sample)
        {
            if($selectedSample) $selectedSample.toggleClass("selected", false);
            $selectedSample = $sample;
            if($selectedSample) $selectedSample.toggleClass("selected", true);
        }

        function startMatch($sample)
        {
            updateSelectedSample(null);

            $sample._container.append($matchCircle);


            isLocking = true;
            var left,
                top;

            if(isShared)
            {
                TweenMax.set($matchCircle, {scale: 1, transformOrigin: "center center"});

                left = ((parseInt($sample.css("left")) + parseInt($sample.width() *.5)) / parseInt($sample._container.width()) * 100) + '%';
                top = ((parseInt($sample.css("top")) + parseInt($sample.height() *.5)) / parseInt($sample._container.height()) * 100) + '%';
                $matchCircle.css("left", left).css("top", top);
            }
            else
            {
                TweenMax.set($matchCircle, {scale: .55, transformOrigin: "center center"});

                left = ((parseInt($sample.css("left")) + parseInt($sample.width() *.5)) / parseInt($sample._container.width()) * 100 - 1) + '%';
                top = ((parseInt($sample.css("top")) + parseInt($sample.height() *.5)) / parseInt($sample._container.height()) * 100 - 1) + '%';
                $matchCircle.css("left", left).css("top", top);
            }



            var $rawCircles = $rawSampleMatchCircle.children(".circle"),
                $circles = $matchCircle.children(".circle");

            var containers = [$rawSampleMatchCircle[0], $matchCircle[0]];

            var tl = new TimelineMax();


            tl.set(containers, {autoAlpha:1});
            tl.set($rawCircles, {autoAlpha: 0});
            tl.set($circles, {autoAlpha: 0});

            tl.staggerTo($rawCircles,.5, {autoAlpha:1},.18, 0);
            tl.staggerTo($circles,.5, {autoAlpha:1},.18, 0);

            var isMatched = $sample._index == matchIndex;

            if(isMatched)
            {
                _isCompleted = true;
                Story.setPhaseTo(StoryPhases.MEDAL_AND_BRIEFCASE);

                var gap = .3, t=tl.duration();
                tl.set($rawSampleMatchCircle, {autoAlpha: 0}, t);
                tl.set($matchCircle, {autoAlpha: 0}, t);
                t += gap;

                tl.set($rawSampleMatchCircle, {autoAlpha: 1}, t);
                tl.set($matchCircle, {autoAlpha: 1}, t);
                t += gap;

                tl.set($rawSampleMatchCircle, {autoAlpha: 0}, t);
                tl.set($matchCircle, {autoAlpha: 0}, t);
                t += gap;

                tl.set($rawSampleMatchCircle, {autoAlpha: 1}, t);
                tl.set($matchCircle, {autoAlpha: 1}, t);

                tl.add(function()
                {
                    playMatched(function()
                    {

                    });
                })
            }
            else
            {
                tl.set(containers, {autoAlpha:0}, "+=.7");

                tl.add(function()
                {
                    playMisMatch(function()
                    {
                        isLocking = false;
                    });
                })
            }
        }

        function toSharedMode()
        {
            isLocking = true;
            //$doms.systemContainer.toggleClass("shared-mode", true);
            $doms.content.toggleClass("shared-mode", true);

            $doms.container.scrollTop(0);

            $doms.container.toggleClass("scrollable-mode", false);

            isShared = true;
            matchIndex = sharedMatchIndex;

            TweenMax.delayedCall(1, function()
            {
                isLocking = false;
            });

        }

        function update(duration)
        {
            //console.log($samples.length);

            if(duration === null || duration === undefined) duration = .4;

            var i, $sample;

            if(Main.settings.viewport.index == 0)
            {

                for(i=0;i<$samples.length;i++)
                {
                    $sample = $samples[i];
                    $sample.toggleClass("hide-mode", false);
                }

                TweenMax.set($sampleContainer, {marginTop: 0});
            }
            else
            {
                for(i=0;i<$samples.length;i++)
                {
                    $sample = $samples[i];

                    var dRow = $sample._row - currentRow;

                    if(dRow < 0)
                    {
                        $sample.toggleClass("hide-mode", true);
                    }
                    else if(dRow >= visableRows)
                    {
                        $sample.toggleClass("hide-mode", true);
                    }
                    else
                    {
                        $sample.toggleClass("hide-mode", false);
                    }
                }

                var offset = String(-currentRow * rowGapY) + "%";

                isLocking = true;

                if(tlRowShift) tlRowShift.kill();
                tlRowShift = new TimelineMax;
                tlRowShift.to($sampleContainer,duration, {marginTop: offset, ease:Power2.easeOut});
                tlRowShift.add(function()
                {
                    isLocking = false;
                });
            }


        }
    }

}());