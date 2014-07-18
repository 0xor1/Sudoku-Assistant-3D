/*
0xor1   http://github.com/0xor1
*/
(function () {


    Sudoku.GameBoard3D = function (gameBoard) {

        var n, nSqrd, cSpace, sgSpace, cSize, gSGB;
        n = gameBoard.getGameSize();
        nSqrd = n * n;
        cSpace = Sudoku.GameBoard3D.cellSpacing;
        sgSpace = Sudoku.GameBoard3D.subGridSpacing;
        cSize = Sudoku.GameBoard3D.cellSize;
        gSGB = gameBoard.getSubGridBoundsContainingCell.bind(gameBoard);

        THREE.Object3D.call(this);

        this._gameBoard = gameBoard;

        this._cells = new Utils.MultiArray(nSqrd, nSqrd);

        this._selectedCell = null;

        for (var i = 0; i < nSqrd; i++) {
            for (var j = 0; j < nSqrd; j++) {

                this._cells[i][j] = new Sudoku.GameBoardCell3D(i, j, this._gameBoard.getValue(i, j));
                this.add(this._cells[i][j]);

                this._cells[i][j].position.x = (j * (cSize + cSpace) + gSGB(i, j).jSubGrid * sgSpace) - 0.5 * ((nSqrd - 1) * (cSize + cSpace) + (n - 1) * sgSpace);
                this._cells[i][j].position.y = -(i * (cSize + cSpace) + gSGB(i, j).iSubGrid * sgSpace) + 0.5 * ((nSqrd - 1) * (cSize + cSpace) + (n - 1) * sgSpace);
                this._cells[i][j].position.z = 0;

                this._cells[i][j].addEventListener("selected", cellSelected.bind(this));
                this._cells[i][j].addEventListener("deselected", cellDeselected.bind(this));
            }
        }

        this._cells[0][0].select();

        this._gameBoard.addEventListener('valueEntered', valueEntered.bind(this));

        this._gameBoard.addEventListener('batchValueEntered', batchValueEntered.bind(this));

        this._gameBoard.addEventListener('valueCleared', valueCleared.bind(this));

        this._gameBoard.addEventListener('batchValueCleared', batchValueCleared.bind(this));

        this._gameBoard.addEventListener('startingConfigurationSaved', startingConfigurationSaved.bind(this));

        this._gameBoard.addEventListener('startingConfigurationDiscarded', startingConfigurationDiscarded.bind(this));

        this._gameBoard.addEventListener("clash", clashRouter.bind(this));

        this._gameBoard.addEventListener("gameComplete", gameComplete.bind(this));

        this._keyPressRouter = keyPressRouter.bind(this);

        window.addEventListener("keydown", this._keyPressRouter, false);

    };


    Sudoku.GameBoard3D.cellSize = 300;


    Sudoku.GameBoard3D.cellSpacing = 20;


    Sudoku.GameBoard3D.subGridSpacing = 40;


    Sudoku.GameBoard3D.prototype = Object.create(THREE.Object3D.prototype);


    Sudoku.GameBoard3D.prototype.select = function(i, j){

        this._cells[i][j].select();

    }

    function valueEntered(event) {

        this._cells[event.i][event.j].valueEntered(event.value);

        return this;

    }


    function batchValueEntered(event) {

        event.batch.forEach(
            function (el, idx, arr) {
                valueEntered.call(this, el);
            },
            this
        );

        return this;

    }


    function valueCleared(event) {

        this._cells[event.i][event.j].valueCleared();

        return this;

    }


    function batchValueCleared(event) {

        event.batch.forEach(
            function (el, idx, arr) {
                valueCleared.call(this, el);
            },
            this
        );

        return this;

    }


    function startingConfigurationSaved(event) {

        var i
            , j
            , n = this._gameBoard.getGameSize()
            , nSqrd = n * n
            , startConf = event.startingConfiguration
            ;

        for (var i = 0, l = startConf.length; i < l; i++) {
            this._cells[startConf[i].i][startConf[i].j].setAsStartingCell();
        }

        i = j = 0;
        while (!this._cells[i][j].select().isSelected()) {
            j++;
            if (j === nSqrd) {
                j = 0;
                i++;
                if (i === nSqrd) {
                    return;
                }
            }
        }

        return this;

    }


    function startingConfigurationDiscarded(event) {

        var startConf = event.startingConfiguration;

        for (var k = 0, l = startConf.length; k < l; k++) {
            this._cells[startConf[k].i][startConf[k].j].unsetAsStartingCell();
        }

        return this;

    }


    function cellSelected(event) {

        if (this._selectedCell !== null) {

            this._selectedCell.deselect();

        }

        this._selectedCell = event.cell;

    }


    function cellDeselected(event) {

        this._selectedCell = null;

    }


    function clashRouter(event) {

        var k
            , l
            , kUpper
            , lUpper
            , n = this._gameBoard.getGameSize()
            , nSqrd = n * n
            , sgb = this._gameBoard.getSubGridBoundsContainingCell(event.i, event.j)
            ;

        if (event.subType === "row") {

            k = event.i;
            l = 0;
            kUpper = k + 1;
            lUpper = nSqrd;

        } else if (event.subType === "column") {

            k = 0;
            l = event.j;
            kUpper = nSqrd;
            lUpper = l + 1;

        } else if (event.subType === "subGrid") {

            k = sgb.iLower;
            l = sgb.jLower;
            kUpper = sgb.iUpper + 1;
            lUpper = sgb.jUpper + 1;

        }

        for (; k < kUpper; k++) {
            for (var tempL = l; tempL < lUpper; tempL++) {
                if (k === event.i && tempL === event.j) {
                    this._cells[k][tempL].clash("Primary");
                } else {
                    this._cells[k][tempL].clash("Secondary");
                }
            }
        }

    }


    function keyPressRouter(event) {

        var n = this._gameBoard.getGameSize()
            , nSqrd = n * n
            , dir
            , val
            , i
            , j
            ;

        if (this._selectedCell === null) {
            return;
        }

        if (event.keyCode >= 37 && event.keyCode <= 40) {
            if (event.keyCode === 37) {
                dir = 'left';
            }
            else if (event.keyCode === 38) {
                dir = 'up';
            }
            else if (event.keyCode === 39) {
                dir = 'right';
            }
            else if (event.keyCode === 40) {
                dir = 'down';
            }
            selectNextAvailableCellInDirection.call(this, dir);
            return;
        }

        val = Sudoku.getTextureIndexFromKeyCode(event.keyCode);
        if (val > 0) {
            this._gameBoard.enterValue(this._selectedCell.i, this._selectedCell.j, val);
        } else if (val === 0) {
            this._gameBoard.clearValue(this._selectedCell.i, this._selectedCell.j);
        }
    }


    function selectNextAvailableCellInDirection(dir) {

        var n = this._gameBoard.getGameSize()
            , nSqrd = n * n
            , idxs = {}
            , iterIdx
            , getIJ
            , firstCount = nSqrd
            , secondCount = nSqrd * nSqrd
            ;

        if (dir === "left" || dir === "right") {
            idxs.first = this._selectedCell.j;
            idxs.second = this._selectedCell.i;
            getIJ = function () {
                return {i:idxs.second, j:idxs.first};
            };
        } else {
            idxs.first = this._selectedCell.i;
            idxs.second = this._selectedCell.j;
            getIJ = function () {
                return {i:idxs.first, j:idxs.second};
            };
        }

        if (dir === "left" || dir === "up") {
            iterIdx = function (idx) {
                return (idx - 1 < 0) ? nSqrd - 1 : idx - 1;
            };
        } else {
            iterIdx = function (idx) {
                return (idx + 1 >= nSqrd) ? 0 : idx + 1;
            };
        }

        do {
            if (!--firstCount) {
                firstCount = nSqrd;
                idxs.second = iterIdx(idxs.second);
                if (!--secondCount) {
                    return;
                }
            }
            idxs.first = iterIdx(idxs.first);
        } while (!this._cells[getIJ().i][getIJ().j].select().isSelected())

    }


    function gameComplete() {

        var n = this._gameBoard.getGameSize()
            , nSqrd = n * n
            ;

        for (var i = 0; i < nSqrd; i++) {
            for (var j = 0; j < nSqrd; j++) {
                this._cells[i][j].gameComplete();
            }
        }

    }

})();
