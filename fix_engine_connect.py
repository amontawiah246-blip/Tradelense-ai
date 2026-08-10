import re

with open('engine.py', 'r') as f:
    code = f.read()

# Replace sqlite3 import
code = code.replace('import sqlite3\n', 'import psycopg2\nimport os\n')

db_connect_func = """
def get_db_connection():
    return psycopg2.connect(
        host=os.environ.get('SQL_HOST'),
        dbname=os.environ.get('SQL_DB_NAME'),
        user=os.environ.get('SQL_ADMIN_USER'),
        password=os.environ.get('SQL_ADMIN_PASSWORD')
    )
"""

# Find the place where DB_PATH is defined
code = re.sub(
    r"DB_PATH\s*=\s*os\.path\.join\(os\.path\.dirname\(__file__\), 'quant_signals\.db'\)",
    db_connect_func,
    code
)

# Replace all sqlite3.connect(...) with get_db_connection()
code = re.sub(r"sqlite3\.connect\([^)]+\)", "get_db_connection()", code)
code = re.sub(r"except sqlite3\.DatabaseError", "except psycopg2.DatabaseError", code)
code = re.sub(r"except sqlite3\.OperationalError", "except psycopg2.OperationalError", code)

with open('engine.py', 'w') as f:
    f.write(code)
