/*
 * FrameRateMonitor Adapted from mrdoob's Stats.js
 */

(function () {

    var prevTime
        , inCriticalMode
        , fps = 0
        , fpsMin = Infinity
        , fpsMax = 0
        , criticalFps = 20
        , frames = 0
        , stopMonitoring = false
        , log = false
        , Utils = window.Utils = window.Utils || {}
        ;

    window.Utils = window.Utils || {};

    Utils.FrameRateMonitor = new Utils.EventTarget();

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
                    type: "criticalFrameRateRecovered",
                    fps: fps
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
                    type: "criticalFrameRateDrop",
                    fps: fps
                });
            }

        }

        requestAnimationFrame(update);

    }

})();