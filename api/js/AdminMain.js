(function(){

    var $doms = {};

    window.AdminMain =
    {
        init: function()
        {
            $doms.inputs =
            {
                userName: $("#user-name").val(''),
                userPassword: $("#user-password").val('')
            };

            $doms.btnSend = $(".btn-send").on("click", function()
            {
                ApiProxy.callApi("login",
                {
                    username: $doms.inputs.userName[0].value,
                    password: $doms.inputs.userPassword[0].value

                }, null, function(response)
                {
                    if(response.error)
                    {
                        alert(response.error);
                    }
                });
            });
        }
    };

}());