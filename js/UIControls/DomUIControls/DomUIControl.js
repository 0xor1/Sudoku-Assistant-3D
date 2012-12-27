(function () {

    UIControls.DomUIControl = function (p) {

        UIControls.UIControl.call(this);

        p = p || {}; //{tag, dom}

        if (typeof p.dom !== "undefined") {
            this._dom = p.dom;
        } else if (typeof p.tag === "undefined") {
            this._dom = null;
        } else if (typeof tag === "string") {
            this._dom = document.createElement(tag);
        }

        this._rect = null;

    };


    UIControls.DomUIControl.prototype = Object.create(UIControls.UIControl.prototype);


    UIControls.DomUIControl.prototype.injectIntoContainer = function (con) {

        con._dom.style.background = this._dom.style.background;
        con._dom.appendChild(this._dom);

        this._dom.style.margin = 0;
        this._dom.style.padding = 0;
        this._dom.style.position = 'absolute';
        this._dom.style.width = '100%';
        this._dom.style.height = '100%';
        this._dom.style.overflow = "hidden";

        this.resize();

        con.addEventListener('resize', this.resize.bind(this));

    };


    UIControls.DomUIControl.prototype.resize = function () {

        var oldRect;

        if (this._rect === null) {
            this._rect = this._dom.getBoundingClientRect();
            this.dispatchEvent({
                type:'resize'
            });
            return this;
        }

        oldRect = this._rect;
        this._rect = this._dom.getBoundingClientRect();

        if (this._rect.width !== oldRect.width || this._rect.height !== oldRect.height) {
            this.dispatchEvent({
                type:'resize'
            });
        }

    }

    window.addEventListener(
        'load',
        function () {
            window.masterViewport = new UIControls.DomUIControl({dom:document.body});

            masterViewport._dom.style.margin = 0;
            masterViewport._dom.style.padding = 0;
            masterViewport._dom.style.width = '100%';
            masterViewport._dom.style.height = '100%';
            masterViewport._dom.style.overflow = "hidden";
            masterViewport._dom.style.position = "absolute";

            masterViewport.addUIEventListener(
                window,
                'resize',
                function () {
                    masterViewport.dispatchEvent({
                        type:'resize'
                    });
                },
                false
            );
        },
        false
    );

})();