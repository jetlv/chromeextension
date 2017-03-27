let blc = require('broken-link-checker');
let config = require('./configuration.js');

/**
 *
 * @type {{honorRobotExclusions: boolean, maxSocketsPerHost: number, filterLevel: number, cacheResponses: boolean}}
 * checker's options, see https://github.com/stevenvachon/broken-link-checker
 */
let options = {
    honorRobotExclusions: false,
    maxSocketsPerHost: config.maxSocketsPerHost,
    maxSockets: config.maxSockets,
    filterLevel: config.filterLevel,
    cacheResponses: config.cacheResponses,
    excludedKeywords: config.excludedKeywords,
    userAgent: config.userAgent,
    requestMethod: config.requestMethod
}

var htmlUrlChecker = new blc.HtmlUrlChecker(options, {
    html: function (tree, robots, response, pageUrl, customData) {
        // let html = require('parse5').serialize(tree);
        // require('fs').writeFileSync('parsed.html', html);
    },
    junk: function (result, customData) {
    },
    link: function (result, customData) {
        console.log(result);
        if (result.broken && (result.brokenReason == 'HTTP_404')) {
            let originalUrl = result.url.original;
            if(originalUrl.startsWith("//")) {
                return;
            }
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
        if(error) {
            console.log(error);
        }
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

module.exports = brokenFetcher;
