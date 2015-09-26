var chokidar = require('chokidar');
var express = require('express');
var st = require('st');
var fs = require('fs');
var bodyParser = require('body-parser');

var config = require('./dev/config');
var simpleData = require('./dev/simple-data');
var syncer = require('./dev/syncer');
var compiler = require('./dev/compiler');
var page = require('./dev/page');

var watcher = chokidar.watch('page', {
    ignored: /[\/\\]\./
}).on('ready', function() {
    //watcher.on('all', function (event, path) {
    //    console.log(event, path);
    //});
});

syncer.watch(watcher);
compiler.watch(watcher);

var app = express();

app.use(bodyParser.urlencoded({extend: true}));

var getIndexPage = function(req, res, next) {
    console.log(req.url);
    var content = new String(fs.readFileSync('./dev/public/index.html'))
        .toString();
    content = content.replace('@@CONTENT_LIST@@', syncer.renderLevel());
    res.end(content);
};
app.get('/', getIndexPage);
app.get('/index.html', getIndexPage);

app.post('/simple-data/:key', simpleData.write);
app.get('/simple-data/:key', simpleData.read);

app.get('/page/**', page.page);
app.use(st({
    path: './page/',
    url: 'page',
    cache: false
}));

app.get('/build/**', page.page);

app.use(st({
    path: './dev/public/',
    url: '/',
    cache: false
}));


app.listen(config.port);
console.log('Server started on http://localhost:%s', config.port);