/*
0xor1   http://github.com/0xor1
*/

(function () {

    /*
     Constants
     */
    var row = 'row'
        , column = 'column'
        , element = 'element'
        , subGrid = 'subGrid'
        , killed = 'killed'
        , revived = 'revived'
        , hasErrors = 'hasErrors'
        , hasNoErrors = 'hasNoErrors'
        , isCertainty = 'isCertainty'
        , isNotCertainty = 'isNotCertainty'
        , valueEntered = 'valueEntered'
        , valueCleared = 'valueCleared'
        , batchValueEntered = 'batchValueEntered'
        , batchValueCleared = 'batchValueCleared'
        ;


    /*
     Assistant
     */
    Sudoku.Assistant = function (gameBoard) {

        var i
            , j
            , k
            , iTemp
            , jTemp
            , iUpper
            , jUpper
            , tempArray
            ;

        Utils.EventDispatcher.call(this);

        this._n = gameBoard.getGameSize();
        this._nSqrd = this._n * this._n;
        this._gameBoard = gameBoard;

        this._certainties = [];

        this._possibilityCube = Utils.MultiArray(this._nSqrd, this._nSqrd, this._nSqrd);

        for (i = 0; i < this._nSqrd; i++) {
            for (j = 0; j < this._nSqrd; j++) {
                for (k = 0; k < this._nSqrd; k++) {
                    this._possibilityCube[i][j][k] = new Possibility(i, j, k);
                    this._possibilityCube[i][j][k].addEventListener(killed, killedHandler.bind(this));
                    this._possibilityCube[i][j][k].addEventListener(revived, revivedHandler.bind(this));
                    this._possibilityCube[i][j][k].addEventListener(isCertainty, newCertaintyHandler.bind(this));
                    this._possibilityCube[i][j][k].addEventListener(isNotCertainty, oldCertaintyHandler.bind(this));
                    this._possibilityCube[i][j][k].addEventListener(hasErrors, newErrorHandler.bind(this));
                    this._possibilityCube[i][j][k].addEventListener(hasNoErrors, oldErrorHandler.bind(this));
                }
            }
        }


        this._rowCounters = Utils.MultiArray(this._nSqrd, this._nSqrd);

        for (i = 0; i < this._nSqrd; i++) {
            for (k = 0; k < this._nSqrd; k++) {
                tempArray = [];
                for (j = 0; j < this._nSqrd; j++) {
                    tempArray.push(this._possibilityCube[i][j][k]);
                }
                this._rowCounters[i][k] = new Counter(row, tempArray);
            }
        }

        this._columnCounters = Utils.MultiArray(this._nSqrd, this._nSqrd);

        for (j = 0; j < this._nSqrd; j++) {
            for (k = 0; k < this._nSqrd; k++) {
                tempArray = [];
                for (i = 0; i < this._nSqrd; i++) {
                    tempArray.push(this._possibilityCube[i][j][k]);
                }
                this._columnCounters[j][k] = new Counter(column, tempArray);
            }
        }

        this._elementCounters = Utils.MultiArray(this._nSqrd, this._nSqrd);

        for (i = 0; i < this._nSqrd; i++) {
            for (j = 0; j < this._nSqrd; j++) {
                tempArray = [];
                for (k = 0; k < this._nSqrd; k++) {
                    tempArray.push(this._possibilityCube[i][j][k]);
                }
                this._elementCounters[i][j] = new Counter(element, tempArray);
            }
        }

        this._subGridCounters = Utils.MultiArray(this._n, this._n, this._nSqrd);

        for (i = 0; i < this._n; i++) {
            for (j = 0; j < this._n; j++) {
                for (k = 0; k < this._nSqrd; k++) {
                    tempArray = [];
                    for (iTemp = i * this._n, iUpper = iTemp + this._n; iTemp < iUpper; iTemp++) {
                        for (jTemp = j * this._n, jUpper = jTemp + this._n; jTemp < jUpper; jTemp++) {
                            tempArray.push(this._possibilityCube[iTemp][jTemp][k]);
                        }
                    }
                    this._subGridCounters[i][j][k] = new Counter(subGrid, tempArray);
                }
            }
        }

        cullPossibilities.call(this);

        attachEventListeners.call(this);

    };


    Sudoku.Assistant.prototype = {


        constructor:Sudoku.Assistant,


        possibilityIsAlive:function (i, j, k) {

            return this._possibilityCube[i][j][k].isAlive();

        },

        possibilityIsCertainty:function(i,j,k){

            return this._possibilityCube[i][j][k].isCertainty();

        },

        possibilityHasErrors:function (i, j, k){

            return this._possibilityCube[i][j][k].hasErrors();

        },


        enterValue:function (i, j, k) {

            this._gameBoard.enterValue(i, j, k + 1);

            return this;

        },


        getCertainties:function () {

            var arr = this._certainties.slice(0);

            for (var i = 0, l = arr.length; i < l; i++) {

                arr[i].types = this._certainties[i].types.slice(0);

            }

            return arr;

        }


    };


    function killedHandler(event){

        var cell = event.dispatcher.getIndices();

        this.dispatchEvent({
            type:killed,
            i:cell.i,
            j:cell.j,
            k:cell.k
        });

    }


    function revivedHandler(event){

        var cell = event.dispatcher.getIndices();

        this.dispatchEvent({
            type:revived,
            i:cell.i,
            j:cell.j,
            k:cell.k
        });

    }


    function newCertaintyHandler(event){

        var idx = this._certainties.indexOf(event.dispatcher)
            , cell = event.dispatcher.getIndices()
            ;

        if(idx !== -1){
            this._certainties.push(event.dispatcher);
        }

        this.dispatchEvent({
            type:isCertainty,
            i:cell.i,
            j:cell.j,
            k:cell.k
        });

    }


    function oldCertaintyHandler(event){

        var idx = this._certainties.indexOf(event.dispatcher)
            , cell = event.dispatcher.getIndices()
            ;

        if(idx !== -1){
            this._certainties.splice(idx, 1);
        }

        this.dispatchEvent({
            type:isNotCertainty,
            i:cell.i,
            j:cell.j,
            k:cell.k
        });

    }


    function newErrorHandler(event){

        var cell = event.dispatcher.getIndices();

        this.dispatchEvent({
            type:hasErrors,
            i:cell.i,
            j:cell.j,
            k:cell.k
        });

    }


    function oldErrorHandler(event){

        var cell = event.dispatcher.getIndices();

        this.dispatchEvent({
            type:hasNoErrors,
            i:cell.i,
            j:cell.j,
            k:cell.k
        });

    }


    function attachEventListeners() {

        this._gameBoard.addEventListener(valueEntered, killPossibilities.bind(this));

        this._gameBoard.addEventListener(valueCleared, revivePossibilities.bind(this));

        this._gameBoard.addEventListener(batchValueEntered, batchKillPossibilities.bind(this));

        this._gameBoard.addEventListener(batchValueCleared, batchRevivePossibilities.bind(this));

        return this;

    }


    function cullPossibilities() {

        var value
            ;

        for (var i = 0; i < this._nSqrd; i++) {
            for (var j = 0; j < this._nSqrd; j++) {
                if (value = this._gameBoard.getValue(i, j) !== 0) {
                    killPossibilities.call(this, {i:i, j:j, value:value});
                }
            }
        }

    }


    function batchKillPossibilities(event) {

        event.batch.forEach(
            function (el, idx, arr) {
                killPossibilities.call(this, el);
            },
            this
        );

        return this;

    }


    function batchRevivePossibilities(event) {

        event.batch.forEach(
            function (el, idx, arr) {
                revivePossibilities.call(this, el);
            },
            this
        );

        return this;

    }


    function killPossibilities(event) {

        var i = event.i
            , j = event.j
            , k = event.value - 1
            , sgb = this._gameBoard.getSubGridBoundsContainingCell(i, j)
            , killer = {i:i, j:j, k:k}
            , iTemp
            , jTemp
            , kTemp
            ;

        /*killRowPossibilities*/
        for (jTemp = 0; jTemp < this._nSqrd; jTemp++) {
            this._possibilityCube[i][jTemp][k].addKiller(row, killer);
        }
        /*killColumnPossibilities*/
        for (iTemp = 0; iTemp < this._nSqrd; iTemp++) {
            this._possibilityCube[iTemp][j][k].addKiller(column, killer);
        }
        /*killElementPossibilities*/
        for (kTemp = 0; kTemp < this._nSqrd; kTemp++) {
            this._possibilityCube[i][j][kTemp].addKiller(element, killer);
        }
        /*killSubGridPossibilities*/
        for (iTemp = sgb.iLower; iTemp <= sgb.iUpper; iTemp++) {
            for (jTemp = sgb.jLower; jTemp <= sgb.jUpper; jTemp++) {
                this._possibilityCube[iTemp][jTemp][k].addKiller(subGrid, killer);
            }
        }

        return this;

    }


    function revivePossibilities(event) {

        var i = event.i
            , j = event.j
            , k = event.value - 1
            , sgb = this._gameBoard.getSubGridBoundsContainingCell(i, j)
            , killer = {i:i, j:j, k:k}
            , iTemp
            , jTemp
            , kTemp
            ;

        /*reviveRowPossibilities*/
        for (jTemp = 0; jTemp < this._nSqrd; jTemp++) {
            this._possibilityCube[i][jTemp][k].removeKiller(row, killer);
        }
        /*reviveColumnPossibilities*/
        for (iTemp = 0; iTemp < this._nSqrd; iTemp++) {
            this._possibilityCube[iTemp][j][k].removeKiller(column, killer);
        }
        /*reviveElementPossibilities*/
        for (kTemp = 0; kTemp < this._nSqrd; kTemp++) {
            this._possibilityCube[i][j][kTemp].removeKiller(element, killer);
        }
        /*reviveSubGridPossibilities*/
        for (iTemp = sgb.iLower; iTemp <= sgb.iUpper; iTemp++) {
            for (jTemp = sgb.jLower; jTemp <= sgb.jUpper; jTemp++) {
                this._possibilityCube[iTemp][jTemp][k].removeKiller(subGrid, killer);
            }
        }

        return this;

    }


    /*
     Possibility
     */
    function Possibility(i, j, k) {

        Utils.EventDispatcher.call(this);

        this._i = i;
        this._j = j;
        this._k = k;

        this._errors = [];
        this._certainties = [];
        this._killers = [];

    }


    Possibility.prototype = {


        constructor:Possibility,


        getIndices:function(){

            return {
                i:this._i,
                j:this._j,
                k:this._k
            };

        },


        isAlive:function () {

            return this._killers.length === 0;

        },


        isDead:function () {

            return !this.isAlive();

        },


        getKillers:function () {

            return this._killers.slice(0);

        },


        addKiller:function (type, killerInfo) {

            if (this._killers.indexOf(type) === -1) {

                this._killers.push(type);

                if (this._killers.length === 1) {

                    this.dispatchEvent({
                        type:killed,
                        killerInfo:killerInfo
                    })

                }

            }

            return this;

        },


        removeKiller:function (type, killerInfo) {

            var idx = this._killers.indexOf(type);

            if (idx !== -1) {

                this._killers.splice(idx, 1);

                if (this.isAlive()) {

                    this.dispatchEvent({
                        type:revived,
                        killerInfo:killerInfo
                    });

                }

            }

            return this;

        },


        hasErrors:function () {

            return this._errors.length > 0;

        },


        hasNoErrors:function () {

            return !this.hasErrors();

        },


        getErrors:function () {

            return this._errors.slice(0);

        },


        addError:function (type) {

            if (this._errors.indexOf(type) === -1) {

                this._errors.push(type);

                if (this._errors.length === 1) {

                    this.dispatchEvent({
                        type:hasErrors
                    })

                }

            }

            return this;

        },


        removeError:function (type) {

            var idx = this._errors.indexOf(type);

            if (idx !== -1) {

                this._errors.splice(idx, 1);

                if (this.hasNoErrors()) {

                    this.dispatchEvent({
                        type:hasNoErrors
                    });

                }

            }

            return this;

        },


        isCertainty:function () {

            return this._certainties.length > 0;

        },


        isNotCertainty:function () {

            return !this.isCertainty();

        },


        getCertainties:function () {

            return this._certainties.slice(0);

        },


        addCertainty:function (type) {

            if (this._certainties.indexOf(type) === -1) {

                this._certainties.push(type);

                if (this._certainties.length === 1) {

                    this.dispatchEvent({
                        type:isCertainty
                    });

                }

            }

            return this;

        },


        removeCertainty:function (type) {

            var idx = this._certainties.indexOf(type);

            if (idx !== -1) {

                this._certainties.splice(idx, 1);

                if (this.isNotCertainty()) {

                    this.dispatchEvent({
                        type:isNotCertainty
                    });

                }

            }

            return this;

        }


    };


    /*
     Counter
     */
    function Counter(type, cells) {

        this._type = type;
        this._value = cells.length;
        this._cells = cells;

        this._cells.forEach(

            function (el, idx, arr) {

                el.addEventListener(killed, function (event) {
                    this.decrement(event);
                }.bind(this));
                el.addEventListener(revived, function (event) {
                    this.increment(event);
                }.bind(this));

            },

            this
        )
    }


    Counter.prototype = {


        constructor:Counter,


        decrement:function (event) {

            var i
                , l
                ;

            this._value--;

            if (this._value === 0) {

                for (i = 0, l = this._cells.length; i < l; i++) {

                    this._cells[i].removeCertainty(this._type);

                }

                if (thereIsError.call(this, event)) {

                    for (i = 0, l = this._cells.length; i < l; i++) {

                        this._cells[i].addError(this._type);

                    }

                }

            }

            if (this._value === 1) {

                for (i = 0, l = this._cells.length; i < l; i++) {

                    if (this._cells[i].isAlive()) {

                        this._cells[i].addCertainty(this._type);

                        break;

                    }

                }

            }

        },


        increment:function (event) {

            var i
                , l
                ;

            this._value++;

            if (this._value === 1) {

                for (i = 0, l = this._cells.length; i < l; i++) {

                    if (this._cells[i].isAlive()) {

                        this._cells[i].addCertainty(this._type);

                        break;

                    }

                }

                if (thereIsError.call(this, event)) {

                    for (i = 0, l = this._cells.length; i < l; i++) {

                        this._cells[i].removeError(this._type);

                    }

                }

            }

            if (this._value === 2) {

                for (i = 0, l = this._cells.length; i < l; i++) {

                    this._cells[i].removeCertainty(this._type);

                }

            }

        }

    };


    function thereIsError(event) {

        var killer = event.killerInfo
            , poss = event.dispatcher
            , kSgb = Sudoku.getSubGridBoundsContainingCell(killer.i, killer.j, Math.sqrt(this._cells.length))
            , pSgb = Sudoku.getSubGridBoundsContainingCell(poss._i, poss._j, Math.sqrt(this._cells.length))
            ;

        if (this._type === row) {
            if (killer.i !== poss._i || killer.k !== poss._k) {
                return true;
            }
        } else if (this._type === column) {
            if (killer.j !== poss._j || killer.k !== poss._k) {
                return true;
            }
        } else if (this._type === element) {
            if (killer.i !== poss._i || killer.j !== poss._j) {
                return true;
            }
        } else if (this._type === subGrid) {
            if (kSgb.iSubGrid !== pSgb.iSubGrid || kSgb.jSubGrid !== pSgb.jSubGrid || killer.k !== poss._k) {
                return true;
            }
        } else {
            return false;
        }

    }


})();
