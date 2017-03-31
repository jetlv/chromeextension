/**
 * Created by Administrator on 2017/3/31.
 */

let bhttp = require('bhttp');

bhttp.request('http://www.youtube.com/GumtreeAustralia',  // TODO :: https://github.com/joepie91/node-bhttp/issues/3
    {
        discardResponse: true,
        headers: {"user-agent": require('./configuration.js').userAgent},
        responseTimeout: 20000,
        method: 'get'
    })
    .then(function (response) {
        console.log(response.statusCode)
    });