/*
 *  Sassy.js
 *
 *  0xor1    http://github.com/0xor1
 *
 *  Rename NameSpace and sfx on the last line.
 *
 */


// requestAnimationFrame polyfill by Erik Möller
// fixes from Paul Irish and Tino Zijdel

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
( function () {

    var lastTime = 0;
    var vendors = [ 'ms', 'moz', 'webkit', 'o' ];

    for ( var x = 0; x < vendors.length && !window.requestAnimationFrame; ++ x ) {

        window.requestAnimationFrame = window[ vendors[ x ] + 'RequestAnimationFrame' ];
        window.cancelAnimationFrame = window[ vendors[ x ] + 'CancelAnimationFrame' ] || window[ vendors[ x ] + 'CancelRequestAnimationFrame' ];

    }

    if ( window.requestAnimationFrame === undefined ) {

        window.requestAnimationFrame = function ( callback, element ) {

            var currTime = Date.now(), timeToCall = Math.max( 0, 16 - ( currTime - lastTime ) );
            var id = window.setTimeout( function() { callback( currTime + timeToCall ); }, timeToCall );
            lastTime = currTime + timeToCall;
            return id;

        };

    }

    window.cancelAnimationFrame = window.cancelAnimationFrame || function ( id ) { window.clearTimeout( id ) };

}() );



(function (NS, sfx) {


    var ns = window[NS] = window[NS] || {}
        , scalingFactor = 1
        , tmpScalingFactor = scalingFactor
        , math = Math
        ;


    ns.animate = function (param) {


        var obj = param.obj
            , prop = param.prop
            , start = obj[prop]
            , target = param.target
            , length = (typeof param.length === 'undefined' || param.length === 0) ? 1 : param.length
            , inverseLength = 1 / length
            , progress = 0
            , callback = param.callback
            , dcc = (start - target) * 0.5  //defaultConstCoefficient
            , cos = math.cos
            , pi = math.PI
            , progressFn = param.progressFn ||
                function (obj, prop, s, t, p) {
                    obj[prop] = dcc * (cos(p * pi) + 1) + t;
                }
            , lastTime = Date.now()
            ;


        //process cancel requests
        if(param.cancel === true){
            if(obj[prop + sfx].req !== null){
                cancelAnimationFrame(obj[prop + sfx].req);
                obj[prop + sfx].fn = obj[prop + sfx].req = null;
            }
            return;
        }


        //process relative animations
        if (typeof target === "string") {
            if (target.substring(0, 2) === "+=") {
                target = start + Number(target.substring(2));
            } else {
                target = start - Number(target.substring(2));
            }
        }


        obj[prop + sfx] = obj[prop + sfx] || {fn:null,req:null};


        obj[prop + sfx].fn = function () {


            var thisTime = Date.now();
            progress += (thisTime - lastTime) * inverseLength * scalingFactor;
            lastTime = thisTime;


            if (progress >= 1) {

                progressFn(obj, prop, start, target, 1);

                if (callback instanceof Function) {
                    setTimeout(
                        function () {
                            callback(obj, prop, start, target, length, progressFn);
                        },
                        0
                    );
                }

                obj[prop + sfx].fn = obj[prop + sfx].req = null;

            } else {

                progressFn(obj, prop, start, target, progress);

                obj[prop + sfx].req = requestAnimationFrame(function(){obj[prop + sfx].fn();});

            }

        };

        if(obj[prop + sfx].req === null){
            obj[prop + sfx].req = requestAnimationFrame(function(){obj[prop + sfx].fn();});
        }

    };

    ns.animationMaster = {};


    ns.animationMaster.pause = function () {

        if(scalingFactor !== 0){
            tmpScalingFactor = scalingFactor;
            scalingFactor = 0;
        }

    };


    ns.animationMaster.play = function () {

        scalingFactor = tmpScalingFactor;

    };


    ns.animationMaster.setAnimationScalingFactor = function (sf) {

        if(sf > 0){
            scalingFactor = tmpScalingFactor = sf;
        }

    };


    /*
     *
     * frameRateMonitor Adapted from mrdoob's Stats.js  https://github.com/mrdoob/stats.js
     *
     */
    (function () {

        var prevTime
            , fps = 0
            , criticalFps = 20
            , frames = 0
            , stopMonitoring = false
            , log = false
            , inCriticalMode = false
            , animationSmoothingEnabled = false
            , animationSmoothingIsInEffect = false
            ;


        ns.frameRateMonitor = {};


        ns.frameRateMonitor.setCriticalFps = function (val) {

            if (val < 60 && val > 0) {
                criticalFps = val;
            }

        };

        ns.frameRateMonitor.start = function () {
            if(stopMonitoring === true){
                stopMonitoring = false;
                prevTime = Date.now();
                requestAnimationFrame(update);
            }
        };

        ns.frameRateMonitor.stop = function () {
            stopMonitoring = true;
        };

        ns.frameRateMonitor.enableLogging = function () {
            log = true;
        };

        ns.frameRateMonitor.disableLogging = function () {
            log = false;
        };

        ns.frameRateMonitor.enableLowFrameRateSmoothing = function(){
            ns.frameRateMonitor.start();
            animationSmoothingEnabled = true;
        };

        ns.frameRateMonitor.disableLowFrameRateSmoothing = function(){
            animationSmoothingEnabled = false;
        };

        function update() {

            var time;

            if (stopMonitoring) {
                frames = 0;
                return;
            }

            time = Date.now();
            frames++;

            if (time > prevTime + 1000) {
                fps = Math.round((frames * 1000 ) / (time - prevTime ));

                if (inCriticalMode && fps > criticalFps) {
                    console.log("CRITICAL FRAME RATE RECOVERED");
                    inCriticalMode = false;
                    if(animationSmoothingIsInEffect) {
                        criticalFrameRateRecovered(fps);
                    }
                }

                if (log) {
                    console.log("\nfps = " + fps);
                }

                prevTime = time;
                frames = 0;

                if (!inCriticalMode && fps < criticalFps) {
                    console.log("CRITICAL FRAME RATE DROP");
                    inCriticalMode = true;
                    if(animationSmoothingEnabled){
                        criticalFrameRateDrop(fps);
                    }
                }

            }

            requestAnimationFrame(update);

        }


        function criticalFrameRateDrop() {
            //TODO better than just decreasing scaling factor by 2
            animationSmoothingIsInEffect = true;
            if (scalingFactor !== 0) {
                tmpScalingFactor = scalingFactor = scalingFactor * 0.5;
            }
            else {
                tmpScalingFactor = tmpScalingFactor * 0.5;
            }
        }


        function criticalFrameRateRecovered() {
            //TODO better than just increasing scaling factor by 2
            animationSmoothingIsInEffect = false;
            if (scalingFactor !== 0) {
                tmpScalingFactor = scalingFactor = scalingFactor * 2;
            }
            else {
                tmpScalingFactor = tmpScalingFactor * 2;
            }
        }

    })();

})('Utils', '_sassy_animation_');