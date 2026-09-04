const siteKeys = FocusGuardSites.keys();

const ids = ["enabled"].concat(siteKeys);

// Keep the Settings page theme in sync with storage so dark mode actually
// applies here (options.css has dark variables, but nothing was setting the
// data-theme attribute on this document).
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
    renderPlatforms();
    renderBudgets();
    renderCustomSites();
    renderUsage();
}

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local") {
        if (changes.theme) applyTheme(changes.theme.newValue || "auto");
        if (changes.usage || changes.budgets || changes.customSites || changes.usageHistory) {
            renderBudgets();
            renderCustomSites();
            renderUsage();
        }
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
        icon.innerHTML = FocusGuardIcons.iconFor(site, 18);

        const text = document.createElement("div");
        text.className = "platform-text";
        const name = document.createElement("span");
        name.className = "name";
        name.textContent = site.label;
        const desc = document.createElement("span");
        desc.className = "desc";
        desc.textContent = site.mode === "path-prefix"
            ? t("blockShortsOrPrefix")
            : t("blockAll");
        text.appendChild(name);
        text.appendChild(desc);

        info.appendChild(icon);
        info.appendChild(text);

        const label = document.createElement("label");
        label.className = "toggle";
        label.innerHTML = `<input type="checkbox" id="${key}" checked><span class="slider"></span>`;

        item.appendChild(info);
        item.appendChild(label);
        listEl.appendChild(item);
    });

    listEl.querySelectorAll("input[type=checkbox]").forEach(cb => {
        cb.addEventListener("change", () => {
            chrome.storage.local.set({ [cb.id]: cb.checked }, () => showSaved(t("saved")));
        });
    });
}

function renderBudgets() {
    const listEl = document.getElementById("budget-list");
    if (!listEl) return;

    chrome.storage.local.get(["budgets", "usage"], data => {
        const budgets = data.budgets || {};
        const usage = data.usage || {};
        const today = new Date().toDateString();
        if (usage.date !== today) usage.date = today;

        const rows = siteKeys.map(key => {
            const site = FocusGuardSites.siteFor(key);
            const min = budgets[key] != null ? budgets[key] : FocusGuardSites.DEFAULT_BUDGET_MINUTES;
            const usedMin = Math.floor((usage[key] || 0) / 60);

            return `
                <div class="budget-row">
                    <div class="budget-info">
                        <span class="budget-name">${site.label}</span>
                        <span class="budget-used ${usedMin >= min ? 'over' : ''}">${t("usedLabel")} ${usedMin}${t("minLabel")}</span>
                    </div>
                    <div class="budget-input-wrap">
                        <input type="number" class="num-input budget-input" id="budget-${key}" min="0" max="600" value="${min}" data-key="${key}" title="${t("minLabel")}">
                        <span class="budget-unit">${t("minLabel")}</span>
                    </div>
                </div>
            `;
        }).join("");

        listEl.innerHTML = rows;

        listEl.querySelectorAll(".budget-input").forEach(input => {
            const key = input.dataset.key;
            input.addEventListener("change", () => saveBudget(key, parseInt(input.value) || 0));
        });
    });
}

function saveBudget(key, value) {
    chrome.storage.local.get(["budgets"], data => {
        const budgets = data.budgets || {};
        if (value <= 0) {
            delete budgets[key];
        } else {
            budgets[key] = value;
        }
        chrome.storage.local.set({ budgets }, () => {
            showSaved(t("saved"));
        });
    });
}

