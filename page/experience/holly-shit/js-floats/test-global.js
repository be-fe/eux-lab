;(function() {
    define([], function() {

        tpl({
            _: function(d, c) {
                return c.sayHello();
            },
            sayHello: {
                _: function(d) {
                    return 'hello, ' + d.name;
                },
                data: {
                    name: 'liang'
                }
            }
        }, 'helloTpl');

        return {
            hello: 'world'
        }
    });
})();