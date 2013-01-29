(function () {

    Sudoku.PossibilityCubeCell3D = function (i, j, k) {

        THREE.Object3D.call(this);

        this.geometry = new THREE.CubeGeometry(
            Sudoku.GameBoard3D.cellSize - Sudoku.PossibilityCube3D.cellSpacing,
            Sudoku.GameBoard3D.cellSize - Sudoku.PossibilityCube3D.cellSpacing,
            Sudoku.GameBoard3D.cellSize - Sudoku.PossibilityCube3D.cellSpacing
        );

        this.geometry.computeBoundingSphere();
        this.boundRadius = this.geometry.boundingSphere.radius;

        this.material = new THREE.MeshBasicMaterial({
            color:0xffffff
        });

        this.color = this.material.color;

        this.material.opacity = 0;

        this.material.transparent = true;

        this.i = i;
        this.j = j;
        this.k = k;

        //states
        this._isHidden = true;
        this._isEntering = false;

        this._tempStateTimer = null;

        this.defaultOpacity = 0.65;

    };


    Sudoku.PossibilityCubeCell3D.prototype = Object.create(THREE.Object3D);


    Sudoku.PossibilityCubeCell3D.prototype.constructor = Sudoku.PossibilityCubeCell3D;


    Sudoku.PossibilityCubeCell3D.prototype.show = function (length) {

        length = length || 300;

        if (this._isHidden) {

            this._isHidden = false;

            Utils.animate({
                obj:this.material,
                prop:'opacity',
                targetValue:this.defaultOpacity,
                length:length
            });

        }

    }


    Sudoku.PossibilityCubeCell3D.prototype.hide = function (length, callback) {

        var self = this;

        length = length || 300;

        if (!this._isHidden) {

            this._isHidden = true;

            Utils.animate({
                obj:this.material,
                prop:'opacity',
                targetValue:0,
                length:length,
                callback:function(obj,prop){
                    callback();
                    self._isHidden = true;
                }
            });

        }

    }




})();