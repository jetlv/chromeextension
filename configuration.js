/*
 Configuration file
 */
module.exports = {
    /*
     5.  maxDriverNumber = defaultDriverNumber + extraDriverNumber. If all default 10 drivers were busy when a user came, extra drivers would be launched. But after the fetching task done, those drivers would quit. When maxDriverNumber is set to 20, there are remaining 10 extra drivers could be launched.
     6. Each phantomjs driver will take up tens of MB of memory, so it's very important to set sensible threads limit when we are using this service. Now the functionality might meets our requirements well but I am still care about the performance. I don't know what's the order of magnitude of your users, so let's concern this together and make it better. I have many ways to make enhancement with it, I will proceed if we found some issues after performance testing.

     For 20 users at the search at the same time, we will need 200 driver which means 12GB
     before run
     total       used       free     shared    buffers     cached
     Mem:          7872       7244        627          0         68       5022

     After run
     total       used       free     shared    buffers     cached
     Mem:          7872       7657        214          0         71       4274

     since One driver costs around 60 MB, to take 2G, it will required 30 * 60 = 1800 M
     lets the maximum 60 * 60 = 3600 M
     */
    //***********************seo information collector configuration******************
    defaultDriverNumber: 2, //Default launched phantomjs browser
    maxDriverNumber: 60, //Limit number of phantomjs browser
    pageLoadTimeout: 60000,//msec that wait for a page loading
    //**********************Sep line - following are broken-link-chekcer configuration*************************
    maxSocketsPerHost: 50, //The maximum number of links per host/port to check at any given time. This avoids overloading a single target host with too many concurrent requests. This will not limit concurrent requests to other hosts.
    maxSockets : 50, //The maximum number of links to check at any given time.
    filterLevel : 1,//0: clickable links 1: clickable links, media, iframes, meta refreshes 2: clickable links, media, iframes, meta refreshes, stylesheets, scripts, forms3: clickable links, media, iframes, meta refreshes, stylesheets, scripts, forms, metadata
    cacheResponses: false,
    cacheExpiryTime: 3600000,
    requestMethod: 'head',
    excludedKeywords: ["captcha"],
    userAgent: 'Mozilla/5.0 (X11; 78; CentOS; US-en) AppleWebKit/527+ (KHTML, like Gecko) Bolt/0.862 Version/3.0 Safari/523.15',
    concurrency : 10, // request-promise concorrency
    singleTimeOut : 15000, //single req timeout
    //**********************Sep line - following are server&node.js configuration*************************
    reqTimeout : 120000, //msec, sockets will be killed after hanging ${reqTimeout} milliseconds
    debug: 1, //1 means debug mode, 0 means product mode
    //**********************Sep line - error code def*********************************************
    code_siteDown: 5, //Code which represents the target website was done.
    code_badResponse: 6, // 404, 503 etc.
    code_unknown: 999, //unknown error
    code_system: 10000, // system level error code
    code_correct: 1
}