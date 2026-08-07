import sqlite3
import json
import sys
sys.path.append('.')
import engine

assets = ['EURUSD', 'BTCUSD', 'ETHUSD', 'SOLUSD', 'XAUUSD', 'GBPUSD']
for a in assets:
    try:
        r = engine.run_engine(a, 'Day Trading')
        score = r.get('_summary', {}).get('ml_score', {}).get('score')
        cal = r.get('_summary', {}).get('calendar', {}).get('hard_pause')
        print(f"{a}: Score={score} CalHardPause={cal}")
    except Exception as e:
        print(f"{a}: Error {e}")
