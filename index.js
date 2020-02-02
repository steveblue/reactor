#!/usr/bin/env node
const commander = require('commander');
const { readFileSync } = require('fs');
const project = require('./cmd/project.js');
const generate = require('./cmd/generate.js');

const pkg = readFileSync(__dirname + '/package.json');

commander
  .version(pkg.version)
  .usage('<keywords>')
  .option('new [string]', 'scaffold new project in directory by name, i.e. rctr new my-app')
  .option('generate <type> [name]', 'generate code snippets in the current working directory, i.e. rctr generate component home')
  .parse(process.argv);

const exitHandler = (options, err) => {
    if (err === 0 || err === 1) {
      return;
    }
    if (err !== 'SIGINT') {
      process.stdout.write('\n');
      console.log(err);
    }
    process.exit(1);
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
process.on('unhandledRejection', exitHandler.bind(null, { exit: true }));

if (commander.new) {
  project({
    name: commander.new,
    args: commander.args
  });
}

if (commander.generate) {
  generate({
    type: commander.generate,
    name: commander.args[0],
    args: commander.args
  });
}