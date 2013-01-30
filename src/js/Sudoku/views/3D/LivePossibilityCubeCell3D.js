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


    Sudoku.LivePossibilityCubeCell3D.prototype.isCertainty = function(length){

        length = length || 500;

        if(this._isHidden){
            this.material.color.r = 0.2;
            this.material.color.g = 1;
            this.material.color.b = 0.2;
        } else {
            Utils.animate({
                obj:this.material,
                prop:'r',
                targetValue:0.2,
                length:length
            });
            Utils.animate({
                obj:this.material,
                prop:'g',
                targetValue:1,
                length:length
            });
            Utils.animate({
                obj:this.material,
                prop:'r',
                targetValue:0.2,
                length:length
            });
        }

    };


    Sudoku.LivePossibilityCubeCell3D.prototype.isNotCertainty = function(length){

        length = length || 500;

        if(this._isHidden){
            this.material.color.r = 1;
            this.material.color.g = 1;
            this.material.color.b = 1;
        } else {
            Utils.animate({
                obj:this.material,
                prop:'r',
                targetValue:1,
                length:length
            });
            Utils.animate({
                obj:this.material,
                prop:'g',
                targetValue:1,
                length:length
            });
            Utils.animate({
                obj:this.material,
                prop:'r',
                targetValue:1,
                length:length
            });
        }

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
