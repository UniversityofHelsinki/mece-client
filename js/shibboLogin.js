var meceNotifications = (function (mece) {
    var MECE_LOGIN_URL = 'https://ohtu-devel.it.helsinki.fi/Shibboleth.sso/HYLogin';

    function createIframe() {
        var iframe = document.createElement('iframe');
        iframe.style.display = "none";
        iframe.src = MECE_LOGIN_URL;
        iframe.addEventListener('load', function () {
            setTimeout(function () {
                mece.loggedIn = true;
                if (mece.controller) mece.controller.init();
                if (mece.view) mece.view.init();
            }, 1000);
        }, false);
        iframe.addEventListener('error', function () {
        }, false);
        document.body.appendChild(iframe);
    }

    createIframe();

    return mece;
})(meceNotifications || {});