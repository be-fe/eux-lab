@#:{663d0b555284ec045a0c394901681335}#@
# 规范说明

## 目的

这个wiki工具, 是为了:

* 团队知识沉淀
* 创建个快速可用的小lab
* 团队熟悉Git协作
* 为有个卡片沉淀可在初始版本使用的知识
* 为EUX blog收集积累好文章

wiki使用markdown的规范来撰写, 利用chokidar来进行监视和编译更新. 可以参照 [测试页面](get-started/test-markdown-page/index)
 
同时, 允许在wiki页面中嵌入不同的demo, 用来做前端的小实验.
本项目允许输出公共样式, 但是请不要在该公共wiki中使用!

## 项目启动

### EUX Lab wiki get started

#### 安装node
如果没有node, 先请安装node, 同时, 确保以下的node插件可用

```
npm install -g forever
npm install -g bower
```

**如果npm安装出错 (没有使用科学上网姿势的同学很可能出现这情况)**

考虑以下各种方法

* 考虑使用cnpm, 参考这里 [cnpm 安装](http://cnpmjs.org/)   
    * 也可以将npm的源(registry)指向国内的镜像, 参考这里 [taobao npm](http://npm.taobao.org/)
* 删掉 ./node_modules 再来 (每次安装失败最好都用这方法clean一遍)
    * 还可以考虑 `npm cache clean -f` 去除所有错误的cache
* 科学上网 

### 项目准备
接下来, cd到你的项目文件夹内, 安装项目必须的一些依赖

```
npm install
bower install
```

**如果npm安装出错, 请参照上面的方法来解决**

最后, 执行以下命令运行wiki, wiki页面在运行后会自动打开 (windows可能会有点小问题) 

```
gulp 
```

### 对eux-lab项目进行贡献

如果只对eux-lab的内容做贡献跟, 那么请考虑安装 `sourcetree` 和 `webstorm` (或 `sublime`)

* [sourcetree](https://www.sourcetreeapp.com/)
* [webstorm](https://www.jetbrains.com/webstorm/) - 考虑找合(po)理(jie)的网上的license...
    * [sublime](http://www.sublimetext.com/)

如果要对wiki的基础功能做贡献, 可以考虑安装nodemon

```
npm install -g nodemon
```

开发wiki项目

```
npm start
```
    
启动之后, 访问 `http://localhost:7788`

@todo: 考虑有一个允许个人设置的机制, 这样可以让大家设置自己的port
    
继续阅读: 
[开始使用](get-started/index)