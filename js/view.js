var meceNotifications = (function (mece) {
    var $;

    mece.view = {
        init: init,
        add: add
    };

    function init() {
        $ = $ || mece.jQuery;
        $(mece.contentDivId).append("<ul/>");
        if (mece.controller && !mece.controller.initialized) {
            mece.controller.init();
        }
        mece.view.initialized = true;
    }

    function add(notifications) {
        var ulList = $(mece.contentDivId).find("ul");
        $.each(notifications, function (i, n) {
            ulList.append($("<li>").attr("id", "MN" + i).attr("class", "meceNotification").append(n));
        });
    }


    if (mece.initialized) {
        init();
    }
    return mece;

}(meceNotifications || {}));