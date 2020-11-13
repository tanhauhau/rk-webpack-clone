(function (modules, entry) {
  const cache = {};

  function __require(mod) {
    if (!(mod in cache)) {
      cache[mod] = {};
      modules[mod](__require, cache[mod]);
    }
    return cache[mod];
  }

  const ws = new WebSocket(`ws://${location.host}`);
  ws.addEventListener('message', async ({ data }) => {
    const payload = JSON.parse(data);
    const { data, type } = payload;
    if (type === 'update') {
      data
    }
  });

  __require(entry);
})(
  {
    'index.js': function (__require, __exports) {
      __require('style.css');

      const p = document.createElement('p');
      p.textContent = 'Hello React Knowledgeable';
      document.body.appendChild(p);
    },
    'style.css': function (__require, __exports) {
      const style = document.createElement('style');
      style.textContent = 'p { color: red; }';
      document.head.appendChild(style);
    },
  },
  'index.js'
);
