const fs = require('fs');
const path = require('path');
const { retrocycle, decycle } = require('cycle');
const chalk = require('chalk');

const [assignmentNumber] = process.argv.slice(2);

const assignment = path.join(__dirname, '../assignments', assignmentNumber);
const testImplementation = require(path.join(assignment, 'test.js'));
const fixturePath = path.join(assignment, 'fixtures');
let fixtures = fs.readdirSync(fixturePath);

if (fixtures.find((fixture) => fixture.endsWith('.solo'))) {
  fixtures = fixtures.filter((fixture) => fixture.endsWith('.solo'));
}

(async () => {
  let passAll = true;
  for (const fixture of fixtures) {
    const entryFile = path.join(fixturePath, fixture, 'code/main.js');
    const expectedFile = path.join(fixturePath, fixture, 'expected.js');
    const errorFile = path.join(fixturePath, fixture, 'error.js');
    const [title] = fs
      .readFileSync(path.join(fixturePath, fixture, 'README.md'), 'utf-8')
      .split('\n');

    let error;
    let result;
    try {
      result = await testImplementation({
        entryFile,
      });
    } catch (_error) {
      error = _error;
    }

    console.log(chalk.blue.underline(title));
    if (error !== undefined) {
      if (!fs.existsSync(errorFile)) {
        console.log(chalk.red('Encounter unexpected error:'));
        console.log(error);
        passAll = false;
      } else {
        try {
          const expectedError = require(errorFile);
          expectedError(error);
          console.log('😘 ' + chalk.green('Passed all assertions') + ' 🎉');
        } catch (error) {
          if (error.code === 'ERR_ASSERTION') {
            console.log('😢 ' + chalk.red('Failed test:'));
            printAssertionError(error);
            passAll = false;
          } else {
            throw error;
          }
        }
      }
    } else if (result === undefined) {
      console.log(chalk.red('Not implemented'));
      passAll = false;
    } else {
      try {
        const expected = require(expectedFile);
        expected(result, { base: path.join(fixturePath, fixture, 'code') });
        console.log('😘 ' + chalk.green('Passed all assertions') + ' 🎉');
      } catch (error) {
        if (error.code === 'ERR_ASSERTION') {
          console.log('😢 ' + chalk.red('Failed test:'));
          printAssertionError(error);
          passAll = false;
        } else {
          throw error;
        }
      }
    }
    console.log();
  }

  if (passAll) {
    const readline = require('readline');
    let interrupted = false;
    // remove the cursor
    process.stdout.write('\x1B[?25l');
    onExit(() => {
      interrupted = true;
      // restore cursor
      process.stdout.write('\x1B[?25h');
    });

    const text = ' Congratulations! ';
    for (let i = 0; i < text.length; i++) {
      if (interrupted) process.exit(0);

      if (i > 0) readline.moveCursor(process.stdout, -12 - i, 0);
      process.stdout.write(text.slice(0, i) + ' ');
      process.stdout.write(i % 2 === 0 ? '🎵 💃🕺 🎶' : '🎶 🕺💃 🎵');

      await wait(400);
    }
    console.log();
  }
})();

function printAssertionError(error) {
  console.log('-', chalk.underline(error.message));
  const operator =
    error.operator === '=='
      ? 'equal'
      : error.operator === 'match'
      ? 'match'
      : '';
  console.log(
    chalk.blue(`Expecting to ${chalk.underline.bold(operator)}`),
    error.expected,
    chalk.blue(',')
  );
  console.log(
    chalk.blue('Received'),
    chalk.green(JSON.stringify(error.actual)),
    chalk.blue('instead.')
  );
}

function wait(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function onExit(fn) {
  process.on('exit', fn);
  process.on('SIGINT', fn);
}
