const siteKeys = FocusGuardSites.keys();

const toggleIds = ["enabled"].concat(siteKeys);

function applyEnabledState(enabled) {
    document.body.classList.toggle("disabled", !enabled);
}

function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
}

function applyI18n() {
    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.dataset.i18n;
        const text = t(key);
        if (el.tagName === "INPUT") {
            el.placeholder = text;
        } else {
            el.textContent = text;
        }
    });
    const label = document.getElementById("lang-label");
    if (label) label.textContent = getLanguage() === "vi" ? "VI" : "EN";
    renderPlatforms();
    renderToday();
    renderStats();
}

function renderPlatforms() {
    const listEl = document.getElementById("platform-list");
    if (!listEl) return;

    listEl.innerHTML = "";

    siteKeys.forEach(key => {
        const site = FocusGuardSites.siteFor(key);

        const item = document.createElement("div");
        item.className = "platform-item";

        const info = document.createElement("div");
        info.className = "platform-info";

        const icon = document.createElement("div");
        icon.className = "platform-icon " + site.brand;
        icon.innerHTML = FocusGuardIcons.iconFor(site, 16);

        const name = document.createElement("span");
        name.className = "platform-name";
        name.textContent = site.label;

        info.appendChild(icon);
        info.appendChild(name);

        const right = document.createElement("div");
        right.className = "platform-right";

        const cd = document.createElement("span");
        cd.className = "countdown";
        cd.id = "cd-" + key;

        const label = document.createElement("label");
        label.className = "toggle small";
        label.innerHTML = `<input type="checkbox" id="${key}" checked><span class="slider"></span>`;

        right.appendChild(cd);
        right.appendChild(label);

        item.appendChild(info);
        item.appendChild(right);
        listEl.appendChild(item);
    });

    toggleIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener("change", () => save(id));
    });
}

function load() {
    chrome.storage.local.get(
        [...toggleIds, "strictMode", "theme", "pomodoro", "dailyGoal"],
        data => {
            toggleIds.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    el.checked = data[id] !== false;
                }
            });

            applyEnabledState(data.enabled !== false);

            const strictEl = document.getElementById("strictMode");
            if (strictEl) strictEl.checked = data.strictMode === true;

            applyTheme(data.theme || "auto");

            updatePomodoroDisplay(data.pomodoro);
            updateDailyGoalDisplay(data.dailyGoal);

            renderPlatforms();
            renderToday();
            renderStats();
        }
    );
}

function save(id) {
    const value = document.getElementById(id).checked;
    chrome.storage.local.set({ [id]: value }, () => {
        if (id === "enabled") {
            applyEnabledState(value);
        }
    });
}

function renderStats() {
    chrome.storage.local.get(["stats"], data => {
        const stats = data.stats || {};
        const grid = document.getElementById("stats");
        if (!grid) return;

        grid.innerHTML = "";

        siteKeys.forEach(key => {
            const card = document.createElement("div");
            card.className = "stat-card";

            const value = document.createElement("div");
            value.className = "stat-value";
            value.id = "stat-" + key;
            value.textContent = stats[key] || 0;

            const labelEl = document.createElement("div");
            labelEl.className = "stat-label";
            const site = FocusGuardSites.siteFor(key);
            labelEl.textContent = (site ? site.label : key).split(" ")[0];

            card.appendChild(value);
            card.appendChild(labelEl);
            grid.appendChild(card);
        });
    });
}

function loadStats() {
    renderStats();
}

function loadStreak() {
    chrome.runtime.sendMessage({ type: "GET_STREAK" }, result => {
        const el = document.getElementById("streak-count");
        if (el && result) {
            el.textContent = result.streak || 0;
        }
    });
}

