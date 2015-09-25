var fs = require('fs');
var npath = require('path');
var md5 = require('md5');
var less = require('less');
var _ = require('lodash');

var config = require('./config');
var rgx = config.rgx;

/*
 * private css
 * private js
 *
 * public css
 * public js
 *
 */
var resources = {
    commonLess: {},
    publicLess: {},
    privateLess: {},
    demoLess: {},
    shareJs: {},
    shareDefineJs: {},
    demoJs: {}
};

var parsePath = function (path) {
    var res = {
        path: path
    };
    if (rgx.commonLess.exec(path)) {
        res.type = 'commonLess';
        res.ext = '.common.less';
    } else if (rgx.publicLess.exec(path)) {
        res.type = 'publicLess';
        res.ext = '.public.less';
    } else if (rgx.privateLess.exec(path)) {
        res.type = 'privateLess';
        res.ext = '.private.less';
    } else if (rgx.demoLess.exec(path)) {
        res.type = 'demoLess';
        res.ext = '.demo.less';
    } else if (rgx.share.exec(path)) {
        res.type = 'shareJs';
        res.ext = '.share.html';
    } else if (rgx.demo.exec(path)) {
        res.type = 'demoJs';
        res.ext = '.demo.html';
    }

    if (!res.ext) return res;

    res.dir = npath.dirname(path);
    res.base = npath.basename(path, res.ext);

    return res;
};

var mkdir = function (path) {
    var dirname = npath.dirname(path);
    if (!fs.existsSync(dirname)) {
        mkdir(dirname);
        fs.mkdirSync(dirname);
    }
};

var getCachePath = function (filePath) {
    var basename = npath.basename(filePath);
    //console.log(md5(filePath), filePath); //@test
    if (npath.extname(filePath) == '.html') {
        return './temp/' + basename + '.' + md5(filePath).substr(0, 10) + '.js';
    } else {
        return './temp/' + basename + '.' + md5(filePath).substr(0, 10) + '.txt';
    }
};

var validateCache = function (filePath) {
    var cachePath = getCachePath(filePath);
    var fileStat = fs.statSync(filePath);

    //console.log(cachePath); //@test
    if (fs.existsSync(cachePath)) {
        //  check if cache is written to ./temp folder
        var cacheStat = fs.statSync(cachePath);

        if (fileStat.mtime < cacheStat.mtime) {
            return true;
        } else {
            return false;
        }
    } else {
        // otherwise just return false
        return false;
    }
};

// periodically execute compiling tasks and dump file content to file system.
// file dumping will use a lazier attitude
// useful to non-block file dumping

/**
 *
 * cron jobs : []
 *  $_: {}
 *      path: the path to the resource, dirname for js or filepath for less
 *      action:
 *          'unlinkDir' | 'addDir'
 *          'add' | 'change' | 'unlink'
 *
 */
