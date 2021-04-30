const fse = require('fs-extra');
const path = require('path');
const exec = require('child_process').exec;
const symbols = require('log-symbols');
const chalk = require('chalk');
/**
 * 一些静态方法
 */
module.exports = {
    // 删除文件夹
    removeDir(dir) {
        let files = fse.readdirSync(dir)
        for (var i = 0; i < files.length; i++) {
            let newPath = path.join(dir, files[i]);
            let stat = fse.statSync(newPath)
            if (stat.isDirectory()) {
                //如果是文件夹就递归下去
                removeDir(newPath);
            } else {
                //删除文件
                fse.unlinkSync(newPath);
            }
        }
        fse.rmdirSync(dir)//如果文件夹是空的，就将自己删除掉
    },
    // 复制文件或者文件夹到指定文件夹
    copyDir(dir, root, target) {
        dir.forEach(val => {
            let stat = fse.statSync(path.join(root, val))
            // 文件夹
            if (stat.isDirectory()) {
                fse.copySync(path.join(root, val), path.join(root, `${target}/${val}`))
            }
            // 文件
            else if (stat.isFile()) {
                fse.copySync(path.join(root, val), `${target}/${val}`)
            }
        })
    },
    // 执行cmd命令方法
    cmdExecCommon(cmdStr, cmdPath) {
        return new Promise((resolve, reject) => {
            let workerProcess = null;
            let errorData = [];
            console.log(symbols.success, chalk.yellow('执行cmd 命令目录 cmdPath', cmdPath));
            // 子进程名称
            workerProcess = exec(cmdStr, { cwd: cmdPath });
            // 打印正常的后台可执行程序输出
            workerProcess.stdout.on('data', function (data) {
                // console.log(symbols.success, chalk.green('cmd --- success', data))
                process.stdout.write(data);
                resolve(data);
            })
            // 打印错误的后台可执行程序输出
            workerProcess.stderr.on('data', function (data) {
                // console.log(symbols.error, chalk.red('cmd --- fail', data))
                errorData.push(data);
            })
            // 退出之后的输出
            workerProcess.on('close', function () {
                // console.log(symbols.success, chalk.green('cmd close', code));
                // 如果校验版本的时候 发现仓库没有历史版本则跳过校验版本直接发一个版本
                if (errorData && errorData.length > 0) {
                    let dataString = errorData.join();
                    if (/.*?(is not in the npm registry).*?/g.test(dataString) &&
                    /.*?(You should bug the author to publish it).*?/g.test(dataString)) {
                        resolve();
                        return
                    }
                    reject('其他异常，请重试');
                    return
                }
                errorData = [];
            })
        })
    }
}