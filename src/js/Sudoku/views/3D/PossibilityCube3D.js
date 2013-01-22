(function () {


    Sudoku.PossibilityCube3D = function (gameBoard, assistant) {

        var n, nSqrd, cSpace, sgSpace, cSize, gSGB;
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

        for (var i = 0; i < nSqrd; i++) {
            for (var j = 0; j < nSqrd; j++) {
                for (var k = 0; k < this._nSqrd; k++) {
                    if (this._assistant.possibilityIsAlive(i, j, k)) {
                        this._cells[i][j][k] = {
                            live:new Sudoku.LivePossibilityCubeCell3D(i, j, k)
                        };

                        this.add(this._cells[i][j][k].live);

                        this._cells[i][j][k].live.position.x = (j * (cSize + cSpace) + gSGB(i, j).jSubGrid * sgSpace) - 0.5 * ((nSqrd - 1) * (cSize + cSpace) + (n - 1) * sgSpace);
                        this._cells[i][j][k].live.position.y = -(i * (cSize + cSpace) + gSGB(i, j).iSubGrid * sgSpace) + 0.5 * ((nSqrd - 1) * (cSize + cSpace) + (n - 1) * sgSpace);
                        this._cells[i][j][k].live.position.z = (k * (cSize + cSpace));

                        this._cells[i][j][k].live.addEventListener("selected", function () {
                        });
                        this._cells[i][j][k].live.addEventListener("deselected", function () {
                        });
                    }
                }
            }
        }

    };


    Sudoku.PossibilityCube3D.prototype = Object.create(THREE.Object3D.prototype);


    Sudoku.PossibilityCube3D.zOffset = Sudoku.GameBoard3D.cellSize * 3.5;


    Sudoku.PossibilityCube3D.cellSpacing = 100;
})();