(function () {


    Sudoku.GameBoard = function (n) {

        Utils.EventTarget.call(this);

        this._n = n || 3;

        this._nSqrd = n * n;

        this._emptyCellCount = this._nSqrd * this._nSqrd;

        this._startingConfiguration = []; // { i, j, value }

        this._cells = new Utils.MultiArray(this._nSqrd, this._nSqrd);

        for (var i = 0; i < this._nSqrd; i++) {
            for (var j = 0; j < this._nSqrd; j++) {
                this._cells[i][j] = {value:0,isStarting:false};
            }
        }

    };


    Sudoku.GameBoard.prototype = {


        constructor:Sudoku.GameBoard,


        getGameSize:function () {

            return this._n;

        },


        enterValue:function (i, j, value) {

            if (
                this._cells[i][j].value === 0 && !entryClash.call(this, i, j, value) &&
                    value <= this._nSqrd &&
                    value > 0 &&
                    value % 1 === 0
                ) {
                this._cells[i][j].value = value;
                decrementEmptyCellCount.call(this);
                this.dispatchEvent({
                    type:"valueEntered",
                    i:i,
                    j:j,
                    value:value
                });
            }

            return this;

        },


        clearValue:function (i, j) {

            if (this._cells[i][j].value !== 0 && !this._cells[i][j].isStarting) {
                this._cells[i][j].value = 0;
                incrementEmptyCellCount.call(this);
                this.dispatchEvent({
                    type:"valueCleared",
                    i:i,
                    j:j,
                });
            }

            return this;

        },


        batchEnterValue:function (batch) {

            var entered = [];

            batch.forEach(
                function (el, idx, arr) {
                    if (
                        this._cells[el.i][el.j].value === 0 && !entryClash.call(this, el.i, el.j, el.value) &&
                            el.value <= this._nSqrd &&
                            el.value > 0 &&
                            el.value % 1 === 0
                        ) {
                        this._cells[el.i][el.j].value = el.value;
                        decrementEmptyCellCount.call(this);
                        entered.push({i:el.i, j:el.j, value:el.value});
                    }
                },
                this
            );

            this.dispatchEvent({
                type:'batchValueEntered',
                batch:entered
            });

        },


        batchClearValue:function (batch) {

            var cleared = [];

            if (batch === "all") {
                batch = [];
                for (var i = 0; i < this._nSqrd; i++) {
                    for (var j = 0; j < this._nSqrd; j++) {
                        batch.push({
                            i:i,
                            j:j
                        });
                    }
                }
            }

            batch.forEach(
                function (el, idx, arr) {
                    if (this._cells[el.i][el.j].value !== 0 && !this._cells[el.i][el.j].isStarting) {
                        this._cells[el.i][el.j].value = 0;
                        incrementEmptyCellCount.call(this);
                        cleared.push({i:el.i,j:el.j});
                    }
                },
                this
            );

            this.dispatchEvent({
                type:'batchValueCleared',
                batch:cleared
            });

        },


        getValue:function (i, j) {

            return this._cells[i][j].value;

        },


        setToStartingConfiguration:function () {

            if (this._startingConfiguration.length === 0) {
                return this;
            }

            this.batchClearValue("all");

            this.batchEnterValue(this._startingConfiguration);

            return this;

        },


        saveStartingConfiguration:function () {

            this.discardStartingConfiguration();

            for (var i = 0; i < this._nSqrd; i++) {
                for (var j = 0; j < this._nSqrd; j++) {
                    if (this._cells[i][j].value !== 0) {
                        this._cells[i][j].isStarting = true;
                        this._startingConfiguration.push({
                            i:i,
                            j:j,
                            value:this._cells[i][j].value
                        })
                    }
                }
            }

            if (this._startingConfiguration.length > 0) {

                this.dispatchEvent({
                    type:'startingConfigurationSaved',
                    startingConfiguration:this.getStartingConfiguration()
                });

            }

            return this;

        },


        loadStartingConfiguration:function (startingConfiguration) {

            var batch = [];
            
            this.wipeClean();
            
            for(var i = 0; i < this._nSqrd; i++){
                for(var j = 0; j < this._nSqrd; j++){
                    if(startingConfiguration[i][j] !== 0){
                        batch.push({i:i,j:j,value:startingConfiguration[i][j]})
                    }    
                }
            }
            
            this.batchEnterValue(batch);

            this.saveStartingConfiguration();

            return this;

        },


        getStartingConfiguration:function () {

            var arr = [];

            for (var i = 0, l = this._startingConfiguration.length; i < l; i++) {
                arr[i] = {
                    i:this._startingConfiguration[i].i,
                    j:this._startingConfiguration[i].j,
                    value:this._startingConfiguration[i].value
                }
            }

            return arr;

        },


        discardStartingConfiguration:function () {

            if (this._startingConfiguration.length > 0) {

                var arr = this.getStartingConfiguration();
                
                for (var i = 0, l = this._startingConfiguration.length; i < l; i++) {
                    this._cells[this._startingConfiguration[i].i][this._startingConfiguration[i].j].isStarting = false;
                }
                
                this._startingConfiguration = [];

                this.dispatchEvent({
                    type:'startingConfigurationDiscarded',
                    startingConfiguration:arr
                });

            }

            return this;

        },


        wipeClean:function () {

            this.discardStartingConfiguration();

            this.batchClearValue("all");

            return this;

        },


        getSubGridBoundsContainingCell:function (i, j) {

            var iLower = Math.floor(i / this._n) * this._n
                , iUpper = iLower + this._n - 1
                , iSubGrid = iLower / this._n
                , jLower = Math.floor(j / this._n) * this._n
                , jUpper = jLower + this._n - 1
                , jSubGrid = jLower / this._n
                ;

            return {
                iLower:iLower,
                iUpper:iUpper,
                iSubGrid:iSubGrid,
                jLower:jLower,
                jUpper:jUpper,
                jSubGrid:jSubGrid
            };
        }


    };


    function entryClash(i, j, value) {

        var subGridBounds = this.getSubGridBoundsContainingCell(i, j)
            , subGridClashFound = false
            , clashOccurred = false
            ;

        for (var k = 0; k < this._nSqrd; k++) {
            if (k >= subGridBounds.jLower && k <= subGridBounds.jUpper) {
                continue;
            }
            if (this._cells[i][k].value === value) {
                this.dispatchEvent({
                    type:"clash",
                    subType:"row",
                    i:i,
                    j:k
                });
                clashOccurred = true;
                break;
            }
        }
        for (var k = 0; k < this._nSqrd; k++) {
            if (k >= subGridBounds.iLower && k <= subGridBounds.iUpper) {
                continue;
            }
            if (this._cells[k][j].value === value) {
                this.dispatchEvent({
                    type:"clash",
                    subType:"column",
                    i:k,
                    j:j
                });
                clashOccurred = true;
                break;
            }
        }

        for (var k = subGridBounds.iLower; k <= subGridBounds.iUpper; k++) {
            for (var l = subGridBounds.jLower; l <= subGridBounds.jUpper; l++) {
                if (this._cells[k][l].value === value) {
                    this.dispatchEvent({
                        type:"clash",
                        subType:"subGrid",
                        i:k,
                        j:l
                    });
                    clashOccurred = true;
                    subGridClashFound = true;
                    break;
                }
            }
            if (subGridClashFound) {
                break;
            }
        }
        return clashOccurred;
    }


    function decrementEmptyCellCount() {

        if (this._emptyCellCount === 0) {
            throw new Utils.Error('Can\'t decrement _emptyCellCount below zero');
            return;
        }

        this._emptyCellCount--;

        if (this._emptyCellCount === 0) {

            this.dispatchEvent({
                type:"gameComplete"
            });

        }

    }


    function incrementEmptyCellCount() {

        if (this._emptyCellCount === this._nSqrd * this._nSqrd) {
            throw new Utils.Error('Can\'t increment _emptyCellCount above ' + this._emptyCellCount);
            return;
        }

        this._emptyCellCount++;

    }

})();
