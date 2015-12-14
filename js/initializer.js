var meceNotifications = (function (mece) {
    var MECE_JQUERY_VERSION = '1.11.3';

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

