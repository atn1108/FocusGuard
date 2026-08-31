const ids = [
    "enabled",
    "youtube",
    "tiktok",
    "instagram",
    "facebook"
];

const statKeys = {
    youtube: "stat-youtube",
    tiktok: "stat-tiktok",
    instagram: "stat-instagram",
    facebook: "stat-facebook"
};

const overrideIds = {
    youtube: "cd-youtube",
    tiktok: "cd-tiktok",
    instagram: "cd-instagram",
    facebook: "cd-facebook"
};

function applyEnabledState(enabled) {
    document.body.classList.toggle("disabled", !enabled);
}

function load() {
    chrome.storage.local.get(
        ids,
        data => {
            ids.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    el.checked = data[id] !== false;
                }
            });
            applyEnabledState(data.enabled !== false);
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

function loadStats() {
    chrome.storage.local.get(["stats"], data => {
        const stats = data.stats || {};
        Object.keys(statKeys).forEach(key => {
            const el = document.getElementById(statKeys[key]);
            if (el) {
                el.textContent = stats[key] || 0;
            }
        });
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
        Object.keys(overrideIds).forEach(platform => {
            const el = document.getElementById(overrideIds[platform]);
            const until = override[platform];
            if (until && now < until) {
                el.textContent = "✅ " + formatRemaining(until - now);
                el.classList.add("active");
            } else {
                el.textContent = "";
                el.classList.remove("active");
            }
        });
    });
}

ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener("change", () => save(id));
    }
});

load();
loadStats();
updateCountdowns();
setInterval(updateCountdowns, 1000);
