meceNotifications.view = (function () {
    // elements containing notifications
    var contentDiv = document.getElementById("mece-content-div");

    var pollingInterval = contentDiv.getAttribute("pollingInterval") || '4000';

    var ul = document.createElement("ul");
    contentDiv.appendChild(ul);

    var notifications = {};

    function appendMsg(msg) {
        var li = document.createElement("li");
        li.textContent = msg;
        ul.appendChild(li);
    }

    function parseNotifications(notifications) {
        // handle notifications here, now just passing through
        // notifications = ...
        appendMsg(notifications);
    }

    // call just once on page load

     meceNotifications.client.getNotifications().then(function (response) {

     parseNotifications(response);
     }, function (error) {
     console.error("Failed!", error);
     });

    /*
        //// requesting notifications in intervals.
        setInterval(function () {
            meceNotifications.client.getNotifications().then(function (response) {
                parseNotifications(response);
            }, function (error) {
                console.error("Failed!", error);
            });
        }, pollingInterval);
        */
})();
