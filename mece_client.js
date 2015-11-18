/**
 * TÄmä on testi filu
 */
function test() {
    var url = 'https://ohtu-devel.it.helsinki.fi/mece/api/notifications/test';
    var result = httpGet(url);
    document.write(result);
}

function httpGet(theUrl) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}