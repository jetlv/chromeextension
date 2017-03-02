/// <reference path="./include.d.ts" />

var webdriver = require('selenium-webdriver');
var phantomJs = require('selenium-webdriver/phantomjs');
var fs = require('fs');
var cheerio = require('cheerio');
var count = require('html-word-count');


function singleQuery(url) {
    var driver = new webdriver.Builder().forBrowser('phantomjs').build();
    return driver.get(url).then(function () {
        return driver.wait(function () {
            return driver.getPageSource().then(function (source) {
                var $ = cheerio.load(source);
                var title = $('title').text();
                var wordCount = count($('body').html());
                var metaContent = $('meta[name="description"]').attr('content');
                var canonical = $('link[rel="canonical"]').attr('href');
                var noindex = "no";
                var robots = $('meta[name="robots"]');
                if(robots.length > 0) {
                    var content = robots.eq(0).attr('content');
                    if(content.indexOf('noindex') !== -1) {
                        noindex = 'yes';
                    }
                }
                var optJson = {
                    url: url,
                    title: title,
                    metaContent: metaContent ? metaContent : null,
                    canonical: canonical ? canonical : null,
                    noindex: noindex,
                    wordCount: wordCount
                };
                var tagIndexArray = [1, 2, 3, 4];
                tagIndexArray.forEach(function (tagNum, index, array) {
                    optJson['h' + tagNum] = [];
                    $('h' + tagNum).each(function (index, element) {
                        optJson['h' + tagNum].push($(this).text());
                    });
                    optJson['h' + tagNum + ' count'] = $('h' + tagNum).length;
                });
                // fs.writeFileSync('opt_' + url.match(/(\w+)\.com/)[0] + '.json', JSON.stringify(optJson));
                driver.quit();
                return optJson;
            });
        }, 30000);
    });
}

module.exports = singleQuery;

