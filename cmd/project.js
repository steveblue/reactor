const chalk = require('chalk');
const rimraf = require('rimraf');
const { exec } = require('child_process');
const { resolve } = require('path');
const { readFile, writeFile } = require( 'fs');
const { Observable, of } = require('rxjs');
const { catchError, map, concatMap } = require('rxjs/operators');

const log = require('./../util/log.js');

function clone(name) {
    return new Observable((observer) => {
        log.process(`clone`);
        exec(`git clone https://github.com/steveblue/react-starter.git ${name}`, {}, (error, stdout, stderr) => {
            if (stderr.includes('Error')) {
              observer.error(error);
            } else {
              observer.next(name);
            }
        });
    });
}

function processPackage(name) {
    return new Observable((observer) => {
        log.process(`bootstrap`);
        readFile(resolve(`./${name}/package.json`), 'utf8', (err, pkg) => {
            if (err) {
                observer.error(err);
            } else {
                pkg = JSON.parse(pkg);
                pkg.name = name;
                pkg.version = '1.0.0';
                pkg = JSON.stringify(pkg, null, 4);
                writeFile(resolve(`./${name}/package.json`), pkg, err => {
                    if (err) {
                      observer.error(err);
                    } else {
                      observer.next(name);
                    }
                });
            }
        });
    });
}

function initRepo(name) {
    return new Observable((observer) => {
        log.process(`git init`);
        rimraf(resolve(`./${name}/.git`), {}, (err) => {
            if (err) {
                observer.error(err);
            } else {
                exec(`git init`, { cwd: resolve(`./${name}`) }, (err, stdout, stderr) => {
                    log.process(`yarn install`);
                    if (err) {
                        observer.error(err);
                    } else {
                        observer.next(name);
                    }
                });
            }
        });
    });
}

function install(name) {
    return new Observable((observer) => {
        log.process(`yarn install`);
        exec(`yarn install`, { cwd: resolve(`./${name}`) }, (err) => {
            if (err) {
                observer.error(err);
            } else {
                observer.next(name);
                observer.complete();
            }
        });
    });
}



// TODO: resolve callback hell
function project(name) {
    log.start(`rctr ${name}`);
    of(name).pipe(
        concatMap(results => clone(results)),
        concatMap(results => processPackage(results)),
        concatMap(results => initRepo(results)),
        concatMap(results => install(results)),
        map(name => {
            log.complete(chalk.green(`${name} scaffold complete`));
        }),
        catchError(error => {
            log.error(err);
        })
    ).subscribe()
}

module.exports = project;