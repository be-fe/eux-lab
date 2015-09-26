@#:{13084b209dfd38be607c97bb7559d3f3}#@
## 全局 share tpl模板

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
 
 
### defineTpls & useTpls

那么问题又来了, 全局tpl的构建过程中, js的加载顺序并不一定符合tpl构建的过程.

这个工具引入一个依赖加载的机制:

`defintTpls` 和 `useTpls`

`defineTpls (moduleName, callback)` 基本可以无视它, 它会在js编译`.share.js`文件时, 自动把文件内容包裹在`defineTpls()` 中.
 
`useTpls ([modules], callback)` 这个才是要用的. 例如:

```
// button.share.js
---button
<button>edit</button>

<script>
    tpl({
        _: locals.button
    }, 'button')
</script>

// person.share.js
---person
<div>
    <p>name: <span><%- d.name %><span></p>
    <p>age: <span><%- d.age %></span></p>
    <div class='controls'>
        <%= c.button %>
    </div>
</div>

<script>
    useTpls([shares.button], function() {
        tpl({
            _: locals.person,
            button: globals.button
        }, 'person');
    });
</script>
 
// personPage.demo.js
---pageBody
<div class="page-content">
    <h1>Persons</h1>
    <div class="person-list">
        <%= c.personList(d.persons) %>
    </div>
</div>

<script>
    useTpls([share.person], function() {
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

详细例子可以参照 [useTpls示例](example/index)