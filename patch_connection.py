with open('engine.py', 'r') as f:
    code = f.read()

db_connect_func = """
def get_db_connection():
    import psycopg2
    import os
    return psycopg2.connect(
        host=os.environ.get('SQL_HOST'),
        dbname=os.environ.get('SQL_DB_NAME'),
        user=os.environ.get('SQL_ADMIN_USER'),
        password=os.environ.get('SQL_ADMIN_PASSWORD')
    )
"""

import re
code = re.sub(
    r"DB_PATH\s*=\s*os\.path\.join\(os\.path\.dirname\(os\.path\.abspath\(__file__\)\), 'quant_signals\.db'\)",
    db_connect_func,
    code
)

with open('engine.py', 'w') as f:
    f.write(code)
