const chalk = require('chalk');
const { Observable, of } = require('rxjs');
const { catchError, map, concatMap } = require('rxjs/operators');

const log = require('./../util/log.js');

function template(options) {
    return new Observable((observer) => {
        log.process(`analyze template`);
        observer.next(options);
    });
}


function processTemplate(options) {
    return new Observable((observer) => {
        log.process(`process template`);
        observer.next(options);
    });
}


function saveTemplate(options) {
    return new Observable((observer) => {
        log.process(`save template`);
        observer.next(options);
    });
}


function generate(options) {
    log.start(`rctr generate ${options.type} ${options.name}`);
    of(options).pipe(
        concatMap(results => template(results)),
        concatMap(results => processTemplate(results)),
        concatMap(results => saveTemplate(results)),
        map(options => {
            log.complete(chalk.green(`${options.name} generated`));
            process.exit(0);
        }),
        catchError(error => {
            log.error(error);
        })
    ).subscribe()
}

module.exports = generate;