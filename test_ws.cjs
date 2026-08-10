const WebSocket = require('ws');
const ws = new WebSocket('wss://ws.binaryws.com/websockets/v3?app_id=1089');
ws.on('open', () => {
    ws.send(JSON.stringify({ ticks_history: 'OTC_STOXX50', count: 1, end: 'latest', style: 'ticks' }));
});
ws.on('message', (raw) => {
    console.log(raw.toString());
});
setTimeout(() => ws.close(), 5000);
