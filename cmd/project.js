const chalk = require('chalk');
const rimraf = require('rimraf');
const { exec } = require('child_process');
const { resolve } = require('path');
const { readFile, writeFile } = require( 'fs');
const { Observable, of } = require('rxjs');
const { catchError, map, concatMap } = require('rxjs/operators');

const log = require('./../util/log.js');

function clone(options) {
    return new Observable((observer) => {
        log.process(`clone`);
        exec(`git clone https://github.com/steveblue/react-starter.git ${options.name}`, {}, (error, stdout, stderr) => {
            if (stderr.includes('Error')) {
              observer.error(error);
            } else {
              observer.next(options);
            }
        });
    });
}

function processPackage(options) {
    return new Observable((observer) => {
        log.process(`bootstrap`);
        readFile(resolve(`./${options.name}/package.json`), 'utf8', (err, pkg) => {
            if (err) {
                observer.error(err);
            } else {
                pkg = JSON.parse(pkg);
                pkg.name = options.name;
                pkg.version = '1.0.0';
                pkg = JSON.stringify(pkg, null, 4);
                writeFile(resolve(`./${options.name}/package.json`), pkg, err => {
                    if (err) {
                      observer.error(err);
                    } else {
                      observer.next(options);
                    }
                });
            }
        });
    });
}

function initRepo(options) {
    return new Observable((observer) => {
        log.process(`git init`);
        rimraf(resolve(`./${options.name}/.git`), {}, (err) => {
            if (err) {
                observer.error(err);
            } else {
                exec(`git init`, { cwd: resolve(`./${options.name}`) }, (err, stdout, stderr) => {
                    log.process(`yarn install`);
                    if (err) {
                        observer.error(err);
                    } else {
                        observer.next(options);
                    }
                });
            }
        });
    });
}

function install(options) {
    return new Observable((observer) => {
        log.process(`yarn install`);
        exec(`yarn install`, { cwd: resolve(`./${options.name}`) }, (err) => {
            if (err) {
                observer.error(err);
            } else {
                observer.next(options);
                observer.complete();
            }
        });
    });
}


function project(options) {
    log.start(`rctr ${options.name}`);
    of(options).pipe(
        concatMap(results => clone(results)),
        concatMap(results => processPackage(results)),
        concatMap(results => initRepo(results)),
        concatMap(results => install(results)),
        map(options => {
            log.complete(chalk.green(`${options.name} created`));
        }),
        catchError(err => {
            log.error(err);
        })
    ).subscribe()
}

module.exports = project;