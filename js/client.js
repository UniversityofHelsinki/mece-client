var MECE_DEFAULT_POLLING_INTERVAL = "4000";
var MECE_DEFAULT_CHANNELS = "";
var MECE_CONTENT_DIV_ID = "#mece-content-div";
var MECE_CHANNEL_SEPARATOR = ",";
var JQUERY_VERSION = '1.4.2';
var meceNotifications = {};
var LOGIN_URL = 'https://ohtu-devel.it.helsinki.fi/Shibboleth.sso/HYLogin';

meceNotifications.view = (function () {
    var $;

    function init(jQuery) {
        $ = $ || jQuery;
        $(MECE_CONTENT_DIV_ID).append("<ul/>");
    }

    function add(notifications) {
        var ulList = $(MECE_CONTENT_DIV_ID).find("ul");
        $.each(notifications, function (i, n) {
            ulList.append($("<li>").attr("id", "MN" + i).attr("class", "meceNotification").append(n));
        });
    }

    return {
        init: init,
        add: add
    };

})();

meceNotifications.client = (function (view) {
    var $;

    var meceNotifiactionUrlTest = 'https://ohtu-devel.it.helsinki.fi/mece/api/notifications/test';
    var meceNotifiactionUrl = 'https://ohtu-devel.it.helsinki.fi/mece/notifications/view/new/fi';
    var meceNotifiactionChannelUrl = 'https://ohtu-devel.it.helsinki.fi/mece/channel/notifications/';
    var meceLocalHostNotificationUrl = 'http://localhost:1337/mece/mece/notifications/view/new/fi';
    var meceLocalHostUrl = 'http://localhost:1337/mece';
    var meceOhtuDevelUrl = 'https://ohtu-devel.it.helsinki.fi/mece/';
    var startingTime = '0';
    var notifications = [];
    var meceChannels = MECE_DEFAULT_CHANNELS;
    var mecePollingInterval = MECE_DEFAULT_POLLING_INTERVAL;

    function init(jQuery) {
        $ = $ || jQuery;
        mecePollingInterval = $(MECE_CONTENT_DIV_ID).attr("pollingInterval") || MECE_DEFAULT_POLLING_INTERVAL;
        meceChannels = $(MECE_CONTENT_DIV_ID).attr("meceChannels") || MECE_DEFAULT_CHANNELS;

        addIframe(LOGIN_URL).then(function () {
            // Wait for login stuff to finish
            setTimeout(function () {
                start();
            }, 1000);
        }, function (error) {
            console.error("Failed!", error);
        });
    }

    function addIframe(url) {
        var iframePromise = new Promise(function (resolve, reject) {
            // Create a new script tag
            var iframe = document.createElement('iframe');
            iframe.style.display = "none";
            iframe.src = url;
            // Call resolve when it is loaded
            iframe.addEventListener('load', function () {
                resolve(url);
            }, false);

            // Reject the promise if there is an error
            iframe.addEventListener('error', function () {
                reject(url);
            }, false);

            // Add it to the body
            document.body.appendChild(iframe);
        });

        // Return the Promise
        return iframePromise;
    }

    function markNotificationRead(notificationId) {
        console.log("Not implemented. markNotificationRead" + notificationId);
    }

    function meceHelloWorld() {
        return "Hello world!";
    }

    function getNotificationsByChannels() {

        var noauth = false; //TODO: Aleksi a temporary workaround for the local authentication

        var query = noauth ? {} : {channelNames: meceChannels.split(MECE_CHANNEL_SEPARATOR)};

        if (startingTime !== '0') {
            query.startingTime = startingTime;
        }

        var url = noauth
            ? meceLocalHostUrl + "/channels/" + meceChannels + "/notifications?" + jQuery.param(query)
            : meceLocalHostUrl + "/notifications?" + $.param(query); // MECE-348:

        return new Promise(
            function (resolve, reject) {
                var req = new XMLHttpRequest();
                req.open('GET', url);
                req.withCredentials = true;
                req.onload = function () {
                    if (req.status == 200) {
                        resolve(req.response);
                    } else {
                        reject(Error(req.statusText));
                    }
                };
                req.onerror = function () {
                    reject(Error("Network Error"));
                };
                req.send();
            });
    }

    function start() {
        // TODO: interval cancellation in error cases
        setInterval(function () {
            getNotificationsByChannels().then(function (response) {
                var temps = JSON.parse(response);
                if (temps.length > 0) {
                    startingTime = temps[temps.length - 1].received;
                    view.add(temps.map(function (n) {
                        return (n.heading + ":" + n.message);
                    }));
                }
            }, function (error) {
                console.error("Failed to add new notification(s) to the list!", error);
            });
        }, mecePollingInterval);
    }

    return {
        meceHelloWorld: meceHelloWorld,
        markNotificationSeen: markNotificationRead,
        init: init,
        start: start
    };
})(meceNotifications.view);

// BEGING: Localize jQuery variable (http://alexmarandon.com/articles/web_widget_jquery/)

(function () {

    var jQuery;

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
        init();
    }

    function onJQueryLoaded() {
        // Restore $ and window.jQuery to their previous values and store the
        // new jQuery in our local jQuery variable
        jQuery = window.jQuery.noConflict(true);
        init();
    }

    function init() {
        meceNotifications.view.init(jQuery);
        meceNotifications.client.init(jQuery);
    }
})();

// END: Localize jQuery variable

