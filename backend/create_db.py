import psycopg2
import os
import sys
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Credentials from environment variables
DB_NAME = os.getenv('DB_NAME', 'AYA-Community-db')
USER = os.getenv('DB_USER', 'postgres')
PASSWORD = os.getenv('DB_PASSWORD', '')
HOST = os.getenv('DB_HOST', 'localhost')
PORT = os.getenv('DB_PORT', '5432')


def ensure_database_exists():
    """
    Connects to PostgreSQL as the default 'postgres' database
    and creates the target database if it doesn't exist.
    """
    try:
        # First, try connecting directly to the target database
        con = psycopg2.connect(dbname=DB_NAME, user=USER, host=HOST, password=PASSWORD, port=PORT)
        print(f"✓ Successfully connected to '{DB_NAME}' - database already exists.")
        con.close()
        return True
    except psycopg2.OperationalError:
        # Database does not exist - create it
        pass

    try:
        # Connect to the default 'postgres' database to create our target db
        con = psycopg2.connect(dbname='postgres', user=USER, host=HOST, password=PASSWORD, port=PORT)
        con.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = con.cursor()

        # Check if database already exists in catalog
        cur.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = %s", (DB_NAME,))
        exists = cur.fetchone()

        if not exists:
            print(f"Creating database '{DB_NAME}'...")
            cur.execute(f'CREATE DATABASE "{DB_NAME}"')
            print(f"✓ Database '{DB_NAME}' created successfully.")
        else:
            print(f"✓ Database '{DB_NAME}' already exists.")

        cur.close()
        con.close()
        return True

    except Exception as e:
        print(f"✗ Error: {e}")
        return False


if __name__ == '__main__':
    success = ensure_database_exists()
    sys.exit(0 if success else 1)

