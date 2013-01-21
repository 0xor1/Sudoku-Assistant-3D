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

        this._possibilityCube = Utils.MultiArray(this._nSqrd, this._nSqrd, this._nSqrd);

        for (i = 0; i < this._nSqrd; i++) {
            for (j = 0; j < this._nSqrd; j++) {
                for (k = 0; k < this._nSqrd; k++) {
                    this._possibilityCube[i][j][k] = new Possibility(i, j, k);
                }
            }
        }


        this._masterCounter = [];

        this._rowCounters = Utils.MultiArray(this._nSqrd, this._nSqrd);

        for (i = 0; i < this._nSqrd; i++) {
            for (k = 0; k < this._nSqrd; k++) {
                tempArray = [];
                for (j = 0; j < this._nSqrd; j++) {
                    tempArray.push(this._possibilityCube[i][j][k]);
                }
                this._rowCounters[i][k] = new Counter(row, tempArray);
                this._masterCounter.push(this._rowCounters[i][k]);
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
                this._masterCounter.push(this._columnCounters[j][k]);
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
                this._masterCounter.push(this._elementCounters[i][j]);
            }
        }

        this._subGridCounters = Utils.MultiArray(this._n, this._n, this._nSqrd);

        for (i = 0; i < this._n; i++) {
            for (j = 0; j < this._n; j++) {
                for (k = 0; k < this._nSqrd; k++) {
                    tempArray = [];
                    for (iTemp = i * this._n, iUpper = itemp + this._n; iTemp < iUpper; iTemp++) {
                        for (jTemp = j * this._n, jUpper = jTemp + this._n; jTemp < jUpper; jTemp++) {
                            tempArray.push(this._possibilityCube[iTemp][jTemp][k]);
                        }
                    }
                    this._subGridCounters[i][j][k] = new Counter(subGrid, tempArray);
                    this._masterCounter.push(this._subGridCounters[i][j][k]);
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


        enterValue:function (i, j, k) {

            this._gameBoard.enterValue(i, j, k - 1);

            return this;

        },


        getBestPossibilities:function () {

            var smallestFork = {branches:this._nSqrd + 1, i:null, j:null, k:null, type:null}
                , bestPos = []
                , sgb
                ;

            if (this._certainties.length > 0) {
                bestPos = this.getCertainties();
                bestPos.type = 'certain';
                return bestPos;
            }

            bestPos.type = 'guess';

            //find fork with least branches
            //by row
            for (var i = 0; i < this._nSqrd; i++) {
                for (var k = 0; k < this._nSqrd; k++) {
                    if (this._rowCounters[i][k] > 0 && this._rowCounters[i][k] < smallestFork.branches) {
                        smallestFork.branches = this._rowCounters[i][k];
                        smallestFork.i = i;
                        smallestFork.j = null;
                        smallestFork.k = k;
                        smallestFork.type = row;
                    }
                }
            }
            //by column
            for (var j = 0; j < this._nSqrd; j++) {
                for (var k = 0; k < this._nSqrd; k++) {
                    if (this._columnCounters[j][k] > 0 && this._columnCounters[j][k] < smallestFork.branches) {
                        smallestFork.branches = this._columnCounters[j][k];
                        smallestFork.i = null;
                        smallestFork.j = j;
                        smallestFork.k = k;
                        smallestFork.type = column;
                    }
                }
            }
            //by element
            for (var i = 0; i < this._nSqrd; i++) {
                for (var j = 0; j < this._nSqrd; j++) {
                    if (this._elementCounters[i][j] > 0 && this._elementCounters[i][j] < smallestFork.branches) {
                        smallestFork.branches = this._elementCounters[i][j];
                        smallestFork.i = i;
                        smallestFork.j = j;
                        smallestFork.k = null;
                        smallestFork.type = element;
                    }
                }
            }
            //by subGrid
            for (var i = 0; i < this._n; i++) {
                for (var j = 0; j < this._n; j++) {
                    for (var k = 0; k < this._nSqrd; k++) {
                        if (this._subGridCounters[i][j] > 0 && this._subGridCounters[i][j] < smallestFork.branches) {
                            smallestFork.branches = this._subGridCounters[i][j];
                            smallestFork.i = i;
                            smallestFork.j = j;
                            smallestFork.k = k;
                            smallestFork.type = subGrid;
                        }
                    }
                }
            }

            //find the actual possibilities relevant to the smallest fork
            if (smallestFork.type === row) {
                for (var j = 0; j < this._nSqrd; j++) {
                    if (this.possibilityIsAlive(smallestFork.i, j, smallestFork.k)) {
                        bestPos.push({
                            i:smallestFork.i,
                            j:j,
                            k:smallestFork.k,
                            type:smallestFork.type
                        });
                    }
                }
            }
            if (smallestFork.type === column) {
                for (var i = 0; i < this._nSqrd; i++) {
                    if (this.possibilityIsAlive(i, smallestFork.j, smallestFork.k)) {
                        bestPos.push({
                            i:i,
                            j:smallestFork.j,
                            k:smallestFork.k,
                            type:smallestFork.type
                        });
                    }
                }
            }
            if (smallestFork.type === element) {
                for (var k = 0; k < this._nSqrd; k++) {
                    if (this.possibilityIsAlive(smallestFork.i, smallestFork.j, k)) {
                        bestPos.push({
                            i:smallestFork.i,
                            j:smallestFork.j,
                            k:k,
                            type:smallestFork.type
                        });
                    }
                }
            }
            if (smallestFork.type === subGrid) {
                sgb = this._gameBoard.getSubGridBoundsContainingCell(smallestFork.i, smallestFork.j);
                for (var i = sgb.iLower; i < sgb.iUpper; i++) {
                    for (var j = sgb.jLower; j <= sgb.jUpper; j++) {
                        if (this.possibilityIsAlive(i, j, smallestFork.k)) {
                            bestPos.push({
                                i:i,
                                j:j,
                                k:smallestFork.k,
                                type:smallestFork.type
                            });
                        }
                    }
                }

            }

            return bestPos;

        }


    };


    function attachEventListeners() {

        this._gameBoard.addEventListener('valueEntered', killPossibilities.bind(this));

        this._gameBoard.addEventListener('valueCleared', revivePossibilities.bind(this));

        this._gameBoard.addEventListener('batchValueEntered', batchKillPossibilities.bind(this));

        this._gameBoard.addEventListener('batchValueCleared', batchRevivePossibilities.bind(this));

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

            return this._errors > 0;

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

            return this._certainties > 0;

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

                if (this.notCertainty()) {

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
            , poss = event.origin
            , kSgb = Sudoku.getSubGridBoundsContainingCell(killer.i, killer.j, Math.sqrt(this._cells.length))
            , pSgb = Sudoku.getSubGridBoundsContainingCell(poss._i, poss._j, Math.sqrt(this._cells.length))
            ;

        if (this._type === row) {
            if (killer.j !== poss._j || killer.k !== poss._k) {
                return true;
            }
        } else if (this._type === column) {
            if (killer.i !== poss._i || killer.k !== poss._k) {
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
