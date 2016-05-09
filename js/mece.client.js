
var meceNotifications = (function (mece) {

    // some default values if not provided
    var MECE_DEFAULT_POLLING_INTERVAL = 4000,
        pollingInterval,
        MECE_DEFAULT_CHANNELS = "",
        MECE_CHANNEL_SEPARATOR = ",",
        startingTime = '0',
        notifications = [],
        $,
        USE_TRANSLATIONS = true,

        MECE_JQUERY_VERSION = '1.11.3',
        MECE_DEFAULT_DOMAIN = 'https://mece.it.helsinki.fi',
        MECE_DEFAULT_WINDOW_LEFT_OFFSET = 250,
        MECE_DEFAULT_COLLAPSE_WIDTH = 450,
        MECE_DEFAULT_WINDOW_TOP_OFFSET = 35,
        MECE_DEFAULT_WINDOW_WIDTH = 300,
        MECE_DEFAULT_WINDOW_HEIGHT = 350,
        MECE_DEFAULT_WINDOW_TOP_OFFSET_COLLAPSED = 70,

        language = 'fi', //Set in init(). This is just default.
    //notification property indexies
        NOTIF_ID_IND = 0,
        NOTIF_MSG_IND = 1,
        NOTIF_LINK_IND = 2,
        NOTIF_LINK_TEXT_IND = 3,
        NOTIF_HEADING_IND = 4,
        NOTIF_AVATAR_IND = 5,
        NOTIF_RECIPIENTS_IND = 7,
        NOTIF_USE_TRANSLATION_IND = 8,
        NOTIF_SUBMITTED_IND = 9,
        IMAGES_URI = "https://rawgit.com/UniversityofHelsinki/mece-client/master/images",


        MECE_MSG_RECEIVED = "mece-msg-received",

        translations = {
            no_messages: {
                en: "No messages",
                fi: "Ei viestejÃ¤",
                sv: "Inga meddelanden"
            }
        };

    mece.contentDivId = "#mece-content-div";
    mece.iconDivId = "#mece-icon-div";
    mece.unreadCountSpanId = "#unread-count";
    mece.jQuery = null;
    mece.config = {};


    function debug(txt) {
        console.log('module: MECE-CLIENT -- ' + txt + ' : ' + Date().toString());
    }

    function init() {
        initializerStuff();
        $ = mece.jQuery;
        readAndInitializeAttributeValues();
        __initWidgetList();
        getUnreadNotificationsCount(true);
        dialog();
        markNotificationAsRead();
        start();
    }

    function initializerStuff() {
        loadMomentJS();
        mece.domain = mece.jQuery(mece.contentDivId).attr("meceDomain") || MECE_DEFAULT_DOMAIN;
        mece.username =  mece.jQuery(mece.contentDivId).attr("username");
        mece.config.windowLeftOffset = parseInt(mece.jQuery(mece.contentDivId).attr("meceWindowLeftOffset")) || MECE_DEFAULT_WINDOW_LEFT_OFFSET;
        mece.config.windowTopOffset = parseInt(mece.jQuery(mece.contentDivId).attr("meceWindowTopOffset")) || MECE_DEFAULT_WINDOW_TOP_OFFSET;
        mece.config.windowTopOffsetCollapsed = parseInt(mece.jQuery(mece.contentDivId).attr("meceWindowTopOffsetCollapsed")) || MECE_DEFAULT_WINDOW_TOP_OFFSET_COLLAPSED;
        mece.config.windowWidth = parseInt(mece.jQuery(mece.contentDivId).attr("meceWindowWidth")) || MECE_DEFAULT_WINDOW_WIDTH;
        mece.config.windowHeight = parseInt(mece.jQuery(mece.contentDivId).attr("meceWindowHeight")) || MECE_DEFAULT_WINDOW_HEIGHT;
        mece.config.collapseWidth = parseInt(mece.jQuery(mece.contentDivId).attr("meceCollapseWidth")) || MECE_DEFAULT_COLLAPSE_WIDTH;
        mece.token = mece.jQuery(mece.contentDivId).attr("token");
        initLocales();
    }

    function start() {
        updateNotificationTime();
        fetchNotifications();
        checkIfNoNotifications();
        setInterval(function () {
            updateNotificationTime();
            fetchNotifications();
            checkIfNoNotifications();
        }, pollingInterval);
    }


    function fetchNotifications() {
        getUserNotifications().done(function (response) {
            onGetNotificationsDone(response);
        }, function (error) {
            // TODO: interval cancellation in error cases
        });
    }


    function getUserNotifications() {
        var query = {};
        if (startingTime !== '0') {
            query.startingTime = startingTime;
        }
        query.token = mece.token;
        var notificationsUrl = mece.domain + "/mece/api/notifications?" + $.param(query);
        console.log("notificationURl: " + notificationsUrl);
        return $.ajax({
            url: notificationsUrl,
            type: 'GET',
            crossDomain: true,
            dataType: "json",
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                return data;
            },
            error: function (xhr, status, error) {
                console.log(xhr.responseText);
            }
        });
    }


    function onGetNotificationsDone(response) {
        var temps = response,
            translations;

        // take the startingTime before sorting
        if (temps && temps.length > 0) {
            getTheLatestStartingTime(temps);
        }
        // sort notifications based on submitted field
        temps.sort(function (a, b) {
            return new Date(a.submitted) - new Date(b.submitted);
        });

        if (temps.length > 0) {
            addNotifications(temps.map(function (notification) {
                translations = {
                    en: {
                        heading: notification.headingEN,
                        message: notification.messageEN,
                        link: notification.linkEN,
                        linkText: notification.linkTextEN
                    },
                    fi: {
                        heading: notification.headingFI,
                        message: notification.messageFI,
                        link: notification.linkFI,
                        linkText: notification.linkTextFI
                    },
                    sv: {
                        heading: notification.headingSV,
                        message: notification.messageSV,
                        link: notification.linkSV,
                        linkText: notification.linkTextSV
                    }
                };

                return ([notification._id,
                    notification.message,
                    notification.link,
                    notification.linkText,
                    notification.heading,
                    notification.avatarImageUrl,
                    notification.received,
                    notification._recipients ? notification._recipients[0] : null,
                    USE_TRANSLATIONS ? translations : {en: {}, fi: {}, sv: {}},
                    notification.submitted
                ]);
            }));
        }
    }
    function getTheLatestStartingTime(temps) {

        $.each(temps, function(index, temp) {
            if (startingTime < temp.received) {
                startingTime = temp.received;
            }
        });
    }

    function readAndInitializeAttributeValues() {

        function readPollingIntervalAttribute() {
            return $(mece.contentDivId).attr("pollingInterval") || MECE_DEFAULT_POLLING_INTERVAL;
        }
          pollingInterval = readPollingIntervalAttribute();
    }

    function loadMomentJS() {
        if (window.moment === undefined) {
            var script_tag = document.createElement('script');
            script_tag.setAttribute("type", "text/javascript");
            script_tag.setAttribute("src", "https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.10.6/moment-with-locales.min.js");
            (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
        }
    }

    function loadJQuery() {
        var script_tag;

        if (window.jQuery === undefined || window.jQuery.fn.jquery !== MECE_JQUERY_VERSION) {
            script_tag = document.createElement('script');
            script_tag.setAttribute("type", "text/javascript");
            script_tag.setAttribute("src", "https://ajax.googleapis.com/ajax/libs/jquery/" + MECE_JQUERY_VERSION + "/jquery.min.js");

            if (script_tag.readyState) {
                script_tag.onreadystatechange = function () { // For old versions of IE
                    if (this.readyState == 'complete' || this.readyState == 'loaded') {
                        mece.jQuery = window.jQuery.noConflict(true);
                        debug("jQuery loaded");
                        init();
                    }
                };
            } else {
                script_tag.onload = function () {
                    mece.jQuery = window.jQuery.noConflict(true);
                    debug("browsers");
                    init();
                };
            }
            (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);

        } else {
            mece.jQuery = window.jQuery;
            debug("The jQuery version on the window is the one we want to use");
            init();
        }
    }

    function initLocales() {
        waitForElement();

        function waitForElement() {
            if (typeof moment !== "undefined") {
                //Everything else is default, except sameDay.
                moment.locale('fi', {
                    calendar: {
                        sameDay: function () {
                            return '[' + moment(this).locale('fi').fromNow() + ']';
                        },
                        nextDay: '[huomenna] [klo] LT',
                        nextWeek: 'dddd [klo] LT',
                        lastDay: '[eilen] [klo] LT',
                        lastWeek: '[viime] dddd[na] [klo] LT',
                        sameElse: 'L'
                    }
                });
                moment.locale('sv', {
                    calendar: {
                        sameDay: function () {
                            return '[' + moment(this).locale('sv').fromNow() + ']';
                        },
                        nextDay: '[Imorgon] LT',
                        lastDay: '[Ig\xE5r] LT',
                        nextWeek: '[P\xE5] dddd LT',
                        lastWeek: '[I] dddd[s] LT',
                        sameElse: 'L'
                    }
                });
                moment.locale('en', {
                    calendar: {
                        sameDay: function () {
                            return '[' + moment(this).locale('en').fromNow() + ']';
                        },
                        nextDay: '[Tomorrow at] LT',
                        nextWeek: 'dddd [at] LT',
                        lastDay: '[Yesterday at] LT',
                        lastWeek: '[Last] dddd [at] LT',
                        sameElse: 'L'
                    },
                    longDateFormat: { //Forcing 24-hour clock
                        LT: 'HH:mm',
                        LTS: 'HH:mm:ss',
                        L: 'DD/MM/YYYY',
                        LL: 'D MMMM YYYY',
                        LLL: 'D MMMM YYYY HH:mm',
                        LLLL: 'dddd, D MMMM YYYY HH:mm'
                    }
                });
            } else {
                setTimeout(function () {
                    waitForElement();
                }, 250);
            }
        }
    }

    function translate(key, myLanguage) {
        return translations[key][myLanguage || language];
    }

    function __resizeWidget() {

        var widgetWidth = mece.config.windowWidth,
            widgetHeight = mece.config.windowHeight,
            meceRootDivLeft = $("#mece").position().left,
            windowWidth = $(window).width(),
            position = "relative",
            widgetLeft = 0,
            meceRootDivWidth = "50px",
            widgetTop = $("#mece").position().top + mece.config.windowTopOffset;

        if (windowWidth < mece.config.collapseWidth) {
            meceRootDivWidth = "100%";
            position = "absolute";
            widgetWidth = "100%";
            widgetLeft = 0;
            widgetTop = $("#mece").position().top + mece.config.windowTopOffsetCollapsed;
        }
        else if (windowWidth < widgetWidth) {
            position = "absolute";
            widgetWidth = windowWidth + "px";
            widgetLeft = -meceRootDivLeft;
        }
        else if (meceRootDivLeft + widgetWidth / 2 > windowWidth) {
            position = "absolute";
            widgetLeft = windowWidth - meceRootDivLeft - widgetWidth;
        } else if (meceRootDivLeft < widgetWidth / 2) {
            position = "absolute";
            widgetLeft = -meceRootDivLeft;
        } else {
            position = "absolute";
            widgetLeft = -widgetWidth / 2;
        }

        $("#mece").css("position", "relative").css("width", meceRootDivWidth);

        $(mece.contentDivId)
            .css("position", position)
            .css("left", widgetLeft + "px")
            .css("overflow-x", "visible")
            .css("top", widgetTop + "px")
            .css("width", widgetWidth)
            .css("height", widgetHeight);
    }

    function __initWidgetList() {
        $(mece.contentDivId)
            .append($("<ul/>")
                .css("height", mece.config.windowHeight + "px")
                .css("overflow", "auto")
                .css("position", "absolute")
                .addClass("mece-list"));
        $(mece.contentDivId).append($("<div/>").attr("ID", "meceNoNotificationsDiv"));
        __resizeWidget();
    }

    function checkIfNoNotifications() {
        if ($(mece.contentDivId).find("li").length === 0) {
            $("#meceNoNotificationsDiv").text(translate('no_messages'));
        }
        else {
            $("#meceNoNotificationsDiv").text("");
        }
        getUnreadNotificationsCount(false);
    }

    var determineTime = function (received, language) {
        return moment(received).locale(language).calendar(); //TODO: Decide format
    };

    function updateNotificationTime() {
        $(mece.contentDivId).find("ul").each(function () {
            $(this).find("li").each(function () {
                var submitted = $(this).find(".hiddenSubmittedTime").first().text(),
                    div = $(this).find("." + MECE_MSG_RECEIVED).first();
                if (div && submitted) {
                    div.text(determineTime(submitted, language));
                }
            });
        });
    }

    function __addWidgetIteminitWidget(offset, notification) {
        var avatar = function () {
            var DEFAULT_AVATAR_URL = IMAGES_URI + (notification[NOTIF_RECIPIENTS_IND] ? "/avatar.png" : "/avatar-group.png"),
                urlFoundInTheMassage = notification[NOTIF_AVATAR_IND];

            return urlFoundInTheMassage || DEFAULT_AVATAR_URL;
        };

        var ulList = $(mece.contentDivId).find("ul"),
            myLink = notification[NOTIF_USE_TRANSLATION_IND][language].link || notification[NOTIF_LINK_IND],
            myLinkText = notification[NOTIF_USE_TRANSLATION_IND][language].linkText || notification[NOTIF_LINK_TEXT_IND],
            myMessage = notification[NOTIF_USE_TRANSLATION_IND][language].message || notification[NOTIF_MSG_IND],
            linkDiv = $("<div>").html(myLinkText).contents(),
            link = $("<a>").attr("href", myLink).attr("target", "_blank").prepend(linkDiv),

            image = $("<img>").attr("src", avatar()).text("avatar image").addClass("mece-avatar-picture"),
            avatarDiv = $("<div>").addClass("mece-avatar").append(image),

            titleDiv = $("<div>").append(link).addClass("mece-msg-title"),
            contentDiv = $("<div>").html(myMessage).addClass("mece-msg-content"),
            submitted = $("<div>").text(determineTime(notification[NOTIF_SUBMITTED_IND], language)).addClass("mece-msg-received"),
            detailsDiv = $("<div>").addClass("mece-notification-fields").append(titleDiv).append(contentDiv).append(submitted),

            hiddenSubmittedDiv = $("<div style='display: none' class='hiddenSubmittedTime'>").text(notification[NOTIF_SUBMITTED_IND]),
            outerDiv = $("<div>").addClass("mece-notification-detail-view").append(avatarDiv).append(detailsDiv).append(hiddenSubmittedDiv),
            li = $("<li>").attr("id", notification[NOTIF_ID_IND]).addClass("mece-msg-item");

        li.addClass("mece-private-message");

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
        if (unreadMessagesLength === 0) {
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
        $(mece.iconDivId).append($("<img>").attr("src", IMAGES_URI + "/bell.png").text("bell image"));
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

    function addNotifications(notifications) {
        $.each(notifications, function (i, n) {
            __addWidgetIteminitWidget(i, n);
        });
    }

    (function boot() {
        debug('*** STARTING ***');
        loadJQuery();
    }());

})(meceNotifications || {});
