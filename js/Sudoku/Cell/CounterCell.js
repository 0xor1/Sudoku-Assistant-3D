(function() {

	
	var Sudoku = window.Sudoku = window.Sudoku || {};
	
	
	var cc = Sudoku.CounterCell = function(val) {

		Sudoku.Cell.call(this, cc.uninitialised);

	};


	cc.uninitialised = -1;


	cc.prototype  = Object.create(Sudoku.Cell.prototype);
		
		
	cc.prototype.enterValue = function(val) {

		if(val >= 0 && val % 1 === 0) {
				
			this._setValue(val);
				
		} else {
				
			throw new Utils.Error("Can't set CounterCell value to anything other than non negative integer.");
			
		}
			
		return this;

	};


})();
