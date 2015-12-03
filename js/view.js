var meceNotifications = (function (mece) {
    var $;

    function __initWidgetList() {
        $(mece.contentDivId).append($("<ul/>").addClass("mece_list"));
    }

    // Notification li-element //
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

        var avatar = function () {
            var DEFAULT_AVATAR_URL = "images/avatar.png",
                urlFoundInTheMassage = notification[4]; //notification.avatar
            return urlFoundInTheMassage || DEFAULT_AVATAR_URL;
        };

        var shortenMessage = function (notificationMessageText) {
            var characterLimit = 75;
            if (!notificationMessageText) {
                return '';
            } else if (notificationMessageText.length > characterLimit) {
                return notificationMessageText.slice(0, characterLimit) + '...';
            } else {
                return notificationMessageText;
            }
        };

        var ulList = $(mece.contentDivId).find("ul");
        // TODO: MECE-365 "Otsikko on linkki. Otsikon teksti on joko viestin otsikko tai linkin otsikko."
        var link = $("<a>").attr("href", notification[1]).text(notification[2]);
        var image = $("<img>").attr("src", avatar()).text("avatar image");
        var titleDiv = $("<div>").append(link);
        var contentDiv = $("<div>").addClass("msg-content").text(shortenMessage(notification[0]));

        var outerDiv = $("<div>").addClass("notification-detail-view");
        var avatarDiv = $("<div>").addClass("avatar").append(image);
        var detailsDiv = $("<div>").addClass("notification-fields")
            .append(titleDiv)
            .append(contentDiv);
        outerDiv.append(avatarDiv).append(detailsDiv);

        var li = $("<li>").attr("id", "MN" + offset)
            .addClass("msg-item")
            .append(outerDiv);
        ulList.append(li);
    }

    function __icon() {
        var BELL_ICON_URL = "images/bell.png";
        $("#meceIcon").append($("<img>").attr("src", BELL_ICON_URL).text("bell image"));
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
            __icon();
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