function renderCustomSites() {
    const listEl = document.getElementById("custom-sites-list");
    if (!listEl) return;

    chrome.storage.local.get(["customSites", "budgets", "usage"], data => {
        const customs = data.customSites || [];
        const budgets = data.budgets || {};
        const usage = data.usage || {};

        if (!customs.length) {
            listEl.innerHTML = `<div class="empty-hint">${t("noCustomSites")}</div>`;
            return;
        }

        listEl.innerHTML = "";

        customs.forEach((c, idx) => {
            const host = c.host;
            const key = c.key || FocusGuardSites.customKey(host);
            const min = budgets[key] != null ? budgets[key] : FocusGuardSites.DEFAULT_BUDGET_MINUTES;
            const usedMin = Math.floor((usage[key] || 0) / 60);

            const row = document.createElement("div");
            row.className = "budget-row";

            row.innerHTML = `
                <div class="budget-info">
                    <span class="budget-name">${escapeHtml(c.label || host)}</span>
                    <span class="budget-used ${usedMin >= min ? 'over' : ''}">${t("usedLabel")} ${usedMin}${t("minLabel")}</span>
                </div>
                <div class="budget-input-wrap">
                    <input type="number" class="num-input budget-input custom-budget" data-host="${escapeHtml(host)}" min="0" max="600" value="${min}" title="${t("minLabel")}">
                    <span class="budget-unit">${t("minLabel")}</span>
                    <label class="toggle small">
                        <input type="checkbox" class="custom-enabled" data-host="${escapeHtml(host)}" ${c.enabled === false ? '' : 'checked'}>
                        <span class="slider"></span>
                    </label>
                    <button class="list-tag-remove custom-remove" data-host="${escapeHtml(host)}" title="${t("remove")}">&times;</button>
                </div>
            `;

            listEl.appendChild(row);
        });

        listEl.querySelectorAll(".custom-budget").forEach(input => {
            input.addEventListener("change", () => {
                const host = decodeURIComponent(input.dataset.host);
                chrome.storage.local.get(["customSites", "budgets"], data => {
                    const c = (data.customSites || []).find(x => x.host === host);
                    if (!c) return;
                    const key = c.key || FocusGuardSites.customKey(host);
                    const budgets = data.budgets || {};
                    const value = parseInt(input.value) || 0;
                    if (value <= 0) delete budgets[key];
                    else budgets[key] = value;
                    chrome.storage.local.set({ budgets }, () => showSaved(t("saved")));
                });
            });
        });

        listEl.querySelectorAll(".custom-enabled").forEach(toggle => {
            toggle.addEventListener("change", () => {
                const host = decodeURIComponent(toggle.dataset.host);
                chrome.storage.local.get(["customSites"], data => {
                    const list = data.customSites || [];
                    const c = list.find(x => x.host === host);
                    if (c) {
                        c.enabled = toggle.checked;
                        chrome.storage.local.set({ customSites: list }, () => {
                            chrome.runtime.sendMessage({ type: "UPDATE_CUSTOM_SITES", customSites: list });
                            showSaved(t("saved"));
                        });
                    }
                });
            });
        });

        listEl.querySelectorAll(".custom-remove").forEach(btn => {
            btn.addEventListener("click", () => {
                const host = decodeURIComponent(btn.dataset.host);
                removeCustomSite(host);
            });
        });
    });
}

