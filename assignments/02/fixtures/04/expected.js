const assert = require('assert');
const { execSync } = require('child_process');

module.exports = function (result, ctx) {
  const stdout = execSync(`node ${result}`, {
    encoding: 'utf-8',
    stdio: 'pipe',
  }).trim();

  assert.equal(stdout, 'a.js 0\nb.js 1');
};
