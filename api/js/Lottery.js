// JavaScript Document
(function ()
{
    "use strict";
    
    var DEFAULT_PAGE_SIZE = 30;

    var _pageSize = DEFAULT_PAGE_SIZE,
        _pageIndex = 0,
        _currentMode = 'view';

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

        $doms.viewButton = AdminMain.$doms.commandContainer.find(".btn-lottery-view").on("click", viewAll);

        $doms.selectSuccessButton = AdminMain.$doms.commandContainer.find(".btn-lottery-select-success").on("click", lotterySuccess);

        $doms.selectAllButton = AdminMain.$doms.commandContainer.find(".btn-lottery-select-all").on("click", lotteryAll);

        $doms.exportButton = AdminMain.$doms.commandContainer.find(".btn-lottery-export").on("click", function()
        {
            exportToExecel(true);
        });

        $doms.exportAllButton = AdminMain.$doms.commandContainer.find(".btn-lottery-export-all").on("click", function()
        {
            exportToExecel();
        });

        $doms.subButtons = $doms.viewButton.add($doms.selectSuccessButton).add($doms.selectAllButton).add($doms.exportButton).add($doms.exportAllButton);

        $doms.container.css("visibility", "visible").css("display", "none");
        _isInit = true;
        if (cb) cb.call();
    }
    
    function viewAll()
    {
        _currentMode = 'view';
        _pageSize = DEFAULT_PAGE_SIZE;
        self.refresh(0);
    }

    function lotterySuccess()
    {
        var num = parseInt(prompt("請輸入要抽選資料筆數", 100));

        if(num > 0)
        {
            _currentMode = 'lottery_success';
            _pageSize = num;
            self.refresh(0);
        }
        else
        {
            alert('數值不合法');
        }
    }

    function lotteryAll()
    {
        var num = parseInt(prompt("請輸入要抽選資料筆數", 100));

        if(num > 0)
        {
            _currentMode = 'lottery_all';
            _pageSize = num;
            self.refresh(0);
        }
    }

    function show(cb)
    {
        $doms.container.css("display", "block");

        AdminMain.changeCommand('lottery');

        $doms.subButtons.toggleClass("open-mode", true);
        
        viewAll();

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

        $doms.subButtons.toggleClass("open-mode", false);

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
            page_size: _pageSize,
            mode: _currentMode
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
                var numPages = Math.ceil(numEntries / _pageSize);

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

        var startIndex = _pageIndex * _pageSize + 1,
            endIndex = startIndex + dataArray.length - 1 ;


        if(needHead)
        {
            $table.find(".head").html("資料 "+startIndex+" ~ "+endIndex+", 總資料筆數: " + _numEntries);
        }

        var i, obj;

        for(i=0;i<dataArray.length;i++)
        {
            obj = dataArray[i];

            var isSuccess = obj.is_fail == '0'? '是': '否';

            var birthday = obj.birth_year + "-" + obj.birth_month + "-" + obj.birth_day,
                address = obj.address_county + " " + obj.address_zone + " " + obj.address_detail;
            $table.append("<tr><td>"+isSuccess+"</td><td>"+obj.family_name+"</td><td>"+obj.name+"</td><td>"+obj.gender+"</td><td>"+obj.phone+"</td><td>"+obj.email+"</td><td>"+birthday+"</td><td>"+address+"</td></tr>");
        }

        return $table;

    }


    function exportToExecel(currentOnly)
    {
        if(currentOnly)
        {
            processData(_entriesData);
            return;
        }

        Loading.show();

        var params =
        {
            cmd: 'get_lottery_data',
            page_index: 0,
            page_size: 0,
            mode: 'lottery_all'
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
                processData(response.data.data);
            }

            Loading.hide();
        });

        function processData(data)
        {
            var $table = applyData(data);
            tableToExcel($table[0], "sheet 1", "Cipher 密酩之謎 抽獎參加資料.xls");
        }

    }

}());
