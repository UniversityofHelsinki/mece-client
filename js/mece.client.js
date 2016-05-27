(function () {
    'use strict';

    var pollingInterval,
        msgCount = 0,
        startingTime = '0',
        notifications = [],
        $,
        USE_TRANSLATIONS = true,

        MECE_JQUERY_VERSION = '1.11.3',
        MECE_DEFAULT_DOMAIN = 'https://mece.it.helsinki.fi',

        language = 'fi', //Set in init(). This is just default.
    //notification property indexies
        NOTIF_ID_IND = 0,
        NOTIF_MSG_IND = 1,
        NOTIF_LINK_IND = 2,
        NOTIF_LINK_TEXT_IND = 3,
        NOTIF_HEADING_IND = 4,
        NOTIF_AVATAR_IND = 5,
        NOTIF_USE_TRANSLATION_IND = 7,
        NOTIF_SUBMITTED_IND = 8,
        NOTIF_READ_IND = 9,
        IMAGES_URI = "https://rawgit.com/UniversityofHelsinki/mece-client/master/images",
        FONT_AWESOME_URL = "http://maxcdn.bootstrapcdn.com/font-awesome/4.1.0/css/font-awesome.min.css",
        MECE_MSG_RECEIVED = "mece-msg-received",

        translations = {
            no_messages: {
                en: "No messages",
                fi: "Ei viestej\u00e4",
                sv: "Inga meddelanden"
            }
        },

        contentDivId = "#mece-content-div",
        iconDivId = "#mece-icon-div",
        unreadCountSpanId = "#unread-count",
        $ = null,
        meceConfig = {},
        meceDomain,
        meceUsername,
        meceToken;


    function determineTime(received, language) {
        if (typeof moment !== "undefined") {
            return moment(received).locale(language).calendar(); //TODO: Decide format
        }
    }

    function debug(txt) {
        var DEBUG = true;

        if (DEBUG) {
            console.log('module: MECE-CLIENT -- ' + txt + ' : ' + Date().toString());
        }
    }

    function init() {
        jQuery(document).ready(function () {
            initializerStuff();
            readAndInitializeAttributeValues();
            initWidgetList();
            dialog();
            markNotificationAsRead();
            start();
        });
    }

    function initializerStuff() {
        debug('initializerStuff in');
        loadMomentJS();
        meceDomain = $(contentDivId).attr("mece-domain") || MECE_DEFAULT_DOMAIN;
        meceUsername = $(contentDivId).attr("mece-username");
        meceConfig.windowLeftOffset = parseInt($(contentDivId).attr("mece-window-left-offset"));
        meceConfig.windowTopOffset = parseInt($(contentDivId).attr("mece-window-top-offset"));
        meceConfig.windowTopOffsetCollapsed = parseInt($(contentDivId).attr("mece-window-top-offset-collapsed"));
        meceConfig.windowWidth = parseInt($(contentDivId).attr("mece-window-width"));
        meceConfig.windowHeight = parseInt($(contentDivId).attr("mece-window-height"));
        meceConfig.collapseWidth = parseInt($(contentDivId).attr("mece-collapse-width"));
        meceToken = $(contentDivId).attr("mece-token");

        language = $(contentDivId).attr("mece-language");
        if (language && (language === 'fi' || language === 'sv' || language === 'en')) {
            language = language;
        }

        initLocales();
        debug('initializerStuff out');
    }

    function start() {
        debug('start');
        updateNotificationTime();
        fetchNotifications();
        setInterval(function () {
            updateNotificationTime();
            fetchNotifications();
            checkIfNoNotifications();
        }, pollingInterval);
    }

    function fetchNotifications() {
        debug('fetchNotifications');

        // http://api.jquery.com/jQuery.ajax/#jqXHR
        getUserNotifications().done(function (response) {
            resizeHeight(msgCount);
            onGetNotificationsDone(response);
            checkIfNoNotifications();
        }).fail(function (error) {
            // TODO: interval cancellation in error cases
            debug("ERROR " + error);
        });
    }

    function getUserNotifications() {
        var query = {};
        if (startingTime !== '0') {
            query.startingTime = startingTime;
        }
        query.token = meceToken;
        var notificationsUrl = meceDomain + "/mece/api/notifications?" + $.param(query);

        return $.ajax({
            url: notificationsUrl,
            type: 'GET',
            crossDomain: true,
            dataType: "json",
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                //console.log("data:" + JSON.stringify(data));
                msgCount = msgCount + data.length;
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
                    // notification._recipients ? notification._recipients[0] : null,
                    USE_TRANSLATIONS ? translations : {en: {}, fi: {}, sv: {}},
                    notification.submitted,
                    notification.read
                ]);
            }));
        }
    }

    function getTheLatestStartingTime(temps) {

        $.each(temps, function (index, temp) {
            if (startingTime < temp.received) {
                startingTime = temp.received;
            }
        });
    }

    function readAndInitializeAttributeValues() {

        function readPollingIntervalAttribute() {
            return $(contentDivId).attr("mece-polling-interval");
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
                        $ = window.jQuery.noConflict(true);
                        debug("jQuery loaded");
                        init();
                    }
                };
            } else {
                script_tag.onload = function () {
                    $ = window.jQuery.noConflict(true);
                    debug("browsers");
                    init();
                };
            }
            (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);

        } else {
            $ = window.jQuery;
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

                //launch the notification writer to update texts
                updateNotificationTime();
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

    function resizeWidget() {

        var widgetWidth = meceConfig.windowWidth,
            widgetHeight = meceConfig.windowHeight,
            meceRootDivLeft = $("#mece").position().left,
            windowWidth = $(window).width(),
            position = "relative",
            widgetLeft = 0,
            meceRootDivWidth = "50px",
            widgetTop = $("#mece").position().top + meceConfig.windowTopOffset;

        if (windowWidth < meceConfig.collapseWidth) {
            meceRootDivWidth = "100%";
            position = "absolute";
            widgetWidth = "100%";
            widgetLeft = 0;
            widgetTop = $("#mece").position().top + meceConfig.windowTopOffsetCollapsed;
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
            widgetLeft = -widgetWidth + 30;
        }

        $("#mece").css("position", "relative").css("width", meceRootDivWidth);

        $(contentDivId)
            .css("position", position)
            .css("left", widgetLeft + "px")
            //.css("overflow-x", "visible") //
            .css("top", widgetTop + "px")
            .css("width", widgetWidth)
            .css("height", widgetHeight);
    }

    function initWidgetList() {
        $(contentDivId)
            .append($("<ul/>")
                //.css("height", meceConfig.windowHeight + "px")//
                //.css("overflow", "auto") //
                .css("position", "absolute")
                .addClass("mece-list"));
        resizeHeight(msgCount);
        $(contentDivId).append($("<div/>").attr("ID", "meceNoNotificationsDiv"));

        resizeWidget();
    }

    function resizeHeight(size){
        if(size === 0 || size === 1){
            $(contentDivId)
                .css("height", 100 + "px");
        }else if(size === 2){
            $(contentDivId)
                .css("height", 200 + "px");
        }else if(size === 3){
            $(contentDivId)
                .css("height", 300 + "px");
        }else{
            $(contentDivId)
                .css("height", 350 + "px");
        }
    }

    function checkIfNoNotifications() {
        if ($(contentDivId).find("li").length === 0) {
            $("#meceNoNotificationsDiv").text(translate('no_messages'));
        }
        else {
            $("#meceNoNotificationsDiv").text("");
        }
        getUnreadNotificationsCount(false);
    }

    function updateNotificationTime() {
        $(contentDivId).find("ul").each(function () {
            $(this).find("li").each(function () {
                var submitted = $(this).find(".hiddenSubmittedTime").first().text(),
                    div = $(this).find("." + MECE_MSG_RECEIVED).first();
                if (div && submitted) {
                    div.text(determineTime(submitted, language));
                }
            });
        });
    }

    function chooseValue(field, notification) {
        console.log('Seeking field ' + field + ' for language ' + language);
        var nextLang = { fi: 'sv', sv: 'en', en: 'fi'};
        var curLang = language;
        var value = notification[NOTIF_USE_TRANSLATION_IND][curLang][field];
        if (!value) {
            curLang = nextLang[curLang];
            value = notification[NOTIF_USE_TRANSLATION_IND][curLang][field];
        }
        if (!value) {
            curLang = nextLang[curLang];
            value = notification[NOTIF_USE_TRANSLATION_IND][curLang][field];
        }
        return value;
    }

    function addWidgetIteminitWidget(offset, notification) {
        var avatar = function () {
            var DEFAULT_AVATAR_URL = IMAGES_URI + "/avatar.png",
                urlFoundInTheMassage = notification[NOTIF_AVATAR_IND];

            return urlFoundInTheMassage || DEFAULT_AVATAR_URL;
        };

        var ulList = $(contentDivId).find("ul"),
            myLink = chooseValue('link', notification) || notification[NOTIF_LINK_IND],
            myLinkText = chooseValue('linkText', notification) || notification[NOTIF_LINK_TEXT_IND],
            myMessage = chooseValue('message', notification) || notification[NOTIF_MSG_IND],
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

        //var outerDivSize = 287;
        var outerDivSize = meceConfig.windowWidth - 13; //13px - scrollbarin leveys?
        outerDiv.css("width", outerDivSize + "px");
        //console.log("Window: " + meceConfig.windowWidth + ", outer: "+ outerDivSize);

        if (notification[NOTIF_READ_IND]) {
            li.addClass("mece-read-message");
        }

        li.prepend(outerDiv);
        ulList.prepend(li);
    }

    function getUnreadNotificationsCount(append) {
        var unreadMessagesLength = $(contentDivId).find("ul li.mece-private-message").filter("li:not(.mece-read-message)").length;

        if ($(unreadCountSpanId).length === 0) {
            $(iconDivId).append($("<span>").attr("id", "unread-count").text(unreadMessagesLength).addClass('mece-badge'));
        }
        else {
            $(unreadCountSpanId).text(unreadMessagesLength);
        }
        if (unreadMessagesLength === 0) {
            $(unreadCountSpanId).remove();
        }
    }

    function markNotificationAsRead() {
        $(document).ready(function () {
            $('ul').on('click', 'li.mece-private-message', function () {

                if ($(this).hasClass("mece-read-message")) return;

                var query = {};
                query.token = meceToken;
                query.id = this.id;

                var markReadUrl = meceDomain + "/mece/api/notifications/markRead?" + $.param(query);

                $.ajax({
                    url: markReadUrl,
                    type: 'GET',
                    crossDomain: true,
                    dataType: "json",
                    xhrFields: {
                        withCredentials: true
                    },
                    success: function (data) {

                        $('#' + data[0].notificationId).addClass("mece-read-message");
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
        //$(iconDivId).append($("<img>").attr("src", IMAGES_URI + "/bell.png").text("bell image"));
        $(iconDivId).append('<svg width="20" height="20" viewBox="0 0 1792 1792" fill="#178feb" xmlns="http://www.w3.org/2000/svg"><path d="M912 1696q0-16-16-16-59 0-101.5-42.5t-42.5-101.5q0-16-16-16t-16 16q0 73 51.5 124.5t124.5 51.5q16 0 16-16zm816-288q0 52-38 90t-90 38h-448q0 106-75 181t-181 75-181-75-75-181h-448q-52 0-90-38t-38-90q50-42 91-88t85-119.5 74.5-158.5 50-206 19.5-260q0-152 117-282.5t307-158.5q-8-19-8-39 0-40 28-68t68-28 68 28 28 68q0 20-8 39 190 28 307 158.5t117 282.5q0 139 19.5 260t50 206 74.5 158.5 85 119.5 91 88z"/></svg>');


        $(iconDivId).click(function (e) {
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
            $(iconDivId).removeClass("active");
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
            addWidgetIteminitWidget(i, n);
        });
    }

    window.onload = function() {
        console.log(document.readyState);
        loadJQuery();
    };

})();
