# /// script
# dependencies = [
#   "fastapi",
#   "uvicorn",
#   "timezonefinder",
#   "pytz",
# ]
# ///

import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
import csv
import math
import datetime
import zipfile
import json
import logging
from logging.handlers import RotatingFileHandler
import urllib.request
import urllib.parse
from typing import Dict, Any
from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from timezonefinder import TimezoneFinder
import pytz
from pydantic import BaseModel

# Load config.json
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# ── Logging: บันทึกทุกอย่างที่เคย print() ลงไฟล์ log แบบ rotate อัตโนมัติ ──────
# โค้ดเดิมใช้ print() เป็น logger อยู่แล้วทั้งไฟล์ แทนที่จะไปแก้ print() ทีละจุด
# (เสี่ยงพลาด/ตกหล่น) เราแค่ "ดักฟัง" stdout/stderr แล้วเขียนสำเนาออกไฟล์ log ด้วย
# วิธีนี้ทำให้ log เดิมทั้งหมดถูกเก็บถาวรลงไฟล์ (ไม่หายไปเมื่อปิด terminal) โดยไม่ต้อง
# แก้โค้ด business logic เลยแม้แต่บรรทัดเดียว
LOG_DIR = os.path.join(BASE_DIR, "logs")
os.makedirs(LOG_DIR, exist_ok=True)

_server_logger = logging.getLogger("muhub_server")
_server_logger.setLevel(logging.INFO)
_server_logger.propagate = False
if not _server_logger.handlers:
    _log_handler = RotatingFileHandler(
        os.path.join(LOG_DIR, "server.log"), maxBytes=5 * 1024 * 1024, backupCount=5, encoding="utf-8"
    )
    _log_handler.setFormatter(logging.Formatter("%(asctime)s %(message)s"))
    _server_logger.addHandler(_log_handler)

class _StreamToLogger:
    """ส่งต่อทุกบรรทัดที่เขียนไปยัง stdout/stderr (เช่นจาก print()) เข้า logger ไฟล์ด้วย"""
    def __init__(self, logger, level, original_stream):
        self.logger = logger
        self.level = level
        self.original_stream = original_stream
        self._buffer = ""

    def write(self, message):
        self.original_stream.write(message)
        self._buffer += message
        while "\n" in self._buffer:
            line, self._buffer = self._buffer.split("\n", 1)
            if line.strip():
                self.logger.log(self.level, line)

    def flush(self):
        self.original_stream.flush()

    def isatty(self):
        return hasattr(self.original_stream, 'isatty') and self.original_stream.isatty()

    def fileno(self):
        if hasattr(self.original_stream, 'fileno'):
            return self.original_stream.fileno()
        raise OSError("Stream has no fileno")

sys.stdout = _StreamToLogger(_server_logger, logging.INFO, sys.stdout)
sys.stderr = _StreamToLogger(_server_logger, logging.ERROR, sys.stderr)
CONFIG = {}
config_path = os.path.join(BASE_DIR, "config.json")
if os.path.exists(config_path):
    try:
        with open(config_path, "r", encoding="utf-8") as f:
            CONFIG = json.load(f)
    except Exception as e:
        print(f"Error reading config.json: {e}")


# Initialize Timezone Finder
tf = TimezoneFinder()

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

# ── Block sensitive files from being served ─────────────────────────────
# This app is served with app.mount("/", StaticFiles(directory=BASE_DIR))
# below, which by default would expose EVERY file in the project folder
# over HTTP -- including config.json (LINE tokens, Google Script URL,
# SlipOK key) and the non-github/ folder (real secrets, payment QR,
# server scripts). This middleware runs before the static handler and
# returns 404 for any request path that touches a sensitive file/folder,
# so secrets can never be downloaded via a browser or curl even if this
# server is later exposed on a LAN or tunneled to the internet.
BLOCKED_PATH_SEGMENTS = [
    "config.json",      # LINE_CHANNEL_ACCESS_TOKEN / LINE_CHANNEL_SECRET / SLIPOK_API_KEY / GOOGLE_SCRIPT_URL
    "non-github",        # real secrets, payment QR, backup index.html, server scripts
    ".env",
    ".git",
    "__pycache__",
    ".venv",
    ".claude",
]

@app.middleware("http")
async def block_sensitive_files(request: Request, call_next):
    path = request.url.path.lower()
    if any(seg in path for seg in BLOCKED_PATH_SEGMENTS):
        return JSONResponse(status_code=404, content={"detail": "Not Found"})
    return await call_next(request)

