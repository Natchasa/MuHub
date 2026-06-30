import datetime
import math
from typing import Dict, Any, List

from skyfield import api, almanac
import jyotishganit.core.astronomical as ast

_eph_custom = None

def get_ephemeris():
    global _eph_custom
    if _eph_custom is None:
        try:
            print("กำลังโหลด de440.bsp (1550 - 2650)...")
            _eph_custom = api.load('de440.bsp')
            print("โหลด de440.bsp สำเร็จ!")
        except Exception as e:
            print(f"Warning: Failed to load de440.bsp ({e}). Falling back to de421.bsp")
            _eph_custom = ast.get_ephemeris()
    return _eph_custom

def calculate_ayanamsa(t):
    # Ecliptic longitude of Spica using the custom ephemeris
    eph = get_ephemeris()
    spica = ast._get_spica()
    pos = eph['earth'].at(t).observe(spica).apparent()
    _, lon, _ = pos.ecliptic_latlon()
    ayanamsa = lon.degrees - 180.0
    return ayanamsa if ayanamsa >= 0 else ayanamsa + 360



# Thai Zodiac Names (both Thai and English)
ZODIAC_SIGNS = [
    {"th": "เมษ", "en": "Aries"},
    {"th": "พฤษภ", "en": "Taurus"},
    {"th": "มิถุน", "en": "Gemini"},
    {"th": "กรกฎ", "en": "Cancer"},
    {"th": "สิงห์", "en": "Leo"},
    {"th": "กันย์", "en": "Virgo"},
    {"th": "ตุลย์", "en": "Libra"},
    {"th": "พิจิก", "en": "Scorpio"},
    {"th": "ธนู", "en": "Sagittarius"},
    {"th": "มังกร", "en": "Capricorn"},
    {"th": "กุมภ์", "en": "Aquarius"},
    {"th": "มีน", "en": "Pisces"}
]

# Mapping of planet names/symbols in Thai Astrology
PLANETS_INFO = {
    "Sun": {"id": 1, "th": "อาทิตย์", "symbol": "๑"},
    "Moon": {"id": 2, "th": "จันทร์", "symbol": "๒"},
    "Mars": {"id": 3, "th": "อังคาร", "symbol": "๓"},
    "Mercury": {"id": 4, "th": "พุธ", "symbol": "๔"},
    "Jupiter": {"id": 5, "th": "พฤหัสบดี", "symbol": "๕"},
    "Venus": {"id": 6, "th": "ศุกร์", "symbol": "๖"},
    "Saturn": {"id": 7, "th": "เสาร์", "symbol": "๗"},
    "Rahu": {"id": 8, "th": "ราหู", "symbol": "๘"},
    "Ketu": {"id": 9, "th": "เกตุ (ลาหิรี)", "symbol": "๙"},
    "ThaiKetu": {"id": 99, "th": "เกตุไทย", "symbol": "๙"},
    "Uranus": {"id": 0, "th": "มฤตยู", "symbol": "๐"},
    "Neptune": {"id": 11, "th": "เนปจูน", "symbol": "N"},
    "Pluto": {"id": 12, "th": "พลูโต", "symbol": "P"}
}

def find_local_sunrise(date_obj: datetime.date, latitude: float, longitude: float):
    """
    Finds the exact sunrise time (UTC) on a given calendar date at the specified coordinates.
    """
    eph = get_ephemeris()
    ts = ast._ts
    
    # Define observer location
    observer = api.wgs84.latlon(latitude, longitude)
    
    # Estimate timezone offset based on longitude to create local search window
    tz_offset_hours = round(longitude / 15.0)
    
    # Local midnight of the day in UTC
    dt_local_midnight = datetime.datetime(date_obj.year, date_obj.month, date_obj.day, 0, 0, 0)
    dt_start = dt_local_midnight - datetime.timedelta(hours=tz_offset_hours)
    dt_end = dt_start + datetime.timedelta(hours=24)
    
    t0 = ts.from_datetime(dt_start.replace(tzinfo=datetime.timezone.utc))
    t1 = ts.from_datetime(dt_end.replace(tzinfo=datetime.timezone.utc))
    
    # Find sunrise/sunset events
    t, y = almanac.find_discrete(t0, t1, almanac.sunrise_sunset(eph, observer))
    
    # Filter for sunrises (y = True)
    sunrises = [time for time, event in zip(t, y) if event]
    
    if sunrises:
        return sunrises[0]
    else:
        # Fallback to 06:00 AM local time if sunrise is not found
        fallback_dt = dt_local_midnight + datetime.timedelta(hours=6) - datetime.timedelta(hours=tz_offset_hours)
        return ts.from_datetime(fallback_dt.replace(tzinfo=datetime.timezone.utc))

