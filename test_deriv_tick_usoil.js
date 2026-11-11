import WebSocket from 'ws';
const ws = new WebSocket('wss://ws.binaryws.com/websockets/v3?app_id=1089');

ws.on('open', () => {
  ws.send(JSON.stringify({
    ticks_history: 'frxUSOIL',
    end: 'latest',
    count: 10,
    style: 'candles',
    granularity: 300
  }));
});

ws.on('message', (data) => {
  console.log(JSON.parse(data));
  ws.close();
  process.exit(0);
});

setTimeout(() => { ws.close(); process.exit(0); }, 3000);
