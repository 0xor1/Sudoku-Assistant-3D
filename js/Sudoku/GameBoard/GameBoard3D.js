(function () {


    var gb3d = Sudoku.GameBoard3D = function (gameBoard, threePanel) {

        var n, nSqrd, cSpace, sgSpace, cSize, gSGB;
        n = gameBoard.getGameSize();
        nSqrd = n * n;
        cSpace = gb3d.cellSpacing;
        sgSpace = gb3d.subGridSpacing;
        cSize = gb3d.cellSize;
        gSGB = gameBoard.getSubGridBounds.bind(gameBoard);

        UIControls.UIControl.call(this);

        this.followCursor = false;

        this._gameBoard = gameBoard;
        this._threePanel = threePanel;
        this._cells = new Utils.MultiArray(nSqrd, nSqrd);

        threePanel._dom.style.background = "#111111";
        threePanel._dom.style.backgroundImage = "-webkit-gradient(linear, 0% 60%, 0% 80%, from(#111111), to(#444444), color-stop(0.3,#222222))";

        for (var i = 0; i < nSqrd; i++) {
            for (var j = 0; j < nSqrd; j++) {

                this._cells[i][j] = new Sudoku.GameBoardCell3D(gameBoard._cells[i][j], gb3d.cellSize);

                this._cells[i][j].position.x = (j * (cSize + cSpace) + gSGB(i, j).jSubGrid * sgSpace) - 0.5 * ((nSqrd - 1) * (cSize + cSpace) + (n - 1) * sgSpace);
                this._cells[i][j].position.y = -(i * (cSize + cSpace) + gSGB(i, j).iSubGrid * sgSpace) + 0.5 * ((nSqrd - 1) * (cSize + cSpace) + (n - 1) * sgSpace);
                this._cells[i][j].position.z = 0

                threePanel.addClickable(this._cells[i][j]);

                this._cells[i][j].addEventListener("mouseDown", cellSelected.bind(this), false);
            }
        }

        this._selectedCell = this._cells[0][0].select();

        gameBoard.addEventListener("clash", clashAnimation.bind(this));

        gameBoard.addEventListener("gameComplete", gameCompleteAnimation.bind(this));

        this.addUIEventListener(window, "keydown", keyPress.bind(this), false);

        centerCamera.call(this);

    };


    gb3d.cellSize = 300;


    gb3d.cellSpacing = 20;


    gb3d.subGridSpacing = 40;


    gb3d.prototype = Object.create(UIControls.UIControl.prototype);


    var cap, clashAnimProps = {

        outLength:800,
        waitLength:800,
        returnLength:400,
        colorDipTo:0.55

    };

    cap = clashAnimProps;


    function clashAnimation(event) {

        if (event.subType === "row") {

            rowClashAnimation.call(this, event);

        } else if (event.subType === "column") {

            columnClashAnimation.call(this, event);

        } else if (event.subType === "subGrid") {

            subGridClashAnimation.call(this, event);

        }

    }

    function rowClashAnimation(event) {

        var i = event.i;
        for (var j = 0; j < this._nSqrd; j++) {

            if (j === event.j) {

                primaryClashAnimation(this._cells[i][j], 'color');

            } else {

                secondaryClashAnimation.call(this, this._cells[i][j], 'color');

            }
        }

    }


    function columnClashAnimation(event) {

        var j = event.j;
        for (var i = 0; i < this._nSqrd; i++) {

            if (i === event.i) {

                primaryClashAnimation(this._cells[i][j], 'color');

            } else {

                secondaryClashAnimation.call(this, this._cells[i][j], 'color');

            }
        }

    }


    function subGridClashAnimation(event) {

        var i = event.i, j = event.j, sgb = this._gameBoard.getSubGridBounds(i, j);

        for (var k = sgb.iLower; k <= sgb.iUpper; k++) {
            for (var l = sgb.jLower; l <= sgb.jUpper; l++) {

                if (k === i && l === j) {

                    primaryClashAnimation(this._cells[k][l], 'color');

                } else {

                    secondaryClashAnimation.call(this, this._cells[k][l], 'color');

                }
            }
        }
    }


    function primaryClashAnimation(cell, obj) {
        var prop = ["g", "b"], objStr = obj;

        for (var i = 0; i < prop.length; i++) {
            Utils.animate({
                obj:cell[objStr],
                prop:prop[i],
                targetValue:0,
                length:cap.outLength,
                callback:function (obj, prop) {
                    Utils.animate({
                        obj:obj,
                        prop:prop,
                        targetValue:0,
                        length:cap.waitLength,
                        callback:function (obj, prop) {
                            Utils.animate({
                                obj:obj,
                                prop:prop,
                                targetValue:1,
                                length:cap.returnLength
                            });
                        }
                    });
                }
            });
        }
    }

    function secondaryClashAnimation(cell, obj) {
        var prop = ["g", "b"], objStr = obj;
        for (var i = 0; i < prop.length; i++) {
            if (cell === this._selectedCell) {
                continue;
            }
            Utils.animate({
                obj:cell[objStr],
                prop:prop[i],
                targetValue:0.5,
                length:cap.outLength,
                callback:function (obj, prop) {
                    Utils.animate({
                        obj:obj,
                        prop:prop,
                        targetValue:0.5,
                        length:cap.waitLength,
                        callback:function (obj, prop) {
                            Utils.animate({
                                obj:obj,
                                prop:prop,
                                targetValue:1,
                                length:cap.returnLength
                            });
                        }
                    });
                }
            });
        }
    }


    function cellSelected(event) {

        var sc = this._selectedCell, len = 200;

        if (sc !== null) {
            deselectCell.call(this);
        }

        sc = this._selectedCell = event.obj;

        if (this.followCursor === false) {
            centerCamera.call(this);
        } else {
            Utils.animate({
                obj:this._threePanel.camera.position,
                prop:'x',
                length:len,
                targetValue:sc.position.x
            });
            Utils.animate({
                obj:this._threePanel.camera.position,
                prop:'y',
                length:len,
                targetValue:sc.position.y
            });

        }

        Utils.animate({
            obj:sc.color,
            prop:"r",
            targetValue:1,
            length:len
        });
        Utils.animate({
            obj:sc.color,
            prop:"g",
            targetValue:0.7,
            length:len
        });
        Utils.animate({
            obj:sc.color,
            prop:"b",
            targetValue:0.4,
            length:len
        });

    }


    function keyPress(event) {

        var val
            , i
            , j
            ;

        /*left arrow*/
        if (event.keyCode === 37) {
            i = this._selectedCell.i;
            j = this._selectedCell.j;
            j = (j - 1 < 0) ? this._nSqrd - 1 : j - 1;
            cellSelected.call(this, {obj:this._cells[i][j]});
            return;
        }

        /*up arrow*/
        if (event.keyCode === 38) {
            i = this._selectedCell.i;
            j = this._selectedCell.j;
            i = (i - 1 < 0) ? this._nSqrd - 1 : i - 1;
            cellSelected.call(this, {obj:this._cells[i][j]});
            return;
        }

        /*right arrow*/
        if (event.keyCode === 39) {
            i = this._selectedCell.i;
            j = this._selectedCell.j;
            j = (j + 1 >= this._nSqrd) ? 0 : j + 1;
            cellSelected.call(this, {obj:this._cells[i][j]});
            return;
        }

        /*down arrow*/
        if (event.keyCode === 40) {
            i = this._selectedCell.i;
            j = this._selectedCell.j;
            i = (i + 1 >= this._nSqrd) ? 0 : i + 1;
            cellSelected.call(this, {obj:this._cells[i][j]});
            return;
        }

        val = Sudoku.getTextureIndexFromKeyCode(event.keyCode);
        if (val > 0) {
            this._gameBoard.enterValue(this._selectedCell.i, this._selectedCell.j, val);
        } else if (val === 0) {
            this._gameBoard.clearValue(this._selectedCell.i, this._selectedCell.j);
        }
    }

    function centerCamera() {

        var len = 500
            , cam = this._threePanel.camera
            ;

        Utils.animate({
            obj:cam.position,
            prop:"x",
            targetValue:0,
            length:len
        });
        Utils.animate({
            obj:cam.position,
            prop:"y",
            targetValue:0,
            length:len
        });
        Utils.animate({
            obj:cam.position,
            prop:"z",
            targetValue:((this._nSqrd - 1) * (gb3d.cellSize + gb3d.cellSpacing) + (this._n - 1) * gb3d.subGridSpacing),
            length:len
        });

    }

    function deselectCell() {

        var sc = this._selectedCell
            , len = 200
            ;

        if (typeof sc === "object") {
            Utils.animate({
                obj:sc.color,
                prop:"r",
                targetValue:1,
                length:len
            });
            Utils.animate({
                obj:sc.color,
                prop:"g",
                targetValue:1,
                length:len
            });
            Utils.animate({
                obj:sc.color,
                prop:"b",
                targetValue:1,
                length:len
            });

            this._selectedCell = null;
        }

    }

    function gameCompleteAnimation() {

        var n = this._gameBoard.getGameSize()
            , nSqrd = n * n
            , c
            , len = 600
            ;

        for (var i = 0; i < nSqrd; i++) {
            for (var j = 0; j < nSqrd; j++) {
                c = this._cells[i][j];
                Utils.animate({
                    obj:c.rotation,
                    prop:"y",
                    targetValue:Math.PI * 2 * 2,
                    length:len * 2,
                    callback:function (obj, prop) {
                        obj[prop] = 0;
                    }
                });
                Utils.animate({
                    obj:c.color,
                    prop:"r",
                    targetValue:0.4,
                    length:len * 2,
                    callback:function (obj, prop) {
                        Utils.animate({
                            obj:obj,
                            prop:prop,
                            targetValue:1,
                            length:len * 2
                        });
                    }
                });
                Utils.animate({
                    obj:c.color,
                    prop:"b",
                    targetValue:0.4,
                    length:len * 2,
                    callback:function (obj, prop) {
                        Utils.animate({
                            obj:obj,
                            prop:prop,
                            targetValue:1,
                            length:len * 2
                        });
                    }
                });
            }
        }

    }

})();
