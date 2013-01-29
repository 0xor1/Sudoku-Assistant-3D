(function () {


    Sudoku.PossibilityCube3D = function (gameBoard, assistant, threePanel) {

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
        this._threePanel = threePanel;

        this._isHidden = false;

        this.position.z = Sudoku.PossibilityCube3D.zOffset;

        this._cells = new Utils.MultiArray(this._nSqrd, this._nSqrd, this._nSqrd);

        for (var i = 0; i < this._nSqrd; i++) {
            for (var j = 0; j < this._nSqrd; j++) {
                for (var k = 0; k < this._nSqrd; k++) {
                    cell = this._cells[i][j][k] = {
                        active:null,
                        dead:new Sudoku.DeadPossibilityCubeCell3D(i, j, k),
                        live:new Sudoku.LivePossibilityCubeCell3D(i, j, k)
                    };

                    x = (j * (cSize + cSpace) + gSGB(i, j).jSubGrid * sgSpace) - 0.5 * ((nSqrd - 1) * (cSize + cSpace) + (n - 1) * sgSpace);
                    y = -(i * (cSize + cSpace) + gSGB(i, j).iSubGrid * sgSpace) + 0.5 * ((nSqrd - 1) * (cSize + cSpace) + (n - 1) * sgSpace);
                    z = (k * (cSize + cSpace));

                    cell.live.position.x = cell.dead.position.x = x;
                    cell.live.position.y = cell.dead.position.y = y;
                    cell.live.position.z = cell.dead.position.z = z;

                    this._cells[i][j][k].live.addEventListener("dblClicked", enterValue.bind(this));

                }
            }
        }

        /*assistant.addEventListener('killed', killed.bind(this));

         assistant.addEventListener('revived', revived.bind(this));

         assistant.addEventListener('isCertainty', isCertainty.bind(this));

         assistant.addEventListener('isNotCertainty', isNotCertainty.bind(this));

         assistant.addEventListener('hasErrors', hasErrors.bind(this));

         assistant.addEventListener('hasNoErrors', hasNoErrors.bind(this));*/

        this.addAll(3000);

    };


    Sudoku.PossibilityCube3D.prototype = Object.create(THREE.Object3D.prototype);


    Sudoku.PossibilityCube3D.zOffset = Sudoku.GameBoard3D.cellSize * 3.5;


    Sudoku.PossibilityCube3D.cellSpacing = 100;


    Sudoku.PossibilityCube3D.prototype.addAll = function (length) {

        length = length || 300;

        for (var i = 0; i < this._nSqrd; i++) {
            for (var j = 0; j < this._nSqrd; j++) {
                for (var k = 0; k < this._nSqrd; k++) {

                    addCell.call(this, i, j, k, length);

                }
            }
        }

        return this;

    }


    Sudoku.PossibilityCube3D.prototype.showAll = function (length) {

        length = length || 300;

        for (var i = 0; i < this._nSqrd; i++) {
            for (var j = 0; j < this._nSqrd; j++) {
                for (var k = 0; k < this._nSqrd; k++) {

                    showCell.call(this, i, j, k, length);

                }
            }
        }

        return this;

    }


    Sudoku.PossibilityCube3D.prototype.hideAll = function (length, callback) {

        length = length || 300;

        callback = callback || function(){};

        for (var i = 0; i < this._nSqrd; i++) {
            for (var j = 0; j < this._nSqrd; j++) {
                for (var k = 0; k < this._nSqrd; k++) {

                    hideCell.call(this, i, j, k, length, callback);

                }
            }
        }

        return this;

    }


    function addCell(i, j, k, length) {

        var self = this
            , oldCell = this._cells[i][j][k].active
            , newCell
            ;

        length = length || 300

        if (this._assistant.possibilityIsAlive(i, j, k)) {
            newCell = this._cells[i][j][k].live;
        } else {
            newCell = this._cells[i][j][k].dead;
        }

        if (typeof oldCell === 'undefined' || oldCell === null) {
            this._cells[i][j][k].active = newCell;
            this.add(newCell);
            newCell.show(length);
        } else if (oldCell !== newCell) {
            //switchCellType.call(this, i, j, k, length);
        }

        return this;

    }

    function showCell(i, j, k, length) {

        this._cells[i][j][k].active.show(length);

        return this;

    }

    function hideCell(i, j, k, length, callback) {

        var self = this
            , cell
            ;

        length = length || 300;
        callback = callback || function () {
        };

        cell = this._cells[i][j][k].active;

        cell.hide(
            length,
            callback
        );

        return this;

    }


    function removeCell(i, j, k, length, callback) {

        var self = this
            , cell
            ;

        length = length || 300;
        callback = callback || function () {
        };

        cell = this._cells[i][j][k].active;

        cell.hide(
            length,
            function () {
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

        removeCell.call(
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


    function enterValue(event) {

        var self = this
            , hideLength = 1200
            , slamLength = 2000
            ;

        for (var i = 0; i < this._nSqrd; i++) {
            for (var j = 0; j < this._nSqrd; j++) {
                for (var k = 0; k < this._nSqrd; k++) {

                    if(i===event.i && j === event.j
                        && k === event.k){
                        cellSlamAnimation.call(self, self._cells[event.i][event.j][event.k].active, slamLength);
                    } else {
                        hideCell.call(this, i ,j , k, hideLength);
                    }

                }
            }
        }

        function cellSlamAnimation(cell, length){

            var self = this
                , cTarget = self._threePanel.controls.target
                , oldCTarget = new THREE.Vector3(cTarget.x, cTarget.y, cTarget.z)
                , originalZ = cell.position.z
                , top = this._cells[0][0][this._nSqrd-1].live.position.z
                , originalG = cell.material.color.g
                , originalB = cell.material.color.b
                , props = ['x','y','z']
                ;


            props.forEach(
                function(el,idx,arr){
                    Utils.animate({
                        obj:self._threePanel.controls.target,
                        prop:el,
                        targetValue:cell.position[el],
                        length:length*0.15,
                        callback:function(){
                            if(el==='z'){
                                self._threePanel.controls.target = cell.position;
                            }
                        }
                    })
                }
            );

            Utils.animate({
                obj:cell.position,
                prop:'z',
                targetValue:top,
                length:length*0.75
            });
            Utils.animate({
                obj:cell.material,
                prop:'opacity',
                targetValue:1,
                length:length*0.75
            });
            Utils.animate({
                obj:cell.material.color,
                prop:'g',
                targetValue:0.5,
                length:length*0.75
            });
            Utils.animate({
                obj:cell.material.color,
                prop:'b',
                targetValue:0.3,
                length:length*0.75
            });


            setTimeout(
                function(){
                    Utils.animate({
                        obj:cell.position,
                        prop:'z',
                        targetValue:0-self.position.z,
                        length:length*0.25,
                        callback:function(obj, prop) {

                            var oldTarget = self._threePanel.controls.target;

                            self._threePanel.controls.target = new THREE.Vector3(oldTarget.x,oldTarget.y,oldTarget.z);

                            props.forEach(
                                function(el,idx,arr){
                                    Utils.animate({
                                        obj:self._threePanel.controls.target,
                                        prop:el,
                                        targetValue:oldCTarget[el],
                                        length:length
                                    })
                                }
                            );
                            cell.position.z = originalZ;
                            cell.material.opacity = 0;
                            cell.material.color.g = 1;
                            cell.material.color.b = 1;
                            self._assistant.enterValue(cell.i,cell.j,cell.k);


                            self.showAll(1000);



                        }
                    });
                },
                length*0.75
            );

        }



    }

})();