function normalizeSiteInput(value) {
    let v = String(value || "").trim().toLowerCase();
    v = v.replace(/^https?:\/\//, "");
    v = v.replace(/\/.*$/, "");
    v = v.replace(/^www\./, "");
    return v;
}

function addCustomSite() {
    const input = document.getElementById("custom-site-input");
    const host = normalizeSiteInput(input.value);
    if (!host) return;

    chrome.storage.local.get(["customSites"], data => {
        const list = data.customSites || [];

        if (list.some(c => c.host === host)) {
            showSaved(t("savedExists"));
            return;
        }

        // Built-in registry already covers this host.
        if (FocusGuardSites.resolve(host, [])) {
            showSaved(t("savedExists"));
            return;
        }

        chrome.permissions.request({
            origins: ["*://" + host + "/*", "*://*." + host + "/*"]
        }, granted => {
            if (!granted) {
                showSaved(t("permissionDenied"));
                return;
            }

            list.push({ host, label: host, enabled: true, key: FocusGuardSites.customKey(host) });
            chrome.storage.local.set({ customSites: list }, () => {
                chrome.runtime.sendMessage({ type: "UPDATE_CUSTOM_SITES", customSites: list }, () => {
                    input.value = "";
                    renderCustomSites();
                    renderUsage();
                    showSaved(t("savedAdd"));
                });
            });
        });
    });
}

function removeCustomSite(host) {
    chrome.storage.local.get(["customSites", "budgets"], data => {
        const list = data.customSites || [];
        const next = list.filter(c => c.host !== host);
        chrome.storage.local.set({ customSites: next }, () => {
            chrome.permissions.remove({ origins: ["*://" + host + "/*", "*://*." + host + "/*"] });
            chrome.runtime.sendMessage({ type: "UPDATE_CUSTOM_SITES", customSites: next }, () => {
                renderCustomSites();
                renderUsage();
                showSaved(t("savedDelete"));
            });
        });
    });
}

function renderUsage() {
    chrome.storage.local.get(["usageHistory", "usage", "budgets"], data => {
        const hist = data.usageHistory || {};
        const usage = data.usage || {};
        const today = new Date().toDateString();

        const chartEl = document.getElementById("usage-chart");
        const summaryEl = document.getElementById("usage-summary");
        if (!chartEl || !summaryEl) return;

        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toDateString();
            const secs = (hist[key] || {});
            let total = 0;
            Object.keys(secs).forEach(k => { total += secs[k] || 0; });
            days.push({ date: d, key, total });
        }

        const max = Math.max(1, ...days.map(d => d.total));

        const lang = getLanguage() === "vi" ? "vi" : "en";

        chartEl.innerHTML = `
            <div class="chart-bars">
                ${days.map(d => `
                    <div class="chart-col">
                        <div class="chart-value">${Math.round((d.total / 60))}m</div>
                        <div class="chart-bar-wrap"><div class="chart-bar" style="height:${Math.round((d.total / max) * 100)}%"></div></div>
                        <div class="chart-label">${d.date.toLocaleDateString(lang, { weekday: "short" })}</div>
                    </div>
                `).join("")}
            </div>
        `;

        let totalToday = 0;
        siteKeys.forEach(key => { totalToday += usage[key] || 0; });

        const todayMin = Math.round(totalToday / 60);
        const weekMin = Math.round(days.reduce((a, d) => a + d.total, 0) / 60);
        const maxBudgets = Object.keys((data.budgets || {})).length
            ? Object.values(data.budgets).reduce((a, b) => a + b, 0)
            : siteKeys.length * FocusGuardSites.DEFAULT_BUDGET_MINUTES;

        const pct = Math.min(100, Math.round((todayMin / Math.max(1, maxBudgets)) * 100));

        summaryEl.innerHTML = `
            <div class="summary-row">
                <span>${t("todayTotal")}</span>
                <strong>${todayMin}${t("minLabel")}</strong>
            </div>
            <div class="summary-row">
                <span>${t("weekTotal")}</span>
                <strong>${weekMin}${t("minLabel")}</strong>
            </div>
            <div class="summary-row">
                <span>${t("budgetStatus")}</span>
                <strong>${pct}%</strong>
            </div>
            <div class="goal-bar"><div class="goal-bar-fill" style="width:${pct}%"></div></div>
        `;
    });
}

function load() {
    chrome.storage.local.get(
        [...ids, "strictMode", "pomodoro", "dailyGoal", "theme", "whitelist", "blacklist", "newTabEnabled"],
        data => {
            ids.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    el.checked = data[id] !== false;
                }
            });

            const strictEl = document.getElementById("strictMode");
            if (strictEl) strictEl.checked = data.strictMode === true;

            const newTabEl = document.getElementById("newTabEnabled");
            if (newTabEl) newTabEl.checked = data.newTabEnabled !== false;

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

            renderPlatforms();
            renderBudgets();
            renderCustomSites();
            renderUsage();
        }
    );
}

