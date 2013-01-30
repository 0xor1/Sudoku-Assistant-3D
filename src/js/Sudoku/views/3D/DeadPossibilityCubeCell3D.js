(function(){

    Sudoku.DeadPossibilityCubeCell3D = function(i, j, k){

        THREE.Mesh.call(this);

        Sudoku.PossibilityCubeCell3D.call(this, i, j, k);

        this.material.wireframe = true;

        this.material.color.g = this.material.color.b = 0;

        this.defaultOpacity = 0.1;

    };


    Sudoku.DeadPossibilityCubeCell3D.prototype = Object.create(THREE.Mesh.prototype);


    for (var i in Sudoku.PossibilityCubeCell3D.prototype) {
        if (Sudoku.PossibilityCubeCell3D.prototype.hasOwnProperty(i)) {
            if (typeof Sudoku.DeadPossibilityCubeCell3D.prototype[i] === 'undefined' && i !== 'constructor') {
                Sudoku.DeadPossibilityCubeCell3D.prototype[i] = Sudoku.PossibilityCubeCell3D.prototype[i];
            } else if (i === 'constructor') {
                continue;
            } else {
                throw new Error('Sudoku.DeadPossibilityCubeCell3D.prototype already contains property ' + i);
            }
        }
    }


    Sudoku.DeadPossibilityCubeCell3D.prototype.hasErrors = function(length){

        var self = this;

        length = length || 500;

        if(this._isHidden){
            this.material.opacity = 0.65;
            this.material.wireframe = false;
        } else {
            this.hide(
                length,
                function(){
                    self.material.opacity = 0.65;
                    self.material.wireframe = false;
                    self.show(length);
                }
            );
        }

    };


    Sudoku.DeadPossibilityCubeCell3D.prototype.hasNoErrors = function(length){

        var self = this;

        length = length || 500;

        if(this._isHidden){
            this.material.opacity = this.defaultOpacity;
            this.material.wireframe = true;
        } else {
            this.hide(
                length,
                function(){
                    self.material.opacity = this.defaultOpacity;
                    self.material.wireframe = true;
                    self.show(length);
                }
            );
        }

    };


})();