const http = require('http')
const url = require('url')
const fetcher = require('./fetcher.js');
const validator = require('validator');

/** default port is 3000 */
const port = 3000
/** 10000 as code wound be returned if request would not be completed successfully */
const errorCode = 10000;
/** 1 as code wound be returned if request completed well */
const correctCode = 1;

const requestHandler = (request, response) => {
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
    fetcher(link).then(function (optJson) {
        // console.log(optJson);
        response.end(JSON.stringify({
            code: correctCode,
            result: optJson
        }));
    });
}

const server = http.createServer(requestHandler)

server.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }
    console.log(`scraper server is listening on ${port}`)
})