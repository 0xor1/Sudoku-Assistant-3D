(function () {


    function app() {

        var threePanel = new UIControls.ThreePanel(document.getElementById("threeDView"))
            , gameBoard = new Sudoku.GameBoard(3)
            , assistant = new Sudoku.Assistant(gameBoard)
            , gameBoard3D = new Sudoku.GameBoard3D(gameBoard)
            , possibilityCube3D = new Sudoku.PossibilityCube3D(gameBoard, assistant, threePanel)
            ;

        initialiseDomControls();
        threePanel.add(gameBoard3D);
        threePanel.resize();
        threePanel.start();
        focusCameraOnBoard();

        //Utils.AnimationMaster.turnOnAnimationSmoothing();
        //Utils.FrameRateMonitor.enableLogging();
        //Utils.FrameRateMonitor.start();


        function initialiseDomControls(){

            var toggleAssistantTab = document.getElementById('toggleAssistantTab')
                , newGameTab = document.getElementById('newGameTab')
                , clearBoardTab = document.getElementById('clearBoardTab')
                , saveStartingConfigTab = document.getElementById('saveStartingConfigTab')
                ;

            toggleAssistantTab.addEventListener(
                'click',
                function(){
                    if(possibilityCube3D._isHidden){
                        focusCameraOnCube();
                        possibilityCube3D.showAll()
                    } else {
                        focusCameraOnBoard();
                        possibilityCube3D.hideAll();
                    }
                },
                false
            );
            newGameTab.addEventListener(
                'click',
                function(){
                    gameBoard.loadStartingConfiguration(Sudoku.getNewStartingConfig())
                },
                false
            );
            clearBoardTab.addEventListener(
                'click',
                function(){
                    gameBoard.wipeClean()
                },
                false
            );
            saveStartingConfigTab.addEventListener(
                'click',
                function(){
                    gameBoard.saveStartingConfiguration();
                },
                false
            );
        }


        function focusCameraOnBoard() {

            var n = gameBoard.getGameSize()
                , nSqrd = n * n
                , len = 500
                , cam = threePanel.camera
                , tar = threePanel.controls.target
                ;

            threePanel.controls.noRotate = true;

            Utils.animate({
                obj:tar,
                prop:"x",
                targetValue:0,
                length:len
            });
            Utils.animate({
                obj:tar,
                prop:"y",
                targetValue:0,
                length:len
            });
            Utils.animate({
                obj:tar,
                prop:"z",
                targetValue:0,
                length:len
            });

            Utils.animate({
                obj:cam.rotation,
                prop:"z",
                targetValue:0,
                length:len
            });

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
                targetValue: 0.8 * ((nSqrd - 1) * (Sudoku.GameBoard3D.cellSize + Sudoku.GameBoard3D.cellSpacing) + (n - 1) * Sudoku.GameBoard3D.subGridSpacing),
                length:len
            });

        }


        function focusCameraOnCube() {

            var n = gameBoard.getGameSize()
                , nSqrd = n * n
                , len = 500
                , cam = threePanel.camera
                , tar = threePanel.controls.target
                ;

            threePanel.controls.noRotate = false;

            Utils.animate({
                obj:tar,
                prop:"x",
                targetValue:0,
                length:len
            });
            Utils.animate({
                obj:tar,
                prop:"y",
                targetValue:0,
                length:len
            });
            Utils.animate({
                obj:tar,
                prop:"z",
                targetValue:Sudoku.PossibilityCube3D.zOffset + 0.5 * (Sudoku.GameBoard3D.cellSize + Sudoku.GameBoard3D.cellSpacing) * nSqrd,
                length:len
            });

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
                targetValue: 2.3 * (Sudoku.PossibilityCube3D.zOffset + 0.5 * (Sudoku.GameBoard3D.cellSize + Sudoku.GameBoard3D.cellSpacing) * nSqrd),
                length:len
            });

        }

    }


    window.addEventListener("load", app, false);

})();
