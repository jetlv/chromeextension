let blc = require('broken-link-checker');
let config = require('./configuration.js');

let options = {
    honorRobotExclusions: false,
    maxSocketsPerHost: config.brokenCheckerThreads,
    filterLevel: config.filterLevel,
    cacheResponses: true
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
                originalUrl: originalUrl,
                resolvedUrl: resolvedUrl,
                brokenReason: brokenReason
            }
            if (result.internal) {
                customData.internalBrokenUrls.list.push(opt);
            } else {
                customData.externalBrokenUrls.list.push(opt);
            }
        }
    },
    page: function (error, pageUrl, customData) {
        let response = customData.response;
        let internalLinks = customData.internalBrokenUrls.list;
        let externalLinks = customData.externalBrokenUrls.list;
        let internalCount = internalLinks.length;
        let externalCount = externalLinks.length;
        response.end(JSON.stringify({
            code: 1,
            brokenInternalLink: {
                count: internalCount,
                list: internalLinks
            },
            brokenExternalLink: {
                count: externalCount,
                list: externalLinks
            }
        }));
    },
    end: function (customData) {
    }
});

let brokenFetcher = (link, response) => {
    let customEntity = {
        response: response,
        internalBrokenUrls: {},
        externalBrokenUrls: {}
    }
    customEntity.internalBrokenUrls.list = [];
    customEntity.externalBrokenUrls.list = [];
    htmlUrlChecker.enqueue(link, customEntity);
}

module.exports = brokenFetcher

;
