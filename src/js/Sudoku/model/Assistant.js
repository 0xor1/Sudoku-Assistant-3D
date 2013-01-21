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
            , sgb
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
                this._columnCounters[j][k] = {
                    counterType:column,
                    j:j,
                    k:k,
                    value:this._nSqrd,
                    cells:[]
                };
                this._masterCounter.push(this._columnCounters[j][k]);
                for (i = 0; i < this._nSqrd; i++) {
                    this._columnCounters[j][k].cells.push(this._possibilityCube[i][j][k]);
                }
            }
        }

        this._elementCounters = Utils.MultiArray(this._nSqrd, this._nSqrd);

        for (i = 0; i < this._nSqrd; i++) {
            for (j = 0; j < this._nSqrd; j++) {
                this._elementCounters[i][j] = {
                    counterType:element,
                    i:i,
                    j:j,
                    value:this._nSqrd,
                    cells:[]
                };
                this._masterCounter.push(this._elementCounters[i][j]);
                for (k = 0; k < this._nSqrd; k++) {
                    this._elementCounters[i][j].cells.push(this._possibilityCube[i][j][k]);
                }
            }
        }

        this._subGridCounters = Utils.MultiArray(this._n, this._n, this._nSqrd);

        for (i = 0; i < this._n; i++) {
            for (j = 0; j < this._n; j++) {
                for (k = 0; k < this._nSqrd; k++) {
                    sgb = this._gameBoard.getSubGridBoundsContainingCell(i, j);
                    this._subGridCounters[i][j][k] = {
                        counterType:subGrid,
                        i:i,
                        j:j,
                        k:k,
                        value:this._nSqrd,
                        cells:[]
                    };
                    this._masterCounter.push(this._subGridCounters[i][j][k]);
                    for (iTemp = sgb.iLower; iTemp <= sgb.iUpper; iTemp++) {
                        for (jTemp = sgb.jLower; jTemp <= sgb.jUpper; jTemp) {
                            this._subGridCounters[i][j][k].cells.push(this._possibilityCube[iTemp][jTemp][k]);
                        }
                    }
                }
            }
        }

        cullPossibilities.call(this);

        attachEventListeners.call(this);

    };


    Sudoku.Assistant.prototype = {


        constructor:Sudoku.Assistant,


        possibilityIsAlive:function (i, j, k) {

            return this._possibilityCube[i][j][k].killers.length === 0;

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
            , gbc = {i:event.i, j:event.j, value:event.value}
            , iTemp
            , jTemp
            , kTemp
            ;

        /*reviveRowPossibilities*/
        for (jTemp = 0; jTemp < this._nSqrd; jTemp++) {
            revivePossibility.call(this, i, jTemp, k, row, gbc);
        }
        /*reviveColumnPossibilities*/
        for (iTemp = 0; iTemp < this._nSqrd; iTemp++) {
            revivePossibility.call(this, iTemp, j, k, column, gbc);
        }
        /*reviveElementPossibilities*/
        for (kTemp = 0; kTemp < this._nSqrd; kTemp++) {
            revivePossibility.call(this, i, j, kTemp, element, gbc);
        }
        /*reviveSubGridPossibilities*/
        for (iTemp = sgb.iLower; iTemp <= sgb.iUpper; iTemp++) {
            for (jTemp = sgb.jLower; jTemp <= sgb.jUpper; jTemp++) {
                revivePossibility.call(this, iTemp, jTemp, k, subGrid, gbc);
            }
        }

        return this;

    }


    function revivePossibility(i, j, k, type, gbc) {

        var idx = this._possibilityCube[i][j][k].killers.indexOf(type)
            ;

        if (idx !== -1) {

            this._possibilityCube[i][j][k].killers.splice(idx, 1);

            if (this._possibilityCube[i][j][k].killers.length === 0) {

                incrementCounters.call(this, i, j, k, gbc);

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

        var idx = this._possibilityCube[i][j][k].killers.indexOf(type)
            ;

        if (idx === -1) {

            this._possibilityCube[i][j][k].killers.push(type);

            if (this._possibilityCube[i][j][k].killers.length === 1) {

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


    /* gbc -> gameBoardCell coordinates and value for the
     cell that started the killing process for error checking
     purposes
     */
    function decrementCounters(i, j, k, gbc) {
        var sgb = this._gameBoard.getSubGridBoundsContainingCell(i, j)
            , gbcSgb = this._gameBoard.getSubGridBoundsContainingCell(gbc.i, gbc.j)
            , cert = {i:i, j:j, k:k, types:[]}
            , counters = [
                this._rowCounters[i][k],
                this._columnCounters[j][k],
                this._elementCounters[i][j],
                this._subGridCounters[sgb.iSubGrid][sgb.jSubGrid][k]
            ]
            ;

        counters.forEach(
            function (el, idx, arr) {

                var i
                    , typeIdx
                    ;

                if (el.value-- === 1) {

                    for (i = 0; i < this._nSqrd; i++) {

                        if (el.cells[i].killers.length === 0) {


                            break;

                        }

                    }

                    if (typeIdx = el.cells[i].certainties.indexOf(el.counterType) === -1) {

                        el.cells

                    }

                }

            },

            this

        );

        /*
         decrement relevant counters and if the counter
         is zero and the relevant dimension is not the same
         as the originating cell that started the killing process this
         branch has no solution and need not be investigated further
         */
        this._rowCounters[i][k].value--;
        this._columnCounters[j][k].value--;
        this._elementCounters[i][j].value--;
        this._subGridCounters[sgb.iSubGrid][sgb.jSubGrid][k].value--;

        if (this._rowCounters[i][k].value === 0) {
            cert.types.push(row);
            if (gbc.i !== i || gbc.value - 1 !== k) {
                addErrorByRow.call(this, i, k);
            }
        }
        if (this._columnCounters[j][k] === 0) {
            cert.types.push(column);
            if (gbc.j !== j || gbc.value - 1 !== k) {
                addErrorByColumn.call(this, j, k);
            }
        }
        if (this._elementCounters[i][j] === 0) {
            cert.types.push(element);
            if (gbc.i !== i || gbc.j !== j) {
                addErrorByElement.call(this, i, j);
            }
        }
        if (this._subGridCounters[sgb.iSubGrid][sgb.jSubGrid][k] === 0) {
            cert.types.push(subGrid);
            if (gbcSgb.iSubGrid !== sgb.iSubGrid || gbcSgb.jSubGrid !== sgb.jSubGrid || gbc.value - 1 !== k) {
                addErrorBySubGrid.call(this, sgb, k);
            }
        }

        if (cert.types.length > 0) {
            removeCertainty.call(this, cert);
        }

        if (this._rowCounters[i][k] === 1) {
            addCertaintyByRow.call(this, i, k);
        }
        if (this._columnCounters[j][k] === 1) {
            addCertaintyByColumn.call(this, j, k);
        }
        if (this._elementCounters[i][j] === 1) {
            addCertaintyByElement.call(this, i, j);
        }
        if (this._subGridCounters[sgb.iSubGrid][sgb.jSubGrid][k] === 1) {
            addCertaintyBySubGrid.call(this, sgb, k);
        }

    }


    function incrementCounters(i, j, k, gbc) {

        var sgb = this._gameBoard.getSubGridBoundsContainingCell(i, j)
            , cert = {i:i, j:j, k:k, types:[]}
            ;

        this._rowCounters[i][k]++;
        this._columnCounters[j][k]++;
        this._elementCounters[i][j]++;
        this._subGridCounters[sgb.iSubGrid][sgb.jSubGrid][k]++;

        if (this._rowCounters[i][k] === 2) {
            removeCertaintyByRow.call(this, i, k);
        }
        if (this._columnCounters[j][k] === 2) {
            removeCertaintyByColumn.call(this, j, k);
        }
        if (this._elementCounters[i][j] === 2) {
            removeCertaintyByElement.call(this, i, j);
        }
        if (this._subGridCounters[sgb.iSubGrid][sgb.jSubGrid][k] === 2) {
            removeCertaintyBySubGrid.call(this, sgb, k);
        }

        if (this._rowCounters[i][k] === 1) {
            cert.types.push(row);
            if (gbc.i !== i || gbc.value - 1 !== k) {
                removeErrorByRow.call(this, i, k);
            }
        }
        if (this._columnCounters[j][k] === 1) {
            cert.types.push(column);
            if (gbc.j !== j || gbc.value - 1 !== k) {
                removeErrorByColumn.call(this, j, k);
            }
        }
        if (this._elementCounters[i][j] === 1) {
            cert.types.push(element);
            if (gbc.i !== i || gbc.j !== j) {
                removeErrorByElement.call(this, i, j);
            }
        }
        if (this._subGridCounters[sgb.iSubGrid][sgb.jSubGrid][k] === 1) {
            cert.types.push(subGrid);
            if (gbcSgb.iSubGrid !== sgb.iSubGrid || gbcSgb.jSubGrid !== sgb.jSubGrid || gbc.value - 1 !== k) {
                removeErrorBySubGrid.call(this, sgb, k);
            }
        }

        if (cert.types.length > 0) {
            addCertainty.call(this, cert);
        }

    }


    function addCertaintyByRow(i, k) {

        var cert = {i:i, j:0, k:k, types:[row]};

        for (; cert.j < this._nSqrd; cert.j++) {
            if (this._possibilityCube[i][cert.j][k].length === 0) {
                addCertainty.call(this, cert);
                break;
            }
        }

    }


    function addCertaintyByColumn(j, k) {

        var cert = {i:0, j:j, k:k, types:[column]};

        for (; cert.i < this._nSqrd; cert.i++) {
            if (this._possibilityCube[cert.i][j][k].length === 0) {
                addCertainty.call(this, cert);
                break;
            }
        }

    }


    function addCertaintyByElement(i, j) {

        var cert = {i:i, j:j, k:0, types:[element]};

        for (var k = 0; k < this._nSqrd; k++) {
            if (this._possibilityCube[i][j][k].length === 0) {
                cert.k = k;
                addCertainty.call(this, cert);
                break;
            }
        }

    }


    function addCertaintyBySubGrid(sgb, k) {

        var cert = {i:sgb.iLower, j:sgb.jLower, k:k, types:[subGrid]}
            , certFound = false
            ;

        for (cert.i = sgb.iLower; cert.i <= sgb.iUpper; cert.i++) {
            for (cert.j = sgb.jLower; cert.j <= sgb.jUpper; cert.j++) {
                if (this._possibilityCube[cert.i][cert.j][k].length === 0) {
                    addCertainty.call(this, cert);
                    certFound = true;
                    break;
                }
            }
            if (certFound) {
                break;
            }
        }

    }


    function removeCertaintyByRow(i, k) {

        var certs = this._certainties
            , idx
            , cert
            ;

        for (var j = 0, l = certs.length; j < l; j++) {
            if (certs[j].i === i && certs[j].k === k) {
                idx = certs[j].types.indexOf(row);
                if (idx !== -1) {
                    certs[j].types.splice(idx, 1);
                    if (certs[j].types.length === 0) {
                        cert = certs.splice(j, 1)[0];
                        this.dispatchEvent({
                            type:'certaintyRemoved',
                            i:cert.i,
                            j:cert.j,
                            k:cert.k
                        });
                    }
                    break;
                }
            }
        }

        return this;

    }


    function removeCertaintyByColumn(j, k) {

        var certs = this._certainties
            , idx
            , cert
            ;

        for (var i = 0, l = certs.length; i < l; i++) {
            if (certs[i].j === j && certs[i].k === k) {
                idx = certs[i].types.indexOf(column);
                if (idx !== -1) {
                    certs[i].types.splice(idx, 1);
                    if (certs[i].types.length === 0) {
                        cert = certs.splice(i, 1)[0];
                        this.dispatchEvent({
                            type:'certaintyRemoved',
                            i:cert.i,
                            j:cert.j,
                            k:cert.k
                        });
                    }
                    break;
                }
            }
        }

        return this;

    }


    function removeCertaintyByElement(i, j) {

        var certs = this._certainties
            , idx
            , cert
            ;

        for (var m = 0, l = certs.length; m < l; m++) {
            if (certs[m].i === i && certs[m].j === j) {
                idx = certs[m].types.indexOf(element);
                if (idx !== -1) {
                    certs[m].types.splice(idx, 1);
                    if (certs[m].types.length === 0) {
                        cert = certs.splice(m, 1)[0];
                        this.dispatchEvent({
                            type:'certaintyRemoved',
                            i:cert.i,
                            j:cert.j,
                            k:cert.k
                        });
                    }
                    break;
                }
            }
        }

        return this;

    }


    function removeCertaintyBySubGrid(sgb, k) {

        var certs = this._certainties
            , idx
            , cert
            ;

        for (var m = 0, l = certs.length; m < l; m++) {
            if (certs[m].i >= sgb.iLower && certs[m].i <= sgb.iUpper &&
                certs[m].j >= sgb.jLower && certs[m].j <= sgb.jUpper &&
                certs[m].k === k) {
                idx = certs[m].types.indexOf(subGrid);
                if (idx !== -1) {
                    certs[m].types.splice(idx, 1);
                    if (certs[m].types.length === 0) {
                        cert = certs.splice(m, 1)[0];
                        this.dispatchEvent({
                            type:'certaintyRemoved',
                            i:cert.i,
                            j:cert.j,
                            k:cert.k
                        });
                    }
                    break;
                }
            }
        }


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


        getKillers:function(){

            return this._killers.slice(0);

        },


        addKiller:function (type, killerInfo) {

            if (this._killers.indexOf(type) === -1) {

                this._killers.push(type);

                if (this._killers.length === 1) {

                    this.dispatchEvent({
                        type:killed,
                        i:this._i,
                        j:this._j,
                        k:this._k,
                        killers:this.getKillers(),
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
                        i:this._i,
                        j:this._j,
                        k:this._k,
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
                        type:hasErrors,
                        i:this._i,
                        j:this._j,
                        k:this._k,
                        errors:this.getErrors()
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
                        type:hasNoErrors,
                        i:this._i,
                        j:this._j,
                        k:this._k
                    });

                }

            }

            return this;

        },


        isCertainty:function () {

            return this._certainties > 0;

        },


        notCertainty:function () {

            return !this.isCertainty();

        },


        getCertainties:function () {

            return this._certainties.slice(0);

        },


        addCertainty:function () {

            if (this._certainties.indexOf(type) === -1) {

                this._certainties.push(type);

                if (this._certainties.length === 1) {

                    this.dispatchEvent({
                        type:isCertainty,
                        i:this._i,
                        j:this._j,
                        k:this._k,
                        certainties:this.getCertainties()
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
                        type:isNotCertainty,
                        i:this._i,
                        j:this._j,
                        k:this._k
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

                el.addEventListener(killed, function(event){this.decrement(event);}.bind(this));
                el.addEventListener(revived, function(event){this.increment(event);}.bind(this));

            },

            this
        )
    }


    Counter.prototype = {


        constructor:Counter,


        decrement:function(event){

            this._value--;

            if(this._value === 0){

                if(checkForError.call(this, event)){



                }

            }

        }

    };


    function checkForError (event){



    }


})();
