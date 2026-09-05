const TASK_STORAGE = "fg_tasks_v3";

const siteKeys = FocusGuardSites.keys();

function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme || "auto");
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
}

// --- Tasks (local, no sync) ------------------------------------------------
function getTasks() {
    try {
        return JSON.parse(localStorage.getItem(TASK_STORAGE) || "[]");
    } catch (e) {
        return [];
    }
}

function saveTasks(tasks) {
    localStorage.setItem(TASK_STORAGE, JSON.stringify(tasks));
}

function renderTasks() {
    const listEl = document.getElementById("task-list");
    const tasks = getTasks();

    listEl.innerHTML = "";

    tasks.forEach((task, idx) => {
        const row = document.createElement("div");
        row.className = "task-row";

        const check = document.createElement("input");
        check.type = "checkbox";
        check.className = "task-check";
        check.checked = !!task.done;
        check.addEventListener("change", () => {
            task.done = check.checked;
            saveTasks(tasks);
            renderTasks();
        });

        const text = document.createElement("input");
        text.type = "text";
        text.className = "task-text";
        text.value = task.text;
        text.addEventListener("change", () => {
            task.text = text.value;
            saveTasks(tasks);
        });

        const del = document.createElement("button");
        del.className = "task-del";
        del.innerHTML = "&times;";
        del.setAttribute("aria-label", "Xóa");
        del.addEventListener("click", () => {
            tasks.splice(idx, 1);
            saveTasks(tasks);
            renderTasks();
        });

        row.appendChild(check);
        row.appendChild(text);
        row.appendChild(del);
        listEl.appendChild(row);
    });
}

// --- Pomodoro --------------------------------------------------------------
function renderPomodoro() {
    chrome.runtime.sendMessage({ type: "GET_POMODORO" }, pomo => {
        const card = document.getElementById("pomo-card");
        const timerEl = document.getElementById("pomo-timer");
        const phaseEl = document.getElementById("pomo-phase");
        const progressEl = document.getElementById("pomo-progress");

        if (!pomo || !pomo.enabled || !pomo.endsAt || pomo.endsAt <= Date.now()) {
            if (card) card.style.opacity = "0";
            return;
        }

        if (card) card.style.opacity = "1";

        const now = Date.now();
        const remaining = Math.max(0, pomo.endsAt - now);
        const totalDuration = (pomo.focusMinutes || 25) * 60 * 1000;
        const totalSec = Math.ceil(remaining / 1000);
        const min = Math.floor(totalSec / 60);
        const sec = totalSec % 60;

        if (timerEl) timerEl.textContent = `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
        if (phaseEl) phaseEl.textContent = t(pomo.isBreak ? "breakTime" : "focusSession");
        if (progressEl) progressEl.style.width = Math.min(100, (remaining / totalDuration) * 100) + "%";
    });
}

// --- Today usage -----------------------------------------------------------
function renderToday() {
    chrome.storage.local.get(["usage", "budgets"], data => {
        const usage = data.usage || {};
        const budgets = data.budgets || {};
        const listEl = document.getElementById("today-list");
        const totalEl = document.getElementById("today-total");
        if (!listEl) return;

        let totalUsed = 0;
        let totalBudget = 0;
        const rows = [];

        siteKeys.forEach(key => {
            const site = FocusGuardSites.siteFor(key);
            const usedSec = usage[key] || 0;
            const min = budgets[key] != null ? budgets[key] : FocusGuardSites.DEFAULT_BUDGET_MINUTES;
            const usedMin = Math.floor(usedSec / 60);
            const pct = Math.min(100, (usedSec / (min * 60)) * 100);

            totalUsed += usedMin;
            totalBudget += min;

            rows.push(`
                <div class="today-row">
                    <div class="today-head">
                        <span class="today-name">${site.label}</span>
                        <span class="today-value ${pct >= 100 ? 'over' : ''}">${usedMin}m / ${min}m</span>
                    </div>
                    <div class="today-bar"><div class="today-bar-fill ${pct >= 100 ? 'over' : ''}" style="width:${pct}%"></div></div>
                </div>
            `);
        });

        listEl.innerHTML = rows.join("");

        if (totalEl) {
            totalEl.innerHTML = `<span>${t("todayTotal")}</span><strong>${totalUsed}m / ${totalBudget}m</strong>`;
        }
    });
}

function renderStreak() {
    chrome.runtime.sendMessage({ type: "GET_STREAK" }, result => {
        const el = document.getElementById("streak-count");
        if (el && result) el.textContent = result.streak || 0;
    });
}

// --- Init ------------------------------------------------------------------
function init() {
    chrome.storage.local.get(["newTabEnabled"], data => {
        if (data.newTabEnabled === false) {
            if (sessionStorage.getItem("fg_nt_redirected") === "1") {
                document.body.innerHTML = `<div class="nt-disabled">
                    <div class="brand"><img src="../icons/48.png" alt="FocusGuard" class="logo">
                    <span class="brand-name">FocusGuard</span></div>
                    <div id="fg_msg"></div>
                </div>`;
                document.getElementById("fg_msg").textContent = getLanguage() === "vi"
                    ? "Tab mới của FocusGuard đã tắt — vào Cài đặt để bật lại."
                    : "FocusGuard new tab is off — open its settings to turn it back on.";
                return;
            }
            sessionStorage.setItem("fg_nt_redirected", "1");
            try {
                window.location.replace("chrome://newtab/");
            } catch (e) { /* ignore */ }
            setTimeout(() => {
                if (!sessionStorage.getItem("fg_nt_redirected")) return;
                const app = document.querySelector(".home");
                if (app) app.style.display = "none";
            }, 800);
            return;
        }
        sessionStorage.removeItem("fg_nt_redirected");
        boot();
    });
}

function boot() {
    chrome.storage.local.get(["theme", "language"], data => {
        applyTheme(data.theme || "auto");
        document.documentElement.lang = data.language || "vi";
    });

    initLanguage(() => {
        applyI18n();
    });

    renderTasks();
    renderPomodoro();
    renderToday();
    renderStreak();

    setInterval(renderPomodoro, 1000);
    setInterval(renderToday, 10000);

    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === "local") {
            if (changes.theme) applyTheme(changes.theme.newValue || "auto");
            if (changes.usage || changes.budgets) renderToday();
            if (changes.newTabEnabled && changes.newTabEnabled.newValue === false) {
                window.location.replace("chrome://newtab/");
            }
        }
    });
}

// Bindings
document.getElementById("task-input").addEventListener("keydown", e => {
    if (e.key === "Enter" && e.target.value.trim()) {
        const tasks = getTasks();
        tasks.push({ text: e.target.value.trim(), done: false });
        saveTasks(tasks);
        e.target.value = "";
        renderTasks();
    }
});

document.getElementById("lang-switch").addEventListener("click", () => {
    const next = getLanguage() === "vi" ? "en" : "vi";
    saveLanguage(next);
    applyI18n();
});

document.getElementById("open-options").addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
});

document.getElementById("pause-btn").addEventListener("click", () => {
    chrome.storage.local.set({ allowUntil: Date.now() + 5 * 60 * 1000 });
});

init();