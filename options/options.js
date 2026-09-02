const ids = [
    "youtube",
    "tiktok",
    "instagram",
    "facebook"
];

// Keep the Settings page theme in sync with storage so dark mode actually
// applies here (options.css has dark variables, but nothing was setting the
// data-theme attribute on this document).
function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme || "auto");
}

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local") {
        if (changes.theme) applyTheme(changes.theme.newValue || "auto");
    }
});

function showSaved(text) {
    const el = document.getElementById("saved");
    el.textContent = text;
    setTimeout(() => {
        if (el.textContent === text) {
            el.textContent = "";
        }
    }, 1800);
}

function load() {
    chrome.storage.local.get(
        [...ids, "strictMode", "pomodoro", "dailyGoal", "theme", "whitelist", "blacklist"],
        data => {
            ids.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    el.checked = data[id] !== false;
                }
            });

            const strictEl = document.getElementById("strictMode");
            if (strictEl) strictEl.checked = data.strictMode === true;

            const pomo = data.pomodoro || {};
            const pomoEnabled = document.getElementById("pomodoro-enabled");
            const pomoSettings = document.getElementById("pomo-settings");
            if (pomoEnabled) {
                pomoEnabled.checked = pomo.enabled === true;
                pomoSettings.style.display = pomo.enabled ? "block" : "none";
            }
            const pomoFocus = document.getElementById("pomo-focus");
            const pomoBreak = document.getElementById("pomo-break");
            if (pomoFocus) pomoFocus.value = pomo.focusMinutes || 25;
            if (pomoBreak) pomoBreak.value = pomo.breakMinutes || 5;

            updatePomodoroStatus(pomo);

            const goal = data.dailyGoal || {};
            const goalEnabled = document.getElementById("dailyGoal-enabled");
            const goalSettings = document.getElementById("goal-settings");
            if (goalEnabled) {
                goalEnabled.checked = goal.enabled === true;
                goalSettings.style.display = goal.enabled ? "block" : "none";
            }
            const goalMax = document.getElementById("dailyGoal-max");
            if (goalMax) goalMax.value = goal.maxOverrides || 3;

            const themeRadio = document.querySelector(`input[name="theme"][value="${data.theme || 'auto'}"]`);
            if (themeRadio) themeRadio.checked = true;

            applyTheme(data.theme || "auto");

            const wl = data.whitelist || [];
            renderList("whitelist-items", wl, "whitelist");

            const bl = data.blacklist || [];
            renderList("blacklist-items", bl, "blacklist");
        }
    );
}

function save() {
    const settings = {};
    ids.forEach(id => {
        settings[id] = document.getElementById(id).checked;
    });

    const strictEl = document.getElementById("strictMode");
    if (strictEl) settings.strictMode = strictEl.checked;

    const pomoEnabled = document.getElementById("pomodoro-enabled");
    const pomoFocus = document.getElementById("pomo-focus");
    const pomoBreak = document.getElementById("pomo-break");
    settings.pomodoro = {
        enabled: pomoEnabled ? pomoEnabled.checked : false,
        focusMinutes: parseInt(pomoFocus ? pomoFocus.value : 25) || 25,
        breakMinutes: parseInt(pomoBreak ? pomoBreak.value : 5) || 5,
        isBreak: false,
        endsAt: 0
    };

    const goalEnabled = document.getElementById("dailyGoal-enabled");
    const goalMax = document.getElementById("dailyGoal-max");
    settings.dailyGoal = {
        enabled: goalEnabled ? goalEnabled.checked : false,
        maxOverrides: parseInt(goalMax ? goalMax.value : 3) || 3,
        currentOverrides: 0,
        date: new Date().toDateString()
    };

    const themeRadio = document.querySelector('input[name="theme"]:checked');
    settings.theme = themeRadio ? themeRadio.value : "auto";

    chrome.storage.local.set(settings, () => {
        showSaved("Đã lưu");
    });
}

