(function() {


	var Sudoku = window.Sudoku = window.Sudoku || {};
	

	var pcc3d = Sudoku.PossibilityCubeCell3D = function(possibilityCube) {
		
		var size = Sudoku.GameBoardCell3D.size - pcc3d.CellSpacing * 2;
		
		this.geometry = new THREE.CubeGeometry( size, size, size)
		
		this.material = new THREE.MeshBasicMaterial({
			color : 0xffffff,
			wireframe : true,
			opacity : 0.5,
			transparent:true
		});
		
		this.mesh = new THREE.Mesh( this.geometry, this.material);
		
		this._isCalm = true;
		
		this.color = this.material.color;
		
		this.position = this.mesh.position;
		
		this.rotation = this.mesh.rotation;
		
		this.rest = {
			position : new THREE.Vector3(),
			rotation : new THREE.Vector3(),
			color : new THREE.Color(0xffffff)
		};
	
	};
	
	pcc3d.CellSpacing = 100;

	pcc3d.prototype = {

		constructor : pcc3d,


		setRestPosition : function(x, y, z) {

			this.rest.position.x = x;
			this.rest.position.y = y;
			this.rest.position.z = z;
			return this;
			
		},
		
		
		setRestRotation : function(x, y, z) {

			this.rest.rotation.x = x;
			this.rest.rotation.y = y;
			this.rest.rotation.z = z;
			return this;

		},
		
		setRestColor : function(r, g, b){
			
			this.rest.color.r = r;
			this.rest.color.g = g;
			this.rest.color.b = b;
			return this;
			
		},
		
		
		setPosition : function(x, y, z) {

			this.mesh.position.x = x;
			this.mesh.position.y = y;
			this.mesh.position.z = z;

		},
		
		
		lookRestless : function(length) {

			var self = this,
				obj = self.mesh.rotation,
				length = length || 400,
				
				fidget = function() {

					var prop,
						delayToNext;
					
					if(self._isCalm){
						return;
					}
					
					prop = Math.floor(Math.random() * 3);
					
					delayToNext = Math.floor(Math.random() * 10000);

					switch(prop) {
						case 0:
							prop = "x";
							break;
						case 1:
							prop = "y";
							break;
						default:
							prop = "z";
					}

					S.animate({obj:obj, prop:prop, targetValue:Math.PI * 0.5, length:length, callback:function() {
						obj[prop] = 0;
						setTimeout(fidget, delayToNext);
					}});
				};
			
			self._isCalm = false;
			
			fidget();
		},
		
		
		lookCalm : function(length){
			
			var self = this,
				obj = self.mesh.position,
				length = length || 3000,
							
				relax = function() {

					var moveTo;
					
					if(!self._isCalm){
						return;
					}
					
					moveTo = self.restPosition.y - self.mesh.position.y;
					
					if(moveTo < 0){
						moveTo = self.restPosition.z - pcc3d.CellSpacing;
					} else {
						moveTo = self.restPosition.z + pcc3d.CellSpacing;
					}
					
					S.animate({obj:obj, prop:"z", targetValue:moveTo, length:length, callback:function() {
						setTimeout(relax,0);
					}});	
					
				};
			
			self._isCalm = true;
			
			relax();
			
		},
		
		comeToRest : function(length){
			
			var self = this,
				obj = self.mesh.position,
				length = length || 500;
			
			//kill lookCalm/Restless animations
			if(self.isCalm){
				self._isCalm = false;
			} else {
				self._isCalm = true;
			}
					
			S.animate({obj:obj, prop:"x", targetValue:self.rest.position.x, length:length});
			S.animate({obj:obj, prop:"y", targetValue:self.rest.position.y, length:length});
			S.animate({obj:obj, prop:"z", targetValue:self.rest.position.z, length:length});	
			
		},
		
		disappear : function(length){
			
			var length = length || 1000;
			S.animate({obj:this.material, prop:"opacity", targetValue:0, length:length});
			
		},
		
		appear : function(length){
			
			var length = length || 1000;
			S.animate({obj:this.mesh.material, prop:"opacity", targetValue:1, length:length});
			
		},
		
		phaseToWireframe : function(length){
			
			var length = length / 2 || 1000;
			setTimeout(
				function(){
					this.disappear(length);
					setTimeout(
						function(){
							this.mesh.material.wireframe = true;
							this.appear(length);
						}.bind(this),
						length
					);
				}.bind(this),
				0
			);
			
		},
		
		phaseToSolid : function(length){
			
			var length = length / 2 || 1000;
			setTimeout(
				function(){
					this.disappear(length);
					setTimeout(
						function(){
							this.mesh.material.wireframe = false;
							this.appear(length);
						}.bind(this),
						length
					);
				}.bind(this),
				0
			);
			
		},
		
		
		phaseToColor : function(r , g, b, length){
			
			var length = length || 1000;
			S.animate({obj:this.color, prop:"r", targetValue:r, length:length});
			S.animate({obj:this.color, prop:"g", targetValue:g, length:length});
			S.animate({obj:this.color, prop:"b", targetValue:b, length:length});
			
		},


	};


})();
