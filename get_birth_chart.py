import datetime
import jyotishganit.core.astronomical as ast
import ephemeris_calc

def main():
    ast._initialize_astronomical_data()
    
    # Target date: 7 December 1984
    # Time: 08:44 AM local time
    # Timezone: UTC+7
    # Location: Bangkok (13.7563 N, 100.5018 E)
    
    date_obj = datetime.date(1984, 12, 7)
    time_str = "08:44"
    lat = 13.7563
    lon = 100.5018
    timezone_offset = 7.0
    
    # Local time
    dt_local = datetime.datetime.strptime("1984-12-07 08:44", "%Y-%m-%d %H:%M")
    # Convert to UTC
    dt_utc = dt_local - datetime.timedelta(hours=timezone_offset)
    
    ts = ast._ts
    t = ts.from_datetime(dt_utc.replace(tzinfo=datetime.timezone.utc))
    
    # Calculate positions
    data = ephemeris_calc.calculate_all_planetary_positions(t, lat, lon)
    asc_lon = ast.calculate_ascendant(t, lat, lon, data['ayanamsa'])
    asc_details = ephemeris_calc.get_zodiac_details(asc_lon)
    
    # Get sunrise for comparison
    t_sunrise = ephemeris_calc.find_local_sunrise(date_obj, lat, lon)
    sunrise_dt_utc = t_sunrise.utc_datetime()
    sunrise_dt_local = sunrise_dt_utc + datetime.timedelta(hours=timezone_offset)
    
    print("\n--- ผลคำนวณตำแหน่งดาวและลัคนาประจำดวงชะตา ---")
    print(f"วันเกิด: 7 ธันวาคม พ.ศ. 2527 (ค.ศ. 1984)")
    print(f"เวลาเกิด: {time_str} น. (เวลาท้องถิ่นประเทศไทย UTC+7)")
    print(f"เวลาอาทิตย์ขึ้นจริงในวันเกิด: {sunrise_dt_local.strftime('%H:%M:%S')} น.")
    print(f"พิกัดสถานที่: ลองจิจูด {lon}° E, ละติจูด {lat}° N")
    print(f"ค่าอายนางศะลาหิรี (Ayanamsa): {data['ayanamsa']:.5f}°")
    print(f"Julian Day: {data['julian_day']:.5f}")
    print(f"-----------------------------------------\n")
    
    planets = data["planets"]
    planet_keys = [
        "Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn",
        "Rahu", "ThaiKetu", "Uranus", "Neptune", "Pluto"
    ]
    
    print(f"{'สัญลักษณ์':<10} | {'ดาว/ปัจจัย':<18} | {'ราศี':<10} | {'ค่าองศา / ลิปดา':<20}")
    print("-" * 60)
    print(f"{'ล':<10} | {'ลัคนา':<18} | {asc_details['sign_th']:<10} | {asc_details['degrees']:02d}° {asc_details['minutes']:02d}' {asc_details['seconds']:02d}\"")
    for pk in planet_keys:
        p = planets[pk]
        label = p["th"]
        if pk == "ThaiKetu":
            label = "เกตุไทย"
        print(f"{p['symbol']:<10} | {label:<18} | {p['sign_th']:<10} | {p['degrees']:02d}° {p['minutes']:02d}' {p['seconds']:02d}\"")

if __name__ == "__main__":
    main()
