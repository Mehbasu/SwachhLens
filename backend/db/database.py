import os
import json
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "swachhlens_db")

class MongoOrFallbackDB:
    def __init__(self):
        self.use_mongo = False
        self.client = None
        self.db = None
        self.collection = None
        self._memory_data = []
        self.storage_file = os.path.join(os.path.dirname(__file__), "storage_fallback.json")
        
        try:
            from pymongo import MongoClient
            client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=1500)
            client.admin.command('ping')
            self.client = client
            self.db = client[DB_NAME]
            self.collection = self.db["complaints"]
            self.use_mongo = True
            print(f"[DB] Connected to MongoDB at {MONGO_URI}, database '{DB_NAME}'")
        except Exception as e:
            print(f"[DB Warning] MongoDB connection unavailable ({e}). Using local persistent fallback store.")
            self.use_mongo = False
            self._load_fallback()

    def _load_fallback(self):
        if os.path.exists(self.storage_file):
            try:
                with open(self.storage_file, "r", encoding="utf-8") as f:
                    self._memory_data = json.load(f)
            except Exception:
                self._memory_data = []

    def _save_fallback(self):
        try:
            with open(self.storage_file, "w", encoding="utf-8") as f:
                json.dump(self._memory_data, f, indent=2)
        except Exception as e:
            print(f"[DB Error] Failed to save fallback storage: {e}")

    def insert_one(self, doc: dict):
        doc_to_save = dict(doc)
        if self.use_mongo:
            if "id" in doc_to_save and "_id" not in doc_to_save:
                doc_to_save["_id"] = doc_to_save["id"]
            self.collection.insert_one(doc_to_save)
            return doc_to_save.get("id")
        else:
            self._memory_data.append(doc_to_save)
            self._save_fallback()
            return doc_to_save.get("id")

    def find_all(self, query=None) -> list:
        if self.use_mongo:
            results = list(self.collection.find(query or {}, {"_id": 0}))
            return results
        else:
            results = []
            query = query or {}
            for item in self._memory_data:
                match = True
                for k, v in query.items():
                    if item.get(k) != v:
                        match = False
                        break
                if match:
                    results.append(item)
            return results

    def find_one(self, query: dict) -> dict:
        if self.use_mongo:
            res = self.collection.find_one(query, {"_id": 0})
            return res
        else:
            for item in self._memory_data:
                match = True
                for k, v in query.items():
                    if item.get(k) != v:
                        match = False
                        break
                if match:
                    return item
            return None

    def update_one(self, query: dict, update: dict) -> bool:
        if self.use_mongo:
            res = self.collection.update_one(query, update)
            return res.modified_count > 0 or res.matched_count > 0
        else:
            set_dict = update.get("$set", {})
            for item in self._memory_data:
                match = True
                for k, v in query.items():
                    if item.get(k) != v:
                        match = False
                        break
                if match:
                    item.update(set_dict)
                    self._save_fallback()
                    return True
            return False

    def count_documents(self, query=None) -> int:
        if self.use_mongo:
            return self.collection.count_documents(query or {})
        else:
            return len(self.find_all(query))

    def clear_all(self):
        if self.use_mongo:
            self.collection.delete_many({})
        else:
            self._memory_data = []
            self._save_fallback()

db = MongoOrFallbackDB()
