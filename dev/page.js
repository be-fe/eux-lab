var nurl = require('url');
var fs = require('fs');
var marked = require('marked');
var less = require('less');
var npath = require('path');
var _ = require('lodash');

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

            // process markdowns
            html = marked(mdContent);

            // setting template
            html = fs.readFileSync(__dirname + '/templates/page.template.html').toString().replace('@@CONTENT@@', html);
            var paths = {};

            html = html.replace(rgx.demoTag, function(__, type, iframeProfile, fullName) {
                iframeProfile = iframeProfile || '!default';
                iframeProfile = trim(iframeProfile.substr(1));

                var parts = fullName.split('/');
                var name = trim(parts[0]);
                var func = trim(parts[1]);

                var comment = '<!-- ' + type + ' : ' + fullName + '-->\n';
                var content;

                ensureFiles(path, name);
                var demoPath = path + '/' + name;
                var url = '/' + path.split('"').join('\\""') + '/' + name.split('"').join('\\"') + '.demo' + '?func=' + func;

                var pageDemo = '<div><a class="-demo-page-link" '
                    + 'href="' + url
                    + '"' +
                    '>打开页面演示: ' + name + '/' + func +'</a></div>';

                if (type == 'inline') {
                    content = "<div demo=" + JSON.stringify(demoPath) + " func='" + func + "'></div>";
                    paths[demoPath] = 1;
                } else if (type == 'iframe') {
                    content =
                        "<div><iframe class='-demo-inline -demo-inline-" + iframeProfile + "' src='" + url + "'></iframe></div>"
                        + pageDemo
                        + "<div demo-info></div>";
                } else {
                    content = pageDemo;
                }
                return comment + content;
            });

            paths = _.map(paths, function(__, path) {return path;});
            html = html.replace(/@\\(inline|iframe|page)/g, '@$1');
            if (paths.length) {
                compiler.getDemo(paths, function (demo) {
                    html = html.replace('@@CSS@@', demo.css);
                    html = html.replace('@@JS@@', demo.js);

                    res.end(html);
                });
            } else {
                html = html.replace('@@CSS@@', '');
                html = html.replace('@@JS@@', '');
                res.end(html);
            }
            //console.log(html); // @test
            return;
        }
    } else if (rgx.demoPage.exec(path) && fs.existsSync(path + '.html')) {
        html = fs.readFileSync(__dirname + '/templates/demo-page.template.html').toString();
        var demoPath = path.replace(rgx.demoPage, '');
        var name = npath.basename(demoPath);
        compiler.getDemo([demoPath], function(demo) {
            html = html.replace('@@CLASS@@', config.globalClass);
            html = html.replace('@@CSS@@', demo.css);
            html = html.replace('@@JS@@', demo.js);
            html = html.replace('@@CONTENT@@', "<div demo=" + JSON.stringify(demoPath) + " func='" + req.query.func + "'></div>");

            res.end(html);
        });
        return;
    }

    next();
};


module.exports = {
    page: page
};