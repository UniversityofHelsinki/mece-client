var meceNotifications = (function (mece) {
    var $;
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
        var link = $("<a>").attr("href", notification[0]).text(notification[0]);
        var li = $("<li>").attr("id", "MN" + offset)
            .css("list-style-image", "url('images/" + (offset % 3 > 0 ? "car" : "photo") + ".png')")
            .css("height", "100px")
            //.css("display", "inline-block")
            .css("border-bottom", "1px solid #000")
            .append(link);
        ulList.append(li);
    }

    function dialog() {
        $("#meceIcon").click(function (e) {
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
            $("#meceIcon").removeClass("active");
        }

        $(document.body).click(function (e) {
            closeMenu();
        });
        $(".dialog").click(function (e) {
            e.stopPropagation();
        });
    }

    // Public members

    function init() {
        if (!mece.view.ready && dependenciesLoaded()) {
            $ = $ || mece.jQuery;
            dialog();
            __initWidgetList();
            if (mece.controller && mece.controller.initialized) mece.controller.start();
            mece.view.ready = true;
         }
    }

    function dependenciesLoaded() {
        return mece.initializer && mece.initializer.ready && mece.loggedIn
    }


    function add(notifications) {
        $.each(notifications, function (i, n) {
            __addWidgetIteminitWidget(i, n);
        });
    }

    (function __bootstrap() {
        mece.view = {init: init, notifications: {add: add}};
        mece.view.init();
    }());

    return mece;

})(meceNotifications || {});

