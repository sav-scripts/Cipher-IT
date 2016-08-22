/**
 * Created by sav on 2016/7/22.
 */
(function(){

    var _fakeData =
    {
    };

    var _apiExtension = ".php",
        _apiPath = "../api/";

    window.ApiProxy =
    {
        callApi: function(apiName, params, fakeDataName, cb)
        {
            var apiUrl = _apiPath + apiName + _apiExtension,
                method = "POST";

            $.ajax
            ({
                url: apiUrl,
                type: method,
                data: params,
                dataType: "json"
            })
            .done(complete)
            .fail(function ()
            {
                //alert("無法取得伺服器回應");
                complete({error:"無法取得伺服器回應"});
            });

            function complete(response)
            {
                if(cb) cb.call(null, response);
            }
        }
    };

}());