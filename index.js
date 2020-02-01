#!/usr/bin/env node
const commander = require('commander');
const { readFileSync } = require('fs');

const project = require('./cmd/project.js');
const log = require('./util/log.js');

const pkg = readFileSync(__dirname + '/package.json');

commander
  .version(pkg.version)
  .usage('<keywords>')
  .option('new [string]', 'scaffold new project in directory by name, i.e. rctr new my-app')
  .parse(process.argv);

const exitHandler = (options, err) => {
    if (err && err !== 'SIGINT') {
        process.stdout.write('\n');
        log.error('RCTR ERROR', err);
        process.stdout.write('\n');
        process.exit(1);
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
  log.error('RCTR ERROR', err);
  process.stdout.write('\n');
});

if (commander.new) {
    project(commander.new);
}