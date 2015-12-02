var meceNotifications = (function (mece) {
    var $;
    function __initWidgetList() {
        var ul = $("<ul/>")
            .addClass("mece_list")
        $(mece.contentDivId).append(ul);
    }

    // one notification inside li-element
    // content:
    //    notification heading
    //    notification message
    //    notification link
    //    something else?
    //
    function __addWidgetIteminitWidget(offset, notification) {
        console.log("notification: " + notification);
        var ulList = $(mece.contentDivId).find("ul");
        var link = $("<a>").attr("href", notification[0]).text(notification[0]);
            link.css("color", "#005479")
            .css("text-decoration", "none");
        var li = $("<li>").attr("id", "MN" + offset)
            .css("list-style-image", "url('images/" + (offset % 3 > 0 ? "car" : "photo") + ".png')")
            .css("height", "100px")
            .css("border-bottom", "2px solid #f5f5f5")
            .css("background-color", "#FFF")
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

