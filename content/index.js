console.log(
    "[FocusGuard] Loaded"
);


setTimeout(()=>{


    if(
        window.FocusGuard &&
        typeof window.FocusGuard.scan === "function"
    ){


        console.log(
            "[FocusGuard] Starting blocker"
        );


        window.FocusGuard.scan();


    }
    else{


        console.log(
            "[FocusGuard] Blocker not loaded"
        );


    }


},100);