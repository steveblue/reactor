const logger = require('single-line-log').stdout;
const ora = require('ora');
const chalk = require('chalk');

class Log {

    constructor() {
        this.spinner = ora({
            text: '',
            spinner: 'dots10',
            color: 'white',
            hideCursor: true
        }).start();
        this.logger = logger;
    }

    break() {
        process.stdout.write('\n');
    }

    clear() {
        this.logger.clear();
    }

    stop(str) {
        this.spinner.stop();
    }

    hasArg(arg) {
        return process.argv.indexOf(arg) > -1 || process.argv.indexOf('--'+arg) > -1;
    }

    destroy() {
        this.spinner.stop();
        process.stdout.write('\x1B[2J\x1B[0f\u001b[0;0H');
    }

    line() {
        process.stdout.write('\n');
        const col = process.stdout.columns;
        let line = ' ';
        for (let i = 0; i < col - 2; i++) {
            line += '\u2500';
        }
        line += '\n';
        process.stdout.write(chalk.white(line));
    }

    errorLine() {
        process.stdout.write('\n');
        const col = process.stdout.columns;
        let line = ' ';
        for (let i = 0; i < col - 4; i++) {
            line += '\u2500';
        }
        line += '💥';
        line += '\n';
        process.stdout.write(chalk.red(line));
    }

    bare(msg) {
        this.logger(msg);
        process.stderr.write('\x1B[?25l');
    }

    message(msg) {
        //this.spinner.stop();
        msg = msg ? '' + chalk.white(msg) : '';
        this.logger(msg);
        process.stderr.write('\x1B[?25l');
    }

    start(msg) {
        msg = msg ? '' + chalk.white(msg) : '';
        this.spinner.text = msg;
        this.spinner.start();
    }

    process(msg) {
        msg = msg ? '' + chalk.white(msg) : '';
        this.spinner.text = msg;
        this.spinner.start();
    }

    complete(msg) {
        this.spinner.stop();
        process.stdout.write(msg  + '\n');
    }

    success(msg, services) {
        services.forEach((service) => { this.cancelError(service); });
        if (!this.hasError()) {
          this.destroy();
        }
        msg = '\n'+ (msg ? '' + chalk.white(msg) : '');
        this.logger(msg);
        process.stderr.write('\x1B[?25l');
    }

    fail(msg) {
        msg = msg ? '' + chalk.red(msg) : '';
        this.logger(msg);
        process.stderr.write('\x1B[?25l');
    }

    alert(msg) {
        msg = msg ? '' + chalk.white(msg) : '';
        process.stdout.write(msg);
        process.stdout.write('\n');
    }

    warn(msg) {
        msg = msg ? '' + chalk.yellow(msg) : '';
        process.stdout.write(msg);
        process.stdout.write('\n');
    }

    error(err) {
        err = err ? '' + chalk.red(err) : '';
        process.stdout.write(err);
        process.stdout.write('\n');
    }

}

const log = new Log();

module.exports = log;