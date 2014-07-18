(function() {
	
	window.Utils = window.Utils || {};
	
	Utils.Error = function(msg){
		
		var d = new Date();
		this.message = d.toDateString() + msg;
		Utils.log(msg);
		
	};
	
})();
