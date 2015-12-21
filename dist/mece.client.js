var meceNotifications = (function (mece) {
    var MECE_LOGIN_URL = 'https://ohtu-devel.it.helsinki.fi/Shibboleth.sso/HYLogin';

    function debug(txt){
        console.log('module: SHIBBOLOGIN -- ' + txt + ' : ' + Date().toString());
    }

    function createIframe() {
        debug('createIframe');
        var iframe = document.createElement('iframe');
        iframe.style.display = "none";
        iframe.src = MECE_LOGIN_URL;
        iframe.addEventListener('load', function () {
            setTimeout(function () {
                debug('loggedIn');
                mece.loggedIn = true;
                if (mece.controller){
                    debug('mece.controller');
                    mece.controller.init();
                }
                if (mece.view){
                    debug('mece.view');
                    mece.view.init();
                }
            }, 1000);
        }, false);
        iframe.addEventListener('error', function () {
            debug('error');
        }, false);
        document.body.appendChild(iframe);
        debug('createIframe out');
    }

    createIframe();

    return mece;
})(meceNotifications || {});

var meceNotifications = (function (mece) {
    var MECE_DEFAULT_POLLING_INTERVAL = 4000;
    var pollingInterval;
    var MECE_DEFAULT_CHANNELS = "";
    var MECE_CHANNEL_SEPARATOR = ",";
    var startingTime = '0';
    var notifications = [];
    var $;
    var USE_TRANSLATIONS = true;


    function debug(txt){
        console.log('module: CONTROLLER -- ' + txt + ' : ' + Date().toString());
    }

    function readPollingIntervalAttribute(){
        return $(mece.contentDivId).attr("pollingInterval") || MECE_DEFAULT_POLLING_INTERVAL;
    }

    function readChannelsAttribute(){
        return $(mece.contentDivId).attr("meceChannels") || MECE_DEFAULT_CHANNELS;
    }

    function readLanguageAttribute(){
        return $(mece.contentDivId).attr("language");
    }

    function readAndInitializeAttributeValues(){
        pollingInterval = readPollingIntervalAttribute();
        mece.channels = readChannelsAttribute();
    }

    function init() {
        debug('init');
        if (!mece.controller.ready && dependenciesLoaded()) {
            debug('init !mece.controller.ready && dependenciesLoaded()');
            $ = $ || mece.jQuery;
            readAndInitializeAttributeValues();
            start();
            mece.controller.ready = true;
        }
        debug('init out');
    }

    function dependenciesLoaded() {
        return mece.initializer && mece.initializer.ready && mece.loggedIn;
    }

    function getNotificationsByChannels() {
        var query = {channelNames: mece.channels.split(MECE_CHANNEL_SEPARATOR).map(function(s){return(s.trim());})};
        //console.log(JSON.stringify(query));
        if (startingTime !== '0') {
            query.startingTime = startingTime;
        }
        var channelUrl = mece.domain + "/mece/notifications?" + $.param(query);

        return $.ajax({
            url: channelUrl,
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

    function start() {
        debug('start');
        if (!mece.controller.running) {
            // TODO: interval cancellation in error cases
            setInterval(function () {
                //updateTimes
                meceNotifications.view.notifications.updateTime();
                getNotificationsByChannels().done(function (response) {
                    var temps = response;

                    // take the startingTime before sorting
                    if(temps && temps.length > 0) {
                        startingTime = temps[0].received;
                    }
                    // sort notifications based on submitted field
                    temps.sort(function (a, b) {
                        return new Date(b.submitted) - new Date(a.submitted);
                    });

                    if (temps.length > 0) {
                        meceNotifications.view.notifications.add(temps.map(function (notification) {
                            var translations = {
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
                                     notification._recipients?notification._recipients[0]:null,
                                     USE_TRANSLATIONS?translations:{en:{}, fi:{}, sv:{}},
                                     notification.submitted
                            ]);

                        }));
                    }
                }, function (error) {
                });
                meceNotifications.view.notifications.check();

            }, pollingInterval);
            mece.controller.running = true;
        }
    }

    (function bootstrap() {
        debug('bootstrap');
        mece.controller = {
            init: init,
            start: start
        };
        mece.controller.init();
        debug('bootstrap out');
    }());

    return mece;

})(meceNotifications || {});

var meceNotifications = (function (mece) {
    var MECE_JQUERY_VERSION = '1.11.3';
    var MECE_DEFAULT_DOMAIN = 'https://mece.it.helsinki.fi';

    mece.contentDivId = "#mece-content-div";
    mece.iconDivId = "#mece-icon-div";
    mece.unreadCountSpanId = "#unread-count";
    mece.jQuery = null;

    function debug(txt){
        console.log('module: INITIALIZER -- ' + txt + ' : ' + Date().toString());
    }

    function init() {
        debug('init');
        mece.initializer.ready = true;
        mece.domain = $(mece.contentDivId).attr("meceDomain") || MECE_DEFAULT_DOMAIN;
        if (mece.controller){
            debug('mece.controller');
            mece.controller.init();
        }
        if (mece.view) {
            debug('mece.view');
            mece.view.init();
        }
        debug('init out');
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
        if (window.jQuery === undefined || window.jQuery.fn.jquery !== MECE_JQUERY_VERSION) {
            var script_tag = document.createElement('script');
            script_tag.setAttribute("type", "text/javascript");
            script_tag.setAttribute("src", "https://ajax.googleapis.com/ajax/libs/jquery/" + MECE_JQUERY_VERSION + "/jquery.min.js");
            if (script_tag.readyState) {
                script_tag.onreadystatechange = function () { // For old versions of IE
                    if (this.readyState == 'complete' || this.readyState == 'loaded') {
                        mece.jQuery = window.jQuery.noConflict(true);
                        console.log(mece.jQuery);
                        init();
                    }
                };
            } else { // Other browsers
                script_tag.onload = function () {
                    mece.jQuery = window.jQuery.noConflict(true);
                    init();
                };
            }
            (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
        } else {
            // The jQuery version on the window is the one we want to use
            mece.jQuery = window.jQuery;
            init();
        }
    }

    (function bootstrap() {
        debug('bootstrap');
        mece.initializer = {init: init};
        loadMomentJS();
        initLocales();
        loadJQuery();
        debug('bootstrap out');
    }());


    function initLocales() {
        waitForElement();
        function waitForElement(){
            if(typeof moment !== "undefined"){
                //Everything else is default, except sameDay.

                moment.locale('fi', {
                    calendar: {
                        sameDay: function () {
                            return '[' + moment(this).locale('fi').fromNow() + ']';
                        },
                        nextDay : '[huomenna] [klo] LT',
                        nextWeek : 'dddd [klo] LT',
                        lastDay : '[eilen] [klo] LT',
                        lastWeek : '[viime] dddd[na] [klo] LT',
                        sameElse : 'L'

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
                    } ,
                    longDateFormat: { //Forcing 24-hour clock
                        LT: 'HH:mm',
                        LTS: 'HH:mm:ss',
                        L: 'DD/MM/YYYY',
                        LL: 'D MMMM YYYY',
                        LLL: 'D MMMM YYYY HH:mm',
                        LLLL: 'dddd, D MMMM YYYY HH:mm'
                    }
                });
            }
            else{
                setTimeout(function(){
                    waitForElement();
                },250);
            }
        }
    }

    return mece;

})(meceNotifications || {});


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
        $(mece.contentDivId).append($("<ul/>").addClass("mece-list"));
        $(mece.contentDivId).append($("<div/>").attr("ID", "meceNoNotificationsDiv"));
        $(mece.contentDivId)
            .mouseover(function() {
                $(mece.contentDivId).css("overflow", "auto");
            })
            .mouseout(function() {
                $(mece.contentDivId).css("overflow", "hidden");
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
    function updateNotificationTime() {
         //NOT YET IMPLEMENTED
        //käy läpi kaikki mece-list -ul elementin rivit.
        //jokaisella rivillä submitted-aika on tallennettu diviin, jonka luokka on hiddenSubmittedTime
        //sen voi passata determineTime -funktiolle.
    }

    function __addWidgetIteminitWidget(offset, notification) {
        var avatar = function () {
            var DEFAULT_AVATAR_URL = IMAGES_URI + (notification[NOTIF_RECIPIENTS_IND] ?  "/avatar.png" : "/avatar-group.png");
            var urlFoundInTheMassage = notification[NOTIF_AVATAR_IND]; //notification.avatarImageUrl
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

        var myLink = notification[NOTIF_USE_TRANSLATION_IND][language].link||notification[NOTIF_LINK_IND];
        var myLinkText = notification[NOTIF_USE_TRANSLATION_IND][language].linkText||notification[NOTIF_LINK_TEXT_IND];
        var myMessage = notification[NOTIF_USE_TRANSLATION_IND][language].message||notification[NOTIF_MSG_IND];
        //Why isn't heading used?
        var myHeading = notification[NOTIF_USE_TRANSLATION_IND][language].link||notification[NOTIF_HEADING_IND];

        var linkDiv = $("<div>").html(myLinkText).contents();
        var link = $("<a>").attr("href", myLink);
        link.prepend(linkDiv);

        var image = $("<img>").attr("src", avatar()).text("avatar image");
        image.addClass("mece-avatar-picture");
        var titleDiv = $("<div>").append(link).addClass("mece-msg-title");
        var contentDiv = $("<div>").html(shortenMessage(myMessage)).addClass("mece-msg-content");
        var submitted = $("<div>").text(determineTime(notification[NOTIF_SUBMITTED_IND], language)).addClass("mece-msg-received");
        var submittedOrig = notification[NOTIF_SUBMITTED_IND];
        var outerDiv = $("<div>").addClass("mece-notification-detail-view");
        var avatarDiv = $("<div>").addClass("mece-avatar").append(image);
        var detailsDiv = $("<div>").addClass("mece-notification-fields")
            .append(titleDiv)
            .append(contentDiv)
            .append(submitted);
        var hiddenSubmittedDiv = $("<div style='display: none' class='hiddenSubmittedTime'>").append(submittedOrig);

        outerDiv.append(avatarDiv).append(detailsDiv).append(hiddenSubmittedDiv);

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
                $(mece.unreadCountSpanId).html($("<span>").text(unreadMessagesLength));
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

