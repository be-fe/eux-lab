# 规范说明

## 目的

这个wiki工具, 是为了:

* 为EUX blog收集积累好文章
* 为有个卡片沉淀可在初始版本使用的知识
* 创建个快速可用的小lab
* 团队熟悉Git协作

wiki使用markdown的规范来撰写, 利用chokidar来进行监视和编译更新. 可以参照 [测试页面](get-started/test-markdown-page/index)
 
同时, 允许在wiki页面中嵌入不同的demo, 用来做前端的小实验.
本项目允许输出公共样式, 但是请不要在该公共wiki中使用!

## 项目启动

    # 如果没有node, 先请安装node, 同时, 确保一下的node插件可用
    
    npm install -g forever
    npm install -g bower
    
    # 如果要对wiki的基础项目做贡献, 可以考虑安装nodemon
    
    npm install -g nodemon
    
    # 接下来, cd到你的项目文件夹内, 安装项目必须的一些依赖

    npm install
    bower install
    
    # 运行wiki, wiki页面在运行后会自动打开 (windows还未测试) 
    # @todo: 请windows同学帮忙测试   
    
    gulp 
    
    # 开发wiki项目
    
    npm start
    
    
启动之后, 访问 `http://localhost:7788`
    
继续阅读: 
[开始使用](get-started/index)