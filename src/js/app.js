(function () {

    function app() {

        var threePanel = new UIControls.ThreePanel(document.getElementById("threeDView"))
            , gameBoard = new Sudoku.GameBoard(3)
            , assistant = new Sudoku.Assistant(gameBoard)
            , gameBoard3D = new Sudoku.GameBoard3D(gameBoard)
            ;

        threePanel.add(gameBoard3D);
        threePanel.resize();
        threePanel.start();
        centerCamera.call(threePanel, gameBoard);


        gameBoard.loadStartingConfiguration(Sudoku.getNewStartingConfig());

        Utils.AnimationMaster.turnOnAnimationSmoothing();

        Utils.FrameRateMonitor.start();

    }

    function centerCamera(gameBoard) {

        var n = gameBoard.getGameSize()
            , nSqrd = n * n
            , len = 500
            , cam = this.camera
            ;

        Utils.animate({
            obj:cam.position,
            prop:"x",
            targetValue:0,
            length:len
        });
        Utils.animate({
            obj:cam.position,
            prop:"y",
            targetValue:0,
            length:len
        });
        Utils.animate({
            obj:cam.position,
            prop:"z",
            targetValue:((nSqrd - 1) * (Sudoku.GameBoard3D.cellSize + Sudoku.GameBoard3D.cellSpacing) + (n - 1) * Sudoku.GameBoard3D.subGridSpacing),
            length:len
        });

    }

    window.addEventListener("load", app, false);

})();
