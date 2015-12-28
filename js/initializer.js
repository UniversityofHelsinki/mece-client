var meceNotifications = (function (mece) {
    var MECE_JQUERY_VERSION = '1.11.3';
    var MECE_DEFAULT_DOMAIN = 'https://mece.it.helsinki.fi';
    var MECE_DEFAULT_WINDOW_LEFT_OFFSET = 250;
    var MECE_DEFAULT_WINDOW_TOP_OFFSET = 35;

    mece.contentDivId = "#mece-content-div";
    mece.iconDivId = "#mece-icon-div";
    mece.unreadCountSpanId = "#unread-count";
    mece.jQuery = null;
    mece.config = {};

    function debug(txt){
        console.log('module: INITIALIZER -- ' + txt + ' : ' + Date().toString());
    }

    function init() {
        debug('init');
        mece.initializer.ready = true;
        mece.domain = $(mece.contentDivId).attr("meceDomain") || MECE_DEFAULT_DOMAIN;
        mece.config.windowLeftOffset = $(mece.contentDivId).attr("meceWindowLeftOffset") || MECE_DEFAULT_WINDOW_LEFT_OFFSET;
        mece.config.windowTopOffset = $(mece.contentDivId).attr("meceWindowTopOffset") || MECE_DEFAULT_WINDOW_TOP_OFFSET;
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

     //<link rel="stylesheet" href="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css">
     //<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>
     //<script src="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js"></script>

    function loadBootstrap() {
        var BOOTSTRAP_LINK_HREF = "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css",
            BOOTSTRAP_SCRIPT_SRC = "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js";
        if (!window.bootstrap) {
            debug("loading bootstrap ..");
            var js = document.createElement('script');
            var css = document.createElement('link');
            css.setAttribute("rel", "stylesheet");
            css.setAttribute("href", BOOTSTRAP_LINK_HREF);

            if (js.readyState) {
                js.onreadystatechange = function () {
                    if (this.readyState == 'complete' || this.readyState == 'loaded') {
                        mece.bootstrap = window.bootstrap;
                        debug("mece.bootstrap:" + mece.bootstrap);
                    }
                };
            }

            (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(js);
            (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(css);
            debug("loading bootstrap .. OK");
        } else {
            mece.bootstrap = window.bootstrap;
            debug("loading bootstrap .. OK");
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
        loadBootstrap();
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

