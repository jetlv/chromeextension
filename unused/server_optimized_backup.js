const http = require('http')
const url = require('url')
const fetcher = require('./fetcher_optimized.js');
const validator = require('validator');
const config = require('./configuration.js');
let kue = require('kue');
let queue = kue.createQueue();
let util = require('util');

/** default port is 3000 */
const port = 3000
/** 10000 as code wound be returned if request would not be completed successfully */
const errorCode = 10000;
/** 1 as code wound be returned if request completed well */
const correctCode = 1;
/** driver store*/
let allDrivers = [];
let allResponse = {};
let singleQuery = fetcher.singleQuery;

/** binding processing method */
queue.process('singleQuery', config.maxDriverNumber, function (job, done) {
    console.log('Working on process');
    console.log('Start working on ' + job.data.link);
    let link = job.data.link;
    let kw = job.data.kw;
    let key = job.data.key;
    console.log(key);
    console.log(allResponse);
    console.log(allResponse["" + key]);
    let response = allResponse["" + key];
    let driverEntity = null;
    allDrivers.forEach(function (entity, index, array) {
        if (entity.busy == 0) {
            driverEntity = entity;
        }
    });
    if (!driverEntity) {
        if (allDrivers.length < config.maxDriverNumber) {
            let newDriver = fetcher.newDriver(1);
            allDrivers.push(newDriver);
            console.log('New driver created  - ' + allDrivers.length + ' drivers here');
            singleQuery(newDriver, link, kw).then(function (optJson) {
                let index = allDrivers.indexOf(newDriver);
                allDrivers.splice(index, 1);
                response.end(JSON.stringify({
                    code: correctCode,
                    result: optJson
                }));
                done();
            });
        } else {
            response.end(JSON.stringify({
                code: errorCode,
                result: "too many requests, please retry later"
            }));
            done();
        }
    } else {
        singleQuery(driverEntity, link, kw).then(function (optJson) {
            response.end(JSON.stringify({
                code: correctCode,
                result: optJson
            }));
            done();
        });
    }
});

const requestHandler = (request, response) => {
    /** replace circle*/
    var reqUrl = request.url
    /**  parse url */
    var queryObject = url.parse(reqUrl, true).query;
    var link = queryObject.link;
    var kw = queryObject.keyword;
    if (!link) {
        response.end(JSON.stringify({
            code: errorCode,
            message: 'Please provide target link'
        }));
        return;
    }
    /** Validate url */
    var validatorOptions = {protocols: ['http', 'https']};
    if (!validator.isURL(link, validatorOptions)) {
        response.end(JSON.stringify({
            code: errorCode,
            message: 'Wrong url ' + link
        }));
        return;
    }
    // console.log('Start creating job');
    let key = Date.now();
    var job = queue.create('singleQuery', {
        link: link,
        kw: kw,
        key : key
    }).save(function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log('Working on create');
            allResponse["" + key] = response;
        }
    });
    job.on('complete', function (result) {
        console.log('Working on complete');
        let key = job.data.key;
        allResponse["" + key] = null;
        // allResponse.delete("" + key);
        console.log('Now driver array length ' + allDrivers.length);
        // console.log('Now response array ' + JSON.stringify(allResponse));
    });
}

const server = http.createServer(requestHandler)

server.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }
    let defaultDriverCount = config.defaultDriverNumber;
    let count = 0;
    while (count < defaultDriverCount) {
        allDrivers.push(fetcher.newDriver(0));
        count++;
    }
    console.log(`scraper server is listening on ${port}`)
    console.log(allDrivers.length + ' instances are running');
})