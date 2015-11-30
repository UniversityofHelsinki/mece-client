var meceNotifications = (function (mece) {
    var $;

    // Private members

    function __initWidgetList() {
        var ul = $("<ul/>")
            .addClass("mece_list")
            .css("background-color", "WhiteSmoke")
            .css("color", "black");
        $(mece.contentDivId)
            .css("display", "none")
            .css("width", "500px")
            .css("height", "350px")
            .css("overflow", "auto")
            //.css("margin", "auto")
            .css("border", "3px solid navy");
        $(mece.contentDivId).append(ul);
        $(mece.iconId).css("border", "3px solid navy")
                            .css("height", "64px")
                            .css("background", "#e74c3c")
                            .css("padding", "0px 32px")
                            .css("border-bottom", "1px solid #C24032")
                            .css("text-align", "left")
                            .css("box-shadow", "0px 0px 4px #C24032");
    }

    function __addWidgetIteminitWidget(offset, notification) {
        var ulList = $(mece.contentDivId).find("ul");
        var link = $("<a>").attr("href", notification[1]).text(notification[0]);
        var li = $("<li>").attr("id", "MN" + offset)
                          .css("list-style-image", "url('images/" + (offset % 3 > 0 ? "car" : "photo") + ".png')")
                          .css("height", "100px")
                          //.css("display", "inline-block")
                          .css("border-bottom", "1px solid #000")
                          .append(link);
            ulList.append(li);
            //ulList.append($("<li>").attr("id", "MN" + i).attr("class", "meceNotification")
            //.css("list-style-image", "url('"+pngUrl+"')").append(n[0]));
    }

    // Public members

    function init() {
        console.log("view::init");
        if (mece.view && !mece.view.initialized) {
            if (mece.initializer && mece.initializer.jqueryLoaded) {
                $ = $ || mece.jQuery;
                __initWidgetList();
                mece.view.initialized = true;
                mece.controller.init();
                console.log("view::init OK");
            }
            else {
                if (mece.initializer) {
                    mece.initializer.init();
                }
            }
        }
    }

    function add(notifications) {
        console.log("view::add");
        $.each(notifications, function(i, n) { __addWidgetIteminitWidget(i, n); });
        console.log("view::add OK");
    }

    (function __bootstrap() {
        console.log("view::__bootstrap");
        mece.view = {init: init, notifications: {add: add}};
        mece.view.init();
    }());

    return mece;

})(meceNotifications || {});

