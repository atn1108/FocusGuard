importScripts("sites.js");

chrome.runtime.onInstalled.addListener(() => {

    chrome.storage.local.get(["enabled"], (data) => {

        if (data.enabled === undefined) {

            chrome.storage.local.set({

                enabled: true,
                youtube: true,
                tiktok: true,
                instagram: true,
                facebook: true,
                reddit: true,
                x: true,
                twitch: true,
                pinterest: true,
                netflix: true,
                allowUntil: 0,
                override: {},

                strictMode: false,
                pomodoro: {
                    enabled: false,
                    focusMinutes: 25,
                    breakMinutes: 5,
                    isBreak: false,
                    endsAt: 0
                },
                dailyGoal: {
                    enabled: false,
                    maxOverrides: 3,
                    currentOverrides: 0,
                    date: new Date().toDateString()
                },
                whitelist: [],
                blacklist: [],
                theme: "auto",
                advancedStats: {},

                budgets: {},
                customSites: [],
                usage: { date: new Date().toDateString() },
                usageHistory: {},
                microJournal: {}

            }, () => {
                syncCustomScripts([]);
            });

        }

    });

});

chrome.runtime.onStartup.addListener(() => {
    chrome.storage.local.get(["customSites"], data => {
        syncCustomScripts(data.customSites || []);
    });
});

// Keep dynamic content scripts in sync with user-added custom sites.
// Chromium does not persist dynamically-registered content scripts across
// browser restarts, so we re-register on startup and after every change.
async function syncCustomScripts(list) {

    const scripts = [];
    (list || []).forEach(c => {
        const host = String(c.host || "")
            .replace(/^https?:\/\//, "")
            .replace(/\/.*$/, "")
            .replace(/^www\./, "")
            .toLowerCase();
        if (!host) return;

        const id = "fg-custom-" + host.replace(/[^a-z0-9.-]/g, "");
        scripts.push({
            id: id,
            matches: ["*://" + host + "/*", "*://*." + host + "/*"],
            js: ["sites.js", "content/confirm.js", "content/blocker.js", "content/index.js", "content/router.js", "content/observer.js", "content/tracker.js"],
            css: ["content/early-block.css"],
            runAt: "document_start"
        });
    });

    try {
        const existing = await chrome.scripting.getRegisteredContentScripts();
        const keep = new Set(scripts.map(s => s.id));
        const toRemove = existing
            .map(e => e.id)
            .filter(id => id.indexOf("fg-custom-") === 0 && !keep.has(id));

        if (toRemove.length) {
            await chrome.scripting.unregisterContentScripts({ ids: toRemove });
        }
        if (scripts.length) {
            await chrome.scripting.registerContentScripts(scripts);
        }
    } catch (e) {
        console.warn("[FocusGuard] syncCustomScripts error:", e);
    }
}

// --- Active-time tracking (heartbeat buffer + periodic flush) -----------------
let usageBuffer = {};
let usageFlushTimer = null;

function scheduleUsageFlush() {
    if (usageFlushTimer) return;
    usageFlushTimer = setTimeout(flushUsage, 20000);
}

function flushUsage() {
    usageFlushTimer = null;
    if (!Object.keys(usageBuffer).length) return;

    const delta = usageBuffer;
    usageBuffer = {};

    chrome.storage.local.get(["usage", "usageHistory"], data => {
        const today = new Date().toDateString();

        let usage = data.usage || {};
        if (usage.date !== today) usage = { date: today };

        let hist = data.usageHistory || {};
        if (!hist[today]) hist[today] = {};

        Object.keys(delta).forEach(key => {
            usage[key] = (usage[key] || 0) + delta[key];
            hist[today][key] = (hist[today][key] || 0) + delta[key];
        });

        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 30);
        Object.keys(hist).forEach(d => {
            if (new Date(d) < cutoff) delete hist[d];
        });

        chrome.storage.local.set({ usage, usageHistory: hist });
    });
}

chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {

        if (message.type === "GET_STATUS") {

            chrome.storage.local.get(null, (settings) => {

                sendResponse(settings);

            });

            return true;
        }

        if (message.type === "USAGE_HEARTBEAT") {

            const seconds = Number(message.seconds) || 30;
            chrome.storage.local.get(["customSites"], data => {
                const customs = data.customSites || [];
                const site = FocusGuardSites.resolve(sender.url || "", customs);
                if (site) {
                    usageBuffer[site.key] = (usageBuffer[site.key] || 0) + seconds;
                    scheduleUsageFlush();
                }
            });
            return false;
        }

        if (message.type === "UPDATE_CUSTOM_SITES") {

            const list = message.customSites || [];
            chrome.storage.local.set({ customSites: list }, () => {
                syncCustomScripts(list).then(() => {
                    sendResponse({ ok: true });
                });
            });
            return true;
        }


        if (message.type === "BLOCKED") {

            chrome.action.setBadgeText({ text: "!" });
            chrome.action.setBadgeBackgroundColor({ color: "#ff3b30" });

        }


        if (message.type === "blocked") {

            chrome.storage.local.get(
                ["stats", "advancedStats", "dailyGoal"],
                data => {

                    let stats = data.stats || {};
                    let advancedStats = data.advancedStats || {};
                    let dailyGoal = data.dailyGoal || {
                        enabled: false,
                        maxOverrides: 3,
                        currentOverrides: 0,
                        date: new Date().toDateString()
                    };

                    let today = new Date().toDateString();

                    if (!stats.date || stats.date !== today) {
                        stats = {
                            date: today,
                            youtube: 0,
                            tiktok: 0,
                            instagram: 0,
                            facebook: 0
                        };
                    }

                    if (stats[message.platform] !== undefined) {
                        stats[message.platform]++;
                    } else {
                        stats[message.platform] = 1;
                    }

                    if (!advancedStats[today]) {
                        advancedStats[today] = {
                            youtube: 0,
                            tiktok: 0,
                            instagram: 0,
                            facebook: 0,
                            total: 0
                        };
                    }

                    if (advancedStats[today][message.platform] !== undefined) {
                        advancedStats[today][message.platform]++;
                    } else {
                        advancedStats[today][message.platform] = 1;
                    }
                    advancedStats[today].total++;

                    let oldDate = dailyGoal.date;
                    if (oldDate !== today) {
                        dailyGoal.currentOverrides = 0;
                        dailyGoal.date = today;
                    }

                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    Object.keys(advancedStats).forEach(dateStr => {
                        if (new Date(dateStr) < thirtyDaysAgo) {
                            delete advancedStats[dateStr];
                        }
                    });

                    chrome.storage.local.set({
                        stats,
                        advancedStats,
                        dailyGoal
                    });

                }
            );

        }


        if (message.type === "closeTab") {

            if (sender.tab) {
                chrome.tabs.remove(sender.tab.id, () => {
                    if (chrome.runtime.lastError) {
                        console.error("Close tab failed:", chrome.runtime.lastError.message);
                    }
                });
            }

        }


        if (message.type === "POMODORO_TICK") {

            chrome.storage.local.get(["pomodoro"], data => {

                const pomo = data.pomodoro || {};
                if (!pomo.enabled || !pomo.endsAt) return;

                const now = Date.now();
                if (now >= pomo.endsAt) {

                    const newIsBreak = !pomo.isBreak;
                    const duration = newIsBreak
                        ? (pomo.breakMinutes || 5) * 60 * 1000
                        : (pomo.focusMinutes || 25) * 60 * 1000;

                    const updated = {
                        ...pomo,
                        isBreak: newIsBreak,
                        endsAt: now + duration
                    };

                    chrome.storage.local.set({ pomodoro: updated });

                    chrome.alarms.create("pomodoro-tick", { when: now + 60000 });

                }

            });

            return true;
        }


        if (message.type === "CHECK_DAILY_GOAL") {

            chrome.storage.local.get(["dailyGoal"], data => {

                const goal = data.dailyGoal || {};
                const today = new Date().toDateString();

                if (goal.date !== today) {
                    sendResponse({ reached: false });
                    return;
                }

                if (goal.enabled && goal.currentOverrides >= goal.maxOverrides) {
                    sendResponse({ reached: true });
                } else {
                    sendResponse({ reached: false });
                }

            });

            return true;
        }


        if (message.type === "INCREMENT_DAILY_GOAL") {

            chrome.storage.local.get(["dailyGoal"], data => {

                const goal = data.dailyGoal || {
                    enabled: false,
                    maxOverrides: 3,
                    currentOverrides: 0,
                    date: new Date().toDateString()
                };

                const today = new Date().toDateString();
                if (goal.date !== today) {
                    goal.currentOverrides = 0;
                    goal.date = today;
                }

                goal.currentOverrides++;

                chrome.storage.local.set({ dailyGoal: goal });

            });

        }


        if (message.type === "GET_POMODORO") {

            chrome.storage.local.get(["pomodoro"], data => {
                sendResponse(data.pomodoro || {});
            });

            return true;
        }


        if (message.type === "START_POMODORO") {

            const focusMs = (message.focusMinutes || 25) * 60 * 1000;
            const pomo = {
                enabled: true,
                focusMinutes: message.focusMinutes || 25,
                breakMinutes: message.breakMinutes || 5,
                isBreak: false,
                endsAt: Date.now() + focusMs
            };

            chrome.storage.local.set({ pomodoro: pomo }, () => {

                chrome.alarms.create("pomodoro-tick", {
                    when: Date.now() + 60000
                });

                sendResponse({ ok: true });

            });

            return true;
        }


        if (message.type === "STOP_POMODORO") {

            const pomo = {
                enabled: false,
                focusMinutes: 25,
                breakMinutes: 5,
                isBreak: false,
                endsAt: 0
            };

            chrome.storage.local.set({ pomodoro: pomo }, () => {
                chrome.alarms.clear("pomodoro-tick");
                sendResponse({ ok: true });
            });

            return true;
        }


        // Sync FocusGuard's Pomodoro with the MindSeed web app's focus timer.
        // MindSeed posts window messages that content/mindseed-bridge.js forwards
        // here, keeping the two timers in lockstep.
        if (message.type === "MINDSEED_POMODORO") {

            if (message.action === "start") {

                // Use the exact remaining time when MindSeed resumes mid-session,
                // otherwise fall back to the full focus duration.
                const remainingSecs = message.remainingSeconds || message.focusMinutes || 25;
                const focusMs = remainingSecs * 1000;
                const pomo = {
                    enabled: true,
                    focusMinutes: message.focusMinutes || 25,
                    breakMinutes: message.focusMinutes || 25,
                    isBreak: false,
                    endsAt: Date.now() + focusMs,
                    fromMindSeed: true
                };

                chrome.storage.local.set({ pomodoro: pomo }, () => {
                    chrome.alarms.create("pomodoro-tick", {
                        when: Date.now() + 60000
                    });
                    sendResponse({ ok: true });
                });

            } else {

                // pause / stop / complete -> mirror MindSeed's timer going idle,
                // so FocusGuard stops blocking distractions.
                const pomo = {
                    enabled: false,
                    focusMinutes: 25,
                    breakMinutes: 5,
                    isBreak: false,
                    endsAt: 0
                };

                chrome.storage.local.set({ pomodoro: pomo }, () => {
                    chrome.alarms.clear("pomodoro-tick");
                    sendResponse({ ok: true });
                });

            }

            return true;
        }

        if (message.type === "GET_STREAK") {

            chrome.storage.local.get(["advancedStats"], data => {

                const stats = data.advancedStats || {};
                let streak = 0;
                const today = new Date();

                for (let i = 0; i < 365; i++) {
                    const d = new Date(today);
                    d.setDate(d.getDate() - i);
                    const key = d.toDateString();

                    if (stats[key] && stats[key].total > 0) {
                        streak++;
                    } else if (i > 0) {
                        break;
                    }
                }

                sendResponse({ streak });

            });

            return true;
        }

    }
);


chrome.alarms.onAlarm.addListener((alarm) => {

    if (alarm.name === "pomodoro-tick") {

        chrome.storage.local.get(["pomodoro"], data => {

            const pomo = data.pomodoro || {};
            if (!pomo.enabled || !pomo.endsAt) return;

            const now = Date.now();
            if (now >= pomo.endsAt) {

                const newIsBreak = !pomo.isBreak;
                const duration = newIsBreak
                    ? (pomo.breakMinutes || 5) * 60 * 1000
                    : (pomo.focusMinutes || 25) * 60 * 1000;

                const updated = {
                    ...pomo,
                    isBreak: newIsBreak,
                    endsAt: now + duration
                };

                chrome.storage.local.set({ pomodoro: updated });

                chrome.alarms.create("pomodoro-tick", {
                    when: now + 60000
                });

            } else {

                chrome.alarms.create("pomodoro-tick", {
                    when: now + 60000
                });

            }

        });

    }

});
