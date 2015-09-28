@#:{13084b209dfd38be607c97bb7559d3f3}#@

## 全局共享组件

那么问题来了, 我创建了一个模板, 想全局的复用他, 应该怎么办?

### 全局tpl编译

答案是使用全局的tpl编译.

```
tpl({
    _: function() { return 'hello world'; }
}, 'helloWorld')

globals.helloWorld(); // output 'hello world'
```

**注意, 全局的模板名称, 应该符合js的变量定义, 比如说, 不能含有空格.**
 
 
### define & require

那么问题又来了, 全局tpl的构建过程中, 你如何去载入相应的js呢?

这里要小聊一下eux-lab中demo组件的加载方式. 你看到每一个demo组件, 其实是已经被编译成 `/path/to/*.demo.js` 之类的脚本.
其中, js, html模板都被编译成直接的js代码, 放在这些 `*.demo.js` 中.
而样式则是利用 `demo-page.js` 中的 `addDemoStyle()` 来加载到页面中一个特定的 `<style>` tag里.

普遍情况下, 所有demo组件中只要有一个匿名的 `define()` 调用即可, 不用用 `require()`. 甚至说, 如果没有其它依赖的话, 连
`define()`都可以省掉.

```
// button.demo.html
---button
<button>edit</button>

<script>
    define([], function() {
        tpl({
            _: locals.button
        }, 'button')
    });
</script>

// person.demo.html
---person
<div>
    <p>name: <span><%- d.name %><span></p>
    <p>age: <span><%- d.age %></span></p>
    <div class='controls'>
        <%= c.button %>
    </div>
</div>

<script>
    define(['./button.demo.js], function() {
        tpl({
            _: locals.person,
            button: globals.button
        }, 'person');
    });
</script>
 
// person-page.demo.html
---pageBody
<div class="page-content">
    <h1>Persons</h1>
    <div class="person-list">
        <%= c.personList(d.persons) %>
    </div>
</div>

<script>
    define(['./person.demo.js'], function() {
        var pageTpl = tpl({
            _: locals.pageBody,
            personList: { 
                _: function(persons, c) {
                    var html = [];
                    
                    persons.forEach(function(person) {
                        html.push(c.person(person));
                    });
                    
                    return html.join('');
                }, 
                person: globals.person
            },
            
            // data used as default data
            data: {
                persons: [
                    {name: 'james', age: 12},
                    {name: 'marry', age: 21}
                ]
            }
        });
    });
</script>
```

详细例子可以参照 [组件复用示例](example/index)