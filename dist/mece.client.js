
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



var MECE_JQUERY_VERSION = '1.4.2';
var MECE_LOGIN_URL = 'https://ohtu-devel.it.helsinki.fi/Shibboleth.sso/HYLogin';
var MECE_URL = 'https://ohtu-devel.it.helsinki.fi/mece/'; // for ohtu-testi.it.helsinki.fi/meceapp
//var MECE_URL = 'http://localhost:1337/mece'; //for local development
var MECE_NOAUTH = false;

var meceNotifications = (function (mece) {

    mece.contentDivId = "#mece-content-div";
    mece.iconId = "#meceIcon";
    mece.url = MECE_URL;
    mece.jQuery = null;

    function init() {
        console.log("initializer::init");
        if (mece.initializer && !mece.initializer.initialized) {
            $ = $ || mece.jQuery;
            $(mece.contentDivId).append("<ul/>");
            loadJQuery();
            mece.initializer.initialized = true;
            console.log("initializer::init OK");
        }
    }

    function loadJQuery() {
        console.log("initializer::loadJQuery");
        if (window.jQuery === undefined || window.jQuery.fn.jquery !== MECE_JQUERY_VERSION) {
            var script_tag = document.createElement('script');
            script_tag.setAttribute("type", "text/javascript");
            script_tag.setAttribute("src", "https://ajax.googleapis.com/ajax/libs/jquery/" + MECE_JQUERY_VERSION + "/jquery.min.js");
            if (script_tag.readyState) {
                script_tag.onreadystatechange = function () { // For old versions of IE
                    if (this.readyState == 'complete' || this.readyState == 'loaded') {
                        onJQueryLoaded();
                    }
                };
            } else { // Other browsers
                script_tag.onload = onJQueryLoaded;
            }
            (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
        } else {
            // The jQuery version on the window is the one we want to use
            mece.jQuery = window.jQuery;
            login();
        }
    }

    function onJQueryLoaded() {
        console.log("initializer::onJQueryLoaded");
        // Restore $ and window.jQuery to their previous values and store the
        // new jQuery in our local jQuery variable
        mece.jQuery = window.jQuery.noConflict(true);
        console.log("onJQueryLoaded:        jQuery.fn.jquery: " + mece.jQuery.fn.jquery);
        console.log("onJQueryLoaded: window.jQuery.fn.jquery: " + window.jQuery.fn.jquery);
        mece.initializer.jqueryLoaded = true;
        loginIfWithShibbo();
    }

    function loginIfWithShibbo() {
        console.log("initializer::loginIfWithShibbo");
        if(!MECE_NOAUTH) {
            login();
        }
        else {
            mece.view.init();
        }
    }

    function login() {
        console.log("initializer::login");
        // Create a new script tag
        var iframe = document.createElement('iframe');
        iframe.style.display = "none";
        iframe.src = MECE_LOGIN_URL;
        // Call resolve when it is loaded
        iframe.addEventListener('load', function () {
            setTimeout(function () {
                console.log("initializer::login OK");
                mece.view.init();
            }, 1000);
        }, false);
        // Reject the promise if there is an error
        iframe.addEventListener('error', function () {
            console.log("initializer::login ERROR");
        }, false);
        // Add it to the body
        document.body.appendChild(iframe);
    }

    (function bootstrap() {
        console.log("initializer::bootstrap");
        mece.initializer = { init: init};
        mece.initializer.init();
    }());

    return mece;

})(meceNotifications || {});


var meceNotifications = (function (mece) {
    var $;

    // Private members

    function __initWidgetList() {
        var ul = $("<ul/>")
            .addClass("mece_list")
            .css("background-color", "WhiteSmoke")
            .css("color", "black");
        $(mece.contentDivId)
            .css("display", "none")
            .css("width", "500px")
            .css("height", "350px")
            .css("overflow", "auto")
            //.css("margin", "auto")
            .css("border", "3px solid navy");
        $(mece.contentDivId).append(ul);
        $(mece.iconId).css("border", "3px solid navy")
                            .css("height", "64px")
                            .css("background", "#e74c3c")
                            .css("padding", "0px 32px")
                            .css("border-bottom", "1px solid #C24032")
                            .css("text-align", "left")
                            .css("box-shadow", "0px 0px 4px #C24032");
    }

    function __addWidgetIteminitWidget(offset, notification) {
        var ulList = $(mece.contentDivId).find("ul");
        var link = $("<a>").attr("href", notification[1]).text(notification[0]);
        var li = $("<li>").attr("id", "MN" + offset)
                          .css("list-style-image", "url('images/" + (offset % 3 > 0 ? "car" : "photo") + ".png')")
                          .css("height", "100px")
                          //.css("display", "inline-block")
                          .css("border-bottom", "1px solid #000")
                          .append(link);
            ulList.append(li);
            //ulList.append($("<li>").attr("id", "MN" + i).attr("class", "meceNotification")
            //.css("list-style-image", "url('"+pngUrl+"')").append(n[0]));
    }

    // Public members

    function init() {
        console.log("view::init");
        if (mece.view && !mece.view.initialized) {
            if (mece.initializer && mece.initializer.jqueryLoaded) {
                $ = $ || mece.jQuery;
                __initWidgetList();
                mece.view.initialized = true;
                mece.controller.init();
                console.log("view::init OK");
            }
            else {
                if (mece.initializer) {
                    mece.initializer.init();
                }
            }
        }
    }

    function add(notifications) {
        console.log("view::add");
        $.each(notifications, function(i, n) { __addWidgetIteminitWidget(i, n); });
        console.log("view::add OK");
    }

    (function __bootstrap() {
        console.log("view::__bootstrap");
        mece.view = {init: init, notifications: {add: add}};
        mece.view.init();
    }());

    return mece;

})(meceNotifications || {});

