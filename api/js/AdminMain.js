(function(){

    var $doms = {},
        _currentCommand;

    var self = window.AdminMain =
    {
        $doms: $doms,

        timeoutMessage: "尚未登入或連線迂時",

        init: function()
        {
            setupLoginDialog();
            setupCommands();

            $doms.background = $("#background");

            ApiProxy.callApi("admin_cmds",
            {
                cmd: "check_login"
                //cmd
            }, null, function(response)
            {
                if(response.error)
                {
                    alert(response.error);
                }
                else
                {
                    //if(response.data)
                    //{
                    //    self.toSystem();
                    //}
                    //else
                    //{
                    //    self.toLogin();
                    //}

                    var firstHash = response.data? "/Participate": "/Login";

                    SceneHandler.init(['/Participate', "/Login"],
                        {
                            defaultHash: '/Login',
                            listeningHashChange: true,
                            //loadingClass: Loading,
                            version: new Date().getTime()
                        });

                    SceneHandler.toHash(firstHash);
                }
            });
        },

        toLogin: function()
        {
        },

        toSystem: function()
        {
            $doms.loginDialog.toggleClass("open-mode", false);
            $doms.commandContainer.toggleClass("open-mode", true);
            $doms.background.toggleClass("command-mode", true);

            SceneHandler.init(['/Participate'],
            {
                defaultHash: "/Participate",
                listeningHashChange: true,
                //loadingClass: Loading,
                version: new Date().getTime()
            });

            SceneHandler.toFirstHash();

        },

        changeCommand: function(commandName)
        {
            if(_currentCommand)
            {
                $doms.cmds[_currentCommand].toggleClass("focus-mode", false);
            }

            _currentCommand = commandName;
            $doms.cmds[commandName].toggleClass("focus-mode", true);
        }
    };

    function setupLoginDialog()
    {
    }

    function setupCommands()
    {
        $doms.commandContainer = $("#command-container");

        $doms.cmds = {};


        setupButton('participate', "/Participate");
        //setupButton('setting', "/Setting");
        setupButton('logout', null, function()
        {
            ApiProxy.callApi("admin_cmds", {cmd:'logout'}, null, function(response)
            {
                if(response.error)
                {
                    alert(response.error);
                }
                else
                {
                    SceneHandler.toHash("/Login");
                }
            });
        });

        function setupButton(name, hash, onClick)
        {
            $doms.cmds[name] = $doms.commandContainer.find(".btn-" + name).on("click", function()
            {
                if(onClick)
                {
                    onClick.call();
                }
                else
                {
                    SceneHandler.toHash(hash);
                }
            });
        }

    }

}());