const chalk = require('chalk');
const mkdir = require('shelljs').mkdir;
const { join, dirname, basename, resolve } = require('path');
const { writeFile, existsSync } = require( 'fs');
const { Observable, of } = require('rxjs');
const { catchError, map, concatMap } = require('rxjs/operators');

const log = require('./../util/log.js');
const template = require('./template/index.js');

const cwd = join(dirname(process.cwd()), basename(process.cwd()));


function toKebabCase(str) {
    return str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
              .map(x => x.toLowerCase())
              .join('-');
}

function getTemplate(options) {
    return new Observable((observer) => {
        log.process(`analyze template`);
        const temp = template[options.type];
        observer.next([options, temp]);
    });
}


function processTemplate([options, temp]) {
    return new Observable((observer) => {
        log.process(`process template`);
        const exports = [];
        const name =  new RegExp('{{name}}', 'g');
        const styleName = new RegExp('{{styleName}}', 'g');
        let fileExt = 'tsx';
        let fileName = options.name;

        if (options.type === 'state') {
            fileName = `${toKebabCase(fileName)}.state`;
        }
        temp = temp.replace(name, options.name);
        temp = temp.replace(styleName, options.name);
        exports.push({
            file: `${fileName}.${fileExt}`,
            content: temp
        });

        if (options.type === 'view' ||
            options.type === 'ssr') {
                let test = template['enzyme-test'];
                test = test.replace(name, options.name);
                exports.push({
                    file: `${options.name}.spec.${fileExt}`,
                    content: test
                });
                exports.push({
                    file: `${options.name}.scss`,
                    content: ''
                });
        }
        observer.next([options, exports]);
    });
}


function saveTemplate([options, exports]) {
    return new Observable((observer) => {
        log.process(`save template`);
        const exportDirName = toKebabCase(options.name);
        let exportDir = cwd;
        if (basename(process.cwd()) !== exportDirName) {
            exportDir = resolve(`${cwd}/${exportDirName}`)
        }
        if (!existsSync(exportDir)) {
            mkdir(exportDir);
        }
        exports.forEach((ext, i) => {
            writeFile(resolve(`${exportDir}/${ext.file}`), ext.content, 'utf-8', () => {
                log.process(`${ext.file}`);
                if (i === exports.length - 1) {
                    observer.next(options);
                }
            });
        });
    });
}


function generate(options) {
    log.start(`rctr generate ${options.type} ${options.name}`);
    of(options).pipe(
        concatMap(results => getTemplate(results)),
        concatMap(results => processTemplate(results)),
        concatMap(results => saveTemplate(results)),
        map(options => {
            log.complete(chalk.green(`${options.name.toLowerCase()} generated`));
            process.exit(0);
        }),
        catchError(error => {
            log.error(error);
        })
    ).subscribe()
}

module.exports = generate;