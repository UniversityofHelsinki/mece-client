var MECE_DEFAULT_POLLING_INTERVAL = "4000";
var MECE_DEFAULT_CHANNELS = "";
var MECE_CONTENT_DIV_ID = "#mece-content-div";
var MECE_CONTENT_DIV_TITLE = "mece-content-div-title";
var MECE_CHANNEL_SEPARATOR = ",";
var JQUERY_VERSION = '1.4.2';
var meceNotifications = {};
var LOGIN_URL = 'https://ohtu-devel.it.helsinki.fi/Shibboleth.sso/HYLogin';
var NOAUTH = true; //TODO: Aleksi a temporary workaround for the local authentication


meceNotifications.view = (function () {
    var $;

    function addIframe(url) {
        var iframePromise = new Promise(function(resolve, reject) {
            // Create a new script tag
            var iframe = document.createElement('iframe');
            iframe.style.display = "none";
            iframe.src = url;
            // Call resolve when it is loaded
            iframe.addEventListener('load', function() {
                resolve(url);
            }, false);

            // Reject the promise if there is an error
            iframe.addEventListener('error', function() {
                reject(url);
            }, false);

            // Add it to the body
            document.body.appendChild(iframe);
        });

        // Return the Promise
        return iframePromise;
    }

    function init(jquery) {
        $ = $ ||jquery;
        if(!NOAUTH) {
            addIframe(LOGIN_URL).then(function() {
                setTimeout(function() {
                }, 1000);
            }, function (error) {
                console.error("Failed!", error);
            });
        }
        else {
            var div = $("<div/>")
                .addClass("title")
                .attr("id", "mece_widget_title_id")
                .css("background-color", "navy")
                .css("color", "snow")
                .text("Notifications");

            var ul = $("<ul/>")
                .addClass("mece_list")
                .css("background-color", "WhiteSmoke")
                .css("color", "black");

            $(MECE_CONTENT_DIV_ID)
                .css("display", "none")
                .css("width", "500px")
                //.css("margin", "auto")
                .css("border", "3px solid navy");


            $(MECE_CONTENT_DIV_ID).append(div, ul);

            //$(MECE_CONTENT_DIV_ID).add("<div/>").attr("id", MECE_CONTENT_DIV_TITLE).addClass("title");
            //$(MECE_CONTENT_DIV_ID).add("<ul/>").attr("class", "mece_list");
        }
    }

    function add(notifications) {
        console.log("BEGIN: " + "add");
        var ulList = $(MECE_CONTENT_DIV_ID).find("ul");
        $.each(notifications, function(i, n) {
            var pngUrl = i % 3 > 0 ? "car.png" : "photo.png";
            var link = $("<a>").attr("href", n[1]).text(n[0]);
            var li = $("<li>").attr("id", "MN" + i).css("list-style-image", "url('"+pngUrl+"')").append(link);
            ulList.append(li);
            //ulList.append($("<li>").attr("id", "MN" + i).attr("class", "meceNotification")
            //.css("list-style-image", "url('"+pngUrl+"')").append(n[0]));
        });
        $("#mece_widget_title_id").text("Notifications (" + notifications.length + ")");
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

    function init(jquery) {
        $ = $ ||jquery;
        mecePollingInterval = $(MECE_CONTENT_DIV_ID).attr("pollingInterval") || MECE_DEFAULT_POLLING_INTERVAL;
        meceChannels = $(MECE_CONTENT_DIV_ID).attr("meceChannels") || MECE_DEFAULT_CHANNELS;
    }

    function markNotificationRead(notificationId) {
        console.log("Not implemented. markNotificationRead" + notificationId);
    }

    function meceHelloWorld() {
        return "Hello world!";
    }

    function getNotificationsByChannels() {

        var query = NOAUTH ? {} : {channelNames: meceChannels.split(MECE_CHANNEL_SEPARATOR)};

        if (startingTime !== '0') { query.startingTime = startingTime; }

        var url = NOAUTH
            ? meceLocalHostUrl + "/channels/" + meceChannels + "/notifications?" + $.param(query)
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
                    meceNotifications.view.add(temps.map(function(n){
                        return([n.message, n.link]);
                    }));
                }
                console.log("Add new notification(s) to the list!", response);
            }, function (error) {
                console.error("Failed to add new notification(s) to the list!", error);
            });
        }, mecePollingInterval);
    }

    return {
        meceHelloWorld : meceHelloWorld,
        markNotificationSeen: markNotificationRead,
        init: init,
        start: start
    };
})(meceNotifications.view);

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
        jQuery = window.jQuery.noConflict(true);
        console.log("onJQueryLoaded:        jQuery.fn.jquery: " + jQuery.fn.jquery);
        console.log("onJQueryLoaded: window.jQuery.fn.jquery: " + window.jQuery.fn.jquery);
        meceNotifications.view.init(jQuery);
        meceNotifications.client.init(jQuery);
        meceNotifications.client.start();
    }

    $(document).ready( function() {
      
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
    });

})();


