import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor, Json
from dotenv import load_dotenv

load_dotenv()

PG_URI = os.getenv("PG_URI", "postgresql://postgres:postgrespassword@localhost:5432/SwachhLens")

class PostgresDB:
    def __init__(self):
        self.conn = None
        try:
            self.conn = psycopg2.connect(PG_URI)
            self.conn.autocommit = True
            self._init_db()
            print(f"[DB] Connected to PostgreSQL at {PG_URI}")
        except Exception as e:
            print(f"[DB Error] Failed to connect to PostgreSQL: {e}. Please ensure the database is running (e.g., via docker-compose up -d).")

    def _init_db(self):
        with self.conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS complaints (
                    id VARCHAR(255) PRIMARY KEY,
                    data JSONB NOT NULL
                )
            """)
            cur.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    email VARCHAR(255) PRIMARY KEY,
                    password_hash VARCHAR(255) NOT NULL,
                    role VARCHAR(50) NOT NULL
                )
            """)
            # Seed default admin user (password: password123)
            default_hash = "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjIQqiRQmO"
            cur.execute("""
                INSERT INTO users (email, password_hash, role) 
                VALUES ('officer@swachhlens.gov.in', %s, 'commissioner')
                ON CONFLICT (email) DO NOTHING
            """, (default_hash,))

    def insert_one(self, doc: dict):
        doc_id = doc.get("id")
        doc_to_save = dict(doc)
        doc_to_save.pop("_id", None)
        
        with self.conn.cursor() as cur:
            cur.execute(
                "INSERT INTO complaints (id, data) VALUES (%s, %s) ON CONFLICT (id) DO NOTHING",
                (doc_id, Json(doc_to_save))
            )
        return doc_id

    def find_all(self, query=None) -> list:
        with self.conn.cursor(cursor_factory=RealDictCursor) as cur:
            if not query:
                cur.execute("SELECT data FROM complaints")
            else:
                cur.execute("SELECT data FROM complaints WHERE data @> %s", (Json(query),))
            rows = cur.fetchall()
            return [row["data"] for row in rows]

    def find_one(self, query: dict) -> dict:
        with self.conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT data FROM complaints WHERE data @> %s LIMIT 1", (Json(query),))
            row = cur.fetchone()
            return row["data"] if row else None

    def update_one(self, query: dict, update: dict) -> bool:
        set_dict = update.get("$set", {})
        if not set_dict:
            return False
            
        with self.conn.cursor() as cur:
            cur.execute("""
                UPDATE complaints
                SET data = data || %s
                WHERE data @> %s
            """, (Json(set_dict), Json(query)))
            return cur.rowcount > 0

    def count_documents(self, query=None) -> int:
        with self.conn.cursor() as cur:
            if not query:
                cur.execute("SELECT COUNT(*) FROM complaints")
            else:
                cur.execute("SELECT COUNT(*) FROM complaints WHERE data @> %s", (Json(query),))
            return cur.fetchone()[0]

    def insert_user(self, email: str, password_hash: str, role: str):
        with self.conn.cursor() as cur:
            cur.execute(
                "INSERT INTO users (email, password_hash, role) VALUES (%s, %s, %s)",
                (email, password_hash, role)
            )

    def get_user_by_email(self, email: str) -> dict:
        with self.conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT email, password_hash, role FROM users WHERE email = %s", (email,))
            return cur.fetchone()

    def clear_all(self):
        with self.conn.cursor() as cur:
            cur.execute("TRUNCATE TABLE complaints")

db = PostgresDB()
