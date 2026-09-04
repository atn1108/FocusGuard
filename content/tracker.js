(function () {
    // FocusGuard v3 time tracking: while this page is visible and focused, we
    // send a heartbeat to the background worker every HEARTBEAT_MS. The worker
    // converts the sender URL into a site key and accumulates the metric.
    // All data stays local — nothing leaves the browser.

    var HEARTBEAT_MS = 30000;

    function tick() {
        if (document.visibilityState !== "visible") return;
        try {
            chrome.runtime.sendMessage({
                type: "USAGE_HEARTBEAT",
                seconds: HEARTBEAT_MS / 1000
            }, function () {});
        } catch (e) {
            // Extension reloaded or context invalidated — ignore.
        }
    }

    tick();
    setInterval(tick, HEARTBEAT_MS);

    console.log("[FocusGuard] tracker loaded");
})();