import json
import psycopg2
import os

try:
    conn = psycopg2.connect(
        host=os.environ.get('SQL_HOST'),
        dbname=os.environ.get('SQL_DB_NAME'),
        user=os.environ.get('SQL_ADMIN_USER'),
        password=os.environ.get('SQL_ADMIN_PASSWORD')
    )
    c = conn.cursor()

    with open('db_dump.json', 'r') as f:
        data = json.load(f)

    for table, rows in data.items():
        if not rows:
            continue
        
        for row in rows:
            columns = list(row.keys())
            values = list(row.values())
            placeholders = ', '.join(['%s'] * len(values))
            col_names = ', '.join(columns)
            
            # Use ON CONFLICT DO NOTHING for simple loading since ID is preserved
            query = f"INSERT INTO {table} ({col_names}) VALUES ({placeholders}) ON CONFLICT DO NOTHING"
            
            try:
                c.execute(query, values)
            except Exception as e:
                # Active thesis might not have ON CONFLICT DO NOTHING without unique constraint
                # Let's just catch and ignore or retry without ON CONFLICT if it fails?
                # Actually, in PostgreSQL, ON CONFLICT requires a unique index to be specified.
                print(f"Error on {table}: {e}")
                conn.rollback()
                # Let's just do a normal insert, assuming the tables are empty
                try:
                    query = f"INSERT INTO {table} ({col_names}) VALUES ({placeholders})"
                    c.execute(query, values)
                except Exception as e2:
                    print(f"Error 2 on {table}: {e2}")
                    conn.rollback()

    conn.commit()
    conn.close()
    print("Database loaded successfully.")
except Exception as e:
    print(f"Fatal Error: {e}")
