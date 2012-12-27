(function () {

    function initialize() {

        var threePanel = new UIControls.ThreePanel()
            , gb = new Sudoku.GameBoard(3)
            , gb3d = new Sudoku.GameBoard3D(gb, threePanel)
            ;

        threePanel.injectIntoContainer(masterViewport);
        threePanel.start();

        //Utils.FrameRateMonitor.enableLogging();
        Utils.FrameRateMonitor.start();

    }

    window.addEventListener("load", initialize, false);

})();
