// script from - $$PATH$$
$$CLOSURE_START$$
    var src = function(key) { return __src__[key] };
    var __src__ = {}, tmp;
    var __file_path__ = $$PATH$$;
    var _path = '/' + __file_path__;

    var bind = function(func, tplFunc, logic) {
        return __bind__(__file_path__, func, tplFunc, logic);
    };

    var locals = {};

    $$LOCALS$$

    $$SCRIPTS$$
$$CLOSURE_END$$