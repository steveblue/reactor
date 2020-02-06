#!/usr/bin/env node
const program = require('commander');
const { readFileSync } = require('fs');
const project = require('./cmd/project.js');
const generate = require('./cmd/generate.js');

const pkg = readFileSync(__dirname + '/package.json');

program.version(pkg.version);

program.command('new <name>', {executableFile: './cmd/project.js'})
        .alias('n')
        .description('scaffold new project')
        .action((name) => {
          return project({
            name: name,
            args: {}
          });
        });

program.command('generate <type> <name>', {executableFile: './cmd/generate.js'})
        .alias('g')
        .description('generate code snippet')
        .action((type, name) => {
          return generate({
            type: type,
            name: name,
            args: {
              routing: program.routing,
              lazy: program.lazy
            }
          });
        });

program.option('-r, --routing', 'add route for component (generate)')
      .option('-l, --lazy', 'lazyload component (generate)')
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