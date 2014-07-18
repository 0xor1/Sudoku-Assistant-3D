/*
0xor1   http://github.com/0xor1
*/
(function () {


    Sudoku.PossibilityCube3D = function (gameBoard, assistant, gameBoard3D, threePanel) {

        var n, nSqrd, cSpace, sgSpace, cSize, gSGB, x, y, z, cell;
        n = gameBoard.getGameSize();
        nSqrd = n * n;
        cSpace = Sudoku.GameBoard3D.cellSpacing;
        sgSpace = Sudoku.GameBoard3D.subGridSpacing;
        cSize = Sudoku.GameBoard3D.cellSize;
        gSGB = gameBoard.getSubGridBoundsContainingCell.bind(gameBoard);

        this._n = gameBoard.getGameSize();
        this._nSqrd = this._n * this._n;
        this._assistant = assistant;
        this._gameBoard3D = gameBoard3D;
        this._threePanel = threePanel;

        this._isHidden = true;

        this._cells = new Utils.MultiArray(this._nSqrd, this._nSqrd, this._nSqrd);

        for (var i = 0; i < this._nSqrd; i++) {
            for (var j = 0; j < this._nSqrd; j++) {
                for (var k = 0; k < this._nSqrd; k++) {
                    cell = this._cells[i][j][k] = {
                        active:null,
                        dead:new Sudoku.DeadPossibilityCubeCell3D(i, j, k),
                        live:new Sudoku.LivePossibilityCubeCell3D(i, j, k)
                    };

                    //set appropriate cell
                    if(this._assistant.possibilityIsAlive(i,j,k)){
                        if(this._assistant.possibilityIsCertainty(i,j,k)){
                            cell.live.isCertainty();
                        }
                        cell.active = cell.live;
                    } else {
                        if(this._assistant.possibilityHasErrors(i,j,k)) {
                            cell.dead.hasErrors();
                        }
                        cell.active = cell.dead;
                    }

                    x = (j * (cSize + cSpace) + gSGB(i, j).jSubGrid * sgSpace) - 0.5 * ((nSqrd - 1) * (cSize + cSpace) + (n - 1) * sgSpace);
                    y = -(i * (cSize + cSpace) + gSGB(i, j).iSubGrid * sgSpace) + 0.5 * ((nSqrd - 1) * (cSize + cSpace) + (n - 1) * sgSpace);
                    z = (k * (cSize + cSpace)) + Sudoku.PossibilityCube3D.zOffset;

                    cell.live.position.x = cell.dead.position.x = x;
                    cell.live.position.y = cell.dead.position.y = y;
                    cell.live.position.z = cell.dead.position.z = z;

                    this._cells[i][j][k].live.addEventListener("dblClicked", dblClicked.bind(this));
                    this._cells[i][j][k].live.addEventListener('clicked', clicked.bind(this));

                }
            }
        }

        assistant.addEventListener('killed', killed.bind(this));

        assistant.addEventListener('revived', revived.bind(this));

        assistant.addEventListener('isCertainty', isCertainty.bind(this));

        assistant.addEventListener('isNotCertainty', isNotCertainty.bind(this));

        assistant.addEventListener('hasErrors', hasErrors.bind(this));

        assistant.addEventListener('hasNoErrors', hasNoErrors.bind(this));

    };


    Sudoku.PossibilityCube3D.zOffset = Sudoku.GameBoard3D.cellSize * 3.5;


    Sudoku.PossibilityCube3D.cellSpacing = 100;


    Sudoku.PossibilityCube3D.prototype.showAll = function (length) {

        length = length || 300;

        for (var i = 0; i < this._nSqrd; i++) {
            for (var j = 0; j < this._nSqrd; j++) {
                for (var k = 0; k < this._nSqrd; k++) {
                    this._threePanel.add(this._cells[i][j][k].active);
                }
            }
        }

        Utils.animate({
            obj:Sudoku.LivePossibilityCubeCell3D.defaultMaterial,
            prop:'opacity',
            target:Sudoku.LivePossibilityCubeCell3D.defaultOpacity,
            length:length
        });
        Utils.animate({
            obj:Sudoku.LivePossibilityCubeCell3D.certaintyMaterial,
            prop:'opacity',
            target:Sudoku.LivePossibilityCubeCell3D.certaintyOpacity,
            length:length
        });
        Utils.animate({
            obj:Sudoku.DeadPossibilityCubeCell3D.defaultMaterial,
            prop:'opacity',
            target:Sudoku.DeadPossibilityCubeCell3D.defaultOpacity,
            length:length
        });
        Utils.animate({
            obj:Sudoku.DeadPossibilityCubeCell3D.errorMaterial,
            prop:'opacity',
            target:Sudoku.DeadPossibilityCubeCell3D.errorOpacity,
            length:length
        });

        this._isHidden = false;

        return this;

    }


    Sudoku.PossibilityCube3D.prototype.hideAll = function (length, callback) {

        var self = this;

        length = length || 300;

        callback = callback || function(){};

        Utils.animate({
            obj:Sudoku.LivePossibilityCubeCell3D.defaultMaterial,
            prop:'opacity',
            target:0,
            length:length
        });
        Utils.animate({
            obj:Sudoku.LivePossibilityCubeCell3D.certaintyMaterial,
            prop:'opacity',
            target:0,
            length:length
        });
        Utils.animate({
            obj:Sudoku.DeadPossibilityCubeCell3D.defaultMaterial,
            prop:'opacity',
            target:0,
            length:length
        });
        Utils.animate({
            obj:Sudoku.DeadPossibilityCubeCell3D.errorMaterial,
            prop:'opacity',
            target:0,
            length:length,
            callback:function(){
                for (var i = 0; i < self._nSqrd; i++) {
                    for (var j = 0; j < self._nSqrd; j++) {
                        for (var k = 0; k < self._nSqrd; k++) {
                            self._threePanel.remove(self._cells[i][j][k].active);
                        }
                    }
                }
                self._isHidden = true;
                callback();
            }
        });

        return this;

    }


    function killed(event) {

        var cell = this._cells[event.i][event.j][event.k];

        if(!this._isHidden){
            this._threePanel.remove(cell.active);
            this._threePanel.add(cell.dead);
        }

        cell.active = cell.dead;

    }



    function revived(event) {

        var cell = this._cells[event.i][event.j][event.k];

        if(!this._isHidden){
            this._threePanel.remove(cell.active);
            this._threePanel.add(cell.live);
        }

        cell.active = cell.live;

    }


    function isCertainty(event) {

        var cell = this._cells[event.i][event.j][event.k].live.isCertainty();

    }


    function isNotCertainty(event) {

        var cell = this._cells[event.i][event.j][event.k].live.isNotCertainty();

    }


    function hasErrors(event) {

        var cell = this._cells[event.i][event.j][event.k].dead.hasErrors();

    }


    function hasNoErrors(event) {

        var cell = this._cells[event.i][event.j][event.k].dead.hasNoErrors();

    }


    function clicked(event) {

        this._gameBoard3D.select(event.i, event.j);

    }


    function dblClicked(event) {

        this._assistant.enterValue(event.i, event.j, event.k);

    }



})();
