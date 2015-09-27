;(function() {

    define(['test2.demo.js'], function(test2) {

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

        test2.sayHi('test2');

        return {
            hello: 'world'
        }
    });

})();