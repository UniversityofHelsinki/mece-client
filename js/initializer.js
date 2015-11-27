//Localize jQuery variable (http://alexmarandon.com/articles/web_widget_jquery/)
var meceNotifications = (function (mece) {
    var JQUERY_VERSION = '1.4.2';
    var MECE_CONTENT_DIV_ID = "#mece-content-div";
    var MECE_DEFAULT_POLLING_INTERVAL = "4000";
    var MECE_DEFAULT_CHANNELS = "";
    var LOGIN_URL = 'https://ohtu-devel.it.helsinki.fi/Shibboleth.sso/HYLogin';
    var MECE_URL = 'https://ohtu-devel.it.helsinki.fi/mece/'; // for ohtu-testi.it.helsinki.fi/meceapp
    //var MECE_URL = 'http://localhost:1337/mece'; for local development

    var jQuery;

    function loadJQuery() {
        if (window.jQuery === undefined || window.jQuery.fn.jquery !== JQUERY_VERSION) {
            var script_tag = document.createElement('script');
            var jqueryUrl = "https://ajax.googleapis.com/ajax/libs/jquery/" + JQUERY_VERSION + "/jquery.min.js";
            script_tag.setAttribute("type", "text/javascript");
            script_tag.setAttribute("src", jqueryUrl);
            if (script_tag.readyState) {
                script_tag.onreadystatechange = function () { // For old versions of IE
                    if (this.readyState == 'complete' || this.readyState == 'loaded') {
                        onJQueryLoaded();
                    }
                };
            } else { // Other browsers
                script_tag.onload = onJQueryLoaded;
            }
            // Try to find the head, otherwise default to the documentElement
            (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
        } else {
            // The jQuery version on the window is the one we want to use
            jQuery = window.jQuery;
            login();
        }
    }

    function onJQueryLoaded() {
        // Restore $ and window.jQuery to their previous values and store the
        // new jQuery in our local jQuery variable
        jQuery = window.jQuery.noConflict(true);
        login();
    }

    function login() {
        // Create a new script tag
        var iframe = document.createElement('iframe');
        iframe.style.display = "none";
        iframe.src = LOGIN_URL;
        // Call resolve when it is loaded
        iframe.addEventListener('load', function () {
            setTimeout(function () {
                init();
            }, 1000);
        }, false);
        // Reject the promise if there is an error
        iframe.addEventListener('error', function () {
            init('error');
        }, false);
        // Add it to the body
        document.body.appendChild(iframe);
    }

    function init(error) {
        mece.jQuery = jQuery;
        mece.contentDivId = MECE_CONTENT_DIV_ID;
        mece.url = MECE_URL;
        mece.pollingInterval = $(MECE_CONTENT_DIV_ID).attr("pollingInterval") || MECE_DEFAULT_POLLING_INTERVAL;
        mece.channels = $(MECE_CONTENT_DIV_ID).attr("meceChannels") || MECE_DEFAULT_CHANNELS;

        if (mece.view && !mece.view.initialized) {
            mece.view.init();
        }
        mece.initialized = true;
    }


    loadJQuery();

    return mece;

})(meceNotifications || {});

