(function () {

    function initialize() {

        var threePanel = new UIControls.ThreePanel()
            , gb = new Sudoku.GameBoard(3)
            , gb3d = new Sudoku.GameBoard3D(gb, threePanel)
            ;

        threePanel.injectIntoContainer(masterViewport);
        threePanel.start();

        setTimeout(function(){gb3d.assignStartingCells();}, 10000);

        //Utils.FrameRateMonitor.enableLogging();
        Utils.FrameRateMonitor.start();

    }

    window.addEventListener("load", initialize, false);

})();
