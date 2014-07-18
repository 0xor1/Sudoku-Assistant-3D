(function() {
	
	window.Utils = window.Utils || {};
	
	Utils.log = function(msg){
		
		var d = new Date(), message = d.toLocaleTimeString() + "\t\t" +msg;
		console.log(message);
		
	};
	
})();
