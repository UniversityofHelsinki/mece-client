
var meceNotifications = (function (mece) {

    var MECE_DEFAULT_POLLING_INTERVAL = "4000";
    var MECE_DEFAULT_CHANNELS = "";
    var MECE_CHANNEL_SEPARATOR = ",";
    var startingTime = '0';
    var notifications = [];
    var $;

    function init() {
        console.log("controller::init");
        if (mece.controller && !mece.controller.initialized) {
            if (mece.view && mece.view.initialized) {
                $ = $ || mece.jQuery;
                mece.pollingInterval = $(mece.contentDivId).attr("pollingInterval") || MECE_DEFAULT_POLLING_INTERVAL;
                mece.channels = $(mece.contentDivId).attr("meceChannels") || MECE_DEFAULT_CHANNELS;
                dialog();
                mece.controller.initialized = true;
                console.log("controller::init OK");
            }
            else {
                if (mece.initializer) {
                    mece.initializer.init();
                }
            }
        }
    }

    function dialog() {
        console.log("controller::dialog");
        $("#meceIcon").click(function(e){
            e.stopPropagation();
            if ($(this).hasClass("active")) {
                $(".dialog").fadeOut(200);
                $(this).removeClass("active"); 
            }
            else {
                $(".dialog").delay(100).fadeIn(200);
                $(this).addClass("active");
            }
        });
        function closeMenu(){
            $(".dialog").fadeOut(200);
            $("#meceIcon").removeClass("active");  
        }
        $(document.body).click( function(e) {
            closeMenu();
        });
        $(".dialog").click( function(e) {
            e.stopPropagation();
        });
        start();
    }

    function start() {
        // TODO: interval cancellation in error cases
        console.log("controller::start");
        setInterval(function () {
            getNotificationsByChannels().then(function (response) {
                var temps = JSON.parse(response);
                if (temps.length > 0) {
                    startingTime = temps[temps.length - 1].received;
                    meceNotifications.view.notifications.add(temps.map(function(n){
                        return([n.message, n.link]);
                    }));
                }
                console.log("Add new notification(s) to the list!");
            }, function (error) {
                console.error("Failed to add new notification(s) to the list!", error);
            });
        }, MECE_DEFAULT_POLLING_INTERVAL);
    }

    function getNotificationsByChannels() {
        console.log("controller::getNotificationsByChannels");

        var query = MECE_NOAUTH ? {} : {channelNames: mece.channels.split(MECE_CHANNEL_SEPARATOR)};

        if (startingTime !== '0') { query.startingTime = startingTime; }

        var url = MECE_NOAUTH
            ? MECE_URL + "/channels/" + mece.channels + "/notifications?" + $.param(query)
            : MECE_URL + "/notifications?" + $.param(query); // MECE-348: 

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

    (function bootstrap() {
        console.log("controller::bootstrap");
        mece.controller = {
            init: init,
            start: start
        };
        mece.controller.init();
    }());

    return mece;

})(meceNotifications || {});


