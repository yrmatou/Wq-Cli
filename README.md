'&&'
## 项目介绍

* 方便创建PC端、uni-app多端 项目模板 仅适合公司内部 类似于vue-cli方式创建项目
* 后面有新的项目模板 先添加到模板库里 template.json这个文件里面再publish 公司npm服务器上
* http或者https仓库地址并且地址前面加上direct: 示例http://gitlab.wonker/dev/vue-pc-template.git

## 注意事项

* '&&'和'&&'之间的部分为开发阶段的readme，切勿删除
* 执行npm run build:publish之前一定要执行npm login 账号：admin 密码：admin 邮箱：随便输

## 源码目录介绍
```
./bin
├── wk-cli                                 // 项目指令集合（指令名称调整必须更改这个文件）
├── wk-cli-add                             // 添加模板指令 
├── wk-cli-delete                          // 删除模板指令 
├── wk-cli-list                            // 展开模板指令 
├── wk-cli-create                          // 创建项目指令 
template.json                              // 模板库 {name:address} 模板名：模板github或者gitlab地址
package.json                               // 项目配置文件 

``` 
***
## 本地开发

```js
  1. clone项目到本地后 执行npm install或者yarn install
  2. 执行npm link 以前执行过不用再次执行
```

***
## 发布版本
  
```js
  npm login 账号：admin 密码：admin 邮箱：随便输

  注意每次更改完 修改package.json中的 version 版本号 递增

  npm run build:publish 发布到公司 npm服务器

```
---
'&&'
## 使用介绍

**第一步，因为是公司内部使用 首先把 npm config set registry http://npm.wonker**
**有些依赖在公司搭建的[npm服务器上](http://npm.wonker/)**

```js
  执行命令 npm install wk-cli -g 或者 yarn add wk-cli -g
```
  **1. wk-cli add 添加模板命令**
```js
  执行命令 第一个参数是自定义模板名称 第二个参数是仓库地址
  http或者https仓库地址并且地址前面加上direct:
  示例：direct:http://gitlab.wonker/dev/vue-pc-template.git
```
  ![wk-cli add](http://gitlab.wonker/dev/vue-cli-custom/-/raw/master/statics/add.png)

  **2. wk-cli delete 删除模板命令**
```js
  执行命令 第一个参数是自定义模板名称 存在即直接删除
```
![wk-cli delete](http://gitlab.wonker/dev/vue-cli-custom/-/raw/master/statics/delete.png)

  **3. wk-cli list 显示所有模板命令**
```js
  执行命令 打印出一个对象里面的所有模板 键值对
```
![wk-cli delete](http://gitlab.wonker/dev/vue-cli-custom/-/raw/master/statics/list.png)

  **4. wk-cli create 创建项目命令**
```js
  执行命令 类似于vue-cli
```
![wk-cli create](http://gitlab.wonker/dev/vue-cli-custom/-/raw/master/statics/create.png)

***
## F A Q

* npm install wk-cli -g 不成功首先看下 registry是否指向http://npm.wonker，再不行切换yarn install wk-cli -g 下载
* wk-cli add 模板地址务必加上 direct:http://xxxxx，否则无法下载。
* wk-cli add 添加模板后只会添加到自己本地环境， 修改此项目template.json模板文件发布版本，才能更改npm包的模板
文件
* 指令名称修改后先执行npm unlink 再 npm link，否则无法识别指令
'&&'
***
## 代码实现

[参考文章](https://juejin.cn/post/6844903807919325192)  
[参考文章](https://juejin.cn/post/6844903823455027207)  
[参考代码](https://github.com/oniya24/simple-craete-react-cli/tree/ce3defaf194d368564fd60a3e5b40c0d289c4216/simple-create-react)
'&&'

