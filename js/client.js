var MECE_DEFAULT_POLLING_INTERVAL = "4000";
var MECE_DEFAULT_CHANNELS = "";
var MECE_CONTENT_DIV_ID = "#mece-content-div";
var MECE_CHANNEL_SEPARATOR = ",";
var JQUERY_VERSION = '1.4.2';
var meceNotifications = {};

meceNotifications.view = (function () {

    function init() {
        jQuery(MECE_CONTENT_DIV_ID).append("<ul/>");
    }

    function add(notifications) {
        console.log("BEGIN: " + "add");
        var ulList = jQuery(MECE_CONTENT_DIV_ID).find("ul");
        $.each(notifications, function(i, n) {
            ulList.append(jQuery("<li>").attr("id", "MN" + i).attr("class", "meceNotification").append(n));
        });
    }

    return {
        init: init,
        add: add
    };

})();

meceNotifications.client = (function (view) {
    var meceNotifiactionUrlTest = 'https://ohtu-devel.it.helsinki.fi/mece/api/notifications/test';
    var meceNotifiactionUrl = 'https://ohtu-devel.it.helsinki.fi/mece/notifications/view/new/fi';
    var meceNotifiactionChannelUrl = 'https://ohtu-devel.it.helsinki.fi/mece/channel/notifications/';
    var meceLocalHostNotificationUrl = 'http://localhost:1337/mece/mece/notifications/view/new/fi';
    var meceLocalHostUrl = 'http://localhost:1337/mece/';
    var startingTime = '0';
    var notifications = [];
    var meceChannels = MECE_DEFAULT_CHANNELS;
    var mecePollingInterval = MECE_DEFAULT_POLLING_INTERVAL;

    function init() {
        mecePollingInterval = jQuery(MECE_CONTENT_DIV_ID).attr("pollingInterval") || MECE_DEFAULT_POLLING_INTERVAL;
        meceChannels = jQuery(MECE_CONTENT_DIV_ID).attr("meceChannels") || MECE_DEFAULT_CHANNELS;
    }

    function markNotificationRead(notificationId) {
        console.log("Not implemented. markNotificationRead" + notificationId);
    }
    function meceHelloWorld() {
        return "Hello world!";
    }
    function getNotificationsByChannels() {
        console.log("BEGIN: " + "getNotificationsByChannels");

        var url = meceLocalHostUrl + "notifications?" +
            jQuery.param({channelNames: meceChannels.split(MECE_CHANNEL_SEPARATOR)}); // MECE-348: 
        
        if (startingTime !== '0') {
            url = url + '?startingTime=' + startingTime;
        }

        return new Promise(function (resolve, reject) {
            var req = new XMLHttpRequest();
            req.open('GET', url);
            req.onload = function () {
                if (req.status == 200) {
                    handleResponse_new(req.response);

                    resolve();
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

    function handleResponse_new(response) {
        console.log("BEGIN: " + "handleResponse_new");
        var temps = JSON.parse(response);
        if (temps.length > 0) {
            startingTime = temps[temps.length - 1].received;
            meceNotifications.view.add(temps.map(function(n){
                return(n.heading + ":" + n.message);
            }));
        }
    }
        
    function start() {
        // TODO: interval cancellation in error cases
        setInterval(function () {
            getNotificationsByChannels().then(function () {
                meceNotifications.view.add(notifications);
            }, function (error) {
                console.error("Failed!", error);
            });
        }, mecePollingInterval);
    };

    return {
        markNotificationSeen: markNotificationRead,
        init: init,
        start: start
    };
})(meceNotifications.view);

// BEGING: Localize jQuery variable (http://alexmarandon.com/articles/web_widget_jquery/)

(function() {

    if (window.jQuery === undefined || window.jQuery.fn.jquery !== JQUERY_VERSION) {
        var script_tag = document.createElement('script');
        var jqueryUrl = "http://ajax.googleapis.com/ajax/libs/jquery/" + JQUERY_VERSION + "/jquery.min.js";
        script_tag.setAttribute("type","text/javascript");
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
    }

    function onJQueryLoaded() {
        console.log("onJQueryLoaded: BEGIN");
        // Restore $ and window.jQuery to their previous values and store the
        // new jQuery in our local jQuery variable
        jQuery = window.jQuery.noConflict(true);
        console.log("onJQueryLoaded:        jQuery.fn.jquery: " + jQuery.fn.jquery);
        console.log("onJQueryLoaded:             $.fn.jquery: " + $.fn.jquery);
        console.log("onJQueryLoaded: window.jQuery.fn.jquery: " + window.jQuery.fn.jquery);
        meceNotifications.view.init();
        meceNotifications.client.init();
        meceNotifications.client.start();
    }

})();

// END: Localize jQuery variable

