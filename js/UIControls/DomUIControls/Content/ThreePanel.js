(function () {


    UIControls.ThreePanel = function () {

        UIControls.DomUIControl.call(this);

        this._isRendering = false;
        this._stopping = false;
        this._clickables = [];
        this._threeObjects = [];
        this._resizeTimer = null;
        this._resize = resize.bind(this);

        this.renderer = new THREE.WebGLRenderer();
        this._dom = this.renderer.domElement;
        this.camera = new THREE.PerspectiveCamera(75, this._dom.width / this._dom.height, 1, 100000);
        this.scene = new THREE.Scene();
        this.controls = {
            update:function () {
            }
        };

        this.scene.add(this.camera);

        this.addEventListener('resize', this.canvasResize.bind(this));

        this.addUIEventListener(this._dom, "mousedown", mouseDown.bind(this), false);

    };


    UIControls.ThreePanel.prototype = Object.create(UIControls.DomUIControl.prototype);


    UIControls.ThreePanel.prototype.add = function (obj) {

        if (obj instanceof THREE.Mesh) {

            if (this._threeObjects.indexOf(obj) === -1) {
                this._threeObjects.push(obj);
                this.scene.add(obj)
            }

        } else {

            throw new Utils.Error("ThreePanel.add only accepts THREE.Mesh objects or derivatives thereof.");

        }
        return this;

    };


    UIControls.ThreePanel.prototype.addClickable = function (obj) {

        if (obj instanceof UIControls.ClickableMesh) {

            if (this._threeObjects.indexOf(obj) === -1) {
                this._threeObjects.push(obj);
                obj.clickableIndex = this._clickables.length;
                this._clickables.push(obj);
                this.scene.add(obj)
            }

        } else {

            throw new Utils.Error("ThreePanel.addClickable only accepts UIControls.ClickableMesh objects.");

        }

        return this;

    };


    UIControls.ThreePanel.prototype.remove = function (obj) {

        var idx = this._threeObjects.indexOf(obj), clickIdx;

        if (idx === -1) {
            return this;
        }
        clickIdx = this._threeObjects[idx].clickableIndex;
        this._threeObjects.splice(idx, 1);
        if (typeof clickIdx === "undefined") {
            return this;
        }
        this._clickables.splice(clickIdx, 1);
        for (var i = idx, l = this._threeObjects.length; i < l; i++) {
            if (typeof this._threeObjects[i].clickableIndex !== "undefined") {
                this._threeObjects[i].clickableIndex--;
            }
        }
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


    UIControls.ThreePanel.prototype.canvasResize = function () {

        if (this._resizeTimer !== null) {
            clearTimeout(this._resizeTimer);
        }

        this._resizeTimer = setTimeout(

            this._resize

            , 200

        );


    };

    function resize() {

        this.renderer.setSize(this._rect.width, this._rect.height);
        this.camera.aspect = this._rect.width / this._rect.height;
        this.camera.updateProjectionMatrix();

    }

    function mouseDown(event) {

        var projector = new THREE.Projector(), rect = this._dom.getBoundingClientRect(), vector = new THREE.Vector3(((event.clientX - rect.left) / rect.width ) * 2 - 1, -((event.clientY - rect.top) / rect.height ) * 2 + 1, 0.5);
        projector.unprojectVector(vector, this.camera);

        var ray = new THREE.Ray(this.camera.position, vector.subSelf(this.camera.position).normalize());

        var intersects = ray.intersectObjects(this._clickables);

        if (intersects.length > 0) {
            intersects[0].object.mouseDown(event);
        }
    };

})();
