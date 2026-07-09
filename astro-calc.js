// astro-calc.js — Mathematical and Astronomy Calculations

// Math Utilities
const mod360 = x => ((x % 360) + 360) % 360;
const toRad = d => d * Math.PI / 180;
const toDeg = r => r * 180 / Math.PI;

function signPos(lon) {
  let si = Math.floor(lon / 30) % 12;
  let rem = lon - si * 30;
  let deg = Math.floor(rem);
  let min = Math.round((rem - deg) * 60);
  if (min >= 60) {
    min -= 60;
    deg += 1;
  }
  if (deg >= 30) {
    deg -= 30;
    si = (si + 1) % 12;
  }
  return { si, deg, min };
}

// Dead code 'nak' is kept for backward compatibility if ever called, but we plan to remove it.
function nak(lon) {
  return NAKSHATRA[Math.floor(lon / (360 / 27)) % 27];
}

// Julian Day Calculation
function toJD(y, m, d, h, mn) {
  if (m <= 2) { y--; m += 12; }
  const A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5 + (h + mn / 60) / 24;
}

// Ayanamsa / Sidereal Time
function lahiri(jd) {
  return 23.853722 + (jd - 2451545) / 36525 * 1.39723;
}

function gmst(jd) {
  const T = (jd - 2451545) / 36525;
  return mod360(280.46061837 + 360.98564736629 * (jd - 2451545) + 0.000387933 * T * T - T * T * T / 38710000);
}

function obliq(jd) {
  return 23.439291111 - 0.013004167 * (jd - 2451545) / 36525;
}

function ascendant(jd, lat, lon) {
  const ramc = mod360(gmst(jd) + lon), e = toRad(obliq(jd)), r = toRad(ramc), l = toRad(lat);
  return mod360(toDeg(Math.atan2(-Math.cos(r), Math.sin(r) * Math.cos(e) + Math.tan(l) * Math.sin(e))) + 180);
}

function meanRahu(jd) {
  const T = (jd - 2451545) / 36525;
  return mod360(125.04452 - 1934.136261 * T + 0.0020708 * T * T + T * T * T / 450000);
}

// Retrograde / Motion Flag calculation
function getMotion(body, ms) {
  try {
    const eLon = (b, t) => Astronomy.Ecliptic(Astronomy.GeoVector(b, new Date(t), true)).elon;
    let d = eLon(body, ms + 43200000) - eLon(body, ms - 43200000);
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    if (d < 0) return "พักร์";
    
    const slow_thresholds = {
      'Sun': 0.96, 'Moon': 12.2,
      'Mercury': 0.40, 'Venus': 0.40, 'Mars': 0.15,
      'Jupiter': 0.04, 'Saturn': 0.015, 'Uranus': 0.005,
      'Neptune': 0.002, 'Pluto': 0.0015
    };
    const fast_thresholds = {
      'Sun': 1.01, 'Moon': 14.0,
      'Mercury': 1.30, 'Venus': 1.22, 'Mars': 0.60,
      'Jupiter': 0.10, 'Saturn': 0.045, 'Uranus': 0.015,
      'Neptune': 0.008, 'Pluto': 0.005
    };
    
    const s_thresh = slow_thresholds[body] || 0.01;
    const f_thresh = fast_thresholds[body] || 1.5;
    
    if (d <= s_thresh) return "มนต์";
    if (d >= f_thresh) return "เสริด";
    return '';
  } catch (e) {
    return '';
  }
}

// Approximate planetary positions (fallback when Astronomy engine fails)
function approxPos(jd, ay) {
  const T = (jd - 2451545) / 36525, d = jd - 2451545;
  const L0 = mod360(280.46646 + 36000.76983 * T), M = mod360(357.52911 + 35999.05029 * T), Mr = toRad(M);
  const C = (1.914602 - 0.004817 * T) * Math.sin(Mr) + (0.019993 - 0.000101 * T) * Math.sin(2 * Mr) + 0.000289 * Math.sin(3 * Mr);
  const sun = mod360(L0 + C);
  const Lm = mod360(218.3165 + 481267.8813 * T), Mm = mod360(134.9634 + 477198.8676 * T), D = mod360(297.8502 + 445267.1115 * T);
  const moon = mod360(Lm + 6.289 * Math.sin(toRad(Mm)) - 1.274 * Math.sin(toRad(2 * D - Mm)) + 0.658 * Math.sin(toRad(2 * D)) - 0.186 * Math.sin(Mr));
  const ap = l => mod360(l - ay);
  return {
    sun: ap(sun), moon: ap(moon), mercury: ap(mod360(252.2503 + 4.09233445 * d)),
    venus: ap(mod360(181.9799 + 1.60213034 * d)), mars: ap(mod360(355.4330 + 0.52402068 * d)),
    jupiter: ap(mod360(34.3515 + 0.08308533 * d)), saturn: ap(mod360(50.0774 + 0.03346062 * d))
  };
}

