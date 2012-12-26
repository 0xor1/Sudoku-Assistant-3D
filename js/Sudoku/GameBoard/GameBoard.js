(function() {

	Sudoku = Sudoku || {};
	
	var gb = Sudoku.GameBoard = function(n) {
		
		Utils.EventTarget.call(this);

		this.n = n || 3;
		this.nSqrd = this.n * this.n;
		this.emptyCellCount = this.nSqrd * this.nSqrd;

		this.cells = new Utils.MultiArray(this.nSqrd, this.nSqrd);

        this._startingConfiguration = [];

		for(var i = 0; i < this.nSqrd; i++) {
			for(var j = 0; j < this.nSqrd; j++) {
				this.cells[i][j] = new Sudoku.GameBoardCell();
			}
		}
	};

	gb.prototype = {
		
		constructor : gb,

        saveStartingConfig : function(){
            var val;
            for(var i = 0; i < this.nSqrd; i++) {
                for(var j = 0; j < this.nSqrd; j++) {
                    if(val = this.cells[i][j].getValue() !== Sudoku.GameBoardCell.empty){
                        this._startingConfiguration.push({
                            i : i,
                            j : j,
                            value : val
                        });
                    }
                }
            }
            this.dispatchEvent({
                type : 'startingConfigurationSaved',
                configuration : this._startingConfiguration
            });
        },


        resetGame : function(){
             var config;
            for(var i = 0; i < this.nSqrd; i++) {
                for(var j = 0; j < this.nSqrd; j++) {
                    this.clearValue(i,j);
                }
            }
            for(var i = 0, l = this._startingConfiguration.length; i<l; i++){
                config = this._startingConfiguration[i];
                this.enterValue(config.i, config.j, config.value);
            }
            this.dispatchEvent({
                type : 'gameReset',
                configuration : this._startingConfiguration
            });
        },


		getSubGridBounds : function(i, j) {

			var iLower = Math.floor(i / this.n) * this.n, iUpper = iLower + this.n - 1, iSubGrid = iLower / this.n, jLower = Math.floor(j / this.n) * this.n, jUpper = jLower + this.n - 1, jSubGrid = jLower / this.n;

			return {
				iLower : iLower,
				iUpper : iUpper,
				iSubGrid : iSubGrid,
				jLower : jLower,
				jUpper : jUpper,
				jSubGrid : jSubGrid
			};
		},
		
		enterValue : function(i, j, val) {

			if(
				this.cells[i][j].getValue() === Sudoku.GameBoardCell.empty &&
				!entryClash.call(this, i, j, val) &&
				val <= this.nSqrd
			) {
				this.cells[i][j].enterValue(val);
				decrementEmptyCellCount.call(this);
			}

		},
		
		clearValue : function(i,j){
			
			if(this.cells[i][j].getValue() !== Sudoku.GameBoardCell.empty){
				this.cells[i][j].clearValue();
				incrementEmptyCellCount.call(this);
			}	
			
		}
		
	
	};


	function entryClash(i, j, val) {

		var subGridBounds = this.getSubGridBounds(i, j), subGridClashFound = false, clashOccurred = false;
		
		for(var k = 0; k < this.nSqrd; k++) {
			if(k>=subGridBounds.jLower && k<=subGridBounds.jUpper){
				continue;
			}
			if(this.cells[i][k].getValue() === val) {
				this.dispatchEvent({
					type : "clash",
					subType : "row",
					i : i,
					j : k
				});
				clashOccurred = true;
				break;
			}
		}
		for(var k = 0; k < this.nSqrd; k++) {
			if(k>=subGridBounds.iLower && k<=subGridBounds.iUpper){
				continue;
			}
			if(this.cells[k][j].getValue() === val) {
				this.dispatchEvent({
					type : "clash",
					subType : "column",
					i : k,
					j : j
				});
				clashOccurred = true;
				break;
			}
		}

		for(var k = subGridBounds.iLower; k <= subGridBounds.iUpper; k++) {
			for(var l = subGridBounds.jLower; l <= subGridBounds.jUpper; l++) {
				if(this.cells[k][l].getValue() === val) {
					this.dispatchEvent({
						type : "clash",
						subType : "subGrid",
						i : k,
						j : l
					});
					clashOccurred = true;
					subGridClashFound = true;
					break;
				}
			}
			if(subGridClashFound){break;}
		}
		return clashOccurred;
	}


	function decrementEmptyCellCount(){
	
		this.emptyCellCount--;
	
		if(this.emptyCellCount === 0){
	
			this.dispatchEvent({
				type:"gameComplete"
			});
	
		}
	
	}


	function incrementEmptyCellCount(){
	
		this.emptyCellCount++;
	
	}

})();
