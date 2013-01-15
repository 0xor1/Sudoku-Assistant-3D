(function(){
	
	window.Utils = window.Utils || {};
	
	Utils.MultiArray = (function() {

		var MultiArray = function(p) {

			var myDims, i = p.array.length;
			if(p.dims.length === 0) {
				return;
			}
			while(i--) {
				myDims = p.dims.slice(0);
				myDims = myDims.splice(1, myDims.length - 1);
				p.array[i] = new Array(p.dims[0]);
				MultiArray({
					array : p.array[i],
					dims : myDims
				});
			}

		};
		
		return function() {

			var array = new Array(arguments[0]), dims = [arguments.length - 1];
			
			array.dims = [arguments.length];
			
			for(var i = 0, l = arguments.length; i < l; i++){
				array.dims[i] = arguments[i];
			}
			
			for(var i = 0, l = arguments.length - 1; i < l; i++) {
				dims[i] = arguments[i + 1];
			}

			MultiArray({
				array : array,
				dims : dims
			});

			return array;
		};
		
	})();
	
	
})();
