function showConfirm(platform){
    if(sessionStorage.getItem("fg_asked_" + platform)){
        return Promise.resolve(false);
    }

    sessionStorage.setItem(
        "fg_asked_" + platform,
        "true"
    );
    
    return new Promise(resolve=>{


        if(document.getElementById("fg-confirm")){
            resolve(false);
            return;
        }


        const styleExists = !!document.getElementById("fg-confirm-style");
        const style = document.createElement("style");
        style.id = "fg-confirm-style";
        if(!document.body){
            setTimeout(()=>{
                showConfirm(platform).then(resolve);
            },100);
            return;
        }

        style.textContent = `
        #fg-confirm{
            position:fixed !important;
            inset:0 !important;

            display:flex !important;
            align-items:center !important;
            justify-content:center !important;

            background:rgba(15,23,42,.68) !important;
            backdrop-filter:blur(10px) !important;

            z-index:2147483647 !important;

            font-family:"Segoe UI",Inter,Arial,sans-serif !important;
        }

        .fg-confirm-card{

            width:420px !important;
            max-width:92vw !important;

            background:#ffffff !important;
            color:#111827 !important;

            border-radius:22px !important;

            padding:34px 30px !important;

            text-align:center !important;

            box-shadow:
                0 18px 60px rgba(0,0,0,.28) !important;

            animation:fgPop .18s ease !important;
        }

        .fg-confirm-card h2{

            margin:0 0 14px !important;

            font-size:30px !important;
            font-weight:700 !important;

            color:#111827 !important;
        }

        .fg-confirm-card p{

            margin:0 0 28px !important;

            font-size:17px !important;
            line-height:1.7 !important;

            color:#4b5563 !important;
        }

        .fg-confirm-card button{

            width:100% !important;

            padding:14px 18px !important;

            margin-top:12px !important;

            border:none !important;
            border-radius:14px !important;

            font-size:16px !important;
            font-weight:600 !important;

            cursor:pointer !important;

            transition:
                transform .15s,
                background .15s,
                opacity .15s !important;
        }

        .fg-confirm-card button:hover:not(:disabled){

            transform:translateY(-1px) !important;

        }

        .fg-confirm-card button:active:not(:disabled){

            transform:scale(.98) !important;

        }

        #fg-allow{

            background:#2563eb !important;
            color:white !important;

        }

        #fg-allow:hover:not(:disabled){

            background:#1d4ed8 !important;

        }

        #fg-back{

            background:#f3f4f6 !important;
            color:#111827 !important;

        }

        #fg-back:hover{

            background:#e5e7eb !important;

        }

        #fg-allow:disabled{

            background:#cbd5e1 !important;
            color:#64748b !important;

            cursor:not-allowed !important;

        }

        @keyframes fgPop{

            from{

                opacity:0;
                transform:translateY(12px) scale(.96);

            }

            to{

                opacity:1;
                transform:translateY(0) scale(1);

            }

        }
        `;

        if(!styleExists){
            document.head.appendChild(style);
        }


        const box =
        document.createElement("div");


        box.id="fg-confirm";


        box.innerHTML=`

        <div class="fg-confirm-card">

            <h2>FocusGuard</h2>

            <p>
            Bạn có chắc muốn lướt ${platform}?
            </p>


            <button id="fg-back">
            Quay lại
            </button>


            <button id="fg-allow" disabled>
            Chờ 30s...
            </button>

        </div>

        `;



        document.body.appendChild(box);
        let time = 30;

        const keyHandler = (e) => {

            if (e.key === "Escape") {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                return;
            }

            if (e.key === "F5") {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                return;
            }

            if (
                (e.ctrlKey || e.metaKey) &&
                e.key.toLowerCase() === "r"
            ) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
            }

        };

        document.addEventListener(
            "keydown",
            keyHandler,
            true
        );
        
        const allowBtn =
        document.getElementById("fg-allow");

        document.removeEventListener(
            "keydown",
            keyHandler,
            true
        );

        const timer =
        setInterval(()=>{

            time--;


            if(time <= 0){

                clearInterval(timer);


                allowBtn.disabled = false;

                allowBtn.textContent =
                "Xem tiếp 10 phút";


            }
            else{

                allowBtn.textContent =
                `Chờ ${time}s...`;

            }


        },1000);

        document.removeEventListener(
            "keydown",
            keyHandler,
            true
        );

        document.getElementById("fg-back").onclick = () => {
            clearInterval(timer);
            box.remove();
            chrome.runtime.sendMessage({ type: "closeTab" });
            resolve(false);
        };

        document.getElementById("fg-allow").onclick = () => {
            clearInterval(timer);
            chrome.storage.local.get(["override"], data => {
                let override = data.override || {};
                override[platform] = Date.now() + 10 * 60 * 1000; // 10 minutes
                chrome.storage.local.set({ override }, () => {
                    box.remove();
                    resolve(true);
                });
            });
        };

        

    })};

