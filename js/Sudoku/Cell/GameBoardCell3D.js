(function() {
	
	
	var gbc3d = Sudoku.GameBoardCell3D = function(gameBoardCell, i, j, cellSize) {

		var vertexShader = "varying vec2 vUv; void main() {vUv = uv;gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );}"
            , fragmentShader = "uniform vec3 color; uniform sampler2D texture; varying vec2 vUv; void main() { vec4 tColor = texture2D( texture, vUv ); gl_FragColor = vec4( mix( color, tColor.rgb, tColor.a ), 1.0 );}";
		
		UIControls.ClickableMesh.call(this);
		
		this.uniforms = {
			color : {
				type : "c",
				value : new THREE.Color(0xffffff)
			},
			texture : {
				type : "t",
				value : Sudoku.textures[gameBoardCell.getValue()]
			}
		},
		
		this.geometry = new THREE.PlaneGeometry(cellSize, cellSize);		
		this.geometry.computeBoundingSphere();
		this.boundRadius = this.geometry.boundingSphere.radius;

		
		this.material = new THREE.ShaderMaterial({
			uniforms : this.uniforms,
			vertexShader : vertexShader,
			fragmentShader : fragmentShader
		});

        this.texture = this.uniforms.texture.value;

        this.texture.needsUpdate = true;

        this.material.side = THREE.DoubleSide;

        this.color = this.uniforms.color.value;

		this.i = i;
		
		this.j = j;
		
		gameBoardCell.addEventListener("valueSet",cellValueChangedAnimation.bind(this));
		
	};

	
	gbc3d.prototype = Object.create(UIControls.ClickableMesh.prototype);
	
	
	function cellValueChangedAnimation(event) {
		
		var len = 500;
		
		if(event.value === Sudoku.GameBoardCell.empty){
			
			cellValueClearedAnimation.call(this);
			
		} else {
			
			cellValueEnteredAnimation.call(this);
			
		}

		this.uniforms.texture.value = Sudoku.textures[event.value];
		
	}
	
	
	function cellValueEnteredAnimation(length){
		
		var len = length || 200;
		
		Utils.animate({
			obj : this.rotation,
			prop : "y",
			targetValue : - Math.PI * 2,
			length : len*2,
			callback : function(obj, prop) {
				obj[prop] = 0;
			}.bind(this)
		});
		Utils.animate({
			obj : this.position,
			prop : "z",
			targetValue : Sudoku.GameBoard3D.cellSize,
			length : len,
			callback : function(obj, prop) {
				Utils.animate({
					obj : obj,
					prop : prop,
					targetValue : 0,
					length : len
				});
			}.bind(this)
		});

	}
	
	function cellValueClearedAnimation(length) {
		
		var len = length || 200;
		
		Utils.animate({
			obj : this.rotation,
			prop : "y",
			targetValue : Math.PI,
			length : len*2,
			callback : function(obj, prop) {
				obj[prop] = 0;
			}.bind(this)
		});
		
		Utils.animate({
			obj : this.position,
			prop : "z",
			targetValue : Sudoku.GameBoard3D.cellSize,
			length : len,
			callback : function(obj, prop) {
				Utils.animate({
					obj : obj,
					prop : prop,
					targetValue : 0,
					length : len
				});
			}.bind(this)
		});
		
	}


})();