function save() {
    const settings = {};
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) settings[id] = el.checked;
    });

    const strictEl = document.getElementById("strictMode");
    if (strictEl) settings.strictMode = strictEl.checked;

    const newTabEl = document.getElementById("newTabEnabled");
    if (newTabEl) settings.newTabEnabled = newTabEl.checked;

    const pomoEnabled = document.getElementById("pomodoro-enabled");
    const pomoFocus = document.getElementById("pomo-focus");
    const pomoBreak = document.getElementById("pomo-break");
    chrome.storage.local.get(["pomodoro"], pomoData => {
        const existingPomo = pomoData.pomodoro || {};
        settings.pomodoro = {
            enabled: pomoEnabled ? pomoEnabled.checked : false,
            focusMinutes: parseInt(pomoFocus ? pomoFocus.value : 25) || 25,
            breakMinutes: parseInt(pomoBreak ? pomoBreak.value : 5) || 5,
            isBreak: existingPomo.isBreak || false,
            endsAt: existingPomo.endsAt || 0
        };

        const goalEnabled = document.getElementById("dailyGoal-enabled");
        const goalMax = document.getElementById("dailyGoal-max");
        chrome.storage.local.get(["dailyGoal"], data => {
            const existing = data.dailyGoal || {};
            const today = new Date().toDateString();
            settings.dailyGoal = {
                enabled: goalEnabled ? goalEnabled.checked : false,
                maxOverrides: parseInt(goalMax ? goalMax.value : 3) || 3,
                currentOverrides: existing.date === today ? (existing.currentOverrides || 0) : 0,
                date: existing.date === today ? existing.date : today
            };

            const themeRadio = document.querySelector('input[name="theme"]:checked');
            settings.theme = themeRadio ? themeRadio.value : "auto";

            chrome.storage.local.set(settings, () => {
                showSaved(t("saved"));
            });
        });
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
    const phase = pomo.isBreak ? t("breakTime") : t("focusSession");

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
                    showSaved(t("savedDelete"));
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
            showSaved(t("savedExists"));
            return;
        }
        list.push(value);
        chrome.storage.local.set({ [key]: list }, () => {
            renderList(containerId, list, type);
            input.value = "";
            showSaved(t("savedAdd"));
        });
    });
}


const strictEl = document.getElementById("strictMode");
if (strictEl) strictEl.addEventListener("change", save);

const newTabEnabledEl = document.getElementById("newTabEnabled");
if (newTabEnabledEl) newTabEnabledEl.addEventListener("change", save);

// Section navigation (sidebar TOC)
function showSection(id) {
    document.querySelectorAll(".options-section").forEach(sec => {
        sec.classList.toggle("active", sec.id === id);
    });
    document.querySelectorAll(".nav-item").forEach(item => {
        item.classList.toggle("active", item.dataset.nav === id.replace("sec-", ""));
    });
}

document.querySelectorAll(".nav-item").forEach(item => {
    item.addEventListener("click", () => {
        showSection("sec-" + item.dataset.nav);
    });
});

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
            showSaved(t("pomodoroStarted"));
            load();
        });
    });
}

const pomoStopBtn = document.getElementById("pomo-stop");
if (pomoStopBtn) {
    pomoStopBtn.addEventListener("click", () => {
        chrome.runtime.sendMessage({ type: "STOP_POMODORO" }, () => {
            showSaved(t("pomodoroStopped"));
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

document.getElementById("custom-site-add").addEventListener("click", addCustomSite);
document.getElementById("custom-site-input").addEventListener("keydown", e => {
    if (e.key === "Enter") addCustomSite();
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
    showSaved(t("allow5min"));
});

setInterval(() => {
    chrome.storage.local.get(["pomodoro"], data => {
        updatePomodoroStatus(data.pomodoro);
    });
}, 1000);

setInterval(() => {
    renderBudgets();
    renderUsage();
}, 10000);

const langSwitch = document.getElementById("lang-switch");
if (langSwitch) {
    langSwitch.addEventListener("click", () => {
        const next = getLanguage() === "vi" ? "en" : "vi";
        saveLanguage(next);
        applyI18n();
    });
}

initLanguage(() => {
    applyI18n();
});

load();