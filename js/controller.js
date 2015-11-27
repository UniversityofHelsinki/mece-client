var meceNotifications = (function (mece) {
    var MECE_CHANNEL_SEPARATOR = ",";

    var $;
    var startingTime = '0';
    var notifications = [];
    var channels;
    var pollingInterval;

    mece.controller = {
        init: init,
        start: start
    };

    function init() {
        $ = $ || mece.jQuery;
        channels = mece.channels;
        pollingInterval = mece.pollingInterval;
        start();
    }

    function start() {
        // TODO: interval cancellation in error cases
        setInterval(function () {
            getNotificationsByChannels().then(function (response) {
                var temps = JSON.parse(response);
                if (temps.length > 0) {
                    startingTime = temps[temps.length - 1].received;
                    var notifications = temps.map(function (n) {
                        return (n.heading + ":" + n.message);
                    });
                    if (mece.view) {
                        mece.view.add(notifications);
                    }
                }
            }, function (error) {
                console.error("Failed to add new notification(s) to the list!", error);
            });
        }, pollingInterval);
    }

    function getNotificationsByChannels() {
        var noauth = false; //TODO: Aleksi a temporary workaround for the local authentication
        var query = noauth ? {} : {channelNames: channels.split(MECE_CHANNEL_SEPARATOR)};
        if (startingTime !== '0') {
            query.startingTime = startingTime;
        }
        var url = noauth ? mece.url + "/channels/" + channels + "/notifications?" + $.param(query)
            : mece.url + "/notifications?" + $.param(query); // MECE-348:
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


    if (mece.view && mece.view.initialized) {
        init();
    }
    return mece;

})(meceNotifications || {});