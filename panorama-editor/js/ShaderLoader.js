/**
 * Created by sav on 2015/4/15.
 */
(function (){
    var _resources = {};

    var self = window.ShaderLoader = 
    {

        preventCache: true,
        defaultPath: "shaders/",
        extension: ".fx.html",

        loadFiles: function(list, cb)
        {
            //var unloaded = list.slice(0);
    
            var index = 0;
    
            execute();
    
            function execute()
            {
                if(index < list.length)
                {
                    var name = list[index];
                    index++;
    
                    self.loadOne(name, execute);
                }
                else
                {
                    if(cb != null) cb.apply();
                }
            }
        },


        loadOne: function(name, cb)
        {
            var fileName = self.defaultPath + name + self.extension;
            if(self.preventCache) fileName += "?v=" + new Date().getTime();
    
            var dom = document.createElement("div");
            $(dom).load(fileName, function()
            {
                _resources[name] = dom;

                var $shaders = $(dom).find("shader");

                $shaders.each(function(index, dom)
                {
                    var $dom = $(dom),
                        $vertex = $dom.find("script[type='x-shader/x-vertex']"),
                        $fragement = $dom.find("script[type='x-shader/x-fragment']"),
                        id = dom.id;

                    if(!id)
                    {
                        console.warn("loaded shader file: ["+name+"] shader element lack id");
                    }
                    else
                    {
                        if($vertex.length) BABYLON.Effect.ShadersStore[id + "VertexShader"] = $vertex.text();
                        if($fragement.length) BABYLON.Effect.ShadersStore[id + "FragmentShader"] = $fragement.text();
                    }

                    /*
                    else if(!$vertex.length)
                    {
                        console.warn("loaded shader file: ["+name+"] shader id: ["+id+"] lack vertex script");
                    }
                    else if(!$fragement.length)
                    {
                        console.warn("loaded shader file: ["+name+"] shader id: ["+id+"] lack fragement script");
                    }
                    else
                    {
                        BABYLON.Effect.ShadersStore[id + "VertexShader"] = $vertex.text();
                        BABYLON.Effect.ShadersStore[id + "FragmentShader"] = $fragement.text();
                    }
                    */
                });


                if(cb != null)
                {
                    cb.apply();
                }
            });
        }
        
    };

}());
