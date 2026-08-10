import psycopg2
import os

conn = psycopg2.connect(
    host=os.environ.get('SQL_HOST'),
    dbname=os.environ.get('SQL_DB_NAME'),
    user=os.environ.get('SQL_ADMIN_USER'),
    password=os.environ.get('SQL_ADMIN_PASSWORD')
)
c = conn.cursor()

tables = ['signals', 'daily_performance', 'active_thesis']
for t in tables:
    try:
        c.execute(f"SELECT setval('{t}_id_seq', (SELECT MAX(id) FROM {t}) + 1)")
    except Exception as e:
        print(f"Error updating seq for {t}: {e}")
        conn.rollback()

conn.commit()
conn.close()
