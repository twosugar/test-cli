#!/usr/bin/env node

// multi-spa.js
const program = require("commander"); // 解析命令;
const chalk = require("chalk"); // 命令行界面输出美颜
const fs = require("fs-extra"); // fs的拓展;
const shell = require("shelljs"); // 重新包装了 child_process；
const inquirer = require("inquirer"); // 交互式问答；
const ora = require("ora"); // 输出样式美化；
const ejs = require("ejs"); // 模版引擎；
const path = require("path");
const currentPath = process.cwd();
const proJson = require('../package.json');
let answersConfig = null;

program
  .command("init")
  .description("指令说明：初始化项目")
  .action(async () => {
    try {
      answersConfig = await getAnswers();
      let targetDir = path.resolve(currentPath, answersConfig.name || "."); //项目路径
      if (fs.pathExistsSync(targetDir)) { //验证路径是否存在
        if (program.force) {
          GenarateProject(answersConfig.name); // 创建项目；
        }
        ora(
          chalk.red(`！当前目录下，${answersConfig.name}已存在，请修改名称后重试`)
        ).fail();
        process.exit(1);
      }
      GenarateProject(answersConfig.name); // 创建项目；
    } catch (error) {
      ora(chalk.red(`项目创建失败：${error}`)).fail();
      process.exit(1);
    }
  });

program.version(proJson.name + ' version ' + proJson.version, "-v", "--version");//查看版本信息

program
  .arguments("<command>")
  .action((cmd) => {
  console.log();
  console.log(chalk.red(`！命令未能解析 <${chalk.green(cmd)}>`));
  console.log();
  program.outputHelp();
  console.log();
});

program.parse(process.argv); // 解析命令行参数
if (program.args.length === 0) {
  console.log();
  console.log(chalk.red("！输入的命令有误"));
  console.log();
  chalk.cyan(program.help());
}

function DownTemplate(projectDir) {
  const remote = "https://github.com/yexiaochen/multi-spa-webpack-cli.git";
  const { template } = answersConfig;
  let downTemplateSpinner = ora(chalk.cyan("模板生成中...")).start();
  return new Promise((resolve, reject) => {
    shell.exec(
      `
      mkdir ${projectDir}
      cd ${projectDir}
      git init
      git remote add -f origin ${remote}
      git config core.sparsecheckout true
      echo "template/common" >> .git/info/sparse-checkout
      echo "template/config" >> .git/info/sparse-checkout
      echo "template/services" >> .git/info/sparse-checkout
      echo "template/${template}" >> .git/info/sparse-checkout
      echo ".gitignore" >> .git/info/sparse-checkout
      echo "package.json" >> .git/info/sparse-checkout
      echo "template/README.md" >> .git/info/sparse-checkout
      git pull origin master
      rm -rf .git
      mv template/* ./
      rm -rf template
      `,
      (error) => {
        if (error) {
          downTemplateSpinner.stop();
          ora(chalk.red(`模板生成失败：${error}`)).fail();
          reject();
        }
        downTemplateSpinner.stop();
        ora(chalk.cyan("模板生成成功")).succeed();
        resolve();
      }
    );
  });
}

function getAnswers(appName) {
  const options = [
    {
      type: "input",
      name: "name",
      message: "项目名称",
      default: "my-app",
    },
    {
      type: "input",
      name: "description",
      message: "项目描述",
      default: "",
    },
    // {
    //   type: "confirm",
    //   name: "eslint",
    //   message: "是否启用 eslint+pretty",
    //   default: true,
    // },
    // {
    //   name: "cssPreprocessor",
    //   type: "list",
    //   message: "CSS 预处理器",
    //   choices: ["less", "sass", "none"],
    // },
    {
      name: "template",
      type: "list",
      message: "选取模板",
      choices: ["react", "vue", "es"],
    },
  ];
  return inquirer.prompt(options);
}

