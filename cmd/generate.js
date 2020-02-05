const chalk = require('chalk');
const findup = require('findup');
const glob = require("glob");
const mkdir = require('shelljs').mkdir;
const grep = require('shelljs').grep;
const prettier = require("prettier");
const { join, dirname, basename, resolve } = require('path');
const { writeFile, existsSync, readFile } = require( 'fs');
const { Observable, of } = require('rxjs');
const { catchError, map, concatMap } = require('rxjs/operators');

const log = require('./../util/log.js');
const template = require('./template/index.js');

const cwd = join(dirname(process.cwd()), basename(process.cwd()));
let projectDir = null;

function getType(type) {
    switch (type) {
        case 'fc':
        return 'fn-component';
        case 'afc':
        return 'arrow-fn-component';
        case 'c':
        return 'component';
        case 'v':
        return 'view';
        case 'ssr':
        return 'ssr';
        case 't':
        return 'enzyme-test';
        case 's':
        return 'state';
        case 'h':
        return 'hook';
        case 'ctx':
        return 'context';
        default:
        return -1;
    }
}

function toKebabCase(str) {
    return str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
              .map(x => x.toLowerCase())
              .join('-');
}


function init(options) {
    return new Observable((observer) => {
        try {
            projectDir = findup.sync(cwd, 'package.json');
        } catch(e) {
            observer.error(`The generate command requires a project, a package.json could not be found.`);
        }
        observer.next(options);
    });
}

function getTemplate(options) {
    return new Observable((observer) => {
        log.process(`analyze template`);
        if (getType(options.type) !== -1) {
            options.type = getType(options.type);
        }
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
        if (options.type === 'hook') {
            fileName = `${toKebabCase(fileName)}.hook`;
        }
        if (options.type === 'context') {
            fileName = `${toKebabCase(fileName)}.context`;
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

        if (existsSync(exportDir) &&
            existsSync(resolve(`${exportDir}/${options.name}.tsx`)) &&
            (options.type === 'view' ||
            options.type === 'component' ||
            options.type === 'fn-component' ||
            options.type === 'arrow-fn-component' ||
            options.type === 'ssr')) {
            observer.error(`${exportDirName} already exists`);
        }
        if (!existsSync(exportDir)) {
            mkdir(exportDir);
        }

        options.exportDir = exportDir;

        exports.forEach((ext, i) => {
            options.results.push(`${ext.file} created`);
            writeFile(resolve(`${exportDir}/${ext.file}`), ext.content, 'utf-8', () => {
                if (i === exports.length - 1) {
                    observer.next(options);
                }
            });
        });

    });
}


function transformRoutes(content, options) {
    const imp = template['import'];
    const route = template['route'];
    const lazyRoute = template['lazy-route'];
    const importedComponent = template['imported-component'];
    const routeRegex = new RegExp(/<Switch>/, 'gm');
    const importRegex = new RegExp(/import.*?from.*?;/, 'gm');
    const routeMatches = content.match(routeRegex);
    const routeMatch = routeMatches[routeMatches.length - 1];
    const importMatches = content.match(importRegex);
    const importMatch = importMatches[importMatches.length - 1];
    if (options.args.lazy) {
        let newLazy = importedComponent.replace(/{{name}}/g, options.name);
            newLazy = newLazy.replace(/{{path}}/g, options.exportDir.replace(options.routerDir, ''));
        let newLazyRoute = lazyRoute.replace(/{{routeName}}/g, toKebabCase(options.name));
            newLazyRoute = newLazyRoute.replace(/{{name}}/g, options.name);
        content = content.replace(importMatch, importMatch + newLazy);
        content = content.replace(routeMatch, routeMatch + newLazyRoute);
    } else {
        let newImport = imp.replace(/{{name}}/g, options.name);
            newImport = newImport.replace(/{{path}}/g, options.exportDir.replace(options.routerDir, ''));
        let newRoute = route.replace(/{{routeName}}/g, toKebabCase(options.name));
            newRoute = newRoute.replace(/{{name}}/g, options.name);
        content = content.replace(importMatch, importMatch + importMatch);
        content = content.replace(routeMatch, routeMatch + newRoute);
    }
    content = content.replace(/^\s*$(?:\r\n?|\n)/gm, '');
    content = prettier.format(content, { parser: 'typescript' });
    return content;
}

function findRouter(options) {

    return new Observable((observer) => {

        function findMatch(dir) {
            const fileExt = 'tsx';
            let match = null;
            glob(`*.${fileExt}`, { cwd:  resolve(dir) , ignore: ['node_modules/**', '.cache/**'] }, function (err, files) {
                if (err) {
                    observer.error(err);
                }
                files.forEach(file => {
                    const f = grep('--', 'react-router-dom', join(dir, file));
                    if (f.stdout !== '\n') {
                        match = file;
                        readFile(join(dir, file), 'utf8', (err, contents) => {
                            if (err) {
                                observer.error(err);
                            } else {
                                options.routerDir = dir;
                                writeFile(join(dir, file), transformRoutes(contents, options), (err) => {
                                    options.results.push(`${file} has new routes`);
                                    if (err) {
                                        observer.error(err);
                                    }
                                    observer.next(options);
                                });
                            }
                        });
                    }
                });
                if (resolve(dir, '..') === projectDir) {
                    observer.error('no routing found in project');
                }
                if (!match) {
                    findMatch(resolve(dir, '..'));
                }
            });
        }

        findMatch(resolve(options.exportDir, '..'));

    });
}

function mergeRouter(options) {
    if (options.args.routing) {
        return findRouter(options);
    } else {
        return new Observable((observer) => {
            observer.next(options);
        });
    }
}

function generate(options) {
    options.results = [`\n`];
    log.start(`rctr generate ${options.type} ${options.name}`);
    of(options).pipe(
        concatMap(results => init(results)),
        concatMap(results => getTemplate(results)),
        concatMap(results => processTemplate(results)),
        concatMap(results => saveTemplate(results)),
        concatMap(results => mergeRouter(results)),
        map(options => {
            options.results.forEach(result => log.print(`${result}`));
            process.exit(0);
        }),
        catchError(error => {
            log.error(error);
            process.exit(1);
        })
    ).subscribe()
}

module.exports = generate;