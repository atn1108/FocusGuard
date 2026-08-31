const ids = [
    "youtube",
    "tiktok",
    "instagram",
    "facebook"
];

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
        }
    );
}

function showSaved(text) {
    const el = document.getElementById("saved");
    el.textContent = text;
    setTimeout(() => {
        if (el.textContent === text) {
            el.textContent = "";
        }
    }, 1800);
}

function save() {
    const settings = {};
    ids.forEach(id => {
        settings[id] = document.getElementById(id).checked;
    });

    chrome.storage.local.set(settings, () => {
        showSaved("Đã lưu");
    });
}

ids.forEach(id => {
    document.getElementById(id).addEventListener("change", save);
});

document.getElementById("allow").addEventListener("click", () => {
    chrome.storage.local.set({
        allowUntil: Date.now() + 5 * 60 * 1000
    });
    showSaved("Đã mở 5 phút");
});

load();
