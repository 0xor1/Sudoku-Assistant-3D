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

        this._certainties = [];

        this._errors = [];

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


        possibilityIsAlive:function (i, j, k) {

            return this._possibilityCube[i][j][k].length === 0;

        },


        getCertainties:function () {

            var arr = this._certainties.slice(0)
                ;

            for (var i = 0, l = this._certainties.length; i < l; i++) {

                arr[i].types = this._certainties[i].types.slice(0);
            }

            return arr;

        },


        getErrors:function () {

            var arr = this._errors.slice(0)
                ;

            for (var i = 0, l = this._errors.length; i < l; i++) {

                arr[i].types = this._errors[i].types.slice(0);
            }

            return arr;

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
        /*reviveSubGridPossibilities*/
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


    function addCertainty(cert) {

        var certAlreadyExists = false
            ;

        for (var i = 0, l = this._certainties.length; i < l; i++) {

            if (this._certainties[i].i === cert.i &&
                this._certainties[i].j === cert.j &&
                this._certainties[i].k === cert.k) {

                certAlreadyExists = true;

                cert.types.forEach(

                    function (el, idx, arr) {

                        if (this._certainties[i].types.indexOf(el) === -1) {

                            this._certainties[i].types.push(el);

                        }

                    },

                    this

                );

                break;

            }

        }

        if (!certAlreadyExists) {

            this._certainties.push(cert);

            this.dispatchEvent({
                type:'certaintyAdded',
                i:cert.i,
                j:cert.j,
                k:cert.k
            });

        }

        return this;

    }


    function removeCertainty(cert) {

        for (var i = 0, l = this._certainties.length; i < l; i++) {

            if (this._certainties[i].i === cert.i &&
                this._certainties[i].j === cert.j &&
                this._certainties[i].k === cert.k) {

                cert.types.forEach(

                    function (el, idx, arr) {

                        var idx = this._certainties[i].types.indexOf(el);

                        if (idx !== -1) {

                            this._certainties[i].types.splice(idx, 1);

                        }

                    },

                    this

                );

                if (this._certainties[i].types.length === 0) {

                    this._certainties.splice(i, 1);

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
            , error = {i:i, j:j, k:k, types:[]}
            , errorFound = false;
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
            cert.types.push(row);
            if (gbc.i !== i || gbc.value - 1 !== k) {
                errorFound = true;
                error.types.push(row);
            }
        }
        if (this._columnCounters[j][k] === 0) {
            cert.types.push(column);
            if (gbc.j !== j || gbc.value - 1 !== k) {
                errorFound = true;
                error.types.push(column);
            }
        }
        if (this._elementCounters[i][j] === 0) {
            cert.types.push(element);
            if (gbc.i !== i || gbc.j !== j) {
                errorFound = true;
                error.types.push(element);
            }
        }
        if (this._subGridCounters[sgb.iSubGrid][sgb.jSubGrid][k] === 0) {
            cert.types.push(subGrid);
            if (gbcSgb.iSubGrid !== sgb.iSubGrid || gbcSgb.jSubGrid !== sgb.jSubGrid || gbc.value - 1 !== k) {
                errorFound = true;
                error.types.push(subGrid);
            }
        }

        if (cert.types.length > 0) {
            removeCertainty.call(this, cert);
        }

        if (this._rowCounters[i][k] === 1) {
            addCertaintyByRowCounter.call(this, i, k);
        }
        if (this._columnCounters[j][k] === 1) {
            addCertaintyByColumnCounter.call(this, j, k);
        }
        if (this._elementCounters[i][j] === 1) {
            addCertaintyByElementCounter.call(this, i, j);
        }
        if (this._subGridCounters[sgb.iSubGrid][sgb.jSubGrid][k] === 1) {
            addCertaintyBySubGridCounter.call(this, sgb.iSubGrid, sgb.jSubGrid, k);
        }

        if (errorFound) {

            unsolvableSituationHandler.call(this, error);

        }
    }


    function incrementCounters(i, j, k) {

        var sgb = this._gameBoard.getSubGridBoundsContainingCell(i, j)
            , cert = {i:i, j:j, k:k, types:[]}
            ;

        this._rowCounters[i][k]++;
        this._columnCounters[j][k]++;
        this._elementCounters[i][j]++;
        this._subGridCounters[sgb.iSubGrid][sgb.jSubGrid][k]++;

        if (this._rowCounters[i][k] === 2) {
            removeCertaintyByRowCounter.call(this, i, k);
        }
        if (this._columnCounters[j][k] === 2) {
            removeCertaintyByColumnCounter.call(this, j, k);
        }
        if (this._elementCounters[i][j] === 2) {
            removeCertaintyByElementCounter.call(this, i, j);
        }
        if (this._subGridCounters[sgb.iSubGrid][sgb.jSubGrid][k] === 2) {
            removeCertaintyBySubGridCounter.call(this, sgb, k);
        }

        if (this._rowCounters[i][k] === 1) {
            cert.types.push(row);
        }
        if (this._columnCounters[j][k] === 1) {
            cert.types.push(column);
        }
        if (this._elementCounters[i][j] === 1) {
            cert.types.push(element);
        }
        if (this._subGridCounters[sgb.iSubGrid][sgb.jSubGrid][k] === 1) {
            cert.types.push(subGrid);
        }

        if (cert.types.length > 0) {
            addCertainty.call(this, cert);
        }

    }


    function addCertaintyByRowCounter(i, k) {

        var cert = {i:i, j:0, k:k, types:[row]};

        for (; cert.j < this._nSqrd; cert.j++) {
            if (this._possibilityCube[i][cert.j][k].length === 0) {
                addCertainty.call(this, cert);
                break;
            }
        }

    }


    function addCertaintyByColumnCounter(j, k) {

        var cert = {i:0, j:j, k:k, types:[column]};

        for (; cert.i < this._nSqrd; cert.i++) {
            if (this._possibilityCube[cert.i][j][k].length === 0) {
                addCertainty.call(this, cert);
                break;
            }
        }

    }


    function addCertaintyByElementCounter(i, j) {

        var cert = {i:i, j:j, k:0, types:[element]};

        for (var k = 0; k < this._nSqrd; k++) {
            if (this._possibilityCube[i][j][k].length === 0) {
                cert.k = k;
                addCertainty.call(this, cert);
                break;
            }
        }

    }


    function addCertaintyBySubGridCounter(sgb, k) {

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


    function removeCertaintyByRowCounter(i, k) {

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


    function removeCertaintyByColumnCounter(j, k) {

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


    function removeCertaintyByElementCounter(i, j) {

        var certs = this._certainties
            , idx
            ,cert
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


    function removeCertaintyBySubGridCounter(sgb, k) {

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


    function unsolvableSituationHandler(errors) {

        //TODO

    }


})();
