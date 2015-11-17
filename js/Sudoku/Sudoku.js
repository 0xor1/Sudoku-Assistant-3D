/*
0xor1   http://github.com/0xor1
*/

(function () {

    window.Sudoku = {};
    var loader = new THREE.TextureLoader()

    Sudoku.textures = [
        loader.load("textures/empty.png"),
        loader.load("textures/1.png"),
        loader.load("textures/2.png"),
        loader.load("textures/3.png"),
        loader.load("textures/4.png"),
        loader.load("textures/5.png"),
        loader.load("textures/6.png"),
        loader.load("textures/7.png"),
        loader.load("textures/8.png"),
        loader.load("textures/9.png"),
        /*THREE.ImageUtils.loadTexture("textures/A.png"),
        THREE.ImageUtils.loadTexture("textures/B.png"),
        THREE.ImageUtils.loadTexture("textures/C.png"),
        THREE.ImageUtils.loadTexture("textures/D.png"),
        THREE.ImageUtils.loadTexture("textures/E.png"),
        THREE.ImageUtils.loadTexture("textures/F.png"),
        THREE.ImageUtils.loadTexture("textures/G.png"),
        THREE.ImageUtils.loadTexture("textures/H.png"),
        THREE.ImageUtils.loadTexture("textures/I.png"),
        THREE.ImageUtils.loadTexture("textures/J.png"),
        THREE.ImageUtils.loadTexture("textures/K.png"),
        THREE.ImageUtils.loadTexture("textures/L.png"),
        THREE.ImageUtils.loadTexture("textures/M.png"),
        THREE.ImageUtils.loadTexture("textures/N.png"),
        THREE.ImageUtils.loadTexture("textures/O.png"),
        THREE.ImageUtils.loadTexture("textures/P.png"),
        THREE.ImageUtils.loadTexture("textures/Q.png"),
        THREE.ImageUtils.loadTexture("textures/R.png"),
        THREE.ImageUtils.loadTexture("textures/S.png"),
        THREE.ImageUtils.loadTexture("textures/T.png"),
        THREE.ImageUtils.loadTexture("textures/U.png"),
        THREE.ImageUtils.loadTexture("textures/V.png"),
        THREE.ImageUtils.loadTexture("textures/W.png"),
        THREE.ImageUtils.loadTexture("textures/X.png"),
        THREE.ImageUtils.loadTexture("textures/Y.png"),
        THREE.ImageUtils.loadTexture("textures/Z.png"),
        THREE.ImageUtils.loadTexture("textures/hash.png")*/
    ];

    Sudoku.getTextureIndexFromKeyCode = function (kc) {

        if (kc === 8 || kc === 46 || kc === 96 || kc === 48) { /*delete or backspace or 0 on numberpad or number row*/
            return 0;
            /*Empty*/
        } else if (kc >= 49 && kc <= 57) {
            return kc - 48;
            /*1-9*/
        } else if (kc >= 97 && kc <= 105) {
            return kc - 96;
            /*1-9 numberpad*/
        } else if (kc >= 65 && kc <= 90) {
            return kc - 55;
            /*A-Z*/
        } else if (kc === 222) {
            return 36;
            /*#*/
        }

    };

    Sudoku.getNewStartingConfig = function () {

        var rand = Math.floor(Math.random() * (Sudoku.startingConfigs.length));

        return Sudoku.startingConfigs[rand];

    };

})();
