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
        self._mock_data = []
        self._mock_users = {}
        try:
            self.conn = psycopg2.connect(PG_URI)
            self.conn.autocommit = True
            self._init_db()
            print(f"[DB] Connected to PostgreSQL at {PG_URI}")
        except Exception as e:
            print(f"[DB Error] Failed to connect to PostgreSQL: {e}. Falling back to in-memory database.")
            # Seed default admin user in mock DB
            self._mock_users["officer@swachhlens.gov.in"] = {
                "email": "officer@swachhlens.gov.in",
                "password_hash": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjIQqiRQmO",
                "role": "commissioner"
            }

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
            # Add new columns if they don't exist (schema migration)
            try:
                cur.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS state VARCHAR(100)")
                cur.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS district VARCHAR(100)")
                cur.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(100)")
            except Exception as e:
                print(f"[DB] Could not alter users table: {e}")
            # Seed default admin user (password: password123)
            default_hash = "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjIQqiRQmO"
            cur.execute("""
                INSERT INTO users (email, password_hash, role, state, district, city) 
                VALUES ('officer@swachhlens.gov.in', %s, 'commissioner', 'Bihar', 'Patna', 'Patna')
                ON CONFLICT (email) DO NOTHING
            """, (default_hash,))

    def insert_one(self, doc: dict):
        doc_id = doc.get("id")
        doc_to_save = dict(doc)
        doc_to_save.pop("_id", None)
        
        if not self.conn:
            # Fallback
            for i, existing in enumerate(self._mock_data):
                if existing.get("id") == doc_id:
                    return doc_id
            self._mock_data.append(doc_to_save)
            return doc_id

        with self.conn.cursor() as cur:
            cur.execute(
                "INSERT INTO complaints (id, data) VALUES (%s, %s) ON CONFLICT (id) DO NOTHING",
                (doc_id, Json(doc_to_save))
            )
        return doc_id

    def find_all(self, query=None) -> list:
        if not self.conn:
            # Fallback
            if not query:
                return list(self._mock_data)
            
            result = []
            for doc in self._mock_data:
                match = all(doc.get(k) == v for k, v in query.items())
                if match:
                    result.append(doc)
            return result

        with self.conn.cursor(cursor_factory=RealDictCursor) as cur:
            if not query:
                cur.execute("SELECT data FROM complaints")
            else:
                cur.execute("SELECT data FROM complaints WHERE data @> %s", (Json(query),))
            rows = cur.fetchall()
            return [row["data"] for row in rows]

    def find_one(self, query: dict) -> dict:
        if not self.conn:
            # Fallback
            for doc in self._mock_data:
                match = all(doc.get(k) == v for k, v in query.items())
                if match:
                    return doc
            return None

        with self.conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT data FROM complaints WHERE data @> %s LIMIT 1", (Json(query),))
            row = cur.fetchone()
            return row["data"] if row else None

    def update_one(self, query: dict, update: dict) -> bool:
        set_dict = update.get("$set", {})
        if not set_dict:
            return False
            
        if not self.conn:
            # Fallback
            updated = False
            for doc in self._mock_data:
                match = all(doc.get(k) == v for k, v in query.items())
                if match:
                    doc.update(set_dict)
                    updated = True
            return updated

        with self.conn.cursor() as cur:
            cur.execute("""
                UPDATE complaints
                SET data = data || %s
                WHERE data @> %s
            """, (Json(set_dict), Json(query)))
            return cur.rowcount > 0

    def count_documents(self, query=None) -> int:
        if not self.conn:
            return len(self.find_all(query))

        with self.conn.cursor() as cur:
            if not query:
                cur.execute("SELECT COUNT(*) FROM complaints")
            else:
                cur.execute("SELECT COUNT(*) FROM complaints WHERE data @> %s", (Json(query),))
            return cur.fetchone()[0]

    def insert_user(self, email: str, password_hash: str, role: str, state: str = None, district: str = None, city: str = None):
        if not self.conn:
            self._mock_users[email] = {
                "email": email,
                "password_hash": password_hash,
                "role": role,
                "state": state,
                "district": district,
                "city": city
            }
            return

        with self.conn.cursor() as cur:
            cur.execute(
                "INSERT INTO users (email, password_hash, role, state, district, city) VALUES (%s, %s, %s, %s, %s, %s)",
                (email, password_hash, role, state, district, city)
            )

    def get_user_by_email(self, email: str) -> dict:
        if not self.conn:
            return self._mock_users.get(email)

        with self.conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT email, password_hash, role, state, district, city FROM users WHERE email = %s", (email,))
            return cur.fetchone()

    def clear_all(self):
        if not self.conn:
            self._mock_data = []
            return

        with self.conn.cursor() as cur:
            cur.execute("TRUNCATE TABLE complaints")

db = PostgresDB()
