function showConfirm(platform, strictMode, dailyGoalReached) {

    if (sessionStorage.getItem("fg_asked_" + platform)) {
        return Promise.resolve(false);
    }

    sessionStorage.setItem("fg_asked_" + platform, "true");

    return new Promise(resolve => {

        if (document.getElementById("fg-confirm")) {
            resolve(false);
            return;
        }

        const style = document.createElement("style");
        style.id = "fg-confirm-style";

        if (!document.body) {
            setTimeout(() => {
                showConfirm(platform, strictMode, dailyGoalReached).then(resolve);
            }, 100);
            return;
        }

        const noOverride = strictMode || dailyGoalReached;

        style.textContent = `
        #fg-confirm {
            position: fixed !important;
            inset: 0 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            background: rgba(15, 23, 42, .68) !important;
            backdrop-filter: blur(10px) !important;
            z-index: 2147483647 !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
        }

        .fg-confirm-card {
            width: 420px !important;
            max-width: 92vw !important;
            background: #ffffff !important;
            color: #111827 !important;
            border-radius: 22px !important;
            padding: 34px 30px !important;
            text-align: center !important;
            box-shadow: 0 18px 60px rgba(0,0,0,.28) !important;
            animation: fgPop .18s ease !important;
        }

        .fg-confirm-card h2 {
            margin: 0 0 8px !important;
            font-size: 28px !important;
            font-weight: 700 !important;
            color: #111827 !important;
        }

        .fg-badge {
            display: inline-block !important;
            padding: 3px 10px !important;
            border-radius: 20px !important;
            font-size: 11px !important;
            font-weight: 700 !important;
            margin-bottom: 14px !important;
            text-transform: uppercase !important;
            letter-spacing: 0.5px !important;
        }

        .fg-badge.strict {
            background: #fef2f2 !important;
            color: #dc2626 !important;
        }

        .fg-badge.goal {
            background: #fff7ed !important;
            color: #ea580c !important;
        }

        .fg-confirm-card p {
            margin: 0 0 6px !important;
            font-size: 17px !important;
            line-height: 1.7 !important;
            color: #4b5563 !important;
        }

        .fg-confirm-card .fg-subtext {
            margin: 0 0 24px !important;
            font-size: 13px !important;
            color: #9ca3af !important;
            line-height: 1.5 !important;
        }

        .fg-confirm-card button {
            width: 100% !important;
            padding: 14px 18px !important;
            margin-top: 12px !important;
            border: none !important;
            border-radius: 14px !important;
            font-size: 16px !important;
            font-weight: 600 !important;
            cursor: pointer !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
            transition: transform .15s, background .15s, opacity .15s !important;
        }

        .fg-confirm-card button:hover:not(:disabled) {
            transform: translateY(-1px) !important;
        }

        .fg-confirm-card button:active:not(:disabled) {
            transform: scale(.98) !important;
        }

        #fg-allow {
            background: #2563eb !important;
            color: white !important;
        }

        #fg-allow:hover:not(:disabled) {
            background: #1d4ed8 !important;
        }

        #fg-back {
            background: #f3f4f6 !important;
            color: #111827 !important;
        }

        #fg-back:hover {
            background: #e5e7eb !important;
        }

        #fg-allow:disabled {
            background: #cbd5e1 !important;
            color: #64748b !important;
            cursor: not-allowed !important;
        }

        #fg-allow.hidden-btn {
            display: none !important;
        }

        #fg-back.only-btn {
            margin-top: 0 !important;
        }

        .fg-timer-ring {
            width: 80px !important;
            height: 80px !important;
            margin: 0 auto 16px !important;
            position: relative !important;
        }

        .fg-timer-ring svg {
            transform: rotate(-90deg) !important;
        }

        .fg-timer-ring circle {
            fill: none !important;
            stroke-width: 6 !important;
        }

        .fg-timer-ring .fg-ring-bg {
            stroke: #e5e7eb !important;
        }

        .fg-timer-ring .fg-ring-progress {
            stroke: #2563eb !important;
            stroke-linecap: round !important;
            transition: stroke-dashoffset 1s linear !important;
        }

        .fg-timer-text {
            position: absolute !important;
            inset: 0 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            font-size: 22px !important;
            font-weight: 700 !important;
            color: #111827 !important;
        }

        @keyframes fgPop {
            from {
                opacity: 0;
                transform: translateY(12px) scale(.96);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }
        `;

        document.head.appendChild(style);

        const box = document.createElement("div");
        box.id = "fg-confirm";

        const circumference = 2 * Math.PI * 34;
        const countdownTime = strictMode ? 60 : 30;
        let time = countdownTime;

        let badgeHTML = "";
        if (strictMode) {
            badgeHTML = `<div class="fg-badge strict">Chế độ nghiêm ngặt</div>`;
        } else if (dailyGoalReached) {
            badgeHTML = `<div class="fg-badge goal">Đã hết giới hạn hôm nay</div>`;
        }

        let subtext = "";
        if (strictMode) {
            subtext = `Bạn đã bật chế độ nghiêm ngặt. Không thể bỏ qua trong ${countdownTime} giây.`;
        } else if (dailyGoalReached) {
            subtext = `Bạn đã đạt giới hạn ${countdownTime} lần bypass hôm nay. Quay lại để giữ thói quen tốt.`;
        } else {
            subtext = `Bạn có chắc muốn lướt ${platform}?`;
        }

        box.innerHTML = `
        <div class="fg-confirm-card">
            <h2>FocusGuard</h2>
            ${badgeHTML}
            <p>${subtext}</p>

            <div class="fg-timer-ring">
                <svg width="80" height="80" viewBox="0 0 80 80">
                    <circle class="fg-ring-bg" cx="40" cy="40" r="34"/>
                    <circle class="fg-ring-progress" cx="40" cy="40" r="34"
                        stroke-dasharray="${circumference}"
                        stroke-dashoffset="0"
                        id="fg-ring"/>
                </svg>
                <div class="fg-timer-text" id="fg-timer-text">${time}s</div>
            </div>

            <button id="fg-back">
                Quay lại
            </button>

            <button id="fg-allow" disabled class="${noOverride ? 'hidden-btn' : ''}">
                Chờ ${countdownTime}s...
            </button>
        </div>
        `;

        document.body.appendChild(box);

        const allowBtn = document.getElementById("fg-allow");
        const backBtn = document.getElementById("fg-back");
        const ringEl = document.getElementById("fg-ring");
        const timerText = document.getElementById("fg-timer-text");

        if (noOverride) {
            backBtn.classList.add("only-btn");
        }

        const keyHandler = (e) => {
            if (e.key === "Escape") {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                return;
            }
            if (e.key === "F5") {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                return;
            }
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "r") {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
            }
        };

        document.addEventListener("keydown", keyHandler, true);

        const timer = setInterval(() => {
            time--;

            const progress = 1 - (time / countdownTime);
            const offset = circumference * progress;
            ringEl.setAttribute("stroke-dashoffset", offset);

            if (time <= 0) {
                clearInterval(timer);
                document.removeEventListener("keydown", keyHandler, true);

                if (!noOverride) {
                    allowBtn.disabled = false;
                    allowBtn.textContent = "Xem tiếp 10 phút";
                }
                timerText.textContent = "0s";
            } else {
                timerText.textContent = time + "s";
                if (!noOverride) {
                    allowBtn.textContent = `Chờ ${time}s...`;
                }
            }
        }, 1000);

        backBtn.onclick = () => {
            clearInterval(timer);
            document.removeEventListener("keydown", keyHandler, true);
            box.remove();
            chrome.runtime.sendMessage({ type: "closeTab" });
            resolve(false);
        };

        if (!noOverride) {
            allowBtn.onclick = () => {
                clearInterval(timer);
                document.removeEventListener("keydown", keyHandler, true);

                chrome.storage.local.get(["override"], data => {
                    let override = data.override || {};
                    override[platform] = Date.now() + 10 * 60 * 1000;
                    chrome.storage.local.set({ override }, () => {

                        chrome.runtime.sendMessage({ type: "INCREMENT_DAILY_GOAL" });

                        box.remove();
                        resolve(true);
                    });
                });
            };
        }

    });
}
