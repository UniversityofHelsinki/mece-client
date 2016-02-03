var meceNotifications = (function (mece) {
    var MECE_DEFAULT_LOGIN_URL = 'https://mece.it.helsinki.fi/Shibboleth.sso/HYLogin';
    mece.login_url = document.getElementById("mece-content-div").getAttribute("meceLoginUrl") || MECE_DEFAULT_LOGIN_URL;

    function debug(txt){
        console.log('module: SHIBBOLOGIN -- ' + txt + ' : ' + Date().toString());
    }

    function createIframe() {
        debug('createIframe');
        var iframe = document.createElement('iframe');
        iframe.style.display = "none";
        iframe.src = mece.login_url;
        iframe.addEventListener('load', function () {
            setTimeout(function () {
                debug('loggedIn');
                mece.loggedIn = true;
                if (mece.controller){
                    debug('mece.controller');
                    mece.controller.init();
                }
                if (mece.view){
                    debug('mece.view');
                    mece.view.init();
                }
            }, 1000);
        }, false);
        iframe.addEventListener('error', function () {
            debug('error');
        }, false);
        document.body.appendChild(iframe);
        debug('createIframe out');
    }

    createIframe();

    return mece;
})(meceNotifications || {});
