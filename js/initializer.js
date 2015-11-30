var MECE_JQUERY_VERSION = '1.4.2';
var MECE_LOGIN_URL = 'https://ohtu-devel.it.helsinki.fi/Shibboleth.sso/HYLogin';
//var MECE_URL = 'https://ohtu-devel.it.helsinki.fi/mece/'; // for ohtu-testi.it.helsinki.fi/meceapp
var MECE_URL = 'http://localhost:1337/mece'; //for local development
var MECE_NOAUTH = true;

var meceNotifications = (function (mece) {

    mece.contentDivId = "#mece-content-div";
    mece.iconId = "#meceIcon";
    mece.url = MECE_URL;
    mece.jQuery = null;

    function init() {
        console.log("initializer::init");
        if (mece.initializer && !mece.initializer.initialized) {
            $ = $ || mece.jQuery;
            $(mece.contentDivId).append("<ul/>");
            loadJQuery();
            mece.initializer.initialized = true;
            console.log("initializer::init OK");
        }
    }

    function loadJQuery() {
        console.log("initializer::loadJQuery");
        if (window.jQuery === undefined || window.jQuery.fn.jquery !== MECE_JQUERY_VERSION) {
            var script_tag = document.createElement('script');
            script_tag.setAttribute("type", "text/javascript");
            script_tag.setAttribute("src", "https://ajax.googleapis.com/ajax/libs/jquery/" + MECE_JQUERY_VERSION + "/jquery.min.js");
            if (script_tag.readyState) {
                script_tag.onreadystatechange = function () { // For old versions of IE
                    if (this.readyState == 'complete' || this.readyState == 'loaded') {
                        onJQueryLoaded();
                    }
                };
            } else { // Other browsers
                script_tag.onload = onJQueryLoaded;
            }
            (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
        } else {
            // The jQuery version on the window is the one we want to use
            mece.jQuery = window.jQuery;
            login();
        }
    }

    function onJQueryLoaded() {
        console.log("initializer::onJQueryLoaded");
        // Restore $ and window.jQuery to their previous values and store the
        // new jQuery in our local jQuery variable
        mece.jQuery = window.jQuery.noConflict(true);
        console.log("onJQueryLoaded:        jQuery.fn.jquery: " + mece.jQuery.fn.jquery);
        console.log("onJQueryLoaded: window.jQuery.fn.jquery: " + window.jQuery.fn.jquery);
        mece.initializer.jqueryLoaded = true;
        loginIfWithShibbo();
    }

    function loginIfWithShibbo() {
        console.log("initializer::loginIfWithShibbo");
        if(!MECE_NOAUTH) {
            login();
        }
        else {
            mece.view.init();
        }
    }

    function login() {
        console.log("initializer::login");
        // Create a new script tag
        var iframe = document.createElement('iframe');
        iframe.style.display = "none";
        iframe.src = MECE_LOGIN_URL;
        // Call resolve when it is loaded
        iframe.addEventListener('load', function () {
            setTimeout(function () {
                console.log("initializer::login OK");
                mece.view.init();
            }, 1000);
        }, false);
        // Reject the promise if there is an error
        iframe.addEventListener('error', function () {
            console.log("initializer::login ERROR");
        }, false);
        // Add it to the body
        document.body.appendChild(iframe);
    }

    (function bootstrap() {
        console.log("initializer::bootstrap");
        mece.initializer = { init: init};
        mece.initializer.init();
    }());

    return mece;

})(meceNotifications || {});

