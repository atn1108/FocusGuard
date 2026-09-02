(function () {
    // Bridge between the MindSeed web app's focus timer and FocusGuard's own
    // Pomodoro. MindSeed posts window messages ({ source: "mindseed-focus" })
    // whenever its timer starts, pauses, resumes, stops, or completes. When a
    // message is received, we forward it to FocusGuard's background service
    // worker so the two timers stay in sync.

    const SOURCE = "mindseed-focus";

    function isValidEvent(event) {
        if (event.source !== window) return false;
        const data = event.data;
        if (!data || typeof data !== "object") return false;
        return data.source === SOURCE && data.type === "timer";
    }

    window.addEventListener("message", (event) => {
        if (!isValidEvent(event)) return;

        const { action, focusMinutes, remainingSeconds } = event.data;

        let message = null;

        switch (action) {
            case "start":
            case "resume":
                message = { type: "MINDSEED_POMODORO", action: "start", focusMinutes, remainingSeconds };
                break;
            case "pause":
            case "stop":
            case "complete":
                message = { type: "MINDSEED_POMODORO", action: "stop" };
                break;
            default:
                return;
        }

        try {
            chrome.runtime.sendMessage(message, () => {
                if (chrome.runtime.lastError) {
                    console.log("[FocusGuard] mindseed-bridge: could not sync (extension reloaded?)");
                }
            });
        } catch (e) {
            console.log("[FocusGuard] mindseed-bridge: sendMessage failed", e);
        }
    });

    console.log("[FocusGuard] mindseed-bridge loaded");
})();