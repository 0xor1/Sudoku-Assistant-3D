(function(){

    Sudoku.Solver = function(gameBoard){

        var n, nSqrd;
        n = gameBoard.getGameSize();
        nSqrd = n * n;

        Utils.EventTarget.call(this);

        this._gameBoard = gameBoard;

        this._possibilityCube = Utils.MultiArray(nSqrd, nSqrd, nSqrd);

        for(var i = 0; i < nSqrd; i++){
            for(var j = 0; j < nSqrd; j++){
                for(var k = 0; k < nSqrd; k++){
                    this._possibilityCube[i][j][k] = new Sudoku.PossibilityCubeCell();
                }
            }
        }

        this._rowCounters = Utils.MultiArray(nSqrd, nSqrd);

        for(var i = 0; i < nSqrd; i++){
            for(var j = 0; j < nSqrd; j++){
                this._rowCounters = new Sudoku.CounterCell();
            }
        }

        this._columnCounters = Utils.MultiArray(nSqrd, nSqrd);

        for(var i = 0; i < nSqrd; i++){
            for(var j = 0; j < nSqrd; j++){
                this._columnCounters = new Sudoku.CounterCell();
            }
        }

        this._elementCounters = Utils.MultiArray(nSqrd, nSqrd);

        for(var i = 0; i < nSqrd; i++){
            for(var j = 0; j < nSqrd; j++){
                this._elementCounters = new Sudoku.CounterCell();
            }
        }

        this._subGridCounters = Utils.MultiArray(n, n, nSqrd);

        for(var i = 0; i < n; i++){
            for(var j = 0; j < n; j++){
                for(var k = 0; k < nSqrd; k++){
                    this._subGridCounters[i][j][k] = new Sudoku.CounterCell();
                }
            }
        }

    }


    Sudoku.Solver.prototype = {

        constructor: Sudoku.Solver,

        getListOfCertainElements : function(){



        }

    };


    function getListOfCertainElementsByRowCounter(){

        this._rowCounters.getValue

    }

})();