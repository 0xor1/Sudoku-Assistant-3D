(function(){

    Sudoku.PossibilityCubeCell3D = function(i, j, k) {

        var vertexShader = "varying vec2 vUv; void main() {vUv = uv;gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );}"
            , fragmentShader = "uniform vec3 color; uniform sampler2D texture; varying vec2 vUv; void main() { vec4 tColor = texture2D( texture, vUv ); gl_FragColor = vec4( mix( color, tColor.rgb, tColor.a ), 1.0 );}";

        THREE.Object3D.call(this);

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

        this.color = this.uniforms.color.value;

        this.scale = new THREE.Vector3(0.1, 0.1, 0.1);

        this.i = i;
        this.j = j;
        this.k = k;

        //states
        this._isHidding = false;
        this._isShowing = false;
        this._isEntering = false;
        this._isHidden = false;

        this._tempStateTimer = null;

    };


    Sudoku.PossibilityCubeCell3D.prototype = Object.create(THREE.Object3D);


    Sudoku.PossibilityCubeCell3D.prototype.constructor = Sudoku.PossibilityCubeCell3D;


    Sudoku.PossibilityCubeCell3D.prototype.show = function(length) {

        var self = this
            , props = {
                x:1,
                y:1,
                z:1
            }
            , progFn = function(start,end,progress){
                return (end - start) * 1.2 * Math.sin( Math.PI * progress * 0.314) + start;
            }
            ;

        length = length || 300;

        for(var i in props){
            Utils.animate({
                obj:self.scale,
                prop:i,
                targetValue:props[i],
                progressFunction:progFn,
                length:length
            });
        }

    }


})();