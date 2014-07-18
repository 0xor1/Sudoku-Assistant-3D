/*
0xor1   http://github.com/0xor1
*/
(function(){

    Sudoku.DeadPossibilityCubeCell3D = function(i, j, k){

        THREE.Mesh.call(this);

        Sudoku.PossibilityCubeCell3D.call(this, i, j, k);

        this.material = Sudoku.DeadPossibilityCubeCell3D.defaultMaterial;

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


    Sudoku.DeadPossibilityCubeCell3D.defaultMaterial = new THREE.MeshBasicMaterial({
        color:0x2222ff,
        transparent:true,
        opacity:0,
        wireframe:true
    });


    Sudoku.DeadPossibilityCubeCell3D.errorMaterial = new THREE.MeshBasicMaterial({
        color:0xff2222,
        transparent:true,
        opacity:0,
        wireframe:false
    });


    Sudoku.DeadPossibilityCubeCell3D.defaultOpacity = 0.15;


    Sudoku.DeadPossibilityCubeCell3D.errorOpacity = 0.65;


    Sudoku.DeadPossibilityCubeCell3D.prototype.hasErrors = function(){

        this.material = Sudoku.DeadPossibilityCubeCell3D.errorMaterial;

    };


    Sudoku.DeadPossibilityCubeCell3D.prototype.hasNoErrors = function(length){

        this.material = Sudoku.DeadPossibilityCubeCell3D.defaultMaterial;

    };


})();
