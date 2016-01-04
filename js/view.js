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

    //notification property indexies
    var NOTIF_ID_IND=0;
    var NOTIF_MSG_IND=1;
    var NOTIF_LINK_IND=2;
    var NOTIF_LINK_TEXT_IND=3;
    var NOTIF_HEADING_IND=4;
    var NOTIF_AVATAR_IND = 5;
    var NOTIF_RECEIVED_IND=6;
    var NOTIF_RECIPIENTS_IND = 7;
    var NOTIF_USE_TRANSLATION_IND = 8;
    var NOTIF_SUBMITTED_IND=9;
    var IMAGES_URI = "https://rawgit.com/UniversityofHelsinki/mece-client/master/images";

    var MECE_MSG_RECEIVED = "mece-msg-received";

    var translations = {
        no_messages: {
            en: "No messages",
            fi: "Ei viestejä",
            sv: "Inga meddelanden"
        }
    };

    function debug(txt){
        console.log('module: VIEW -- ' + txt + ' : ' + Date().toString());
    }

    function translate(key, myLanguage) {
        return translations[key][myLanguage||language];
    }

    function __initWidgetList() {

        debug('__initWidgetList');

        debug('__initWidgetList: mece.config.windowTopOffset: ' + mece.config.windowTopOffset);

        debug('position:' + [$(mece.iconDivId).position().top, $(mece.iconDivId).position().left]);

        var width = $(window).innerWidth() > mece.collapseWidth ? mece.config.windowWidth : $(window).innerWidth();

        debug('__initWidgetList: mece.config.windowWidth: ' + mece.config.windowWidth);

        debug('__initWidgetList: innerWidth: ' + $(window).innerWidth());

        debug('__initWidgetList: width: ' + width);

        $(mece.contentDivId)
            .css("position", "relative")
            .css("top", mece.config.windowTopOffset + "px")
            .css("left", mece.config.windowLeftOffset + "px")
            .css("height", mece.config.windowHeight + "px")
            .css("width", width + "px")
            .append($("<ul/>").addClass("mece-list"));

        debug("__initWidgetList:position: " + JSON.stringify({left:$(mece.iconDivId).position().left, top:$(mece.iconDivId).position().top}));

        $(mece.contentDivId)
            .append($("<div/>")
            .attr("ID", "meceNoNotificationsDiv"));

        $(mece.contentDivId)
            .mouseover(function() {
                $(mece.contentDivId).css("overflow", "visible");
            })
            .mouseout(function() {
                $(mece.contentDivId).css("overflow", "visible");
            });
        debug('__initWidgetList out');
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

    var determineTime = function (received, language) {
        return moment(received).locale(language).calendar(); //TODO: Decide format
        //return moment(received).locale(language).fromNow();
    };

    // MECE-445:
    // käy läpi kaikki mece-list -ul elementin rivit. jokaisella
    // rivillä submitted-aika on tallennettu diviin, jonka luokka on
    // hiddenSubmittedTime sen voi passata determineTime -funktiolle.
    function updateNotificationTime() {
        $(mece.contentDivId).find("ul").each(function() {
            $(this).find("li").each(function() {
                var submitted = $(this).find(".hiddenSubmittedTime").first().text(),
                    div = $(this).find("." + MECE_MSG_RECEIVED).first();
                if(div && submitted) {
                    div.text(determineTime(submitted, language));
                }
            });
        });
    }

    function __addWidgetIteminitWidget(offset, notification) {
        var avatar = function () {
            var DEFAULT_AVATAR_URL = IMAGES_URI + (notification[NOTIF_RECIPIENTS_IND] ?  "/avatar.png" : "/avatar-group.png");
            var urlFoundInTheMassage = notification[NOTIF_AVATAR_IND]; //notification.avatarImageUrl
            return urlFoundInTheMassage || DEFAULT_AVATAR_URL;
        };

        var ulList = $(mece.contentDivId).find("ul");
        // TODO: MECE-365 "Otsikko on linkki. Otsikon teksti on joko viestin otsikko tai linkin otsikko."

        var myLink = notification[NOTIF_USE_TRANSLATION_IND][language].link||notification[NOTIF_LINK_IND];
        var myLinkText = notification[NOTIF_USE_TRANSLATION_IND][language].linkText||notification[NOTIF_LINK_TEXT_IND];
        var myMessage = notification[NOTIF_USE_TRANSLATION_IND][language].message||notification[NOTIF_MSG_IND];
        //Why isn't heading used?
        var myHeading = notification[NOTIF_USE_TRANSLATION_IND][language].link||notification[NOTIF_HEADING_IND];

        var linkDiv = $("<div>").html(myLinkText).contents();
        var link = $("<a>").attr("href", myLink);
        link.prepend(linkDiv);

        var image = $("<img>").attr("src", avatar()).text("avatar image").addClass("mece-avatar-picture");
        var avatarDiv = $("<div>").addClass("mece-avatar").append(image);

        var titleDiv = $("<div>").append(link).addClass("mece-msg-title");
        var contentDiv = $("<div>").html(myMessage).addClass("mece-msg-content");
        var submitted = $("<div>").text(determineTime(notification[NOTIF_SUBMITTED_IND], language)).addClass("mece-msg-received");
        var detailsDiv = $("<div>").addClass("mece-notification-fields").append(titleDiv).append(contentDiv).append(submitted);

        var hiddenSubmittedDiv = $("<div style='display: none' class='hiddenSubmittedTime'>").text(notification[NOTIF_SUBMITTED_IND]);

        var outerDiv = $("<div>").addClass("mece-notification-detail-view").append(avatarDiv).append(detailsDiv).append(hiddenSubmittedDiv);

        var li = $("<li>").attr("id", notification[NOTIF_ID_IND]).addClass("mece-msg-item");
        if(notification[NOTIF_RECIPIENTS_IND]) {
            li.addClass("mece-private-message");
        } else {
            li.addClass("mece-public-message");
        }
        if (notification[NOTIF_RECIPIENTS_IND] && notification[NOTIF_RECIPIENTS_IND].read) {
            li.addClass("mece-read-message");
        }
        li.prepend(outerDiv);
        ulList.prepend(li);
    }

    function getUnreadNotificationsCount(append) {
        var unreadMessagesLength = $(mece.contentDivId).find("ul li.mece-private-message").filter("li:not(.mece-read-message)").length;
        if ($(mece.unreadCountSpanId).length === 0) {
            $(mece.iconDivId).append($("<span>").attr("id", "unread-count").text(unreadMessagesLength).addClass('mece-badge'));
        }
        else {
            $(mece.unreadCountSpanId).text(unreadMessagesLength);
        }
        if (unreadMessagesLength === 0){
            $(mece.unreadCountSpanId).remove();
        }

    }

    function markNotificationAsRead() {
        $(document).ready(function () {
            $('ul').on('click', 'li.mece-private-message', function () {
                $.ajax({
                    url: mece.domain + "/mece/notifications/markRead/" + this.id,
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
        debug('dialog');
        $(mece.iconDivId).append($("<img>").attr("src", IMAGES_URI + "/bell.png").text("bell image"));
        $(mece.iconDivId).click(function (e) {
            e.stopPropagation();
            if ($(this).hasClass("active")) {
                $(".dialog").fadeOut(200);
                $(this).removeClass("active");
            }
            else {
                $(".dialog").attr("position", "relative");
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
        debug('dialog out');
    }

// Public members

    function init() {
        debug('init');
        if (!mece.view.ready && dependenciesLoaded()) {
            debug('init !mece.view.ready && dependenciesLoaded()');
            $ = $ || mece.jQuery;
            __initWidgetList();
            getUnreadNotificationsCount(true);
            dialog();
            markNotificationAsRead();
            if (mece.controller && mece.controller.initialized) mece.controller.start();
            mece.view.ready = true;

            language = $(mece.contentDivId).attr("language") || language;
        }
        debug('init out');
    }

    function dependenciesLoaded() {
        return mece.initializer && mece.initializer.ready && mece.loggedIn;
    }

    function add(notifications) {
        $.each(notifications, function (i, n) {
            __addWidgetIteminitWidget(i, n);
        });
    }

    (function __bootstrap() {
        debug('bootstrap');
        mece.view = {
            init: init,
            notifications: {
                add: add,
                check: checkIfNoNotifications,
                updateTime: updateNotificationTime
            }
        };
        mece.view.init();
        debug('bootstrap out');
    }());

    return mece;

})(meceNotifications || {});

