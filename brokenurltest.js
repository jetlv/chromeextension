
let blc = require('broken-link-checker');
var fs = require('fs');

let options = {
    honorRobotExclusions : false
}
let all = [];

var htmlUrlChecker = new blc.HtmlUrlChecker(options, {
    html: function (tree, robots, response, pageUrl, customData) {
    },
    junk: function (result, customData) {
    },
    link: function (result, customData) {
        if (result.broken) {
            console.log(blc[result.brokenReason]);
        } else if (result.excluded) {
            console.log(blc[result.excludedReason]);
        }
        all.push(result);
    },
    page: function (error, pageUrl, customData) {
    },
    end: function () {
        fs.writeFileSync('all.json', JSON.stringify(all));
    }
});
let pageUrl = 'http://www.milanoo.com/product/a-line-burgundy-taffeta-junior-bridesmaid-dress-with-spaghetti-straps-p117402.html';
htmlUrlChecker.enqueue(pageUrl, null);