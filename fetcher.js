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
const winston = require('winston');

let logger = new (winston.Logger)({
    transports: [
        new (winston.transports.File)({
            name: 'error-file',
            filename: 'filelog-error.log',
            level: 'error'
        })
    ]
});

/**
 * parse html method
 * @param source
 * @returns {{url, title: *, metaContent: null, canonical: *, noindex: string, wordCount}}
 */
let parseHtml = (source, url, kw, $) => {
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
}

/**
 * @param driver phantomjs driver
 * @param url target url
 * @param kw  keyword for density calculation
 * @returns {!ManagedPromise.<R>|*|Promise.<TResult>}
 */
function singleQuery(driverEntity, url, kw) {
    driverEntity.busy = 1;
    return checkResponseCode(url).then(function (statusCode) {
        if (statusCode >= 400) {
            if (statusCode == 999) {
                return {
                    error: config.code_siteDown,
                    message: statusCode
                }
            } else {
                return {
                    error: config.code_badResponse,
                    message: statusCode
                }
            }
        }
        else {
            let driver = driverEntity.driver;
            return driver.manage().timeouts().pageLoadTimeout(config.pageLoadTimeout).then(function () {
                return driver.get(url);
            }).then(function () {
                return driver.wait(function () {
                    return driver.getPageSource().then(function (source) {
                        var $ = cheerio.load(source);
                        if (driverEntity.tag == 1) {
                            driver.quit();
                            global.runningDrivers--;
                        }
                        return parseHtml(source, url, kw, $);
                    });
                }, 30000);
            }).catch(function (err) {
                logger.error(err);
                return {
                    error: config.code_unknown,
                    message: err
                }
            });
        }
    })
}


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
        method: 'GET',
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

/**
 * check http response code
 * @param url
 * @returns {*}
 */
function checkResponseCode(url) {
    let options = {
        method: 'GET',
        uri: url,
        simple: false,
        resolveWithFullResponse: true,
        timeout: config.pageLoadTimeout
    }
    return rp(options).then(function (response) {
        return response.statusCode;
    }).catch(function (err) {
        return 999;
    });
}

module.exports = {
    newDriver: createNewDriver,
    singleQuery: singleQuery
}