/**
 * Created by 超 on 2017/3/22.
 */

let rp = require('request-promise');
let Promise = require('bluebird');

let ar = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
let i = 0;
ar = [];
while(i < 50) {
    i++;
    ar.push(i);
}
Promise.map(ar, function (id) {
    return rp({uri: 'http://localhost:3000/seo?link=https://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html', method: 'GET', json : true}).then(function (body) {
        // console.log(body);
        console.log(id + ' was done with code ' + body.code);
    });
}, {concurrency: 10});
//
// let test = [1, 2, 3, 4 ,5];
// let index = test.indexOf(3);
// test.splice(index, 1);
//
// console.log(test)