# /// script
# dependencies = [
#   "fastapi",
#   "uvicorn",
# ]
# ///

import os
import csv
import math
import datetime
import zipfile
from typing import Dict, Any
from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

# Initialize FastAPI
app = FastAPI(
    title="MuHub Ephemeris Server",
    description="Local server serving MuHub app and querying the pre-calculated 1900-2200 Thai ephemeris database."
)

# Enable CORS for convenience
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, "thai-astrology-ephemeris", "thai_ephemeris_1900_2200.csv")
if not os.path.exists(CSV_PATH):
    CSV_PATH = "C:/Users/pla_y/.gemini/antigravity/scratch/horoscope-thai/thai-astrology-ephemeris/thai_ephemeris_1900_2200.csv"
EPHEMERIS_DATA: Dict[str, Dict[str, Any]] = {}

def load_ephemeris_csv():
    """
    Loads the 242MB ephemeris CSV into memory on startup.
    If the CSV is missing but the ZIP exists, it automatically extracts it.
    """
    global CSV_PATH
    if not os.path.exists(CSV_PATH):
        zip_path = CSV_PATH.replace(".csv", ".zip")
        if os.path.exists(zip_path):
            print(f"CSV database not found. Extracting from {zip_path}...")
            try:
                extract_dir = os.path.dirname(CSV_PATH)
                with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                    zip_ref.extractall(extract_dir)
                print("Successfully extracted CSV database!")
            except Exception as e:
                print(f"Error extracting ZIP file: {e}")
                return
        else:
            print(f"Warning: Ephemeris CSV not found at {CSV_PATH}. Fallback mode only.")
            return
        
    print(f"Loading ephemeris CSV from {CSV_PATH}...")
    start_time = datetime.datetime.now()
    with open(CSV_PATH, mode="r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            EPHEMERIS_DATA[row["date"]] = row
    elapsed = (datetime.datetime.now() - start_time).total_seconds()
    print(f"Successfully loaded {len(EPHEMERIS_DATA)} rows in {elapsed:.2f} seconds.")

# Load CSV data at startup
load_ephemeris_csv()

# Trigonometric Helper Functions
def mod360(x: float) -> float:
    return ((x % 360) + 360) % 360

def to_rad(d: float) -> float:
    return d * math.pi / 180

def to_deg(r: float) -> float:
    return r * 180 / math.pi

def gmst(jd: float) -> float:
    T = (jd - 2451545.0) / 36525.0
    return mod360(280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T - T * T * T / 38710000.0)

def obliq(jd: float) -> float:
    return 23.439291111 - 0.013004167 * (jd - 2451545.0) / 36525.0

def calculate_lagna(jd: float, lat: float, lon: float, ayanamsa: float) -> float:
    """
    Computes Lagna (Ascendant) longitude using standard formulas.
    """
    ramc = mod360(gmst(jd) + lon)
    e = to_rad(obliq(jd))
    r = to_rad(ramc)
    l = to_rad(lat)
    
    num = -math.cos(r)
    den = math.sin(r) * math.cos(e) + math.tan(l) * math.sin(e)
    
    # atan2 formula yields the Descendant; add 180° to get the Ascendant (Eastern horizon)
    asc = to_deg(math.atan2(num, den))
    return mod360(asc + 180 - ayanamsa)

@app.get("/api/calculate")
def calculate_from_csv(
    date: str = Query(..., description="Date in YYYY-MM-DD format"),
    time: str = Query("07:00", description="Local time in HH:MM format"),
    lat: float = Query(13.7563, description="Latitude"),
    lon: float = Query(100.5018, description="Longitude"),
    tz: float = Query(7.0, description="Timezone offset in hours")
):
    """
    Retrieves and interpolates planetary positions from the pre-calculated CSV database.
    """
    if not EPHEMERIS_DATA:
        raise HTTPException(status_code=503, detail="Ephemeris CSV database is not loaded.")
        
    try:
        dt_local = datetime.datetime.strptime(f"{date} {time}", "%Y-%m-%d %H:%M")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date or time format. Use YYYY-MM-DD and HH:MM.")
        
    # Convert local time to UTC
    dt_utc = dt_local - datetime.timedelta(hours=tz)
    
    # 1. Retrieve the row for the local birth date
    row_current = EPHEMERIS_DATA.get(date)
    if not row_current:
        raise HTTPException(status_code=400, detail=f"Date {date} is out of the database range (1900-2200).")
        
    # Parse UTC sunrise time for current day
    try:
        sunrise_curr = datetime.datetime.fromisoformat(row_current["sunrise_utc"]).replace(tzinfo=None)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing database row: {e}")
        
    # 2. Determine bracketing days based on whether birth time is before or after sunrise
    if dt_utc >= sunrise_curr:
        date_next = (dt_local.date() + datetime.timedelta(days=1)).strftime("%Y-%m-%d")
        row_start = row_current
        row_end = EPHEMERIS_DATA.get(date_next)
    else:
        date_prev = (dt_local.date() - datetime.timedelta(days=1)).strftime("%Y-%m-%d")
        row_start = EPHEMERIS_DATA.get(date_prev)
        row_end = row_current
        
    if not row_start or not row_end:
        raise HTTPException(status_code=400, detail="Bracketing dates are out of database range.")
        
    # Parse UTC sunrise times for start and end
    S_start = datetime.datetime.fromisoformat(row_start["sunrise_utc"]).replace(tzinfo=None)
    S_end = datetime.datetime.fromisoformat(row_end["sunrise_utc"]).replace(tzinfo=None)
    
    # Interpolation fraction
    total_seconds = (S_end - S_start).total_seconds()
    elapsed_seconds = (dt_utc - S_start).total_seconds()
    
    if total_seconds == 0:
        fraction = 0.0
    else:
        fraction = elapsed_seconds / total_seconds
        
    # 3. Interpolate Julian Day and Ayanamsa
    jd_start = float(row_start["julian_day"])
    jd_end = float(row_end["julian_day"])
    julian_day = jd_start + fraction * (jd_end - jd_start)
    
    ay_start = float(row_start["ayanamsa"])
    ay_end = float(row_end["ayanamsa"])
    ay_diff = ay_end - ay_start
    if ay_diff < -180: ay_diff += 360
    elif ay_diff > 180: ay_diff -= 360
    ayanamsa = mod360(ay_start + fraction * ay_diff)
    
    # 4. Interpolate Planets
    planets = [
        "sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn",
        "rahu", "ketu", "thai_ketu", "uranus", "neptune", "pluto"
    ]
    
    pos = {}
    retro = {}
    
    for p in planets:
        # Get start/end longitudes
        lon_start = float(row_start[f"{p}_longitude"])
        lon_end = float(row_end[f"{p}_longitude"])
        
        diff = lon_end - lon_start
        if diff < -180:
            diff += 360
        elif diff > 180:
            diff -= 360
            
        lon_interp = mod360(lon_start + fraction * diff)
        pos[p] = lon_interp
        
        # Check retrograde (excluding sun and moon)
        if p in ["sun", "moon"]:
            retro[p] = False
        else:
            retro[p] = diff < 0
            
    # 5. Calculate Lagna (Ascendant) on the fly
    lagna_lon = calculate_lagna(julian_day, lat, lon, ayanamsa)
    pos["lagna"] = lagna_lon
    retro["lagna"] = False
    
    return {
        "pos": pos,
        "retro": retro,
        "ayanamsa": ayanamsa,
        "julian_day": julian_day,
        "source": "database_csv"
    }

# Serve static files from the same directory
@app.get("/")
def get_index():
    index_path = os.path.join(BASE_DIR, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return FileResponse(os.path.join(BASE_DIR, "index.html"))

# Serve other static files (like javascript, css, etc.)
app.mount("/", StaticFiles(directory=BASE_DIR), name="static")

if __name__ == "__main__":
    import uvicorn
    # Serve on port 3737 to match the old perl server port
    uvicorn.run("server:app", host="127.0.0.1", port=3737, reload=True)
