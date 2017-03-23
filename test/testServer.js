let expect = require('chai').expect;
let singleQuery = require('../fetcher').singleQuery;
let newDriver = require('../fetcher').newDriver;
let webdriver = require('selenium-webdriver');
let phantomJs = require('selenium-webdriver/phantomjs');
let rp = require('request-promise');
/**
 * Please start server before running
 */
describe('Test server', function () {

    before(function () {
    });

    after(function () {
    });

    beforeEach(function () {
    });

    afterEach(function () {
    });


    it('general', function () {
        let options = {
            uri: 'http://localhost:3000/seo?link=http://baidu.com',
            method: 'GET'
        }
        return rp(options).then(body => {
            expect(body.code).equal(1);
            return 0;
        }).catch(err => {
            expect(0, err).equal(1);
            return 1;
        });
    });


});