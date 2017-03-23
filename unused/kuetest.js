/**
 * Created by 超 on 2017/3/2.
 */
const regex = /[a-zA-Z0-9_\u0392-\u03c9\u0400-\u04FF]+|[\u4E00-\u9FFF\u3400-\u4dbf\uf900-\ufaff\u3040-\u309f\uac00-\ud7af\u0400-\u04FF]+|\w+/g

let html = 'seo abc                      example abc ' + '\n' + 'def';

console.log(html.match(regex));