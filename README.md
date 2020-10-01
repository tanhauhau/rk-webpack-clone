# rk-webpack-clone

## Test your implementation

Test cases are written in `assignments/{week}/fixtures`.

To test out the test cases, import your implementation and fill up the `assginments/{week}/test.js`:

```js
// assignments/01/test.js

const myModuleBundler = require('path/to/my-module-bundler');

module.exports = function test({ entryFile }) {
  const moduleGraph = myModuleBundler(entryFile);
  return moduleGraph;
};
```

To run only 1 test, rename the fixture to end with `.solo`, for example, renaming `assignments/01/fixtures/01` to `assignments/01/fixtures/01.solo` will only run the fixture `01` alone.

