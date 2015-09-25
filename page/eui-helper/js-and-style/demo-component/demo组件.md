# demo组件

## 构成demo的元素

构成一个完整的demo实例很简单, 分成三部分:

* 样式 (.less)
* html
* 简单逻辑

中间很多demo之间复用的部分, 我们可以把它们抽取出来, 变成demo的公用组件. 通过这么做, 构建下一个页面时可以达到一个很高的效率.

** !!! 再次强调: 改动公用组件或样式时, 要小心, 因为可能影响到所有其他的页面 !!! **

其中, 样式可以存放在:

    *.public.less   // 编译至 build/public.css, 可以考虑直接在产品中使用
    *.private.less  // 编译至 build/private.css, 只存放在wiki中使用的专用样式
    

另外的html, 简单逻辑被封装在:
   
    *.share.html 
    
## *.share.html

`*.share.html` 中存放公有的demo组件, 其格式为:

    ---templateHtml
    // some template
    
    ---anotherTemplate
    // some other template
    
    <script>
    // some script here
    
    // 注意, "---template" 类的模板, 只能在同一个 `*.share.html` 下才能看到.
    locals.templateHtml         // 引用相应d饿模板
    locals.anotherTemplate      // 引用相应的模板
    </script>
    
### &lt;script>定义

所有js逻辑都可以wrap在 `<script></script>` 之中, wiki中引入almond.js, 所以可以用require的AMD风格来组织组件的依赖.

## tpl模板编译方法

为了快速构建HTML, 我们提供一套便捷的模板构建方案.    
例如, 以下是个button的demo组件:

    ---button
    <a class="button"><%= c.icon() %><%- d.text %></a>
    
    ---buttonIcon
    <span class="icon"></span>
     
    <script>
        define('button', tpl({
            _: locals.button,
            icon: locals.buttonIcon,
            data: {
                text: 'Save button'
            }
        }));
    </sclript>

### html 原始template

`---button` 开始一个原始的html template, 它的名字为 `button`, 可以用 `tpl('button')` 来将其编译.

原始template的格式遵循 lodash 的template格式, 详细的文档可以参照 [lodash template](https://lodash.com/docs#template)

**注意: 传入的数据会被组织在一个 `d` 的变量中, 参照上面button的例子. 而另一个重要的变量是 `c` 代表现在的模板函数运行的 `context`. 
 还有一个是 `p` 的变量, 可以参考 "tpl的构建函数" 的说明.
 例如: **

```
tpl({
    _: templateOne,
    sectionA: function() {},
    sectionB: function() {}
})
```

`templateOne` 的context下, 有 `sectionA` 和 `sectionB` 两个函数. 

### tpl的构建函数

编译之后, tpl的构建函数接受三个参数: `data`, `context`, 和 `parentContext`

`data` 指的是函数运行时的数据信息. 如果在构建函数时引入了 `data`的属性, 那么其下面的值就会当成tpl函数运行时默认的数据.
如果传入新的数据, 那么新数据会在运行时中替换掉默认值.

```
var myTpl = tpl({
    _: function(d) { return d.greeting + ', ' + d.name; },
    data: {
        greeting: 'hello',
        name: 'liang'
    }
});

// hello
myTpl();

// hello, meijingjing
myTpl({
    name: 'meijingjing'
}); 
```

`context` 指的是tpl函数运行时的上下文环境, 在tpl编译时给定. 

**注意: context下只允许有函数类型的属性, 一切数据类的信息都应该放在`data`下面**

```
// 错误
tpl({
    _: function(data, context) {
        return context.contentText
    },
    contextText: 'hello world'
});

// 正确
tpl({
    _: function(data, context) {
        return data.contextText
    },
    data: {
        contextText: 'hello world'
    }
});
```

### context._this

`context` 下会有一个特殊的函数, `_this`, 这是指tpl函数自己. 利用它可以做出一些嵌套的模板.

```
var tpl({
    _: function(d, c) {
        var childrenText = '';
        if (d.children && d.children.length) {
            childrenText += ' (';
            
            d.children.forEach(function(child) {
                chilrenText += c._this(child);
            });
            
            childrenText += ')'
        }
        
        return d.title + ' ' + childrenText;
    },
    d: {
        title: 'item1',
        children: [
            {title: 'item 2'}, 
            {
                title: 'item 3',
                children: [
                    {title: 'item 4'},
                    {title: 'item 5'}
                ]
            }
        ] 
    }
})
```

### parentContext

很简单, `parentContext`指向该tpl函数的上一级tpl函数的上下文对象.

### 编译后的tpl函数

编译之后, tpl函数就只接受 `data` 一个参数.



## tpl模板传入的数据

以上例子, `tpl()`其实是返回了一个函数, 这个函数允许你传入数据来渲染.
如:

```
var buttonTpl = tpl({
    _: locals.button,
    icon: locals.buttonIcon,
    data: {
      text: 'Save button'
    }
}

// 渲染出text为'Edit button'的按钮
var html = buttonTpl({
    text: 'Edit button'
}); 
```

**注意: 不要在本地创建一个`tpl`的变量, 否则会把tpl这个全局的模板构建函数给覆盖掉**
   
## tpl模板的高扩展性
   
所有tpl对象都是具有高可扩展性的. 例如上面的button按钮, 如果你想做一个小组件, 利用button按钮:

```
---section
<div>
    <p>Some content</p>
    <%= c.button({text: d.buttonText})%>
</div>

<script>
    var sectionTpl = tpl({
        _: locals.section,
        button: buttonTpl 
    });
</script>
```

如果说, 你更进一步, 想由section展出另一个组件, 唯一更改的是button不要icon, 那么可以接着这么写:

```
<script>
    var newSectionTpl = tpl({
        _: sectionTpl,
        button: {
            icon: function() { return ''; }
        }
    });
</script>
```

或更顺手的写法:

```
<script>
    var newSectionTpl = tpl({
        _: sectionTpl
        'button.icon': function() { return ''; }
    })
</script>
```
   
