/// <reference path="./include.d.ts" />

var webdriver = require('selenium-webdriver');
var phantomJs = require('selenium-webdriver/phantomjs');
var fs = require('fs');
var cheerio = require('cheerio');
var count = require('html-word-count');
var wordMatcher = require('word-regex');
var density = require('./density.js');
const config = require('./configuration.js');
const rp = require('request-promise');

/**
 * @param driver phantomjs driver
 * @param url target url
 * @param kw  keyword for density calculation
 * @returns {!ManagedPromise.<R>|*|Promise.<TResult>}
 */
function singleQuery(driverEntity, url, kw) {
    return httpChecker(url, 404).then(function (notfound) {
        if (notfound) {
            return {
                error: 1, //Tell server there is an error
                message: '404'
            }
        }
        else {
            let driver = driverEntity.driver;
            driverEntity.busy = 1;
            return driver.manage().timeouts().pageLoadTimeout(config.pageLoadTimeout).then(function () {
                return driver.get(url).then(function () {
                    return driver.wait(function () {
                        return driver.getPageSource().then(function (source) {
                            var $ = cheerio.load(source);
                            // driver.quit();
                            driverEntity.busy = 0;
                            if (driverEntity.tag == 1) {
                                driver.quit();
                            }
                            var title = $('title').text();
                            var bodyHtml = $('body').html();
                            var bodyText = $('body').text();
                            var wordCount = count(bodyHtml);
                            var kwDensity = null;
                            if (kw && bodyHtml) {
                                kwDensity = density(bodyText, bodyHtml, kw);
                            }
                            var metaContent = $('meta[name="description"]').attr('content');
                            var canonical = $('link[rel="canonical"]').attr('href');
                            var noindex = "no";
                            var robots = $('meta[name="robots"]');
                            if (robots.length > 0) {
                                var content = robots.eq(0).attr('content');
                                if (content.indexOf('noindex') !== -1) {
                                    noindex = 'yes';
                                }
                            }
                            var optJson = {
                                url: url,
                                title: title.trim(),
                                metaContent: metaContent ? metaContent.trim() : null,
                                canonical: canonical ? canonical : null,
                                noindex: noindex,
                                wordCount: wordCount
                            };
                            if (kw) {
                                optJson.density = {
                                    keyword: kw,
                                    keywordDensity: kwDensity + '%'
                                }
                            }
                            var tagIndexArray = [1, 2, 3, 4];
                            tagIndexArray.forEach(function (tagNum, index, array) {
                                optJson['h' + tagNum] = [];
                                $('h' + tagNum).each(function (index, element) {
                                    optJson['h' + tagNum].push($(this).text().trim());
                                });
                                optJson['h' + tagNum + ' count'] = $('h' + tagNum).length;
                            });
                            // fs.writeFileSync('opt_' + url.match(/(\w+)\.com/)[0] + '.json', JSON.stringify(optJson));
                            // driver.quit();
                            return optJson;
                        });
                    }, 30000);
                });
            }).catch(function (err) {
                return {
                    error: 1, //Tell server there is an error
                    message: err.name
                }
            });
        }
    });
};

/**
 * @tag 0 for default, 1 for appended
 * @returns {{busy: number, driver: !webdriver.WebDriver}}
 * Create a new phantomjs driver
 */
function createNewDriver(tag) {
    var driver = new webdriver.Builder().forBrowser('phantomjs').build();
    return {
        busy: 0,
        driver: driver,
        tag: tag
    }
}

/**
 * 404 503 etc checker
 * @param url
 * @param statusCode
 * @returns {*}
 */
function httpChecker(url, statusCode) {
    let options = {
        method: 'OPTIONS',
        uri: url,
        simple: false,
        resolveWithFullResponse: true
    }
    return rp(options).then(function (response) {
        if (response.statusCode == statusCode) {
            return true;
        } else {
            return false;
        }
    });
}

module.exports = {
    newDriver: createNewDriver,
    singleQuery : singleQuery
}