/**
 * Created by 超 on 2017/3/22.
 */

let rp = require('request-promise');
let Promise = require('bluebird');

let con = 30;
let i = 0;
let ar = [];
while(i < con) {
    i++;
    ar.push(i);
}
let start = Date.now();
Promise.map(ar, function (id) {
    return rp({uri: 'http://localhost:3000/seo?link=http://127.0.0.1:5000/', method: 'GET', json : true}).then(function (body) {
        // console.log(body);
        console.log(id + ' was done with code ' + body.code);
        return id;
    });
}, {concurrency: con}).then(function() {
    console.log(Date.now() - start);
});
//
// let test = [1, 2, 3, 4 ,5];
// let index = test.indexOf(3);
// test.splice(index, 1);
//
// console.log(test)