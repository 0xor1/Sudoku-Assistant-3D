(function () {

    Sudoku.Solver = function (gameBoard, solver, guessedCell) {

        Utils.EventDispatcher.call(this);

        this._n = gameBoard.getGameSize();
        this._nSqrd = this._n * this._n;
        this._gameBoard = gameBoard;

        if (solver instanceof Sudoku.Solver) {
            this._parent = solver;
            this._guessedCell = guessedCell;
        } else {
            this._parent = null;
            this._guessedCell = null;
        }

        this._children = []; //for exploring forks

        this._entryList = []; //batch array for values this solver has entered into the gameboard in the order they were entered

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


        sequentialAutoSolve:function (delay) {

            var cert = {
                i:this._certainCells[0].i,
                j:this._certainCells[0].j,
                value:this._certainCells[0].value,
                type:this._certainCells[0].type.slice(0)
            }

            this._gameBoard.enterValue(cert.i, cert.j, cert.value);

            //removeCertainCell.call(this, cert);

            setTimeout(function(){this.sequentialAutoSolve(delay)}.bind(this), delay);

            return this;

        },


        batchAutoSolve:function (delay) {

            this._gameBoard.batchEnterValue(this._certainCells);

            setTimeout(function(){this.batchAutoSolve(delay)}.bind(this), delay);

            return this;

        },


        possibilityIsAlive:function (i, j, value) {

            return this._possibilityCube[i][j][value - 1] === Sudoku.Solver.possibilityAlive;

        },


        getListOfCertainCells:function () {

            var arr = this._certainCells.slice(0)
                ;

            for (var i = 0, l = this._certainCells.length; i < l; i++) {

                    arr[i].type = this._certainCells[i].type.slice(0);
            }

            return arr;

        }

    };


    function initialize() {

        var value
            ;

        for (var i = 0; i < this._nSqrd; i++) {
            for (var j = 0; j < this._nSqrd; j++) {
                if (value = this._gameBoard.getValue(i, j) !== 0) {
                    killPossibilities.call(this, {i:i, j:j, value:value});
                }
            }
        }

        this._gameBoard.addEventListener('valueEntered', killPossibilities.bind(this));

        this._gameBoard.addEventListener('valueCleared', revivePossibilities.bind(this));

        this._gameBoard.addEventListener('batchValueEntered', batchKillPossibilities.bind(this));

        this._gameBoard.addEventListener('batchValueCleared', batchRevivePossibilities.bind(this));

        this.addEventListener('insolvableBranch', insolvableBranch.bind(this));

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
        for (jTemp = 0; jTemp < this._nSqrd; jTemp++) {
            killPossibility.call(this, i, jTemp, k, gbc);
        }
        /*killColumnPossibilities*/
        for (iTemp = 0; iTemp < this._nSqrd; iTemp++) {
            killPossibility.call(this, iTemp, j, k, gbc);
        }
        /*killElementPossibilities*/
        for (kTemp = 0; kTemp < this._nSqrd; kTemp++) {
            killPossibility.call(this, i, j, kTemp, gbc);
        }
        /*killSubGridPossibilities*/
        for (iTemp = sgb.iLower; iTemp <= sgb.iUpper; iTemp++) {
            for (jTemp = sgb.jLower; jTemp <= sgb.jUpper; jTemp++) {
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
        for (jTemp = 0; jTemp < this._nSqrd; jTemp++) {
            revivePossibility.call(this, i, jTemp, k);
        }
        /*reviveColumnPossibilities*/
        for (iTemp = 0; iTemp < this._nSqrd; iTemp++) {
            revivePossibility.call(this, iTemp, j, k);
        }
        /*reviveElementPossibilities*/
        for (kTemp = 0; kTemp < this._nSqrd; kTemp++) {
            revivePossibility.call(this, i, j, kTemp);
        }
        /*revivesubGridPossibilities*/
        for (iTemp = sgb.iLower; iTemp <= sgb.iUpper; iTemp++) {
            for (jTemp = sgb.jLower; jTemp <= sgb.jUpper; jTemp++) {
                revivePossibility.call(this, iTemp, jTemp, k)
            }
        }

        return this;

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


    function addCertainCell(cert) {

        var certCells = this._certainCells
            , certAlreadyExists = false
            ;

        for (var i = 0, l = certCells.length; i < l; i++) {

            if (certCells[i].i === cert.i &&
                certCells[i].j === cert.j &&
                certCells[i].value === cert.value) {

                certAlreadyExists = true;

                cert.type.forEach(

                    function (el, idx, arr) {

                        if (certCells[i].type.indexOf(el) === -1) {

                            certCells[i].type.push(el);

                        }

                    }

                );

                break;

            }

        }

        if (!certAlreadyExists) {

            certCells.push(cert);

        }

        return this;

    }


    function removeCertainCell(cert) {

        var certCells = this._certainCells
            ;

        for (var i = 0, l = certCells.length; i < l; i++) {

            if (certCells[i].i === cert.i &&
                certCells[i].j === cert.j &&
                certCells[i].value === cert.value) {

                cert.type.forEach(

                    function (el, idx, arr) {

                        var idx = certCells[i].type.indexOf(el);

                        if (idx !== -1) {

                            certCells[i].type.splice(idx, 1);

                        }

                    }

                );

                if (certCells[i].type.length === 0) {

                    certCells.splice(i, 1);

                }

                break;

            }

        }

        return this;

    }


    /* gbc -> gameBoardCell coordinates and value for the
     cell that started the killing process for error checking
     purposes
     */
    function decrementCounters(i, j, k, gbc) {
        var errorFound = false
            , sgb = this._gameBoard.getSubGridBoundsContainingCell(i, j)
            , gbcSgb = this._gameBoard.getSubGridBoundsContainingCell(gbc.i, gbc.j)
            , cert = {i:i, j:j, value:k + 1, type:[]}
            ;
        /*
         decrement relevant counters and if the counter
         is zero and the relevant dimension is not the same
         as the originating cell that started the killing process this
         branch has no solution and need not be investigated further
         */
        this._rowCounters[i][k]--;
        this._columnCounters[j][k]--;
        this._elementCounters[i][j]--;
        this._subGridCounters[sgb.iSubGrid][sgb.jSubGrid][k]--;

        if (this._rowCounters[i][k] === 0) {
            cert.type.push('row');
            if (gbc.i !== i) {
                errorFound = true;
            }
        }
        if (this._columnCounters[j][k] === 0) {
            cert.type.push('column');
            if (gbc.j !== j) {
                errorFound = true;
            }
        }
        if (this._elementCounters[i][j] === 0) {
            cert.type.push('element');
            if (gbc.i !== i && gbc.j !== j) {
                errorFound = true;
            }
        }
        if (this._subGridCounters[sgb.iSubGrid][sgb.jSubGrid][k] === 0) {
            cert.type.push('subGrid');
            if (gbcSgb.iSubGrid !== sgb.iSubGrid && gbcSgb.jSubGrid !== sgb.jSubGrid) {
                errorFound = true;
            }
        }

        if (cert.type.length > 0) {
            removeCertainCell.call(this, cert);
        }

        if (this._rowCounters[i][k] === 1) {
            addCertainCellByRowCounter.call(this, i, k);
        }
        if (this._columnCounters[j][k] === 1) {
            addCertainCellByColumnCounter.call(this, j, k);
        }
        if (this._elementCounters[i][j] === 1) {
            addCertainCellByElementCounter.call(this, i, j);
        }
        if (this._subGridCounters[sgb.iSubGrid][sgb.jSubGrid][k] === 1) {
            addCertainCellBySubGridCounter.call(this, sgb.iSubGrid, sgb.jSubGrid, k);
        }

        if (errorFound) {
            this.dispatchEvent({
                type:"insolvableBranch"
            });
        }
    }


    function incrementCounters(i, j, k) {

        var sgb = this._gameBoard.getSubGridBoundsContainingCell(i, j)
            , cert = {i:i, j:j, value:k + 1, type:[]}
            ;

        this._rowCounters[i][k]++;
        this._columnCounters[j][k]++;
        this._elementCounters[i][j]++;
        this._subGridCounters[sgb.iSubGrid][sgb.jSubGrid][k]++;

        if (this._rowCounters[i][k] === 2) {
            removeCertainCellByRowCounter.call(this, i, k);
        }
        if (this._columnCounters[j][k] === 2) {
            removeCertainCellByColumnCounter.call(this, j, k);
        }
        if (this._elementCounters[i][j] === 2) {
            removeCertainCellByElementCounter.call(this, i, j);
        }
        if (this._subGridCounters[sgb.iSubGrid][sgb.jSubGrid][k] === 2) {
            removeCertainCellBySubGridCounter.call(this, sgb.iSubGrid, sgb.jSubGrid, k);
        }

        if (this._rowCounters[i][k] === 1) {
            cert.type.push('row');
        }
        if (this._columnCounters[j][k] === 1) {
            cert.type.push('column');
        }
        if (this._elementCounters[i][j] === 1) {
            cert.type.push('element');
        }
        if (this._subGridCounters[sgb.iSubGrid][sgb.jSubGrid][k] === 1) {
            cert.type.push('subGrid');
        }

        if(cert.type.length > 0){
            addCertainCell.call(this, cert);
        }

    }


    function addCertainCellByRowCounter(i, k) {

        var cert = {i:i, j:0, value:k + 1, type:['row']};

        for (; cert.j < this._nSqrd; cert.j++) {
            if (this._possibilityCube[i][cert.j][k] === Sudoku.Solver.possibilityAlive) {
                addCertainCell.call(this, cert);
                break;
            }
        }

    }


    function addCertainCellByColumnCounter(j, k) {

        var cert = {i:0, j:j, value:k + 1, type:['column']};

        for (; cert.i < this._nSqrd; cert.i++) {
            if (this._possibilityCube[cert.i][j][k] === Sudoku.Solver.possibilityAlive) {
                addCertainCell.call(this, cert);
                break;
            }
        }

    }


    function addCertainCellByElementCounter(i, j) {

        var cert = {i:i, j:j, value:0, type:['element']};

        for (var k = 0; k < this._nSqrd; k++) {
            if (this._possibilityCube[i][j][k] === Sudoku.Solver.possibilityAlive) {
                cert.value = k + 1;
                addCertainCell.call(this, cert);
                break;
            }
        }

    }


    function addCertainCellBySubGridCounter(iSubGrid, jSubGrid, k) {

        var iLower = iSubGrid * this._n
            , iUpper = iLower + this._n
            , jLower = jSubGrid * this._n
            , jUpper = jLower + this._n
            , cert = {i:iLower, j:jLower, value:k + 1, type:['subGrid']}
            , certFound = false
            ;

        for (cert.i = iLower; cert.i < iUpper; cert.i++) {
            for (cert.j = jLower; cert.j < jUpper; cert.j++) {
                if (this._possibilityCube[cert.i][cert.j][k] === Sudoku.Solver.possibilityAlive) {
                    addCertainCell.call(this, cert);
                    certFound = true;
                    break;
                }
            }
            if (certFound) {
                break;
            }
        }

    }


    function removeCertainCellByRowCounter(i, k) {

        var idx;

        for (var j = 0, l = this._certainCells.length; j < l; j++) {
            if (this._certainCells[j].i === i && this._certainCells[j].value === k + 1) {
                idx = this._certainCells[j].type.indexOf('row');
                if (idx !== -1) {
                    this._certainCells[j].type.splice(idx, 1);
                    if (this._certainCells[j].type.length === 0) {
                        this._certainCells.splice(j, 1);
                    }
                    break;
                }
            }
        }

        return this;

    }


    function removeCertainCellByColumnCounter(j, k) {

        var idx;

        for (var i = 0, l = this._certainCells.length; i < l; i++) {
            if (this._certainCells[i].j === j && this._certainCells[i].value === k + 1) {
                idx = this._certainCells[i].type.indexOf('column');
                if (idx !== -1) {
                    this._certainCells[i].type.splice(idx, 1);
                    if (this._certainCells[i].type.length === 0) {
                        this._certainCells.splice(i, 1);
                    }
                    break;
                }
            }
        }

        return this;

    }


    function removeCertainCellByElementCounter(i, j) {

        var idx;

        for (var m = 0, l = this._certainCells.length; m < l; m++) {
            if (this._certainCells[m].i === i && this._certainCells[m].j === j) {
                idx = this._certainCells[m].type.indexOf('element');
                if (idx !== -1) {
                    this._certainCells[m].type.splice(idx, 1);
                    if (this._certainCells[m].type.length === 0) {
                        this._certainCells.splice(m, 1);
                    }
                    break;
                }
            }
        }

        return this;

    }


    function removeCertainCellBySubGridCounter(iSubGrid, jSubGrid, k) {

        var iLower = iSubGrid * this._n
            , iUpper = iLower + this._n - 1
            , jLower = jSubGrid * this._n
            , jUpper = jLower + this._n - 1
            , idx
            ;

        for (var m = 0, l = this._certainCells.length; m < l; m++) {
            if (this._certainCells[m].i >= iLower && this._certainCells[m].i <= iUpper &&
                this._certainCells[m].j >= jLower && this._certainCells[m].j <= jUpper &&
                this._certainCells[m].value === k + 1) {
                idx = this._certainCells[m].type.indexOf('subGrid');
                if (idx !== -1) {
                    this._certainCells[m].type.splice(idx, 1);
                    if (this._certainCells[m].type.length === 0) {
                        this._certainCells.splice(m, 1);
                    }
                    break;
                }
            }
        }


    }


    function insolvableBranch() {


    }


})();