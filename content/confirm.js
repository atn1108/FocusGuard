// FocusGuard v3 confirmation overlay.
// showConfirm(siteKey, siteLabel, strictMode, reason, budget)
//   - reason is one of: "strict" | "goal" | "budget" | null (both force no-override)
//   - returns Promise<boolean>  -> true when the user may continue

function isContextValid() {
    try {
        return !!chrome && !!chrome.storage && !!chrome.runtime && !!chrome.runtime.id;
    } catch (e) {
        return false;
    }
}

function showConfirm(siteKey, siteLabel, strictMode, reason, budget) {

    if (!isContextValid()) {
        return Promise.resolve(false);
    }

    if (sessionStorage.getItem("fg_asked_" + siteKey)) {
        return Promise.resolve(false);
    }

    sessionStorage.setItem("fg_asked_" + siteKey, "true");

    return new Promise(resolve => {

        if (document.getElementById("fg-confirm")) {
            resolve(false);
            return;
        }

        const style = document.createElement("style");
        style.id = "fg-confirm-style";

        if (!document.body) {
            setTimeout(() => {
                showConfirm(siteKey, siteLabel, strictMode, reason, budget).then(resolve);
            }, 100);
            return;
        }

        const noOverride = !!(strictMode || reason);

        style.textContent = `
        #fg-confirm {
            position: fixed !important;
            inset: 0 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            background: rgba(4, 47, 46, .62) !important;
            backdrop-filter: blur(12px) !important;
            z-index: 2147483647 !important;
            font-family: Raleway, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
        }

        .fg-confirm-card {
            width: 420px !important;
            max-width: 92vw !important;
            background: linear-gradient(180deg, #ffffff 0%, #f0fdfa 100%) !important;
            color: #134e4a !important;
            border-radius: 24px !important;
            padding: 34px 30px !important;
            text-align: center !important;
            box-shadow: 0 24px 80px rgba(4, 47, 46, .35) !important;
            border: 1px solid rgba(13, 148, 136, .22) !important;
            animation: fgPop .28s cubic-bezier(.22, 1, .36, 1) !important;
        }

        .fg-confirm-card h2 {
            margin: 0 0 4px !important;
            font-size: 26px !important;
            font-weight: 700 !important;
            letter-spacing: -.4px !important;
            color: #134e4a !important;
        }

        .fg-site-label {
            font-size: 13px !important;
            font-weight: 600 !important;
            color: #0d9488 !important;
            margin-bottom: 12px !important;
        }

        .fg-badge {
            display: inline-block !important;
            padding: 4px 12px !important;
            border-radius: 999px !important;
            font-size: 11px !important;
            font-weight: 700 !important;
            margin-bottom: 14px !important;
            text-transform: uppercase !important;
            letter-spacing: .6px !important;
        }

        .fg-badge.strict { background: #fef2f2 !important; color: #dc2626 !important; }
        .fg-badge.goal  { background: #fff7ed !important; color: #ea580c !important; }
        .fg-badge.budget{ background: #fff4ed !important; color: #c2410c !important; }

        .fg-confirm-card p {
            margin: 0 auto 6px !important;
            font-size: 16px !important;
            line-height: 1.65 !important;
            color: #115e59 !important;
            max-width: 320px !important;
        }

        .fg-confirm-card .fg-subtext {
            margin: 0 auto 18px !important;
            font-size: 13px !important;
            color: #5b8b83 !important;
            line-height: 1.55 !important;
            max-width: 320px !important;
        }

        .fg-confirm-card button {
            width: 100% !important;
            padding: 14px 18px !important;
            margin-top: 12px !important;
            border: none !important;
            border-radius: 14px !important;
            font-size: 15px !important;
            font-weight: 600 !important;
            cursor: pointer !important;
            font-family: Raleway, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
            transition: transform .15s, background .15s, opacity .15s, box-shadow .15s !important;
        }

        .fg-confirm-card button:hover:not(:disabled) { transform: translateY(-1px) !important; }
        .fg-confirm-card button:active:not(:disabled) { transform: scale(.98) !important; }

        #fg-allow {
            background: linear-gradient(135deg, #0d9488, #14b8a6) !important;
            color: #fff !important;
            box-shadow: 0 6px 18px rgba(13, 148, 136, .35) !important;
        }
        #fg-allow:hover:not(:disabled) { box-shadow: 0 10px 26px rgba(13, 148, 136, .45) !important; }

        #fg-back {
            background: #e6fff7 !important;
            color: #0f766e !important;
        }
        #fg-back:hover { background: #ccfbf1 !important; }

        #fg-allow:disabled {
            background: #e6eef0 !important;
            color: #8fb3ae !important;
            cursor: not-allowed !important;
            box-shadow: none !important;
        }

        #fg-allow.hidden-btn { display: none !important; }
        #fg-back.only-btn { margin-top: 0 !important; }

        .fg-timer-ring {
            width: 96px !important;
            height: 96px !important;
            margin: 8px auto 6px !important;
            position: relative !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
        }

        .fg-timer-ring svg { transform: rotate(-90deg) !important; }
        .fg-timer-ring circle { fill: none !important; stroke-width: 6 !important; }

        .fg-ring-bg { stroke: #ccfbf1 !important; }

        .fg-ring-progress {
            stroke: #0d9488 !important;
            stroke-linecap: round !important;
            transition: stroke-dashoffset 1s linear !important;
        }

        .fg-breathe {
            position: absolute !important;
            inset: 0 !important;
            border-radius: 999px !important;
            background: radial-gradient(circle, rgba(13,148,136,.16) 0%, rgba(13,148,136,0) 70%) !important;
            animation: fgBreathe 4s ease-in-out infinite !important;
            pointer-events: none !important;
        }

        .fg-timer-text {
            position: relative !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            min-width: 3ch !important;
            font-size: 26px !important;
            font-weight: 700 !important;
            font-variant-numeric: tabular-nums !important;
            color: #134e4a !important;
            letter-spacing: -.3px !important;
        }

        .fg-reasons {
            display: flex !important;
            gap: 8px !important;
            justify-content: center !important;
            flex-wrap: wrap !important;
            margin: 0 0 2px !important;
        }

        .fg-reason {
            border: 1px solid #99f6e4 !important;
            background: #ffffff !important;
            color: #0f766e !important;
            border-radius: 999px !important;
            padding: 8px 14px !important;
            font-size: 13px !important;
            font-weight: 600 !important;
            cursor: pointer !important;
            transition: all .15s !important;
            font-family: inherit !important;
            margin: 0 !important;
        }

        .fg-reason:hover { border-color: #0d9488 !important; transform: translateY(-1px) !important; }
        .fg-reason.selected {
            background: #0d9488 !important;
            border-color: #0d9488 !important;
            color: #ffffff !important;
            box-shadow: 0 4px 12px rgba(13, 148, 136, .3) !important;
        }

        @keyframes fgPop {
            from { opacity: 0; transform: translateY(16px) scale(.96); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes fgBreathe {
            0%, 100% { transform: scale(.92); opacity: .55; }
            50%      { transform: scale(1.12); opacity: 1; }
        }
        `;

        document.head.appendChild(style);

        const box = document.createElement("div");
        box.id = "fg-confirm";

        const circumference = 2 * Math.PI * 35;
        const countdownTime = strictMode ? 60 : 30;
        let time = countdownTime;

        const label = siteLabel || siteKey;

        let badgeHTML = "";
        if (strictMode || reason === "strict") {
            badgeHTML = `<div class="fg-badge strict">${__fg_t("badgeStrict")}</div>`;
        } else if (reason === "goal") {
            badgeHTML = `<div class="fg-badge goal">${__fg_t("badgeGoal")}</div>`;
        } else if (reason === "budget") {
            badgeHTML = `<div class="fg-badge budget">${__fg_t("badgeBudget")}</div>`;
        }

        let subtext = "";
        if (strictMode || reason === "strict") {
            subtext = __fg_t("strictMsg");
        } else if (reason === "goal") {
            subtext = __fg_t("goalMsg");
        } else if (reason === "budget") {
            subtext = __fg_t("budgetMsg").replace("{label}", label);
        } else {
            subtext = __fg_t("askMsg").replace("{label}", label);
        }

        box.innerHTML = `
        <div class="fg-confirm-card">
            <h2>FocusGuard</h2>
            <div class="fg-site-label">${label}</div>
            ${badgeHTML}
            <p>${subtext}</p>

            <div class="fg-timer-ring">
                <div class="fg-breathe"></div>
                <svg width="96" height="96" viewBox="0 0 96 96">
                    <circle class="fg-ring-bg" cx="48" cy="48" r="35"/>
                    <circle class="fg-ring-progress" cx="48" cy="48" r="35"
                        stroke-dasharray="${circumference}"
                        stroke-dashoffset="0"
                        id="fg-ring"/>
                </svg>
                <div class="fg-timer-text" id="fg-timer-text">${time}s</div>
            </div>

            <div class="fg-reasons" id="fg-reasons">
                <button type="button" class="fg-reason" data-reason="bored">${__fg_t("whyBored")}</button>
                <button type="button" class="fg-reason" data-reason="avoid">${__fg_t("whyAvoid")}</button>
                <button type="button" class="fg-reason" data-reason="habit">${__fg_t("whyHabit")}</button>
            </div>

            <div class="fg-subtext">${__fg_t("lockMsg")}</div>

            <button id="fg-back">${__fg_t("goBack")}</button>
            <button id="fg-allow" disabled class="${noOverride ? 'hidden-btn' : ''}">${__fg_t("continueWait")} ${countdownTime}s</button>
        </div>
        `;

        document.body.appendChild(box);

        const allowBtn = document.getElementById("fg-allow");
        const backBtn = document.getElementById("fg-back");
        const ringEl = document.getElementById("fg-ring");
        const timerText = document.getElementById("fg-timer-text");
        const reasonsBox = document.getElementById("fg-reasons");

        let chosenReason = null;
        let decided = null;

        if (reasonsBox) {
            reasonsBox.querySelectorAll(".fg-reason").forEach(btn => {
                btn.addEventListener("click", () => {
                    chosenReason = btn.dataset.reason;
                    reasonsBox.querySelectorAll(".fg-reason").forEach(b => b.classList.remove("selected"));
                    btn.classList.add("selected");
                });
            });
        }

        if (noOverride) {
            backBtn.classList.add("only-btn");
        }

        const keyHandler = (e) => {
            if (e.key === "Escape" || e.key === "F5" || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "r")) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
            }
        };

        document.addEventListener("keydown", keyHandler, true);

        function cleanUp(allowed) {
            clearInterval(timer);
            document.removeEventListener("keydown", keyHandler, true);
            box.remove();
            document.getElementById("fg-confirm-style")?.remove();
            saveReflection(allowed);
        }

        // Log why the user was here so weekly reports (v3.2) can surface patterns.
        function saveReflection(allowed) {
            if (!isContextValid()) return;
            const stamp = new Date();
            const dateStr = stamp.toISOString().slice(0, 10);
            chrome.storage.local.get(["microJournal"], data => {
                const journal = data.microJournal || {};
                if (journal.date !== dateStr) {
                    journal.date = dateStr;
                    journal.entries = [];
                }
                journal.entries = journal.entries || [];
                journal.entries.push({
                    site: siteKey,
                    reason: chosenReason || "none",
                    decided: allowed ? "continue" : "back",
                    ts: stamp.toISOString()
                });
                if (journal.entries.length > 400) {
                    journal.entries.splice(0, journal.entries.length - 400);
                }
                chrome.storage.local.set({ microJournal: journal });
            });
        }

        const timer = setInterval(() => {
            time--;

            const progress = 1 - (time / countdownTime);
            ringEl.setAttribute("stroke-dashoffset", circumference * progress);

            if (time <= 0) {
                clearInterval(timer);

                if (noOverride) {
                    decided = "back";
                    cleanUp(false);
                    if (isContextValid()) {
                        chrome.runtime.sendMessage({ type: "closeTab" });
                    }
                    resolve(false);
                    return;
                }

                allowBtn.disabled = false;
                allowBtn.textContent = __fg_t("continue10");
                timerText.textContent = "0s";
            } else {
                timerText.textContent = time + "s";
                if (!noOverride) {
                    allowBtn.textContent = __fg_t("continueWait") + " " + time + "s";
                }
            }
        }, 1000);

        backBtn.onclick = () => {
            decided = "back";
            cleanUp(false);
            if (isContextValid()) {
                chrome.runtime.sendMessage({ type: "closeTab" });
            }
            resolve(false);
        };

        if (!noOverride) {
            allowBtn.onclick = () => {
                if (!isContextValid()) {
                    resolve(false);
                    return;
                }
                decided = "continue";
                cleanUp(true);

                chrome.storage.local.get(["override", "dailyGoal"], data => {
                    let override = data.override || {};
                    override[siteKey] = Date.now() + 10 * 60 * 1000;

                    let dailyGoal = data.dailyGoal || {};
                    const today = new Date().toDateString();
                    if (dailyGoal.date !== today) {
                        dailyGoal.currentOverrides = 0;
                        dailyGoal.date = today;
                    }
                    dailyGoal.currentOverrides++;

                    chrome.storage.local.set({ override, dailyGoal }, () => {
                        resolve(true);
                    });
                });
            };
        }

    });
}

