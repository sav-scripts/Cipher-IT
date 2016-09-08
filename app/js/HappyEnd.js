(function ()
{
    var $doms = {},
        _dateCombo,
        _isInit = false;

    var self = window.HappyEnd =
    {
        stageIn: function (options, cb)
        {
            (!_isInit) ? loadAndBuild(execute) : execute();
            function execute(isFromLoad)
            {
                if (isFromLoad && options.cbContentLoaded) options.cbContentLoaded.call();
                show(cb);
            }

            function loadAndBuild(cb)
            {
                var templates =
                    [
                        {url: "_happy_end.html", startWeight: 0, weight: 100, dom: null}
                    ];

                SceneHandler.loadTemplate(null, templates, function loadComplete()
                {
                    build(templates);
                    _isInit = true;
                    cb.apply(null);
                }, 0);
            }
        },

        stageOut: function (options, cb)
        {
            hide(cb);
        },

        resize: function ()
        {

        }
    };


    function build(templates)
    {
        $("#invisible-container").append(templates[0].dom);
        $doms.container = $("#happy-end");

        setupFirstStep();
        setupFormStep();

        $doms.container.detach();
    }

    function show(cb)
    {
        $("#scene-container").append($doms.container);

        self.resize();

        toStep(true);

        Menu.show();
        Menu.Logo._show();

        var tl = new TimelineMax;
        tl.set($doms.container, {autoAlpha: 0});
        tl.to($doms.container, 1, {autoAlpha: 1, ease:Power3.easeIn});
        tl.add(function ()
        {
            cb.apply();
        });
    }

    function hide(cb)
    {
        Menu.Logo._hide();
        Menu.hide();

        var tl = new TimelineMax;
        tl.to($doms.container, .4, {autoAlpha: 0});
        tl.add(function ()
        {
            $doms.container.detach();
            cb.apply();
        });
    }

    function toStep(isFirstStep)
    {
        if(isFirstStep)
        {
            TweenMax.set($doms.firstStepContainer, {autoAlpha:1});
            TweenMax.set($doms.formStepContainer, {autoAlpha:0});
        }
        else
        {
            var tl = new TimelineMax;
            tl.to($doms.firstStepContainer,.4, {autoAlpha:0});
            tl.to($doms.formStepContainer,.4, {autoAlpha:1});
        }
    }

    function setupFirstStep()
    {
        $doms.firstStepContainer = $doms.container.find(".first-step");

        $doms.container.find(".btn-to-form").on(_CLICK_, function()
        {
            //toStep(false);


            //alert("_shareEntrySerial = " + _shareEntrySerial);
            Main.loginFB('/HappyEnd', function()
            {
                var picture = Utility.getPath() + "misc/share_site.jpg";
                FB.ui
                (
                    {
                        method:"share",
                        display: "iframe",
                        href: Utility.getPathWithFilename(),
                        title: "破案分享 title",
                        description: '破案分享 description',
                        picture: picture
                    },function(response)
                    {
                        if(!response.error && !response.error_code)
                        {
                            //ga("send", "event", "artworks", "fb_share_success");
                            //alert('分享成功');
                            //self.hide();
                            //Entries.toStep("list");
                        }

                        toStep(false);
                    }
                );
            });
        });
    }

    function setupFormStep()
    {
        $doms.formStepContainer = $doms.container.find(".form-step");

        $doms.genderSelect = $doms.container.find(".gender-select");
        setupSelect($doms.genderSelect);



        $doms.fields =
        {
            familyName: $doms.container.find(".family-name"),
            name: $doms.container.find(".user-name"),
            phone: $doms.container.find(".user-phone"),
            email: $doms.container.find(".user-email"),
            addressDetail: $doms.container.find(".address-detail")
        };

        MyTools.setupInput($doms.fields.familyName, true, 20);
        MyTools.setupInput($doms.fields.name, true, 20);
        MyTools.setupInput($doms.fields.phone, true, 10);
        MyTools.setupInput($doms.fields.email, true, 50);
        MyTools.setupInput($doms.fields.addressDetail, true, 100);

        $doms.year = $doms.container.find("#select-year");
        $doms.month = $doms.container.find("#select-month");
        $doms.day = $doms.container.find("#select-day");

        $doms.checkbox = $doms.container.find(".participate-checkbox");

        var date = new Date();
        date.setFullYear(date.getFullYear()-18);
        _dateCombo = new DateCombo($doms.year[0], $doms.month[0], $doms.day[0], null, null, null, null, '年', '月', '日', date);

        $doms.addressCounty = $doms.container.find(".address-county");
        $doms.addressZone = $doms.container.find(".address-zone");

        FormHelper.completeCounty($doms.addressCounty, $doms.addressZone);

        $doms.btnSend = $doms.container.find(".btn-send").on(_CLICK_, function()
        {
            //resetForm();
            trySend();
        });

        function setupSelect($select)
        {
            $select.on("change", function()
            {
                $select.toggleClass("white-mode", $select[0].selectedIndex != 0);
            });
        }
    }
    function trySend()
    {
        var formObj = checkForm();

        if(formObj)
        {
            Loading.progress('資料傳輸中 ... 請稍候').show();

            ApiProxy.callApi("lottery", formObj, false, function(response)
            {
                if(response.error)
                {
                    alert(response.error);
                    Loading.hide();
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

        $doms.fields.familyName.val('').trigger('blur');
        $doms.fields.name.val('').trigger('blur');
        $doms.fields.phone.val('').trigger('blur');
        $doms.fields.email.val('').trigger('blur');
        $doms.fields.addressDetail.val('').trigger('blur');

        $($doms.genderSelect.find('option')[0]).prop({selected:true}).trigger("change");

        $doms.addressCounty.prop("selectedIndex", 0);
        $doms.addressCounty.trigger("change");
        $doms.addressZone.prop("selectedIndex", 0);
    }

    function checkForm()
    {
        var formObj={};
        var dom;



        if(!$doms.checkbox[0].checked)
        {
            alert('您必須同意遵守活動相關規範才能參加活動');
            return;
        }

        formObj.gender = $doms.genderSelect.val();
        if(!formObj.gender)
        {
            alert('請選擇您的性別');
            return;
        }

        dom = $doms.fields.familyName[0];
        if(!$doms.fields.familyName._checkOk() || PatternSamples.onlySpace.test(dom.value))
        {
            alert('請輸入您的姓氏'); dom.focus(); return;
        }else formObj.family_name = dom.value;

        dom = $doms.fields.name[0];
        if(!$doms.fields.name._checkOk() || PatternSamples.onlySpace.test(dom.value))
        {
            alert('請輸入您的名字'); dom.focus(); return;
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

        var addressValue = FormHelper.getAddressValue($doms.addressCounty, $doms.addressZone);

        if(!addressValue.county)
        {
            alert('請選擇您居住的縣市'); return;
        }

        if(!addressValue.zone)
        {
            alert('請選擇您居住的地區'); return;
        }

        formObj.address_county = addressValue.county;
        formObj.address_zone = addressValue.zone;

        dom = $doms.fields.addressDetail[0];
        if(!$doms.fields.addressDetail._checkOk() || PatternSamples.onlySpace.test(dom.value))
        {
            alert('請輸入詳細的地址'); dom.focus(); return;
        }else formObj.address_detail = dom.value;

        return formObj;

    }

}());