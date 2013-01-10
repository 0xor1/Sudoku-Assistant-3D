(function () {

    Sudoku.Solver = function (gameBoard, solver) {

        Utils.EventDispatcher.call(this);

        this._n = gameBoard.getGameSize();
        this._nSqrd = this._n * this._n;
        this._gameBoard = gameBoard;

        if (solver instanceof Sudoku.Solver) {
            this._parent = solver;
        } else {
            this._parent = null;
        }

        this._children = []; //for exploring forks

        this._entryList = []; //batch array for values this solver has entered into the gameboard

        this._certainCells = [];

        this._possibilityCube = Utils.MultiArray(this._nSqrd, this._nSqrd, this._nSqrd);

        for (var i = 0; i < this._nSqrd; i++) {
            for (var j = 0; j < this._nSqrd; j++) {
                for (var k = 0; k < this._nSqrd; k++) {
                    this._possibilityCube[i][j][k] = Sudoku.Solver.possibilityAlive;
                }
            }
        }

        this._rowCounters = Utils.MultiArray(this._nSqrd, this._nSqrd);
        this._columnCounters = Utils.MultiArray(this._nSqrd, this._nSqrd);
        this._elementCounters = Utils.MultiArray(this._nSqrd, this._nSqrd);

        for (var i = 0; i < this._nSqrd; i++) {
            for (var j = 0; j < this._nSqrd; j++) {
                this._rowCounters[i][j] = this._nSqrd;
                this._columnCounters[i][j] = this._nSqrd;
                this._elementCounters[i][j] = this._nSqrd;
            }
        }

        this._subGridCounters = Utils.MultiArray(this._n, this._n, this._nSqrd);

        for (var i = 0; i < this._n; i++) {
            for (var j = 0; j < this._n; j++) {
                for (var k = 0; k < this._nSqrd; k++) {
                    this._subGridCounters[i][j][k] = this._nSqrd;
                }
            }
        }

        initialize.call(this);

    }


    Sudoku.Solver.possibilityAlive = 1;


    Sudoku.Solver.possibilityDead = 0;


    Sudoku.Solver.prototype = {


        constructor:Sudoku.Solver,


        possibilityIsAlive:function (i, j, value) {

            return this._possibilityCube[i][j][value - 1] === Sudoku.Solver.possibilityAlive;

        },


        getListOfCertainCells:function () {

            var arr = [];

            for (var i = 0, l = this._certainCells.length; i < l; i++) {
                arr[i] = {
                    i:this._certainCells[i].i,
                    j:this._certainCells[i].j,
                    value:this._certainCells[i].value
                }
            }

            return arr;


        }

    };


    function initialize() {

        var value
            ;

        for (var i = 0; i < this._nSqrd; i++) {
            for (var j = 0; j < this._nSqrd; j++) {
                if (value = this._gameBoard.getValue(i, j) !== Sudoku.GameBoard.emptyCell) {
                    killPossibilities.call(this, {i:i, j:j, value:value});
                }
            }
        }

        this._gameBoard.addEventListener('valueEntered', killPossibilities.bind(this));

        this._gameBoard.addEventListener('valueCleared', revivePossibilities.bind(this));

        this._gameBoard.addEventListener('batchValueEntered', batchKillPossibilities.bind(this));

        this._gameBoard.addEventListener('batchValueCleared', batchRevivePossibilities.bind(this));

        this.addEventListener('insolvableBranch',insolvableBranch.bind(this));

        return this;

    }


    function killPossibilities(event) {

        var i = event.i
            , j = event.j
            , k = event.value - 1
            , sgb = this._gameBoard.getSubGridBoundsContainingCell(i, j)
            , gbc = {i:event.i, j:event.j, value:event.value}
            , iTemp
            , jTemp
            , kTemp
            ;

        /*killRowPossibilities*/
        for (var jTemp = 0; jTemp < this._nSqrd; jTemp++) {
            killPossibility.call(this, i, jTemp, k, gbc);
        }
        /*killColumnPossibilities*/
        for (var iTemp = 0; iTemp < this._nSqrd; iTemp++) {
            killPossibility.call(this, iTemp, j, k, gbc);
        }
        /*killElementPossibilities*/
        for (var kTemp = 0; kTemp < this._nSqrd; kTemp++) {
            killPossibility.call(this, i, j, kTemp, gbc);
        }
        /*killSubGridPossibilities*/
        for (var iTemp = sgb.iLower; iTemp <= sgb.iUpper; iTemp++) {
            for (var jTemp = sgb.jLower; jTemp <= sgb.jUpper; jTemp++) {
                killPossibility.call(this, iTemp, jTemp, k, gbc);
            }
        }

        return this;

    }


    function revivePossibilities(event) {

        var i = event.i
            , j = event.j
            , k = event.value - 1
            , sgb = this._gameBoard.getSubGridBoundsContainingCell(i, j)
            , iTemp
            , jTemp
            , kTemp
            ;

        /*reviveRowPossibilities*/
        for (var jTemp = 0; jTemp < this._nSqrd; jTemp++) {
            revivePossibility.call(this, i, jTemp, k);
        }
        /*reviveColumnPossibilities*/
        for (var iTemp = 0; iTemp < this._nSqrd; iTemp++) {
            revivePossibility.call(this, iTemp, j, k);
        }
        /*reviveElementPossibilities*/
        for (var kTemp = 0; kTemp < this._nSqrd; kTemp++) {
            revivePossibility.call(this, i, j, kTemp);
        }
        /*revivesubGridPossibilities*/
        for (var iTemp = sgb.iLower; iTemp <= sgb.iUpper; iTemp++) {
            for (var jTemp = sgb.jLower; jTemp <= sgb.jUpper; jTemp++) {
                revivePossibility.call(this, iTemp, jTemp, k)
            }
        }

        return this;

    }


    function batchKillPossibilities(event){

        event.batch.forEach(
            function(el, idx, arr){
                killPossibilities.call(this,el);
            },
            this
        );

        return this;

    }


    function revivePossibility(i, j, k) {

        if (this._possibilityCube[i][j][k] === Sudoku.Solver.possibilityDead) {
            this._possibilityCube[i][j][k] = Sudoku.Solver.possibilityAlive;
            incrementCounters.call(this, i, j, k);
            this.dispatchEvent({
                type:"possibilityRevived",
                i:i,
                j:j,
                k:k
            });
        }
        return this;
    }


    function batchRevivePossibilities(event){

        event.batch.forEach(
            function(el, idx, arr){
                revivePossibilities.call(this,el);
            },
            this
        );

        return this;

    }


    function killPossibility(i, j, k, gbc) {

        if (this._possibilityCube[i][j][k] === Sudoku.Solver.possibilityAlive) {
            this._possibilityCube[i][j][k] = Sudoku.Solver.possibilityDead;
            decrementCounters.call(this, i, j, k, gbc);
            this.dispatchEvent({
                type:"possibilityKilled",
                i:i,
                j:j,
                k:k
            });
        }
        return this;

    }


    function getListOfCertainElementsByRowColumnAndSubGridCounter() {


    }

    /* gbc -> gameBoardCell coordinates and value for the
     cell that started the killing process for error checking
     purposes
     */
    function decrementCounters(i, j, k, gbc) {
        var errorFound = false
            , sgb = this._gameBoard.getSubGridBoundsContainingCell(i, j)
            , gbcSgb = this._gameBoard.getSubGridBoundsContainingCell(gbc.i, gbc.j)
            ;
        /*
         decrement relevant counters and if the counter
         is zero and the relevant dimension is not the same
         as the originating cell that started the killing process this
         branch has no solution and need not be investigated further
         */
        if (!--this._rowCounters[i][k] && gbc.i !== i) {
            errorFound = true;
        }
        if (!--this._columnCounters[j][k] && gbc.j !== j) {
            errorFound = true;
        }
        if (!--this._elementCounters[i][j] && gbc.i !== i && gbc.j !== j) {
            errorFound = true;
        }
        if (!--this._subGridCounters[sgb.iSubGrid][sgb.jSubGrid][k] &&
            gbcSgb.iSubGrid !== sgb.iSubGrid &&
            gbcSgb.jSubGrid !== sgb.jSubGrid) {
            errorFound = true;
        }
        if (errorFound) {
            this.dispatchEvent({
                type:"insolvableBranch"
            });
        }
    }


    function incrementCounters(i, j, k) {
        var sgb = this._gameBoard.getSubGridBoundsContainingCell(i, j);
        this._rowCounters[i][k]++;
        this._columnCounters[j][k]++;
        this._elementCounters[i][j]++;
        this._subGridCounters[sgb.iSubGrid][sgb.jSubGrid][k]++;
    }


})();