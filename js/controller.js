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
