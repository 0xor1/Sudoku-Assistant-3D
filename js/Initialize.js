(function () {

    function initialize() {

        var threePanel = new UIControls.ThreePanel();
        var gb3d = new Sudoku.GameBoard3D(threePanel, 3);
        threePanel.injectIntoContainer(masterViewport);
        threePanel.start();

        //Utils.FrameRateMonitor.enableLogging();
        Utils.FrameRateMonitor.start();

    }

    window.addEventListener("load", initialize, false);

})();
