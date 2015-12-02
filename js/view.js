var meceNotifications = (function (mece) {
    var $;
    function __initWidgetList() {
        var ul = $("<ul/>")
            .addClass("mece_list")
        $(mece.contentDivId).append(ul);
    }


    // Notification li-element
    //
    // <li id="MN0" class="msg-item">
    //   <div class="notification-detail-view">
    //     <div class="avatar">
    //       <img src="http://localhost:63342/mece-client/images/photo.png" alt="msg-sender">
    //     </div>
    //     <div class="notification-fields">
    //       <div class="msg-title">Terveiset DOOsta. 0</div>
    //       <div class="msg-content">When Chuck Norris is in a crowded area, he doesn't walk around people. He walks through them._FI</div>
    //       <div class="link"><a href="http://wiki.helsinki.fi/pages/editpage.action?pageId=180358612">Link</a></div>
    //     </div>
    //   </div>
    // </li>
    function __addWidgetIteminitWidget(offset, notification) {
        var ulList = $(mece.contentDivId).find("ul");

        var link = $("<a>").attr("href", notification[1]).text(notification[2]);
        var image = $("<img>").attr("src", "http://localhost:63342/mece-client/images/photo.png");

        var titleDiv = $("<div>").text(notification[3]).addClass("msg-title");
        var contentDiv = $("<div>").addClass("msg-content").text(notification[0]);
        var linkDiv = $("<div>").addClass("link").append(link);

        var outerDiv = $("<div>").addClass("notification-detail-view");
        var avatarDiv = $("<div>").addClass("avatar").append(image);
        var detailsDiv = $("<div>").addClass("notification-fields")
            .append(titleDiv)
            .append(contentDiv)
            .append(linkDiv);
        outerDiv.append(avatarDiv).append(detailsDiv);

        var li = $("<li>").attr("id", "MN" + offset)
            .addClass("msg-item")
            .append(outerDiv);
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

