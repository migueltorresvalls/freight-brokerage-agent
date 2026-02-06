import sqlite3
import csv
import os

class LogisticsDB:
    def __init__(self, db_path="logistics.db"):
        self.db_path = db_path
        self.conn = sqlite3.connect(self.db_path, check_same_thread=False)
        self.cursor = self.conn.cursor()
        self._create_tables()

    def __enter__(self):
        self.conn = sqlite3.connect(self.db_path)
        self.cursor = self.conn.cursor()
        self._create_tables()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type:
            self.conn.rollback()
        else:
            self.conn.commit()
        self.conn.close()

    def close(self):
        self.conn.close()

    def _create_tables(self):
        self.cursor.execute("""
        CREATE TABLE IF NOT EXISTS loads (
            load_id INTEGER PRIMARY KEY AUTOINCREMENT,
            origin TEXT NOT NULL,
            destination TEXT NOT NULL,
            pickup_datetime TEXT,
            delivery_datetime TEXT,
            equipment_type TEXT,
            loadboard_rate REAL,
            notes TEXT,
            weight REAL,
            commodity_type TEXT,
            num_of_pieces INTEGER,
            miles REAL,
            dimensions TEXT
        )
        """)

        self.cursor.execute("""
        CREATE TABLE IF NOT EXISTS calls (
            call_id INTEGER PRIMARY KEY AUTOINCREMENT,
            outcome TEXT CHECK(outcome IN ('successful', 'unsuccessful', 'mc_invalid')),
            load_id INTEGER,
            agreed_rate REAL,
            sentiment TEXT CHECK(sentiment IN ('positive', 'neutral', 'negative')),
            call_datetime TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        """)
        self.conn.commit()

    def insert_load(self, data):
        query = """
        INSERT INTO loads (
            origin, destination, pickup_datetime, delivery_datetime,
            equipment_type, loadboard_rate, notes, weight,
            commodity_type, num_of_pieces, miles, dimensions
        ) VALUES (:origin, :destination, :pickup_datetime, :delivery_datetime, 
                  :equipment_type, :loadboard_rate, :notes, :weight, 
                  :commodity_type, :num_of_pieces, :miles, :dimensions)
        """
        self.cursor.execute(query, data)
        self.conn.commit()
        return self.cursor.lastrowid

    def populate_from_csv(self, loads_csv, calls_csv):        
        if os.path.exists(loads_csv):
            count_loads = 0
            with open(loads_csv, mode='r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    try:
                        row['loadboard_rate'] = float(row['loadboard_rate']) if row['loadboard_rate'] else 0.0
                        row['weight'] = float(row['weight']) if row['weight'] else 0.0
                        row['num_of_pieces'] = int(row['num_of_pieces']) if row['num_of_pieces'] else 0
                        row['miles'] = float(row['miles']) if row['miles'] else 0.0
                        self.insert_load(row)
                        count_loads += 1
                    except Exception:
                        continue
            print(f"Successfully imported {count_loads} loads from {loads_csv}.")
        else: print(f"File {loads_csv} not found, skipping loads initialization.")

        if os.path.exists(calls_csv):
            count_calls = 0
            with open(calls_csv, mode='r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    try:
                        row['load_id'] = int(row['load_id'])
                        row['agreed_rate'] = float(row['agreed_rate'])
                        row['call_datetime'] = row.get('date', 'N/A')
                        
                        self.insert_call(row)
                        count_calls += 1
                    except Exception:
                        continue
            print(f"Successfully imported {count_calls} calls from {calls_csv}.")
        else: print(f"File {calls_csv} not found, skipping calls initialization.")

    def insert_call(self, data):
        query = """
        INSERT INTO calls (outcome, load_id, agreed_rate, sentiment, call_datetime)
        VALUES (:outcome, :load_id, :agreed_rate, :sentiment, :call_datetime)
        """
        self.cursor.execute(query, data)
        self.conn.commit()
        return self.cursor.lastrowid

    def search_loads_by_location(self, origin_pattern, destination_pattern):
        query = "SELECT * FROM loads WHERE origin LIKE ? AND destination LIKE ?"
        self.cursor.execute(query, (origin_pattern, destination_pattern))
        columns = [column[0] for column in self.cursor.description]
        return [dict(zip(columns, row)) for row in self.cursor.fetchall()]

    def get_all_calls(self):
        query = """
        SELECT c.*, l.origin, l.destination, l.pickup_datetime, l.delivery_datetime, l.loadboard_rate, l.weight, l.miles
        FROM calls c
        LEFT JOIN loads l ON c.load_id = l.load_id
        ORDER BY c.timestamp DESC
        """
        self.cursor.execute(query)
        columns = [column[0] for column in self.cursor.description]
        return [dict(zip(columns, row)) for row in self.cursor.fetchall()]