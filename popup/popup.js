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

ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener("change", () => save(id));
    }
});

load();
loadStats();
