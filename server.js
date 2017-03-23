const http = require('http')
require('http-shutdown').extend();
const url = require('url')
const winston = require('winston');
const fetcher = require('./fetcher.js');
const validator = require('validator');
const config = require('./configuration.js');
const brokenFetcher = require('./brokenFetcher.js');

let logger = new (winston.Logger)({
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
const correctCode = config.code_correct;
/** driver store*/
if (config.debug == 0) {
    console.log = function () {
    };
}
let allDrivers = [];
let allResponse = {};
let singleQuery = fetcher.singleQuery;
global.runningDrivers = config.defaultDriverNumber;

/** clean stuff **/
process.on("SIGINT", function () {
    console.log("got SIGINT");
    server.shutdown(function () {
        console.log('Everything is cleanly shutdown.');
        process.exit(0);
    });
});

process.setMaxListeners(0); //Since we are going to set up many phantomjs drivers, so there are many listeners would be triggered, so cancel limit of listeners

let msgContainer = {
    EMPTY_LINK: 'Please provide target link',
    WRONG_LINK: 'Wrong url ',
    DRIVER_MAX: 'Max driver numbers reached',
    TIMEOUT: 'Server was unable to response, seems the server was done',
    UNKNOWN: 'unkown error, please contact author'
}
/**
 * response entity -
 */
class RespEntity {
    constructor(code, message) {
        this.code = code;
        this.message = message;
    };

    /**
     * generate the response json string
     */
    getEntityStr() {
        if (this.code == correctCode) {
            return JSON.stringify({code: this.code, result: this.message})
        } else {
            return JSON.stringify({code: this.code, message: this.message})
        }
    }
}

/**
 * Handle seo information
 * @param request
 * @param response
 */
const seoHandler = (request, response) => {
    console.log(global.runningDrivers + ' drivers are running');
    let reqUrl = request.url
    /**  parse url */
    let queryObject = url.parse(reqUrl, true).query;
    let link = queryObject.link;
    let kw = queryObject.keyword;
    if (!link) {
        response.end(new RespEntity(errorCode, msgContainer.EMPTY_LINK).getEntityStr());
        return;
    }
    /** Validate url */
    let validatorOptions = {protocols: ['http', 'https']};
    if (!validator.isURL(link, validatorOptions)) {
        response.end(new RespEntity(errorCode, msgContainer.WRONG_LINK + link).getEntityStr());
        return;
    }
    let driverEntity = null;
    allDrivers.forEach(function (entity, index, array) {
        if (entity.busy == 0) {
            driverEntity = entity;
        }
    });
    let finalResponse = null;
    if (!driverEntity) {
        if (global.runningDrivers < config.maxDriverNumber) {
            driverEntity = fetcher.newDriver(1);
            console.log('New driver created  - ' + global.runningDrivers + ' drivers here');
        } else {
            finalResponse = new RespEntity(errorCode, msgContainer.DRIVER_MAX).getEntityStr();
            response.end(finalResponse);
            return;
        }
    }
    singleQuery(driverEntity, link, kw).then(optJson => {
        driverEntity.busy = 0;
        global.runningDrivers--;
        console.log('Now ' + global.runningDrivers + ' drivers');
        if (driverEntity.tag == 1) {
            driverEntity = null;
        }
        if (!optJson.error) {
            finalResponse = new RespEntity(correctCode, optJson).getEntityStr();
        } else {
            if (optJson.error == 'TimeoutError') {
                finalResponse = new RespEntity(config.code_siteDown, msgContainer.TIMEOUT).getEntityStr();
            } else if (optJson.error == config.code_badResponse) {
                finalResponse = new RespEntity(config.code_badResponse, optJson.message).getEntityStr();
            } else {
                finalResponse = new RespEntity(config.code_unknown, msgContainer.UNKNOWN).getEntityStr();
            }
        }
    }).then(() => {
        response.end(finalResponse);
    });
}

const brokenHandler = (request, response) => {
    /** replace circle*/
    let reqUrl = request.url
    /**  parse url */
    let queryObject = url.parse(reqUrl, true).query;
    let link = queryObject.link;
    if (!link) {
        response.end(JSON.stringify({
            code: errorCode,
            message: 'Please provide target link'
        }));
        return;
    }
    /** Validate url */
    let validatorOptions = {protocols: ['http', 'https']};
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
});


let reqTimeout = config.reqTimeout;
if (!reqTimeout) {
    reqTimeout = 60000; //Default value is 60000
}
server.timeout = reqTimeout;

server.on('connection', (socket) => {
    socket.on('error', (error) => {
        logger.error(error);
    });
});

server.on('err', (error) => {
    logger.error(error);
});