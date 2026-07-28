chrome.runtime.onInstalled.addListener(() => {

    chrome.storage.local.get(
        [
            "enabled",
            "youtube",
            "tiktok"
        ],
        (data) => {

            if (data.enabled === undefined) {

                chrome.storage.local.set({

                    enabled:true,

                    youtube:true,

                    tiktok:true,

                    instagram:true,

                    facebook:true,

                    allowUntil:0

                });

            }

        }
    );

});


chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {

        if (message.type === "GET_STATUS") {

            chrome.storage.local.get(
                null,
                (settings) => {

                    sendResponse(settings);

                }
            );

            return true;
        }


        if (message.type === "BLOCKED") {

            chrome.action.setBadgeText({
                text: "!"
            });

            chrome.action.setBadgeBackgroundColor({
                color: "#ff3b30"
            });

        }

    }
);

chrome.runtime.onMessage.addListener(
(message)=>{


    if(
        message.type === "blocked"
    ){

        chrome.storage.local.get(
        ["stats"],
        data=>{


            let stats =
            data.stats || {};


            stats[message.platform] =
            (stats[message.platform] || 0)+1;


            chrome.storage.local.set({
                stats
            });


        });


    }


});

chrome.runtime.onMessage.addListener((message, sender) => {

    if (message.type !== "closeTab") {
        return;
    }

    console.log("Close request:", sender.tab);

    chrome.tabs.remove(sender.tab.id, () => {

        if (chrome.runtime.lastError) {
            console.error(
                "Close tab failed:",
                chrome.runtime.lastError.message
            );
        } else {
            console.log("Tab closed");
        }

    });

});

chrome.runtime.onMessage.addListener(
(message, sender) => {

    if(message.type==="blocked"){

    chrome.storage.local.get(
    ["stats"],
    data=>{

        let stats =
        data.stats || {};

        let today =
        new Date().toDateString();


        if(!stats.date || stats.date !== today){

            stats={
                date:today,
                youtube:0,
                tiktok:0,
                instagram:0,
                facebook:0
            };

        }


        stats[message.platform]++;


        chrome.storage.local.set({
            stats
        });

    });

}})

