(function(){

let timer;


const observer =
new MutationObserver(()=>{


    clearTimeout(timer);


    timer =
    setTimeout(()=>{


        if(
            window.FocusGuard &&
            typeof window.FocusGuard.scan === "function"
        ){

            window.FocusGuard.scan();

        }


    },500);


});



observer.observe(
    document.documentElement,
    {
        childList:true,
        subtree:true
    }
);



})();