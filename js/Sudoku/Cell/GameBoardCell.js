(function() {


	var gbc = Sudoku.GameBoardCell = function() {

		Sudoku.Cell.call(this, gbc.empty);

	};


	gbc.empty = 0;


	gbc.prototype = Object.create(Sudoku.Cell.prototype);

		
	gbc.prototype.enterValue = function(val) {
		
		if(val >= 1 && val % 1 === 0) {
			
			this._setValue(val);
			
		} else {
			
			throw new Utils.Error("GameBoardCell only accepts positive integers");
		
		}
		
		return this;
	
	};

	
	gbc.prototype.clearValue = function() {

		if(this._value !== gbc.empty){
			
			this._setValue(gbc.empty);
		
		}
			
		return this;

	};


})();
