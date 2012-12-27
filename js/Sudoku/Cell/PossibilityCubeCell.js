(function() {


	var pcs = Sudoku.PossibilityCubeCell = function() {

		Sudoku.Cell.call(this, pcs.active);

	};


	pcs.inactive = 0;


	pcs.active = 1;


	pcs.prototype = Object.create(Sudoku.Cell.prototype);

		
	pcs.prototype.activate = function() {

		if(this._value === pcs.inactive){
			this._setValue(pcs.active)
		}
			
		return this;
			
	};
		
		
	pcs.prototype.deactivate = function() {

		if(this._value === pcs.active){
			this._setValue(pcs.inactive)
		}
			
		return this;
			
	};
		
		
	pcs.prototype.isActive = function(){
			
		return this._value === pcs.active;
			
	};


})();
