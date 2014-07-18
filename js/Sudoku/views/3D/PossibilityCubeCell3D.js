/*
0xor1   http://github.com/0xor1
*/
(function () {

    Sudoku.PossibilityCubeCell3D = function (i, j, k) {

        this.geometry = Sudoku.PossibilityCube3D.geometry;

        this.i = i;
        this.j = j;
        this.k = k;

        //states

        this._tempStateTimer = null;

        this.defaultOpacity = 0.65;

    };


    Sudoku.PossibilityCube3D.geometry = new THREE.CubeGeometry(
        Sudoku.GameBoard3D.cellSize - Sudoku.PossibilityCube3D.cellSpacing,
        Sudoku.GameBoard3D.cellSize - Sudoku.PossibilityCube3D.cellSpacing,
        Sudoku.GameBoard3D.cellSize - Sudoku.PossibilityCube3D.cellSpacing
    );
    Sudoku.PossibilityCube3D.geometry.computeBoundingSphere();
    Sudoku.PossibilityCube3D.geometry.boundRadius = Sudoku.PossibilityCube3D.geometry.boundingSphere.radius;


    Sudoku.PossibilityCubeCell3D.prototype.constructor = Sudoku.PossibilityCubeCell3D;


    Sudoku.PossibilityCubeCell3D.prototype.show = function (length, callback) {

        length = length || 500;

        callback = callback || function(){};

        if (this._isHidden) {

            this._isHidden = false;

            Utils.animate({
                obj:this.material,
                prop:'opacity',
                targetValue:this.defaultOpacity,
                length:length
            });
            Utils.animate({
                obj:this.rotation,
                prop:'z',
                targetValue:Math.PI*4,
                length:length,
                callback:function(obj,prop){
                    obj[prop] = 0;
                    callback();
                }
            });

        }

    }


    Sudoku.PossibilityCubeCell3D.prototype.hide = function (length, callback) {

        var self = this;

        length = length || 500;

        callback = callback || function(){};

        if (!this._isHidden) {

            Utils.animate({
                obj:this.material,
                prop:'opacity',
                targetValue:0,
                length:length
            });
            Utils.animate({
                obj:this.rotation,
                prop:'z',
                targetValue:Math.PI*4,
                length:length,
                callback:function(obj,prop){
                    obj[prop] = 0;
                    self._isHidden = true;
                    callback();
                }
            });

        }

    }


})();
