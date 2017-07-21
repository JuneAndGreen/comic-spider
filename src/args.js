'use strict';

const Easycmd = require('easycmd');

const Fetcher = require('./fetcher');
const config = require('../package.json');

let cmdConfig = {
    version: config.version,
    help: `
        Usage: ${config.name} [options] <sourceUrl> [<sourceUrl> ...]

        Options:
            -h, --help                   输出使用指南
            -v, --version                输出版本信息
            -o <dirPath>                 自定义输出目录，默认为process.pwd()
            -p <proxy>                   http代理
    `,
    options: [
        { alias: 'o', hasParam: true },
        { alias: 'p', hasParam: true },
    ]
};

class Args {
    constructor(args) {
        this.fetcher = new Fetcher();
        this.easycmd = new Easycmd(cmdConfig);
        
        let result = this.easycmd.run(args);
        let { params, cmds } = result;

        cmds.forEach(cmd => {
            if (cmd.alias && this['_' + cmd.alias]) this['_' + cmd.alias](cmd.value);
        });

        this.fetcher.setSourceUrls(params);
        this.fetcher.do();
    }

    // 自定义输出目录
    _o(dirPath) {
        this.fetcher.setDirPath(dirPath);
    }

    // http代理
    _p(proxyUrl) {
        this.fetcher.setProxy(proxyUrl);
    }
}

module.exports = Args;
