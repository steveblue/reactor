const chalk = require('chalk');
const { spawn } = require('child_process');
const { Observable, of } = require('rxjs');
const { catchError, map, concatMap } = require('rxjs/operators');

const log = require('./../util/log.js');

log.pause();

const whitelist = ['start', 'dev', 'dev:ssr', 'ssr', 'prod', 'serve', 'test', 'lint', 'storybook', 'pretty'];

function check(options) {
    return new Observable((observer) => {
        if (!whitelist.includes(options.cmd)) {
            observer.error(`${options.cmd} doesn't exist`);
        } else {
            observer.next(options);
        }
    });
}

function yarn(options) {
    return new Observable((observer) => {
        const yarn = spawn(`yarn`, [`${options.cmd}`], { stdio: 'inherit' })

        yarn.on('SIGINT', function () {
            observer.next();
            observer.complete();
            process.exit(1);
        });

        yarn.on('uncaughtException', function (code) {
            observer.error(`ERROR ${err}`);
        });
    });
}


function alias(options) {
    of(options).pipe(
        concatMap(results => check(results)),
        concatMap(results => yarn(results)),
        map(options => {
            if (options) {
                log.complete(chalk.green(`ready`));
            }
        }),
        catchError(err => {
            log.error(err);
            process.exit(1);
        })
    ).subscribe()
}

module.exports = alias;