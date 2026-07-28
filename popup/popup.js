const ids = [
    "enabled",
    "youtube",
    "tiktok",
    "instagram",
    "facebook"
];



function load(){


    chrome.storage.local.get(
        ids,
        data=>{


            ids.forEach(id=>{


                document
                .getElementById(id)
                .checked =
                data[id] !== false;


            });


        }
    );


}



function save(id){


    const value =
    document
    .getElementById(id)
    .checked;



    chrome.storage.local.set({

        [id]: value

    });


}



ids.forEach(id=>{


    document
    .getElementById(id)
    .addEventListener(
        "change",
        ()=>save(id)
    );


});
chrome.storage.local.get(
["stats"],
(data)=>{


    const stats =
    data.stats || {};


    document
    .getElementById("stats")
    .innerHTML = `

    🛡 Đã chặn:

    <br>

    YouTube Shorts:
    ${stats.youtube || 0}

    <br>

    TikTok:
    ${stats.tiktok || 0}

    <br>

    Instagram:
    ${stats.instagram || 0}

    <br>

    Facebook:
    ${stats.facebook || 0}

    `;


});

load();