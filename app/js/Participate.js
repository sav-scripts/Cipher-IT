(function ()
{
    var $doms = {},
        _dateCombo,
        _eventData,
        _isInit = false;

    var self = window.Participate =
    {
        stageIn: function (options, cb)
        {
            (!_isInit) ? loadAndBuild(execute) : execute();
            function execute(isFromLoad)
            {
                if (isFromLoad && options.cbContentLoaded) options.cbContentLoaded.call();
                show(function()
                {
                    if(options.contentHash)
                    {
                        self.toContent(options.contentHash, cb);
                    }
                    else
                    {
                        cb.call();
                    }
                });
            }

            function loadAndBuild(cb)
            {
                var templates =
                    [
                        {url: "_participate.html", startWeight: 0, weight: 99, dom: null}
                    ];


                SceneHandler.loadTemplate(null, templates, function loadComplete()
                {
                    loadCanvasAnimation(function()
                    {
                        ApiProxy.callApi("get_event_data", null, null, function(response)
                        {
                            _eventData = response.data;

                            build(templates);
                            _isInit = true;
                            cb.apply(null);
                        });
                    });
                }, true);
            }
        },

        stageOut: function (options, cb)
        {
            hide(cb);
        },

        toContent: function(contentHash, cb)
        {
            if(!_isInit) return;

            if(!contentHash) contentHash = "/Logo";

            var $content = $doms[contentHash];
            var targetTop = $content.offset().top;

            if(contentHash != "/Logo" && Main.settings.viewport.width <= 640) targetTop -= 101;

            TweenLite.to(window,.8, {scrollTo: targetTop, ease:Power1.easeInOut, onComplete: cb});
        },

        resize: function ()
        {
            if(!_isInit) return;
            var vp = Main.settings.viewport;

            if($doms.textCanvas)
            {
                $doms.textCanvas.attr("width", Math.min(vp.width, 1920)).attr("height", Math.min(vp.height, 1080));
            }
        },

        reset: resetForm

    };


    function build(templates)
    {
        $("#invisible-container").append(templates[0].dom);
        $doms.container = $("#participate");

        $doms.topBar = $doms.container.find(".top-bar");

        $doms['/Logo'] = $doms.container.find(".part-1");
        $doms['/Product'] = $doms.container.find(".part-2");
        $doms['/Form'] = $doms.container.find(".part-3");

        $doms.arrowDown1 = $doms['/Logo'].find(".arrow-down").on(_CLICK_, function()
        {
            self.toContent('/Product');
            //SceneHandler.toHash("/Participate/Product");
        });

        $doms.arrowDown2 = $doms['/Product'].find(".arrow-down").on(_CLICK_, function()
        {
            self.toContent('/Form');
            //SceneHandler.toHash("/Participate/Product");
        });

        $doms.year = $doms.container.find("#select-year");
        $doms.month = $doms.container.find("#select-month");
        $doms.day = $doms.container.find("#select-day");

        $doms.checkbox = $doms.container.find(".participate-checkbox");

        var date = new Date();
        date.setFullYear(date.getFullYear()-18);
        _dateCombo = new DateCombo($doms.year[0], $doms.month[0], $doms.day[0], null, null, null, null, '年', '月', '日', date);
        //_dateCombo.to(1998, 1, 1);

        $doms.eventTimes =
        [
            $doms.container.find(".time-group-1"),
            $doms.container.find(".time-group-2"),
            $doms.container.find(".time-group-3")
        ];

        $doms.eventSelect = $doms.container.find(".event-select");
        $doms.genderSelect = $doms.container.find(".gender-select");

        setupSelect($doms.eventSelect);
        setupSelect($doms.genderSelect);

        $doms.fields =
        {
            name: $doms.container.find(".user-name"),
            phone: $doms.container.find(".user-phone"),
            email: $doms.container.find(".user-email")
        };

        MyTools.setupInput($doms.fields.name, true, 20);
        MyTools.setupInput($doms.fields.phone, true, 10);
        MyTools.setupInput($doms.fields.email, true, 50);

        $doms.btnSend = $doms.container.find(".btn-send").on(_CLICK_, function()
        {
            trySend();
        });

        $doms.btnRule = $doms.container.find(".btn-rule").on(_CLICK_, function()
        {
            SceneHandler.toHash("/ParticipateRule");
        });

        $doms.btnPrivacy = $doms.container.find(".btn-privacy").on(_CLICK_, btnPrivacyClick);
        $doms.btnPrivacy2 = $doms.container.find(".btn-privacy-2").on(_CLICK_, btnPrivacyClick);

        function btnPrivacyClick()
        {
            SceneHandler.toHash("/ParticipateRule");
        }

        applyEventData();

        setupTextAnimation();

        $doms.container.detach();
    }

    function loadCanvasAnimation(cb)
    {
        var numScripts = 1, numScriptLoaded = 0, animeScript= 'form_Canvas.js';

        $LAB.script(animeScript).wait(scriptLoaded);

        function scriptLoaded()
        {
            numScriptLoaded ++;

            //Loading.updateProgress(numScriptLoaded / numScripts*100, 0, 20, false);

            if(numScriptLoaded < numScripts)
            {

            }
            else
            {
                cb.call();
            }
        }
    }

    function setupSelect($select)
    {
        $select.on("change", function()
        {
            $select.toggleClass("white-mode", $select[0].selectedIndex != 0);
        });
    }

    function setupTextAnimation()
    {
        var $canvas = $doms.textCanvas = $doms.container.find(".text-animation");
        var canvas, stage, exportRoot;


        canvas = $canvas[0];
        exportRoot = new lib.form_Canvas();

        stage = new createjs.Stage(canvas);
        stage.addChild(exportRoot);
        stage.update();


        createjs.Ticker.setFPS(lib.properties.fps);
        createjs.Ticker.addEventListener("tick", stage);

        //exportRoot.gotoAndStop(10);
    }

    function applyEventData()
    {
        //console.log(_eventData);

        var i, k, $group, key, obj, dic = {}, array = [];

        for(i=0;i<_eventData.length;i++)
        {
            obj = _eventData[i];
            key = obj.event_date;
            if(!dic[key])
            {
                dic[key] = [];
                array.push(key);
            }
            dic[key].push(obj);
        }
        //console.log(dic);

        $doms.eventSelect.empty();
        $doms.eventSelect.append("<option value='' disabled='disabled' selected='selected'>選擇場次</option>");
        for(i=0;i<array.length;i++)
        {
            key = array[i];
            $group = $(document.createElement("optgroup")).attr('label', key);
            $doms.eventSelect.append($group);

            for(k=0;k<dic[key].length;k++)
            {
                obj = dic[key][k];

                var $dom = $doms.eventTimes[i].find(".time:nth-child("+(k+1)+")");

                if(obj.participate_able == '1' && parseInt(obj.num_participated) < 15)
                {
                    $dom.toggleClass("filled", false);
                    $group.append("<option value='"+obj.id+"'>"+obj.event_name+"</option>");
                }
                else
                {
                    $dom.toggleClass("filled", true);
                }
            }
        }
    }

    function updateScrollTop()
    {
        //console.log("check");
        $doms.topBar.toggleClass("open-mode", ($(window).scrollTop() > 101));
    }

    function show(cb)
    {
        $("#scene-container").append($doms.container);

        self.resize();

        Menu.show();
        //Menu.Logo._hide();

        var tl = new TimelineMax;
        tl.set($doms.container, {autoAlpha: 0});
        tl.to($doms.container, .4, {autoAlpha: 1});
        tl.add(function ()
        {
            $(window).on("scroll", updateScrollTop);
            $(window).trigger("scroll");
            cb.apply();
        });
    }

    function hide(cb)
    {
        $(window).unbind("scroll", updateScrollTop);

        var tl = new TimelineMax;
        tl.to($doms.container, .4, {autoAlpha: 0});
        tl.add(function ()
        {
            $doms.container.detach();
            cb.apply();
        });
    }


    function trySend()
    {
        var formObj = checkForm();

        //var formObj =
        //{
        //    name: "john",
        //    gender: "femail",
        //    phone: "0987654322",
        //    email: "sss@ddd.cc",
        //    event_id: "2",
        //    birth_year: 1900,
        //    birth_month: 12,
        //    birth_day: 31
        //};

        if(formObj)
        {
            Loading.progress('資料傳輸中 ... 請稍候').show();

            ApiProxy.callApi("participate", formObj, false, function(response)
            {
                if(response.error)
                {
                    alert(response.error);
                    if(response.error == "該場次名額已滿")
                    {
                        ApiProxy.callApi("get_event_data", null, null, function(response)
                        {
                            if(response.error)
                            {
                                alert(response.error);
                            }
                            else
                            {
                                _eventData = response.data;
                                applyEventData();
                            }
                            Loading.hide();
                        });
                    }
                    else
                    {
                        Loading.hide();
                    }
                }
                else
                {
                    alert('資料送出成功');
                    resetForm();
                    Loading.hide();
                }
            });
        }

    }

    function resetForm()
    {
        _dateCombo.reset();

        $doms.fields.name.val('').trigger('blur');
        $doms.fields.phone.val('').trigger('blur');
        $doms.fields.email.val('').trigger('blur');

        $($doms.eventSelect.find('option')[0]).prop({selected:true}).trigger("change");
        $($doms.genderSelect.find('option')[0]).prop({selected:true}).trigger("change");
    }

    function checkForm()
    {
        var formObj={};
        var dom;

        formObj.gender = $doms.genderSelect.val();
        if(!formObj.gender)
        {
            alert('請選擇您的性別');
            return;
        }

        //console.log($doms.eventSelect.val());
        formObj.event_id = $doms.eventSelect.val();
        if(!formObj.event_id)
        {
            alert('請選擇活動場次');
            return;
        }

        if(!$doms.checkbox[0].checked)
        {
            alert('您必須同意遵守活動相關規範才能參加活動');
            return;
        }
        dom = $doms.fields.name[0];
        if(!$doms.fields.name._checkOk() || PatternSamples.onlySpace.test(dom.value))
        {
            alert('請輸入您的名稱'); dom.focus(); return;
        }else formObj.name = dom.value;

        dom = $doms.fields.phone[0];
        if(!PatternSamples.phone.test(dom.value))
        {
            alert('請輸入正確的手機號碼'); dom.focus(); return;
        }
        else formObj.phone = dom.value;


        dom = $doms.fields.email[0];
        if(!PatternSamples.email.test(dom.value))
        {
            alert('請輸入正確的電子郵件信箱'); dom.focus(); return;
        }
        else formObj.email = dom.value;

        var birthObj = _dateCombo.getDateValue();
        if(!birthObj.year || !birthObj.month || !birthObj.day)
        {
            alert('請輸入您的生日'); return;
        }
        else
        {
            formObj.birth_year = birthObj.year;
            formObj.birth_month = birthObj.month;
            formObj.birth_day = birthObj.day;
        }

        return formObj;

    }

}());