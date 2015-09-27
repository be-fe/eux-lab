@#:{fb1a8986f4d48c11d67779b41860c1ec}#@
# 开始撰写 Demo

本工具的一大亮点在于可以快速的构建UI元素, 并很容易调整样式. 同时, 所有这些demo都可以很容易被组件化, 被以后的其他组件调用.

## 不同的元素

wiki程序在运行时, 会对 `./page/`下的资源进行监视, 当发现有以下的文件存在, 则会执行相应的加载机制.
 
    // 公共样式类型. 但请慎重使用或改动公共的样式, 因为这么做很可能会影响到其他现有的板块
    *.common.less
    *.public.less
    *.private.less
    
    // demo类的组件和样式. 推荐把个人的所有东西都放在这些私有的组件和样式里
    *.demo.html
    *.demo.less
    
### 统一less头文件

`*.common.less` 会被视为统一的less 头文件, 所有该类文件会被合并, 在编译less文件时注入到less中.

主要用于定义 变量, 颜色, mixin, 函数等css预编译的共有资源.

### 生产用样式 (但在eux-lab项目中, 没有所谓的生产用样式)

`*.public.less`  用于承载所有可能未来用于产品的样式. 这些样式会被加载, 构建成 `/build/public.css`

### eux-lab特有样式

`*.private.less` 用于定义一些wiki页面里专用的样式, 一般这类文件不太常用. 这些样式会被构建至 `/build/private.css`

### demo组件库

由于我们力求可快速地构建html和样式, 所以所有推荐将页面元素做成可复用的组件. 如果想形成可复用的组件, 可以参照
[demo组件](demo-component/index)

### demo实例

只要在任何的 `*.md` 中加入类似一下的注释:

```
@\inline: demo-page/default@

@\iframe: iframe-demo@
@\iframe!medium: iframe-demo/medium-size@
@\iframe!large.my-body-class: iframe-demo/with-body-class@

@\page: page-demo/hello-world@
```

inline, iframe, page 分别代表三种不同的demo嵌入方式.

* inline是将demo直接嵌入到页面中.
* iframe将demo嵌入到页面, 但是用iframe作为外层包裹起来.
    * iframe之后的 `!IFRAME_CLASS` 是可选项. 它将被拼接成iframe的一个class, 如`@\iframe!default`
        会赋予iframe一个特殊的class `-demo-iframe-default`.
        利用它, 你可以在`*.private.less`给iframe指定一个新的样式.
        往往比较常用的是改变iframe容器的长和高.
    * iframe之后的 `.BODY_CLASS_NAMES` 也是可选项, 它将为demo页面中的body元素赋予一个(一些)新的class. 如果未指定,
        则demo页面的body元素将默认有 `eux-lab-page` 的class
    * 注意, `!IFRAME_CLASS` 和 `.BODY_CLASS_NAMES` 虽然都是可选, 但是它们出现的顺序是固定的.
        `.BODY_CLASS_NAMES` 必须出现在 `!IFRAME_CLASS` 之后. 例如: `@\iframe!medium-size.my-body large-page: iframe-demo@`
        是ok的, 但相反 `@\iframe.my-body large-page!medium-size: iframe-demo@` 则是有误的.
* page不嵌入demo, 而是提供一个跳转到该demo的连接.

最后一步, 在 `*.demo.html` 中调用 `bind('medium-size', tplFunction, demoExtraOptions)` 即可将demo注入到页面中 `medium-size`
这个(些)位置. 其中的 `medium-size` 被称为demo的func, 如在 `@\iframe: iframe/medium-size` 定义中, 指的是加载 `iframe.demo.html`
中的 `medium-size`.
