@#:{fb1a8986f4d48c11d67779b41860c1ec}#@
# 开始撰写 Demo

本工具最大的亮点在于可以快速的构建UI元素, 并调整样式, 以形成团队中的规范.

## 不同的元素

wiki程序在运行时, 会对 `./page/`下的资源进行监视, 当发现有以下的文件存在, 则会做相应的加载机制:
 
    // 请慎重使用或改动公共的样式和组件, 因为这么做很可能会影响到其他现有的板块
    *.common.less
    *.public.less
    *.private.less
    
    *.share.html
    
    // 推荐把个人的所有东西都放在私有的组件和样式里
    *.demo.html
    *.demo.less
    
    // @todo: 考虑可以将demo之间可以有依赖加载的机制.
    
### 统一less头文件

`*.common.less` 会被视为统一的less 头文件, 所有该类文件会被合并, 在编译less文件时注入到less中.

主要用于定义 变量, 颜色, mixin, 函数等css预编译的共有资源.

### 生产用样式 (在wii项目中, 没有所谓的生产用样式)

`*.public.less`  用于承载所有可能未来用于产品的样式. 这些样式会被加载, 构建成 `/build/public.css`

### wiki特有样式

`*.private.less` 用于定义一些wiki页面里专用的样式, 一般这类文件不太常用. 这些样式会被构建至 `/build/private.css`

### demo组件库

由于本工具力求开速的构建html和样式, 所以所有推荐将页面元素做成可复用的组件. 公有的组件可放置于 `*.share.html` 中, 详细的用法可以参照 
[demo组件](demo-component/index)

### demo实例

只要在任何的 `*.md` 中加入类似一下的注释:

![](demos.png)

inline, iframe, page 分别代表三种不同的demo嵌入方式.

* inline是将demo直接嵌入到页面中.
* iframe将demo嵌入到页面, 但是用iframe作为外层包裹起来.
    * iframe之后的 !default 是可选项. 它将被拼接成iframe的一个class `-demo-inline-default`.
        利用它, 你可以使用其他的class, 同时在`*.private.less`给iframe一个新的样式.
        往往比较常用的是改变iframe容器的长和高.
* page不嵌入demo, 而是提供一个跳转到该demo的连接.

在 `*.demo.html` 中调用 `bind('func name', tplFunction, demoExtraOptions)` 即可将demo注入到页面. 
详细用法可以参照 [demo注入](demo-binding/index)