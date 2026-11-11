import WebSocket from 'ws';
const ws = new WebSocket('wss://ws.binaryws.com/websockets/v3?app_id=1089');

ws.on('open', () => {
  ws.send(JSON.stringify({ active_symbols: 'brief' }));
});

ws.on('message', (data) => {
  const parsed = JSON.parse(data);
  if (parsed.active_symbols) {
    const symbols = parsed.active_symbols.map(s => s.symbol + " - " + s.display_name);
    const oilRelated = symbols.filter(s => s.toLowerCase().includes('oil') || s.toLowerCase().includes('wti') || s.toLowerCase().includes('brent'));
    console.log("Oil related:", oilRelated);
  }
  ws.close();
  process.exit(0);
});
