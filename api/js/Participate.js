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

    function applyData()
    {
        //console.log(_eventData);
        //console.log(_participateData);

        $doms.tableDic = {};

        var tl = new TimelineMax(), t = 0;

        var i, obj, $table;
        for(i=0;i<_eventData.length;i++)
        {
            obj = _eventData[i];
            if(obj.participate_able == '1' && parseInt(obj.num_participated) > 0)
            {
                $table = $doms.tableDic[obj.id] = $doms.tableSample.clone();
                $doms.dataContainer.append($table);
                $table.find(".head").text(obj.event_date + " - " + obj.event_name + ", 參加人數: " + obj.num_participated);

                tl.set($table, {autoAlpha:0}, t);
                tl.to($table,.4, {autoAlpha: 1}, t);

                t += .1;
            }

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

    function show(cb)
    {
        $doms.container.css("display", "block");

        AdminMain.changeCommand('participate');

        updateData();

        AdminMain.$doms.commandContainer.toggleClass("open-mode", true);
        AdminMain.$doms.background.toggleClass("command-mode", true);

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

        var tl = new TimelineMax;
        tl.to($doms.container, .4, {autoAlpha: 0});
        tl.add(function ()
        {
            $doms.container.css("display", "none");
            cb.apply();
        });
    }

}());
