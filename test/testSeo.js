let expect = require('chai').expect;
let singleQuery = require('../fetcher').singleQuery;
let newDriver = require('../fetcher').newDriver;
let webdriver = require('selenium-webdriver');
let phantomJs = require('selenium-webdriver/phantomjs');
/**
 * Unit test of seo information collector
 */
describe('Test single query', function () {

    before(function () {
    });

    after(function () {
    });

    beforeEach(function () {
    });

    afterEach(function () {
    });


    it('general', function () {
        let driverEntity = newDriver(1);
        console.log('New driver created');
        return singleQuery(driverEntity, 'http://www.github.com', 'git').then(result => {
            console.log(result);
            expect(result.error).to.be.undefined;
            return result;
        }).catch(err => {
            console.log(err)
            expect(0, err).to.equal(1)
            return err;
        });
    });

    it('404', function () {
        let driverEntity = newDriver(1);
        console.log('New driver created');
        return singleQuery(driverEntity, 'http://www.github.com/dsadasdasdasdasdsadsa', 'git').then(result => {
            console.log(result);
            expect(result.message).equal(404);
            return result;
        }).catch(err => {
            console.log(err)
            expect(0, err).to.equal(1)
            return err;
        });
    });

});