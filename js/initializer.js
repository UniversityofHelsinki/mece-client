var MECE_JQUERY_VERSION = '1.4.2';
var MECE_LOGIN_URL = 'https://ohtu-devel.it.helsinki.fi/Shibboleth.sso/HYLogin';
var MECE_URL = 'https://ohtu-devel.it.helsinki.fi/mece/'; // for ohtu-testi.it.helsinki.fi/meceapp
//var MECE_URL = 'http://localhost:1337/mece'; //for local development
var MECE_NOAUTH = false;

//Modernizr code pasted here for now.
//!function(e,n,s){function o(e){var n=r.className,s=Modernizr._config.classPrefix||"";if(c&&(n=n.baseVal),Modernizr._config.enableJSClass){var o=new RegExp("(^|\\s)"+s+"no-js(\\s|$)");n=n.replace(o,"$1"+s+"js$2")}Modernizr._config.enableClasses&&(n+=" "+s+e.join(" "+s),c?r.className.baseVal=n:r.className=n)}function a(e,n){return typeof e===n}function t(){var e,n,s,o,t,f,r;for(var c in l)if(l.hasOwnProperty(c)){if(e=[],n=l[c],n.name&&(e.push(n.name.toLowerCase()),n.options&&n.options.aliases&&n.options.aliases.length))for(s=0;s<n.options.aliases.length;s++)e.push(n.options.aliases[s].toLowerCase());for(o=a(n.fn,"function")?n.fn():n.fn,t=0;t<e.length;t++)f=e[t],r=f.split("."),1===r.length?Modernizr[r[0]]=o:(!Modernizr[r[0]]||Modernizr[r[0]]instanceof Boolean||(Modernizr[r[0]]=new Boolean(Modernizr[r[0]])),Modernizr[r[0]][r[1]]=o),i.push((o?"":"no-")+r.join("-"))}}var i=[],l=[],f={_version:"3.2.0",_config:{classPrefix:"",enableClasses:!0,enableJSClass:!0,usePrefixes:!0},_q:[],on:function(e,n){var s=this;setTimeout(function(){n(s[e])},0)},addTest:function(e,n,s){l.push({name:e,fn:n,options:s})},addAsyncTest:function(e){l.push({name:null,fn:e})}},Modernizr=function(){};Modernizr.prototype=f,Modernizr=new Modernizr,Modernizr.addTest("cors","XMLHttpRequest"in e&&"withCredentials"in new XMLHttpRequest);var r=n.documentElement,c="svg"===r.nodeName.toLowerCase();t(),o(i),delete f.addTest,delete f.addAsyncTest;for(var u=0;u<Modernizr._q.length;u++)Modernizr._q[u]();e.Modernizr=Modernizr}(window,document);

var meceNotifications = (function (mece) {

    mece.contentDivId = "#mece-content-div";
    mece.iconId = "#meceIcon";
    mece.url = MECE_URL;
    mece.jQuery = null;

    function init() {
        console.log("initializer::init");

        //Placeholder. Decide what to display if stuff doesn't work. And what will be checked.
        //modernizrCheck();

        if (mece.initializer && !mece.initializer.initialized) {
            $ = $ || mece.jQuery;
            $(mece.contentDivId).append("<ul/>");
            loadJQuery();
            mece.initializer.initialized = true;
            console.log("initializer::init OK");
        }
    }

    function modernizrCheck() {
        var info = Modernizr.cors ? 'CORS works!' : 'CORS NOT working';
        var myDiv = document.createElement('div');
        var content = document.createTextNode(info);
        myDiv.appendChild(content);
        document.body.appendChild(myDiv);
    }

    function loadJQuery() {
        console.log("initializer::loadJQuery");
        if (window.jQuery === undefined || window.jQuery.fn.jquery !== MECE_JQUERY_VERSION) {
            var script_tag = document.createElement('script');
            script_tag.setAttribute("type", "text/javascript");
            script_tag.setAttribute("src", "https://ajax.googleapis.com/ajax/libs/jquery/" + MECE_JQUERY_VERSION + "/jquery.min.js");
            if (script_tag.readyState) {
                script_tag.onreadystatechange = function () { // For old versions of IE
                    if (this.readyState == 'complete' || this.readyState == 'loaded') {
                        onJQueryLoaded();
                    }
                };
            } else { // Other browsers
                script_tag.onload = onJQueryLoaded;
            }
            (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
        } else {
            // The jQuery version on the window is the one we want to use
            mece.jQuery = window.jQuery;
            login();
        }
    }

    function onJQueryLoaded() {
        console.log("initializer::onJQueryLoaded");
        // Restore $ and window.jQuery to their previous values and store the
        // new jQuery in our local jQuery variable
        mece.jQuery = window.jQuery.noConflict(true);
        console.log("onJQueryLoaded:        jQuery.fn.jquery: " + mece.jQuery.fn.jquery);
        console.log("onJQueryLoaded: window.jQuery.fn.jquery: " + window.jQuery.fn.jquery);
        mece.initializer.jqueryLoaded = true;
        loginIfWithShibbo();
    }

    function loginIfWithShibbo() {
        console.log("initializer::loginIfWithShibbo");
        if(!MECE_NOAUTH) {
            login();
        }
        else {
            mece.view.init();
        }
    }

    function login() {
        console.log("initializer::login");
        // Create a new script tag
        var iframe = document.createElement('iframe');
        iframe.style.display = "none";
        iframe.src = MECE_LOGIN_URL;
        // Call resolve when it is loaded
        iframe.addEventListener('load', function () {
            setTimeout(function () {
                console.log("initializer::login OK");
                mece.view.init();
            }, 1000);
        }, false);
        // Reject the promise if there is an error
        iframe.addEventListener('error', function () {
            console.log("initializer::login ERROR");
        }, false);
        // Add it to the body
        document.body.appendChild(iframe);
    }

    (function bootstrap() {
        console.log("initializer::bootstrap");
        mece.initializer = { init: init};
        mece.initializer.init();
    }());

    return mece;

})(meceNotifications || {});

