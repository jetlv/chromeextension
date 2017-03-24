/**
 * Created by Administrator on 2017/3/24.
 */

let http = require('http');

http.createServer(function (req, res) {
    res.end("this is my server")
}).listen(5000);
