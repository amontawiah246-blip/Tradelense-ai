import psycopg2
import os

try:
    conn = psycopg2.connect(
        host=os.environ.get('SQL_HOST'),
        dbname=os.environ.get('SQL_DB_NAME'),
        user=os.environ.get('SQL_ADMIN_USER'),
        password=os.environ.get('SQL_ADMIN_PASSWORD')
    )
    print("Connection successful")
    conn.close()
except Exception as e:
    print(f"Error: {e}")
