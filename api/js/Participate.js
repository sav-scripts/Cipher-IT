// JavaScript Document
(function ()
{
    "use strict";

    var $doms = {},
        _isInit = false,
        _isActive = false,
        _eventData,
        _participateData;

    window.Participate =
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

        resize: function ()
        {
        }

    };

    function loadAndBuild(cb)
    {
        $doms.container = $("#participate");


        $doms.tableSample = $doms.container.find(".event-table").detach();
        $doms.dataContainer = $doms.container.find(".data-container");


        $doms.exportButton = AdminMain.$doms.commandContainer.find(".btn-participate-export").on("click", function()
        {
            exportToExecel();
        });

        $doms.container.css("visibility", "visible").css("display", "none");

        _isInit = true;
        if (cb) cb.call();
    }

    function updateData()
    {
        if($doms.tableDic)
        {
            for(var key in $doms.tableDic)
            {
                $doms.tableDic[key].detach();
            }
        }

        ApiProxy.callApi("admin_cmds", {cmd:'get_event_data'}, null, function(response)
        {
            if(response.error)
            {
                alert(response.error);
                if(response.error == AdminMain.timeoutMessage) window.location.reload();
            }
            else
            {
                _eventData = response.data;


                ApiProxy.callApi("admin_cmds", {cmd:'get_all_participate_data'}, null, function(response)
                {
                    if(response.error)
                    {
                        alert(response.error);
                        if(response.error == AdminMain.timeoutMessage) window.location.reload();
                    }
                    else
                    {
                        _participateData = response.data;
                        applyData();
                    }
                });
            }
        });
    }

    function exportToExecel()
    {
        if(!_eventData) return;

        var $table, $newTable = $(document.createElement("table"));

        //console.log($newTable).css;

        for(var i in $doms.tableDic)
        {
            $table = $doms.tableDic[i];

            if(parseInt($table._data.num_participated) == 0) continue;

            $newTable.append($table[0].innerHTML);
            $newTable.append('<tbody><tr><th colspan="5"></th></tr></tbody>');
        }

        //$newTable.css("position", "absolute").css("z-index", 100);
        //$("body").append($newTable);

        tableToExcel($newTable[0], "sheet 1", "Cipher 密酩之謎 報名資料.xls");
    }

    function applyData()
    {
        //console.log(_eventData);
        //console.log(_participateData);

        $doms.tableDic = {};

        var tl = new TimelineMax(), t = 0;

        var i, obj, $table;
        for(i=0;i<_eventData.length;i++)
        {
            $table = setupTable(i);

            tl.set($table, {autoAlpha:0}, t);
            tl.to($table,.4, {autoAlpha: 1}, t);

            t += .1;
        }

        for(i=0;i<_participateData.length;i++)
        {
            obj = _participateData[i];

            $table = $doms.tableDic[obj.event_id];

            if($table)
            {
                var birthday = obj.birth_year + "-" + obj.birth_month + "-" + obj.birth_day;
                $table.append("<tr><td>"+obj.name+"</td><td>"+obj.gender+"</td><td>"+obj.phone+"</td><td>"+obj.email+"</td><td>"+birthday+"</td></tr>");
            }
        }

    }

    function setupTable(i)
    {
        var obj, $table;

        obj = _eventData[i];
        //if(obj.participate_able == '1' && parseInt(obj.num_participated) > 0)
        //{
        $table = $doms.tableDic[obj.id] = $doms.tableSample.clone();
        $doms.dataContainer.append($table);
        $table.find(".head").html(obj.event_date + " - " + obj.event_name + ", 參加人數: " + obj.num_participated + '<div class="patricipate-able"></div>');

        $table._data = obj;
        //}

        var $btn = $table.find(".patricipate-able");

        $btn.toggleClass("close-mode", (obj.participate_able != '1'));


        $btn.on("click", function()
        {
            var params =
            {
                cmd: 'change_participate_able',
                id: obj.id,
                participate_able: obj.participate_able == '1'? '0': '1'};


            Loading.show();

            ApiProxy.callApi('admin_cmds', params, null, function(response)
            {
                if(response.error)
                {
                    alert(response.error);
                }
                else
                {
                    obj.participate_able = response.data;
                    $btn.toggleClass("close-mode", (obj.participate_able != '1'));
                }
                Loading.hide();
            });
            //console.log(params);
        });

        return $table;
    }

    function show(cb)
    {
        $doms.container.css("display", "block");

        AdminMain.changeCommand('participate');

        $doms.exportButton.toggleClass("open-mode", true);

        updateData();

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

}());
