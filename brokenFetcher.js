let blc = require('broken-link-checker');
let config = require('./configuration.js');

let options = {
    honorRobotExclusions: false,
    maxSocketsPerHost: config.brokenCheckerThreads,
    filterLevel: 3
}

var htmlUrlChecker = new blc.HtmlUrlChecker(options, {
    html: function (tree, robots, response, pageUrl, customData) {
    },
    junk: function (result, customData) {
    },
    link: function (result, customData) {
        if (result.broken) {
            let originalUrl = result.url.original;
            let resolvedUrl = result.url.resolved;
            let brokenReason = result.brokenReason;
            let opt = {
                originalUrl : originalUrl,
                resolvedUrl : resolvedUrl,
                brokenReason : brokenReason
            }
            customData.brokenUrls.push(opt);
        }
    },
    page: function (error, pageUrl, customData) {
        let response = customData.response;
        let brokenUrls = customData.brokenUrls;
        console.log(brokenUrls.length);
        response.end(JSON.stringify({
            code: 1,
            brokenUrls: brokenUrls
        }));
    },
    end: function (customData) {

    }
});

let brokenFetcher = (link, response) => {
    htmlUrlChecker.enqueue(link, {
        response: response,
        brokenUrls: []
    });
}

module.exports = brokenFetcher

;
