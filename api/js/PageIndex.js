(function(){

    var $doms = {},
        BLOCK_SIZE = 9,
        SIDE_BLOCK_SIZE = 4,
        _numPages,
        _dataSource,
        _pageIndex;

    var self = window.PageIndex =
    {
        $container: null,

        init: function($container, dataSource)
        {
            _dataSource = dataSource;
            this.$container = $doms.container = $container;

            $doms.btnPrevPage = $doms.container.find(".word-prev-page").on("click", function()
            {
                self.toPrevPage();
            }).detach();

            $doms.btnNextPage = $doms.container.find(".word-next-page").on("click", function()
            {
                self.toNextPage();

            }).detach();

            $doms.btnPrevBlock = $doms.container.find(".word-prev-block").on("click", function()
            {
                self.toPrevBlock();
            }).detach();

            $doms.btnNextBlock = $doms.container.find(".word-next-block").on("click", function()
            {
                self.toNextBlock();
            }).detach();

            self.clear();

            //self.update(72, 6);
        },

        toPrevPage: function()
        {
            self.toPage(_pageIndex-1);
        },

        toNextPage: function()
        {
            self.toPage(_pageIndex+1);
        },

        toPrevBlock: function()
        {
            self.toPage(_pageIndex-BLOCK_SIZE);
        },

        toNextBlock: function()
        {
            self.toPage(_pageIndex+BLOCK_SIZE);
        },

        toPage: function(pageIndex)
        {
            var oldPageIndex = _pageIndex;

            if(pageIndex < 1) pageIndex = 1;
            if(pageIndex > _numPages) pageIndex = _numPages;

            _dataSource.refresh(pageIndex-1);

            //self.update(_numPages, pageIndex);
        },

        update: function(numPages, pageIndex)
        {
            if(pageIndex < 1 || pageIndex > numPages)
            {
                console.log("illegal params, numPages: " + numPages + ", pageIndex: " + pageIndex);
                self.clear();
                return;
            }

            self.clear();

            _numPages = numPages;
            _pageIndex = pageIndex;


            var numWordCreated = 0,
                sideNumCreated = 0,
                firstWordIndex,
                lastWordIndex;

            createWord(pageIndex, false, true);

            pageIndex++;
            numWordCreated++;



            while(sideNumCreated < SIDE_BLOCK_SIZE && pageIndex <= _numPages)
            {
                createWord(pageIndex, false, false);

                pageIndex++;
                numWordCreated++;
                sideNumCreated++;
            }
            lastWordIndex = pageIndex-1;

            sideNumCreated = 0;
            pageIndex = _pageIndex-1;
            while(sideNumCreated < SIDE_BLOCK_SIZE && pageIndex >= 1)
            {
                createWord(pageIndex, true, false);

                pageIndex--;
                numWordCreated++;
                sideNumCreated++;
            }
            firstWordIndex = pageIndex+1;

            if(lastWordIndex <= _numPages)
            {
                pageIndex = lastWordIndex+1;
                while(numWordCreated < BLOCK_SIZE && pageIndex <= _numPages)
                {
                    createWord(pageIndex, false, false);

                    pageIndex++;
                    numWordCreated++;
                }
                lastWordIndex = pageIndex-1;
            }

            if(firstWordIndex >= 1)
            {
                pageIndex = firstWordIndex-1;
                while(numWordCreated < BLOCK_SIZE && pageIndex >= 1)
                {
                    createWord(pageIndex, true, false);

                    pageIndex--;
                    numWordCreated++;
                }
                firstWordIndex = pageIndex+1;
            }

            //console.log("firstWordIndex = " + firstWordIndex);
            //console.log("lastWordIndex = " + lastWordIndex);

            var hasLastPage = false,
                hasNextPage = false;

            if(firstWordIndex !== 1)
            {
                $doms.container.prepend($doms.btnPrevBlock);
            }

            if(_pageIndex !== 1)
            {
                $doms.container.prepend($doms.btnPrevPage);
                hasLastPage = true;
            }

            if(lastWordIndex !== _numPages)
            {
                $doms.container.append($doms.btnNextBlock);
            }

            if(_pageIndex !== _numPages)
            {
                $doms.container.append($doms.btnNextPage);
                hasNextPage = true;
            }
        },

        clear: function()
        {
            $doms.btnPrevPage.detach();
            $doms.btnNextPage.detach();
            $doms.btnPrevBlock.detach();
            $doms.btnNextBlock.detach();

            $doms.container.empty();
        }

    };

    function createWord(index, insertFromFront, activeIt)
    {
        var dom = document.createElement("div");
        dom.className = "word";
        dom.innerHTML = index;

        var $word = $(dom);

        $word.toggleClass("activated", activeIt);

        insertFromFront? $doms.container.prepend($word): $doms.container.append($word);

        if(!activeIt)
        {
            $word.on("click", function()
            {
                self.toPage(index);
            });
        }


        return $word;
    }

}());