async function GenarateWebpackConfig(targetDir) {
  try {
    const webpackConfigPath = path.resolve(
      `${currentPath}/${targetDir}/config`,
      "webpack.common.ejs"
    );
    const webpackConfigTargetPath = path.resolve(
      `${currentPath}/${targetDir}/config`,
      "webpack.common.js"
    );
    const webpackConfigSpinner = ora(
      chalk.cyan(`配置 webpack 文件...`)
    ).start();
    let webpackConfig = await fs.readFile(webpackConfigPath, "utf8");
    let generatedWebpackConfig = ejs.render(webpackConfig, {
      answers: answersConfig, //将变量名改成answers
    });
    await Promise.all([
      fs.writeFile(webpackConfigTargetPath, generatedWebpackConfig), //将变量填入webpack.common.ejs， 生成新的webpack.common.js
      fs.remove(webpackConfigPath),
    ]);
    webpackConfigSpinner.stop();
    ora(chalk.cyan(`配置 webpack 完成`)).succeed();
  } catch (error) {
    ora(chalk.red(`配置文件失败：${error}`)).fail();
    process.exit(1);
  }
}

async function GenaratePackageJson(projectDir) {
  try {
    const { name, description, cssPreprocessor } = answersConfig;
    const packageJsonPath = path.resolve(
      `${currentPath}/${projectDir}`,
      "package.json"
    );
    const packageJsonSpinner = ora(
      chalk.cyan("配置 package.json 文件...")
    ).start();
    let package = await fs.readJson(packageJsonPath);
    package.name = name;
    package.description = description;
    if (cssPreprocessor == "less") {
      package.devDependencies = {
        ...package.devDependencies,
        "less-loader": "^5.0.0",
      };
    }
    if (cssPreprocessor == "sass") {
      package.devDependencies = {
        ...package.devDependencies,
        "node-sass": "^4.12.0",
        "sass-loader": "^7.1.0",
      };
    }
    if (template == "react") {
      package.dependencies = {
        ...package.dependencies,
        antd: "^3.19.5",
        react: "^16.8.6",
        "react-dom": "^16.8.6",
      };
      package.devDependencies = {
        ...package.devDependencies,
        "vue-loader": "^15.9.3",
        "vue-template-compiler": "^2.6.12",
        "babel-polyfill": "^6.26.0",
        "@vue/component-compiler-utils": "^1.3.1",
      };
    }
    if (template == "vue") {
      package.dependencies = {
        ...package.dependencies,
        antd: "^3.19.5",
        vue: "^2.6.10",
      };
      package.devDependencies = {
        ...package.devDependencies,
        "@babel/plugin-proposal-class-properties": "^7.4.4",
        "@babel/preset-react": "^7.0.0",
        "babel-plugin-import": "^1.12.0",
      };
    }
    await fs.writeJson(packageJsonPath, package, { spaces: "\t" });
    packageJsonSpinner.stop();
    ora(chalk.cyan("package.json 配置完成")).succeed();
  } catch (error) {
    if (error) {
      ora(chalk.red(`配置文件失败：${error}`)).fail();
      process.exit(1);
    }
  }
}

function InstallDependencies(targetDir) {
  const installDependenciesSpinner = ora(chalk.cyan(`安装依赖中...`)).start();
  return new Promise((resolve, reject) => {
    shell.exec(
      `
    cd ${targetDir}
    npm i
    `,
      (error) => {
        if (error) {
          installDependenciesSpinner.stop();
          ora(chalk.red(`依赖安装失败：${error}`)).fail();
          reject();
        }
        installDependenciesSpinner.stop();
        ora(chalk.cyan("依赖安装完成")).succeed();
        resolve();
      }
    );
  });
}

/**
 * @author: tangyu
 * @Date: 2020-08-20 10:30:31
 * @description: 生成项目
 * @param {type} 
 * @return {type} 
 */
async function GenarateProject(targetDir) {
  await DownTemplate(targetDir);
  await Promise.all([
    GenaratePackageJson(targetDir).then(() => {
    //   return InstallDependencies(targetDir);
    }),
    GenarateWebpackConfig(targetDir),
  ]);
  ora(chalk.cyan("项目创建成功！")).succeed();
}
