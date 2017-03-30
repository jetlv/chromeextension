/**
 * Created by 超 on 2017/3/22.
 */

let rp = require('request-promise');
let Promise = require('bluebird');

let con = 1;
let i = 0;
let ar = [];
while(i < 200) {
    i++;
    ar.push(i);
}
let start = Date.now();
Promise.map(ar, function (id) {
    return rp({uri: 'http://localhost:3000/seo?link=http://www.baidu.com', method: 'GET', json : true}).then(function (body) {
        // console.log(body);
        console.log(id + ' was done with code ' + body.code);
        return id;
    });
}, {concurrency: 10}).then(function() {
    console.log(Date.now() - start);
});
//
// let test = [1, 2, 3, 4 ,5];
// let index = test.indexOf(3);
// test.splice(index, 1);
//
// console.log(test)