def get_zodiac_details(longitude_deg: float) -> Dict[str, Any]:
    """
    Calculates the zodiac sign, degrees, minutes, and seconds from a 0-360 longitude.
    """
    sign_index = int(longitude_deg // 30) % 12
    sign_deg_total = longitude_deg % 30
    
    degrees = int(sign_deg_total)
    minutes_total = (sign_deg_total - degrees) * 60
    minutes = int(minutes_total)
    seconds = round((minutes_total - minutes) * 60)
    
    if seconds >= 60:
        minutes += 1
        seconds = 0
    if minutes >= 60:
        degrees += 1
        minutes = 0
    if degrees >= 30:
        sign_index = (sign_index + 1) % 12
        degrees = 0
        
    sign_info = ZODIAC_SIGNS[sign_index]
    
    return {
        "longitude": longitude_deg,
        "sign_index": sign_index,
        "sign_th": sign_info["th"],
        "sign_en": sign_info["en"],
        "degrees": degrees,
        "minutes": minutes,
        "seconds": seconds,
        "formatted": f"{sign_info['th']} {degrees:02d}° {minutes:02d}' {seconds:02d}\""
    }

def calculate_all_planetary_positions(t, latitude: float, longitude: float) -> Dict[str, Any]:
    """
    Calculates the sidereal positions of all planets using Lahiri Ayanamsa at time t.
    """
    eph = get_ephemeris()
    
    # 1. Calculate Ayanamsa (True Chitra Paksha)
    ayanamsa = calculate_ayanamsa(t)
    
    # Earth observer
    earth = eph['earth']
    
    # List of bodies to calculate
    bodies = {
        "Sun": eph['sun'],
        "Moon": eph['moon'],
        "Mars": eph['mars barycenter'],
        "Mercury": eph['mercury'],
        "Jupiter": eph['jupiter barycenter'],
        "Venus": eph['venus'],
        "Saturn": eph['saturn barycenter'],
        "Uranus": eph['uranus barycenter'],
        "Neptune": eph['neptune barycenter'],
        "Pluto": eph['pluto barycenter']
    }
    
    results = {}
    
    # Calculate major planets
    for name, body in bodies.items():
        pos = earth.at(t).observe(body).apparent()
        _, lon, _ = pos.ecliptic_latlon()
        tropical_lon = lon.degrees
        sidereal_lon = (tropical_lon - ayanamsa) % 360
        
        info = PLANETS_INFO[name]
        results[name] = {
            **info,
            **get_zodiac_details(sidereal_lon)
        }
        
    # 2. Calculate Rahu (Mean Node)
    T = (t.tt - 2451545.0) / 36525.0
    rahu_tropical = (125.04452 - 1934.136261 * T) % 360
    rahu_sidereal = (rahu_tropical - ayanamsa) % 360
    
    rahu_info = PLANETS_INFO["Rahu"]
    results["Rahu"] = {
        **rahu_info,
        **get_zodiac_details(rahu_sidereal)
    }
    
    # 3. Calculate Vedic Ketu (South Node)
    ketu_sidereal = (rahu_sidereal + 180) % 360
    ketu_info = PLANETS_INFO["Ketu"]
    results["Ketu"] = {
        **ketu_info,
        **get_zodiac_details(ketu_sidereal)
    }
    
    # 4. Calculate Thai Ketu (เกตุไทย - ๙)
    # Formula uses Julian Day (civil time / UT)
    # n = jd - 0.050730381 - 588465
    # thai_ketu = 360 - (n * 0.530191458 % 360) - 54.1
    jd = t.ut1
    n = jd - 0.050730381 - 588465.0
    thai_ketu_lon = (360.0 - (n * 0.530191458 % 360.0) - 54.1) % 360.0
    
    thai_ketu_info = PLANETS_INFO["ThaiKetu"]
    results["ThaiKetu"] = {
        **thai_ketu_info,
        **get_zodiac_details(thai_ketu_lon)
    }
    
    # Calculate astronomical Julian Day and UTC datetime
    dt_utc = t.utc_datetime()
    
    return {
        "utc_time": dt_utc.isoformat(),
        "julian_day": jd,
        "ayanamsa": ayanamsa,
        "planets": results
    }

def get_daily_ephemeris_for_date(date_obj: datetime.date, latitude: float, longitude: float) -> Dict[str, Any]:
    """
    Computes all planetary positions at local sunrise on the given date.
    """
    t_sunrise = find_local_sunrise(date_obj, latitude, longitude)
    positions = calculate_all_planetary_positions(t_sunrise, latitude, longitude)
    positions["date"] = date_obj.isoformat()
    return positions
