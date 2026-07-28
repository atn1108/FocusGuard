(function(){

let currentURL = location.href;


function checkURL(){

    if(location.href !== currentURL){

        currentURL = location.href;


        if(window.FocusGuard){

            window.FocusGuard.scan();

        }

    }

}



const pushState = history.pushState;


history.pushState = function(){

    pushState.apply(
        history,
        arguments
    );

    checkURL();

};



const replaceState = history.replaceState;


history.replaceState = function(){

    replaceState.apply(
        history,
        arguments
    );

    checkURL();

};



window.addEventListener(
    "popstate",
    checkURL
);


})();