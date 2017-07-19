'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const urlLib = require('url');
const request = require('request-promise-native');
const cheerio = require('cheerio');

// 补全路径
function formatPath(filePath) {
    if(filePath.indexOf('/') === -1 && filePath.indexOf('\\') === -1) {
        return `./${filePath}`;
    } else {
        return filePath;
    }
}

// 是否是绝对路径
function isAbsolute(filePath) {
    return filePath.indexOf('.') !== 0; 
}

// 过滤文件中的不可用字符
function filterName(filterName) {
    filterName = filterName.replace(/[\/\\\:\*\?\"\<\>\|]/g, '-');
    return /[\.]*(.*)/g.exec(filterName)[1] || filterName;
}

class Fetcher {
    constructor(filePath) {
        this.dir = process.cwd();
        this.sourceUrls = [];
        this.dirPath = this.dir;
        this.proxy = '';
    }

    setSourceUrls(sourceUrls) {
        this.sourceUrls = sourceUrls;
    }

    setDirPath(dirPath) {
        dirPath = formatPath(dirPath);

        if(isAbsolute(dirPath)) {
            this.dirPath = dirPath;
        } else {
            this.dirPath = path.join(this.dir, dirPath || '');
        }
    }

    setProxy(proxyUrl) {
        this.proxy = proxyUrl;
    }

    do() {
        if(!this.sourceUrls.length) return;

        let promiseList = this.sourceUrls.map(sourceUrl => this.fetchComic(sourceUrl));

        Promise.all(promiseList).then(res => {
            // ignore
        }).catch(err => {
            console.error(err.message);
        });
    }

    fetchImage(url, pageUrl, jar, writePath) {
        let headers = {
            'Host': 'images.dmzj.com',
            'Referer': pageUrl,
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.96 Safari/537.36',
        };
        let proxy = this.proxy;

        let writeStream = fs.createWriteStream(writePath);
        request.get({ url, proxy, headers, jar })
            .pipe(writeStream)
            .on('finish', () => {
                console.log('[done] --> ' + writePath);
            });
    }

    async fetchComic(url) {
        let proxy = this.proxy;
        let html = await request.get({ url, proxy });
        let $parent = cheerio.load(html);


        // 抓取各个章节的信息
        let links = $parent('.cartoon_online_border > ul li a');
        let titleName = $parent('.anim_title_text h1').text();
        let sections = [];

        titleName = filterName(titleName); // 过滤漫画名
        let dirPath = path.join(this.dirPath, titleName);
        try {
            fs.accessSync(dirPath);
        } catch (err) {
            fs.mkdirSync(dirPath);
        }

        links.map((index, link) => {
            link = $parent(link);
            sections.push({
                url: link.attr('href'),
                name: filterName(link.text()), // 过滤章节名
            });
        });
        
        // 遍历章节
        for (let section of sections) {
            let pageUrl = 'http://manhua.dmzj.com/' + section.url;
            let jar = request.jar(); // 用于保持访问态
            let subHtml = await request.get({ url: pageUrl, proxy, jar });
            let $child = cheerio.load(subHtml);

            let headScript = $child('head script').html();

            // 在沙箱里获取各页图片的地址
            let sandbox = {};
            vm.createContext(sandbox);
            vm.runInContext(headScript, sandbox);

            let sectionPath = path.join(dirPath, section.name);
            try {
                fs.accessSync(sectionPath);
            } catch (err) {
                fs.mkdirSync(sectionPath);
            }

            // 遍历图片
            for (let imageUrl of sandbox.arr_pages) {
                imageUrl = 'http://images.dmzj.com/' + imageUrl;
                let imageUrlObj = urlLib.parse(decodeURIComponent(imageUrl));
                let pathArr = imageUrlObj.pathname.split('/');
                let imageName = decodeURIComponent(pathArr[pathArr.length - 1]);

                this.fetchImage(imageUrl, pageUrl, jar, path.join(sectionPath, filterName(imageName)));
            }
        }
    }

};

module.exports = Fetcher;