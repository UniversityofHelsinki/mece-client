/**
 * TÄmä on testi filu
 */
function test() {
    var url = 'https://ohtu-devel.it.helsinki.fi/mece/notifications/view/new/fi';
    var result = httpGet(url);
    document.write(result);
}

function httpGet(theUrl) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl); // false for synchronous request
    xmlHttp.withCredentials = true;
    xmlHttp.send( null );
    return xmlHttp.responseText;
}