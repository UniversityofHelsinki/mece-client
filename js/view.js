var meceNotifications = (function (mece) {
    var MARK_READ_URL = 'https://ohtu-devel.it.helsinki.fi/mece/notifications/markRead/';                                                                                                                                                  
    //var MARK_READ_URL = 'http://localhost:1337/mece/notifications/markRead/';
    var UNREAD_NOTIFICATIONS_COUNT = 'https://ohtu-devel.it.helsinki.fi/mece/notifications/unreadNotificationsCount';
    //var CHANNELS_UNREAD_NOTIFICATIONS_COUNT = 'http://localhost:1337/mece/notifications/channelsUnreadNotificationsCount';
    var CHANNELS_UNREAD_NOTIFICATIONS_COUNT = 'https://ohtu-devel.it.helsinki.fi/mece/notifications/channelsUnreadNotificationsCount';
    //var UNREAD_NOTIFICATIONS_COUNT = 'http://localhost:1337/mece/notifications/unreadNotificationsCount';

    //ARO
    //var LD = 'https://localhost:443';
    //MARK_READ_URL = LD + '/mece/notifications/markRead/';
    //CHANNELS_UNREAD_NOTIFICATIONS_COUNT = LD + '/mece/notifications/channelsUnreadNotificationsCount';
    //UNREAD_NOTIFICATIONS_COUNT = LD + '/mece/notifications/unreadNotificationsCount';

    var SHORTEN_MESSAGE_LEN = 58;
    var $;
    var language = 'fi'; //Set in init(). This is just default.

    var translations = {
        no_messages: {
            en: "No messages",
            fi: "Ei viestejä",
            sv: "Inga meddelanden"
        }
    };


    function translate(key, myLanguage) {
        return translations[key][myLanguage||language];
    }

    function __initWidgetList() {
        $(mece.contentDivId).append($("<ul/>").addClass("mece-list"));
        $(mece.contentDivId).append($("<div/>").attr("ID", "meceNoNotificationsDiv"));
        $(mece.contentDivId)
            .mouseover(function() {
                $(mece.contentDivId).css("overflow", "auto");
            })
            .mouseout(function() {
                $(mece.contentDivId).css("overflow", "hidden");
            });
    }

    function checkIfNoNotifications() {
        if($(mece.contentDivId).find("li").length === 0) {
            //$("#meceNoNotificationsDiv").text("Ei viestejä");
            $("#meceNoNotificationsDiv").text(translate('no_messages'));
        }
        else {
            $("#meceNoNotificationsDiv").text("");
        }
        getUnreadNotificationsCount(false);
    }


    function __addWidgetIteminitWidget(offset, notification) {
        var avatar = function () {
            var DEFAULT_AVATAR_URL = "";
            if(notification[7]) {
                DEFAULT_AVATAR_URL = "images/avatar.png";
            } else {
                DEFAULT_AVATAR_URL = "images/users.png";
            }
            var urlFoundInTheMassage = notification[5]; //notification.avatar
            return urlFoundInTheMassage || DEFAULT_AVATAR_URL;
        };

        var shortenMessage = function (notificationMessageText) {
            var characterLimit = SHORTEN_MESSAGE_LEN;
            if (!notificationMessageText) {
                return '';
            } else if (notificationMessageText.length > characterLimit) {
                return notificationMessageText.slice(0, characterLimit) + '...';
            } else {
                return notificationMessageText;
            }
        };

        var determineTime = function (received, language) {
            return moment(received).locale(language).calendar(); //TODO: Decide format
            //return moment(received).locale(language).fromNow();
        };

        var ulList = $(mece.contentDivId).find("ul");
        // TODO: MECE-365 "Otsikko on linkki. Otsikon teksti on joko viestin otsikko tai linkin otsikko."

        var myLink = notification[8][language].link||notification[2];
        var myLinkText = notification[8][language].linkText||notification[3];
        var myMessage = notification[8][language].message||notification[1];
        //Why isn't heading used?
        var myHeading = notification[8][language].link||notification[4];

        var linkDiv = $("<div>").html(myLinkText).contents();
        var link = $("<a>").attr("href", myLink);
        link.prepend(linkDiv);

        var image = $("<img>").attr("src", avatar()).text("avatar image");
        var titleDiv = $("<div>").append(link).addClass("mece-msg-title");
        var contentDiv = $("<div>").html(shortenMessage(myMessage)).addClass("mece-msg-content");
        var received = $("<div>").text(determineTime(notification[6], language)).addClass("mece-msg-received");

        var outerDiv = $("<div>").addClass("mece-notification-detail-view");
        var avatarDiv = $("<div>").addClass("mece-avatar").append(image);
        var detailsDiv = $("<div>").addClass("mece-notification-fields")
            .append(titleDiv)
            .append(contentDiv)
            .append(received);

        outerDiv.append(avatarDiv).append(detailsDiv);

        var li = $("<li>").attr("id", notification[0]).addClass("mece-msg-item");
        if(notification[7]) {
            li.addClass("mece-private-message");
        } else {
            li.addClass("mece-public-message");
        }
        if (notification[7] && notification[7].read) {
            li.addClass("mece-read-message");
        }
        li.prepend(outerDiv);
        ulList.prepend(li);
    }

    function getUnreadNotificationsCount(append) {
        var unreadMessagesLength = $(mece.contentDivId).find("ul li.mece-private-message").filter("li:not(.mece-read-message)").length;
        if(append) {
            $(mece.iconDivId).append($("<span>").attr("id", "unread-count").text(unreadMessagesLength).addClass('mece-badge'));
        } else {
            $(mece.unreadCountSpanId).html($("<span>").text(unreadMessagesLength));
        }
    }

    function markNotificationAsRead() {
        $(document).ready(function () {
            $('ul').on('click', 'li.mece-private-message', function () {
                $.ajax({
                    url: MARK_READ_URL + this.id,
                    type: 'GET',
                    crossDomain: true,
                    dataType: "json",
                    xhrFields: {
                        withCredentials: true
                    },
                    success: function (data) {
                        $('#' + data._id).addClass("mece-read-message");
                        getUnreadNotificationsCount(false);
                    },
                    error: function (xhr, status, error) {
                        console.log(xhr.responseText);
                    }
                });
            });
        });
    }

    function dialog() {
        var BELL_ICON_URL = "images/bell.png";
        $(mece.iconDivId).append($("<img>").attr("src", BELL_ICON_URL).text("bell image"));
        $(mece.iconDivId).click(function (e) {
            e.stopPropagation();
            if ($(this).hasClass("active")) {
                $(".dialog").fadeOut(200);
                $(this).removeClass("active");
            }
            else {
                $(".dialog").delay(25).fadeIn(200);
                $(this).addClass("active");
            }
        });
        function closeMenu() {
            $(".dialog").fadeOut(200);
            $(mece.iconDivId).removeClass("active");
        }

        $(document.body).click(function (e) {
            closeMenu();
        });
        $(".dialog").click(function (e) {
            e.stopPropagation();
        });
    }

// Public members

    function init() {
        if (!mece.view.ready && dependenciesLoaded()) {
            $ = $ || mece.jQuery;
            __initWidgetList();
            getUnreadNotificationsCount(true);
            dialog();
            markNotificationAsRead();
            if (mece.controller && mece.controller.initialized) mece.controller.start();
            mece.view.ready = true;

            language = $(mece.contentDivId).attr("language") || language;
        }
    }

    function dependenciesLoaded() {
        return mece.initializer && mece.initializer.ready && mece.loggedIn;
    }

    function redrawNotificationList(){
        console.log('redrawNotificationList ');
        $(".mece-list").remove();
        __initWidgetList();
    }

    function setLanguage(lang){
        if(language !== lang){
            //console.log('view.setLanguage update! refresh view: ' + lang);
            language = lang;
            redrawNotificationList();
            return true;
        }
        return false;
    }

    function add(notifications) {
        var sortedNotifications = notifications.sort(function (a, b) {
            return a[6] > b[6];
        });
        $.each(sortedNotifications, function (i, n) {
            __addWidgetIteminitWidget(i, n);
        });
    }

    (function __bootstrap() {
        mece.view = {
            init: init,
            notifications: {
                add: add,
                check: checkIfNoNotifications,
                setLanguage: setLanguage
            }
        };
        mece.view.init();
    }());

    return mece;

})(meceNotifications || {});

