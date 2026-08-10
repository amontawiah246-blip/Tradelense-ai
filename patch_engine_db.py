import re

with open('engine.py', 'r') as f:
    code = f.read()

# Replace import sqlite3 with import psycopg2
code = code.replace('import sqlite3\n', 'import psycopg2\nimport psycopg2.extras\n')

# Replace DB_PATH = ... with DB connection logic
code = re.sub(
    r"DB_PATH\s*=\s*os\.path\.join\([^)]+\)",
    "DB_PATH = '' # Not used for Postgres",
    code
)

# Replace sqlite3.connect with psycopg2 connection
get_conn_func = """
def get_db_connection():
    try:
        conn = psycopg2.connect(
            host=os.environ.get('SQL_HOST', 'localhost'),
            dbname=os.environ.get('SQL_DB_NAME', 'ai_studio'),
            user=os.environ.get('SQL_ADMIN_USER', 'ai_studio_admin'),
            password=os.environ.get('SQL_ADMIN_PASSWORD', '')
        )
        # return dictionary-like rows
        # Actually, the original engine expects tuples or custom rows, but sqlite3 defaults to tuples, unless row_factory is used.
        # But wait! psycopg2 defaults to tuples! Let's just return the connection.
        return conn
    except Exception as e:
        print(f"Error connecting to DB: {e}")
        raise
"""

# Let's write a smarter patch script.
