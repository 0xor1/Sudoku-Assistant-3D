/*
 *
 *  0xor1    http://github.com/0xor1
 *
 */

THREE.SphericalPolarControls = function (obj, dom) {

    THREE.EventDispatcher.call(this);

    this.obj = obj;
    this.dom = (typeof dom === 'undefined') ? null : dom;

    this.r = 0;
    this.rMin = 0;
    this.rMax = Infinity;
    this.rSpead = 1;

    this.theta = 0;
    this.thetaMin = 0;
    this.thetaMax = Math.PI;
    this.thetaSpeed = 1;

    this.phi = 0;
    this.phiMin = 0;
    this.phiMax = Math.PI * 2;
    this.phiSpeed = 1;

    this.center = new THREE.Vector3();
    this.centerRotation = new THREE.Vector3();

    this.focusTypes = {point:'point', direction:'direction'};
    this.focusType = this.focusTypes.point;
    this.focusPoint = new THREE.Vector3();
    this.focusDirection = null;





};