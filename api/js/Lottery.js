// JavaScript Document
(function ()
{
    "use strict";

    var PAGE_SIZE = 30,
        _pageIndex = 0;

    var $doms = {},
        _numEntries = null,
        _entriesData = null,
        _isInit = false,
        _isActive = false;

    var self = window.Lottery =
    {
        init: function ()
        {
            loadAndBuild();
        },

        stageIn: function (options, cb)
        {
            (!_isInit) ? loadAndBuild(execute) : execute();
            function execute()
            {
                show(cb);
            }
        },

        stageOut: function (options, cb)
        {
            hide(cb);
        },

        refresh: refresh,

        resize: function ()
        {
        }

    };

    function loadAndBuild(cb)
    {
        $doms.container = $("#lottery");

        $doms.tableSample = $doms.container.find(".lottery-table").detach();
        $doms.dataContainer = $doms.container.find(".data-container");

        $doms.pageIndexContainer = $doms.container.find(".page-index-container");
        PageIndex.init($doms.pageIndexContainer, self);


        $doms.exportButton = AdminMain.$doms.commandContainer.find(".btn-lottery-export").on("click", function()
        {
            exportToExecel();
        });

        $doms.container.css("visibility", "visible").css("display", "none");
        _isInit = true;
        if (cb) cb.call();
    }

    function show(cb)
    {
        $doms.container.css("display", "block");

        AdminMain.changeCommand('lottery');

        $doms.exportButton.toggleClass("open-mode", true);

        refresh();

        var tl = new TimelineMax;
        tl.set($doms.container, {autoAlpha: 0});
        tl.to($doms.container, .4, {autoAlpha: 1});
        tl.add(function ()
        {
            _isActive = true;
            cb.apply();
        });
    }

    function hide(cb)
    {
        _isActive = false;

        $doms.exportButton.toggleClass("open-mode", false);

        $doms.container.css("display", "none");
        cb.apply();
    }


    function refresh(pageIndex)
    {
        if(pageIndex !== null && pageIndex !== undefined) _pageIndex = pageIndex;

        if($doms.currentTable) $doms.currentTable.detach();

        var params =
        {
            cmd: 'get_lottery_data',
            page_index: _pageIndex,
            page_size: PAGE_SIZE
        };

        Loading.show();

        ApiProxy.callApi("admin_cmds", params, null, function(response)
        {
            if(response.error)
            {
                alert(response.error);
                if(response.error == AdminMain.timeoutMessage) window.location.reload();
            }
            else
            {
                //console.log(response.data);

                var numEntries = response.data.num_entries;
                var numPages = Math.ceil(numEntries / PAGE_SIZE);

                PageIndex.update(numPages, _pageIndex+1);

                _entriesData = response.data.data;
                _numEntries = numEntries;

                $doms.currentTable = applyData();
                $doms.dataContainer.append($doms.currentTable);
            }

            Loading.hide();
        });
    }

    function applyData(dataArray)
    {
        var needHead = false;
        if(!dataArray)
        {
            dataArray = _entriesData;
            needHead = true;
        }

        var $table = $doms.tableSample.clone();

        var startIndex = _pageIndex * PAGE_SIZE + 1,
            endIndex = startIndex + dataArray.length - 1 ;


        if(needHead)
        {
            $table.find(".head").html("資料 "+startIndex+" ~ "+endIndex+", 總資料筆數: " + _numEntries);
        }

        var i, obj;

        for(i=0;i<dataArray.length;i++)
        {
            obj = dataArray[i];

            var birthday = obj.birth_year + "-" + obj.birth_month + "-" + obj.birth_day,
                address = obj.address_county + " " + obj.address_zone + " " + obj.address_detail;
            $table.append("<tr><td>"+obj.family_name+"</td><td>"+obj.name+"</td><td>"+obj.gender+"</td><td>"+obj.phone+"</td><td>"+obj.email+"</td><td>"+birthday+"</td><td>"+address+"</td></tr>");
        }

        return $table;

    }


    function exportToExecel()
    {
        //if(!_entriesData) return;

        Loading.show();

        var params =
        {
            cmd: 'get_lottery_data',
            page_index: 0,
            page_size: 0
        };

        Loading.show();

        ApiProxy.callApi("admin_cmds", params, null, function(response)
        {
            if(response.error)
            {
                alert(response.error);
                if(response.error == AdminMain.timeoutMessage) window.location.reload();
            }
            else
            {
                var $table = applyData(response.data.data);
                tableToExcel($table[0], "sheet 1", "Cipher 密酩之謎 抽獎參加資料.xls");
            }

            Loading.hide();
        });



    }

}());
