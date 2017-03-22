const http = require('http')
require('http-shutdown').extend();
const url = require('url')
const winston = require('winston');
const fetcher = require('./fetcher.js');
const validator = require('validator');
const config = require('./configuration.js');
const brokenFetcher = require('./brokenFetcher.js');

var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.File)({
            name: 'error-file',
            filename: 'filelog-error.log',
            level: 'error'
        })
    ]
});

/** default port is 3000 */
const port = 3000;
/** 10000 as code wound be returned if request would not be completed successfully */
const errorCode = config.code_system;
/** 1 as code wound be returned if request completed well */
const correctCode = 1;
/** driver store*/
let allDrivers = [];
let allResponse = {};
let singleQuery = fetcher.singleQuery;

/** clean stuff **/
process.on("SIGINT", function () {
    console.log("got SIGINT");
    server.shutdown(function () {
        console.log('Everything is cleanly shutdown.');
        process.exit(0);
    });
});

/**
 * Handle seo information
 * @param request
 * @param response
 */
const seoHandler = (request, response) => {
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
    let driverEntity = null;
    // console.log(allDrivers);
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
            });
        } else {
            response.end(JSON.stringify({
                code: errorCode,
                result: "too many requests, please retry later"
            }));
        }
    } else {
        //Only in this block, script will run on fetcher
        singleQuery(driverEntity, link, kw).then(function (optJson) {
                if (optJson.error) {
                    if (optJson.message == 'TimeoutError') {
                        response.end(JSON.stringify({
                            code: config.code_siteDown,
                            result: 'Server was unable to response for ' + config.pageLoadTimeout + ' ms, seems the server was done'
                        }));
                    } else if (optJson.message == '404') {
                        response.end(JSON.stringify({
                            code: config.code_404,
                            result: 'Page not found'
                        }));
                    } else {
                        response.end(JSON.stringify({
                            code: config.code_unknown,
                            result: 'unknown error'
                        }))
                    }
                } else {
                    response.end(JSON.stringify({
                        code: correctCode,
                        result: optJson
                    }));
                }
            }
        );
    }

}

const brokenHandler = (request, response) => {
    /** replace circle*/
    var reqUrl = request.url
    /**  parse url */
    var queryObject = url.parse(reqUrl, true).query;
    var link = queryObject.link;
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
    brokenFetcher(link, response);
}

const requestHandler = (request, response) => {
    /** replace circle*/
    let pathName = url.parse(request.url, true).pathname;
    if (pathName == '/seo') {
        seoHandler(request, response);
    } else if (pathName == '/broken') {
        brokenHandler(request, response);
    } else {
        response.end('unused command');
    }
}


const server = http.createServer(requestHandler).withShutdown();

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
let reqTimeout = config.reqTimeout;
if (!reqTimeout) {
    reqTimeout = 60000; //Default value is 60000
}
server.timeout = reqTimeout;

server.on('connection', (socket) => {
    socket.on('error', (error) => {
        logger.log(error);
    });
});
