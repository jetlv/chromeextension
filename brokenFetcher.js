let blc = require('./m_broken_link_checker/index.js');
let config = require('./configuration.js');
/**
 * For links counter
 */
let scrapeHtml = require("./m_broken_link_checker/internal/scrapeHtml");
let parseOptions = require('./m_broken_link_checker/internal/parseOptions');
let linkObj = require('./m_broken_link_checker/internal/linkObj');
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
        /**
         * Count outbounds links
         */
        let links = scrapeHtml(tree);
        let baseUrl = response.url;
        let outbounds = [];
        links.forEach(function (link, index, element) {
            linkObj.resolve(link, baseUrl, parseOptions(options));
            // console.log(link);
            if (!link.internal) {
                outbounds.push(link.url.resolved);
            }
        });
        console.log(outbounds);
        customData.externalLinksCount = outbounds.length;
    },
    junk: function (result, customData) {
    },
    link: function (result, customData) {
        // console.log(result);
        if (result.broken && ( result.brokenReason == 'HTTP_404')) {
            let originalUrl = result.url.original;
            if (originalUrl.startsWith("//")) {
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
        let response = customData.response;
        if (error) {
            response.end(JSON.stringify({
                code: 10000,
                message: error.message
            }));
        }
        let internalLinks = customData.internalBrokenUrls.list;
        let externalLinks = customData.externalBrokenUrls.list;
        let internalCount = internalLinks.length;
        let externalCount = externalLinks.length;
        response.end(JSON.stringify({
            code: 1,
            externalLinksCount: customData.externalLinksCount,
            brokenInternalLink: {
                count: internalCount,
                list: internalLinks
            },
            brokenExternalLink: {
                count: externalCount,
                list: externalLinks
            }
        }));
    }
    ,
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
