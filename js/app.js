/*
0xor1   http://github.com/0xor1
*/

(function () {


    function app() {

        var threePanel = new UIControls.ThreePanel(document.getElementById("threeViewport"))
            , gameBoard = new Sudoku.GameBoard(3)
            , assistant = new Sudoku.Assistant(gameBoard)
            , gameBoard3D = new Sudoku.GameBoard3D(gameBoard)
            , possibilityCube3D = new Sudoku.PossibilityCube3D(gameBoard, assistant, gameBoard3D, threePanel)
            ;

        initialiseDomControls();

        gameBoard.loadStartingConfiguration(Sudoku.getNewStartingConfig());

        threePanel.add(gameBoard3D);
        threePanel.resize();
        threePanel.start();
        focusCameraOnBoard();


        function initialiseDomControls(){

            var toggleAssistantTab = document.getElementById('toggleAssistantTab')
                , newGameTab = document.getElementById('newGameTab')
                , resetBoardTab = document.getElementById('resetBoardTab')
                , saveStartingConfigTab = document.getElementById('saveStartingConfigTab')
                , clearBoardTab = document.getElementById('clearBoardTab')
                ;

            toggleAssistantTab.addEventListener(
                'click',
                function(){
                    if(possibilityCube3D._isHidden){
                        focusCameraOnCube();
                        possibilityCube3D.showAll();
                    } else {
                        focusCameraOnBoard();
                        possibilityCube3D.hideAll();
                    }
                },
                false
            );
            newGameTab.addEventListener(
                'click',
                getNewStartingConfig,
                false
            );
            resetBoardTab.addEventListener(
                'click',
                function(){
                    gameBoard.setToStartingConfiguration();
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
            clearBoardTab.addEventListener(
                'click',
                function(){
                    gameBoard.wipeClean()
                },
                false
            );


            function getNewStartingConfig(){
                newGameTab.removeEventListener('click',getNewStartingConfig);
                gameBoard.loadStartingConfiguration(Sudoku.getNewStartingConfig());
                setTimeout(function(){newGameTab.addEventListener('click',getNewStartingConfig,false);},1000);
            }

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
                prop:"z",
                target:0,
                length:len
            });
            Utils.animate({
                obj:cam.rotation,
                prop:"z",
                target:0,
                length:len
            });

            Utils.animate({
                obj:cam.position,
                prop:"x",
                target:0,
                length:len
            });
            Utils.animate({
                obj:cam.position,
                prop:"y",
                target:0,
                length:len
            });
            Utils.animate({
                obj:cam.position,
                prop:"z",
                target: 0.8 * ((nSqrd - 1) * (Sudoku.GameBoard3D.cellSize + Sudoku.GameBoard3D.cellSpacing) + (n - 1) * Sudoku.GameBoard3D.subGridSpacing),
                length:len,
                callback:function(){
                    threePanel.camera.up = new THREE.Vector3(0,1,0);
                }
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
                target:0,
                length:len
            });
            Utils.animate({
                obj:tar,
                prop:"y",
                target:0,
                length:len
            });
            Utils.animate({
                obj:tar,
                prop:"z",
                target: 0.5 * (((Sudoku.GameBoard3D.cellSize + Sudoku.GameBoard3D.cellSpacing) * nSqrd) + Sudoku.PossibilityCube3D.zOffset ),
                length:len
            });

            Utils.animate({
                obj:cam.position,
                prop:"x",
                target:0,
                length:len
            });
            Utils.animate({
                obj:cam.position,
                prop:"y",
                target:0,
                length:len
            });
            Utils.animate({
                obj:cam.position,
                prop:"z",
                target: 2.3 * (Sudoku.PossibilityCube3D.zOffset + 0.5 * (Sudoku.GameBoard3D.cellSize + Sudoku.GameBoard3D.cellSpacing) * nSqrd),
                length:len
            });

        }

    }


    window.addEventListener("load", app, false);

})();
