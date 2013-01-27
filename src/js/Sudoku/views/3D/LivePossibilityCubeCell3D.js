(function() {


	Sudoku.LivePossibilityCubeCell3D = function( i, j, k) {

        var vertexShader = "varying vec2 vUv; void main() {vUv = uv;gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );}"
            , fragmentShader = "uniform vec3 color; uniform sampler2D texture; varying vec2 vUv; void main() { vec4 tColor = texture2D( texture, vUv ); gl_FragColor = vec4( mix( color, tColor.rgb, tColor.a ), 1.0 );}";

        UIControls.ClickableMesh.call(this);

        Sudoku.PossibilityCubeCell3D.call(this, i, j, k);

        this.addEventListener("mouseDown", this.select.bind(this));
	
	};


    Sudoku.LivePossibilityCubeCell3D.prototype = Object.create(UIControls.ClickableMesh.prototype);

    for(var i in Sudoku.PossibilityCubeCell3D.prototype){
        if(Sudoku.PossibilityCubeCell3D.prototype.hasOwnProperty(i) && i !== 'constructor'){
            if(typeof UIControls.ClickableMesh.prototype[i] === 'undefined'){
                Sudoku.LivePossibilityCubeCell3D.prototype[i] = Sudoku.PossibilityCubeCell3D.prototype[i];
            } else {
                throw new Error('Sudoku.LivePossibilityCubeCell3D.prototype already contains property ' + i);
            }
        }
    }


    Sudoku.LivePossibilityCubeCell3D.prototype.select = function(){

    }

})();
