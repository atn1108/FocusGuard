console.log("[FocusGuard] blocker.js START v3");

window.onerror = function (msg, url, line) {
    console.log("[FocusGuard ERROR]", msg, "line:", line);
};

(function () {

    let blocking = false;
    let running = false;

    function isContextValid() {
        try {
            return !!chrome && !!chrome.storage && !!chrome.runtime && !!chrome.runtime.id;
        } catch (e) {
            return false;
        }
    }

    function getStorage(keys) {
        return new Promise(resolve => {
            try {
                chrome.storage.local.get(keys, data => resolve(data));
            } catch (e) {
                resolve({});
            }
        });
    }

    async function checkOverride(siteKey) {
        const data = await getStorage(["override"]);
        const override = data.override || {};
        return override[siteKey] && Date.now() < override[siteKey];
    }

    async function checkPomodoro() {
        const data = await getStorage(["pomodoro"]);
        const pomo = data.pomodoro || {};
        if (!pomo.enabled || !pomo.endsAt) return false;
        return pomo.isBreak;
    }

    async function checkWhitelistBlacklist() {
        const data = await getStorage(["whitelist", "blacklist"]);
        const whitelist = data.whitelist || [];
        const blacklist = data.blacklist || [];
        const url = location.href;
        const host = location.hostname;

        function matchesItem(item) {
            const needle = item.toLowerCase();
            const h = host.toLowerCase();
            const u = url.toLowerCase();
            if (h === needle || h.endsWith("." + needle) || h.endsWith("/" + needle)) return true;
            if (u.includes("://" + needle) || u.includes("." + needle + "/") || u.includes("." + needle + "?")) return true;
            return false;
        }

        for (const item of whitelist) {
            if (matchesItem(item)) return "whitelisted";
        }
        for (const item of blacklist) {
            if (matchesItem(item)) return "blacklisted";
        }
        return null;
    }

    async function checkDailyGoal() {
        try {
            const result = await new Promise(resolve => {
                chrome.runtime.sendMessage({ type: "CHECK_DAILY_GOAL" }, resolve);
            });
            return result ? result.reached : false;
        } catch (e) {
            return false;
        }
    }

    async function checkBudget(siteKey) {
        const data = await getStorage(["budgets", "usage"]);
        const budgets = data.budgets || {};
        const min = budgets[siteKey] != null ? budgets[siteKey] : FocusGuardSites.DEFAULT_BUDGET_MINUTES;
        const usage = data.usage || {};
        const usedSec = usage[siteKey] || 0;
        return { blocked: usedSec >= min * 60, usedSec: usedSec, min: min };
    }

    function getSetting(name) {
        return new Promise(resolve => {
            try {
                chrome.storage.local.get([name], data => {
                    resolve(data[name] !== false);
                });
            } catch (e) {
                resolve(false);
            }
        });
    }

    function isEnabled() {
        return new Promise(resolve => {
            try {
                chrome.storage.local.get(["enabled"], data => {
                    resolve(data.enabled !== false);
                });
            } catch (e) {
                resolve(false);
            }
        });
    }

    function isAllowedTemporarily() {
        return new Promise(resolve => {
            try {
                chrome.storage.local.get(["allowUntil"], data => {
                    resolve(data.allowUntil && Date.now() < data.allowUntil);
                });
            } catch (e) {
                resolve(false);
            }
        });
    }

    async function getCustomHosts() {
        const data = await getStorage(["customSites"]);
        const list = data.customSites || [];
        return list.filter(c => c.enabled !== false);
    }

    // Hide DOM anchors that point into a guarded surface (e.g. /shorts, /reel).
    function hideGuardedLinks(site) {
        if (!site || !site.paths) return;
        document.querySelectorAll("a").forEach(a => {
            const href = a.href || "";
            let target = null;
            try { target = new URL(href); } catch (e) { return; }
            if (!target.hostname) return;
            if (!site.host && !site.key) return;
            // Only hide links that resolve to the same logical site.
            const sameSite = FocusGuardSites.resolve(href, null);
            if (!sameSite || sameSite.key !== site.key) return;
            if (site.paths.some(p => target.pathname.startsWith(p))) {
                a.style.display = "none";
            }
        });
    }

    async function requestBlock(siteKey, siteLabel, forceNoOverride) {
        const inBreak = await checkPomodoro();
        if (inBreak) return false;

        const override = await checkOverride(siteKey);
        if (override) return false;

        const wlBl = await checkWhitelistBlacklist();
        if (wlBl === "whitelisted") return false;

        const budget = await checkBudget(siteKey);
        const dailyGoalReached = await checkDailyGoal();
        const strictMode = (await getStorage(["strictMode"])).strictMode;

        let reason = null;
        if (strictMode) reason = "strict";
        else if (dailyGoalReached) reason = "goal";
        else if (budget.blocked) reason = "budget";

        const noBypass = !!forceNoOverride || !!strictMode;

        const result = await showConfirm(siteKey, siteLabel, noBypass, reason, budget);
        return !result;
    }

    window.FocusGuardScan = async function scan() {

        if (running) return;
        running = true;

        try {

            // Extension reloaded/unloaded mid-flight: stop scanning instead of
            // throwing "Extension context invalidated" into an unhandled rejection.
            if (!isContextValid()) return;

            const enabled = await isEnabled();
            if (!enabled) {
                const overlay = document.getElementById("fg-confirm");
                if (overlay) overlay.remove();
                return;
            }

            const allowed = await isAllowedTemporarily();
            if (allowed) return;

            const inBreak = await checkPomodoro();
            if (inBreak) return;

            const wlBl = await checkWhitelistBlacklist();
            if (wlBl === "whitelisted") return;

            const customHosts = await getCustomHosts();
            const isBlacklisted = wlBl === "blacklisted";

            const site = FocusGuardSites.resolve(location.href, customHosts);
            if (!site) return;

            const settingOn = isBlacklisted || await getSetting(site.key);
            if (!settingOn) return;

            // Only call this once we know the platform is actively guarded,
            // otherwise disabling a platform would still hide its links.
            hideGuardedLinks(site);

            if (!FocusGuardSites.isGuarded(location.href, customHosts)) return;

            if (blocking) return;

            blocking = true;
            try {
                const shouldBlock = await requestBlock(site.key, site.label, !!isBlacklisted);
                if (shouldBlock) {
                    chrome.runtime.sendMessage({ type: "blocked", platform: site.key });
                }
            } finally {
                blocking = false;
            }

        } catch (err) {
            console.log("[FocusGuard ERROR] scan()", err);
        } finally {
            running = false;
        }
    };

    console.log("[FocusGuard] Blocker loaded v3");
    window.FocusGuard = window.FocusGuard || {};
    window.FocusGuard.scan = window.FocusGuardScan;

})();