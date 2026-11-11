import WebSocket from 'ws';
const ws = new WebSocket('wss://ws.binaryws.com/websockets/v3?app_id=1089');
ws.on('open', () => {
  ws.send(JSON.stringify({
    ticks_history: 'OTC_NDX',
    granularity: 60,
    count: 5,
    end: 'latest',
    style: 'candles'
  }));
});
ws.on('message', (msg) => {
  console.log('Deriv response:', msg.toString());
  ws.close();
});
ws.on('error', (err) => console.log('Err:', err));
