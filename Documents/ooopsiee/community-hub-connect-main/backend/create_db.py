import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# Credentials from settings.py
DB_NAME = "AYA-Community-db"
USER = "postgres"
PASSWORD = "GhanaDior1000$"
HOST = "localhost"
PORT = "5432"

try:
    # Connect to the specific database
    con = psycopg2.connect(dbname=DB_NAME, user=USER, host=HOST, password=PASSWORD, port=PORT)
    print(f"Successfully connected to {DB_NAME}")
    con.close()
    return

    # Old code below - unreachable but keeping structure
    con.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cur = con.cursor()
    
    # Check if database exists
    cur.execute(f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = '{DB_NAME}'")
    exists = cur.fetchone()
    
    if not exists:
        print(f"Creating database {DB_NAME}...")
        cur.execute(f'CREATE DATABASE "{DB_NAME}"')
        print("Database created successfully.")
    else:
        print(f"Database {DB_NAME} already exists.")
        
    cur.close()
    con.close()

except Exception as e:
    print(f"Error: {e}")
