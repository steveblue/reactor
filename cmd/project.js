import chalk from 'chalk';
import { exec } from 'child_process';
import { resolve } from 'path';
import { readFile, writeFile } from 'fs';

// TODO: resolve callback hell
function project(name) {
    process.stdout.write(chalk.yellow(`\nBootstrapping ${name}`));
    exec(`git clone https://github.com/steveblue/react-starter.git ${name}`, {}, (error, stdout, stderr) => {
        process.stdout.write(chalk.blue(`\nInstalling dependencies...`));
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
                        exec(`rm -rf .git`, { cwd: resolve(`./${name}`) }, (err, stdout, stderr) => {
                            exec(`git init`, { cwd: resolve(`./${name}`) }, (err, stdout, stderr) => {
                                exec(`yarn install`, { cwd: resolve(`./${name}`) }, (err, stdout, stderr) => {
                                    if (err) {
                                        throw err;
                                    } else {
                                        process.stdout.write(chalk.green(`\nInstallation complete\n`));
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

export { project };