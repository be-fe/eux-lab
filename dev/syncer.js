var fs = require('fs');
var npath = require('path');
var _ = require('lodash');
var md5 = require('md5');

var config = require('./config');
var utils = require('./utils');

var rgx = config.rgx;
var trim = _.trim;

var syncer = function (watcher) {
    watcher
        .on('unlinkDir', function (path) {
            path = path.split('\\').join('/');

            if (/^\./.exec(path)) return;
            var basename = npath.basename(path);
        })
        .on('addDir', function (path) {
            path = path.split('\\').join('/');

            var basename = npath.basename(path);
            if (/^\./.exec(path)) return;

            // syncing with normal page
            if (!rgx.nonSpecial.exec('/' + path)) {
                console.log('Page directory detected: %s', path); //@test

                var files = fs.readdirSync(path);
                if (!files.some(function (file) {
                        if (rgx.orderTxt.exec(file)) {
                            return true;
                        }
                    })) {
                    fs.writeFileSync(path + '/order.txt', '');
                }

                // non special dir means it's a page
                // we should check if XXX.md is present
                // create if not
                var files = fs.readdirSync(path);
                if (files.some(function (file) {
                        if (rgx.md.exec(file)) {
                            return true;
                        }
                    })) {
                    return;
                }

                // ok, set the folder name as the section's title
                // NOTE: the name of the .md file will be displayed as the title on the visible page
                fs.writeFileSync(path + '/' + basename + '.md', '@#:{' + md5(Math.random()) + '}#@\n\n\n');
            }
        });
};

var escape = function (text) {
    if (!text) return '';
    return text.split('&').join('&amp;')
        .split('<').join('&lt;')
        .split('>').join('&gt;');
};

var grabSiteLevels = function (path, level, levelItems, orderNumber) {
    levelItems = levelItems || [];

    var levelItem = {
        path: path,
        level: level,
        order: orderNumber,
        children: []
    };

    var files = fs.readdirSync(path);
    var order;
    if (fs.existsSync(path + '/order.txt')) {
        order = fs.readFileSync(path + '/order.txt').toString().split('\n')
            .map(function (line) {
                return trim(line)
            })
            .filter(function (line) {
                return !!line;
            });

        order = _.invert(order);
    } else {
        order = {};
    }
    files.forEach(function (file) {
        if (file.substr(0, 1) == '.' || file.substr(0, 1) == '_') return;

        var childOrderNumber = 999999;
        if (file in order) {
            childOrderNumber = order[file];
        }

        var filePath = path + '/' + file;
        if (rgx.md.exec(file)) {
            levelItem.title = npath.basename(file, npath.extname(file));
            return true;
        } else {
            var stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                grabSiteLevels(filePath, file, levelItem.children, childOrderNumber);
            }
        }
    });

    levelItems.push(levelItem);
    levelItem.children.sort(function (a, b) {
        return a.order > b.order ? 1 :
            a.order < b.order ? -1 :
                a.level > b.level ? 1 :
                    a.level < b.level ? -1 : 0;
    });
    return levelItems;
};

var renderLevel = function (levelItems, levelIdx) {
    levelItems = levelItems || grabSiteLevels('page');
    levelIdx = levelIdx || 0;
    var html = [];
    _.each(levelItems, function (item) {
        //console.log(item); // @test
        if (!item.title) return;
        html.push('<div class="level" level="' + levelIdx + '">');
        if (levelIdx) {
            html.push('<div class="title" url="' + item.path.split('"').join('\\"') + '/index">' +
                '   <span class="expanding-status">' +
                '       <span class="fa icon-down fa-caret-down"></span>' +
                '       <span class="fa icon-right fa-caret-right"></span>' +
                '       <span class="fa icon-none fa-circle"></span>' +
                '   </span>' +
                '<span class="title-content">' + escape(item.title) + '</span>' +
                '   <span class="read-status fa fa-check"></span>' +
                '</div>');
        }
        html.push('<div class="children">');
        html.push(renderLevel(item.children, levelIdx + 1));
        html.push('</div>');
        html.push('</div>');
    });
    return html.join('\n');
};

module.exports = {
    watch: syncer,
    renderLevel: renderLevel
};