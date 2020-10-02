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
      } else {
        try {
          const expectedError = require(errorFile);
          expectedError(error);
          console.log('😘 ' + chalk.green('Passed all assertions') + ' 🎉');
        } catch (error) {
          if (error.code === 'ERR_ASSERTION') {
            console.log('😢 ' + chalk.red('Failed test:'));
            printAssertionError(error);
          } else {
            throw error;
          }
        }
      }
    } else if (result === undefined) {
      console.log(chalk.red('Not implemented'));
    } else {
      try {
        const expected = require(expectedFile);
        expected(result, { base: path.join(fixturePath, fixture, 'code') });
        console.log('😘 ' + chalk.green('Passed all assertions') + ' 🎉');
      } catch (error) {
        if (error.code === 'ERR_ASSERTION') {
          console.log('😢 ' + chalk.red('Failed test:'));
          printAssertionError(error);
        } else {
          throw error;
        }
      }
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
  console.log(chalk.blue(`Expecting to ${chalk.underline.bold(operator)}`), error.expected, chalk.blue(','));
  console.log(
    chalk.blue('Received'),
    chalk.green(JSON.stringify(error.actual)),
    chalk.blue('instead.')
  );
}