var cronjobs = [];
setInterval(function () {
    // don't bother doing anything before everything is loaded
    if (readyState == 'not-ready') return;

    // just return if there is no job
    if (!cronjobs.length) return;

    // first run, we don't compile anything
    var commonLessTouched = false;
    var compileJobs = {};
    var foldersSeen = {};

    while (cronjobs.length) {
        var job = cronjobs.shift();
        var res = parsePath(job.path);

        if (job.event == 'unlinkDir') {
            // 当有文件夹被移除, 则需要把所有底下的资源都移除
            job.path = job.path + '/';
            for (var type in resources) {
                var resource = resources[type];

                var dirPathStrLen = job.path.length;
                var pathsToDelele = [];
                for (var path in resource) {
                    if (path.substr(0, dirPathStrLen) == job.path) {
                        pathsToDelele.push(path);
                    }
                }

                pathsToDelele.forEach(function (path) {
                    delete resource[path];
                });
            }

        } else if (job.event == 'addDir') {
            var addDir = function (path) {
                if (foldersSeen[path]) return;

                var files = fs.readdirSync(path);
                foldersSeen[path] = 1;

                files.forEach(function (file) {
                    var filePath = path + '/' + file;
                    var stat = fs.statSync(filePath);
                    if (stat.isFile()) {
                        addCronJob('add', filePath);
                    } else if (stat.isDirectory()) {
                        addDir(filePath);
                    }
                });
            };

            addDir(job.path);
        } else if (res.type == 'commonLess') {
            // because we touch the less common part, set the flag then
            commonLessTouched = true;

            // adding or removing the common less cache
            if (job.event == 'add' || job.event == 'change') {
                resources.commonLess[job.path] = fs.readFileSync(job.path).toString();
            } else {
                delete resources.commonLess[job.path];
            }
        } else {
            var dirname = npath.dirname(job.path);
            if (job.event == 'add' || job.event == 'change') {
                compileJobs[job.path] = res;
            } else if (job.event == 'unlink') {
                if (res.type == 'shareJs') {
                    delete resources['shareDefineJs'][job.path];
                }
                delete resources[res.type][job.path];
                delete compileJobs[job.path];
            }

            lazyGeneratedScriptDump();
        }
    }

    if (commonLessTouched) {
        var refreshLess = function (resource) {
            _.each(resource, function (_, path) {
                compileJobs[path] = parsePath(path);

                var cachePath = getCachePath(path);
                if (readyState == 'post-ready' && fs.existsSync(cachePath)) {
                    fs.unlinkSync(cachePath);
                }
            });
        };
        refreshLess(resources.publicLess);
        refreshLess(resources.privateLess);
        refreshLess(resources.demoLess);
    }

    _.each(compileJobs, function (res, path) {
        console.log('Compiling asset : %s', path);

        if (fs.existsSync(path)) {
            if (rgx.less.exec(path)) {
                compileCss(res, readyState == 'pre-ready' ? false : true);
            } else {
                compileJs(res, res.type == 'shareJs', readyState == 'pre-ready' ? false : true);
            }
        }
    });

    cronjobs = [];
    readyState = 'post-ready';
}, 500);

var addCronJob = function (event, path) {
    path = path.split('\\').join('/');
    if (event == 'unlinkDir' || event == 'addDir') {
        cronjobs.push({
            path: path,
            event: event
        });
    } else if (event == 'add' || event == 'unlink' || event == 'change') {
        var res = parsePath(path);
        if (!res.ext) return;

        cronjobs.push({
            path: path,
            event: event,
            res: res
        });
    }
};

var lazyFileDump = {};
var lazyGeneratedScriptDump = function () {
    var generates = {
        'publicLess': './build/public.css',
        'privateLess': './build/private.css',
        'shareJs': './build/share.js'
    };

    var addLazyJob = function (path, type) {
        lazyFileDump[path] = function () {
            return generateScript(type);
        };
    };

    for (var type in generates) {
        addLazyJob(generates[type], type);
    }
};
setInterval(function () {
    _.each(lazyFileDump, function (content, path) {
        if (typeof content == 'function') {
            content = content();
        }
        mkdir(path);
        fs.writeFileSync(path, content);
    });
    lazyFileDump = {};
}, 500);