# ── Basic error monitoring: จับ exception ที่ไม่ได้ handle ไว้ทุกจุด ─────────
# ถ้าไม่มีตัวนี้ exception ที่หลุดจาก endpoint ใดๆ จะทำให้ client เห็น stack trace
# เต็มๆ (เสี่ยงข้อมูลรั่ว) และเราจะไม่รู้เลยว่ามันเกิดขึ้นเว้นแต่จะเปิด terminal ทิ้งไว้ดู
# ตัวนี้จะ log รายละเอียด error เต็มๆ ลงไฟล์ (ผ่าน logging ด้านบน) แล้วตอบ client
# กลับไปแบบสุภาพ ไม่หลุดรายละเอียดภายในออกไป
@app.middleware("http")
async def catch_unhandled_errors(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as e:
        _server_logger.exception(f"[UnhandledError] {request.method} {request.url.path}: {e}")
        return JSONResponse(
            status_code=500,
            content={"detail": "เกิดข้อผิดพลาดที่ไม่คาดคิดในระบบ กรุณาลองใหม่อีกครั้ง"}
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
    tz: float = Query(None, description="Optional timezone offset in hours")
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
        
    # Calculate timezone offset if not provided
    if tz is None:
        try:
            tz_name = tf.timezone_at(lng=lon, lat=lat)
            if tz_name:
                timezone_obj = pytz.timezone(tz_name)
                try:
                    loc_dt = timezone_obj.localize(dt_local, is_dst=None)
                except Exception:
                    loc_dt = timezone_obj.localize(dt_local)
                tz = loc_dt.utcoffset().total_seconds() / 3600.0
            else:
                tz = round(lon / 15.0)
        except Exception as e:
            print(f"Error calculating timezone offset: {e}")
            tz = round(lon / 15.0)
            
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
        
        # Check retrograde/stationary/fast motion (excluding Lagna)
        if p == "lagna":
            retro[p] = ""
        else:
            if diff < 0:
                retro[p] = "พักร์"
            else:
                slow_thresholds = {
                    "sun": 0.96,
                    "moon": 12.2,
                    "mars": 0.15,
                    "mercury": 0.40,
                    "jupiter": 0.04,
                    "venus": 0.40,
                    "saturn": 0.015,
                    "rahu": 0.04,
                    "ketu": 0.04,
                    "thai_ketu": 0.50,
                    "uranus": 0.005,
                    "neptune": 0.002,
                    "pluto": 0.0015
                }
                fast_thresholds = {
                    "sun": 1.01,
                    "moon": 14.0,
                    "mars": 0.60,
                    "mercury": 1.30,
                    "jupiter": 0.10,
                    "venus": 1.22,
                    "saturn": 0.045,
                    "rahu": 0.06,
                    "ketu": 0.06,
                    "thai_ketu": 0.55,
                    "uranus": 0.015,
                    "neptune": 0.008,
                    "pluto": 0.005
                }
                
                if diff <= slow_thresholds.get(p, 0.01):
                    retro[p] = "มนต์"
                elif diff >= fast_thresholds.get(p, 1.5):
                    retro[p] = "เสริด"
                else:
                    retro[p] = ""
            
    # 5. Calculate Lagna (Ascendant) on the fly
    lagna_lon = calculate_lagna(julian_day, lat, lon, ayanamsa)
    pos["lagna"] = lagna_lon
    retro["lagna"] = ""
    
    return {
        "pos": pos,
        "retro": retro,
        "ayanamsa": ayanamsa,
        "julian_day": julian_day,
        "timezone_offset": tz,
        "source": "database_csv"
    }

# Serve static files from the same directory
@app.get("/")
def get_index():
    index_path = os.path.join(BASE_DIR, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return FileResponse(os.path.join(BASE_DIR, "index.html"))

@app.get("/api/calendar/busy")
async def get_busy_slots(date: str):
    api_key = CONFIG.get("GOOGLE_CALENDAR_API_KEY", "")
    if not api_key:
        try:
            day = int(date.split("-")[2])
        except Exception:
            day = 1
        return {"busy_slots": [{"startHour": day % 8, "endHour": (day % 8) + 1}, {"startHour": (day + 3) % 8, "endHour": ((day + 3) % 8) + 1}], "simulated": True}
        
    calendar_id = "muhub54@gmail.com"
    time_min = f"{date}T00:00:00Z"
    time_max = f"{date}T23:59:59Z"
    url = f"https://www.googleapis.com/calendar/v3/calendars/{urllib.parse.quote(calendar_id)}/events?key={api_key}&timeMin={time_min}&timeMax={time_max}&singleEvents=true"
    
    try:
        req = urllib.request.Request(url, method="GET")
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode("utf-8"))
            
        busy_slots = []
        for event in data.get("items", []):
            start_val = event.get("start", {}).get("dateTime") or event.get("start", {}).get("date")
            end_val = event.get("end", {}).get("dateTime") or event.get("end", {}).get("date")
            if not start_val or not end_val:
                continue
            try:
                # Handle all day events
                if "T" not in start_val:
                    busy_slots.append({"startHour": 0.0, "endHour": 24.0})
                    continue
                
                # Parse ISO date with timezone
                dt_start = datetime.datetime.fromisoformat(start_val.replace("Z", "+00:00"))
                dt_end = datetime.datetime.fromisoformat(end_val.replace("Z", "+00:00"))
                
                # Convert timezone to Thailand (UTC+7)
                tz_thai = datetime.timezone(datetime.timedelta(hours=7))
                if dt_start.tzinfo is not None:
                    dt_start = dt_start.astimezone(tz_thai)
                if dt_end.tzinfo is not None:
                    dt_end = dt_end.astimezone(tz_thai)
                    
                start_h = dt_start.hour + dt_start.minute / 60.0
                end_h = dt_end.hour + dt_end.minute / 60.0
                busy_slots.append({"startHour": start_h, "endHour": end_h})
            except Exception as ex:
                print(f"Error parsing event: {ex} (start={start_val}, end={end_val})")
        return {"busy_slots": busy_slots, "simulated": False}
    except Exception as e:
        try:
            day = int(date.split("-")[2])
        except Exception:
            day = 1
        return {"busy_slots": [{"startHour": day % 8, "endHour": (day % 8) + 1}, {"startHour": (day + 3) % 8, "endHour": ((day + 3) % 8) + 1}], "simulated": True, "error": str(e)}

class BlockPayload(BaseModel):
    dateStr: str
    slotStr: str
    name: str
    lineId: str
    serviceName: str
    astrologerName: str
    questions: str = ""

@app.post("/api/calendar/block")
async def block_calendar_event(payload: BlockPayload):
    script_url = CONFIG.get("GOOGLE_SCRIPT_URL", "")
    if not script_url:
        return {"success": True, "simulated": True, "data": {"eventId": f"mock-gcal-{datetime.datetime.now().microsecond}"}}
        
    parts = payload.slotStr.split("-")
    start_part = parts[0].strip()
    end_part = parts[1].strip() if len(parts) > 1 else ""
    start_hour = start_part[:2]
    end_hour = end_part[:2] if end_part else f"{int(start_hour) + 1:02d}"
    end_minute = end_part[3:5] if end_part else "00"
    
    start_str = f"{payload.dateStr}T{start_hour}:00:00+07:00"
    end_str = f"{payload.dateStr}T{end_hour}:{end_minute}:00+07:00"
    
    gas_payload = {
        "action": "create",
        "summary": f"MuHub จองคิว: คุณ {payload.name} (Line: {payload.lineId or 'ไม่ระบุ'})",
        "description": f"บริการ: {payload.serviceName}\nนักพยากรณ์: {payload.astrologerName}\nLine ID: {payload.lineId or 'ไม่ระบุ'}\nคำถามที่สนใจ: {payload.questions or 'ไม่มี'}\nบันทึกจากระบบ MuHub Booking",
        "startTime": start_str,
        "endTime": end_str
    }
    
    try:
        data_json = json.dumps(gas_payload).encode("utf-8")
        req = urllib.request.Request(
            script_url,
            data=data_json,
            headers={"Content-Type": "text/plain;charset=utf-8"},
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=15) as response:
            res_data = json.loads(response.read().decode("utf-8"))
        if res_data and res_data.get("success") is False:
            raise Exception(res_data.get("error") or "Google Apps Script error")
        return {"success": True, "simulated": False, "data": res_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class DeletePayload(BaseModel):
    eventId: str

@app.post("/api/calendar/delete")
async def delete_calendar_event(payload: DeletePayload):
    script_url = CONFIG.get("GOOGLE_SCRIPT_URL", "")
    if not script_url or payload.eventId.startswith("mock-") or payload.eventId.startswith("mock_"):
        return {"success": True, "simulated": True, "message": "ลบกิจกรรมจำลองสำเร็จ"}
        
    gas_payload = {
        "action": "delete",
        "eventId": payload.eventId
    }
    
    try:
        data_json = json.dumps(gas_payload).encode("utf-8")
        req = urllib.request.Request(
            script_url,
            data=data_json,
            headers={"Content-Type": "text/plain;charset=utf-8"},
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=15) as response:
            res_data = json.loads(response.read().decode("utf-8"))
        return {"success": True, "data": res_data}
    except Exception as e:
        return {"success": False, "error": str(e)}

class UploadPayload(BaseModel):
    base64Data: str
    mimeType: str
    filename: str

@app.post("/api/calendar/upload-slip")
async def upload_slip_event(payload: UploadPayload):
    script_url = CONFIG.get("GOOGLE_SCRIPT_URL", "")
    if not script_url:
        return {"success": True, "simulated": True, "fileUrl": "https://drive.google.com/open?id=mock-drive-file-id"}
        
    gas_payload = {
        "action": "uploadSlip",
        "folderId": "1RtwEoH4ES9QJT2oB8JobUQw1rncnETYF",
        "filename": payload.filename,
        "mimeType": payload.mimeType,
        "base64Data": payload.base64Data
    }
    
    try:
        data_json = json.dumps(gas_payload).encode("utf-8")
        req = urllib.request.Request(
            script_url,
            data=data_json,
            headers={"Content-Type": "text/plain;charset=utf-8"},
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=30) as response:
            res_data = json.loads(response.read().decode("utf-8"))
        if res_data and res_data.get("success") is False:
            raise Exception(res_data.get("error") or "Google Apps Script error")
        return {"success": True, "simulated": False, "fileUrl": res_data.get("fileUrl")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Serve other static files (like javascript, css, etc.)
app.mount("/", StaticFiles(directory=BASE_DIR), name="static")

if __name__ == "__main__":
    import uvicorn
    # Serve on port 3737 to match the old perl server port
    uvicorn.run(app, host="127.0.0.1", port=3737)
