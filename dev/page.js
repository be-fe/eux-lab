var nurl = require('url');
var fs = require('fs');
var marked = require('marked');
var less = require('less');
var npath = require('path');
var _ = require('lodash');
var md5 = require('md5');

var syncer = require('./syncer');
var compiler = require('./compiler');
var config = require('./config');
var utils = require('./utils');

var rgx = config.rgx;
var trim = _.trim;

var targetDir = function(url) {
    // targetting the right dir
    var parts = url.split('/');

    var metPage = false;
    parts = parts.filter(function(part) {
        if (!metPage && part == 'page' || !part) {
            return false;
        }
        return true;
    });

    console.log(parts);
};

var ensureFiles = function(path, name) {
    var filePath = path + '/' + name + '.demo.html';
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, '');
        var cssPath = path + '/' + name + '.demo.less';
        fs.writeFileSync(cssPath, '');
    }
};

var page = function(req, res, next) {

    if (req.url == '/build/public.css') {
        res.end(compiler.getCache('publicLess'));
        return;
    } else if (req.url == '/build/private.css') {
        res.end(compiler.getCache('privateLess'));
        return;
    } else if (req.url == '/build/share.js') {
        res.end(compiler.getCache('shareJs'));
        return;
    }

    var urlObject = nurl.parse(req.url);
    var path = decodeURIComponent(urlObject.pathname.replace(/^\//, '').replace(/\/$/, ''));
    console.log('Finding page to render : %s', path);

    if (rgx.index.exec(path)) {
        path = path.replace(rgx.index, '');
    }

    if (fs.existsSync(path) && fs.statSync(path).isDirectory()) {
        var mdFile, html;
        // process demos
        var queueLess = 1, demos = {};

        fs.readdirSync(path)
            .some(function(file) {
                if (rgx.md.exec(file)) {
                    mdFile = file;
                    return true;
                }
            });

        if (mdFile) {
            var mdContent = new String(fs.readFileSync(path + '/' + mdFile)).toString();

            // 如果没有page的index标记, 则新建一个
            var indexMatch = rgx.indexMarkerSingle.exec(mdContent);
            if (!indexMatch) {
                mdContent = '@#:{' + md5(Math.random()) + '}#@\n\n\n' + mdContent;
                fs.writeFileSync(path + '/' + mdFile, mdContent);

                //console.log(mdContent); //@test
            } else {
                //console.log(indexMatch[0]); //@test
            }

            // process markdowns
            html = marked(mdContent);

            // setting template
            html = fs.readFileSync(__dirname + '/templates/page.template.html').toString().replace('@@CONTENT@@', html);
            var paths = {};

            html = html.replace(rgx.demoTag, function(__, type, iframeProfile, bodyClass, fullName) {
                iframeProfile = iframeProfile || '!default';
                bodyClass = bodyClass || '.' + config.globalClass;

                iframeProfile = trim(iframeProfile.substr(1));
                bodyClass = trim(bodyClass.substr(1));

                var parts = fullName.split('/');
                var name = trim(parts[0]);
                var func = trim(parts[1]);

                var comment = '<!-- ' + type + ' : ' + fullName + '-->\n';
                var content;

                ensureFiles(path, name);
                var demoPath = path + '/' + name;
                var url = '/' + path.split('"').join('\\""') + '/' + name.split('"').join('\\"') + '.demo' + '?func=' + func + '&bodyClass=' + bodyClass ;

                var pageDemo = '<div><a class="-demo-page-link" '
                    + 'href="' + url
                    + '"' +
                    '>打开页面演示: ' + name + '/' + func +'</a></div>';

                if (type == 'inline') {
                    content = "<div demo=" + JSON.stringify(demoPath) + " func='" + func + "'></div>";
                    paths[demoPath] = 1;
                } else if (type == 'iframe') {
                    content =
                        "<div><iframe class='-demo-iframe -demo-iframe-" + iframeProfile + "' src='" + url + "'></iframe></div>"
                        + pageDemo
                        + "<div demo-info></div>";
                    paths[demoPath] = 1;
                } else {
                    content = pageDemo;
                }
                return comment + content;
            });

            paths = _.map(paths, function(__, path) {return path;});
            html = html.replace(/@\\(inline|iframe|page)/g, '@$1');

            html = html.replace(rgx.indexMarkerRepeat, '<div index-keys="$1" hash-key="$2"></div>');

            if (paths.length) {
                compiler.getDemo(paths, function (demo) {
                    html = html.replace('@@CSS@@', demo.css);
                    html = html.replace('@@JS@@', paths.map(function(path) {
                        return 'require(["/' + path + '.demo.js"], function() {});';
                    }).join('\n'));

                    res.end(html);
                });
            } else {
                html = html.replace('@@CSS@@', '');
                html = html.replace('@@JS@@', '');
                res.end(html);
            }
        }
        return;
    } else if (rgx.demoPage.exec(path) && fs.existsSync(path + '.html')) {
        html = fs.readFileSync(__dirname + '/templates/demo-page.template.html').toString();
        var demoPath = path.replace(rgx.demoPage, '');
        var name = npath.basename(demoPath);
        compiler.getDemo([demoPath], function(demo) {
            html = html.replace('@@CLASS@@', req.query.bodyClass || config.globalClass);
            html = html.replace('@@JS@@', 'require(["/' + demoPath + '.demo.js"], function() {});');
            html = html.replace('@@CONTENT@@', "<div demo=" + JSON.stringify(demoPath) + " func='" + req.query.func + "'></div>");

            res.end(html);
        });
        return;
    } else if (rgx.demoJs.exec(path)) {
        var demoPath = path.replace(rgx.demoJs, '');
        var name = npath.basename(demoPath);

        compiler.getDemoJs([demoPath], function(demoJs) {
            res.end(demoJs);
        });
        return;
    }

    next();
};


module.exports = {
    page: page
};