/**
 * 设置是否在console中打印模板的信息.
 *
 * @type {boolean}
 */
var IF_PRINT_TPL_DEBUG = false;

var __binds = {};
var __bind__ = function (path, func, tplOrStr, logic) {
    /**
     * logic: {}
     *  data: function
     *  sel: {}
     *  method: {}
     *  events: {}
     *
     *  init: function
     *
     */
    logic = logic || {};
    logic.data = logic.data || _.noop;
    logic.init = logic.init || _.noop;

    if (typeof tplOrStr == 'string') {
        tplOrStr = __tpl__(tplOrStr);
    }
    __binds[path + ':' + func] = {
        tpl: tplOrStr,
        logic: logic
    };
    console.log(arguments);

    findBinds();
};

function extend(target, source, preventOverwrite) {
    for (var key in source) {
        var val = source[key];

        if (val && typeof val == 'object' && !(val instanceof Array)) {
            if (target[key] && typeof target[key] == 'object') {
                extend(target[key], val, preventOverwrite);
            } else {
                if (!preventOverwrite || !(key in target)) {
                    target[key] = extend({}, val, preventOverwrite);
                }
            }
        } else {
            if (!preventOverwrite || !(key in target)) {
                // other val
                target[key] = val;
            }
        }
    }
    return target;
}

;
(function () {

    function expandCompactObject(tplObj) {
        function setupObj(parts, val) {
            if (parts.length) {
                var obj = {};
                obj[parts.shift()] = setupObj(parts, val);
                return obj;
            } else {
                return val;
            }
        }

        var extendings = [], deleteKeys = [];
        for (var key in tplObj) {
            if (tplObj[key] && typeof tplObj[key] == 'object') {
                tplObj[key] = expandCompactObject(tplObj[key]);
            }

            if (/\./.exec(key)) {
                var parts = key.split('.');
                extendings.push(setupObj(parts, tplObj[key]));
                deleteKeys.push(key);
            }
        }
        extendings.forEach(function (extending) {
            extend(tplObj, extending);
        });
        deleteKeys.forEach(function (key) {
            delete tplObj[key];
        });
        return tplObj;
    }

    // formalise the tpl object
    function formaliseTplObj(tplObj) {
        if (typeof tplObj == 'function') {
            return {
                _: tplObj
            }
        } else if (tplObj && typeof tplObj == 'object') {
            if (tplObj._ && typeof tplObj._ != 'function' && typeof tplObj._ != 'string') {
                throw new Error('_ should be assigned as the entry method for the template.');
            }

            if (typeof tplObj._ == 'string') {
                tplObj._ = compile(tplObj._);
            }

            for (var key in tplObj) {
                if (key != '_') {
                    tplObj[key] = formaliseTplObj(tplObj[key]);
                }
            }
            return tplObj;
        } else {
            return tplObj;
        }
    }

    // generate a final tpl object based on all the possible tpl objs inside
    function finaliseTplObj(tplObj) {
        function getInheritedTplObj(tplObj) {
            var currentInheritedTplObj = {};
            if (tplObj && typeof tplObj == 'object') {
                if (tplObj._ext && tplObj._ext._ && tplObj._ext._.__tpl_obj__) {
                    extend(currentInheritedTplObj, tplObj._ext._.__tpl_obj__);
                }

                if (tplObj._) {
                    if (tplObj._.__tpl_obj__) {
                        // it means that the current tpl obj is actually an extension
                        extend(currentInheritedTplObj, tplObj._.__tpl_obj__);
                        delete tplObj._;
                    } else if (typeof tplObj._ == 'string') {
                        tplObj._ = tpl(tplObj._);
                    }
                }

                for (var key in tplObj) {
                    if (key != '_' && key != '_ext') {
                        var childInheritedTplObj = getInheritedTplObj(tplObj[key]);
                        if (childInheritedTplObj) {
                            currentInheritedTplObj[key] = currentInheritedTplObj[key] || {};
                            extend(currentInheritedTplObj[key], childInheritedTplObj);
                        }
                    }
                }
                return currentInheritedTplObj;
            }
        }

        var inheritedTplObj = getInheritedTplObj(tplObj);

        return extend(inheritedTplObj, tplObj);
    }

    function compileTplObj(tplObj) {
        if (tplObj && typeof tplObj == 'object') {
            var context = {};

            var fn = function (data) {
                //console.log(context); //@test

                if (data) {
                    data = {
                        val: data
                    };
                    extend(data, fn.__data__, true);
                } else {
                    data = fn.__data__ || {};
                }

                return tplObj._(data.val, context, fn._parent);
            };

            for (var key in tplObj) {
                if (key != '_' && key != 'data' && key.substr(0, 2) !== '__') {
                    var childFn = compileTplObj(tplObj[key]);
                    context[key] = childFn;
                    childFn._parent = context;
                }
            }

            fn.__tpl_obj__ = tplObj;
            if ('data' in tplObj) {
                fn.__data__ = {
                    val: tplObj.data
                }
            }
            context._this = fn;
            return fn;
        } else {
            throw new Error('You should not embed data to context object. Please put to data object instead.');
        }
    }

    function printCompiled(compiledTplObj, level) {
        level = level || 0;
        if (compiledTplObj.__visited__) {
            console.log(_.repeat('   ', level) + ' => circular loop');
        }

        compiledTplObj.__visited__ = true;
        for (var key in compiledTplObj) {
            var val = compiledTplObj[key];
            if (key.substr(0, 1) != '_') {
                if (val && typeof val == 'object') {
                    console.log(_.repeat('   ', level) + key + ':');
                    printCompiled(val, level + 1);
                } else if (typeof val == 'string') {
                    console.log(_.repeat('   ', level) + key + ' = ' + val);
                }
            }
        }
        delete compiledTplObj.__visited__;
    }

    function compile(tplObj, name) {
        if (!tplObj && tplObj != '') {
            tplObj = '### No template found. ###';
        }

        if (tplObj.__tpl_obj__) return tplObj;
        if (typeof tplObj == 'string') {
            var tmpTpl = _.template(tplObj);
            return function compiledLodashTemplate(data, context, parentContext) {
                return tmpTpl({d: data, c: context, p: parentContext});
            }
        }

        var myTplObj = formaliseTplObj(tplObj);
        myTplObj = expandCompactObject(myTplObj);
        myTplObj = finaliseTplObj(myTplObj);

        var compiled = compileTplObj(myTplObj);

        if (name && IF_PRINT_TPL_DEBUG) {
            console.log('### Template compiled : %s ###', name);
            printCompiled(compiled.__tpl_obj__);
        }
        return compiled;
    }

    window.__tpl__ = compile;
})();

