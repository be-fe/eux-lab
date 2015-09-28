### EUX Lab wiki get started

#### 安装node
如果没有node, 先请安装node, 同时, 确保以下的node插件可用

```
npm install -g forever
npm install -g bower
```
**如果npm安装出错 (没有合适地使用科学上网姿势的同学很可能出现这情况)**

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