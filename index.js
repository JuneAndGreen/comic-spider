'use strict';

const Args = require('./src/args');

module.exports = function(options) {
    let sourceUrl = options.sourceUrl;
    let dirPath = options.dirPath;
    let proxy = options.proxy;

    if(!sourceUrl) throw new Error('请输入漫画章节页url');

    let args = [sourceUrl];
    if(dirPath) args.push('-o', dirPath);
    if(proxy) args.push('-p', proxy);

    new Args(args);
}