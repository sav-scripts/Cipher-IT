/**
 * Created by sav on 2016/8/17.
 */
(function(){

    window.DataManager =
    {
        load: function(filename, cb)
        {

        },

        save: function(dataObj, cb)
        {


            var blob = new Blob([JSON.stringify(dataObj)], {type: "text/plain;charset=utf-8"});
            saveAs(blob, "data.txt");
        }
    };

}());