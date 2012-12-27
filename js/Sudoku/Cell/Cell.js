(function() {

	
	Sudoku.Cell = function(val){
		
		Utils.EventTarget.call(this);
		
		this._value = val;
		
	};
	
	
	Sudoku.Cell.prototype = {
		
		
		constructor : Sudoku.Cell,
		
		
		getValue : function(){
			
			this.dispatchEvent({
				type : "valueInspected",
				value : this._value
			});
			
			return this._value;
			
		},
		
		
		_setValue : function(val){
			
			this._value = val;
			
			this.dispatchEvent({
				type : "valueSet",
				value : this._value
			});
			
			return this;
			
		}
		
		
	};
	
	
})();
