/*
 *
 *  0xor1    http://github.com/0xor1
 *
 */

(function () {


    THREE.SphericalPolarControls = function (obj, dom) {

        THREE.EventDispatcher.call(this);

        var math = Math
            , cos = math.cos
            , sin = math.sin
            , pi = math.PI

            , obj = obj
            , dom = (typeof dom === 'undefined') ? null : dom
            , rect = (dom !== null) ? dom.getBoundingClientRect() : null

            , r = 0
            , rMin = 0
            , rMax = Infinity
            , rSpeed = 1
            , rIsEnabled = true

            , theta = 0
            , thetaMin = 0
            , thetaMax = pi
            , thetaSpeed = 1
            , thetaIsEnabled = true

            , phi = 0
            , phiMin = 0
            , phiMax = pi * 2
            , phiSpeed = 1
            , phiIsEnabled = true

            , center = new THREE.Vector3()
            , centerRotation = new THREE.Vector3()

            , focusTypes = {point:'point', direction:'direction'}
            , focusType = focusTypes.point
            , focusPoint = new THREE.Vector3()
            , focusDirection = null

            , lastMouseX = 0
            , lastMouseY = 0
            ;


        if (dom !== null) {

            dom.addEventListener('mousedown', mouseDown, false);

            dom.addEventListener('mousewheel', mouseWheel, false);
            dom.addEventListener('DOMMouseScroll', mouseWheel, false);
        }

        function mouseDown(event) {

            lastMouseX = event.clientX;

            lastMouseY = event.clientY;

            dom.addEventListener('mousemove', mouseMove, false);

            dom.addEventListener('mouseup', mouseUp, false);

        }


        function mouseUp(event) {

            dom.removeEventListener('mousemove', mouseMove, false);

            dom.removeEventListener('mouseup', mouseUp, false);

        }


        function mouseMove(event) {

            var deltaX = lastMouseX - event.clientX
                , deltaY = lastMouseY - event.clientY
                ;

            phiPlus(deltaX * phiSpeed * 2 * pi / rect.width);

            thetaPlus(deltaY * thetaSpeed * pi / rect.height);

            updateObjPosition();

        }


        function mouseWheel(event) {

            var delta = 0;

            if (rIsEnabled) {

                var delta = 0;

                if ( event.wheelDelta ) { // WebKit / Opera / Explorer 9

                    delta = event.wheelDelta / 40;

                } else if ( event.detail ) { // Firefox

                    delta = - event.detail / 3;

                }

                r += ( 1 / delta ) * 0.05;

                updateObjPosition();
            }

        }


        this.resizeHandler = function () {
            rect = dom.getBoundingClientRect();
        }


        function phiPlus(delta) {

            if (delta !== 0 && phiIsEnabled) {

                phi += delta;

                if (phi > phiMax) {

                    if (phiMax === pi * 2 && phiMin === 0) {

                        phi -= phiMax;

                    } else {

                        phi = phiMax;

                    }

                } else if (phi < phiMin) {

                    if (phiMin === 0 && phiMax === pi * 2) {

                        phi += phiMax;

                    } else {

                        phi = phiMin;

                    }

                }

            }

        };


        function thetaPlus(delta){

            if (delta !== 0 && thetaIsEnabled) {

                theta += delta;

                if (theta > thetaMax) {

                    if (thetaMax === pi) {

                        phiPlus(pi);

                    }

                    theta = thetaMax;

                } else if (theta < thetaMin) {

                    if (thetaMin === 0) {

                        phiPlus(pi);

                    }

                    theta = thetaMin;

                }

            }

        };





        function updateObjPosition(){

            var rst = r * sin(theta);

            obj.position.x = rst * cos(phi);
            obj.position.y = rst * sin(phi);
            obj.position.z = r * cos(theta);

        }

    };

})();