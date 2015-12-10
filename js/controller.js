var meceNotifications = (function (mece) {
    var MECE_URL = 'https://ohtu-devel.it.helsinki.fi/mece'; // for ohtu-testi.it.helsinki.fi/meceapp
    //MECE_URL = 'https://localhost/mece'; //for local development ARO
    var MECE_DEFAULT_POLLING_INTERVAL = 4000;
    var pollingInterval;
    var MECE_DEFAULT_CHANNELS = "";
    var MECE_CHANNEL_SEPARATOR = ",";
    var startingTime = '0';
    var notifications = [];
    var $;
    var USE_TRANSLATIONS = true;


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
        var lang = readLanguageAttribute();
        // set language to view
        var languageChanged = meceNotifications.view.notifications.setLanguage(lang);
        if(languageChanged){
            //console.log('readAndInitializeAttributeValues language changed: set starting time 0' + lang);
            startingTime = '0';
        }

        pollingInterval = readPollingIntervalAttribute();
        mece.channels = readChannelsAttribute();
    }
    
    function init() {
        if (!mece.controller.ready && dependenciesLoaded()) {
            $ = $ || mece.jQuery;
            readAndInitializeAttributeValues();
            start();
            mece.controller.ready = true;
        }
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
        var channelUrl = MECE_URL + "/notifications?" + $.param(query);

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
        if (!mece.controller.running) {
            // TODO: interval cancellation in error cases
            setInterval(function () {

                readAndInitializeAttributeValues();

                getNotificationsByChannels().done(function (response) {
                    var temps = response;

                    temps.sort(function (a, b) {
                        return a.submitted > b.submitted;
                    });

                    if (temps.length > 0) {
                        startingTime = temps[temps.length - 1].received;
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
                                     notification.avatar, //MECE-368: avatar kentää ei ole vielä olemassä mece kannassa
                                     notification.received,
                                     notification._recipients?notification._recipients[0]:null,
                                     USE_TRANSLATIONS?translations:{en:{}, fi:{}, sv:{}}
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
        mece.controller = {
            init: init,
            start: start
        };
        mece.controller.init();
    }());

    return mece;

})(meceNotifications || {});
