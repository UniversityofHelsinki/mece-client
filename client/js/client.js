
var meceNotifications = {};


meceNotifications.client = (function () {
    var meceNotifiactionUrlTest = 'https://ohtu-devel.it.helsinki.fi/mece/api/notifications/test';
    var meceNotifiactionUrl = 'https://ohtu-devel.it.helsinki.fi/mece/notifications/view/new/fi';

    function get() {
        return new Promise(function (resolve, reject) {
            var req = new XMLHttpRequest();
            req.open('GET', meceNotifiactionUrl);

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

    return {
        getNotifications: get,
        markNotificationSeen: markNotificationRead
    };
})();
