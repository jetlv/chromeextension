let blc = require('broken-link-checker');

var htmlUrlChecker = new blc.HtmlUrlChecker({}, {
    html: function (tree, robots, response, pageUrl, customData) {
        // let html = require('parse5').serialize(tree);
        // require('fs').writeFileSync('parsed.html', html);
    },
    junk: function (result, customData) {
    },
    link: function (result, customData) {
        if (result.broken && (result.brokenReason == 'HTTP_404')) {
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

brokenFetcher('http://stackoverflow.com/questions/12507021/best-configuration-of-c3p0', {});