var requiredTpl = function () {
    throw new Error('This context function is not yet speficied.');
};
var emptyTpl = _.noop;

var allData = {};
var globals = {};
var tpl = function (tplObj, name) {

    var fn = __tpl__(tplObj, name);

    if (name) {
        if (globals[name]) {
            console.warn('WARNING : global tpl %s is overwritten.', name);
        }
        globals[name] = fn;
    }
    return fn;
};

var compose = function (fn /* ... */) {
    var fns = arguments;
    return function () {
        for (var i = 0; i < fns.length; i++) {
            if (typeof fns[i] == 'function') {
                fns[i].apply(this, arguments);
            }
        }
    }
};


var __modules = {}, __tplCallbackObjs = [];
var __tryRunQueue = function () {

    while (__tplCallbackObjs.length) {
        var prevLen = __tplCallbackObjs.length;
        for (var i = __tplCallbackObjs.length; i-- > 0;) {
            var callbackObj = __tplCallbackObjs[i];
            __tryRunCallback(callbackObj, true);
            if (callbackObj.removed) {
                __tplCallbackObjs.splice(i, 1);
            }
        }

        for (var module in __modules) {
            var status = __modules[module];
            if (status == 'pending') {
                __modules[module] = 'ready';
            }
        }

        if (prevLen == __tplCallbackObjs.length) {
            break;
        }
    }
};

var __tryRunCallback = function (callbackObj, skipPush) {
    if (callbackObj.removed) {
        return;
    }

    var moduleNotRegistered = callbackObj.modules.filter(function (module) {
        return __modules[module] !== 'ready';
    });

    if (!moduleNotRegistered.length) {
        callbackObj.removed = true;
        callbackObj.callback();
    } else {
        if (!skipPush) {
            __tplCallbackObjs.push(callbackObj);

            moduleNotRegistered.forEach(function (module) {
                var fn = __modules[module];

                if (typeof fn === 'function') {
                    fn();
                }
            });
        }
    }
};

var defineTpls = function (moduleName, callback) {
    if (__modules[moduleName]) {
        throw new Error('You should not register modules with a same name.');
    }
    __modules[moduleName] = function () {
        __modules[moduleName] = 'holding';
        var callbackNumber = __tplCallbackObjs.length;
        callback();
        if (callbackNumber == __tplCallbackObjs.length) {
            __modules[moduleName] = 'ready';
            __tryRunQueue();
            __tplCallbackObjs = __tplCallbackObjs.filter(function (callbackObj) {
                return !callbackObj.removed;
            });
        } else {
            var modules = [];
            for (var i = callbackNumber; i < __tplCallbackObjs.length; i++) {
                modules = _.union(modules, __tplCallbackObjs[i].modules);
            }
            useTpls(modules, function () {
                __modules[moduleName] = 'pending';
            });
        }
    }
};

