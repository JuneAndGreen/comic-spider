'use strict';

const path = require('path');
const Args = require('../src/args');

const sourceUrl = ['http://manhua.dmzj.com/mingrijiangdeshuishoufu', 'http://manhua.dmzj.com/qiguaidejiejie'];
const dirPath = path.join(__dirname, './');
const proxy = 'http://dev-proxy.oa.com:8080';

new Args([...sourceUrl, '-o', dirPath, '-p', proxy]);