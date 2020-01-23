#!/usr/bin/env node
import commander from 'commander';
import chalk from 'chalk';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import { exec } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = readFileSync(__dirname + '/package.json');

commander
  .version(pkg.version)
  .usage('<keywords>')
  .option('new [string]', 'scaffold new project in directory by name, i.e. reactor new my-app')
  .parse(process.argv);

const exitHandler = (options, err) => {
    if (err && err !== 'SIGINT') {
        process.stdout.write('\n');
        console.log(chalk.red('REACTOR ERROR', err));
        process.stdout.write('\n');
        process.exit(1);
    }
    if (options.exit) {
        process.exit(0);
    }
};

// do something when app is closing
process.on('exit', exitHandler.bind(null, { cleanup: true }));

// catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, { exit: true }));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, { exit: true }));
process.on('SIGUSR2', exitHandler.bind(null, { exit: true }));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, { exit: true }));
process.on('unhandledRejection', err => {
  process.stdout.write('\n');
  console.log(chalk.red('REACTOR ERROR', err))
  process.stdout.write('\n');
});

if (commander.new) {
    console.log(chalk.yellow(`Bootstrapping ${commander.new}`));
    exec(`git clone https://github.com/steveblue/react-starter.git ${commander.new}`, {}, (error, stdout, stderr) => {
        console.log(chalk.blue(`Installing dependencies...`));
        exec(`yarn install`, { cwd: resolve(`./${commander.new}`) }, (error, stdout, stderr) => {
            console.log(chalk.green(`Installation complete`));
        })
    })
}