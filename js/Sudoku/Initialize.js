(function () {

    function initialize() {

       /* var slider = document.getElementById("slider")
            , cmdlnCon = document.getElementById("commandLineContainer")
            , threeDCon = document.getElementById("threeDContainer")
            ;*/

        var threePanel = new UIControls.ThreePanel();
        var gb3d = new Sudoku.GameBoard3D(threePanel, 4);
        threePanel.injectIntoContainer(masterViewport);
        threePanel.start();

        //Utils.FrameRateMonitor.enableLogging();
        Utils.FrameRateMonitor.start();

    }

    window.addEventListener("load", initialize, false);

})();