// Compute client-side chart data
function compute(y, mo, d, h, mn, tz, lat, lon) {
  const utcMs = Date.UTC(y, mo - 1, d, h, mn, 0) - tz * 3600000;
  const ut = new Date(utcMs);
  const jd = toJD(ut.getUTCFullYear(), ut.getUTCMonth() + 1, ut.getUTCDate(), ut.getUTCHours(), ut.getUTCMinutes());
  const ay = lahiri(jd);
  const pos = {}, retro = {};
  try {
    if (typeof Astronomy === 'undefined') throw 0;
    pos.sun = mod360(Astronomy.SunPosition(ut).elon - ay);
    retro.sun = getMotion('Sun', utcMs);
    for (const [B, k] of [
      ['Moon', 'moon'], ['Mercury', 'mercury'], ['Venus', 'venus'], ['Mars', 'mars'],
      ['Jupiter', 'jupiter'], ['Saturn', 'saturn'], ['Uranus', 'uranus'],
      ['Neptune', 'neptune'], ['Pluto', 'pluto']
    ]) {
      pos[k] = mod360(Astronomy.Ecliptic(Astronomy.GeoVector(B, ut, true)).elon - ay);
      retro[k] = getMotion(B, utcMs);
    }
  } catch (e) {
    Object.assign(pos, approxPos(jd, ay));
  }
  pos.rahu = mod360(meanRahu(jd) - ay);
  pos.ketu = mod360(pos.rahu + 180);
  pos.lagna = mod360(ascendant(jd, lat, lon) - ay);

  // Calculate Thai Ketu (constant rate retrograde motion)
  const n = jd - 0.050730381 - 588465.0;
  pos.thai_ketu = mod360(360.0 - (n * 0.530191458 % 360.0) - 54.1);

  // Set motion flags for node-based planets
  retro.rahu = "พักร์";
  retro.ketu = "พักร์";
  retro.thai_ketu = "พักร์";
  return { pos, retro, ay, jd };
}

// Async API calculation with client-side fallback
async function computeChart(y, mo, d, h, mn, tz, lat, lon) {
  const dateStr = `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const timeStr = `${String(h).padStart(2, '0')}:${String(mn).padStart(2, '0')}`;

  if (y >= 1900 && y <= 2200) {
    try {
      const url = `/api/calculate?date=${dateStr}&time=${timeStr}&lat=${lat}&lon=${lon}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        return {
          pos: data.pos,
          retro: data.retro,
          ay: data.ayanamsa,
          jd: data.julian_day,
          tz: data.timezone_offset,
          source: 'db'
        };
      }
    } catch (e) {
      console.warn("API error, falling back to client-side calculation:", e);
    }
  }

  const res = compute(y, mo, d, h, mn, tz, lat, lon);
  res.source = 'browser';
  res.tz = tz;
  return res;
}

// Check calendar validity
function isValidDate(year, month, day) {
  if (day < 1 || month < 1 || month > 12) return false;
  const d = new Date(year, month - 1, day);
  return d.getFullYear() === year &&
         d.getMonth()    === month - 1 &&
         d.getDate()     === day;
}

// Bisection solver to find the exact Solar Return time in UTC milliseconds
function findSolarReturnTime(natalSunLon, targetYear, bmo, bd) {
  let tMin = Date.UTC(targetYear, bmo - 1, bd - 2, 0, 0, 0);
  let tMax = Date.UTC(targetYear, bmo - 1, bd + 2, 23, 59, 59);

  const getDiff = (tMs) => {
    const ut = new Date(tMs);
    const jd = toJD(ut.getUTCFullYear(), ut.getUTCMonth() + 1, ut.getUTCDate(), ut.getUTCHours(), ut.getUTCMinutes());
    const ay = lahiri(jd);
    let sunLon;
    if (typeof Astronomy !== 'undefined') {
      sunLon = mod360(Astronomy.SunPosition(ut).elon - ay);
    } else {
      sunLon = approxPos(jd, ay).sun;
    }
    let diff = sunLon - natalSunLon;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    return diff;
  };

  for (let i = 0; i < 30; i++) {
    const tMid = (tMin + tMax) / 2;
    const diffMid = getDiff(tMid);
    if (Math.abs(diffMid) < 0.00001) {
      return tMid;
    }
    const diffMin = getDiff(tMin);
    if (diffMin * diffMid < 0) {
      tMax = tMid;
    } else {
      tMin = tMid;
    }
  }
  return (tMin + tMax) / 2;
}
