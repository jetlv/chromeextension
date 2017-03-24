/**
 * Created by Administrator on 2017/3/24.
 */

let http = require('http');

http.createServer(function (req, res) {
    setTimeout(() => {
        res.end("this is my server")
    }, 2000);
}).listen(5000);
