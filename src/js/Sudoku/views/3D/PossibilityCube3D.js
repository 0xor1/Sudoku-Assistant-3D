(function () {


    Sudoku.PossibilityCube3D = function (gameBoard, assistant) {

        var n, nSqrd, cSpace, sgSpace, cSize, gSGB, x, y, z, cell;
        n = gameBoard.getGameSize();
        nSqrd = n * n;
        cSpace = Sudoku.GameBoard3D.cellSpacing;
        sgSpace = Sudoku.GameBoard3D.subGridSpacing;
        cSize = Sudoku.GameBoard3D.cellSize;
        gSGB = gameBoard.getSubGridBoundsContainingCell.bind(gameBoard);

        THREE.Object3D.call(this);

        this._n = gameBoard.getGameSize();
        this._nSqrd = this._n * this._n;
        this._assistant = assistant;

        this.position.z = Sudoku.PossibilityCube3D.zOffset;

        this._cells = new Utils.MultiArray(this._nSqrd, this._nSqrd, this._nSqrd);

        for (var i = 0; i < this._nSqrd; i++) {
            for (var j = 0; j < this._nSqrd; j++) {
                for (var k = 0; k < this._nSqrd; k++) {
                    cell = this._cells[i][j][k] = {
                        active:null,
                        //dead:new Sudoku.DeadPossibilityCubeCell3D(i, j, k),
                        live:new Sudoku.LivePossibilityCubeCell3D(i, j, k),
                        //error:new Sudoku.ErrorPossibilityCubeCell3D(i, j, k)
                    };

                    x = (j * (cSize + cSpace) + gSGB(i, j).jSubGrid * sgSpace) - 0.5 * ((nSqrd - 1) * (cSize + cSpace) + (n - 1) * sgSpace);
                    y = -(i * (cSize + cSpace) + gSGB(i, j).iSubGrid * sgSpace) + 0.5 * ((nSqrd - 1) * (cSize + cSpace) + (n - 1) * sgSpace);
                    z = (k * (cSize + cSpace));

                    cell.live.position.x = /*cell.dead.position.x = cell.error.positionon.x =*/ x;
                    cell.live.position.y = /*cell.dead.position.y = cell.error.positionon.y =*/ y;
                    cell.live.position.z = /*cell.dead.position.z = cell.error.positionon.z =*/ z;

                    this._cells[i][j][k].live.addEventListener("selected", function () {
                    });
                    this._cells[i][j][k].live.addEventListener("deselected", function () {
                    });

                }
            }
        }

        this.showAll();

    };


    Sudoku.PossibilityCube3D.prototype = Object.create(THREE.Object3D.prototype);


    Sudoku.PossibilityCube3D.zOffset = Sudoku.GameBoard3D.cellSize * 3.5;


    Sudoku.PossibilityCube3D.cellSpacing = 100;


    Sudoku.PossibilityCube3D.prototype.showAll = function (length) {

        var len = length || 300;

        for (var i = 0; i < this._nSqrd; i++) {
            for (var j = 0; j < this._nSqrd; j++) {
                for (var k = 0; k < this._nSqrd; k++) {

                    showCell.call(this, i, j, k, len);

                }
            }
        }

        return this;

    }


    Sudoku.PossibilityCube3D.prototype.hideAll = function (length) {

        var len = length || 300;

        for (var i = 0; i < this._nSqrd; i++) {
            for (var j = 0; j < this._nSqrd; j++) {
                for (var k = 0; k < this._nSqrd; k++) {

                    hideCell.call(this, i, j, k, len);

                }
            }
        }

        return this;

    }


    function showCell(i, j, k, length) {

        var self = this
            , len = length || 300
            , oldCell = this._cells[i][j][k].active
            , newCell
            ;

        if (this._assistant.possibilityHasError(i, j, k)) {
            newCell = this._cells[i][j][k].error;
        } else if (this._assistant.possibilityIsAlive(i, j, k)) {
            newCell = this._cells[i][j][k].live;
        } else {
            newCell = this._cells[i][j][k].dead;
        }

        if (typeof oldCell === 'undefined' || oldCell === null) {
            this._cells[i][j][k].active = newCell;
            this.add(newCell);
            //cell.show();
        } else if(oldCell !== newCell) {
            switchCellType.call(this, i, j, k, length);
        }

        return this;

    }

    function hideCell(i, j, k, length, callback) {

        var self = this
            , cell
            ;

        length = length || 300;
        callback = callback || function () {};

        cell = this._cells[i][j][k].active;

        cell.hide(
            length,
            function(){
                self.remove(cell);
                self._cells[i][j][k].active = null;
                callback();
            }
        );

        return this;

    }


    function switchCellType(i, j, k, length) {

        var self = this
            ;

        length = length / 2 || 300;

        hideCell.call(
            this,
            i,
            j,
            k,
            length,
            function () {
                showCell.call(self, i, j, k, length);
            }
        );

        return this;

    }


})();