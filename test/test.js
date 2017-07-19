'use strict';

const path = require('path');
const comicSpider = require('../index');

comicSpider({
    sourceUrl: ['http://manhua.dmzj.com/mingrijiangdeshuishoufu', 'http://manhua.dmzj.com/qiguaidejiejie'],
    dirPath: path.join(__dirname, './'),
    proxy: 'http://dev-proxy.oa.com:8080',
});