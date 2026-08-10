import sqlite3
import json

def dump_db():
    conn = sqlite3.connect('quant_signals.db')
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    tables = ['signals', 'asset_weights', 'daily_performance', 'active_thesis']
    
    data = {}
    for table in tables:
        try:
            rows = c.execute(f"SELECT * FROM {table}").fetchall()
            data[table] = [dict(row) for row in rows]
        except sqlite3.OperationalError:
            data[table] = []
            
    with open('db_dump.json', 'w') as f:
        json.dump(data, f)
        
dump_db()
print("Dumped SQLite DB to db_dump.json")