function updatePomodoroStatus(pomo) {
    const statusText = document.getElementById("pomo-status-text");
    const startBtn = document.getElementById("pomo-start");
    const stopBtn = document.getElementById("pomo-stop");

    if (!pomo || !pomo.enabled || !pomo.endsAt) {
        if (statusText) statusText.textContent = "";
        if (startBtn) startBtn.style.display = "inline-flex";
        if (stopBtn) stopBtn.style.display = "none";
        return;
    }

    const now = Date.now();
    const remaining = Math.max(0, pomo.endsAt - now);
    const min = Math.floor(remaining / 60000);
    const sec = Math.floor((remaining % 60000) / 1000);
    const phase = pomo.isBreak ? "Nghỉ giải lao" : "Tập trung";

    if (statusText) {
        statusText.textContent = `${phase}: ${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    }
    if (startBtn) startBtn.style.display = "none";
    if (stopBtn) stopBtn.style.display = "inline-flex";
}


function renderList(containerId, items, type) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";

    items.forEach((item, idx) => {
        const tag = document.createElement("span");
        tag.className = "list-tag";
        tag.innerHTML = `
            ${escapeHtml(item)}
            <button class="list-tag-remove" data-idx="${idx}" data-type="${type}">&times;</button>
        `;
        container.appendChild(tag);
    });

    container.querySelectorAll(".list-tag-remove").forEach(btn => {
        btn.addEventListener("click", () => {
            const idx = parseInt(btn.dataset.idx);
            const t = btn.dataset.type;
            const key = t === "whitelist" ? "whitelist" : "blacklist";
            chrome.storage.local.get([key], data => {
                const list = data[key] || [];
                list.splice(idx, 1);
                chrome.storage.local.set({ [key]: list }, () => {
                    renderList(containerId, list, t);
                    showSaved("Đã xóa");
                });
            });
        });
    });
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

function addToList(type) {
    const inputId = type === "whitelist" ? "whitelist-input" : "blacklist-input";
    const input = document.getElementById(inputId);
    const value = input.value.trim();
    if (!value) return;

    const key = type === "whitelist" ? "whitelist" : "blacklist";
    const containerId = type === "whitelist" ? "whitelist-items" : "blacklist-items";

    chrome.storage.local.get([key], data => {
        const list = data[key] || [];
        if (list.includes(value)) {
            showSaved("Đã tồn tại");
            return;
        }
        list.push(value);
        chrome.storage.local.set({ [key]: list }, () => {
            renderList(containerId, list, type);
            input.value = "";
            showSaved("Đã thêm");
        });
    });
}


ids.forEach(id => {
    document.getElementById(id).addEventListener("change", save);
});

const strictEl = document.getElementById("strictMode");
if (strictEl) strictEl.addEventListener("change", save);

const pomoEnabledEl = document.getElementById("pomodoro-enabled");
if (pomoEnabledEl) {
    pomoEnabledEl.addEventListener("change", () => {
        const settings = document.getElementById("pomo-settings");
        settings.style.display = pomoEnabledEl.checked ? "block" : "none";
        save();
    });
}

const pomoFocusEl = document.getElementById("pomo-focus");
const pomoBreakEl = document.getElementById("pomo-break");
if (pomoFocusEl) pomoFocusEl.addEventListener("change", save);
if (pomoBreakEl) pomoBreakEl.addEventListener("change", save);

const pomoStartBtn = document.getElementById("pomo-start");
if (pomoStartBtn) {
    pomoStartBtn.addEventListener("click", () => {
        const focus = parseInt(document.getElementById("pomo-focus").value) || 25;
        const brk = parseInt(document.getElementById("pomo-break").value) || 5;

        chrome.runtime.sendMessage({
            type: "START_POMODORO",
            focusMinutes: focus,
            breakMinutes: brk
        }, () => {
            showSaved("Pomodoro đã bắt đầu");
            load();
        });
    });
}

const pomoStopBtn = document.getElementById("pomo-stop");
if (pomoStopBtn) {
    pomoStopBtn.addEventListener("click", () => {
        chrome.runtime.sendMessage({ type: "STOP_POMODORO" }, () => {
            showSaved("Pomodoro đã dừng");
            load();
        });
    });
}

const goalEnabledEl = document.getElementById("dailyGoal-enabled");
if (goalEnabledEl) {
    goalEnabledEl.addEventListener("change", () => {
        const settings = document.getElementById("goal-settings");
        settings.style.display = goalEnabledEl.checked ? "block" : "none";
        save();
    });
}

const goalMaxEl = document.getElementById("dailyGoal-max");
if (goalMaxEl) goalMaxEl.addEventListener("change", save);

document.getElementById("whitelist-add").addEventListener("click", () => addToList("whitelist"));
document.getElementById("blacklist-add").addEventListener("click", () => addToList("blacklist"));

document.getElementById("whitelist-input").addEventListener("keydown", e => {
    if (e.key === "Enter") addToList("whitelist");
});
document.getElementById("blacklist-input").addEventListener("keydown", e => {
    if (e.key === "Enter") addToList("blacklist");
});

document.querySelectorAll('input[name="theme"]').forEach(radio => {
    radio.addEventListener("change", () => {
        applyTheme(radio.value);
        save();
    });
});

document.getElementById("allow").addEventListener("click", () => {
    chrome.storage.local.set({
        allowUntil: Date.now() + 5 * 60 * 1000
    });
    showSaved("Đã mở 5 phút");
});

setInterval(() => {
    chrome.storage.local.get(["pomodoro"], data => {
        updatePomodoroStatus(data.pomodoro);
    });
}, 1000);

load();
