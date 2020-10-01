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
    const expected = require(path.join(fixturePath, fixture, 'expected.js'));
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
      console.log(chalk.red('Encounter error:'));
      console.log(error);
    } else if (result === undefined) {
      console.log(chalk.red('Not implemented'));
    } else {
      try {
        expected(result, { base: path.join(fixturePath, fixture, 'code') });
        console.log(chalk.green('Passed all assertions'));
      } catch (error) {
        if (error.code === 'ERR_ASSERTION') {
          console.log(chalk.red('Failed test:'));
          console.log('-', chalk.underline(error.message));
          console.log(chalk.blue('Expected:'), error.expected, ',', chalk.blue('got:'), error.actual);
        } else {
          throw error;
        }
      }
    }
    console.log();
  }
})();
