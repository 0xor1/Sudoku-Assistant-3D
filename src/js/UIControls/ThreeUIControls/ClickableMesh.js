(function(){
	
	
	UIControls.ClickableMesh = function(){
		
		THREE.Mesh.call(this);
		UIControls.UIControl.call(this);
		
	};
	
	
	UIControls.ClickableMesh.prototype = Object.create(THREE.Mesh.prototype);
	
	var UIConProto = Object.create(UIControls.UIControl.prototype);

	for(var i in UIConProto){
		if(UIConProto.hasOwnProperty(i)){
			UIControls.ClickableMesh.prototype[i] = UIConProto[i];
		}
	}
	
	
	
	UIControls.ClickableMesh.prototype.click = function(event){
		
		this.dispatchEvent({
			type : "click",
			obj : this,
            info : event
		});
		return this;
		
	};


    UIControls.ClickableMesh.prototype.dblClick = function(event){

        this.dispatchEvent({
            type : "dblClick",
            obj : this,
            info : event
        });
        return this;

    };
	
	
	UIControls.ClickableMesh.prototype.mouseDown = function(event){
		
		this.dispatchEvent({
			type : "mouseDown",
			obj : this,
            info : event
		});
		return this;
	};
	
	
	UIControls.ClickableMesh.prototype.mouseUp = function(event){
		
		this.dispatchEvent({
			type : "mouseUp",
			obj : this,
            info : event
		});
		return this;
	};


    UIControls.ClickableMesh.prototype.mouseOver = function(event){

        this.dispatchEvent({
            type : "mouseOver",
            info : event
        });
        return this;
    };


    UIControls.ClickableMesh.prototype.mouseOut = function(event){

        this.dispatchEvent({
            type : "mouseOut",
            info : event
        });
        return this;
    };


    UIControls.ClickableMesh.prototype.mouseMove = function(event){

        this.dispatchEvent({
            type : "mouseMove",
            info : event
        });
        return this;
    };

	
})();