function formatRemaining(ms) {
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}p ${s}s`;
}

function updateCountdowns() {
    chrome.storage.local.get(["override"], data => {
        const override = data.override || {};
        const now = Date.now();
        siteKeys.forEach(key => {
            const el = document.getElementById("cd-" + key);
            const until = override[key];
            if (el) {
                if (until && now < until) {
                    el.textContent = formatRemaining(until - now);
                    el.classList.add("active");
                } else {
                    el.textContent = "";
                    el.classList.remove("active");
                }
            }
        });
    });
}

function renderToday() {
    const listEl = document.getElementById("today-list");
    if (!listEl) return;

    chrome.storage.local.get(["usage", "budgets"], data => {
        const usage = data.usage || {};
        const budgets = data.budgets || {};
        const rows = [];
        let totalUsed = 0;
        let totalBudget = 0;

        siteKeys.forEach(key => {
            const usedSec = usage[key] || 0;
            const min = budgets[key] != null ? budgets[key] : FocusGuardSites.DEFAULT_BUDGET_MINUTES;
            const usedMin = Math.floor(usedSec / 60);
            const site = FocusGuardSites.siteFor(key);

            totalUsed += usedMin;
            totalBudget += min;

            const pct = Math.min(100, (usedSec / (min * 60)) * 100);

            rows.push(`
                <div class="today-row">
                    <div class="today-head">
                        <span class="today-name">${site ? site.label : key}</span>
                        <span class="today-value ${pct >= 100 ? 'over' : ''}">${usedMin}m / ${min}m</span>
                    </div>
                    <div class="today-bar"><div class="today-bar-fill ${pct >= 100 ? 'over' : ''}" style="width:${pct}%"></div></div>
                </div>
            `);
        });

        listEl.innerHTML = rows.join("") +
            `<div class="today-total">
                <span>${t("todayTotal")}</span>
                <strong>${totalUsed}m <span class="today-sep">/</span> ${totalBudget}m</strong>
            </div>`;
    });
}

function updatePomodoroDisplay(pomo) {
    const section = document.getElementById("pomodoro-section");
    if (!section) return;

    pomo = pomo || {};
    if (!pomo.enabled || !pomo.endsAt || pomo.endsAt <= Date.now()) {
        section.style.display = "none";
        return;
    }

    section.style.display = "block";

    const now = Date.now();
    const remaining = Math.max(0, pomo.endsAt - now);
    const totalDuration = pomo.isBreak
        ? (pomo.breakMinutes || 5) * 60 * 1000
        : (pomo.focusMinutes || 25) * 60 * 1000;

    const totalSec = Math.ceil(remaining / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;

    const phase = document.getElementById("pomo-phase");
    const timer = document.getElementById("pomo-timer");
    const progress = document.getElementById("pomo-progress");
    const source = document.getElementById("pomo-source");

    if (phase) {
        phase.textContent = pomo.isBreak ? t("breakTime") : t("focusSession");
    }
    if (timer) {
        timer.textContent = `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    }
    if (progress) {
        const pct = Math.max(0, Math.min(100, (remaining / totalDuration) * 100));
        progress.style.width = pct + "%";
        progress.style.background = pomo.isBreak ? "#16a34a" : "#2563eb";
    }
    if (source) {
        source.style.display = pomo.fromMindSeed ? "" : "none";
    }
}

function updateDailyGoalDisplay(goal) {
    const section = document.getElementById("daily-goal-section");
    if (!section) return;

    goal = goal || {};
    if (!goal.enabled) {
        section.style.display = "none";
        return;
    }

    const today = new Date().toDateString();
    if (goal.date !== today) {
        goal.currentOverrides = 0;
    }

    section.style.display = "block";

    const current = goal.currentOverrides || 0;
    const max = goal.maxOverrides || 3;

    const currentEl = document.getElementById("goal-current");
    const maxEl = document.getElementById("goal-max");
    const fill = document.getElementById("goal-bar-fill");

    if (currentEl) currentEl.textContent = current;
    if (maxEl) maxEl.textContent = max;
    if (fill) {
        const pct = Math.min(100, (current / max) * 100);
        fill.style.width = pct + "%";
        if (pct >= 100) {
            fill.style.background = "#dc2626";
        } else if (pct >= 70) {
            fill.style.background = "#ea580c";
        } else {
            fill.style.background = "#2563eb";
        }
    }
}


toggleIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener("change", () => save(id));
    }
});

const strictEl = document.getElementById("strictMode");
if (strictEl) {
    strictEl.addEventListener("change", () => {
        chrome.storage.local.set({ strictMode: strictEl.checked });
    });
}

const themeSwitch = document.getElementById("theme-switch");
if (themeSwitch) {
    themeSwitch.addEventListener("click", () => {
        chrome.storage.local.get(["theme"], data => {
            const current = data.theme || "auto";
            const themes = ["auto", "light", "dark"];
            const idx = themes.indexOf(current);
            const next = themes[(idx + 1) % themes.length];
            chrome.storage.local.set({ theme: next }, () => {
                applyTheme(next);
            });
        });
    });
}

const openOptions = document.getElementById("open-options");
if (openOptions) {
    openOptions.addEventListener("click", e => {
        e.preventDefault();
        chrome.runtime.openOptionsPage();
    });
}

const langSwitch = document.getElementById("lang-switch");
if (langSwitch) {
    langSwitch.addEventListener("click", () => {
        const next = getLanguage() === "vi" ? "en" : "vi";
        saveLanguage(next);
        applyI18n();
        updatePomodoroDisplayNow();
    });
}

function updatePomodoroDisplayNow() {
    chrome.storage.local.get(["pomodoro"], data => {
        updatePomodoroDisplay(data.pomodoro);
    });
}

initLanguage(() => {
    applyI18n();
});

load();
loadStreak();
updateCountdowns();
setInterval(updateCountdowns, 1000);
setInterval(renderToday, 5000);

setInterval(() => {
    chrome.storage.local.get(["pomodoro"], data => {
        updatePomodoroDisplay(data.pomodoro);
    });
}, 1000);

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local") {
        if (changes.dailyGoal) {
            updateDailyGoalDisplay(changes.dailyGoal.newValue);
        }
        if (changes.pomodoro) {
            updatePomodoroDisplay(changes.pomodoro.newValue);
        }
        if (changes.usage || changes.budgets) {
            renderToday();
        }
    }
});