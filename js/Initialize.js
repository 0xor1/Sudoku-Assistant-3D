(function () {

    function initialize() {

        var threePanel = new UIControls.ThreePanel()
            , gb = new Sudoku.GameBoard(3)
            , gb3d = new Sudoku.GameBoard3D(gb, threePanel)
            ;

        threePanel.injectIntoContainer(masterViewport);
        threePanel.start();

        masterViewport.insertGitHubForkBanner(
            "https://s3.amazonaws.com/github/ribbons/forkme_right_orange_ff7600.png",
            "https://github.com/0xor1/Sudoku"
        )

        setTimeout(function(){gb3d.assignStartingCells();}, 10000);

        //Utils.FrameRateMonitor.enableLogging();
        Utils.FrameRateMonitor.start();

    }

    window.addEventListener("load", initialize, false);

})();