// parsing .js and .html under the same folder
// and push the parsed text into the fileCache
var compileJs = function (res, isShareJs, noCacheCheck) {
    var cachePath = getCachePath(res.path);

    var stringifiedBase = JSON.stringify(res.base);
    if (isShareJs) {
        resources.shareDefineJs[res.path] = 'window.shares = window.shares || {};\n' +
            'window.shares[' + stringifiedBase + '] = ' + stringifiedBase + ';';
    }

    if (!noCacheCheck) {
        var isCacheValid = validateCache(res.path);
        if (isCacheValid) {
            resources[res.type][res.path] = fs.readFileSync(cachePath).toString();
            return;
        }
    }

    var content = fs.readFileSync(res.path).toString();

    var rgxSection = /^---\s*/mg;
    var rgxName = /^([\S\s]+?)\s*$/m;
    var sections = content.split(rgxSection);
    var rgxScript = /<script>([\s\S]+?)<\/script>\s*$/;

    var compiled = fs.readFileSync(__dirname + '/templates/js-compile-template.js').toString();

    compiled = compiled.replace(/\$\$PATH\$\$/g, JSON.stringify(res.path.replace(rgx.demo, '')));

    if (isShareJs) {
        compiled = compiled.replace('$$CLOSURE_START$$', 'defineTpls(' + stringifiedBase + ',function() {');
        compiled = compiled.replace('$$CLOSURE_END$$', '});');
    } else {
        compiled = compiled.replace('$$CLOSURE_START$$', ';(function() {');
        compiled = compiled.replace('$$CLOSURE_END$$', '})();');
    }

    var locals = [];
    var scripts = [];

    sections.forEach(function(section, idx) {
        if (idx) {
            var nameMatch = rgxName.exec(section);
            section = section.replace(rgxName, '');
            var name = nameMatch[1];
            locals.push('    tmp = __src__[' + JSON.stringify(name) + '] = [];\n')
        }

        section = section.replace(rgxScript, function(__, script) {
            scripts.push(script);
            return '';
        });

        if (idx) {
            var lines = section.split('\n');

            locals.push('  tmp.push(' + lines.map(function (line) {
                return JSON.stringify(line).split('</script>').join('<" + "/script>');
            }).join(");\n    tmp.push(") + ');\n');

            var stringifiedName = JSON.stringify(name);

            locals.push('     __src__[' + stringifiedName + '] = tmp.join("\\n");\n');

            locals.push('   locals[' + stringifiedName + '] = ' +
                'tpl(src(' + stringifiedName + '));\n');
        }
    });

    compiled = compiled.replace('$$LOCALS$$', locals.join(''));
    compiled = compiled.replace('$$SCRIPTS$$', scripts.join('\n'));

    resources[res.type][res.path] = lazyFileDump[cachePath] = compiled;
    lazyGeneratedScriptDump();

    return;
};

/**
 * concat common less
 * concat the less file
 * use less to compile
 * push to fileCache
 *
 * @param path the path of the file
 * @param cb execute the callback when css renderred successfully
 */
var compileCss = function (res, noCacheCheck) {
    var commonLess = concatCommon();
    var cachePath = getCachePath(res.path);

    var isCacheValid = validateCache(res.path);
    if (!noCacheCheck) {
        if (isCacheValid) {
            resources[res.type][res.path] = fs.readFileSync(cachePath).toString();
            return;
        }
    }

    var content = fs.readFileSync(res.path).toString();

    less.render(commonLess + '\n' + content,
        function (err, output) {
            if (err) {
                throw err;
            }
            resources[res.type][res.path] = output.css;
            lazyFileDump[cachePath] = output.css;
        });
};

var concatCommon = function () {
    return _.map(resources.commonLess, function (content) {
        return content;
    }).join('\n');
};

var readyState = 'not-ready';
var compiler = function (watcher) {
    watcher.on('all', function (event, path) {
        addCronJob(event, path);
    }).on('ready', function () {
        readyState = 'pre-ready';
    });
};

var generateScript = function (type) {
    var preContent;
    if (type == 'shareJs') {
        preContent = generateScript('shareDefineJs');
    } else {
        preContent = '';
    }
    return preContent + _.map(resources[type], function (content, path) {
            return '\n/* ---- PATH: ' + path + ' ---- */\n' + content;
        }).join('\n');
};

module.exports = {
    watch: compiler,
    getCache: function (type) {
        return generateScript(type);
    },
    getConcatCommon: function () {
        return concatCommon() + '\n';
    },
    getDemo: function(paths, callback) {
        if (!paths.length) return;
        var processCallback = function() {
            if (!((paths[0] + '.demo.html') in resources.demoJs)) {
                setTimeout(processCallback, 1000);
            }

            var css = [], js = [];

            paths.forEach(function (path) {
                js.push(resources.demoJs[path + '.demo.html'] || '');
                css.push(resources.demoLess[path + '.demo.less'] || '');
            });

            callback({
                js: js.join('\n'),
                css: css.join('\n')
            });
        };

        processCallback();
    }
};
