(function () {

    var row = 'row'
        , column = 'column'
        , element = 'element'
        , subGrid = 'subGrid'
        ;

    Sudoku.Solver = function (gameBoard) {

        Utils.EventDispatcher.call(this);

        SolverNode.call(this);

        this._activeNode = this;

        this._n = gameBoard.getGameSize();
        this._nSqrd = this._n * this._n;
        this._externalGameBoard = gameBoard;
        this._internalGameBoard = new Sudoku.GameBoard(this._n);

        this._solverStopAndReset = false;

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

        attachEventListeners.call(gameBoard);

    }


    function attachEventListeners(externalGameBoard) {

        this._internalGameBoard.addEventListener('valueEntered', killPossibilities.bind(this));

        this._internalGameBoard.addEventListener('valueCleared', revivePossibilities.bind(this));

        this._internalGameBoard.addEventListener('batchValueEntered', batchKillPossibilities.bind(this));

        this._internalGameBoard.addEventListener('batchValueCleared', batchRevivePossibilities.bind(this));

        externalGameBoard.addEventListener('startingConfigurationSaved', start.bind(this));

        externalGameBoard.addEventListener('startingConfigurationDiscarded', stopAndReset.bind(this));

        return this;

    }

    function stopAndReset(){

        this._stopAndReset = false;
        this._internalGameBoard.wipeClean();

    }

    function start(){

        this._internalGameBoard.batchEnterValue(this._externalGameBoard._startingConfiguration);

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

        var certCells = this._activeNode._certainCells
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

        var certCells = this._activeNode._certainCells
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

            branchFailed.call(this);

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

        if (cert.type.length > 0) {
            addCertainCell.call(this, cert);
        }

    }


    function addCertainCellByRowCounter(i, k) {

        var cert = {i:i, j:0, value:k + 1, type:['row']};

        for (; cert.j < this._nSqrd; cert.j++) {
            if (this._possibilityCube[i][cert.j][k].length === 0) {
                addCertainCell.call(this, cert);
                break;
            }
        }

    }


    function addCertainCellByColumnCounter(j, k) {

        var cert = {i:0, j:j, value:k + 1, type:['column']};

        for (; cert.i < this._nSqrd; cert.i++) {
            if (this._possibilityCube[cert.i][j][k].length === 0) {
                addCertainCell.call(this, cert);
                break;
            }
        }

    }


    function addCertainCellByElementCounter(i, j) {

        var cert = {i:i, j:j, value:0, type:['element']};

        for (var k = 0; k < this._nSqrd; k++) {
            if (this._possibilityCube[i][j][k].length === 0) {
                cert.value = k + 1;
                addCertainCell.call(this, cert);
                break;
            }
        }

    }


    function addCertainCellBySubGridCounter(sgb, k) {

        var cert = {i:sgb.iLower, j:sgb.jLower, value:k + 1, type:['subGrid']}
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

        var certCells = this._activeNode._certainCells
            , idx
            ;

        for (var j = 0, l = certCells.length; j < l; j++) {
            if (certCells[j].i === i && certCells[j].value === k + 1) {
                idx = certCells[j].type.indexOf('row');
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

        var certCells = this._activeNode._certainCells
            , idx
            ;

        for (var i = 0, l = certCells.length; i < l; i++) {
            if (certCells[i].j === j && certCells[i].value === k + 1) {
                idx = certCells[i].type.indexOf('column');
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

        var certCells = this._activeNode._certainCells
            , idx
            ;

        for (var m = 0, l = certCells.length; m < l; m++) {
            if (certCells[m].i === i && certCells[m].j === j) {
                idx = certCells[m].type.indexOf('element');
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

        var certCells = this._activeNode._certainCells
            , idx
            ;

        for (var m = 0, l = certCells.length; m < l; m++) {
            if (certCells[m].i >= sgb.iLower && certCells[m].i <= sgb.iUpper &&
                certCells[m].j >= sgb.jLower && certCells[m].j <= sgb.jUpper &&
                certCells[m].value === k + 1) {
                idx = certCells[m].type.indexOf('subGrid');
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


    /*
     Branching functionality
     */


    function SolverNode(parent, guessedCell) {

        this._children = [];

        this._entryList = [];

        this._certainCells = [];

        this._branchesFound = 1;

        this._solutionsFound = 0;

        this._deadEndsFound = 0;

        if (typeof parent === 'undefined') {
            this._parent = null;
            this._guessedCell = null;
        } else {
            this._parent = parent;
            this._guessedCell = guessedCell;
        }

    }


    function forkSolver() {

        var currentNode = this._activeNode
            , node = this._activeNode
            , smallestFork = {branches:this._nSqrd + 1, i:null, j:null, k:null, type:null}
            , sgb
            ;

        //find for with least branches
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

        //create children with guesses
        if(smallestFork.type === row){
            for(var j = 0; j < this._nSqrd; j++){
                if(this._possibilityCube[smallestFork.i][j][smallestFork.k].length === 0){
                    this._activeNode._children.push(
                        new SolverNode(
                            currentNode,
                            {
                                i:smallestFork.i,
                                j:j,
                                value:smallestFork.k+1
                            }
                        )
                    );
                }
            }
        }
        if(smallestFork.type === column){
            for(var i = 0; i < this._nSqrd; i++){
                if(this._possibilityCube[i][smallestFork.j][smallestFork.k].length === 0){
                    this._activeNode._children.push(
                        new SolverNode(
                            currentNode,
                            {
                                i:i,
                                j:smallestFork.j,
                                value:smallestFork.k+1
                            }
                        )
                    );
                }
            }
        }
        if(smallestFork.type === element){
            for(var k = 0; k < this._nSqrd; k++){
                if(this._possibilityCube[smallestFork.i][smallestFork.j][k].length === 0){
                    this._activeNode._children.push(
                        new SolverNode(
                            currentNode,
                            {
                                i:smallestFork.i,
                                j:smallestFork.j,
                                value:k+1
                            }
                        )
                    );
                }
            }
        }
        if(smallestFork.type === subGrid){
            sgb = this._gameBoard.getSubGridBoundsContainingCell(smallestFork.i,smallestFork.j);
            for(var i = sgb.iLower; i < sgb.iUpper; i++){
                for(var j = sgb.jLower; j <= sgb.jUpper; j++)
                    if(this._possibilityCube[i][j][smallestFork.k].length === 0){
                        this._activeNode._children.push(
                            new SolverNode(
                                currentNode,
                                {
                                    i:i,
                                    j:j,
                                    value:smallestFork.k+1
                                }
                            )
                        );
                    }
            }

        }

        var node = this._activeNode._parent;
        while(node !== null){
            node._branchesFound += smallestFork.branches - 1;
            node = node._parent;
        }

        //activate first child
        this._activeNode = this._activeNode._children[0];
        this._gameBoard.enterValue(this._activeNode._guessedCell.i,this._activeNode._guessedCell.j,this._activeNode._guessedCell.value);
        this._activeNode._entryList.push(this._activeNode._guessedCell);

        return this;
    }


    function branchFailed() {

        var currentNode = this._activeNode
            , node = this._activeNode
            ;

        while (node !== null) {
            node._deadEndsFound++;
            node = node._parent;
        }

        if (this._branchesFound !== (this._solutionsFound + this._deadEndsFound)) {
            branchEnded.call(this);
        }

        return this;

    }


    function branchSolved() {

        var currentNode = this._activeNode
            , node = this._activeNode
            ;

        while (node !== null) {
            node._solutionsFound++;
            node = node._parent;
        }

        if (this._branchesFound !== (this._solutionsFound + this._deadEndsFound)) {
            branchEnded.call(this);
        }

        return this;

    }


    function branchEnded() {

        while (this._activeNode._parent !== null) {

            undoAllActiveNodeEntries.call(this);

            if (this._activeNode._parent._branchesFound < (this._activeNode._parent._solutionsFound + this._activeNode._parent._deadEndsFound)) {
                this._activeNode = this._activeNode._parent._children[(this._activeNode._parent._solutionsFound + this._activeNode._parent._deadEndsFound)];
                break;
            }

            this._activeNode = this._activeNode._parent;
        }

        return this;

    }

    function undoAllActiveNodeEntries() {

        var activeNode = this._activeNode
            ;

        this._gameBoard.batchClearValue(activeNode._entryList);

        return this;

    }

})();
