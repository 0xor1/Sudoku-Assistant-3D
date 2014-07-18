/*
0xor1	http://github.com/0xor1
*/
(function() {


	Sudoku.LivePossibilityCubeCell3D = function( i, j, k) {

        UIControls.ClickableMesh.call(this);

        Sudoku.PossibilityCubeCell3D.call(this, i, j, k);

        this.material = Sudoku.LivePossibilityCubeCell3D.defaultMaterial;

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


    Sudoku.LivePossibilityCubeCell3D.defaultMaterial = new THREE.MeshBasicMaterial({
        color:0xffffff,
        transparent:true,
        opacity:0
    });


    Sudoku.LivePossibilityCubeCell3D.certaintyMaterial = new THREE.MeshBasicMaterial({
        color:0x22ff22,
        transparent:true,
        opacity:0
    });


    Sudoku.LivePossibilityCubeCell3D.defaultOpacity = 0.65;


    Sudoku.LivePossibilityCubeCell3D.certaintyOpacity = 0.8;


    Sudoku.LivePossibilityCubeCell3D.prototype.isCertainty = function(){

        this.material = Sudoku.LivePossibilityCubeCell3D.certaintyMaterial;

    };


    Sudoku.LivePossibilityCubeCell3D.prototype.isNotCertainty = function(){

        this.material = Sudoku.LivePossibilityCubeCell3D.defaultMaterial;

    };


    Sudoku.LivePossibilityCubeCell3D.prototype.dblClick = function(){
        this.dispatchEvent({
            type:'dblClicked',
            i:this.i,
            j:this.j,
            k:this.k
        });
    }


    Sudoku.LivePossibilityCubeCell3D.prototype.click = function(){
        this.dispatchEvent({
            type:'clicked',
            i:this.i,
            j:this.j,
            k:this.k
        });
    }

})();
