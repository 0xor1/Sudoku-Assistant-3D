(function () {

    UIControls.ThreePanel = function (container) {

        UIControls.UIControl.call(this);

        this._isRendering = false;
        this._stopping = false;
        this._clickables = [];
        this._resizeTimer = null;
        this.resize = resize.bind(this);

        this.renderer = new THREE.WebGLRenderer();
        this.container = container;
        this.canvas = this.renderer.domElement;
        this.container.appendChild(this.canvas);
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, this.container.width / this.container.height, 1, 100000);
        this.controls = new THREE.TrackballControls(this.camera, this.canvas);

        this.scene.add(this.camera);

        this.addEventListener('resize', canvasResized.bind(this));

        this.addUIEventListener(this.canvas, 'mousedown', mouseDown.bind(this), false);

        this.addUIEventListener(this.canvas, 'mouseup', mouseUp.bind(this), false);

        this.addUIEventListener(this.canvas, 'click', click.bind(this), false);

        this.addUIEventListener(this.canvas, 'dblclick', dblClick.bind(this), false);

        //commented out for performance
        //this.addUIEventListener(this.canvas, 'mousemove', mouseMove.bind(this), false);

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

            this.resize

            , 200

        );


    };

    function resize() {
        var rect = this.container.getBoundingClientRect();
        this.renderer.setSize(rect.width, rect.height);
        this.camera.aspect = rect.width / rect.height;
        this.controls.handleResize();
        this.camera.updateProjectionMatrix();
    }


    function mouseDown(event) {
        mouse.call(this, 'mouseDown', event);
    }


    function mouseUp(event) {
        mouse.call(this, 'mouseUp', event);
    }


    function click(event) {
        mouse.call(this, 'click', event);
    }


    function dblClick(event) {
        mouse.call(this, 'dblClick', event);
    }


    function mouseMove(event) {
        mouse.call(this, 'mouseMove', event);
    }


    function mouse(type, event) {

        var rect = this.canvas.getBoundingClientRect(), vector = new THREE.Vector3(((event.clientX - rect.left) / rect.width ) * 2 - 1, -((event.clientY - rect.top) / rect.height ) * 2 + 1, 0.5);
        vector.unproject(this.camera);

        var raycaster = new THREE.Raycaster(this.camera.position, vector.sub(this.camera.position).normalize());

        var intersects = raycaster.intersectObjects(this._clickables);

        if (intersects.length > 0) {
            if (typeof intersects[0].object[type] === 'function') {
                intersects[0].object[type](event);
            }
        }
    };

    function addClickable(obj) {

        if (obj instanceof UIControls.ClickableMesh) {

            if (typeof obj._clickableIdx === 'undefined') {
                this._clickables.push(obj);
                obj._clickableIdx = this._clickables.length - 1;
            }

        }

        for (var i = 0, l = obj.children.length; i < l; i++) {
            addClickable.call(this, obj.children[i]);
        }

        return this;

    }


    function removeClickable(obj) {

        var idx = obj._clickableIdx;

        if (typeof idx !== 'undefined') {
            this._clickables.splice(idx, 1);
            delete obj._clickableIdx;
            for(var i = idx, l = this._clickables.length; i < l; i++ ){
                this._clickables[i]._clickableIdx = i;
            }
        }

        for (var i = 0, l = obj.children.length; i < l; i++) {
            removeClickable.call(this, obj.children[i]);
        }

        return this;

    }


})();
