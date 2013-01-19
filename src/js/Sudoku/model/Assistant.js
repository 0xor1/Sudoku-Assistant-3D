(function () {

    var row = 'row'
        , column = 'column'
        , element = 'element'
        , subGrid = 'subGrid'
        ;

    Sudoku.Assistant = function (gameBoard) {

        Utils.EventDispatcher.call(this);

        this._n = gameBoard.getGameSize();
        this._nSqrd = this._n * this._n;
        this._gameBoard = gameBoard;

        this._certainCells = [];

        this._possibilityCube = Utils.MultiArray(this._nSqrd, this._nSqrd, this._nSqrd);

        for (var i = 0; i < this._nSqrd; i++) {
            for (var j = 0; j < this._nSqrd; j++) {
                for (var k = 0; k < this._nSqrd; k++) {
                    this._possibilityCube[i][j][k] = [];
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

        cullPossibilities.call(this);

        attachEventListeners.call(this);

    }


    Sudoku.Assistant.prototype = {


        constructor:Sudoku.Assistant,


        possibilityIsAlive:function (i, j, value) {

            return this._possibilityCube[i][j][value - 1].length === 0;

        },


        getCertainCells:function () {

            var arr = this._certainCells.slice(0)
                ;

            for (var i = 0, l = this._certainCells.length; i < l; i++) {

                arr[i].type = this._certainCells[i].type.slice(0);
            }

            return arr;

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
            killPossibility.call(this, i, jTemp, k, row, gbc);
        }
        /*killColumnPossibilities*/
        for (iTemp = 0; iTemp < this._nSqrd; iTemp++) {
            killPossibility.call(this, iTemp, j, k, column, gbc);
        }
        /*killElementPossibilities*/
        for (kTemp = 0; kTemp < this._nSqrd; kTemp++) {
            killPossibility.call(this, i, j, kTemp, element, gbc);
        }
        /*killSubGridPossibilities*/
        for (iTemp = sgb.iLower; iTemp <= sgb.iUpper; iTemp++) {
            for (jTemp = sgb.jLower; jTemp <= sgb.jUpper; jTemp++) {
                killPossibility.call(this, iTemp, jTemp, k, subGrid, gbc);
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
            revivePossibility.call(this, i, jTemp, k, row);
        }
        /*reviveColumnPossibilities*/
        for (iTemp = 0; iTemp < this._nSqrd; iTemp++) {
            revivePossibility.call(this, iTemp, j, k, column);
        }
        /*reviveElementPossibilities*/
        for (kTemp = 0; kTemp < this._nSqrd; kTemp++) {
            revivePossibility.call(this, i, j, kTemp, element);
        }
        /*revivesubGridPossibilities*/
        for (iTemp = sgb.iLower; iTemp <= sgb.iUpper; iTemp++) {
            for (jTemp = sgb.jLower; jTemp <= sgb.jUpper; jTemp++) {
                revivePossibility.call(this, iTemp, jTemp, k, subGrid);
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


    function revivePossibility(i, j, k, type) {

        var idx = this._possibilityCube[i][j][k].indexOf(type)
            ;

        if (idx !== -1) {
            this._possibilityCube[i][j][k].splice(idx, 1);
            if (this._possibilityCube[i][j][k].length === 0) {
                incrementCounters.call(this, i, j, k);
                this.dispatchEvent({
                    type:"possibilityRevived",
                    i:i,
                    j:j,
                    k:k
                });
            }
        }
        return this;
    }


    function killPossibility(i, j, k, type, gbc) {

        var idx = this._possibilityCube[i][j][k].indexOf(type)
            ;

        if (idx === -1) {

            this._possibilityCube[i][j][k].push(type);

            if (this._possibilityCube[i][j][k].length === 1) {

                decrementCounters.call(this, i, j, k, gbc);

                this.dispatchEvent({
                    type:"possibilityKilled",
                    i:i,
                    j:j,
                    k:k
                });

            }
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
        var error = {
                found:false,
                errors:[]
            }
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
            cert.type.push(row);
            if (gbc.i !== i) {
                error.found = true;
                error.errors.push({
                    type:row,
                    i:i,
                    j:null,
                    k:k
                });
            }
        }
        if (this._columnCounters[j][k] === 0) {
            cert.type.push(column);
            if (gbc.j !== j) {
                error.found = true;
                error.errors.push({
                    type:column,
                    i:i,
                    j:null,
                    k:k
                });
            }
        }
        if (this._elementCounters[i][j] === 0) {
            cert.type.push(element);
            if (gbc.i !== i && gbc.j !== j) {
                error.found = true;
            }
        }
        if (this._subGridCounters[sgb.iSubGrid][sgb.jSubGrid][k] === 0) {
            cert.type.push(subGrid);
            if (gbcSgb.iSubGrid !== sgb.iSubGrid && gbcSgb.jSubGrid !== sgb.jSubGrid) {
                error.found = true;
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

        if (error.found) {

            unsolvableSituationHandler.call(this, error.errors);

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
            removeCertainCellBySubGridCounter.call(this, sgb, k);
        }

        if (this._rowCounters[i][k] === 1) {
            cert.type.push(row);
        }
        if (this._columnCounters[j][k] === 1) {
            cert.type.push(column);
        }
        if (this._elementCounters[i][j] === 1) {
            cert.type.push(element);
        }
        if (this._subGridCounters[sgb.iSubGrid][sgb.jSubGrid][k] === 1) {
            cert.type.push(subGrid);
        }

        if (cert.type.length > 0) {
            addCertainCell.call(this, cert);
        }

    }


    function addCertainCellByRowCounter(i, k) {

        var cert = {i:i, j:0, value:k + 1, type:[row]};

        for (; cert.j < this._nSqrd; cert.j++) {
            if (this._possibilityCube[i][cert.j][k].length === 0) {
                addCertainCell.call(this, cert);
                break;
            }
        }

    }


    function addCertainCellByColumnCounter(j, k) {

        var cert = {i:0, j:j, value:k + 1, type:[column]};

        for (; cert.i < this._nSqrd; cert.i++) {
            if (this._possibilityCube[cert.i][j][k].length === 0) {
                addCertainCell.call(this, cert);
                break;
            }
        }

    }


    function addCertainCellByElementCounter(i, j) {

        var cert = {i:i, j:j, value:0, type:[element]};

        for (var k = 0; k < this._nSqrd; k++) {
            if (this._possibilityCube[i][j][k].length === 0) {
                cert.value = k + 1;
                addCertainCell.call(this, cert);
                break;
            }
        }

    }


    function addCertainCellBySubGridCounter(sgb, k) {

        var cert = {i:sgb.iLower, j:sgb.jLower, value:k + 1, type:[subGrid]}
            , certFound = false
            ;

        for (cert.i = sgb.iLower; cert.i <= sgb.iUpper; cert.i++) {
            for (cert.j = sgb.jLower; cert.j <= sgb.jUpper; cert.j++) {
                if (this._possibilityCube[cert.i][cert.j][k].length === 0) {
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

        var certCells = this._certainCells
            , idx
            ;

        for (var j = 0, l = certCells.length; j < l; j++) {
            if (certCells[j].i === i && certCells[j].value === k + 1) {
                idx = certCells[j].type.indexOf(row);
                if (idx !== -1) {
                    certCells[j].type.splice(idx, 1);
                    if (certCells[j].type.length === 0) {
                        certCells.splice(j, 1);
                    }
                    break;
                }
            }
        }

        return this;

    }


    function removeCertainCellByColumnCounter(j, k) {

        var certCells = this._certainCells
            , idx
            ;

        for (var i = 0, l = certCells.length; i < l; i++) {
            if (certCells[i].j === j && certCells[i].value === k + 1) {
                idx = certCells[i].type.indexOf(column);
                if (idx !== -1) {
                    certCells[i].type.splice(idx, 1);
                    if (certCells[i].type.length === 0) {
                        certCells.splice(i, 1);
                    }
                    break;
                }
            }
        }

        return this;

    }


    function removeCertainCellByElementCounter(i, j) {

        var certCells = this._certainCells
            , idx
            ;

        for (var m = 0, l = certCells.length; m < l; m++) {
            if (certCells[m].i === i && certCells[m].j === j) {
                idx = certCells[m].type.indexOf(element);
                if (idx !== -1) {
                    certCells[m].type.splice(idx, 1);
                    if (certCells[m].type.length === 0) {
                        certCells.splice(m, 1);
                    }
                    break;
                }
            }
        }

        return this;

    }


    function removeCertainCellBySubGridCounter(sgb, k) {

        var certCells = this._certainCells
            , idx
            ;

        for (var m = 0, l = certCells.length; m < l; m++) {
            if (certCells[m].i >= sgb.iLower && certCells[m].i <= sgb.iUpper &&
                certCells[m].j >= sgb.jLower && certCells[m].j <= sgb.jUpper &&
                certCells[m].value === k + 1) {
                idx = certCells[m].type.indexOf(subGrid);
                if (idx !== -1) {
                    certCells[m].type.splice(idx, 1);
                    if (certCells[m].type.length === 0) {
                        certCells.splice(m, 1);
                    }
                    break;
                }
            }
        }


    }


    function getBestPossibilitiesBySmallestFork() {

        var smallestFork = {branches:this._nSqrd + 1, i:null, j:null, k:null, type:null}
            , bestPos = []
            , sgb
            ;

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
                        value:smallestFork.k+1,
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
                        value:smallestFork.k+1,
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
                        value:k+1,
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
                            value:smallestFork.k+1,
                            type:smallestFork.type
                        });
                    }
                }
            }

        }

        return bestPos;

    }


    function unsolvableSituationHandler(errors){

        //TODO

    }


})();
