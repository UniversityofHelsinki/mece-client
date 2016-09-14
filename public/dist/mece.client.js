var meceClientApp = (function () {
    'use strict';

    var pollingInterval = 60000, // hard limit 1 minute
        msgCount = 0,
        startingTime = '0',
        notifications = [],
        USE_TRANSLATIONS = true,

        MECE_JQUERY_VERSION = '1.11.3',
        MECE_DEFAULT_DOMAIN = 'https://mece.it.helsinki.fi',
        MECE_DEFAULT_HOST = "opintoni",
        language = 'fi', //Set in init(). This is just default.
    //notification property indexies
        NOTIF_ID_IND = 0,
        NOTIF_MSG_IND = 1,
        NOTIF_LINK_URL_IND = 2,
        NOTIF_LINK_TEXT_IND = 3,
        NOTIF_HEADING_IND = 4,
        NOTIF_AVATAR_IND = 5,
        NOTIF_USE_TRANSLATION_IND = 7,
        NOTIF_SUBMITTED_IND = 8,
        NOTIF_READ_IND = 9,
        IMAGES_URI = "https://mece.it.helsinki.fi/dist/prod/images",
        MECE_MSG_RECEIVED = "mece-row-content-received",

        translations = {
            no_messages: {
                en: "No messages",
                fi: "Ei viestej\u00e4",
                sv: "Inga meddelanden"
            }
        },
        mainDivId = "#mece",
        $mainDiv,
        $containerDiv,
        $rowContentDiv,
        $iconDiv,
        $noMessagesDiv,
        $ = null,
        meceDomain,
        meceHost,
        meceToken,
        enableDebug = false,
        started = false,
        $badgeDiv;


    String.format = function () {
        var s = arguments[0];
        for (var i = 0; i < arguments.length - 1; i++) {
            var reg = new RegExp("\\{" + i + "\\}", "gm");
            s = s.replace(reg, arguments[i + 1]);
        }
        return s;
    };


    function determineTime(received, language) {
        if (typeof moment !== "undefined") {
            return moment(received).locale(language).calendar(); //TODO: Decide format
        }
    }

    function debug(txt) {
        if (enableDebug) {
            console.log('module: MECE-CLIENT -- ' + txt + ' : ' + Date().toString());
        }
    }

    var containerTemplate =
        /*jshint multistr:true */
        '<div class="mece">\
            <div class="mece-icon">\
                <img src="https://mece.it.helsinki.fi/dist/prod/images/bell.svg">\
                <div class="mece-badge"></div>\
            </div>\
            <div class="mece-icon mece-icon-close">\
                <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"\
                    viewBox="-16 -16 62 62" enable-background="new 0 0 62 62" xml:space="preserve">\
                    <polygon fill="#fff" points="19.1,15.5 29.2,5.3 29.9,4.6 29.2,3.9 27.1,1.8 26.4,1.1 25.7,1.8 15.5,11.9 5.3,1.8 4.6,1.1\
                    3.9,1.8 1.8,3.9 1.1,4.6 1.8,5.3 11.9,15.5 1.8,25.7 1.1,26.4 1.8,27.1 3.9,29.2 4.6,29.9 5.3,29.2 15.5,19.1 25.7,29.2 26.4,29.9\
                    27.1,29.2 29.2,27.1 29.9,26.4 29.2,25.7 "/>\
                </svg>\
            </div>\
            <div class="mece-content-wrapper">\
                <div class="mece-content">\
                    <div class="mece-row-container mece-row-container--no-messages">\
                    </div>\
                </div>\
            </div>\
        </div>';

    function init() {
        $(document).ready(function () {
            // TODO: maybe use data-id to find element
            $mainDiv = $(mainDivId).append(containerTemplate);
            $containerDiv = $mainDiv.find('.mece');
            $rowContentDiv = $containerDiv.find('.mece-content');
            $iconDiv = $containerDiv.find('.mece-icon');
            $badgeDiv = $containerDiv.find('.mece-badge');
            $noMessagesDiv = $containerDiv.find('.mece-row-container--no-messages');
            //TODO comment this
            initializeMomentAndLocales();
            readAndInitializeAttributeValues();
            dialog();
            markNotificationAsRead();
            start();
        });
    }

    function changeBadgeText(value) {
        $badgeDiv.text(value);
    }

    function initializeMomentAndLocales() {
        debug('initializerStuff in');
        loadMomentJS();

        var lang = $mainDiv.data("language");
        if (lang && (lang === 'fi' || lang === 'sv' || lang === 'en')) {
            language = lang;
        }

        initLocales();
        debug('initializerStuff out');
    }

    function start() {
        debug('start');
        fetchNotifications();
        updateNotificationTime(); // TODO:
        setInterval(function () {
            fetchNotifications();
            updateNotificationTime();
            // hasNotifications();
        }, pollingInterval);
    }

    function fetchNotifications() {
        debug('fetchNotifications');

        // http://api.jquery.com/jQuery.ajax/#jqXHR
        getUserNotifications().done(function (response) {
            onGetNotificationsDone(response);
            hasNotifications();
        }).fail(function (error) {
            // TODO: interval cancellation in error cases
            debug("ERROR " + JSON.stringify(error));
            showNoNotificationsMsgOnError();
        });
    }

    function getUserNotifications() {
        var query = {};
        if (startingTime !== '0') {
            query.startingTime = startingTime;
        }
        query.token = meceToken;
        query.host = meceHost;
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
                debug(xhr.responseText);
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
                        linkUrl: notification.linkUrlEN,
                        linkText: notification.linkTextEN
                    },
                    fi: {
                        heading: notification.headingFI,
                        message: notification.messageFI,
                        linkUrl: notification.linkUrlFI,
                        linkText: notification.linkTextFI
                    },
                    sv: {
                        heading: notification.headingSV,
                        message: notification.messageSV,
                        linkUrl: notification.linkUrlSV,
                        linkText: notification.linkTextSV
                    }
                };

                return ([notification._id,
                    notification.message,
                    notification.linkUrl,
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

    function figurePollingInterval() {
        var intervalFromAttribute = $mainDiv.data("polling-interval");
        if (intervalFromAttribute && intervalFromAttribute > pollingInterval) {
            return intervalFromAttribute;
        }
        return pollingInterval;
    }

    function readAndInitializeAttributeValues() {
        pollingInterval = figurePollingInterval();
        meceDomain = $mainDiv.data("domain") || MECE_DEFAULT_DOMAIN;
        meceHost = $mainDiv.data("host") || MECE_DEFAULT_HOST;
        meceToken = $mainDiv.data("token");
        enableDebug = $mainDiv.data("enable-debug") || false;
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
        var translation = translations[key][myLanguage || language];
        debug("Translation: " + translation);
        return translation;
    }


    //TODO: rename function
    function hasNotifications() {
        $containerDiv.toggleClass('mece--no-messages', getNotificationsCount() === 0);
        $noMessagesDiv.html(translate('no_messages'));
        getUnreadNotificationsCount(false);
    }

    // TODO: if needed some error message could be shown. Now just "No messages"
    function showNoNotificationsMsgOnError() {
        $containerDiv.toggleClass('mece--no-messages', true);
        $noMessagesDiv.html(translate('no_messages'));
    }

    function getUnreadNotificationsCount(append) {
        var unreadMessagesLength = getNotifications().filter(':not(.mece-row-container--read)').length - 1;
        //TODO do with css flag
        $containerDiv.toggleClass('mece--has-unreads', unreadMessagesLength !== 0);  //
        changeBadgeText(unreadMessagesLength);
    }

    function getNotificationsCount() {
        //TODO: "no messages" viesti ei saisi olla samassa containerissa, toistaiseksi vahennetaan no messages divi
        return getNotifications().length - 1;
    }

    function getNotifications() {
        return $rowContentDiv.children('.mece-row-container');
    }

    function updateNotificationTime() {
        $rowContentDiv.children('.mece-row-container').each(function () {
            var submitted = $(this).find(".mece-hidden-submitted-time").first().text(),
                div = $(this).find("." + MECE_MSG_RECEIVED).first();
            if (div && submitted) {
                div.text(determineTime(submitted, language));
            }
        });
    }

    function chooseValue(field, notification) {
        debug('Seeking field ' + field + ' for language ' + language);
        var nextLang = {fi: 'sv', sv: 'en', en: 'fi'};
        var curLang = language;
        var value = notification[NOTIF_USE_TRANSLATION_IND][curLang][field];
        if (!value || value === 'undefined') {
            curLang = nextLang[curLang];
            value = notification[NOTIF_USE_TRANSLATION_IND][curLang][field];
        }
        if (!value || value === 'undefined') {
            curLang = nextLang[curLang];
            value = notification[NOTIF_USE_TRANSLATION_IND][curLang][field];
        }
        return value;
    }

    //TODO vaihda +:sat kenoviivoiksi
    // http://flexboxgrid.com/
    var rowTemplate =
        /*jshint multistr:true */
        '<div class="mece-row-container{7}" id="{0}">\
            <div class="mece-row mece-row--no-margins mece-top-xs"> <!--yksi rivi, jossa kaksi(kolme) kolumnia-->\
                <div> <!--Column 1 (kuva) flouttaava divi joka asettuu sisaltonsa kokoiseksi-->\
                    <div class="mece-row-avatar mece-padding">\
                        <img class="mece-row-avatar-picture" src="{1}">\
                    </div>\
                </div>\
                <div class="mece-col-xs"> <!--Column 2 (sisalto) venyy-->\
                    <div class="mece-row-content mece-padding">\
                        <div class="mece-row-content-title mece-h3 mece-text-ellipsis">\
                            <a target="_blank" href="{2}">{3}</a>\
                        </div>\
                        <div class="mece-row-content-para {8}">{4}</div>\
                        <div class="mece-row-content-received">{5}</div>\
                    </div>\
                </div>\
                <div> <!--flouttaava divi joka asettuu sisaltonsa kokoiseksi-->\
                    <div class="mece-row-actions">\
                    </div>\
                </div>\
                    <div class="mece-hidden-submitted-time mece-hidden">{6}</div>\
            </div>\
        </div>';


    function addRow(notification) {
        var avatar = function () {
            var DEFAULT_AVATAR_URL = IMAGES_URI + "/avatar.png",
                urlFoundInTheMassage = notification[NOTIF_AVATAR_IND];

            return urlFoundInTheMassage || DEFAULT_AVATAR_URL;
        };
        var myLinkUrl = chooseValue('linkUrl', notification) || notification[NOTIF_LINK_URL_IND];
        var myMessage = chooseValue('message', notification) || notification[NOTIF_MSG_IND];
        var myHeading = chooseValue('heading', notification) || notification[NOTIF_HEADING_IND];
        myLinkUrl = myLinkUrl === undefined || myLinkUrl === "undefined" ? "" : myLinkUrl;
        myMessage = myMessage === undefined || myMessage === "undefined" ? "&nbsp;" : myMessage;
        myHeading = myHeading === undefined || myHeading === "undefined" ? "&nbsp;" : myHeading;

        var mece_row = String.format(rowTemplate,
            notification[NOTIF_ID_IND],
            avatar(),
            myLinkUrl,
            myHeading,
            myMessage,
            determineTime(notification[NOTIF_SUBMITTED_IND], language),
            notification[NOTIF_SUBMITTED_IND],
            notification[NOTIF_READ_IND] ? ' mece-row-container--read' : '',
            notification[NOTIF_READ_IND] ? 'mece-para-ellipsis--read' : 'mece-para-ellipsis');

        $rowContentDiv.prepend(mece_row);
    }


    function markNotificationAsRead() {
        $rowContentDiv.on('click', '.mece-row-container', function () {

            var $msgElem = $(this);

            if ($msgElem.hasClass("mece-row-container--read") || $msgElem.hasClass("mece-row-container--no-messages")) {
                return;
            }

            var query = {};
            query.token = meceToken;
            query.id = this.id;
            query.host = meceHost;

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
                    $msgElem.addClass("mece-row-container--read");
                    $msgElem.find('.mece-para-ellipsis').toggleClass('mece-para-ellipsis--read');
                    getUnreadNotificationsCount(false);
                },
                error: function (xhr, status, error) {
                    console.log(xhr.responseText);
                }
            });
        });
    }


    // TODO: replace with CSS. click changes class.
    function dialog() {
        $iconDiv.click(function (e) {
            e.stopPropagation();
            $containerDiv.toggleClass("mece--open"); //, !isDialogVisible());
        });
    }

    function addNotifications(notifications) {
        $.each(notifications, function (i, n) {
            addRow(n);
        });
    }

    function startClient() {
        if (!started) {
            debug("loading widget");
            loadJQuery();
            started = true;
        }
    }

    return {
        startClient: startClient
    };

})();
