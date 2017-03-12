/**
 * Created by 超 on 2017/3/2.
 */
/// <reference path="./include.d.ts" />

var htmlToText = require('html-to-text');
var cheerio = require('cheerio');
var fs = require('fs');
const regex = /[a-zA-Z0-9_\u0392-\u03c9\u0400-\u04FF]+|[\u4E00-\u9FFF\u3400-\u4dbf\uf900-\ufaff\u3040-\u309f\uac00-\ud7af\u0400-\u04FF]+|\w+/g

function density(bodyText, html, keyword) {
    // fs.writeFileSync('body.text', bodyText);
    var text = htmlToText.fromString(html, {
        wordwrap: false,
        ignoreImage: true,
        ignoreHref: true
    });
    var keywords = text.match(regex);
    if (keywords.length == 0) {
        return 0;
    }
    let isPhrase = keyword.split('\s').length > 1 ? true : false;
    if (!isPhrase) {
        var count = 0;
        keywords.forEach(function (kw, index, element) {
            if (kw.toLowerCase() == keyword.toLowerCase()) {
                count++;
            }
        });
        let realDensity = count / keywords.length;
        let percentDensity = (100 * realDensity).toFixed(2);
        return percentDensity;
    } else {
        let matched = bodyText.match(new RegExp(keyword.toString(), "ig"));
        // fs.writeFileSync('bodytext.txt', bodyText);
        let count = matched ? matched.length : 0;
        let realDensity = count / keywords.length;
        let percentDensity = (100 * realDensity).toFixed(2);
        return percentDensity;
    }
}


module.exports = density;
