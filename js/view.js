var meceNotifications = (function (mece) {
    //var MARK_READ_URL = 'https://ohtu-devel.it.helsinki.fi/mece/notifications/markRead/';
    var MARK_READ_URL = 'http://localhost:1337/mece/notifications/markRead/';
    var $;
    var language = 'fi';

    function __initWidgetList() {
        //var BELL_ICON_URL = "images/bell.png";
        //$(mece.contentDivId).append($("<img/>").attr("id", "meceIcon").attr("src", BELL_ICON_URL).text("bell image"));
        $(mece.contentDivId).append($("<ul/>").addClass("mece_list"));
        $(mece.contentDivId).append($("<div/>").attr("ID", "meceNoNotificationsDiv"));
    }

    function checkIfNoNotifications() {
        if($(mece.contentDivId).find("li").length == 0) {
            $("#meceNoNotificationsDiv").text("Ei viestejä");
        }
        else {
            $("#meceNoNotificationsDiv").text("");
        }
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
                urlFoundInTheMassage = notification[5]; //notification.avatar
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

        var determineTime = function (received, language) {
            return moment(received).locale(language).calendar(); //TODO: Decide format
            //return moment(received).locale(language).fromNow();
        };

        var ulList = $(mece.contentDivId).find("ul");
        // TODO: MECE-365 "Otsikko on linkki. Otsikon teksti on joko viestin otsikko tai linkin otsikko."

        var myLink = notification[8][language].link||notification[2];
        var myLinkText = notification[8][language].linkText||notification[3];
        var myMessage = notification[8][language].message||notification[1];
        //Why isn't heading used?
        var myHeading = notification[8][language].link||notification[4];

        var link = $("<a>").attr("href", myLink).text(myLinkText);
        var image = $("<img>").attr("src", avatar()).text("avatar image");
        var titleDiv = $("<div>").append(link);
        var contentDiv = $("<div>").addClass("msg-content").text(shortenMessage(myMessage));
        var received = $("<div>").text(determineTime(notification[6], language).toUpperCase());

        var outerDiv = $("<div>").addClass("notification-detail-view");
        var avatarDiv = $("<div>").addClass("avatar").append(image);
        var detailsDiv = $("<div>").addClass("notification-fields")
            .append(titleDiv)
            .append(contentDiv)
            .append(received);

        outerDiv.append(avatarDiv).append(detailsDiv);

        var li = $("<li>").attr("id", notification[0]).addClass("msg-item");
        if (notification[7] && notification[7].read) {
            li.addClass("read-message");
        }
        li.append(outerDiv);
        ulList.append(li);
    }

    function markNotificationAsRead() {
        $(document).ready(function () {
            $('ul').on('click', 'li', function () {
                $.ajax({
                    url: MARK_READ_URL + this.id,
                    type: 'GET',
                    crossDomain: true,
                    dataType: "json",
                    xhrFields: {
                        withCredentials: true
                    },
                    success: function (data) {
                        $('#' + data._id).addClass("read-message");
                    },
                    error: function (xhr, status, error) {
                        console.log(xhr.responseText);
                    }
                });
            });
        });
    }

    function dialog() {
        var BELL_ICON_URL = "images/bell.png";
        $(mece.iconDivId).append($("<img>").attr("src", BELL_ICON_URL).text("bell image"));
        $(mece.iconDivId).click(function (e) {
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
            $(mece.iconDivId).removeClass("active");
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
            __initWidgetList();
            dialog();
            markNotificationAsRead();
            if (mece.controller && mece.controller.initialized) mece.controller.start();
            mece.view.ready = true;

            language = $(mece.contentDivId).attr("language") || language;
        }
    }

    function dependenciesLoaded() {
        return mece.initializer && mece.initializer.ready && mece.loggedIn;
    }


    function add(notifications) {
        $.each(notifications, function (i, n) {
            __addWidgetIteminitWidget(i, n);
        });
    }

    (function __bootstrap() {
        mece.view = {init: init, notifications: {add: add, check: checkIfNoNotifications}};
        mece.view.init();
    }());

    return mece;

})(meceNotifications || {});

