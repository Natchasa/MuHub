import sqlite3
import csv
import json
import datetime
from typing import Iterator, Dict, Any, List
from ephemeris_calc import get_daily_ephemeris_for_date, PLANETS_INFO

def get_planet_field_names() -> List[str]:
    """
    Returns the list of prefix field names for the SQL table.
    """
    return [
        "sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn",
        "rahu", "ketu", "thai_ketu", "uranus", "neptune", "pluto"
    ]

def map_key_to_field(planet_key: str) -> str:
    """
    Maps ephemeris_calc planetary keys to database field names.
    """
    mapping = {
        "Sun": "sun",
        "Moon": "moon",
        "Mars": "mars",
        "Mercury": "mercury",
        "Jupiter": "jupiter",
        "Venus": "venus",
        "Saturn": "saturn",
        "Rahu": "rahu",
        "Ketu": "ketu",
        "ThaiKetu": "thai_ketu",
        "Uranus": "uranus",
        "Neptune": "neptune",
        "Pluto": "pluto"
    }
    return mapping[planet_key]

def init_db(conn: sqlite3.Connection):
    """
    Initializes the SQLite database with the ephemeris table.
    """
    cursor = conn.cursor()
    
    # Construct SQL columns for each planet
    planet_cols = []
    for prefix in get_planet_field_names():
        planet_cols.extend([
            f"{prefix}_longitude REAL",
            f"{prefix}_sign_index INTEGER",
            f"{prefix}_degrees INTEGER",
            f"{prefix}_minutes INTEGER",
            f"{prefix}_seconds INTEGER"
        ])
        
    cols_sql = ", ".join([
        "date TEXT PRIMARY KEY",
        "julian_day REAL",
        "ayanamsa REAL",
        "sunrise_utc TEXT",
        *planet_cols
    ])
    
    cursor.execute(f"CREATE TABLE IF NOT EXISTS ephemeris ({cols_sql})")
    conn.commit()

def generate_ephemeris_rows(
    start_date: datetime.date,
    end_date: datetime.date,
    latitude: float,
    longitude: float
) -> Iterator[Dict[str, Any]]:
    """
    Generator that yields ephemeris calculation results day-by-day.
    """
    current_date = start_date
    delta = datetime.timedelta(days=1)
    
    while current_date <= end_date:
        try:
            # Yield calculated data
            yield get_daily_ephemeris_for_date(current_date, latitude, longitude)
        except Exception as e:
            # Log error and continue
            print(f"Error calculating ephemeris for {current_date}: {e}")
        current_date += delta

def format_row_for_sqlite(data: Dict[str, Any]) -> tuple:
    """
    Converts ephemeris data dictionary to a tuple matching the SQLite schema columns.
    """
    row = [
        data["date"],
        data["julian_day"],
        data["ayanamsa"],
        data["utc_time"]
    ]
    
    planets = data["planets"]
    for key in ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu", "ThaiKetu", "Uranus", "Neptune", "Pluto"]:
        p_data = planets[key]
        row.extend([
            p_data["longitude"],
            p_data["sign_index"],
            p_data["degrees"],
            p_data["minutes"],
            p_data["seconds"]
        ])
        
    return tuple(row)

def write_to_sqlite(
    db_path: str,
    start_date: datetime.date,
    end_date: datetime.date,
    latitude: float,
    longitude: float,
    progress_callback = None
):
    """
    Generates and saves the ephemeris to a SQLite database.
    """
    conn = sqlite3.connect(db_path)
    init_db(conn)
    
    cursor = conn.cursor()
    
    # Calculate insert statement
    planet_prefixes = get_planet_field_names()
    fields = ["date", "julian_day", "ayanamsa", "sunrise_utc"]
    for prefix in planet_prefixes:
        fields.extend([
            f"{prefix}_longitude",
            f"{prefix}_sign_index",
            f"{prefix}_degrees",
            f"{prefix}_minutes",
            f"{prefix}_seconds"
        ])
        
    placeholders = ", ".join(["?"] * len(fields))
    insert_sql = f"INSERT OR REPLACE INTO ephemeris ({', '.join(fields)}) VALUES ({placeholders})"
    
    total_days = (end_date - start_date).days + 1
    count = 0
    
    # Insert rows in chunks
    chunk_size = 100
    rows_to_insert = []
    
    for day_data in generate_ephemeris_rows(start_date, end_date, latitude, longitude):
        rows_to_insert.append(format_row_for_sqlite(day_data))
        count += 1
        
        if len(rows_to_insert) >= chunk_size:
            cursor.executemany(insert_sql, rows_to_insert)
            conn.commit()
            rows_to_insert = []
            
            if progress_callback:
                progress_callback(count, total_days)
                
    if rows_to_insert:
        cursor.executemany(insert_sql, rows_to_insert)
        conn.commit()
        
    if progress_callback:
        progress_callback(count, total_days)
        
    conn.close()

def write_to_csv(
    csv_path: str,
    start_date: datetime.date,
    end_date: datetime.date,
    latitude: float,
    longitude: float
):
    """
    Generates and saves the ephemeris to a CSV file.
    """
    planet_prefixes = get_planet_field_names()
    
    # Headers
    headers = ["date", "julian_day", "ayanamsa", "sunrise_utc"]
    for prefix in planet_prefixes:
        headers.extend([
            f"{prefix}_longitude",
            f"{prefix}_sign_index",
            f"{prefix}_degrees",
            f"{prefix}_minutes",
            f"{prefix}_seconds"
        ])
        
    with open(csv_path, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        
        for day_data in generate_ephemeris_rows(start_date, end_date, latitude, longitude):
            row = format_row_for_sqlite(day_data)
            writer.writerow(row)

def write_to_json(
    json_path: str,
    start_date: datetime.date,
    end_date: datetime.date,
    latitude: float,
    longitude: float
):
    """
    Generates and saves the ephemeris to a JSON file.
    """
    results = []
    for day_data in generate_ephemeris_rows(start_date, end_date, latitude, longitude):
        results.append(day_data)
        
    with open(json_path, mode="w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
