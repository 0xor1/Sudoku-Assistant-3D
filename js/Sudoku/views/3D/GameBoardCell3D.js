/*
0xor1   http://github.com/0xor1
*/

(function () {


    var gbc3d = Sudoku.GameBoardCell3D = function (i, j, value) {

        var vertexShader = "varying vec2 vUv; void main() {vUv = uv;gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );}"
            , fragmentShader = "uniform vec3 color; uniform sampler2D texture; varying vec2 vUv; void main() { vec4 tColor = texture2D( texture, vUv ); gl_FragColor = vec4( mix( color, tColor.rgb, tColor.a ), 1.0 );}";

        UIControls.ClickableMesh.call(this);

        this.uniforms = {
            color:{
                type:"c",
                value:new THREE.Color(0xffffff)
            },
            texture:{
                type:"t",
                value:Sudoku.textures[value]
            }
        };

        this.geometry = Sudoku.GameBoardCell3D.geometry;


        this.material = new THREE.ShaderMaterial({
            uniforms:this.uniforms,
            vertexShader:vertexShader,
            fragmentShader:fragmentShader
        });

        this.texture = this.uniforms.texture.value;

        this.texture.needsUpdate = true;

        this.material.side = THREE.DoubleSide;

        this.color = this.uniforms.color.value;

        this.i = i;
        this.j = j;

        //states
        this._isSelected = false;
        this._isStartingCell = false;
        this._isPrimaryClashing = false;
        this._isSecondaryClashing = false;

        this._tempStateTimer = null;

        this.addEventListener('click', this.select.bind(this));

    };


    Sudoku.GameBoardCell3D.geometry = new THREE.PlaneGeometry(Sudoku.GameBoard3D.cellSize, Sudoku.GameBoard3D.cellSize);
    Sudoku.GameBoardCell3D.geometry.computeBoundingSphere();
    Sudoku.GameBoardCell3D.geometry.boundRadius = Sudoku.GameBoardCell3D.geometry.boundingSphere.radius;


    gbc3d.prototype = Object.create(UIControls.ClickableMesh.prototype);


    gbc3d.prototype.select = function () {

        if (this._isSelected || this._isStartingCell) {
            return this;
        }

        this.dispatchEvent({
            type:"selected",
            cell:this
        });

        this._isSelected = true;

        if (!this.isClashing()) {
            statusChangedAnimation.call(this);
        }

        return this;

    };


    gbc3d.prototype.deselect = function () {

        if (!this._isSelected) {
            return this;
        }

        this.dispatchEvent({
            type:"deselected",
            cell:this
        });

        this._isSelected = false;

        if (!this.isClashing()) {
            statusChangedAnimation.call(this);
        }

        return this;

    };


    gbc3d.prototype.isSelected = function () {

        return this._isSelected;

    };


    gbc3d.prototype.valueEntered = function (value) {

        var len = 400;

        Utils.animate({
            obj:this.rotation,
            prop:"y",
            target:-Math.PI * 2,
            length:len * 2,
            callback:function (obj, prop) {
                obj[prop] = 0;
            }
        });

        Utils.animate({
            obj:this.position,
            prop:"z",
            target:Sudoku.GameBoard3D.cellSize * 2,
            length:len,
            callback:function (obj, prop) {
                Utils.animate({
                    obj:obj,
                    prop:prop,
                    target:0,
                    length:len
                });
            }
        });

        this.uniforms.texture.value = Sudoku.textures[value];

        return this;

    };


    gbc3d.prototype.valueCleared = function () {

        var len = 400;

        Utils.animate({
            obj:this.rotation,
            prop:"y",
            target:Math.PI,
            length:len * 2,
            callback:function (obj, prop) {
                obj[prop] = 0;
            }
        });

        Utils.animate({
            obj:this.position,
            prop:"z",
            target:Sudoku.GameBoard3D.cellSize * 2,
            length:len,
            callback:function (obj, prop) {
                Utils.animate({
                    obj:obj,
                    prop:prop,
                    target:0,
                    length:len
                });
            }
        });

        this.uniforms.texture.value = Sudoku.textures[0];

        return this;

    }


    gbc3d.prototype.setAsStartingCell = function () {

        if (this._isStartingCell) {
            return this;
        }

        if (this._isSelected) {
            this.deselect();
        }

        this._isStartingCell = true;

        if (!this.isClashing()) {
            statusChangedAnimation.call(this);
        }

        return this;

    };


    gbc3d.prototype.unsetAsStartingCell = function () {

        if (!this._isStartingCell) {
            return this;
        }

        this._isStartingCell = false;

        if (!this.isClashing()) {
            statusChangedAnimation.call(this);
        }

        return this;

    };


    gbc3d.prototype.isStartingCell = function () {

        return this._isStartingCell;

    };


    gbc3d.prototype.clash = function (clashType) {

        this._isPrimaryClashing = this._isSecondaryClashing = false;

        clashType = "_is" + clashType.substring(0, 1).toUpperCase() + clashType.substring(1).toLowerCase() + "Clashing";

        this[clashType] = true;

        if (this._tempStateTimer !== null) {
            clearTimeout(this._tempStateTimer);
        }

        this._tempStateTimer = setTimeout(undoClash.bind(this), primaryClashChange.length + primaryClashChange.delay);

        return statusChangedAnimation.call(this);

    };


    gbc3d.prototype.isClashing = function () {

        return this._isPrimaryClashing || this._isSecondaryClashing;

    };


    gbc3d.prototype.gameComplete = function () {

        gameCompleteAnimation.call(this);

    };


    function undoClash() {

        this._isPrimaryClashing = this._isSecondaryClashing = false;

        this._tempStateTimer = null;

        return statusChangedAnimation.call(this);

    }


    function statusChangedAnimation() {

        var statusChange;

        if (this._isPrimaryClashing) {
            statusChange = primaryClashChange;
        } else if (this._isSecondaryClashing) {
            statusChange = secondaryClashChange;
        } else if (this._isStartingCell) {
            statusChange = startingChange;
        } else if (this._isSelected) {
            statusChange = selectedChange;
        } else {
            statusChange = defaultChange;
        }

        for (var i in statusChange.color) {

            Utils.animate({
                obj:this.color,
                prop:i,
                target:statusChange.color[i],
                length:statusChange.length
            });

        }

        return this;

    }


    function gameCompleteAnimation() {

        var len = 2000
            , dipTo = 0.3
            , self = this;
            ;

        Utils.animate({
            obj:this.color,
            prop:"r",
            target:dipTo,
            length:len
        });
        Utils.animate({
            obj:this.color,
            prop:"g",
            target:1,
            length:len
        });
        Utils.animate({
            obj:this.color,
            prop:"b",
            target:dipTo,
            length:len,
            callback:function (obj, prop) {
                statusChangedAnimation.call(self);
            }
        });

    }

    function cellVibrate(length, maxDisplacement) {

        var endTime = Date.now() + length
            , restX = this.position.x
            , restY = this.position.y
            , internal = function () {

                if (endTime < Date.now()) {
                    this.position.x = restX;
                    this.position.y = restY;
                    return;
                }

                this.position.x = restX + Math.random() * maxDisplacement;
                this.position.y = restY + Math.random() * maxDisplacement;

                requestAnimationFrame(internal);

            }.bind(this)
            ;

        requestAnimationFrame(internal);

    }


    // status animation parameters
    var selectedChange = {
            length:100,
            color:{
                r:1,
                g:0.6,
                b:0.2
            }
        }
        , startingChange = {
            length:400,
            color:{
                r:0.2,
                g:0.6,
                b:1
            }
        }
        , primaryClashChange = {
            length:400,
            delay:400,
            color:{
                r:1,
                g:0,
                b:0
            }
        }
        , secondaryClashChange = {
            length:400,
            color:{
                r:1,
                g:0.5,
                b:0.5
            }
        }
        , defaultChange = {
            length:200,
            color:{
                r:1,
                g:1,
                b:1
            }
        }
        ;


})();
