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

        for (var i = 0; i < nSqrd; i++) {
            for (var j = 0; j < nSqrd; j++) {
                for (var k = 0; k < this._nSqrd; k++) {
                    cell = this._cells[i][j][k] = {
                        dead:new Sudoku.DeadPossibilityCubeCell3D(i, j, k),
                        live:new Sudoku.LivePossibilityCubeCell3D(i, j, k),
                        error:new Sudoku.ErrorPossibilityCubeCell3D(i, j, k)
                    };

                    x = (j * (cSize + cSpace) + gSGB(i, j).jSubGrid * sgSpace) - 0.5 * ((nSqrd - 1) * (cSize + cSpace) + (n - 1) * sgSpace);
                    y = -(i * (cSize + cSpace) + gSGB(i, j).iSubGrid * sgSpace) + 0.5 * ((nSqrd - 1) * (cSize + cSpace) + (n - 1) * sgSpace);
                    z = (k * (cSize + cSpace));

                    cell.live.position.x = cell.dead.position.x = cell.error.positionon.x = x;
                    cell.live.position.y = cell.dead.position.y = cell.error.positionon.y = y;
                    cell.live.position.z = cell.dead.position.z = cell.error.positionon.z = z;

                    this._cells[i][j][k].live.addEventListener("selected", function () {
                    });
                    this._cells[i][j][k].live.addEventListener("deselected", function () {
                    });

                    if(assistant.possibilityHasError()){
                        this.add(this._cells[i][j][k].error);
                        this._cells[i][j][k].error.show();
                    } else if(assistant.possibilityIsAlive(i, j, k)){
                        this.add(this._cells[i][j][k].live);
                        this._cells[i][j][k].live.show();
                    } else {
                        this.add(this._cells[i][j][k].dead);
                        this._cells[i][j][k].dead.show();
                    }
                }
            }
        }

    };


    Sudoku.PossibilityCube3D.prototype = Object.create(THREE.Object3D.prototype);


    Sudoku.PossibilityCube3D.zOffset = Sudoku.GameBoard3D.cellSize * 3.5;


    Sudoku.PossibilityCube3D.cellSpacing = 100;



})();