const { spawn } = require('child_process');
const { Observable, of } = require('rxjs');
const { catchError, concatMap } = require('rxjs/operators');

const log = require('./../util/log.js');

log.pause();

function yarn(options) {
    return new Observable((observer) => {
        spawn(`yarn`, [`${options.cmd}`], { stdio: 'inherit' });
        observer.next();
        observer.complete();
    });
}


function alias(options) {
    of(options).pipe(
        concatMap(results => yarn(results)),
        catchError(err => {
            log.error(err);
            process.exit(1);
        })
    ).subscribe()
}

module.exports = alias;