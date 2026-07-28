const ids = [
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



function save(){


    const settings = {};


    ids.forEach(id=>{


        settings[id] =
        document
        .getElementById(id)
        .checked;


    });



    chrome.storage.local.set(
        settings,
        ()=>{

            document
            .getElementById("saved")
            .textContent =
            "Đã lưu";


            setTimeout(()=>{

                document
                .getElementById("saved")
                .textContent="";

            },1500);

        }
    );

}



ids.forEach(id=>{


    document
    .getElementById(id)
    .addEventListener(
        "change",
        save
    );


});




document
.getElementById("allow")
.addEventListener(
    "click",
    ()=>{


        chrome.storage.local.set({

            allowUntil:
            Date.now()
            +
            5*60*1000

        });


        document
        .getElementById("saved")
        .textContent =
        "Đã mở 5 phút";


    }
);



load();