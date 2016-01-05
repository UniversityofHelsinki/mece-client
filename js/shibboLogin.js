var meceNotifications = (function (mece) {
    var MECE_LOGIN_URL = 'https://ohtu-devel.it.helsinki.fi/Shibboleth.sso/HYLogin';

    function debug(txt){
        console.log('module: SHIBBOLOGIN -- ' + txt + ' : ' + Date().toString());
    }

    function createIframe() {
        debug('createIframe');
        var iframe = document.createElement('iframe');
        iframe.style.display = "none";
        iframe.src = MECE_LOGIN_URL;
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
