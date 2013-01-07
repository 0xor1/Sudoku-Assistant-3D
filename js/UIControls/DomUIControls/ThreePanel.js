(function () {


    UIControls.ThreePanel = function (dom) {

        UIControls.UIControl.call(this);

        this._isRendering = false;
        this._stopping = false;
        this._clickables = [];
        this._resizeTimer = null;
        this.resize = resize.bind(this);

        this.renderer = new THREE.WebGLRenderer({canvas:dom});
        this.dom = this.renderer.domElement;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, this.dom.width / this.dom.height, 1, 100000);
        this.controls = new THREE.TrackballControls(this.camera, this.dom);

        this.scene.add(this.camera);

        this.addEventListener('resize', canvasResized.bind(this));

        this.addUIEventListener(this.dom, "mousedown", mouseDown.bind(this), false);

        this.addUIEventListener(window, 'resize', canvasResized.bind(this), false);

    };


    UIControls.ThreePanel.prototype = Object.create(UIControls.UIControl.prototype);


    UIControls.ThreePanel.prototype.add = function (obj) {

        this.scene.add(obj);

        addClickable.call(this, obj);

        return this;

    };


    UIControls.ThreePanel.prototype.remove = function (obj) {

        this.scene.remove(obj);

        removeClickable.call(this, obj);

        return this;

    };


    UIControls.ThreePanel.prototype.start = function () {

        var renderer = this.renderer,
            scene = this.scene,
            camera = this.camera,
            controls = this.controls,

            stopping = function () {
                return this._stopping
            }.bind(this),

            stop = function () {
                this._isRendering = false;
                this._stopping = false;
            }.bind(this);


        if (!this._isRendering) {

            this._stopping = false;

            render();

        }

        function render() {
            if (stopping()) {
                stop();
                return;
            }
            renderer.render(scene, camera);
            controls.update();
            requestAnimationFrame(render);
        }

    };


    UIControls.ThreePanel.prototype.stop = function () {

        this._stopping = true

    };


    function canvasResized() {

        if (this._resizeTimer !== null) {
            clearTimeout(this._resizeTimer);
        }

        this._resizeTimer = setTimeout(

            this._resize

            , 200

        );


    };

    function resize() {
        var rect = this.dom.getBoundingClientRect();
        this.renderer.setSize(rect.width, rect.height);
        this.camera.aspect = rect.width / rect.height;
        this.camera.updateProjectionMatrix();

    }

    function mouseDown(event) {

        var projector = new THREE.Projector(), rect = this.dom.getBoundingClientRect(), vector = new THREE.Vector3(((event.clientX - rect.left) / rect.width ) * 2 - 1, -((event.clientY - rect.top) / rect.height ) * 2 + 1, 0.5);
        projector.unprojectVector(vector, this.camera);

        var ray = new THREE.Ray(this.camera.position, vector.subSelf(this.camera.position).normalize());

        var intersects = ray.intersectObjects(this._clickables);

        if (intersects.length > 0) {
            intersects[0].object.mouseDown(event);
        }
    };

    function addClickable(obj) {

        if (obj instanceof UIControls.ClickableMesh) {

            if (this._clickables.indexOf(obj) === -1) {
                this._clickables.push(obj);
            }

        }

        for(var i = 0, l = obj.children.length; i < l; i++){
            addClickable.call(this,obj.children[i]);
        }

        return this;

    }


    function removeClickable(obj) {

        var idx = this._clickables.indexOf(obj);

        if (idx !== -1) {
            this._clickables.splice(idx, 1);
        }

        for(var i = 0, l = obj.children.length; i < l; i++){
            removeClickable.call(this,obj.children[i]);
        }

        return this;

    }


})();