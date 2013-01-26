(function(){

    Sudoku.PossibilityCubeCell3D = function(i, j, k) {

        var vertexShader = "varying vec2 vUv; void main() {vUv = uv;gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );}"
            , fragmentShader = "uniform vec3 color; uniform sampler2D texture; varying vec2 vUv; void main() { vec4 tColor = texture2D( texture, vUv ); gl_FragColor = vec4( mix( color, tColor.rgb, tColor.a ), 1.0 );}";

        this.uniforms = {
            color:{
                type:"c",
                value:new THREE.Color(0xffffff)
            },
            texture:{
                type:"t",
                value:Sudoku.textures[k+1]
            }
        };

        this.geometry = new THREE.CubeGeometry(
            Sudoku.GameBoard3D.cellSize - Sudoku.PossibilityCube3D.cellSpacing,
            Sudoku.GameBoard3D.cellSize - Sudoku.PossibilityCube3D.cellSpacing,
            Sudoku.GameBoard3D.cellSize - Sudoku.PossibilityCube3D.cellSpacing
        );

        this.geometry.computeBoundingSphere();
        this.boundRadius = this.geometry.boundingSphere.radius;

        this.material = new THREE.ShaderMaterial({
            uniforms:this.uniforms,
            vertexShader:vertexShader,
            fragmentShader:fragmentShader,
            opacity : 0.5,
            transparent:true
        });

        this.texture = this.uniforms.texture.value;

        this.texture.needsUpdate = true;

        //this.material.side = THREE.DoubleSide;

        this.color = this.uniforms.color.value;

        this.i = i;
        this.j = j;
        this.k = k;

        //states
        this._isHidding = false;
        this._isShowing = false;
        this._isEntering = false;
        this._isHidden = false;

        this._tempStateTimer = null;};


})();