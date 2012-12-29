(function() {

	
	var gb = Sudoku.GameBoard = function(n) {
		
		Utils.EventTarget.call(this);

		n = n || 3;

		var nSqrd = n * n;

		this._emptyCellCount = nSqrd * nSqrd;
        this._cells = new Utils.MultiArray(nSqrd, nSqrd);

		for(var i = 0; i < nSqrd; i++) {
			for(var j = 0; j < nSqrd; j++) {
				this._cells[i][j] = new Sudoku.GameBoardCell();
			}
		}
	};


	gb.prototype = {


		constructor : gb,


        getGameSize : function(){

            return Math.sqrt(this._cells.dims[0]);

        },


        getSubGridBounds : function(i, j) {

            var n = this.getGameSize()
                , iLower = Math.floor(i / n) * n
                , iUpper = iLower + n - 1
                , iSubGrid = iLower / n
                , jLower = Math.floor(j / n) * n
                , jUpper = jLower + n - 1
                , jSubGrid = jLower / n
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

		
		enterValue : function(i, j, val) {

            var n = this.getGameSize()
                , nSqrd = n * n
                ;

            if(
				this._cells[i][j].getValue() === Sudoku.GameBoardCell.empty &&
				!entryClash.call(this, i, j, val) &&
				val <= nSqrd
			) {
				this._cells[i][j].enterValue(val);
				decrementEmptyCellCount.call(this);
			}

		},
		
		clearValue : function(i,j){
			
			if(this._cells[i][j].getValue() !== Sudoku.GameBoardCell.empty){
				this._cells[i][j].clearValue();
				incrementEmptyCellCount.call(this);
			}	
			
		},

        getCellValue : function(i, j){

            return this._cells[i][j].getValue();

        }
		
	
	};


	function entryClash(i, j, val) {

		var n = this.getGameSize()
            , nSqrd = n * n
            , subGridBounds = this.getSubGridBounds(i, j)
            , subGridClashFound = false
            , clashOccurred = false
            ;
		
		for(var k = 0; k < nSqrd; k++) {
			if(k>=subGridBounds.jLower && k<=subGridBounds.jUpper){
				continue;
			}
			if(this._cells[i][k].getValue() === val) {
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
		for(var k = 0; k < nSqrd; k++) {
			if(k>=subGridBounds.iLower && k<=subGridBounds.iUpper){
				continue;
			}
			if(this._cells[k][j].getValue() === val) {
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
				if(this._cells[k][l].getValue() === val) {
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
	
		this._emptyCellCount++;
	
	}

})();
