import chalk from 'chalk';
import { exec } from 'child_process';
import { resolve } from 'path';

function project(name) {
    process.stdout.write(chalk.yellow(`\nBootstrapping ${name}`));
    exec(`git clone https://github.com/steveblue/react-starter.git ${name}`, {}, (error, stdout, stderr) => {
        process.stdout.write(chalk.blue(`\nInstalling dependencies...`));
        exec(`yarn install`, { cwd: resolve(`./${name}`) }, (error, stdout, stderr) => {
            process.stdout.write(chalk.green(`\nInstallation complete\n`));
        })
    })
}

export { project };