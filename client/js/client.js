var meceNotifications = {};
var notifications = {};

meceNotifications.view = (function () {
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
    function parseNotifications(notifications){
        // handle notifications here, now just passing through
        // notifications = ...
        appendMsg(notifications);
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

    return {
        parseNotifications: parseNotifications
    };

})();


meceNotifications.client = (function () {
    var meceNotifiactionUrlTest = 'https://ohtu-devel.it.helsinki.fi/mece/api/notifications/test';
    var meceNotifiactionUrl = 'https://ohtu-devel.it.helsinki.fi/mece/notifications/view/new/fi';
    var meceNotifiactionChannelUrl = 'https://ohtu-devel.it.helsinki.fi/mece/channel/notifications/';
    var meceLocalHostNotificationUrl =  'http://localhost:1337/mece/mece/notifications/view/new/fi';
    var meceLocalHostUrl = 'http://localhost:1337/mece/';
    var channels = "dsrfretgffds";

    var contentDiv = document.getElementById("mece-content-div");
    var mecePollingInterval = contentDiv.getAttribute("pollingInterval") || '4000';

    function get() {
        return new Promise(function (resolve, reject) {
            var req = new XMLHttpRequest();
            // req.open('GET', meceNotifiactionUrl);
            req.open('GET', meceLocalHostNotificationUrl);
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

    function markNotificationRead(notificationId){
        console.log("Not implemented. markNotificationRead" + notificationId);

    }
    function getNotificationsByChannels() {
        var url = meceLocalHostUrl + 'channels/' + channels + '/notifications/';
        return new Promise(function (resolve, reject) {
            var req = new XMLHttpRequest();
            req.open('GET', url);
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
    function setChannels(_channels) {
        channels=_channels;
    }
    function start() {
        setInterval(function () {
            meceNotifications.client.getNotificationsByChannels().then(function (notifications) {
                meceNotifications.view.parseNotifications(notifications);
            }, function (error) {
                console.error("Failed!", error);
            });
        }, mecePollingInterval);

    }

    return {
        getNotifications: get,
        markNotificationSeen: markNotificationRead,
        getNotificationsByChannels : getNotificationsByChannels,
        setChannels: setChannels,
        start: start
    };
})();