var useTpls = function (modules, callback) {
    modules.forEach(function (module) {
        if (!module) {
            throw new Error('Module name should be a valid string.');
        }
    });
    __tryRunCallback({
        modules: modules,
        callback: callback
    })
};

var checkTplCallbacks = function () {
    if (__tplCallbackObjs.length) {
        console.log(__tplCallbackObjs.map(function (callbackObjs) {
            return callbackObjs.modules.join(', ');
        }));
        throw new Error('The useTpls callback queue is not empty.');
    }
};

var __isDocumentReady = false;
var findBinds = function () {
    var rgxEventName = /^\s*(\w+)/g;
    if (!__isDocumentReady) return;

    var renderDemoInfo = function ($demoInfo) {
        var $demoDoc = $demoInfo.prev().prev().prev().find('iframe').contents();

        var sections = [];

        $demoDoc.find('[rendered-demo]').each(function () {
            var $rendered = $(this);

            sections.push({title: 'Demo DOM 结构', items: $demoDoc.find('body')});
            if ($rendered[0].tpl.__tpl_obj__) {
                sections.push({title: 'Demo 模板结构', items: $rendered[0].tpl.__tpl_obj__});
            }
        });

        globals.demoRenderInfo({
            $container: $demoInfo,
            sections: sections
        })
    };

    $('[demo-info]').each(function () {
        var $demoInfoToggle = $(this);

        useTpls([shares.demoInfo], function () {
            var toggleTpl = globals.demoInfoToggle;
            $demoInfoToggle.append(toggleTpl());

            $demoInfoToggle.on('click', 'a', function () {
                var $demoInfo = $demoInfoToggle.next('.-demo-info');
                if ($demoInfo.length) {
                    $demoInfoToggle.html(toggleTpl({'linkText': '展现'}));
                    $demoInfo.remove();
                } else {
                    $demoInfoToggle.html(toggleTpl({'linkText': '收缩'}));
                    $demoInfo = $(globals.demoInfo());
                    $demoInfoToggle.after($demoInfo);

                    renderDemoInfo($demoInfo);
                }
            });
        });
    });

    $('[demo]').each(function () {
        var $demo = $(this);

        var demo = $demo.attr('demo'), func = $demo.attr('func');
        var demoKey = demo + ':' + func;
        if (__binds[demoKey]) {
            var demoIniter = __binds[demoKey];

            // prepare the data
            if (typeof demoIniter.logic.data == 'function') {
                var data = demoIniter.logic.data();
            } else {
                data = JSON.parse(JSON.stringify(demoIniter.logic.data));
            }

            data = data || {};

            // generate the html
            var html = demoIniter.tpl(data);

            // render the initial html text
            $demo.html(html);
            $demo.attr('rendered-demo', 1);
            $demo[0].tpl = demoIniter.tpl;

            // assign the $ & $_ shortcuts
            var demoContext = {
                $_: $demo,
                $: function (selector) {
                    return $demo.find(selector);
                },
                d: data,
                self: demoIniter.logic
            };

            // init the elems based on the selector settings
            if (demoIniter.logic.sel) {
                _.each(demoIniter.logic.sel, function (selector, key) {
                    if (selector.substr(0, 1) == '!') {
                        demoContext.$[key] = function () {
                            return $demo.find(selector.substr(1));
                        }
                    } else {
                        demoContext.$[key] = $demo.find(selector);
                    }
                });
            }

            // extend methods to context
            _.extend(demoContext, demoIniter.logic.method);

            // init events
            if (demoIniter.logic.event) {
                _.each(demoIniter.logic.event, function (func, eventKey) {
                    var eventNameMatch = rgxEventName.exec(eventKey);
                    if (eventNameMatch) {
                        var eventName = eventNameMatch[1];
                        $demo.on(eventName, eventKey.replace(rgxEventName, ''), function (e) {
                            demoContext.$t = $(e.target);
                            func.bind(this)(e, demoContext);
                        });
                    }
                });
            }

            // finall call the init func
            demoIniter.logic.init(demoContext);

            $demo.removeAttr('demo');
        }
    });
};

;
(function () {
    function initIndexHash() {
        $('[hash-key]').each(function() {
            var $hash = $(this);
            $hash.html('page hash: <input>');
            $hash.find('input').val($hash.attr('hash-key'));
        }).on('mouseenter', function() {
            $(this).find('input').select().focus();
        });
    }

    $(function () {
        __isDocumentReady = true;
        checkTplCallbacks();
        findBinds();
        initIndexHash();
    });
})();