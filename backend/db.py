import mysql.connector
from mysql.connector import Error
from config import Config
from datetime import datetime, timedelta
from decimal import Decimal

def get_connection():
    try:
        connection = mysql.connector.connect(
            host=Config.DB_HOST,
            port=Config.DB_PORT,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD,
            database=Config.DB_NAME
        )
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        raise

def execute(sql, params=None):
    """Execute a SQL statement with parameters"""
    connection = get_connection()
    cursor = connection.cursor()
    try:
        cursor.execute(sql, params or ())
        connection.commit()
    except Error as e:
        connection.rollback()
        raise
    finally:
        cursor.close()
        connection.close()

def serialize_value(value):
    """Convert datetime, timedelta, and Decimal objects to strings"""
    if isinstance(value, datetime):
        return value.isoformat()
    elif isinstance(value, timedelta):
        return str(value)
    elif isinstance(value, Decimal):
        return float(value)
    return value

def query(sql, params=None):
    """Execute a SELECT query and return results"""
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute(sql, params or ())
        rows = cursor.fetchall()
        # Serialize datetime, timedelta, and Decimal objects
        return [{k: serialize_value(v) for k, v in row.items()} for row in rows]
    finally:
        cursor.close()
        connection.close() 