var meceNotifications = (function (mece) {
    var MECE_JQUERY_VERSION = '1.11.3';

    mece.contentDivId = "#mece-content-div";
    mece.iconDivId = "#mece-icon-div";
    mece.unreadCountSpanId = "#unread-count";
    mece.jQuery = null;

    function init() {
        mece.initializer.ready = true;
        if (mece.controller) mece.controller.init();
        if (mece.view) mece.view.init();
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
        mece.initializer = {init: init};
        loadMomentJS();
        loadJQuery();
    }());

    return mece;

})(meceNotifications || {});

