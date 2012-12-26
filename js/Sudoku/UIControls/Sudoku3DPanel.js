(function(){
	
	
	Sudoku.Sudoku3DPanel = function(){
		
		UIControls.DomUIControl.call(this);
		
		this.threePanel = new UIControls.ThreePanel();
		this.controlPanel = new Sudoku.controlPanel('left');
		
		this.dom = document.createElement('div');
		this.dom.style.position = 'absolute';
		this.dom.style.width = this.dom.style.height = '100%';
		this.dom.style.overflow = 'hidden';
		
		this.addChild(this.threePanel);
		this.addChild(this.controlPanel);
		
	};
	
	
	Sudoku.Sudoku3DPanel.prototype = Object.create(UIControls.DomUIControl.prototype);
	
	
	Sudoku.Sudoku3DPanel.prototype.
	
	
})();
