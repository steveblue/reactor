import chalk from 'chalk';
import rimraf from 'rimraf';
import { exec, spawn } from 'child_process';
import { resolve } from 'path';
import { readFile, writeFile } from 'fs';

import { log } from './../util/log.js';

// TODO: resolve callback hell
export function project(name) {
    log.start(`rctr ${name}`);
    exec(`git clone https://github.com/steveblue/react-starter.git ${name}`, {}, (error, stdout, stderr) => {
        log.process(`bootstrap`);
        readFile(resolve(`./${name}/package.json`), 'utf8', (err, pkg) => {
            if (err) {
                throw err;
            } else {
                pkg = JSON.parse(pkg);
                pkg.name = name;
                pkg.version = '1.0.0';
                pkg = JSON.stringify(pkg, null, 4);
                writeFile(resolve(`./${name}/package.json`), pkg, err => {
                    if (err) {
                        throw err;
                    } else {
                        rimraf(resolve(`./${name}/.git`), {}, () => {
                            log.process(`git init`);
                            exec(`git init`, { cwd: resolve(`./${name}`) }, (err, stdout, stderr) => {
                                log.process(`yarn install`);
                                exec(`yarn install`, { cwd: resolve(`./${name}`) }, (err) => {
                                    if (err) {
                                        throw err;
                                    } else {
                                        log.complete(chalk.green(`rctr complete`));
                                    }
                                });
                            });
                        });
                    }
                });
            }

        })
    });
}