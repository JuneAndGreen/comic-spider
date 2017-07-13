'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const urlLib = require('url');
const request = require('request-promise-native');
const cheerio = require('cheerio');

const proxy = 'http://dev-proxy.oa.com:8080';

async function fetchImage(url, pageUrl, jar, writeStream) {
    let headers = {
        'Host': 'images.dmzj.com',
        'Referer': pageUrl,
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.96 Safari/537.36',
    };

    request.get({ url, proxy, headers, jar }).pipe(writeStream);
}

async function fetchComic(url) {
    let html = await request.get({ url, proxy });
    let $parent = cheerio.load(html);

    let links = $parent('.cartoon_online_border > ul li a');
    let sections = [];

    links.map((index, link) => {
        link = $parent(link);
        sections.push({
            url: link.attr('href'),
            name: link.text()
        });
    });
    
    for (let section of sections) {
        let pageUrl = 'http://manhua.dmzj.com/' + section.url;
        let jar = request.jar();
        let subHtml = await request.get({ url: pageUrl, proxy, jar });
        let $child = cheerio.load(subHtml);

        let headScript = $child('head script').html();

        let sandbox = {};
        vm.createContext(sandbox);

        vm.runInContext(headScript, sandbox);

        let dirname = path.join(__dirname, section.name);
        try {
            fs.accessSync(dirname);
        } catch (err) {
            fs.mkdirSync(dirname);
        }

        for (let imageUrl of sandbox.arr_pages) {
            imageUrl = 'http://images.dmzj.com/' + imageUrl;
            let imageUrlObj = urlLib.parse(decodeURIComponent(imageUrl));
            let pathArr = imageUrlObj.pathname.split('/');

            fetchImage(imageUrl, pageUrl, jar, fs.createWriteStream(path.join(dirname, pathArr[pathArr.length - 1])));
        }
    }
}

fetchComic('http://manhua.dmzj.com/mingrijiangdeshuishoufu').then(res => {
    // fs.writeFileSync(path.join(__dirname, './ret.html'), res, 'utf8');
}).catch(err => {
    console.error(err.message);
})