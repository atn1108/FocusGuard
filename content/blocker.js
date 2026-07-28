console.log("[FocusGuard] blocker.js START");

window.onerror = function(msg, url, line){
    console.log(
        "[FocusGuard ERROR]",
        msg,
        "line:",
        line
    );
};

(function(){

    let lastBlockedUrl = "";
    let blocking = false;
    let running = false;

async function checkOverride(platform){

    return new Promise(resolve=>{

        chrome.storage.local.get(
            ["override"],
            data=>{

                const override =
                data.override || {};


                resolve(
                    override[platform] &&
                    Date.now() <
                    override[platform]
                );

            }
        );

    });

}

async function requestBlock(platform){

    console.log(
    "FocusGuard request:",
    platform
    );
    const allowed =
    await checkOverride(platform);


    if(allowed){

        return false;

    }


    const result =
    await showConfirm(platform);


    return !result;

}

function getSetting(name){

    return new Promise(resolve=>{

        chrome.storage.local.get(
            [name],
            data=>{

                resolve(
                    data[name] !== false
                );

            }
        );

    });

}


function isEnabled(){

    return new Promise(resolve=>{

        chrome.storage.local.get(
            ["enabled"],
            data=>{

                resolve(
                    data.enabled !== false
                );

            }
        );

    });

}


function isAllowedTemporarily(){

    return new Promise(resolve => {

        chrome.storage.local.get(
            ["allowUntil"],
            data => {

                if(
                    data.allowUntil &&
                    Date.now() < data.allowUntil
                ){
                    resolve(true);
                }
                else{
                    resolve(false);
                }

            }
        );

    });

}

function blockReelsLinks(){

    document
    .querySelectorAll("a")
    .forEach(link=>{

        const href = link.href || "";


        if(
            href.includes("instagram.com/reel") ||
            href.includes("instagram.com/reels") ||
            href.includes("facebook.com/reel") ||
            href.includes("facebook.com/reels")
        ){

            link.addEventListener(
                "click",
                e=>{

                    e.preventDefault();
                    e.stopPropagation();


                    if(
                        href.includes("instagram")
                    ){

                        window.location.href =
                        "https://www.instagram.com/";

                    }
                    else{

                        window.location.href =
                        "https://www.facebook.com/";

                    }

                },
                true
            );


        }

    });

}

window.FocusGuardScan = async function scan(){

    if(running)
        return;

    running = true;
    const enabled = await isEnabled();

    if(!enabled){
        const overlay = document.getElementById("focusguard-overlay");
        if(overlay) overlay.remove();
        running = false;
        return;
    }

    blockReelsLinks();
    const allowed = await isAllowedTemporarily();
    if(allowed){
        running = false;
        return;
    }

    const host = location.hostname;
    const path = location.pathname;

    // Instagram Reels
    if (host.includes("instagram.com") && (path.startsWith("/reel") || path.startsWith("/reels"))){
        chrome.runtime.sendMessage({ type: "BLOCKED" });
        window.location.href = "https://www.instagram.com/";
        running = false;
        return;
    }

    // Facebook Reels
    if (host.includes("facebook.com") && (path.includes("/reel") || path.includes("/reels"))){
        chrome.runtime.sendMessage({ type: "BLOCKED" });
        window.location.href = "https://www.facebook.com/";
        running = false;
        return;
    }

    document.querySelectorAll("a").forEach(a=>{
        const href = a.href || "";
        if(href.includes("/reel") || href.includes("/reels")){
            a.remove();
        }
    });

    // YouTube Shorts
    if(host.includes("youtube.com") && await getSetting("youtube")){
        if(location.pathname.startsWith("/shorts")){
            if(lastBlockedUrl === location.href){
                running = false;
                return;
            }

            lastBlockedUrl = location.href;

            if(window.FG_BLOCKING){
                running = false;
                return;
            }

            window.FG_BLOCKING = true;
            console.log("FG: request youtube");
            const shouldBlock = await requestBlock("youtube");
            if(shouldBlock){
                chrome.runtime.sendMessage({ type: "blocked", platform: "youtube" });
            }

            running = false;
            return;
        }

        document.querySelectorAll("a[href^='/shorts']").forEach(el=>{
            el.style.display = "none";
        });
    }

    // TikTok
if (host.includes("tiktok.com") && await getSetting("tiktok")) {

    if (window.FG_BLOCKING) {
        running = false;
        return;
    }

    window.FG_BLOCKING = true;

    const shouldBlock = await requestBlock("tiktok");

    window.FG_BLOCKING = false;

    if (shouldBlock) {

        chrome.runtime.sendMessage({
            type: "blocked",
            platform: "tiktok"
        });

        running = false;
        return;
    }

    running = false;
    return;
}

    // Instagram (other routes)
    if(host.includes("instagram.com") && await getSetting("instagram")){
        if(await requestBlock("instagram")){
            chrome.runtime.sendMessage({ type: "blocked", platform: "instagram" });
            running = false;
            return;
        }
    }

    if((location.pathname.startsWith("/reel") || location.pathname.startsWith("/reels"))){
        chrome.runtime.sendMessage({ type: "BLOCKED" });
        window.location.href = "https://www.instagram.com/";
        running = false;
        return;
    }

    // Facebook (other routes)
    if(host.includes("facebook.com") && await getSetting("facebook")){
        if(await requestBlock("facebook")){
            chrome.runtime.sendMessage({ type: "blocked", platform: "facebook" });
            running = false;
            return;
        }
    }

    if(location.pathname.includes("/reel") || location.pathname.includes("/reels")){
        chrome.runtime.sendMessage({ type: "BLOCKED" });
        window.location.href = "https://www.facebook.com/";
        running = false;
        return;
    }

    running = false;
}

console.log("[FocusGuard] Blocker loaded");
window.FocusGuard =
window.FocusGuard || {};

window.FocusGuard.scan =
window.FocusGuardScan;

console.log(
    "FG export:",
    typeof window.FocusGuard.scan
);
})();