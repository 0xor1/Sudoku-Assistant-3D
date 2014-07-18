(function () {

    window.Utils = window.Utils || {};

    Utils.animate = function (param) {

        var obj
            , prop
            , startValue
            , targetValue
            , callback
            , progressFunction
            , innerProgressFunction
            , valueSuffix
            , inverseLength
            , thisSuffix
            , paused = Utils.AnimationMaster.isPaused
            , progress = 0
            , suffix = '_animate_'
            , lastTime = Date.now()
            , counterSuffix = Utils.animate.counterSuffix
            ;

        initialiseVariables();

        cancelOldAnimations();


        obj[prop + thisSuffix] = function () {

            var thisTime;

            if (typeof obj[prop + thisSuffix] === "undefined" || obj[prop + thisSuffix].cancelled) {
                finalize();
                return;
            }

            if (paused) {
                return;
            }

            thisTime = Date.now();
            progress += (thisTime - lastTime) * inverseLength * Utils.AnimationMaster.scalingFactor;
            lastTime = thisTime;

            if (progress >= 1) {

                obj[prop] = progressFunction(startValue, targetValue, 1);

                if (callback instanceof Function) {
                    requestAnimationFrame(function () {
                        callback(obj, prop);
                    });
                }

                finalize();

                return;

            } else {

                obj[prop] = progressFunction(startValue, targetValue, progress);

                requestAnimationFrame(obj[prop + thisSuffix]);

            }

        };

        listenToAnimationMaster();

        requestAnimationFrame(obj[prop + thisSuffix]);

        return obj[prop + thisSuffix];

        function initialiseVariables() {
            obj = param.obj;
            prop = param.prop;
            valueSuffix = param.valueSuffix;
            inverseLength = 1 / param.length;
            callback = param.callback;
            setStartValue();
            setTargetValue();
            setProgressFunction();
        }

        function setStartValue() {
            if (typeof valueSuffix === "string") {
                startValue = Number(obj[prop].substring(0, obj[prop].length - valueSuffix.length));
            } else {
                startValue = obj[prop];
            }
        }

        function setTargetValue() {
            if (typeof param.target === "string") {
                if (param.targetValue.substring(0, 2) === "+=") {
                    targetValue = startValue + Number(param.target.substring(2));
                } else {
                    targetValue = startValue - Number(param.target.substring(2));
                }
            } else {
                targetValue = param.target;
            }
        }

        function setProgressFunction() {
            progressFunction = param.progressFunction ||
                function (start, end, progress) {
                    return (start - end) * (Math.cos(progress * Math.PI) + 1) * 0.5 + end;
                };

            if (typeof valueSuffix === "string") {
                innerProgressFunction = progressFunction;
                progressFunction = function (start, end, progress) {
                    return innerProgressFunction(start, end, progress) + valueSuffix;
                }
            }
        }

        function cancelOldAnimations() {

            var j, jIsSet = false, previousIsCancelled = false, i = 0;

            if (typeof obj[prop + counterSuffix] === "undefined" || obj[prop + counterSuffix] === 0) {
                j = 0;
                obj[prop + Utils.animate.counterSuffix] = 1;
            } else {
                while (!previousIsCancelled) {
                    if (obj[prop + suffix + i] instanceof Function) {
                        if (obj[prop + suffix + i].cancelled !== true) {
                            obj[prop + suffix + i].cancelled = true;
                            previousIsCancelled = true
                            if (!jIsSet) {
                                j = i + 1;
                                jIsSet = true;
                            }
                        }
                    } else if (!jIsSet && i === 0) {
                        j = 0
                        jIsSet = true;
                    }
                    i++;
                }
                obj[prop + counterSuffix]++;
            }
            thisSuffix = suffix + j;

        }

        function listenToAnimationMaster() {
            obj[prop + thisSuffix].play = function () {
                paused = false;
                lastTime = Date.now();
                requestAnimationFrame(obj[prop + thisSuffix]);
            };
            obj[prop + thisSuffix].pause = function () {
                paused = true;
            };
            Utils.AnimationMaster.addEventListener("play", masterPlayHandler);
            Utils.AnimationMaster.addEventListener("pause", masterPauseHandler);
        }

        function masterPlayHandler() {
            obj[prop + thisSuffix].play();
        }

        function masterPauseHandler() {
            obj[prop + thisSuffix].pause();
        }

        function finalize() {
            Utils.AnimationMaster.removeEventListener("play", masterPlayHandler);
            Utils.AnimationMaster.removeEventListener("pause", masterPauseHandler);
            obj[prop + Utils.animate.counterSuffix]--;
            delete obj[prop + thisSuffix];
        }

    };

    Utils.animate.counterSuffix = "_animation_count_";

    Utils.AnimationMaster = new Utils.EventDispatcher();

    Utils.AnimationMaster.scalingFactor = 1;

    Utils.AnimationMaster.isPaused = false;

    Utils.AnimationMaster.turnOnAnimationSmoothing = function () {
        Utils.FrameRateMonitor.addEventListener(
            'criticalFrameRateDrop',
            Utils.AnimationMaster.CriticalFrameRateDropHandler
        );
        Utils.FrameRateMonitor.addEventListener('criticalFrameRateRecovered', Utils.AnimationMaster.CriticalFrameRateRecoveredHandler);
    };

    Utils.AnimationMaster.turnOffAnimationSmoothing = function () {
        ns.FrameRateMonitor.removeEventListener('criticalFrameRateDrop', Utils.AnimationMaster.CriticalFrameRateDropHandler);
        ns.FrameRateMonitor.removeEventListener('criticalFrameRateRecovered', Utils.AnimationMaster.CriticalFrameRateRecoveredHandler);
    };

    Utils.AnimationMaster.pause = function () {

        Utils.AnimationMaster.isPaused = true;
        Utils.AnimationMaster.dispatchEvent({
            type:"pause"
        });

    };

    Utils.AnimationMaster.play = function () {

        Utils.AnimationMaster.isPaused = false;
        Utils.AnimationMaster.dispatchEvent({
            type:"play"
        });

    };

    Utils.AnimationMaster.CriticalFrameRateDropHandler = function (event) {
        Utils.AnimationMaster.scalingFactor = 0.5;
    };

    Utils.AnimationMaster.CriticalFrameRateRecoveredHandler = function (event) {
        Utils.AnimationMaster.scalingFactor = 1;
    };

    /*
     * FrameRateMonitor Adapted from mrdoob's Stats.js
     */
    (function () {

        var prevTime
            , fps = 0
            , fpsMin = Infinity
            , fpsMax = 0
            , criticalFps = 20
            , frames = 0
            , stopMonitoring = false
            , log = false
            , inCriticalMode
            ;

        Utils.FrameRateMonitor = new Utils.EventDispatcher();

        Utils.FrameRateMonitor.setCriticalFps = function (val) {

            if (val < 60 && val > 0) {
                criticalFps = val;
            }

        };

        Utils.FrameRateMonitor.start = function () {
            stopMonitoring = false;
            prevTime = Date.now();
            requestAnimationFrame(update);
        };

        Utils.FrameRateMonitor.stop = function () {
            stopMonitoring = true;
        };

        Utils.FrameRateMonitor.enableLogging = function () {
            log = true;
        };

        Utils.FrameRateMonitor.disableLogging = function () {
            log = false;
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
                fpsMin = Math.min(fpsMin, fps);
                fpsMax = Math.max(fpsMax, fps);

                if (inCriticalMode && fps > criticalFps) {
                    Utils.log("CRITICAL FRAME RATE RECOVERED!!")
                    inCriticalMode = false;
                    Utils.FrameRateMonitor.dispatchEvent({
                        type:"criticalFrameRateRecovered",
                        fps:fps
                    });
                }

                if (log) {
                    Utils.log("fps = " + fps + "\tfpsMin = " + fpsMin + "\t\tfpsMax = " + fpsMax);
                }

                prevTime = time;
                frames = 0;

                if (!inCriticalMode && fps < criticalFps) {
                    Utils.log("CRITICAL FRAME RATE DROP!!")
                    inCriticalMode = true;
                    Utils.FrameRateMonitor.dispatchEvent({
                        type:"criticalFrameRateDrop",
                        fps:fps
                    });
                }

            }

            requestAnimationFrame(update);

        }

    })();

})();