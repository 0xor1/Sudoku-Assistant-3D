(function() {

	
	Sudoku.GameBoard = function(n) {
		
		Utils.EventTarget.call(this);

		this._n = n || 3;

		this._nSqrd = n * n;

		this._emptyCellCount = this._nSqrd * this._nSqrd;
        
        this._cells = new Utils.MultiArray(this._nSqrd, this._nSqrd);

		for(var i = 0; i < this._nSqrd; i++) {
			for(var j = 0; j < this._nSqrd; j++) {
				this._cells[i][j] = Sudoku.GameBoard.emptyCell;
			}
		}
	
    };

    
    Sudoku.GameBoard.emptyCell = 0;
    

    Sudoku.GameBoard.prototype = {


		constructor : Sudoku.GameBoard,


        getGameSize : function(){

            return this._n;

        },


        getSubGridBoundsContainingCell : function(i, j) {

            var iLower = Math.floor(i / this._n) * this._n
                , iUpper = iLower + this._n - 1
                , iSubGrid = iLower / this._n
                , jLower = Math.floor(j / this._n) * this._n
                , jUpper = jLower + this._n - 1
                , jSubGrid = jLower / this._n
                ;

            return {
                iLower : iLower,
                iUpper : iUpper,
                iSubGrid : iSubGrid,
                jLower : jLower,
                jUpper : jUpper,
                jSubGrid : jSubGrid
            };
        },

		
		enterValue : function(i, j, value) {

            if(
				this._cells[i][j] === Sudoku.GameBoard.emptyCell &&
				!entryClash.call(this, i, j, value) &&
				val <= this._nSqrd
			) {
				this._cells[i][j] = value;
                this.dispatchEvent({
                    type : "valueEntered",
                    i : i,
                    j : j,
                    value : value
                });
				decrementEmptyCellCount.call(this);
			}

		},
		
		clearValue : function(i,j){
			
			if(this._cells[i][j] !== Sudoku.GameBoard.emptyCell){
				this._cells[i][j] = Sudoku.GameBoard.emptyCell;
                this.dispatchEvent({
                    type : "valueCleared",
                    i : i,
                    j : j,
                    value : Sudoku.GameBoard.emptyCell
                });
				incrementEmptyCellCount.call(this);
			}	
			
		},

        getCellValue : function(i, j){

            return this._cells[i][j];

        }
		
	
	};


	function entryClash(i, j, value) {

		var subGridBounds = this.getSubGridBoundsContainingCell(i, j)
            , subGridClashFound = false
            , clashOccurred = false
            ;
		
		for(var k = 0; k < this._nSqrd; k++) {
			if(k>=subGridBounds.jLower && k<=subGridBounds.jUpper){
				continue;
			}
			if(this._cells[i][k] === value) {
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
		for(var k = 0; k < this._nSqrd; k++) {
			if(k>=subGridBounds.iLower && k<=subGridBounds.iUpper){
				continue;
			}
			if(this._cells[k][j] === value) {
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
				if(this._cells[k][l] === value) {
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

        if(this._emptyCellCount === 0){
            throw new Utils.Error('Can\'t decrement _emptyCellCount below zero');
            return;
        }

		this._emptyCellCount--;
	
		if(this._emptyCellCount === 0){
	
			this.dispatchEvent({
				type:"gameComplete"
			});
	
		}
	
	}


	function incrementEmptyCellCount(){

        if(this._emptyCellCount === this._nSqrd * this._nSqrd){
            throw new Utils.Error('Can\'t increment _emptyCellCount above ' + this._emptyCellCount);
            return;
        }

		this._emptyCellCount++;
	
	}

})();
