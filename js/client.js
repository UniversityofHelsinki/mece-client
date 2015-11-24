var meceNotifications = {};

meceNotifications.view = (function () {

    var contentDiv;
    var ul;

    (function init() {
        contentDiv = document.getElementById("mece-content-div");
        ul = document.createElement("ul");
    })();

    function appendMsg(msg) {
        contentDiv.appendChild(ul);
        var li = document.createElement("li");
        li.textContent = msg;
        ul.appendChild(li);
    }

    function parseNotifications(notifications) {
        for (var i = 0; i < notifications.length; i++) {
            appendMsg(notifications[i].heading + " : " + notifications[i].message);
        }
    }

    return {
        parseNotifications: parseNotifications
    };
})();

function helloWorld() {
    return "Hello world!";
}
meceNotifications.client = (function (view) {
    var meceNotifiactionUrlTest = 'https://ohtu-devel.it.helsinki.fi/mece/api/notifications/test';
    var meceNotifiactionUrl = 'https://ohtu-devel.it.helsinki.fi/mece/notifications/view/new/fi';
    var meceNotifiactionChannelUrl = 'https://ohtu-devel.it.helsinki.fi/mece/channel/notifications/';
    var meceLocalHostNotificationUrl = 'http://localhost:1337/mece/mece/notifications/view/new/fi';
    var meceLocalHostUrl = 'http://localhost:1337/mece/';
    var channels = "";
    var startingTime = '0';
    var notifications = [];

    var contentDiv = document.getElementById("mece-content-div");
    var mecePollingInterval = contentDiv.getAttribute("pollingInterval") || '4000';

    function markNotificationRead(notificationId) {
        console.log("Not implemented. markNotificationRead" + notificationId);
    }
    function meceHelloWorld() {
        return "Hello world!";
    }
    function getNotificationsByChannels() {

        var url = meceLocalHostUrl + 'channels/' + channels + '/notifications';

        if (startingTime !== '0') {
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
            var temp = temps[temps.length - 1];
            startingTime = temp.received;
        }
        //add new notifications to array
        notifications = notifications.concat(temps);
    }

    function setChannels(_channels) {
        channels = _channels;
        startingTime = '0';
        notifications = [];
    }

    function start() {
        // TODO: interval cancellation in error cases
        setInterval(function () {
            getNotificationsByChannels().then(function () {
                view.parseNotifications(notifications);
            }, function (error) {
                console.error("Failed!", error);
            });
        }, mecePollingInterval);
    }

    return {
        markNotificationSeen: markNotificationRead,
        setChannels: setChannels,
        start: start,
        meceHelloWorld: meceHelloWorld

    };
})(meceNotifications.view);
