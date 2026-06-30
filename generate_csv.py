import os
import time
import datetime
import csv
import sys
import numpy as np
from skyfield import api, almanac
import jyotishganit.core.astronomical as ast
import ephemeris_calc
import db_generator

def main():
    # 1. Initialize astronomical data (ephemeris, star catalog)
    print("กำลังเตรียมข้อมูลดาราศาสตร์ (NASA JPL Ephemeris)...")
    ast._initialize_astronomical_data()
    eph = ephemeris_calc.get_ephemeris()
    ts = ast._ts
    spica = ast._get_spica()
    
    # 2. Configuration
    start_year = 1900
    end_year = 2200
    lat = 13.7563       # Bangkok Latitude
    lon = 100.5018      # Bangkok Longitude
    timezone_offset = 7.0 # Bangkok is UTC+7
    
    output_filename = f"thai_ephemeris_{start_year}_{end_year}.csv"
    output_path = os.path.join(os.getcwd(), output_filename)
    
    print(f"\n--- ระบบคำนวณแบบสปีดเวกเตอร์ (Vectorized Ephemeris) ---")
    print(f"ช่วงปี: ค.ศ. {start_year} - {end_year}")
    print(f"พิกัดสถานที่อ้างอิง: ลองจิจูด {lon}° E, ละติจูด {lat}° N (กรุงเทพฯ)")
    print(f"เวลาฐาน: เวลาอาทิตย์ขึ้นจริงในแต่ละวัน (Actual Sunrise)")
    print(f"ดาวที่บันทึก: ๑-๗, ๘ (ราหูนิรายนะ), ๙ (เกตุลาหิรี), ๙ไทย (เกตุไทย), ๐ (มฤตยู), N (เนปจูน), P (พลูโต)")
    print(f"ไฟล์เอาต์พุต: {output_path}")
    print(f"----------------------------------------------------\n")
    
    # Headers
    headers = [
        "date", "julian_day", "ayanamsa", "sunrise_utc"
    ]
    planet_keys = [
        "Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn",
        "Rahu", "Ketu", "ThaiKetu", "Uranus", "Neptune", "Pluto"
    ]
    for pk in planet_keys:
        prefix = db_generator.map_key_to_field(pk)
        headers.extend([
            f"{prefix}_longitude",
            f"{prefix}_sign_th",
            f"{prefix}_sign_en",
            f"{prefix}_degrees",
            f"{prefix}_minutes",
            f"{prefix}_seconds",
            f"{prefix}_formatted"
        ])
        
    start_time = time.time()
    
    # Earth observer
    observer = api.wgs84.latlon(lat, lon)
    earth = eph['earth']
    
    # Planetary bodies mapping
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
    
    # Open CSV writer
    with open(output_path, mode="w", newline="", encoding="utf-8-sig") as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        
        # Loop year-by-year
        for year in range(start_year, end_year + 1):
            year_start_time = time.time()
            print(f"กำลังคำนวณปี ค.ศ. {year}... ", end="")
            sys.stdout.flush()
            
            # Align search window with local midnight (UTC+7)
            dt_start = datetime.datetime(year, 1, 1, 0, 0, 0) - datetime.timedelta(hours=timezone_offset)
            dt_end = datetime.datetime(year + 1, 1, 1, 0, 0, 0) - datetime.timedelta(hours=timezone_offset)
            
            t0 = ts.from_datetime(dt_start.replace(tzinfo=datetime.timezone.utc))
            t1 = ts.from_datetime(dt_end.replace(tzinfo=datetime.timezone.utc))
            
            # 1. Find all sunrises for this year
            t, y = almanac.find_discrete(t0, t1, almanac.sunrise_sunset(eph, observer))
            t_sunrise = t[y == 1]
            
            num_days = len(t_sunrise)
            if num_days == 0:
                print("ไม่พบพระอาทิตย์ขึ้นในปีนี้!")
                continue
                
            # 2. Calculate Ayanamsas in bulk
            pos_spica = earth.at(t_sunrise).observe(spica).apparent()
            _, lon_spica, _ = pos_spica.ecliptic_latlon()
            ayanamsas = (lon_spica.degrees - 180.0) % 360.0
            
            # 3. Calculate Major Planets in bulk
            sidereal_lons = {}
            for name, body in bodies.items():
                pos_body = earth.at(t_sunrise).observe(body).apparent()
                _, lon_body, _ = pos_body.ecliptic_latlon()
                sidereal_lons[name] = (lon_body.degrees - ayanamsas) % 360.0
                
            # 4. Calculate Rahu (Mean Node) and Vedic Ketu in bulk
            T = (t_sunrise.tt - 2451545.0) / 36525.0
            rahu_tropical = (125.04452 - 1934.136261 * T) % 360.0
            rahu_sidereal = (rahu_tropical - ayanamsas) % 360.0
            sidereal_lons["Rahu"] = rahu_sidereal
            sidereal_lons["Ketu"] = (rahu_sidereal + 180.0) % 360.0
            
            # 5. Calculate Thai Ketu (เกตุไทย) in bulk
            jd = t_sunrise.ut1
            n = jd - 0.050730381 - 588465.0
            sidereal_lons["ThaiKetu"] = (360.0 - (n * 0.530191458 % 360.0) - 54.1) % 360.0
            
            # 6. Format and write each row
            rows_to_write = []
            for idx in range(num_days):
                t_day = t_sunrise[idx]
                dt_utc = t_day.utc_datetime()
                dt_local = dt_utc + datetime.timedelta(hours=timezone_offset)
                date_str = dt_local.strftime('%Y-%m-%d')
                
                row = [
                    date_str,
                    t_day.ut1,
                    ayanamsas[idx],
                    dt_utc.isoformat()
                ]
                
                for pk in planet_keys:
                    lon_val = sidereal_lons[pk][idx]
                    p_details = ephemeris_calc.get_zodiac_details(lon_val)
                    row.extend([
                        p_details["longitude"],
                        p_details["sign_th"],
                        p_details["sign_en"],
                        p_details["degrees"],
                        p_details["minutes"],
                        p_details["seconds"],
                        p_details["formatted"]
                    ])
                
                rows_to_write.append(row)
                
            writer.writerows(rows_to_write)
            
            year_end_time = time.time()
            elapsed = year_end_time - year_start_time
            progress = ((year - start_year + 1) / (end_year - start_year + 1)) * 100
            print(f"เสร็จสิ้น! ({num_days} วัน, {elapsed:.2f} วินาที, ความคืบหน้า {progress:.1f}%)")
            sys.stdout.flush()
            
    total_elapsed = time.time() - start_time
    print(f"\n[+] สร้างไฟล์สำเร็จเรียบร้อยแล้ว!")
    print(f"ไฟล์บันทึกอยู่ที่: {output_path}")
    print(f"รวมเวลาประมวลผลทั้งหมด: {total_elapsed/60:.2f} นาที")

if __name__ == "__main__":
    main()
