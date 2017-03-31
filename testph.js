/**
 * Created by Administrator on 2017/3/31.
 */
var webdriver = require('selenium-webdriver');
var co = require('co');
    let driver = new webdriver.Builder().forBrowser('phantomjs').build();
    console.log('run!');
    driver.get('https://www.google.com.au/webhp?sourceid=chrome-instant%26ion=1%26espv=2%26ie=UTF-8#q=rubbish+removal+melbourne%26*').then( ()=> {
        driver.getPageSource().then(source => {
            require('fs').writeFileSync('googleau.html', source);
        });
    });
