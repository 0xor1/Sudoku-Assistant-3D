(function () {

    function initialize() {

        var threePanel = new UIControls.ThreePanel()
            , gameBoard = new Sudoku.GameBoard(3)
            , gameBoard3D = new Sudoku.GameBoard3D(gameBoard, threePanel)
            ;

        threePanel.injectIntoContainer(masterViewport);
        threePanel.start();

        masterViewport.insertGitHubForkBanner(
            "https://s3.amazonaws.com/github/ribbons/forkme_right_orange_ff7600.png",
            "https://github.com/0xor1/Sudoku"
        )

        //Utils.FrameRateMonitor.enableLogging();
        Utils.FrameRateMonitor.start();

    }

    window.addEventListener("load", initialize, false);

})();
