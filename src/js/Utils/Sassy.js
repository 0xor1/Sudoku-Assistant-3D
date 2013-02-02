/*
 *  Sassy.js
 *
 *  0xor1    http://github.com/0xor1
 *
 *  Rename NameSpace, sfx and countSfx on the last line.
 *
 */


(function (NS, sfx, countSfx) {


    var ns = window[NS] = window[NS] || {}
        , scalingFactor = 1
        , tmpScalingFactor = scalingFactor
        , math = Math
        , cos = math.cos
        , pi = math.PI
        ;


    ns.animate = function (param) {


        var obj = param.obj
            , prop = param.prop
            , start = obj[prop]
            , target = param.target
            , inverseLength = 1 / param.length
            , progress = 0
            , callback = param.callback
            , thisSfx
            , progressFn = param.progressFn ||
                function (s, t, p) {
                    return (s - t) * (cos(p * pi) + 1) * 0.5 + t;
                }
            , lastTime = Date.now()
            , jumpStartRequired = !(obj[prop + sfx] instanceof Function)
        ;


        if (typeof target === "string") {
            if (target.substring(0, 2) === "+=") {
                target = start + Number(target.substring(2));
            } else {
                target = start - Number(target.substring(2));
            }
        }


        getThisSfxAndCancelPreviousAnimation();


        obj[prop + thisSfx] = function () {


            var thisTime
                ;


            if(typeof obj[prop + thisSfx] === 'undefined' || obj[prop + thisSfx].cancelled) {
                obj[prop + countSfx]--;
                delete obj[prop + thisSfx];
                return;
            }


            thisTime = Date.now();
            progress += (thisTime - lastTime) * inverseLength * scalingFactor;
            lastTime = thisTime;


            if (progress >= 1) {

                obj[prop] = progressFn(start, target, 1);

                if (callback instanceof Function) {
                    setTimeout(
                        function () {
                            callback(obj, prop);
                        },
                        0
                    );
                }

                obj[prop + countSfx]--;
                delete obj[prop + thisSfx];

            } else {

                obj[prop] = progressFn(start, target, progress);

                requestAnimationFrame(obj[prop + thisSfx]);

            }

        };


        requestAnimationFrame(obj[prop + thisSfx]);


        return obj[prop + thisSfx];


        function getThisSfxAndCancelPreviousAnimation() {

            var j = 0
                , jIsSet = false
                , previousIsCancelled = false
                , i = 0
                ;

            if (typeof obj[prop + countSfx] === "undefined" || obj[prop + countSfx] === 0) {
                j = 0;
                obj[prop + countSfx] = 1;
            } else {
                while (!previousIsCancelled) {
                    if (obj[prop + sfx + i] instanceof Function) {
                        if (obj[prop + sfx + i].cancelled !== true) {
                            obj[prop + sfx + i].cancelled = true;
                            previousIsCancelled = true;
                            if (!jIsSet) {
                                j = i + 1;
                                jIsSet = true;
                            }
                        }
                    } else if (!jIsSet && i === 0) {
                        j = 0;
                        jIsSet = true;
                    }
                    i++;
                }
                obj[prop + countSfx]++;
            }
            thisSfx = sfx + j;

        }

    };


    ns.AnimationMaster = {};


    ns.AnimationMaster.pause = function () {

        tmpScalingFactor = scalingFactor;
        scalingFactor = 0;

    };


    ns.AnimationMaster.play = function () {

        scalingFactor = tmpScalingFactor;

    };


    ns.AnimationMaster.setAnimationScalingFactor = function (sf) {

        scalingFactor = tmpScalingFactor = sf;

    };


    /*
     *
     * FrameRateMonitor Adapted from mrdoob's Stats.js  https://github.com/mrdoob/stats.js
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


        ns.FrameRateMonitor = {};


        ns.FrameRateMonitor.setCriticalFps = function (val) {

            if (val < 60 && val > 0) {
                criticalFps = val;
            }

        };

        ns.FrameRateMonitor.start = function () {
            stopMonitoring = false;
            prevTime = Date.now();
            requestAnimationFrame(update);
        };

        ns.FrameRateMonitor.stop = function () {
            stopMonitoring = true;
        };

        ns.FrameRateMonitor.enableLogging = function () {
            log = true;
        };

        ns.FrameRateMonitor.disableLogging = function () {
            log = false;
        };
        
        ns.FrameRateMonitor.enableLowFrameRateSmoothing = function(){
            animationSmoothingEnabled = true;
        };

        ns.FrameRateMonitor.disableLowFrameRateSmoothing = function(){
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

})('Utils', '__animation__', '__animation__counts__');