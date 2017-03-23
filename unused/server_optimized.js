const http = require('http')
const url = require('url')
const fetcher = require('./fetcher_optimized.js');
const validator = require('validator');
const config = require('./configuration.js');
var kue = require('kue');
var queue = kue.createQueue();

/** default port is 3000 */
const port = 3000
/** 10000 as code wound be returned if request would not be completed successfully */
const errorCode = 10000;
/** 1 as code wound be returned if request completed well */
const correctCode = 1;
/** driver store*/
let allDrivers = [];

let singleQuery = fetcher.singleQuery;
queue.process('singleQuery', function (job, done) {
    let link = job.link;
    let kw = job.kw;
    let response = job.response;
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
            singleQuery(newDriver, link, kw).then(function (optJson) {
                let index = allDrivers.indexOf(newDriver);
                allDrivers.splice(index, 1);
                response.end(JSON.stringify({
                    code: correctCode,
                    result: optJson
                }));
            });
        } else {
            response.end(JSON.stringify({
                code: errorCode,
                result: "too many requests, please retry later"
            }));
        }
    } else {
        singleQuery(driverEntity, link, kw).then(function (optJson) {
            response.end(JSON.stringify({
                code: correctCode,
                result: optJson
            }));
        });
    }
});


const requestHandler = (request, response) => {
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
    var job = queue.create('singleQuery', {
        link: link,
        kw: kw,
        response: response
    }).save();
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