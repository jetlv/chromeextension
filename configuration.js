/*
 Configuration file
 */
module.exports = {
    //***********************seo information collector configuration******************
    defaultDriverNumber: 20, //Default launched phantomjs browser
    maxDriverNumber: 200, //Limit number of phantomjs browser
    pageLoadTimeout: 30000,//msec that wait for a page loading
    //**********************Sep line - following are broken-link-chekcer configuration*************************
    maxSocketsPerHost: 5, //The maximum number of links per host/port to check at any given time. This avoids overloading a single target host with too many concurrent requests. This will not limit concurrent requests to other hosts.
    maxSockets: 5, //The maximum number of links to check at any given time.
    filterLevel: 1,//0: clickable links 1: clickable links, media, iframes, meta refreshes 2: clickable links, media, iframes, meta refreshes, stylesheets, scripts, forms3: clickable links, media, iframes, meta refreshes, stylesheets, scripts, forms, metadata
    //**********************Sep line - following are server&node.js configuration*************************
    reqTimeout: 60000, //msec, sockets will be killed after hanging ${reqTimeout} millsec
    debug: 1, //1 means debug mode, 0 means product mode
    //**********************Sep line - error code def*********************************************
    code_siteDown: 5, //Code which represents the target website was done.
    code_badResponse: 6, // 404, 503 etc.
    code_unknown: 999, //unknown error
    code_system: 10000, // system level error code
    code_correct: 1
}
