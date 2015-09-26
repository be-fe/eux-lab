@#:{a1bfff3cad307a592dfc8308dd6e9eba}#@
# demo注入

## demo的准备

我们的最终目标是将demo展现出来. demo实例的存放位置主要在:

    // html和逻辑
    *.demo.html
    
    // 存放样式
    *.demo.less

`*.demo.html` 的格式跟demo组件中的 `*.share.html` 是一样的. demo注入与demo组件的区别是, 所有demo注入的资源, 只会注入到相应的页面中, 
不会影响到其它的页面.   

同时, 在wiki页面上, 你需要指定好demo注入的位置, 例如:

```
# 标题1

## 标题2

接下来我们看一个demo
@\inline: some demo@ <--- 在wiki页面中, 这里相应的位置, 将会被 name=some demo 的demo所代替.
```
    
## demo注入指定    

demo只属于所在文件夹的wiki页面 (你无法跨页面的访问注入式demo, 如果需要共用资源, 考虑用demo组件的方式)

所有同页面上的demo用两个部分来标识 (可理解为demo的id): `name` 和 `func`
`name` 和 `func` 利用 `/` 来分割开来, 例如:

```
@\inline: demo1/func1@

@\page: demo2/func2@
```

如果忽略掉func, 那么func将会用空字符串代替: `''`.

## demo注入函数: bind

bind方法的原型为: `bind( func, tpl, bindLogic )`

其中:

```
func: String 
    // demo的func名称, 如果为空, 也要传入 ''

tpl: tplFunction  

bindLogic: {}
    'init': function( demoContext )
    'data': function() 或者是 json对象
    'sel': {}
    'event': {}
```

### bindLogic.data

为demo提供初始的数据. 由于demo可能被多次实例化, 根据javascript的特性, 我们应该为每一个实例提供一个唯一的数据对象 (以防他们之间互相修改).
所以, 如果 `bindLogic.data` 是一个纯 json对象, 那么它将会被`bind`方法先JSON字符串化, 再解析, 以生成一个独立的数据对象.

我们推荐使用`function`的方法来构造`bindLogic.data`, 如下:

```
bind('', demoTpl, {
    data: function() {
        return {
            hello: 'world'
        }
    }
});
```

### bindLogic.sel

`bindLogic.sel` 是一个帮助快速生产jquery对象的手段. 他为最终的 `init` 方法, 以及`event`的事件回调提供了demoContext的对象.

例如:

```
bind('', demoTpl, {
    sel: {
        item: '.item',
        content: '#content',
        // 如果带有!在起始位置, 那么这个sel对象将被解析成为一个函数.
        titles: '!h1'
    },
    init: function(demoContext) {
        demoContext.$.item      // jQuery对象, 即所有在 demo 中的 .item 对象
        demoContext.$.content   // jQuery对象, 即demo下的 #content对象
        demoContext.$.titles()  // function调用, 返回所有h1的jQuery对象
    }
});
```

### demoContext

```
demoContext: {}
    $_: 即当前demo的根节点
    $: function
        相当于 $_.find( selector )
    $.SOMEKEY
        参阅 bindLogic.sel
    $t: event的target 对象 (只在event的回调函数中会有)
```
        

### bindLogic.event

跟backbone的event规则很类似, 相当与提供一个快捷的事件绑定手段. 

event的每一个属性名称, 空格前是jquery的一个事件名称, 随后跟着是一个jquery选择器. 
如果没有指定选择器, 则默认事件是绑定在demo的根节点上.

例如:

```
bind('', demoTpl, {
    event: {
        'click': function( event, demoContext ) {
            // 直接作用于demo的根节点
        },
        'click .item': function( event, demoContext ) {
            // ...
        },
        'mouseenter #content ul li': function( event, demoContext ) {
            // ...
        }
    }
});
```

### bindLogic.init

当data准备好, html渲染出来, sel都解析了, event都绑定之后, `bindLogic.init`将被执行.

为了方便理解, 可以看一下demo组件和注入的例子:

[demo构建的例子](../demo-example/index)






