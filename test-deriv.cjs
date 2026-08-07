const WebSocket = require('ws');

const ws = new WebSocket('wss://ws.binaryws.com/websockets/v3?app_id=1089');
ws.on('open', () => {
  ws.send(JSON.stringify({
    ticks: 'frxEURUSD',
    subscribe: 1
  }));
});

ws.on('message', (data) => {
  console.log('Received:', data.toString());
  ws.close();
});
