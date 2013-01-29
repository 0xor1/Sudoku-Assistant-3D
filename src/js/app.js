(function () {

    function app() {

        var threePanel = new UIControls.ThreePanel(document.getElementById("threeDView"))
            , gameBoard = new Sudoku.GameBoard(3)
            , assistant = new Sudoku.Assistant(gameBoard)
            , gameBoard3D = new Sudoku.GameBoard3D(gameBoard)
            , possibilityCube3D
            ;

        initialiseDomControls();

        threePanel.add(gameBoard3D);
        threePanel.resize();
        threePanel.start();
        centerCamera.call(threePanel, gameBoard);


        gameBoard.loadStartingConfiguration(Sudoku.getNewStartingConfig());


        possibilityCube3D = new Sudoku.PossibilityCube3D(gameBoard, assistant, threePanel);
        threePanel.add(possibilityCube3D);

        threePanel.controls.target.z = Sudoku.PossibilityCube3D.zOffset + 0.5 * (Sudoku.GameBoard3D.cellSize + Sudoku.GameBoard3D.cellSpacing) * gameBoard.getGameSize() * gameBoard.getGameSize();

        Utils.AnimationMaster.turnOnAnimationSmoothing();
        //Utils.FrameRateMonitor.enableLogging();
        Utils.FrameRateMonitor.start();

        function initialiseDomControls(){

            var toggleAssistantTab = document.getElementById('toggleAssistantTab')
                , newGameTab = document.getElementById('newGameTab')
                , clearBoardTab = document.getElementById('clearBoardTab')
                , saveStartingConfigTab = document.getElementById('saveStartingConfigTab')
                ;

            toggleAssistantTab.addEventListener(
                'click',
                function(){
                    if(possibilityCube3D.isHidden){
                        threePanel.add(possibilityCube3D)
                        possibilityCube3D.showAll(300);
                        possibilityCube3D.isHidden = false;
                    } else {
                        centerCamera.call(threePanel, gameBoard);
                        possibilityCube3D.hideAll(300);
                        setTimeout(function(){threePanel.remove(possibilityCube3D);possibilityCube3D.isHidden = true;},300)
                    }
                },
                false
            );
        }

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
            targetValue:2*((nSqrd - 1) * (Sudoku.GameBoard3D.cellSize + Sudoku.GameBoard3D.cellSpacing) + (n - 1) * Sudoku.GameBoard3D.subGridSpacing),
            length:len
        });

    }

    window.addEventListener("load", app, false);

})();
