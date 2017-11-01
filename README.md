# comic-spider

二次元漫宅专用小工具~

> PS：仅支持动漫之家，仅支持http。

## 安装

```bash
npm install --save comic-spider
```

或

```bash
npm install -g comic-spider
```

## 使用方式1

```js
const comicSpider = require('comic-spider');

comicSpider({
    sourceUrl: 'http://xxxx', // 漫画章节页，可为数组
    // sourceUrl: [ 'http://xxxx', 'http://zzzz' ],
    dirPath: 'abc', // 自定义输出目录，默认为process.pwd()
    proxy: 'http://yyyy', // http代理
})

```

## 使用方式2

```
  Usage: comic-spider [options] <sourceUrl> [<sourceUrl> ...]

  Options:
    -h, --help                   输出使用指南
    -v, --version                输出版本信息
    -o <dirPath>                 自定义输出目录，默认为process.pwd()
    -p <proxy>                   http代理
```

直接拉取漫画到当前目录：

```bash
comic-spider http://xxxx
```

直接拉取多部漫画到当前目录：

```bash
comic-spider http://xxxx http://yyyy http://cccc
```

拉取漫画到指定目录，并且使用代理：

```bash
gomd http://xxxx -o ./output/ -p http://yyyy
```

## 协议

MIT

