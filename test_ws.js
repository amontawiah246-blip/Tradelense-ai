const WebSocket = require('ws');
const ws = new WebSocket('wss://ws.binaryws.com/websockets/v3?app_id=1089');
ws.on('open', () => {
    ws.send(JSON.stringify({ ticks: 'frxEURUSD', subscribe: 0 }));
});
ws.on('message', (raw) => {
    console.log(raw.toString());
    ws.close();
});
