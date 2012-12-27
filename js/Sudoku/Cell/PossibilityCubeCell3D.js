(function() {


	var pcc3d = Sudoku.PossibilityCubeCell3D = function(possibilityCube) {
		
		var size = Sudoku.GameBoard3D.cellSize - pcc3d.CellSpacing * 2;

        THREE.Mesh.call(this);

		this.geometry = new THREE.CubeGeometry( size, size, size)
        this.geometry.computeBoundingSphere();
        this.boundRadius = this.geometry.boundingSphere.radius;

		this.material = new THREE.MeshBasicMaterial({
			color : 0xffffff,
			wireframe : true,
			opacity : 0.5,
			transparent:true
		});

		this.color = this.material.color;
	
	};
	
	pcc3d.CellSpacing = 100;


    pcc3d.prototype = Object.create(THREE.Mesh.prototype);



})();
