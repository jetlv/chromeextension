const http = require('http')
require('http-shutdown').extend();
const url = require('url')
const winston = require('winston');
const fetcher = require('./fetcher.js');
const validator = require('validator');
const config = require('./configuration.js');
const brokenFetcher = fetcher.brokenFetcher;

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
        if (!this.code) {
            return JSON.stringify({result: this.message})
        }
        if (this.code == correctCode) {
            return JSON.stringify({code: this.code, result: this.message})
        } else {
            return JSON.stringify({code: this.code, message: this.message})
        }
    }
}


/**
 * To validate url
 * @param url
 */
let urlValidator = link => {
    /** Validate url */
    let validatorOptions = {
        protocols: ['http', 'https'],
        require_protocol: true,
        allow_underscores: true,
        allow_trailing_dot: true
    };
    if (link.indexOf('#') !== -1) {
        let mainPart = link.split('#')[0];
        if (!validator.isURL(mainPart, validatorOptions)) {
            return false;
        }
        return true;
    } else {
        if (!validator.isURL(link, validatorOptions)) {
            return false;
        }
        return true;
    }
}

/**
 * take a free driver
 */
let grabDriver = () => {
    let found = false;
    let foundDriver = null;
    while (!found) {
        let random = Math.floor(Math.random() * allDrivers.length);
        let driverEntity = allDrivers[random];
        if (driverEntity.busy == 0) {
            found = true;
            foundDriver = driverEntity;
        }
    }
    if (!found) {
        return foundDriver;
    } else {
        return fetcher.newDriver(1);
    }
}

/**
 * reinit a driver after running
 * @param driverEntity
 */
let cleanUp = driverEntity => {
    driverEntity.driver.quit();
    driverEntity.driver = fetcher.newDriver(0);
    driverEntity.busy = 0;
    console.log('Now ' + global.runningDrivers + ' drivers');
    if (driverEntity.tag == 1) {
        driverEntity = null;
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
    if (!urlValidator(link)) {
        response.end(new RespEntity(errorCode, msgContainer.WRONG_LINK + link).getEntityStr());
        return;
    }
    let driverEntity = grabDriver();
    let finalResponse = null;
    singleQuery(driverEntity, link, kw).then(optJson => {
        if (!optJson.error) {
            finalResponse = new RespEntity(correctCode, optJson).getEntityStr();
        } else {
            if (optJson.error == config.code_siteDown) {
                finalResponse = new RespEntity(config.code_siteDown, msgContainer.TIMEOUT).getEntityStr();
            } else if (optJson.error == config.code_badResponse) {
                finalResponse = new RespEntity(config.code_badResponse, optJson.message).getEntityStr();
            } else {
                finalResponse = new RespEntity(config.code_unknown, msgContainer.UNKNOWN + ' - ' + optJson.message).getEntityStr();
            }
        }
        return driverEntity;
    }).then((driverEntity) => {
        response.end(finalResponse);
        cleanUp(driverEntity);
        return 0;
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
    if (!urlValidator(link)) {
        response.end(new RespEntity(errorCode, msgContainer.WRONG_LINK + link).getEntityStr());
        return;
    }

    let driverEntity = grabDriver();

    fetcher.brokenFetcher(driverEntity, link).then(output => {
        let finalResponse = new RespEntity(null , output).getEntityStr();
        response.end(finalResponse);
    });
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
