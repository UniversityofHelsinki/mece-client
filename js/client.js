(function() {

var jQuery;
var JQUERY_VERSION = '1.4.2';

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
        testjQuery();
    }

    function testjQuery() {
        var jsonp_url = "http://al.smeuh.org/cgi-bin/webwidget_tutorial.py?callback=?";
        div = "#mece-content-div";
        jQuery.getJSON(jsonp_url, function(data) {
            jQuery(div).html("This data comes from another server: " + data.html);
        });
    }

})();

// END: Localize jQuery variable

var meceNotifications = {};
var notifications = [];

meceNotifications.view = (function () {

    console.log("meceNotifications.view: BEGIN");

    // elements containing notifications
    var contentDiv = document.getElementById("mece-content-div");

    /*
     var contentDiv = document.getElementById("mece-content-div");

     var pollingInterval;
     if (contentDiv != null) {
     pollingInterval = contentDiv.getAttribute("pollingInterval") || '4000';

     } else pollingInterval = '4000';

     var ul = document.createElement("ul");
     contentDiv.appendChild(ul);

     var notifications = {};
     */
    function appendMsg(msg) {
        var contentDiv = document.getElementById("mece-content-div");
        var ul = document.createElement("ul");
        contentDiv.appendChild(ul);
        var li = document.createElement("li");
        li.textContent = msg;
        ul.appendChild(li);
    }
    function parseNotifications(){
        // handle notifications here, now just passing through
        // notifications = ...
        appendMsg(JSON.stringify(notifications));
    }
    /*
     // call just once on page load
     meceNotifications.client.getNotifications().then(function (response) {
     parseNotifications(response);
     console.log("**************PARSE notifications");
     }, function (error) {
     console.error("Failed!", error);
     });
     */
    //// requesting notifications in intervals.
    //setInterval(function () {
    //    meceNotifications.client.getNotifications().then(function (response) {
    //        parseNotifications(response);
    //    }, function (error) {
    //        console.error("Failed!", error);
    //    });
    //}, 4000);

    console.log("meceNotifications.view: END");

    return {
        parseNotifications: parseNotifications
    };

    meceNotifications.view();

})();


meceNotifications.client = (function () {
    var meceNotifiactionUrlTest = 'https://ohtu-devel.it.helsinki.fi/mece/api/notifications/test';
    var meceNotifiactionUrl = 'https://ohtu-devel.it.helsinki.fi/mece/notifications/view/new/fi';
    var meceNotifiactionChannelUrl = 'https://ohtu-devel.it.helsinki.fi/mece/channel/notifications/';
    var meceLocalHostNotificationUrl =  'http://localhost:1337/mece/mece/notifications/view/new/fi';
    var meceLocalHostUrl = 'http://localhost:1337/mece/';
    var channels = "dsrfretgffds";
    var startingTime = '0';


    var contentDiv = document.getElementById("mece-content-div");
    var mecePollingInterval = contentDiv.getAttribute("pollingInterval") || '4000';

    function get() {
        return new Promise(function (resolve, reject) {
            var req = new XMLHttpRequest();
            // req.open('GET', meceNotifiactionUrl);
            req.open('GET', meceLocalHostNotificationUrl);
            req.onload = function () {
                if (req.status == 200) {
                    notifications=JSON.parse[req.response];
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

    function markNotificationRead(notificationId){
        console.log("Not implemented. markNotificationRead" + notificationId);

    }
    function getNotificationsByChannels() {
        var url = meceLocalHostUrl + 'channels/' + channels + '/notifications';
        if (startingTime !== '0' ) {
            url = url + '?startingTime=' + startingTime;
        }
        return new Promise(function (resolve, reject) {
            var req = new XMLHttpRequest();
            req.open('GET', url);
            req.onload = function () {
                if (req.status == 200) {
                    handleResponse(req.response);
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
    function handleResponse(response) {
        var temps = JSON.parse(response);
        //save starting time
        if (temps.length > 0) {
            var temp = temps[temps.length-1];
            startingTime = temp.received;
        }
        //add new notifications to array
        notifications.push(temps);
    }
    function setChannels(_channels) {
        channels=_channels;
        startingTime = '0';
        notifications = [];
    }
    function start() {
        setInterval(function () {
            meceNotifications.client.getNotificationsByChannels().then(function () {
                meceNotifications.view.parseNotifications();
                console.log(notifications);
            }, function (error) {
                console.error("Failed!", error);
            });
        }, mecePollingInterval);

    }

    return {
        get: get,
        markNotificationSeen: markNotificationRead,
        getNotificationsByChannels : getNotificationsByChannels,
        setChannels: setChannels,
        start: start
    };
})();

})();

