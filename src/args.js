'use strict';

const Fetcher = require('./fetcher');
const config = require('../package.json');

const helpInfo = `
    Usage: ${config.name} [options] <sourceUrl> [<sourceUrl> ...]

    Options:
        -h, --help                   输出使用指南
        -v, --version                输出版本信息
        -o <dirPath>                 自定义输出目录，默认为process.pwd()
        -p <proxy>                   http代理
`;

class Args {
    constructor(args) {
        this.args = args;
        this.sourceUrls = [];
        this.dirPath = '';
        this.proxyUrl = '';

        this.commandMap = {};

        this.fetcher = new Fetcher();
        this.init();
    }

    // 初始化
    init() {
        if(!this.args.length) {
            return this.help();
        } else if(this.args.length >= 1) {
            let args = this.args;
            for (let i = 0, len = args.length; i < len; i++) {
                let arg = args[i];

                if (typeof arg === 'string') {
                    arg = arg.trim();

                    if (/\-{1,2}[a-zA-Z]/.test(arg)) {
                        // 其他参数
                        this.setArg(arg, args[i + 1]);
                        i++;
                    } else {
                        // url，即漫画章节页
                        this.sourceUrls.push(arg);
                    }
                } else if (arg instanceof Array) {
                    // url，即漫画章节页
                    this.sourceUrls = this.sourceUrls.concat(arg);
                }

                
            }
        }

        this.do();
    }

    // 设置指令和参数
    setArg(arg, nextArg) {
        switch(arg) {
            case '-v':
            case '--version':
                this.commandMap.version = true;
                break;
            case '-o':
                if(nextArg) {
                    this.commandMap.dir = true;
                    this.dirPath = nextArg;
                }
                break;
            case '-p':
                if(nextArg) {
                    this.commandMap.proxy = true;
                    this.proxyUrl = nextArg;
                }
                break;
            case '-h':
            case '--help':
            default:
                this.commandMap.help = true;
                break;
        }
    }

    do() {
        let commands = Object.keys(this.commandMap);
        for(let command of commands) {
            if(this.commandMap[command]) this[command]();
        }

        if(this.sourceUrls.length) {
            this.fetcher.setSourceUrls(this.sourceUrls);
            this.fetcher.do();
        }
    }

    // 是否为单一指令
    only(type) {
        let commands = Object.keys(this.commandMap);
        for(let command of commands) {
            if(this.commandMap[command] && command !== type) return false;
        }

        return true;
    }

    // 帮助信息
    help() {
        if(this.only('help') && !this.sourceUrls.length) console.log(helpInfo);
    }

    // 版本信息
    version() {
        if(this.only('version') && !this.sourceUrls.length) console.log(`v${config.version}`);
    }

    // 自定义输出目录
    dir() {
        this.fetcher.setDirPath(this.dirPath);
    }

    // http代理
    proxy() {
        this.fetcher.setProxy(this.proxyUrl);
    }
}

module.exports = Args;
