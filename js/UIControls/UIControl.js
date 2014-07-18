(function () {


    window.UIControls = {};


    UIControls.UIControl = function () {

        Utils.EventDispatcher.call(this);

        this._isUIEnabled = true;

        this._UIListeners = []; // { dom, type, listener, useCapture, isHookedUp}

    };


    UIControls.UIControl.prototype = {

        constructor:UIControls.UIControl,

        disableUI:function () {

            for (var i = 0, l = this._UIListeners.length; i < l; i++) {
                if (this._UIListeners[i].isHookedUp) {
                    this.__UIListeners[i].dom.removeEventListener(
                        this.__UIListeners[i].type,
                        this._UIListeners[i].listener,
                        this._UIListeners[i].useCapture
                    );
                    this._UIListeners[i].isHookedUp = false;
                }
            }
            this._isUIEnabled = false;
            this.dispatchEvent({
                type:"UIControlDisabled",
                control:this
            });
            return this;

        },


        enableUI:function () {

            for (var i = 0, l = this._UIListeners.length; i < l; i++) {
                if (!this._UIListeners[i].isHookedUp) {
                    this._UIListeners[i].dom.addEventListener(
                        this._UIListeners[i].type,
                        this._UIListeners[i].listener,
                        this._UIListeners[i].useCapture
                    );
                    this._UIListeners[i].isHookedUp = true;
                }
            }
            this._isUIEnabled = true;
            this.dispatchEvent({
                type:"UIControlEnabled",
                control:this
            });
            return this;

        },


        addUIEventListener:function (dom, type, listener, useCapture) {

            var UIListener = {
                dom:dom,
                type:type,
                listener:listener,
                useCapture:useCapture,
                isHookedUp:true
            };

            if (!this._isUIEnabled) {
                UIListener.isHookedUp = false;
            } else {
                dom.addEventListener(type, listener, useCapture);
            }

            this._UIListeners.push(UIListener);
            this.dispatchEvent({
                type:"UIEventListenerAdded",
                control:this,
                UIEventListener:UIListener
            });
            return this;

        },


        removeUIEventListener:function (dom, type, listener, useCapture) {

            for (var i = 0, l = this._UIListeners.length; i < l; i++) {
                if (
                    this._UIListeners[i].dom === dom &&
                        this._UIListeners[i].type === type &&
                        this._UIListeners[i].listener === listener &&
                        this._UIListeners[i].useCapture === useCapture
                    ) {
                    dom.removeEventListener(type, listener, useCapture);
                    this.dispatchEvent({
                        type:"UIEventListenerRemoved",
                        control:this,
                        UIEventListener:this._UIListeners.splice(i, 1)[0]
                    });
                    break;
                }
            }
            return this;

        },


        removeSpecificUIFunctionality:function (fn) {

            for (var i = 0, l = this._UIListeners.length; i < l; i++) {
                if (this._UIListeners[i].listener === fn) {
                    this._UIListeners[i].dom.removeEventListener(this._UIListeners[i].type, this._UIListeners[i].listener, this._UIListeners[i].useCapture);
                    this.dispatchEvent({
                        type:"UIEventListenerRemoved",
                        control:this,
                        UIEventListener:this._UIListeners.splice(i, 1)[0]
                    });
                }
            }
            return this;

        },


        removeSpecificUIEventType:function (type) {

            for (var i = 0, l = this._UIListeners.length; i < l; i++) {
                if (this._UIListeners[i].type === type) {
                    this._UIListeners[i].dom.removeEventListener(this._UIListeners[i].type, this._UIListeners[i].listener, this._UIListeners[i].useCapture);
                    this.dispatchEvent({
                        type:"UIEventListenerRemoved",
                        control:this,
                        UIEventListener:this._UIListeners.splice(i, 1)[0]
                    });
                }
            }
            return this;

        },

        unhookUIListener:function (dom, type, listener, useCapture) {

            for (var i = 0, l = this._UIListeners.length; i < l; i++) {
                if (
                    this._UIListeners[i].dom === dom &&
                        this._UIListeners[i].type === type &&
                        this._UIListeners[i].listener === listener &&
                        this._UIListeners[i].useCapture === useCapture
                    ) {
                    if (this._UIListeners[i].isHookedUp) {
                        dom.removeEventListener(type, listener, useCapture);
                        this._UIListeners[i].isHookedUp = false;
                        this.dispatchEvent({
                            type:"UIEventListenerUnhooked",
                            control:this,
                            UIEventListener:this._UIListeners[i]
                        });
                    }
                    break;
                }
            }
            return this;

        },


        hookUpUIListener:function (dom, type, listener, useCapture) {

            for (var i = 0, l = this._UIListeners.length; i < l; i++) {
                if (
                    this._UIListeners[i].dom === dom &&
                        this._UIListeners[i].type === type &&
                        this._UIListeners[i].listener === listener &&
                        this._UIListeners[i].useCapture === useCapture
                    ) {
                    if (!this._UIListeners[i].isHookedUp) {
                        dom.addEventListener(type, listener, useCapture);
                        this._UIListeners[i].isHookedUp = false;
                        this.dispatchEvent({
                            type:"UIEventListenerHookedUp",
                            control:this,
                            UIEventListener:this._UIListeners[i]
                        });
                    }
                }
            }
            return this;

        },


        unhookSpecificUIFunctionality:function (fn) {

            for (var i = 0, l = this._UIListeners.length; i < l; i++) {
                if (this._UIListeners[i].listener === fn) {
                    this._UIListeners[i].dom.removeEventListener(this._UIListeners[i].type, this._UIListeners[i].listener, this._UIListeners[i].useCapture);
                    this._UIListeners[i].isHookedUp = false;
                    this.dispatchEvent({
                        type:"UIEventListenerUnhooked",
                        control:this,
                        UIEventListener:this._UIListeners[i]
                    });
                }
            }
            return this;

        },


        unhookSpecificUIEventType:function (type) {

            for (var i = 0, l = this._UIListeners.length; i < l; i++) {
                if (this._UIListeners[i].type === type) {
                    this._UIListeners[i].dom.removeEventListener(this._UIListeners[i].type, this._UIListeners[i].listener, this._UIListeners[i].useCapture);
                    this._UIListeners[i].isHookedUp = false;
                    this.dispatchEvent({
                        type:"UIEventListenerUnhooked",
                        control:this,
                        UIEventListener:this._UIListeners[i]
                    });
                }
            }
            return this;

        }


    };

})()
;
