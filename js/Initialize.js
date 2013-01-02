(function () {

    function initialize() {

        var threePanel = new UIControls.ThreePanel()
            , gameBoard = new Sudoku.GameBoard(3)
            , gameBoard3D = new Sudoku.GameBoard3D(gameBoard)
            ;

        threePanel._dom.style.background = "#111111";
        threePanel._dom.style.backgroundImage = "-webkit-gradient(linear, 0% 60%, 0% 80%, from(#111111), to(#444444), color-stop(0.3,#222222))";
        threePanel.add(gameBoard3D);
        gameBoard3D.enableClickableComponents(threePanel);
        threePanel.injectIntoContainer(masterViewport);
        threePanel.start();

        centerCamera.call(threePanel, gameBoard);

        masterViewport.insertGitHubForkBanner(
            "https://s3.amazonaws.com/github/ribbons/forkme_right_orange_ff7600.png",
            "https://github.com/0xor1/Sudoku"
        )

        //Utils.FrameRateMonitor.enableLogging();
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

    window.addEventListener("load", initialize, false);

})();
