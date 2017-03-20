/*
 Configuration file
 */
module.exports = {
    //***********************seo information collector configuration******************
    defaultDriverNumber: 3, //Default launched phantomjs browser
    maxDriverNumber: 6, //Limit number of phantomjs browser
    //**********************Sep line - following are broken-link-chekcer configuration*************************
    maxSocketsPerHost: 5, //The maximum number of links per host/port to check at any given time. This avoids overloading a single target host with too many concurrent requests. This will not limit concurrent requests to other hosts.
    maxSockets : 5, //The maximum number of links to check at any given time.
    filterLevel : 1 //0: clickable links 1: clickable links, media, iframes, meta refreshes 2: clickable links, media, iframes, meta refreshes, stylesheets, scripts, forms3: clickable links, media, iframes, meta refreshes, stylesheets, scripts, forms, metadata
}
