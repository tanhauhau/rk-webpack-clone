const express = require('express');
const WebSocket = require('ws');
const app = express();

app.use(express.static(__dirname + '/static'));
app.get('/update/:color', (req, res) => {
  const color = req.params.color;

  send({
    type: 'update',
    data: {
      'style.css': `function (__require, __exports) {
        const style = document.createElement('style');
        style.textContent = 'p { color: ${color}; }';
        document.head.appendChild(style);
      }`,
    },
  });

  res.sendStatus(200);
});
const server = app.listen(8000, () => {
  console.log('http://localhost:8000');
});

const wss = new WebSocket.Server({ server });
wss.on('connection', (socket) => {
  socket.send('"connected"');
});
wss.on('error', (error) => {
  console.log('ws error', error);
});

const send = (message) => {
  message = JSON.stringify(message);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};
