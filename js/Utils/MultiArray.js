(function(){
	
	var Utils = window.Utils = window.Utils || {};
	
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

			var length = arguments.length - 1, array = new Array(arguments[0]), dims = [length];
			
			array.dims = [length+1];
			
			for(var i = 0; i < length+1; i++){
				array.dims[i] = arguments[i];
			}
			
			for(var i = 0; i < length; i++) {
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
