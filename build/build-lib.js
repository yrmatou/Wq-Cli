'use strict';
const fse = require('fs-extra');
const path = require('path');
const ora = require('ora');
const symbols = require('log-symbols');
const chalk = require('chalk');
const inquirer = require('inquirer');
const root = path.join(__dirname, '..'); // 根目录路径
const newDirectoryName = 'lib'; // 新创建的文件目录名称
const lib = path.join(root, newDirectoryName); // 需要把内容复制到的目录
const { copyDir, cmdExecCommon } = require('../utils/util.js');
var spinner = ora('执行中'); // 圈圈

// 自定义交互式命令行的问题及简单的校验
function question(version = '1.0.0') {
    return [
        {
            name: "version",
            type: 'input',
            message: "请输入最新版本号",
            validate(val) {
                if (val === '') {
                    return 'Version is required!'
                } else if (/\s/g.test(val)) {
                    return 'Version 不能有空格，请重输！'
                } else if (val.split('.').length < 3) {
                    return 'Version 格式不对，请重输！'
                } else if (val.split('.').filter(v => !v).length > 0) {
                    return 'Version 格式不对，请重输！'
                } else if (val === version) {
                    return 'Version has already existed!'
                } else {
                    return true
                }
            }
        }
    ]
}

/**
 * 第一步：新建目录把组合的新文件打包到新的文件目录中去
 * 第二步，获取到当前readme.md文档内容 去除不用publish部分
 * 第三步，在新的目录里面执行npm publish
 * 第四步，publish成功后，删除新建的目录
 */

/**
 * 新建目录并把根目录内容拷贝到新的目录中
 */
function mkdirNewLib() {
    return new Promise((resolve, reject) => {
        spinner = ora('新建lib目录，复制文件中~~~');
        spinner.start();
        const rootDirectory = fse.readdirSync(root) || []; // 取出根目录所有文件目录
        if (rootDirectory.length <= 0) {
            reject(new Error('根目录获取失败，请重试'))
        }
        let copyDirectory = rootDirectory.filter(val =>
            val !== 'node_modules'
            && val !== 'build'
            && val !== 'utils'
            && val !== 'statics'
            && val !== '.git'
            && val !== newDirectoryName) || []
        if (copyDirectory.length <= 0) {
            spinner.fail();
            reject(new Error('根目录获取失败，请重试'))
        }
        // 如果存在lib目录则清空 否则新建
        if (rootDirectory.includes(newDirectoryName)) {
            fse.emptydirSync(lib) // 清空目录
        } else {
            fse.mkdirSync(lib); // 新建目录
        }
        // 把需要复制的文件 复制到lib目录中
        copyDir(copyDirectory, root, newDirectoryName);
        spinner.succeed('复制完成');
        resolve();
    })
}

/**
 * 重写新建文件夹lib中的readme
 */
function reWriteReadme() {
    return new Promise((resolve, reject) => {
        const fileName = path.join(root, '/lib/README.md'); // 获取到README.md文档
        const content = fse.readFileSync(fileName, 'utf8'); // README.md里面的内容
        const rewriteContent = content.replace(/('&&')[\s\S]*?('&&')/g, ''); // 去除特定的部分 不在npm包里的显示部分
        spinner = ora('正在重写README.md文档...');
        spinner.start();
        // 重写README
        fse.writeFile(fileName, rewriteContent, (err) => {
            if (err) {
                spinner.fail();
                reject();
                throw err;
            }
            spinner.succeed('README.md已重写成功');
            resolve();
        });
    })
}

/**
 * 检测当前package.json文件里的版本号与已发布的版本号对比
 */
function cheackVersion() {
    spinner = ora('cheack version...');
    spinner.start();
    // 先取出package.json文件中的version和name字段
    const fileName = path.join(root, '/lib/package.json'); // 获取到package.json
    const content = fse.readFileSync(fileName, 'utf8'); // package.json里面的内容
    const { name, version } = content ? JSON.parse(content) : { name: 'wky-cli', version: '1.0.0' }
    // 任何你期望执行的cmd命令
    let cmdStr1 = `npm view ${name} version`;
    let cmdPath = path.join(__dirname, '..', newDirectoryName);
    return new Promise((resolve, reject) => {
        cmdExecCommon(cmdStr1, cmdPath).then((res) => {
            spinner.succeed('cheack version成功');
            // 如果已发布的版本号跟本地的版本号一样则提示他请修改版本号否则进行不下去
            if (res && res.trim() === version.trim()) {
                console.log(symbols.success, chalk.green('当前版本号为', version));
                inquirer
                    .prompt(question()).then(answers => {
                        let { version } = answers;
                        let contentNew = JSON.parse(content);
                        contentNew.version = version.replace(/\s/g, '');
                        fse.writeFileSync(path.join(root, 'package.json'), JSON.stringify(contentNew));
                        fse.writeFileSync(path.join(root, '/lib/package.json'), JSON.stringify(contentNew));
                        console.log(symbols.success, chalk.green('修改本地版本号完成'));
                        resolve();
                    })
                return
            }
            resolve();
        }).catch((error) => {
            reject();
            spinner.fail('版本校验出错了' + error)
        })
    })
}

/**
 * 在新的目录文件内 start publish代码
 */
async function startPublish() {
    spinner = ora('start publish...');
    spinner.start();
    // 任何你期望执行的cmd命令
    let cmdStr1 = 'npm publish';
    let cmdPath = path.join(__dirname, '..', newDirectoryName);
    try {
        const res = await cmdExecCommon(cmdStr1, cmdPath);
        spinner.succeed('publish 成功');
    } catch (error) {
        spinner.fail('publish 出错了' + error.message);
    }
}

async function buildLib() {
    try {
        await mkdirNewLib(); // 新建目录并且把根目录内容复制到新建的目录
        await reWriteReadme(); // 读取readme文件并改写
        await cheackVersion(); // 校验已发布的版本号
        await startPublish(); // 执行 publish命令 暂时先不删除lib文件夹
    } catch (error) {
        spinner.fail(error.message || '请重试');
    }
}

buildLib();