// --- tiny i18n for the overlay ------------------------------------------------
(function () {
    const dict = {
        vi: {
            badgeStrict: "Chế độ nghiêm ngặt",
            badgeGoal: "Đã hết giới hạn hôm nay",
            badgeBudget: "Đã hết thời lượng",
            strictMsg: "Bạn đang ở chế độ nghiêm ngặt — không thể bỏ qua. Hít thở rồi quay lại.",
            goalMsg: "Bạn đã đạt giới hạn bypass hôm nay. Quay lại để giữ thói quen tốt.",
            budgetMsg: "Bạn đã dùng hết thời lượng {label} hôm nay. Quay lại để giữ cân bằng.",
            askMsg: "Bạn có chắc muốn lướt {label}?",
            whyBored: "Buồn chán",
            whyAvoid: "Trốn việc",
            whyHabit: "Thói quen",
            lockMsg: "Chọn lý do phía trên rồi quyết định sau đếm ngược",
            goBack: "Quay lại",
            continueWait: "Chờ",
            continue10: "Xem tiếp 10 phút"
        },
        en: {
            badgeStrict: "Strict mode",
            badgeGoal: "Daily limit reached",
            badgeBudget: "Time budget used up",
            strictMsg: "Strict mode is on — no bypass. Breathe, then go back.",
            goalMsg: "You've used today's bypass limit. Go back to keep the habit.",
            budgetMsg: "You've used up today's {label} budget. Step back to stay balanced.",
            askMsg: "Do you really want to scroll {label}?",
            whyBored: "Bored",
            whyAvoid: "Avoiding work",
            whyHabit: "Habit",
            lockMsg: "Pick a reason above, then decide once the timer ends",
            goBack: "Go back",
            continueWait: "Wait",
            continue10: "Continue for 10 minutes"
        }
    };

    let lang = "vi";
    window.__fg_t = function (key) {
        return (dict[lang] && dict[lang][key]) || key;
    };

    try {
        chrome.storage.local.get(["language"], data => {
            lang = (data.language || "vi") === "en" ? "en" : "vi";
        });
    } catch (e) { /* storage unavailable */ }
})();