(function() {


	Sudoku.LivePossibilityCubeCell3D = function( i, j, k) {

        UIControls.ClickableMesh.call(this);

        Sudoku.PossibilityCubeCell3D.call(this, i, j, k);

        this.addEventListener("dblClick", this.dblClick.bind(this));
	
	};


    Sudoku.LivePossibilityCubeCell3D.prototype = Object.create(UIControls.ClickableMesh.prototype);


    for (var i in Sudoku.PossibilityCubeCell3D.prototype) {
        if (Sudoku.PossibilityCubeCell3D.prototype.hasOwnProperty(i)) {
            if (typeof Sudoku.LivePossibilityCubeCell3D.prototype[i] === 'undefined' && i !== 'constructor') {
                Sudoku.LivePossibilityCubeCell3D.prototype[i] = Sudoku.PossibilityCubeCell3D.prototype[i];
            } else if (i === 'constructor') {
                continue;
            } else {
                throw new Error('Sudoku.LivePossibilityCubeCell3D.prototype already contains property ' + i);
            }
        }
    }


    Sudoku.LivePossibilityCubeCell3D.prototype.dblClick = function(){

    }

})();
