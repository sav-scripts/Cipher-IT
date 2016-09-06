/**
 * Created by sav on 2016/9/1.
 */
  

(function ()
{
    var _currentObject,
        _isInit = false,
        _isHiding = true,
        //_testText = '<span>THIS　IS　SOME　</span><span class="green">TEST　CO</span><span>NTENT　和中文字</span>';
        _testText = '<span>我喜歡跟朋友參加派對，</span><span class="green">格蘭利威威士忌</span><span>是我的最愛！</span>';

    window.Story.DialogTrigger =
    {
        needHideUI: true,

        init: function ()
        {
            _isInit = true;
        },

        searchForContent: function(hash)
        {
            var dic = Story.ObjectManager.getObjectDic();

            if(dic[hash] && dic[hash].type == 'dialog')
            {
                return dic[hash];
            }

            return null;
        },

        setContent: function(obj)
        {
            _currentObject = obj;
        },

        show: function (cb)
        {
            if (!_isHiding) return;
            _isHiding = false;

            //TweenMax.to(_currentObject.editorObject._mesh,.5, {visibility: 0});
            Story.ObjectManager.hideObject(_currentObject.hash);

            if(_currentObject.clearAble)
            {
                Story.ObjectManager.clearObject(_currentObject.hash);
            }

            Story.Scene.customCamera.focusOn(_currentObject.position, function()
            {
                if(_currentObject.changeActionWhenDialoging && _currentObject.changeActionWhenDialoging !== null)
                {
                    var toIndex = _currentObject.changeActionWhenDialoging;
                    _currentObject.changeActionWhenDialoging = null;

                    Story.ObjectManager.changeNpcAction(_currentObject.hash, toIndex, null, function()
                    {
                        if(_currentObject.changePhaseAfterActionChange)
                        {
                            Story.setPhaseTo(_currentObject.changePhaseAfterActionChange);
                        }
                    });
                }


                var dialogText = _currentObject.currentDialog;

                if(dialogText)
                {
                    Story.DialogText.playDialogs(dialogText, _currentObject.dialogAnimeType, function()
                    {
                        complete();

                        TweenMax.delayedCall(2.5, function()
                        {
                            if(!_isHiding)
                            {
                                SceneHandler.toHash("/Story");
                            }
                        });


                    });
                }
                else
                {
                    complete();
                }

            });

            function complete()
            {
                if(_currentObject.changePhaseAfterDialog)
                {
                    Story.setPhaseTo(_currentObject.changePhaseAfterDialog);
                }

                if(cb) cb.call();
            }

        },
        hide: function (cb)
        {
            if (_isHiding) return;
            _isHiding = true;

            //console.log(_currentObject.changeHashAfterDialog);

            if(_currentObject.changeHashAfterDialog)
            {
                if(cb) cb.call();
                Story.DialogText.hide();
                Story.Scene.customCamera.recover(function()
                {
                    //TweenMax.to(_currentObject.editorObject._mesh,.5, {visibility: 1});
                    Story.ObjectManager.showObject(_currentObject.hash);
                });

                SceneHandler.toHash(_currentObject.changeHashAfterDialog);
            }
            else
            {

                Story.DialogText.hide();

                Story.Scene.customCamera.recover(function()
                {
                    TweenMax.to(_currentObject.editorObject._mesh,.5, {visibility: 1});
                    if(cb) cb.call();
                });
            }
        }
    };

}());