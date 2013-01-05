(function () {

    function initialize() {

        var threePanel = new UIControls.ThreePanel()
            , gameBoard = new Sudoku.GameBoard(3)
            , gameBoard3D = new Sudoku.GameBoard3D(gameBoard)
            , easyStartConf = [
                {
                    i:0,
                    j:1,
                    value:9
                },
                {
                    i:0,
                    j:2,
                    value:6
                },
                {
                    i:0,
                    j:6,
                    value:8
                },
                {
                    i:1,
                    j:0,
                    value:5
                },
                {
                    i:1,
                    j:2,
                    value:1
                },
                {
                    i:1,
                    j:3,
                    value:6
                },
                {
                    i:1,
                    j:4,
                    value:7
                },
                {
                    i:1,
                    j:6,
                    value:9
                },
                {
                    i:1,
                    j:7,
                    value:3
                },
                {
                    i:2,
                    j:3,
                    value:1
                },
                {
                    i:2,
                    j:7,
                    value:5
                },
                {
                    i:2,
                    j:8,
                    value:2
                },
                {
                    i:3,
                    j:2,
                    value:2
                },
                {
                    i:3,
                    j:5,
                    value:4
                },
                {
                    i:3,
                    j:6,
                    value:5
                },
                {
                    i:4,
                    j:0,
                    value:4
                },
                {
                    i:4,
                    j:3,
                    value:8
                },
                {
                    i:4,
                    j:4,
                    value:9
                },
                {
                    i:4,
                    j:5,
                    value:7
                },
                {
                    i:4,
                    j:8,
                    value:3
                },
                {
                    i:5,
                    j:2,
                    value:3
                },
                {
                    i:5,
                    j:3,
                    value:2
                },
                {
                    i:5,
                    j:6,
                    value:4
                },
                {
                    i:6,
                    j:0,
                    value:2
                },
                {
                    i:6,
                    j:1,
                    value:7
                },
                {
                    i:6,
                    j:5,
                    value:1
                },
                {
                    i:7,
                    j:1,
                    value:3
                },
                {
                    i:7,
                    j:2,
                    value:9
                },
                {
                    i:7,
                    j:4,
                    value:2
                },
                {
                    i:7,
                    j:5,
                    value:5
                },
                {
                    i:7,
                    j:6,
                    value:7
                },
                {
                    i:7,
                    j:8,
                    value:6
                },
                {
                    i:8,
                    j:2,
                    value:4
                },
                {
                    i:8,
                    j:6,
                    value:2
                },
                {
                    i:8,
                    j:7,
                    value:1
                }
            ]
            ;

        threePanel._dom.style.background = "#111111";
        threePanel._dom.style.backgroundImage = "-"+vendorPrefix.toLowerCase()+"-linear-gradient(top, rgb(0,0,0) 60%, rgb(34,34,34) 85%)";

        threePanel.add(gameBoard3D);
        threePanel.injectIntoContainer(masterViewport);
        threePanel.start();

        setTimeout(function(){gameBoard.loadStartingConfiguration(easyStartConf);}, 1000);

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


    //getVendorPrefix courtesy of Lea Verou. http://lea.verou.me/
    function getVendorPrefix() {
        var regex = /^(Moz|Webkit|Khtml|O|ms|Icab)(?=[A-Z])/;

        if('WebkitOpacity' in document.body.style) return 'Webkit';
        if('KhtmlOpacity' in document.body.style) return 'Khtml';

        for(var prop in document.body.style)
        {
            if(regex.test(prop))
            {
                return prop.match(regex)[0];
            }

        }

        return '';
    }

    function assignVendorPrefix(){
        window.vendorPrefix = getVendorPrefix();
    }

    window.addEventListener("load", assignVendorPrefix, false);

    window.addEventListener("load", initialize, false);

})();
