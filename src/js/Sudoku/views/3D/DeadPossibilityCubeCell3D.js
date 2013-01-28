(function(){

    Sudoku.DeadPossibilityCubeCell3D = function(i, j, k){

        THREE.Mesh.call(this);

        Sudoku.PossibilityCubeCell3D.call(this, i, j, k);

        this.material.wireframe = true;

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


})();