'use strict';




// ── CONSTANTS ──────────────────────────────────────────────────────────
const SIGNS_TH = ['เมษ','พฤษภ','มิถุน','กรกฎ','สิงห์','กันย์',
                  'ตุลย์','พิจิก','ธนู','มกร','กุมภ์','มีน'];
const NAKSHATRA = [
  'อัศวินี','ภรณี','กฤตติกา','โรหิณี','มฤคศิรา','อาร์ทรา',
  'ปุนรวสุ','ปุษยะ','อาศเลษา','มฆา','ปูรวผลคุณี','อุตรผลคุณี',
  'หัสตะ','จิตรา','สวาติ','วิศาขา','อนุราธา','เชยษฐา',
  'มูลา','ปูรวาษาฑา','อุตราษาฑา','ศรวณะ','ธนิษฐา','ศตภิษา',
  'ปูรวภัทรปทา','อุตรภัทรปทา','เรวดี'
];

// Planet definitions — index order matters for numbering
const PLANETS = [
  {id:'lagna',   th:'ลัคนา',      numTH:'ล', numAR:'ล'},
  {id:'sun',     th:'อาทิตย์',    numTH:'๑', numAR:'1'},
  {id:'moon',    th:'จันทร์',     numTH:'๒', numAR:'2'},
  {id:'mars',    th:'อังคาร',     numTH:'๓', numAR:'3'},
  {id:'mercury', th:'พุธ',        numTH:'๔', numAR:'4'},
  {id:'jupiter', th:'พฤหัส',      numTH:'๕', numAR:'5'},
  {id:'venus',   th:'ศุกร์',      numTH:'๖', numAR:'6'},
  {id:'saturn',  th:'เสาร์',      numTH:'๗', numAR:'7'},
  {id:'rahu',    th:'ราหู',       numTH:'๘', numAR:'8'},
  {id:'thai_ketu', th:'เกตุ',     numTH:'๙', numAR:'9'},
  {id:'uranus',   th:'มฤตยู',      numTH:'๐', numAR:'0'},
  {id:'neptune',  th:'เนปจูน',     numTH:'น', numAR:'น'},
  {id:'pluto',    th:'พลูโต',      numTH:'พ', numAR:'พ'},
];

// ── MATH ───────────────────────────────────────────────────────────────
const mod360 = x => ((x%360)+360)%360;
const toRad = d => d*Math.PI/180;
const toDeg = r => r*180/Math.PI;
function signPos(lon){
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
function nak(lon){return NAKSHATRA[Math.floor(lon/(360/27))%27];}

// ── JULIAN DAY ─────────────────────────────────────────────────────────
function toJD(y,m,d,h,mn){
  if(m<=2){y--;m+=12;}
  const A=Math.floor(y/100),B=2-A+Math.floor(A/4);
  return Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d+B-1524.5+(h+mn/60)/24;
}

// ── AYANAMSA / SIDEREAL TIME ───────────────────────────────────────────
function lahiri(jd){return 23.853722+(jd-2451545)/36525*1.39723;}
function gmst(jd){const T=(jd-2451545)/36525;return mod360(280.46061837+360.98564736629*(jd-2451545)+0.000387933*T*T-T*T*T/38710000);}
function obliq(jd){return 23.439291111-0.013004167*(jd-2451545)/36525;}
function ascendant(jd,lat,lon){
  const ramc=mod360(gmst(jd)+lon),e=toRad(obliq(jd)),r=toRad(ramc),l=toRad(lat);
  // atan2 formula yields the Descendant; add 180° to get the Ascendant (Eastern horizon)
  return mod360(toDeg(Math.atan2(-Math.cos(r),Math.sin(r)*Math.cos(e)+Math.tan(l)*Math.sin(e)))+180);
}
function meanRahu(jd){const T=(jd-2451545)/36525;return mod360(125.04452-1934.136261*T+0.0020708*T*T+T*T*T/450000);}

// ── RETROGRADE/STATIONARY/FAST MOTION ────────────────────────────────────
function getMotion(body,ms){
  try{
    const eLon=(b,t)=>Astronomy.Ecliptic(Astronomy.GeoVector(b,new Date(t),true)).elon;
    let d=eLon(body,ms+43200000)-eLon(body,ms-43200000);
    if(d>180)d-=360;if(d<-180)d+=360;
    if(d<0) return "พักร์";
    
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
  }catch(e){return '';}
}

// ── APPROX FALLBACK ────────────────────────────────────────────────────
function approxPos(jd,ay){
  const T=(jd-2451545)/36525,d=jd-2451545;
  const L0=mod360(280.46646+36000.76983*T),M=mod360(357.52911+35999.05029*T),Mr=toRad(M);
  const C=(1.914602-0.004817*T)*Math.sin(Mr)+(0.019993-0.000101*T)*Math.sin(2*Mr)+0.000289*Math.sin(3*Mr);
  const sun=mod360(L0+C);
  const Lm=mod360(218.3165+481267.8813*T),Mm=mod360(134.9634+477198.8676*T),D=mod360(297.8502+445267.1115*T);
  const moon=mod360(Lm+6.289*Math.sin(toRad(Mm))-1.274*Math.sin(toRad(2*D-Mm))+0.658*Math.sin(toRad(2*D))-0.186*Math.sin(Mr));
  const ap=l=>mod360(l-ay);
  return{sun:ap(sun),moon:ap(moon),mercury:ap(mod360(252.2503+4.09233445*d)),
    venus:ap(mod360(181.9799+1.60213034*d)),mars:ap(mod360(355.4330+0.52402068*d)),
    jupiter:ap(mod360(34.3515+0.08308533*d)),saturn:ap(mod360(50.0774+0.03346062*d))};
}

// ── COMPUTE CHART ──────────────────────────────────────────────────────
function compute(y,mo,d,h,mn,tz,lat,lon){
  // Use Date.UTC() to avoid double-timezone offset when browser is in UTC+7
  const utcMs=Date.UTC(y,mo-1,d,h,mn,0)-tz*3600000;
  const ut=new Date(utcMs);
  const jd=toJD(ut.getUTCFullYear(),ut.getUTCMonth()+1,ut.getUTCDate(),ut.getUTCHours(),ut.getUTCMinutes());
  const ay=lahiri(jd);
  const pos={},retro={};
  try{
    if(typeof Astronomy==='undefined') throw 0;
    pos.sun=mod360(Astronomy.SunPosition(ut).elon-ay);
    retro.sun=getMotion('Sun',utcMs);
    for(const[B,k] of[
      ['Moon','moon'],['Mercury','mercury'],['Venus','venus'],['Mars','mars'],
      ['Jupiter','jupiter'],['Saturn','saturn'],['Uranus','uranus'],
      ['Neptune','neptune'],['Pluto','pluto']
    ]){
      pos[k]=mod360(Astronomy.Ecliptic(Astronomy.GeoVector(B,ut,true)).elon-ay);
      retro[k]=getMotion(B,utcMs);
    }
  }catch(e){Object.assign(pos,approxPos(jd,ay));}
  pos.rahu=mod360(meanRahu(jd)-ay);
  pos.ketu=mod360(pos.rahu+180);
  pos.lagna=mod360(ascendant(jd,lat,lon)-ay);

  // Calculate Thai Ketu (constant rate retrograde motion)
  const n = jd - 0.050730381 - 588465.0;
  pos.thai_ketu = mod360(360.0 - (n * 0.530191458 % 360.0) - 54.1);

  // Set motion flags for node-based planets
  retro.rahu = "พักร์";
  retro.ketu = "พักร์";
  retro.thai_ketu = "พักร์";
  return{pos,retro,ay,jd};
}

// ── APP STATE ───────────────────────────────────────────────────────────
let nData=null,tData=null,showN=true,showT=true,age=1;
let birthYear=1990, birthMonth=4, birthDay=13, birthHour=8, birthMin=0;

// ── TOGGLES ────────────────────────────────────────────────────────────
function toggleLayer(l){
  if(l==='n'){showN=!showN;document.getElementById('togN').classList.toggle('off',!showN);}
  else{showT=!showT;document.getElementById('togT').classList.toggle('off',!showT);}
  renderThaksa(birthYear, birthMonth, birthDay, birthHour, birthMin);drawWheel();renderTable();
}

// ── LOCATION DATABASE ──────────────────────────────────────────────────
var LOCATION_DATABASE = {};
let locationsLoaded = false;
let loadingLocationsPromise = null;

// ── BIRTH DATA PERSISTENCE ─────────────────────────────────────────────
const BIRTH_DATA_KEY = 'muhub_birth_data';

function saveBirthData() {
  try {
    const fields = ['bName','bLastName','bLineId','bDay','bMonth','bYear','bHour','bMin',
                    'bCountry','bCity','bLat','bLon',
                    'tDay','tMonth','tYear','tHour','tMin','tCountry','tCity'];
    const data = {};
    fields.forEach(id => {
      const el = document.getElementById(id);
      if (el) data[id] = el.value;
    });
    localStorage.setItem(BIRTH_DATA_KEY, JSON.stringify(data));
  } catch(e) {
    console.warn('saveBirthData failed:', e);
  }
}

function restoreBirthData() {
  try {
    const raw = localStorage.getItem(BIRTH_DATA_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);

    // Restore simple text/number fields first
    ['bName','bLastName','bLineId','bDay','bMonth','bYear','bHour','bMin',
     'tDay','tMonth','tYear','tHour','tMin'].forEach(id => {
      const el = document.getElementById(id);
      if (el && data[id] !== undefined) el.value = data[id];
    });

    // Restore country selects, then repopulate city dropdowns
    ['bCountry','tCountry'].forEach(id => {
      const el = document.getElementById(id);
      if (el && data[id]) {
        el.value = data[id];
        onCountryChange(id === 'bCountry' ? 'b' : 't');
      }
    });

    // Restore city after repopulating
    ['bCity','tCity'].forEach(id => {
      const el = document.getElementById(id);
      if (el && data[id]) el.value = data[id];
    });

    // Restore custom lat/lon if needed
    ['bLat','bLon'].forEach(id => {
      const el = document.getElementById(id);
      if (el && data[id]) el.value = data[id];
    });

    console.log('Birth data restored from localStorage.');
    return true;
  } catch(e) {
    console.warn('restoreBirthData failed:', e);
    return false;
  }
}

function ensureLocationsLoaded() {
  if (locationsLoaded) return Promise.resolve();
  if (loadingLocationsPromise) return loadingLocationsPromise;

  loadingLocationsPromise = new Promise((resolve) => {
    console.log("Loading locations.js...");
    const script = document.createElement('script');
    script.src = 'locations.js';
    script.onload = () => {
      locationsLoaded = true;
      populateCountryDropdowns();
      // Restore saved birth data if available, otherwise default to Bangkok transit
      const restored = restoreBirthData();
      if (!restored) populateCities('t', 'bangkok');
      runCalc(false);
      console.log("locations.js loaded successfully.");
      resolve();
    };
    script.onerror = (err) => {
      console.error('Failed to load locations.js', err);
      loadingLocationsPromise = null;
      resolve();
    };
    document.head.appendChild(script);
  });
  return loadingLocationsPromise;
}

// Start loading locations in the background right after load
window.addEventListener('load', () => {
  setTimeout(ensureLocationsLoaded, 100);
});

function populateCountryDropdowns() {
  const bCountry = document.getElementById('bCountry');
  const tCountry = document.getElementById('tCountry');
  const bookCountry = document.getElementById('bookCountry');
  if (!bCountry || !tCountry) return;

  const prevBVal = bCountry.value || 'TH';
  const prevTVal = tCountry.value || 'TH';
  const prevBookVal = bookCountry ? (bookCountry.value || 'TH') : 'TH';

  // Sort countries alphabetically by Thai name
  let countries = Object.entries(LOCATION_DATABASE).map(([code, data]) => ({
    code,
    name: data.name
  }));
  countries.sort((a, b) => a.name.localeCompare(b.name, 'th'));

  // Move TH to first, US to second
  let th = countries.find(c => c.code === 'TH');
  let us = countries.find(c => c.code === 'US');
  countries = countries.filter(c => c.code !== 'TH' && c.code !== 'US');
  if (us) countries.unshift(us);
  if (th) countries.unshift(th);

  let html = '';
  countries.forEach(c => {
    html += `<option value="${c.code}">${c.name}</option>`;
  });
  html += `<option value="custom">กำหนดเอง</option>`;

  bCountry.innerHTML = html;
  tCountry.innerHTML = html;
  if (bookCountry) bookCountry.innerHTML = html;

  bCountry.value = prevBVal;
  tCountry.value = prevTVal;
  if (bookCountry) bookCountry.value = prevBookVal;

  // Repopulate cities
  const bCitySelect = document.getElementById('bCity');
  const prevBCityVal = bCitySelect ? bCitySelect.value : null;
  populateCities('b', prevBCityVal);

  const tCitySelect = document.getElementById('tCity');
  const prevTCityVal = tCitySelect ? tCitySelect.value : null;
  populateCities('t', prevTCityVal);

  const bookCitySelect = document.getElementById('bookCity');
  const prevBookCityVal = bookCitySelect ? bookCitySelect.value : null;
  if (bookCitySelect) populateCities('book', prevBookCityVal);
}

const MONTHS_TH = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const WEEKDAYS_SHORT_TH = [
  'วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'
];

function populateDateDropdowns(prefix, defaultDate = null) {
  const daySel = document.getElementById(prefix + 'Day');
  const monthSel = document.getElementById(prefix + 'Month');
  
  // Day select
  daySel.innerHTML = '';
  for (let i = 1; i <= 31; i++) {
    const opt = document.createElement('option');
    opt.value = i;
    opt.text = i;
    daySel.appendChild(opt);
  }
  
  // Month select
  monthSel.innerHTML = '';
  MONTHS_TH.forEach((m, idx) => {
    const opt = document.createElement('option');
    opt.value = idx + 1;
    opt.text = m;
    monthSel.appendChild(opt);
  });
  
  const d = defaultDate ? new Date(defaultDate) : new Date();
  daySel.value = d.getDate();
  monthSel.value = d.getMonth() + 1;
  document.getElementById(prefix + 'Year').value = d.getFullYear() + 543;
  
  // Set default hours and minutes
  document.getElementById(prefix + 'Hour').value = String(d.getHours()).padStart(2, '0');
  document.getElementById(prefix + 'Min').value = String(d.getMinutes()).padStart(2, '0');
}

function populateCities(prefix, selectCityId = null) {
  const countryVal = document.getElementById(prefix + 'Country').value;
  const citySelect = document.getElementById(prefix + 'City');
  citySelect.innerHTML = '';
  
  const latField = document.getElementById(prefix + 'LatField');
  const lonField = document.getElementById(prefix + 'LonField');
  
  if (countryVal === 'custom') {
    latField.style.display = 'flex';
    lonField.style.display = 'flex';
    const opt = document.createElement('option');
    opt.value = 'custom';
    opt.text = 'กำหนดพิกัดเอง';
    citySelect.appendChild(opt);
    citySelect.disabled = true;
  } else {
    latField.style.display = 'none';
    lonField.style.display = 'none';
    citySelect.disabled = false;
    
    const countryData = LOCATION_DATABASE[countryVal];
    if (countryData) {
      countryData.cities.forEach(city => {
        const opt = document.createElement('option');
        opt.value = city.id;
        opt.text = city.name;
        citySelect.appendChild(opt);
      });
    }
    
    if (selectCityId) {
      citySelect.value = selectCityId;
    } else if (citySelect.options.length > 0) {
      citySelect.selectedIndex = 0;
    }
    
    onCityChange(prefix);
  }
}

function onCountryChange(prefix) {
  populateCities(prefix);
}

function onCityChange(prefix) {
  const countryVal = document.getElementById(prefix + 'Country').value;
  if (countryVal === 'custom') return;
  
  const cityId = document.getElementById(prefix + 'City').value;
  const countryData = LOCATION_DATABASE[countryVal];
  if (!countryData) return;
  
  const city = countryData.cities.find(c => c.id === cityId);
  if (city) {
    document.getElementById(prefix + 'Lat').value = city.lat;
    document.getElementById(prefix + 'Lon').value = city.lon;
  }
}

// ── TRANSIT NOW ────────────────────────────────────────────────────────
function setTransitNow(){
  const n = new Date();
  document.getElementById('tDay').value = n.getDate();
  document.getElementById('tMonth').value = n.getMonth() + 1;
  document.getElementById('tYear').value = n.getFullYear() + 543;
  document.getElementById('tHour').value = String(n.getHours()).padStart(2, '0');
  document.getElementById('tMin').value = String(n.getMinutes()).padStart(2, '0');
}

let isUnknownTime = false;
function toggleUnknownTime(){
  const bHour = document.getElementById('bHour');
  const bMin = document.getElementById('bMin');
  const btn = document.getElementById('btnUnknownTime');
  const badge = document.getElementById('lagnaBadge');
  isUnknownTime = !isUnknownTime;
  if(badge) badge.style.display = 'none';
  if(isUnknownTime){
    bHour.dataset.prevVal = bHour.value;
    bMin.dataset.prevVal = bMin.value;
    bHour.value = "06";
    bMin.value = "00";
    bHour.disabled = true;
    bMin.disabled = true;
    btn.innerHTML = '✓ ไม่ทราบเวลา';
    btn.className = 'btn btn-gold';
  } else {
    bHour.value = bHour.dataset.prevVal || "08";
    bMin.value = bMin.dataset.prevVal || "00";
    bHour.disabled = false;
    bMin.disabled = false;
    btn.innerHTML = 'ไม่ทราบเวลา';
    btn.className = 'btn btn-ghost';
  }
}

// ── ASYNC COMPUTE CHART ────────────────────────────────────────────────
async function computeChart(y, mo, d, h, mn, tz, lat, lon) {
  const dateStr = `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const timeStr = `${String(h).padStart(2, '0')}:${String(mn).padStart(2, '0')}`;

  if (y >= 1900 && y <= 2200) {
    try {
      // Omit tz so the backend calculates exact timezone offset based on lat, lon, and datetime
      const url = `/api/calculate?date=${dateStr}&time=${timeStr}&lat=${lat}&lon=${lon}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        return {
          pos: data.pos,
          retro: data.retro,
          ay: data.ayanamsa,
          jd: data.julian_day,
          tz: data.timezone_offset, // Store calculated offset
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

// ── RUN CALC ────────────────────────────────────────────────────────────
/**
 * Returns true only if the combination of year/month/day is a real calendar date.
 * Uses JS Date rollover: new Date(2024, 1, 30) becomes March 1 if Feb has no 30th.
 * year: CE year (not BE), month: 1-12, day: 1-31
 */
function isValidDate(year, month, day) {
  if (day < 1 || month < 1 || month > 12) return false;
  const d = new Date(year, month - 1, day);
  return d.getFullYear() === year &&
         d.getMonth()    === month - 1 &&
         d.getDate()     === day;
}

async function runCalc(isUserClick = false){
  const bDay = parseInt(document.getElementById('bDay').value);
  const bMonth = parseInt(document.getElementById('bMonth').value);
  const bYearBE = parseInt(document.getElementById('bYear').value);
  const bHour = parseInt(document.getElementById('bHour').value);
  const bMin = parseInt(document.getElementById('bMin').value);
  
  if (isNaN(bDay) || isNaN(bMonth) || isNaN(bYearBE) || isNaN(bHour) || isNaN(bMin)) {
    alert('กรุณากรอกวันเกิดและเวลาเกิดให้ถูกต้อง');
    return;
  }

  const byCE = bYearBE - 543;
  if (!isValidDate(byCE, bMonth, bDay)) {
    const MONTHS_TH_FULL = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน',
                            'กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
    const mName = MONTHS_TH_FULL[bMonth - 1] || `เดือน ${bMonth}`;
    alert(`วันที่ไม่ถูกต้อง: ${bDay} ${mName} พ.ศ. ${bYearBE} ไม่มีอยู่จริงในปฏิทิน\nกรุณาตรวจสอบวันเกิดใหม่อีกครั้ง`);
    return;
  }
  
  const by = bYearBE - 543;
  const bmo = bMonth;
  const bd = bDay;
  const bh = bHour;
  const bmn = bMin;

  birthYear = by;
  birthMonth = bmo;
  birthDay = bd;
  birthHour = bh;
  birthMin = bmn;

  const bCountry = document.getElementById('bCountry').value;
  let bLat = parseFloat(document.getElementById('bLat').value);
  let bLon = parseFloat(document.getElementById('bLon').value);
  let bTZ = 7.0;
  
  if (bCountry !== 'custom') {
    const cityId = document.getElementById('bCity').value;
    const city = LOCATION_DATABASE[bCountry].cities.find(c => c.id === cityId);
    if (city) {
      bLat = city.lat;
      bLon = city.lon;
      bTZ = city.tz !== undefined ? city.tz : (LOCATION_DATABASE[bCountry].tz !== undefined ? LOCATION_DATABASE[bCountry].tz : Math.round(bLon / 15.0));
    }
  } else {
    bTZ = Math.round(bLon / 15.0);
  }

  nData = await computeChart(by, bmo, bd, bh, bmn, bTZ, bLat, bLon);
  if (isUnknownTime && nData && nData.pos && nData.pos.sun !== undefined) {
    const sunSp = signPos(nData.pos.sun);
    const roundedSunDegree = sunSp.min > 0 ? sunSp.deg + 1 : sunSp.deg;
    let landingSignIndex = sunSp.si;
    if (roundedSunDegree > 0) {
      landingSignIndex = (sunSp.si + roundedSunDegree - 1) % 12;
    }
    nData.pos.lagna = landingSignIndex * 30 + 15;
  }
  const bNameVal = document.getElementById('bName').value.trim();
  const bLastNameVal = document.getElementById('bLastName') ? document.getElementById('bLastName').value.trim() : '';
  nData.name = (bNameVal + ' ' + bLastNameVal).trim() || 'ดวงชาตา';
  const bCalDate = new Date(by, bmo - 1, bd);
  let bAstroDay = bCalDate.getDay();
  if (bh < 6) {
    bAstroDay = (bAstroDay + 6) % 7;
  }
  const bDayName = WEEKDAYS_SHORT_TH[bAstroDay];
  nData.dateStr = `${bDayName}ที่ ${bDay} ${MONTHS_TH[bMonth-1]} พ.ศ. ${bYearBE}`;
  nData.timeStr = `${String(bHour).padStart(2,'0')}:${String(bMin).padStart(2,'0')} น.`;

  const tYearBE = parseInt(document.getElementById('tYear').value);
  const tMonth = parseInt(document.getElementById('tMonth').value);
  const tDay = parseInt(document.getElementById('tDay').value);
  const tHour = parseInt(document.getElementById('tHour').value);
  const tMin = parseInt(document.getElementById('tMin').value);
  
  if (!isNaN(tYearBE) && !isNaN(tMonth) && !isNaN(tDay) && !isNaN(tHour) && !isNaN(tMin)) {
    const ty = tYearBE - 543;
    const tmo = tMonth;
    const td = tDay;
    const th = tHour;
    const tmn = tMin;
    
    const tCountry = document.getElementById('tCountry').value;
    let tLat = parseFloat(document.getElementById('tLat').value);
    let tLon = parseFloat(document.getElementById('tLon').value);
    let tTZ = 7.0;
    
    if (tCountry !== 'custom') {
      const cityId = document.getElementById('tCity').value;
      const city = LOCATION_DATABASE[tCountry].cities.find(c => c.id === cityId);
      if (city) {
        tLat = city.lat;
        tLon = city.lon;
        tTZ = city.tz !== undefined ? city.tz : (LOCATION_DATABASE[tCountry].tz !== undefined ? LOCATION_DATABASE[tCountry].tz : Math.round(tLon / 15.0));
      }
    } else {
      tTZ = Math.round(tLon / 15.0);
    }
    
    tData = await computeChart(ty, tmo, td, th, tmn, tTZ, tLat, tLon);
    const tCalDate = new Date(ty, tmo - 1, td);
    let tAstroDay = tCalDate.getDay();
    if (th < 6) {
      tAstroDay = (tAstroDay + 6) % 7;
    }
    const tDayName = WEEKDAYS_SHORT_TH[tAstroDay];
    tData.dateStr = `${tDayName}ที่ ${tDay} ${MONTHS_TH[tMonth-1]} พ.ศ. ${tYearBE}`;
    tData.timeStr = `${String(tHour).padStart(2,'0')}:${String(tMin).padStart(2,'0')} น.`;
  } else {
    tData = null;
  }
  
  renderThaksa(by, bmo, bd, bh, bmn);drawWheel();renderTable();
  
  if (nData) {
    const badge = document.getElementById('lagnaBadge');
    const lagnaSp = signPos(nData.pos.lagna);
    const bNameVal = document.getElementById('bName').value.trim();
    const bLastNameVal = document.getElementById('bLastName') ? document.getElementById('bLastName').value.trim() : '';
    const nameVal = (bNameVal + ' ' + bLastNameVal).trim() || 'เจ้าชะตา';
    if (isUnknownTime) {
      badge.innerHTML = `คุณ${nameVal} ลัคนาราศีเกิด (อ.) คือ ราศี${SIGNS_TH[lagnaSp.si]}`;
    } else {
      badge.innerHTML = `คุณ${nameVal} ลัคนาราศีเกิด คือ ราศี${SIGNS_TH[lagnaSp.si]}`;
    }
    
    if (isUserClick) {
      badge.style.display = 'inline-flex';
    } else {
      badge.style.display = 'none';
    }
  }

  // Render Free Horoscope tab content
  if (typeof renderFreeHoroscope === 'function') {
    renderFreeHoroscope();
  }

  // Persist birth data so it survives page refresh
  saveBirthData();

}

async function uploadScreenshotToDrive(base64Data, filename) {
  const folderId = '14Qaj4FOPwQHQQmequjHkh6O4gQMp-2mf';
  const payload = {
    action: 'uploadSlip', // the Apps Script action to upload
    folderId: folderId,
    filename: filename,
    mimeType: 'image/jpeg',
    base64Data: base64Data
  };

  const scriptUrl = "https://script.google.com/macros/s/AKfycbwUkfB7te_1-o_u_2ZroBzpuACWmFYd8XS5JN3iv9rItvql-887wQw95SIIQBXWUQumPA/exec";
  try {
    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    console.log("Screenshot uploaded to Drive:", data);
    return data;
  } catch (e) {
    console.error("Error uploading screenshot to Drive:", e);
    throw e;
  }
}

async function captureAndUploadChart(bookingData) {
  const tabEl = document.getElementById('calculator-tab');
  if (!tabEl) return;

  // Build filename from bookingData (passed on confirm) or fall back to horoscope form fields
  let lineId, name, dateVal, timeVal;
  if (bookingData) {
    lineId   = bookingData.lineId  ? bookingData.lineId.trim()  : 'NA';
    name     = bookingData.name    ? bookingData.name.trim()    : 'ไม่มีชื่อ';
    // birthDateStr = "13 เมษายน 2533" → flatten to "13-4-2533"
    const bds = bookingData.birthDateStr || '';
    const MONTHS_NUM = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน',
                        'กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
    const mIdx = MONTHS_NUM.findIndex(m => bds.includes(m));
    const parts = bds.split(' ');
    dateVal  = `${parts[0]}-${mIdx + 1}-${parts[parts.length - 1]}`;
    timeVal  = `${String(bookingData.birthHour).padStart(2,'0')}.${String(bookingData.birthMin).padStart(2,'0')}น`;
  } else {
    const lineIdInput = document.getElementById('bLineId').value.trim();
    lineId   = lineIdInput || 'NA';
    const bNameVal     = document.getElementById('bName').value.trim();
    const bLastNameVal = document.getElementById('bLastName') ? document.getElementById('bLastName').value.trim() : '';
    name     = (bNameVal + ' ' + bLastNameVal).trim() || 'ไม่มีชื่อ';
    dateVal  = document.getElementById('bDay').value + '-' + document.getElementById('bMonth').value + '-' + document.getElementById('bYear').value;
    timeVal  = document.getElementById('bHour').value + '.' + document.getElementById('bMin').value + 'น';
  }

  // Create filename format: LineID_CustomerName_BirthDate_BirthTime
  const rawFilename = `${lineId}_${name}_${dateVal}_${timeVal}.jpg`;
  const filename = rawFilename.replace(/[\/\\?%*:|"<>\s]/g, '_');

  let revealedForCapture = false;

  try {
    // Wait for the browser to finish painting all pending renders.
    // Double rAF: first frame schedules after current JS task, second waits for the actual paint.
    await new Promise(resolve => {
      requestAnimationFrame(() => requestAnimationFrame(resolve));
    });

    // If calculator-tab is currently hidden (user is on another tab), temporarily
    // move it off-screen so html2canvas can read its layout without causing a visual flicker.
    if (tabEl.classList.contains('hidden') || getComputedStyle(tabEl).display === 'none') {
      tabEl.classList.remove('hidden');
      tabEl.style.visibility = 'hidden';
      tabEl.style.position = 'absolute';
      tabEl.style.top = '-99999px';
      tabEl.style.pointerEvents = 'none';
      revealedForCapture = true;
      // One extra frame to let the browser lay out the newly visible element
      await new Promise(resolve => requestAnimationFrame(resolve));
    }

    // Render the calculator tab to canvas using html2canvas
    const canvas = await html2canvas(tabEl, {
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#FFF8F0', // match the light cream body bg color
      scale: 1, // standard scale is extremely fast and light
      logging: false // disable logging for better performance
    });

    // Convert to JPEG base64
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    const base64Data = dataUrl.split(',')[1];

    // Upload
    console.log("Uploading chart screenshot to Drive...");
    const result = await uploadScreenshotToDrive(base64Data, filename);
    if (result && result.success) {
      console.log("Successfully uploaded chart screenshot. File URL:", result.fileUrl);
    }
  } catch (err) {
    console.error("Failed to capture and upload chart:", err);
  } finally {
    // Always restore tab to its original hidden state if we temporarily revealed it
    if (revealedForCapture) {
      tabEl.classList.add('hidden');
      tabEl.style.visibility = '';
      tabEl.style.position = '';
      tabEl.style.top = '';
      tabEl.style.pointerEvents = '';
    }
  }
}

const planetNameToNum = {
  'อาทิตย์': 1,
  'จันทร์': 2,
  'อังคาร': 3,
  'พุธ': 4,
  'พฤหัส': 5,
  'ศุกร์': 6,
  'เสาร์': 7,
  'ราหู': 8
};

const ASTRO_PREDICTIONS = {
  'อาทิตย์': [
    'เจ็บป่วย เสียทรัพย์ เสียมิตรหรือคนรัก จากที่อยู่ เดือดร้อนเพราะญาติ',
    'เดือดร้อนเพราะบริวารแล้วตัดลาก ได้คู่หรือที่พึ่ง ต่างเพศให้คุณ',
    'บาดเจ็บ ของหาย ถูกหลอกลวง เสียของรัก ผู้มีอำนาจหรือผู้ใหญ่ให้โทษ',
    'มีลาภต่างๆ จะได้ยศตำแหน่งหน้าที่ ให้หลักฐาน ได้บริวาร ต่างชาติให้คุณ',
    'ถูกทำร้ายเกิดคดี ไฟไหม้ เสียทรัพย์สิ้นต่างๆ ย้ายที่อยู่หรือสำนักงาน',
    'ได้คู่ บุตร บริวาร สัตว์ ยานพาหนะ เงินทอง ได้ที่พึ่ง ศึกษามีผลดี อาชีพดีขึ้น',
    'ย้ายงานหรือตำแหน่ง จากที่อยู่ จะเกิดคดีกับผู้ใหญ่ หรือบริวารเรื่องที่ดิน',
    'ได้ยศหรือตำแหน่งชื่อเสียง จะได้มรดก เครื่องอุปโภคบริโภค มีลาภลอย'
  ],
  'เสาร์': [
    'ไฟไหม้ ป่วย เสียทรัพย์ เกิดคดี ย้ายที่ มิตรเป็นศัตรู เสียญาติ ออกจากงาน',
    'ห้ามไปต่างถิ่น อยู่กับที่มีลาภผลต่างๆ ผู้ใหญ่จะอุปการะ จะได้คู่ต่างชาติ',
    'จะได้ลาภจากมิตรสหาย ได้คู่ บริวาร อาชีพเจริญดี การศึกษามีผลดีตาม',
    'มีผู้คิดร้ายหรือขัดขวางแล้วมีโรคคดี ได้งานดำเนิน เกียรติ อาชีพมีผล',
    'เสียทรัพย์ เพราะบุตรบริวาร ไฟไหม้ จากที่อยู่ ป่วย คนรักจากไป ถูกใส่ความ',
    'โรคคีได้บุตร บริวาร มีผู้อุปถัมภ์ ได้ลาภเงินทองของขาวเหลืองต่างๆ',
    'ท่าใจเพราะคนที่รัก ถูกทำร้าย ถูกลวง ป่วย อุบัติเหตุ คนในปกครองออกจากไป',
    'เดินทางไปดี เสียที่พึ่งแล้วต่างเทพอุปถัมภ์ ได้คู่ วิชาการได้ผลดี'
  ],
  'จันทร์': [
    'โรคคีได้ตำแหน่ง บริวาร สัตว์ ยานพาหนะ มีลาภลอย อาชีพดีขึ้น ศึกษามีผล ได้ที่พึ่ง',
    'เดือดร้อนภายในครอบครัวและญาติ ถูกใส่ความเรื่องชู้สาว จะเจ็บป่วย',
    'มีผู้อุปถัมภ์ โรคคีได้หลักฐาน บริวาร ได้ลาภเงินทองเครื่องประดับต่างๆ',
    'ผู้ใหญ่เป็นศัตรู เกิดคดีเรื่องหนี้สิน อุบัติเหตุ ไฟไหม้ เสียเงินทองของรัก',
    'เกิดคดี ผู้ใหญ่ให้โทษ อาชีพและศึกษาไร้ผล แล้วจะมีผู้อุปการะให้ลาภผลดี',
    'ต่างเพศเป็นศัตรู เสียทรัพย์ โรคกล้าวิน เกิดคดีเรื่องหนี้สิน ถูกจับกุม',
    'มีลาภลอย จะได้งานยศตำแหน่ง คู่ บุตร บริวาร คนที่รักจะให้ลาภ',
    'จะยุ่งยากในเรื่องคู่ครองและความรัก เสียทรัพย์เจ็บป่วย ผิดใจกับมิตร'
  ],
  'พฤหัส': [
    'ผู้ใหญ่อุปถัมภ์ ได้ยศตำแหน่งงาน ได้คู่มีลาภดี ได้ชื่อเสียง สิ่งที่หวังสำเร็จ',
    'มีโชคลาภต่างๆ แล้วย้ายที่ คนรักผู้ใหญ่จากไป ของหาย มิตรเป็นศัตรู',
    'ได้ลาภต่างๆ ได้คู่ บริวาร อาชีพเจริญดีขึ้น ต่างเพศให้คุณ',
    'ศึกษามีผล อาชีพดีขึ้น ได้บุตรบริวาร สิ่งที่หายได้คืน มิตรและผู้ใหญ่ให้ลาภ',
    'ครั้งแรกมีลาภดีแล้วโขยบ ต่างชาติหรือต่างเพศเป็นศัตรู คนที่รักจากไป',
    'เกิดคดีต้องโทษ ผู้ใหญ่หรือต่างเพศมิตรบริวารก่อเขตรู จากที่อยู่แล้วมีลาภ',
    'อาชีพมีผลลาภดี สิ่งที่หวังสำเร็จ มีผู้อุปถัมภ์มิตรและผู้ใหญ่ให้ลาภ',
    'เจ็บป่วยเสียทรัพย์ ผู้ใหญ่ใส่ความ บริวารให้โทษ เดือดร้อนเพราะผู้อื่น'
  ],
  'อังคาร': [
    'คัดรูเก่าให้โทษ ถูกดูหมิ่นหลอกลวง เกิดคดี ทะเลาะวิวาท ไฟไหม้ อุบัติเหตุ',
    'ความหวังทุกอย่างโดยมากสำเร็จผล มีโชคลาภเงินทองข้าวของต่างๆ',
    'ต้องอาวุธ อุบัติเหตุ ถูกหลอกลวง จะป่วย ถูกตำหนิ ลดตำแหน่ง ออกจากงาน',
    'ได้ลาภต่างๆ แล้วจะถูกใส่ความเรื่องชาวหัวเมีย สาเหตุหวาดเสี่ยว',
    'จากกูปลั้น เสียของรัก เจ็บป่วย โรคลม เกิดคดี อุบัติเหตุ เสียทรัพย์ ไฟไหม้',
    'โรคคีได้ที่ดินที่อยู่ ยศตำแหน่ง เกียรติ ชื่อเสียง คู่ บุตร บริวารที่พึ่ง อาชีพมีผล',
    'จะเกิดวิวาท เจ็บป่วย อุบัติเหตุ เดือดร้อนเพราะคู่หรือคนรัก หรือบริวาร',
    'โรคคีที่ทางรู้สาว สิ่งที่หายได้คืน มีลาภจากต่างเพศ อาชีพไม่มีดี'
  ],
  'ราหู': [
    'เกิดคดี ต้องโทษ ป่วย เสียทรัพย์หลักฐาน เสียญาติบ้ายที่อยู่ ออกจากงาน',
    'มีลาภต่างๆ ได้คู่ตำแหน่งเกียรติดี ผู้ใหญ่อุปถัมภ์ หวลาภต่างถิ่นดีนัก',
    'โรคคีผู้ใหญ่ซื่อเหลือในกิจการ แล้วญาติมิตรเป็นศัตรู จากที่ ย้ายงาน',
    'เกิดหนี้สิน ผู้คนจากไป ผู้ใหญ่ให้โทษ เดือดร้อนเพราะญาติหรือคนต่างถิ่น',
    'ญาติมิตรคนต่างถิ่นก่อเขตรู ไฟไหม้ ถูกทำร้าย ทะเลาะวิวาท ป่วย จากที่อยู่',
    'ครั้งแรกมีลาภดีแล้วแต่โขยบ ป่วยต้องเชี่ยวงาอาวุธ เสียทรัพย์ ยุ่งยากหนี้สินทิ้น',
    'มีลาภต่างๆ ได้คู่ ผู้ใหญ่มิตรหรือต่างเพศซื่อเหลือในกิจการที่ทำ',
    'เดือดร้อนเพราะต่างเพศแล้วโรคคีมีลาภ ได้ยศตำแหน่ง ได้หลักฐาน ได้คู่'
  ],
  'พุธ': [
    'มีลาภต่างๆ ได้คู่ บริวาร ได้มรดก สัตว์ ยานพาหนะ หลักฐาน อาชีพและศึกษามีผล',
    'อุบัติเหตุ ป่วยไข้ ถูกเกี่ยวงาอาวุธ เสียของรัก เสียทรัพย์ เกิดคดี ถูกจับกุม',
    'ห้ามเดินทางไกล อยู่กับที่มีหลักฐาน งานยศตำแหน่ง ได้คู่บริวาร',
    'เกิดโรค ไฟไหม้ งานเสื่อม จากที่ ถูกทำร้าย ทรัพย์สินสูญหาย หนี้สินยุ่งยาก',
    'ได้ลาภเงินทองเครื่องประดับต่างๆ ผู้ใหญ่เกื้อกูล อาชีพมีผล มิตรให้ลาภ',
    'เสียทรัพย์ ของหาย คนที่รักจากไป จากที่อยู่ ถูกทำร้าย ป่วยไข้ เสื่อมเกียรติ',
    'มีลาภต่างๆ ได้คู่ บุตร บริวาร ได้งานยศตำแหน่งและหลักฐาน อาชีพมีผล',
    'อุบัติเหตุ เกิดคดี ถูกกูปลั้น ถูกทำร้าย จากที่ เกิดโรคฟัน คนในปกครองก่อเขตรู'
  ],
  'ศุกร์': [
    'อาชีพลาภผลดี ได้คู่ บริวาร สัตว์ ยานพาหนะ ได้มรดกหลักฐาน ที่พึ่งยศตำแหน่ง',
    'เกิดคดีต้องโทษเพราะมิตรใส่ความ ป่วย เสียทรัพย์ จากที่อยู่ เสียของรัก',
    'มีลาภต่างๆ มีที่หวังสำเร็จ มีผู้อุปถัมภ์ มิตรและผู้ใหญ่ให้ลาภ หวลาภต่างถิ่นดีๆ',
    'ผู้ใหญ่หรือมิตรอุปถัมภ์ ได้คู่บุตรบริวาร ได้ตำแหน่งมีชื่อเสียง แต่มีคนอิจฉา',
    'วิชาการให้คุณ อาชีพดี ได้มรดกหลักฐาน สิ่งที่หวังสำเร็จ มีลาภผลต่างๆ',
    'ป่วยบาดเจ็บเพราะเรื่องคนอื่น คนในเรื่องคนอื่น ของหาย ถูกปลน',
    'ผู้คนสิ่งที่หายได้คืน ผู้มีเกียรติผู้ใหญ่ให้ลาภ ได้ยศตำแหน่งงาน ได้หลักฐาน',
    'จากที่อยู่ เจ็บป่วย เสียคนที่รัก เดือดร้อนเพราะญาติ ถูกใส่ร้าย อาชีพเสื่อม'
  ]
};

// ── THAKSA CHART ───────────────────────────────────────────────────────
function renderThaksa(by, bmo, bd, bh, bmn) {
  const container = document.getElementById('thaksa-container');
  if (!container) return;

  // 1. Determine Astrological Weekday of Birth
  const calendarDate = new Date(by, bmo - 1, bd);
  const calWeekday = calendarDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  let astroDay = calWeekday;
  if (bh < 6) {
    astroDay = (calWeekday + 6) % 7;
  }

  let thaksaDay = astroDay;
  if (astroDay === 3) {
    if (bh < 6 || bh >= 18) {
      thaksaDay = 7; // Wednesday Night (Rahu)
    }
  }

  // Birth starting planet index in THAKSA_PLANETS
  const THAKSA_PLANETS = ['๑', '๒', '๓', '๔', '๗', '๕', '๘', '๖'];
  const weekdayToStartIndex = [0, 1, 2, 3, 5, 7, 4, 6];
  const birthStartIndex = weekdayToStartIndex[thaksaDay];

  // 2. Determine if Transit is active
  const isTransitActive = showT && tData;
  age = 1;
  let isTokaLang = false;
  let transitStartIndex = birthStartIndex;
  let transitPlanet = '';

  if (isTransitActive) {
    let ty = by, tmo = bmo, td = bd, th = bh, tmn = bmn;
    const tYearBE = parseInt(document.getElementById('tYear').value);
    ty = tYearBE - 543;
    tmo = parseInt(document.getElementById('tMonth').value);
    td = parseInt(document.getElementById('tDay').value);
    
    const tHourVal = parseInt(document.getElementById('tHour').value);
    const tMinVal = parseInt(document.getElementById('tMin').value);
    if (!isNaN(tHourVal)) th = tHourVal;
    if (!isNaN(tMinVal)) tmn = tMinVal;

    age = ty - by;
    const birthInTransitYear = new Date(ty, bmo - 1, bd, bh, bmn);
    const transitDateTime = new Date(ty, tmo - 1, td, th, tmn);
    
    if (transitDateTime > birthInTransitYear) {
      age += 1;
    }
    age = Math.max(1, age);

    // Update card subtitle to display Birth Date and Age Yang
    const WEEKDAYS_TH = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธกลางวัน', 'วันพฤหัส', 'วันศุกร์', 'วันเสาร์', 'วันพุธกลางคืน'];
    const birthDayName = WEEKDAYS_TH[thaksaDay];
    const subtitleEl = document.getElementById('thaksa-subtitle');
    if (subtitleEl) {
      subtitleEl.innerHTML = `เกิด${birthDayName} อายุย่าง ${age} ปี`;
    }

    // Determine Transit starting planet index (บริวารจร) by counting modulo 8 clockwise (excluding center)
    transitStartIndex = (birthStartIndex + (age - 1)) % 8;
    isTokaLang = false;
  } else {
    // Update card subtitle to default
    const WEEKDAYS_TH = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธกลางวัน', 'วันพฤหัส', 'วันศุกร์', 'วันเสาร์', 'วันพุธกลางคืน'];
    const birthDayName = WEEKDAYS_TH[thaksaDay];
    const subtitleEl = document.getElementById('thaksa-subtitle');
    if (subtitleEl) {
      subtitleEl.innerHTML = `เกิด${birthDayName}`;
    }
  }

  // 3. Map cell positions in 3x3 grid
  const cellPositions = [
    { r: 0, c: 0 }, // ๑
    { r: 0, c: 1 }, // ๒
    { r: 0, c: 2 }, // ๓
    { r: 1, c: 2 }, // ๔
    { r: 2, c: 2 }, // ๗
    { r: 2, c: 1 }, // ๕
    { r: 2, c: 0 }, // ๘
    { r: 1, c: 0 }  // ๖
  ];

  const THAKSA_HOUSES = ['บริวาร', 'อายุ', 'เดช', 'ศรี', 'มูละ', 'อุตสาหะ', 'มนตรี', 'กาลกิณี'];

  let gridHTML = '<div style="display: grid; grid-template-columns: repeat(3, 92px); grid-template-rows: repeat(3, 92px); gap: 0; position: relative;">';

  const cells = Array.from({ length: 3 }, () => Array(3).fill(null));

  // Populate the 8 planet cells
  for (let i = 0; i < 8; i++) {
    const pos = cellPositions[i];
    const planetNum = THAKSA_PLANETS[i];
    
    // Natal house
    const natalLabelIndex = (i - birthStartIndex + 8) % 8;
    const natalLabel = THAKSA_HOUSES[natalLabelIndex];
    
    // Transit house
    let transitLabel = '';
    let transitLabelIndex = -1;
    if (isTransitActive && !isTokaLang) {
      transitLabelIndex = (i - transitStartIndex + 8) % 8;
      transitLabel = THAKSA_HOUSES[transitLabelIndex];
    }
    
    cells[pos.r][pos.c] = {
      planetNum,
      natalLabel,
      natalIndex: natalLabelIndex,
      transitLabel,
      transitIndex: transitLabelIndex,
      planetIndex: i
    };
  }

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const cell = cells[r][c];
      
      let borderStyle = '';
      if (r < 2) borderStyle += 'border-bottom: 2px solid #D4AF37; ';
      if (c < 2) borderStyle += 'border-right: 2px solid #D4AF37; ';

      if (cell) {
        // Circle around the planet number
        const isBirthPlanet = (cell.planetIndex === birthStartIndex);
        const isTransitPlanet = (isTransitActive && cell.planetIndex === transitStartIndex);

        let numWrapperStart = '';
        let numWrapperEnd = '';
        if (isBirthPlanet) {
          numWrapperStart = '<div style="display: inline-flex; justify-content: center; align-items: center; width: 48px; height: 48px; border-radius: 50%; border: 2.5px solid #D4AF37; background: rgba(212, 175, 55, 0.08); position: relative;">';
          numWrapperEnd = '</div>';
        } else {
          numWrapperStart = '<div style="display: inline-flex; justify-content: center; align-items: center; width: 48px; height: 48px; position: relative;">';
          numWrapperEnd = '</div>';
        }

        let plusTag = '';
        if (isTransitPlanet) {
          plusTag = '<span style="position: absolute; top: -1px; right: -1px; font-size: 0.95rem; font-weight: 800; color: #4a148c; line-height: 1;">+</span>';
        }

        gridHTML += `<div style="display: flex; justify-content: center; align-items: center; height: 92px; width: 92px; ${borderStyle} box-sizing: border-box;">`;
        gridHTML += `${numWrapperStart}<span style="font-size: 1.8rem; font-weight: 700; color: #222222; font-family: 'Sarabun', sans-serif; line-height: 1;">${cell.planetNum}</span>${plusTag}${numWrapperEnd}`;
        gridHTML += '</div>';
      } else {
        // Center cell (Row 1, Col 1)
        gridHTML += `<div style="display: flex; justify-content: center; align-items: center; height: 92px; width: 92px; ${borderStyle} box-sizing: border-box;">`;
        if (isTransitActive && isTokaLang) {
          gridHTML += `<div style="display: flex; flex-direction: column; justify-content: center; align-items: center; border: 1.5px dashed #FF6666; background: rgba(255, 102, 102, 0.08); border-radius: 8px; padding: 4px; text-align: center; width: 70px; height: 70px; box-sizing: border-box;">`;
          gridHTML += `<span style="font-size: 0.58rem; font-weight: 700; color: #FF8888; text-transform: uppercase;">ปีจร</span>`;
          gridHTML += `<span style="font-size: 0.72rem; font-weight: 700; color: #FF4444; margin-top: 1px;">ตกตากลาง</span>`;
          gridHTML += `</div>`;
        }
        gridHTML += '</div>';
      }
    }
  }

  gridHTML += '</div>';
  container.innerHTML = gridHTML;

  // 4. Calculate Mahathaksa (Major/Sub Lords) based on decimal age
  const infoEl = document.getElementById('mahathaksa-info');
  if (infoEl) {
    const tYearBE = parseInt(document.getElementById('tYear').value);
    const ty = tYearBE - 543;
    const tmo = parseInt(document.getElementById('tMonth').value);
    const td = parseInt(document.getElementById('tDay').value);
    const tHourVal = parseInt(document.getElementById('tHour').value);
    const tMinVal = parseInt(document.getElementById('tMin').value);
    const th = isNaN(tHourVal) ? 0 : tHourVal;
    const tmn = isNaN(tMinVal) ? 0 : tMinVal;

    let displayAge = age;
    if (!isTransitActive) {
      displayAge = ty - by;
      const birthInTransitYear = new Date(ty, bmo - 1, bd, bh, bmn);
      const transitDateTime = new Date(ty, tmo - 1, td, th, tmn);
      if (transitDateTime > birthInTransitYear) {
        displayAge += 1;
      }
      displayAge = Math.max(1, displayAge);
    }

    const birthDateTime = new Date(by, bmo - 1, bd, bh, bmn);
    const transitDateTime = new Date(ty, tmo - 1, td, th, tmn);
    const diffMs = transitDateTime - birthDateTime;
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    let decimalAge = diffDays / 365.25;
    if (isNaN(decimalAge) || decimalAge < 0) {
      decimalAge = 0;
    }

    const PLANET_NAMES = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'เสาร์', 'พฤหัส', 'ราหู', 'ศุกร์'];
    const PLANET_YEARS = [6, 15, 8, 17, 10, 19, 12, 21];
    
    // thaksaDay: 0=อาทิตย์, 1=จันทร์, 2=อังคาร, 3=พุธกลางวัน, 4=พฤหัส, 5=ศุกร์, 6=เสาร์, 7=พุธกลางคืน
    const weekdayToPlanetIndex = [0, 1, 2, 3, 5, 7, 4, 6];
    const startIdx = weekdayToPlanetIndex[thaksaDay];

    let ageCycle = decimalAge % 108;
    let accumulatedMajor = 0;
    let majorIdx = -1;
    let majorStart = 0;
    let majorEnd = 0;

    for (let i = 0; i < 8; i++) {
      const idx = (startIdx + i) % 8;
      const years = PLANET_YEARS[idx];
      if (ageCycle >= accumulatedMajor && ageCycle < accumulatedMajor + years) {
        majorIdx = idx;
        majorStart = accumulatedMajor;
        majorEnd = accumulatedMajor + years;
        break;
      }
      accumulatedMajor += years;
    }

    if (majorIdx === -1) {
      majorIdx = (startIdx + 7) % 8;
      majorStart = 108 - PLANET_YEARS[majorIdx];
      majorEnd = 108;
    }

    const majorName = PLANET_NAMES[majorIdx];
    const majorDuration = PLANET_YEARS[majorIdx];

    let accumulatedSub = majorStart;
    let subIdx = -1;
    let subStart = 0;
    let subEnd = 0;
    let subStepIdx = -1;

    for (let i = 0; i < 8; i++) {
      const idx = (majorIdx + i) % 8;
      const subPlanetYears = PLANET_YEARS[idx];
      const subDuration = (majorDuration * subPlanetYears) / 108.0;
      if (ageCycle >= accumulatedSub && ageCycle < accumulatedSub + subDuration) {
        subIdx = idx;
        subStart = accumulatedSub;
        subEnd = accumulatedSub + subDuration;
        subStepIdx = i;
        break;
      }
      accumulatedSub += subDuration;
    }

    if (subIdx === -1) {
      subIdx = (majorIdx + 7) % 8;
      subStart = majorEnd - (majorDuration * PLANET_YEARS[subIdx]) / 108.0;
      subEnd = majorEnd;
      subStepIdx = 7;
    }

    const subName = PLANET_NAMES[subIdx];

    // Convert cycle age back to absolute age if age > 108
    const cycleCount = Math.floor(decimalAge / 108);
    const absMajorStart = majorStart + cycleCount * 108;
    const absMajorEnd = majorEnd + cycleCount * 108;
    const absSubStart = subStart + cycleCount * 108;
    const absSubEnd = subEnd + cycleCount * 108;

    const PLANET_SYMBOLS = {
      'อาทิตย์': '๑',
      'จันทร์': '๒',
      'อังคาร': '๓',
      'พุธ': '๔',
      'เสาร์': '๗',
      'พฤหัส': '๕',
      'ราหู': '๘',
      'ศุกร์': '๖'
    };

    const majorSymbol = PLANET_SYMBOLS[majorName] || '';
    const subSymbol = PLANET_SYMBOLS[subName] || '';

    // Generate all 64 periods table
    const msInYear = 365.25 * 24 * 60 * 60 * 1000;

    function formatDateYMD(date) {
      const d = String(date.getDate()).padStart(2, '0');
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const y = date.getFullYear() + 543;
      return `${d}/${m}/${y}`;
    }

    function getYMDDiff(date1, date2) {
      let y = date2.getFullYear() - date1.getFullYear();
      let m = date2.getMonth() - date1.getMonth();
      let d = date2.getDate() - date1.getDate();

      if (d < 0) {
        const prevMonthDate = new Date(date2.getFullYear(), date2.getMonth(), 0);
        d += prevMonthDate.getDate();
        m -= 1;
      }

      if (m < 0) {
        m += 12;
        y -= 1;
      }

      return { y, m, d };
    }

    function getFormattedPeriod(startYears, endYears) {
      const startDate = new Date(birthDateTime.getTime() + startYears * msInYear);
      const endDate = new Date(birthDateTime.getTime() + endYears * msInYear);

      const sStr = formatDateYMD(startDate);
      const eStr = formatDateYMD(endDate);

      const diffStart = getYMDDiff(birthDateTime, startDate);
      const diffEnd = getYMDDiff(birthDateTime, endDate);

      return `${sStr}-${eStr} <span style="color: var(--dim); font-size: 0.68rem;">(อายุ ${diffStart.y}.${diffStart.m}.${diffStart.d} – ${diffEnd.y}.${diffEnd.m}.${diffEnd.d})</span>`;
    }

    let tableHTML = `
      <table style="width: 100%; border-collapse: collapse; font-size: 0.74rem; text-align: left; background: #ffffff;">
        <thead>
          <tr style="background: rgba(226, 184, 66, 0.12); color: var(--gold-d); font-weight: 700; border-bottom: 1.5px solid var(--border); position: sticky; top: 0; z-index: 5; background: #FFF9EE;">
            <th style="padding: 0.5rem 0.4rem; text-align: center; width: 14%;">ดาวเสวย</th>
            <th style="padding: 0.5rem 0.4rem; text-align: center; width: 14%;">ดาวแทรก</th>
            <th style="padding: 0.5rem 0.4rem; width: 72%;">ช่วงวันที่ (อายุ)</th>
          </tr>
        </thead>
        <tbody>
    `;

    let accumMajor = 0;
    for (let i = 0; i < 8; i++) {
      const mIdx = (startIdx + i) % 8;
      const mName = PLANET_NAMES[mIdx];
      const mYears = PLANET_YEARS[mIdx];
      const mSym = PLANET_SYMBOLS[mName];
      const mStart = accumMajor;
      const mEnd = accumMajor + mYears;

      let accumSub = mStart;
      for (let j = 0; j < 8; j++) {
        const sIdx = (mIdx + j) % 8;
        const sName = PLANET_NAMES[sIdx];
        const sYears = PLANET_YEARS[sIdx];
        const sSym = PLANET_SYMBOLS[sName];
        const sDuration = (mYears * sYears) / 108.0;
        const sStart = accumSub;
        const sEnd = accumSub + sDuration;

        const isCurrent = (ageCycle >= sStart && ageCycle < sEnd) || 
                          (ageCycle === 108 && i === 7 && j === 7);

        const rowBg = isCurrent ? 'rgba(240, 112, 96, 0.08)' : (j === 0 ? 'rgba(212, 175, 55, 0.16)' : '');
        const textStyle = (isCurrent || j === 0) ? 'font-weight: 700;' : '';
        const textColor = isCurrent ? 'color: var(--coral-d);' : 'color: var(--text);';
        const borderStyle = isCurrent ? 'border: 1.5px solid var(--coral);' : 'border-bottom: 1px solid rgba(226, 184, 66, 0.08);';
        const rowId = isCurrent ? 'id="mahathaksa-current-row"' : '';
        const currentBadge = isCurrent ? ' <span style="background: var(--coral); color: white; padding: 1px 4px; border-radius: 4px; font-size: 0.58rem; font-weight: 700;">ปัจจุบัน</span>' : '';

        const cycleCount = Math.floor(decimalAge / 108);
        const dispStart = sStart + cycleCount * 108;
        const dispEnd = sEnd + cycleCount * 108;
        const dateRangeText = getFormattedPeriod(dispStart, dispEnd);

        tableHTML += `
          <tr ${rowId} style="background: ${rowBg}; ${textStyle} ${textColor} ${borderStyle}">
            <td style="padding: 0.4rem; text-align: center; border-right: 1px solid rgba(226, 184, 66, 0.05); font-size: 1rem;">${j === 0 ? mSym : `<span style="color: var(--dim); font-weight: normal;">${mSym}</span>`}</td>
            <td style="padding: 0.4rem; text-align: center; border-right: 1px solid rgba(226, 184, 66, 0.05); font-size: 1rem;">${sSym}</td>
            <td style="padding: 0.4rem;">${dateRangeText}${currentBadge}</td>
          </tr>
        `;

        accumSub += sDuration;
      }
      accumMajor += mYears;
    }

    tableHTML += `
        </tbody>
      </table>
    `;

    const diffMajorStart = getYMDDiff(birthDateTime, new Date(birthDateTime.getTime() + absMajorStart * msInYear));
    const diffMajorEnd = getYMDDiff(birthDateTime, new Date(birthDateTime.getTime() + absMajorEnd * msInYear));
    const diffSubStart = getYMDDiff(birthDateTime, new Date(birthDateTime.getTime() + absSubStart * msInYear));
    const diffSubEnd = getYMDDiff(birthDateTime, new Date(birthDateTime.getTime() + absSubEnd * msInYear));
    const currentDiff = getYMDDiff(birthDateTime, transitDateTime);

    const majorStartYears = Math.round(absMajorStart);
    const majorEndYears = Math.round(absMajorEnd);
    const mStartDate = new Date(birthDateTime.getTime() + majorStartYears * msInYear);
    const mEndDate = new Date(birthDateTime.getTime() + majorEndYears * msInYear);
    const mStartStr = formatDateYMD(mStartDate);
    const mEndStr = formatDateYMD(mEndDate);

    const sStartDate = new Date(birthDateTime.getTime() + absSubStart * msInYear);
    const sEndDate = new Date(birthDateTime.getTime() + absSubEnd * msInYear);
    const sStartStr = formatDateYMD(sStartDate);
    const sEndStr = formatDateYMD(sEndDate);

    infoEl.style.display = 'block';
    infoEl.innerHTML = `
      <div style="font-size: 0.95rem; font-weight: 700; color: var(--gold-d); margin-bottom: 0.8rem; display: flex; align-items: center; gap: 6px;">
        🪐 มหาทักษา (ดาวเสวย/ดาวแทรก)
      </div>
      <div style="display: flex; flex-direction: column; gap: 0.8rem; margin-bottom: 0.8rem;">
        <!-- Row 1: ดาวเสวย -->
        <div style="background: rgba(226, 184, 66, 0.06); border: 1px solid var(--border); border-radius: 12px; padding: 0.75rem 1rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="font-size: 0.7rem; font-weight: 700; color: var(--gold-d); text-transform: uppercase; background: rgba(226, 184, 66, 0.12); padding: 2px 8px; border-radius: 6px; letter-spacing: 0.04em;">ดาวเสวย</div>
            <div style="font-size: 1.5rem; font-weight: 800; color: var(--text);">${majorSymbol}</div>
          </div>
          <div style="text-align: right; font-size: 0.72rem; color: var(--text); font-weight: 500; line-height: 1.3; min-width: 160px;">
            ${mStartStr} – ${mEndStr}
            <div style="font-size: 0.68rem; color: var(--dim); font-weight: normal;">(อายุ ${majorStartYears} – ${majorEndYears})</div>
          </div>
        </div>

        <!-- Row 2: ดาวแทรก -->
        <div style="background: rgba(240, 112, 96, 0.06); border: 1px solid rgba(240, 112, 96, 0.2); border-radius: 12px; padding: 0.75rem 1rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="font-size: 0.7rem; font-weight: 700; color: var(--coral-d); text-transform: uppercase; background: rgba(240, 112, 96, 0.12); padding: 2px 8px; border-radius: 6px; letter-spacing: 0.04em;">ดาวแทรก</div>
            <div style="font-size: 1.5rem; font-weight: 800; color: var(--text);">${subSymbol}</div>
          </div>
          <div style="text-align: right; font-size: 0.72rem; color: var(--text); font-weight: 500; line-height: 1.3; min-width: 160px;">
            ${sStartStr} – ${sEndStr}
            <div style="font-size: 0.68rem; color: var(--dim); font-weight: normal;">(อายุ ${diffSubStart.y}.${diffSubStart.m}.${diffSubStart.d} – ${diffSubEnd.y}.${diffSubEnd.m}.${diffSubEnd.d})</div>
          </div>
        </div>
      </div>
      <div style="font-size: 0.76rem; color: var(--dim); text-align: center; line-height: 1.4; margin-bottom: 0.8rem;">
        อายุปัจจุบัน: <strong>${currentDiff.y} ปี ${currentDiff.m} เดือน ${currentDiff.d} วัน</strong> (อายุย่าง: ${displayAge} ปี)
      </div>

      <!-- Prediction Box -->
      <div style="background: #FFEAB0; border: 1.5px solid var(--border); border-radius: 12px; padding: 1rem 1.2rem; margin-bottom: 1rem; box-shadow: 0 4px 12px rgba(180, 130, 30, 0.05); text-align: center;">
        <div style="font-size: 0.85rem; font-weight: 700; color: var(--gold-d); margin-bottom: 0.4rem; text-transform: uppercase; letter-spacing: 0.04em;">
          🔮 คำพยากรณ์เทวดาเสวยอายุ
        </div>
        <div style="font-size: 0.72rem; color: #7A5510; margin-bottom: 0.6rem; font-weight: 700;">
          ${majorSymbol} เสวย / ${subSymbol} แทรก
        </div>
        <div style="font-size: 0.88rem; line-height: 1.5; color: #2B1505; font-weight: 600; padding: 0 0.5rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; text-wrap: balance; word-break: keep-all;">
          "${ASTRO_PREDICTIONS[majorName]?.[subStepIdx] || 'ไม่พบข้อมูลคำพยากรณ์'}"
        </div>
      </div>

      <button class="btn btn-ghost" style="width: 100%; font-size: 0.8rem; height: 2.2rem; border-radius: 8px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;" onclick="toggleMahathaksaTable()">
        📋 ตารางอายุเสวย-แทรก 0–108 ปี
      </button>
      <div id="mahathaksa-table-wrapper" style="display: none; margin-top: 0.8rem; max-height: 300px; overflow-y: auto; border: 1.5px solid var(--border); border-radius: 10px; box-shadow: inset 0 2px 8px rgba(0,0,0,0.05);">
        ${tableHTML}
      </div>
    `;
  }

  window.toggleMahathaksaTable = function() {
    const wrapper = document.getElementById('mahathaksa-table-wrapper');
    if (wrapper) {
      const isShowing = (wrapper.style.display !== 'none');
      if (isShowing) {
        wrapper.style.display = 'none';
      } else {
        wrapper.style.display = 'block';
        setTimeout(() => {
          const currentRow = document.getElementById('mahathaksa-current-row');
          if (currentRow) {
            currentRow.scrollIntoView({ block: 'center', behavior: 'smooth' });
          }
        }, 50);
      }
    }
  };
}

// ═══════════════════════════════════════════════════════════════════════
//  SVG WHEEL
// ═══════════════════════════════════════════════════════════════════════
const CX=260,CY=260;
// Radii
const RO=252,  // zodiac outer
      RZ=194,  // zodiac inner / transit outer band
      RT=174,  // transit planet mid
      RD=157,  // divider
      RN=140,  // natal planet mid
      RC=118;  // center

// Colors
const C_BG='#FFF8F0';          // light bg
const C_ZOD_W='#FFF9EE';       // zodiac light sector
const C_ZOD_B='#FFF0DC';       // zodiac cream sector
const C_ZOD_WT='#2B1505';      // text on light sector
const C_ZOD_BT='#8B6030';      // text on cream sector
const C_NAT='#7A5510';         // natal dot fill (dark gold)
const C_NAT_T='#2B1505';       // natal text (dark brown)
const C_TRN='#F07060';         // transit dot fill (coral)
const C_TRN_T='#B03828';       // transit text (dark coral)
const C_DIV='#D4AF37';         // divider ring (gold)

function f(n){return Math.round(n*10)/10;}

// Aries center (lon=15) at top (12 o'clock), counterclockwise
// offset -15 so that midpoint of Aries sector is exactly at 12 o'clock
function toXY(r,lon){
  const a=toRad(90+lon-15);
  return[CX+r*Math.cos(a), CY-r*Math.sin(a)];
}

// Donut arc sector from lon1 to lon2 (counterclockwise)
function arcSector(r1,r2,lon1,lon2){
  const[x1o,y1o]=toXY(r2,lon1),[x2o,y2o]=toXY(r2,lon2);
  const[x1i,y1i]=toXY(r1,lon1),[x2i,y2i]=toXY(r1,lon2);
  const la=(lon2-lon1>180)?1:0;
  return`M${f(x1o)},${f(y1o)} A${r2},${r2} 0 ${la},0 ${f(x2o)},${f(y2o)} L${f(x2i)},${f(y2i)} A${r1},${r1} 0 ${la},1 ${f(x1i)},${f(y1i)} Z`;
}

function drawWheel(){
  let s='';

  // 1. Backgrounds
  // Outer circle (transit background) - warm cream/gold
  s+=`<circle cx="${CX}" cy="${CY}" r="256" fill="var(--cream2)"/>`;
  // Inner circle (natal background) - white
  s+=`<circle cx="${CX}" cy="${CY}" r="210" fill="#ffffff"/>`;

  // 2. Outer boundary circle (gold)
  s+=`<circle cx="${CX}" cy="${CY}" r="210" fill="none" stroke="#D4AF37" stroke-width="3.5"/>`;

  // 3. House dividing lines (gold) - drawn continuously to avoid any gaps at intersections
  // Vertical lines
  s+=`<line x1="215" y1="54.9" x2="215" y2="465.1" stroke="#D4AF37" stroke-width="2"/>`;
  s+=`<line x1="305" y1="54.9" x2="305" y2="465.1" stroke="#D4AF37" stroke-width="2"/>`;
  // Horizontal lines
  s+=`<line x1="54.9" y1="215" x2="465.1" y2="215" stroke="#D4AF37" stroke-width="2"/>`;
  s+=`<line x1="54.9" y1="305" x2="465.1" y2="305" stroke="#D4AF37" stroke-width="2"/>`;
  // Diagonal lines (split to not cross the central square [215, 305] x [215, 305])
  s+=`<line x1="111.5" y1="111.5" x2="215" y2="215" stroke="#D4AF37" stroke-width="2"/>`;
  s+=`<line x1="305" y1="305" x2="408.5" y2="408.5" stroke="#D4AF37" stroke-width="2"/>`;
  s+=`<line x1="408.5" y1="111.5" x2="305" y2="215" stroke="#D4AF37" stroke-width="2"/>`;
  s+=`<line x1="215" y1="305" x2="111.5" y2="408.5" stroke="#D4AF37" stroke-width="2"/>`;

  // 4. Central area left clear to let transparent logo float directly (PNG background)

  // 5. Zodiac Sign Labels
  for(let i=0;i<12;i++){
    const isAxis = (i % 3 === 0);
    const rLabel = isAxis ? 190 : 196;
    const a = toRad(90 + i * 30);
    const lx = CX + rLabel * Math.cos(a);
    const ly = CY - rLabel * Math.sin(a);
    s += `<text x="${f(lx)}" y="${f(ly)}" text-anchor="middle" dominant-baseline="middle"
          font-size="12" fill="var(--dim)" font-family="Sarabun,sans-serif" font-weight="700" opacity="0.9">${SIGNS_TH[i]}</text>`;
  }

  // 6. Draw Natal Planets (inside the sectors, using Thai numerals)
  const natalGroups = Array.from({length: 12}, () => []);
  if (showN && nData) {
    for (const p of PLANETS) {
      if (nData.pos[p.id] !== undefined) {
        const si = Math.floor(nData.pos[p.id] / 30) % 12;
        natalGroups[si].push({
          ...p,
          lon: nData.pos[p.id],
          retro: nData.retro && nData.retro[p.id]
        });
      }
    }
  }

  for(let i=0;i<12;i++){
    const grp = natalGroups[i];
    const N = grp.length;
    if (N === 0) continue;

    const a = toRad(90 + i * 30);
    const rCenter = (i % 3 === 0) ? 130 : 135;
    const spacing = 28;

    grp.forEach((p, k) => {
      // Align along the radial line (bisector) of each sector
      const r = rCenter + (k - (N - 1) / 2) * spacing;
      const px = CX + r * Math.cos(a);
      const py = CY - r * Math.sin(a);

      if (p.id === 'lagna') {
        // Highlighted circular badge for natal Lagna (ล) - slightly larger
        s += `<circle cx="${f(px)}" cy="${f(py)}" r="14" fill="#FFE070" stroke="#7A5510" stroke-width="1.5" />`;
        s += `<text x="${f(px)}" y="${f(py)}" text-anchor="middle" dominant-baseline="central"
              font-size="17" fill="#2B1505" font-family="Sarabun,sans-serif" font-weight="800">${p.numTH}</text>`;
      } else {
        s += `<text x="${f(px)}" y="${f(py)}" text-anchor="middle" dominant-baseline="central"
              font-size="20" fill="${C_NAT_T}" font-family="Sarabun,sans-serif" font-weight="700">${p.numTH}</text>`;
      }
      if (p.retro === "พักร์" || p.retro === true) {
        s += `<text x="${f(px+2.5)}" y="${f(py-2.2)}" font-size="11" fill="#7A5510" font-family="Sarabun,sans-serif" font-weight="bold">พ</text>`;
      } else if (p.retro === "มนต์") {
        s += `<text x="${f(px+2.5)}" y="${f(py-2.2)}" font-size="11" fill="#2E7D32" font-family="Sarabun,sans-serif" font-weight="bold">ม</text>`;
      } else if (p.retro === "เสริด") {
        s += `<text x="${f(px+2.5)}" y="${f(py-2.2)}" font-size="11" fill="#1976D2" font-family="Sarabun,sans-serif" font-weight="bold">ส</text>`;
      }
    });
  }

  // 7. Draw Transit Planets (outside the circle, using Arabic numerals)
  if (showT && tData) {
    // Sector boundaries in Cartesian angles (degrees, counterclockwise starting from 3 o'clock)
    // 0: Aries start, 1: Taurus start, 2: Gemini start, 3: Cancer start, 4: Leo start...
    const boundaries = [
      78.9,   // Aries start
      101.1,  // Taurus start
      135.0,  // Gemini start
      168.9,  // Cancer start
      191.1,  // Leo start
      225.0,  // Virgo start
      258.9,  // Libra start
      281.1,  // Scorpio start
      315.0,  // Sagittarius start
      348.9,  // Capricorn start
      371.1,  // Aquarius start (11.1 + 360)
      405.0   // Pisces start (45 + 360)
    ];

    function getGridAngle(lon) {
      const si = Math.floor(lon / 30) % 12;
      const rem = lon % 30;
      let startA = boundaries[si];
      let endA = boundaries[(si + 1) % 12];
      if (endA < startA) {
        endA += 360;
      }
      return mod360(startA + (rem / 30) * (endA - startA));
    }

    function clampAngle(val, min, max) {
      let v = val;
      if (min > max) {
        // Wrapped sector (e.g. Capricorn)
        if (v < min - 180) v += 360;
        if (v > min + 180) v -= 360;
        return mod360(Math.max(min, Math.min(max, v)));
      } else {
        // Normal sector
        if (v < min - 180) v += 360;
        if (v > min + 180) v -= 360;
        return mod360(Math.max(min, Math.min(max, v)));
      }
    }

    const transitPlanets = PLANETS.filter(p => tData.pos[p.id] !== undefined)
                                  .map(p => {
                                    const originalLon = tData.pos[p.id];
                                    const si = Math.floor(originalLon / 30) % 12;
                                    let startA = boundaries[si];
                                    let endA = boundaries[(si + 1) % 12];
                                    if (endA < startA) {
                                      endA += 360;
                                    }
                                    const rawAngle = getGridAngle(originalLon);
                                    
                                    // Add safety padding of 1.8 degrees so labels never clip boundary lines
                                    const minA = startA + 1.8;
                                    const maxA = endA - 1.8;
                                    
                                    return {
                                      ...p,
                                      angle: clampAngle(rawAngle, minA, maxA),
                                      minAngle: minA,
                                      maxAngle: maxA,
                                      retro: tData.retro && tData.retro[p.id]
                                    };
                                  });

    // Calculate Transit Age Lagna (ลัคนาอายุจร)
    let ageLagnaLon = null;
    if (nData) {
      const natalLagnaSp = signPos(nData.pos.lagna);
      const L = natalLagnaSp.si; // Natal Lagna sign index (0-11)
      const C = Math.floor((age - 1) / 12);
      const S = (age - 1) % 12;
      const T_L = (L + C + S) % 12;
      ageLagnaLon = T_L * 30 + 15; // Midpoint of the sign sector
    }

    if (ageLagnaLon !== null) {
      const originalLon = ageLagnaLon;
      const si = Math.floor(originalLon / 30) % 12;
      let startA = boundaries[si];
      let endA = boundaries[(si + 1) % 12];
      if (endA < startA) {
        endA += 360;
      }
      const rawAngle = getGridAngle(originalLon);
      const minA = startA + 1.8;
      const maxA = endA - 1.8;

      transitPlanets.push({
        id: 'age_lagna',
        isAgeLagna: true,
        angle: clampAngle(rawAngle, minA, maxA),
        minAngle: minA,
        maxAngle: maxA,
        numAR: '★'
      });
    }

    // Iterative push-apart to prevent any overlaps on the outer circle
    const MIN_GAP_DEG = 4.5; // degrees of gap to prevent overlaps (approx 18px at r=233)
    for (let iter = 0; iter < 20; iter++) {
      // Re-sort in each iteration to compare adjacent neighbors in coordinate space
      transitPlanets.sort((a, b) => a.angle - b.angle);
      
      for (let i = 0; i < transitPlanets.length; i++) {
        const p1 = transitPlanets[i];
        const p2 = transitPlanets[(i + 1) % transitPlanets.length];
        
        let diff = p2.angle - p1.angle;
        if (diff < 0) diff += 360; // handle wrap-around
        
        if (diff < MIN_GAP_DEG) {
          const overlap = MIN_GAP_DEG - diff;
          const shift = overlap / 2;
          p1.angle = clampAngle(p1.angle - shift, p1.minAngle, p1.maxAngle);
          p2.angle = clampAngle(p2.angle + shift, p2.minAngle, p2.maxAngle);
        }
      }
    }

    // Draw all transit planets at a fixed radius (r = 233)
    const fixedR = 233;
    transitPlanets.forEach(p => {
      // Compute x, y coordinates directly using its mapped and resolved angle
      const tx = CX + fixedR * Math.cos(toRad(p.angle));
      const ty = CY - fixedR * Math.sin(toRad(p.angle));
      const lbl = p.numAR;
      const isR = p.retro;

      if (p.isAgeLagna) {
        // Draw a green star symbol directly (without a circle)
        s += `<text x="${f(tx)}" y="${f(ty)}" text-anchor="middle" dominant-baseline="central"
             font-size="26" fill="#2E7D32" font-family="Sarabun,sans-serif" font-weight="900">★</text>`;
      } else {
        s += `<text x="${f(tx)}" y="${f(ty)}" text-anchor="middle" dominant-baseline="central"
             font-size="16" fill="${C_TRN_T}" font-family="Sarabun,sans-serif" font-weight="700">${lbl}</text>`;
        if (isR === "พักร์" || isR === true) {
          s += `<text x="${f(tx+3.2)}" y="${f(ty-3.0)}" font-size="10" fill="#4a148c" font-family="Sarabun,sans-serif" font-weight="bold">พ</text>`;
        } else if (isR === "มนต์") {
          s += `<text x="${f(tx+3.2)}" y="${f(ty-3.0)}" font-size="10" fill="#2E7D32" font-family="Sarabun,sans-serif" font-weight="bold">ม</text>`;
        } else if (isR === "เสริด") {
          s += `<text x="${f(tx+3.2)}" y="${f(ty-3.0)}" font-size="10" fill="#1976D2" font-family="Sarabun,sans-serif" font-weight="bold">ส</text>`;
        }
      }
    });
  }

  // 8. Center circle content (now a circle containing the logo and Sun degree)
  if(nData){
    const sunSp = signPos(nData.pos.sun);
    
    // Draw Logo image centered in the square (PNG background) - enlarged to 68x68
    s+=`<image href="logo.png" x="226" y="216" width="68" height="68"/>`;
    
    // Natal Sun degree: 29/08 (e.g. 29° 08')
    const sunStr = `${sunSp.deg}/${String(sunSp.min).padStart(2,'0')}`;
    s+=`<text x="${CX}" y="${CY+35}" text-anchor="middle" font-size="12" fill="#2B1505" font-family="Sarabun,sans-serif" font-weight="700">${sunStr}</text>`;
  } else {
    s+=`<text x="${CX}" y="${CY}" text-anchor="middle" dominant-baseline="middle" font-size="15" fill="#D4AF37" font-family="Sarabun,sans-serif">ผูกดวง</text>`;
  }

  document.getElementById('wheel-svg').innerHTML=s;
}

// ── DRAW PLANET RING ────────────────────────────────────────────────────
function drawRing(pos,retro,rMid,dotFill,dotText,useThaiNum){
  let s='';
  const planets=PLANETS.filter(p=>pos[p.id]!==undefined);

  // Pointer lines (behind dots)
  for(const p of planets){
    const[x1,y1]=toXY(rMid+14,pos[p.id]);
    const[x2,y2]=toXY(RZ,pos[p.id]);
    s+=`<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${dotFill}" stroke-width=".7" opacity=".45"/>`;
  }

  // Stagger overlapping planets (within same 6° bucket)
  const buckets={};
  for(const p of planets){
    const k=Math.floor(pos[p.id]/6);
    if(!buckets[k]) buckets[k]=[];
    buckets[k].push({...p,lon:pos[p.id]});
  }

  for(const grp of Object.values(buckets)){
    const n=grp.length;
    grp.forEach((p,i)=>{
      const r=rMid+(i-(n-1)/2)*10;
      const[x,y]=toXY(r,p.lon);
      const lbl=useThaiNum?p.numTH:p.numAR;
      const motion=retro&&retro[p.id];
      const fontSize=p.id==='lagna'?10:11.5;

      s+=`<circle cx="${f(x)}" cy="${f(y)}" r="10" fill="${dotFill}" stroke="${dotText==='#FFFFFF'?'#1A3A6044':'#8AAABB66'}" stroke-width="1.2" opacity=".93"/>`;
      s+=`<text x="${f(x)}" y="${f(y)}" text-anchor="middle" dominant-baseline="central"
           font-size="${fontSize}" fill="${dotText}" font-family="Sarabun,sans-serif" font-weight="700">${lbl}</text>`;
      if(motion==="พักร์" || motion===true){
        s+=`<text x="${f(x+8)}" y="${f(y-8)}" font-size="7" fill="${dotFill==='#F8F5EE'?'#884422':'#88CCFF'}" font-family="Sarabun,sans-serif" font-weight="bold">พ</text>`;
      } else if(motion==="มนต์"){
        s+=`<text x="${f(x+8)}" y="${f(y-8)}" font-size="7" fill="${dotFill==='#F8F5EE'?'#2E7D32':'#81C784'}" font-family="Sarabun,sans-serif" font-weight="bold">ม</text>`;
      } else if(motion==="เสริด"){
        s+=`<text x="${f(x+8)}" y="${f(y-8)}" font-size="7" fill="${dotFill==='#F8F5EE'?'#1976D2':'#64B5F6'}" font-family="Sarabun,sans-serif" font-weight="bold">ส</text>`;
      }
    });
  }
  return s;
}

// ── PLANET DIGNITY ───────────────────────────────────────────────────────
function getDignityHTML(planetId, signIdx) {
  const list = [];
  
  const kasetMap = {
    'sun': [4], 'moon': [3], 'mars': [0, 7], 'mercury': [2, 5],
    'jupiter': [8, 11], 'venus': [1, 6], 'saturn': [9], 'rahu': [10]
  };
  const praMap = {
    'sun': [10], 'moon': [9], 'mars': [6, 1], 'mercury': [8, 11],
    'jupiter': [2, 5], 'venus': [7, 0], 'saturn': [3], 'rahu': [4]
  };
  const uchMap = {
    'sun': [0], 'moon': [1], 'mars': [9], 'mercury': [5],
    'jupiter': [3], 'venus': [11], 'saturn': [6], 'rahu': [7]
  };
  const nitchMap = {
    'sun': [6], 'moon': [7], 'mars': [3], 'mercury': [11],
    'jupiter': [9], 'venus': [5], 'saturn': [0], 'rahu': [1]
  };
  const rachaChokMap = {
    'sun': [2], 'moon': [5], 'mars': [1], 'mercury': [4],
    'jupiter': [0], 'venus': [3], 'saturn': [7], 'rahu': [6]
  };
  const mahaChakMap = {
    'sun': [3], 'moon': [0], 'mars': [5], 'mercury': [4],
    'jupiter': [7], 'venus': [8], 'saturn': [1], 'rahu': [9]
  };

  const styleBadge = (text, bg, fg) => `<span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 0.78rem; font-weight: 700; background: ${bg}; color: ${fg}; margin-right: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.06);">${text}</span>`;

  if (kasetMap[planetId] && kasetMap[planetId].includes(signIdx)) {
    list.push(styleBadge('เกษตร', '#E8F5E9', '#2E7D32'));
  }
  if (praMap[planetId] && praMap[planetId].includes(signIdx)) {
    list.push(styleBadge('ประ', '#EFEBE9', '#5D4037'));
  }
  if (uchMap[planetId] && uchMap[planetId].includes(signIdx)) {
    list.push(styleBadge('อุจจ์', '#FFF8E1', '#F57F17'));
  }
  if (nitchMap[planetId] && nitchMap[planetId].includes(signIdx)) {
    list.push(styleBadge('นิจจ์', '#FFEBEE', '#C62828'));
  }
  if (rachaChokMap[planetId] && rachaChokMap[planetId].includes(signIdx)) {
    list.push(styleBadge('ราชาโชค', '#EDE7F6', '#6A1B9A'));
  }
  if (mahaChakMap[planetId] && mahaChakMap[planetId].includes(signIdx)) {
    list.push(styleBadge('มหาจักร', '#E1F5FE', '#0277BD'));
  }

  return list.join('') || '<span style="color: #bbb; font-size: 0.8rem;">-</span>';
}

// ── PLANET TABLE ────────────────────────────────────────────────────────
function renderTable(){
  const tbody=document.getElementById('tableTbody');
  let h='';

  function rows(data,cls,label,useThaiNum){
    const isNatal = (cls === 'col-n');
    const rowBg = isNatal ? '#ffffff' : '#FFF9E6'; // White vs Cream-Gold for Transit
    const rowTextColor = '#000000'; // Black
    const nameColor = '#000000'; // Black
    
    const headerBg = isNatal ? '#fff0dc' : '#FFEAB0'; // Cream vs Soft Gold header
    const headerTextColor = '#000000'; // Black

    h+=`<tr class="group-head"><td colspan="5" style="background: ${headerBg}; color: ${headerTextColor}; padding: .4rem .8rem; font-size: .78rem; font-weight: 700; border-bottom: 1.5px solid #E8D0A0; text-align: left;">${label} — ${data.dateStr} ${data.timeStr}</td></tr>`;
    for(const p of PLANETS){
      if(data.pos[p.id]===undefined) continue;
      const sp=signPos(data.pos[p.id]);
      let retTag='';
      const motion=data.retro&&data.retro[p.id];
      if(motion==="พักร์" || motion===true){
        retTag=`<span style="color:#ff3333; font-weight:bold; margin-left:4px; font-size:0.75rem;">(พ)</span>`;
      } else if(motion==="มนต์"){
        retTag=`<span style="color:#2E7D32; font-weight:bold; margin-left:4px; font-size:0.75rem;">(ม)</span>`;
      } else if(motion==="เสริด"){
        retTag=`<span style="color:#1976D2; font-weight:bold; margin-left:4px; font-size:0.75rem;">(ส)</span>`;
      }
      const lbl=useThaiNum?p.numTH:p.numAR;
      const thName = (p.id === 'lagna' && isNatal && isUnknownTime) ? 'ลัคนา (อ.)' : p.th;
      const dignityHTML = getDignityHTML(p.id, sp.si);
      h+=`<tr style="background: ${rowBg}; color: ${rowTextColor};">
          <td style="text-align:center; font-weight:700; font-size:1.05rem; color: ${nameColor}; border-bottom: 1px solid #E8D0A044; border-right: 1px solid #E8D0A044;">${lbl}</td>
          <td style="border-bottom: 1px solid #E8D0A044; border-right: 1px solid #E8D0A044;"><span class="pname" style="font-weight:700; color: ${nameColor};">${thName}</span>${retTag}</td>
          <td style="border-bottom: 1px solid #E8D0A044; border-right: 1px solid #E8D0A044; font-weight:500; color: ${rowTextColor};">${SIGNS_TH[sp.si]}</td>
          <td style="font-family:monospace; font-size:0.95rem; font-weight:600; border-bottom: 1px solid #E8D0A044; border-right: 1px solid #E8D0A044; color: ${rowTextColor}; white-space: nowrap;">${String(sp.deg).padStart(2,'0')}° ${String(sp.min).padStart(2,'0')}'</td>
          <td style="border-bottom: 1px solid #E8D0A044; color: ${rowTextColor};">${dignityHTML}</td>
          </tr>`;
    }
  }

  if(showN&&nData) rows(nData,'col-n','ดวงกำเนิด',true);
  if(showT&&tData) rows(tData,'col-t','ดวงจร',false);
  tbody.innerHTML=h||'<tr><td colspan="5" style="padding:.6rem;color:var(--dim);text-align:center">กดผูกดวงเพื่อดูผล</td></tr>';
}


// ── TAB NAVIGATION & BOOKING SYSTEM LOGIC ─────────────────────────────────
window.switchTab = function(tabId) {
  if (tabId === 'booking-tab' || tabId === 'calculator-tab' || tabId === 'my-bookings-tab') {
    ensureLocationsLoaded();
  }
  // Hide all tab contents
  document.querySelectorAll('.tab-content').forEach(el => {
    el.classList.add('hidden');
    el.classList.remove('active');
  });
  
  // Show target tab content
  const activeTab = document.getElementById(tabId);
  if (activeTab) {
    activeTab.classList.remove('hidden');
    activeTab.classList.add('active');
  }
  
  // Update active state on tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  const activeBtn = document.getElementById('btn-' + tabId);
  if (activeBtn) {
    activeBtn.classList.add('active');
  }

  // Scroll to top of tab view
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Base time slots definition
const MOCK_SLOTS_BASE = [
  { time: '09:00 - 10:00', startHour: 9, endHour: 10 },
  { time: '10:00 - 11:00', startHour: 10, endHour: 11 },
  { time: '11:00 - 12:00', startHour: 11, endHour: 12 },
  { time: '13:00 - 14:00', startHour: 13, endHour: 14 },
  { time: '14:00 - 15:00', startHour: 14, endHour: 15 },
  { time: '15:00 - 16:00', startHour: 15, endHour: 16 },
  { time: '16:00 - 17:00', startHour: 16, endHour: 17 },
  { time: '19:00 - 20:00', startHour: 19, endHour: 20 }
];

let reschedulingBookingId = null;

window.rescheduleBooking = function(id) {
  const booking = MY_BOOKINGS.find(b => b.id === id);
  if (!booking) return;

  reschedulingBookingId = id;
  
  // Switch tab to booking
  switchTab('booking-tab');

  // Fill form
  document.getElementById('bookAstrologer').value = booking.astrologer;
  document.getElementById('bookService').value = booking.service;
  document.getElementById('bookName').value = booking.name;
  document.getElementById('bookLineId').value = booking.lineId;
  document.getElementById('bookQuestions').value = booking.questions || '';

  // Show warning banner
  document.getElementById('rescheduleWarning').style.display = 'block';
  document.getElementById('rescheduleIdText').textContent = id;
  
  // Set default values for slip inputs
  document.getElementById('slipSenderName').value = booking.name;
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  document.getElementById('slipTransferDateTime').value = `${year}-${month}-${day}T${hours}:${minutes}`;

  // Scroll to booking form
  setTimeout(() => {
    document.getElementById('bookingForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
};

window.cancelReschedule = function() {
  reschedulingBookingId = null;
  document.getElementById('rescheduleWarning').style.display = 'none';
  document.getElementById('bookingForm').reset();
  
  // Reset date/time defaults
  document.getElementById('bookDay').value = "13";
  document.getElementById('bookMonth').value = "4";
  document.getElementById('bookYear').value = "2533";
  document.getElementById('bookHour').value = "08";
  document.getElementById('bookMin').value = "00";
  document.getElementById('bookCountry').value = "TH";
  populateCities('book', 'bangkok');
  
  document.querySelectorAll('.slot-btn').forEach(el => el.classList.remove('active'));
  document.getElementById('selectedTime').value = '';
  document.getElementById('bookQuestions').value = '';
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tyyyy = tomorrow.getFullYear();
  const tmm = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const tdd = String(tomorrow.getDate()).padStart(2, '0');
  document.getElementById('bookDate').value = `${tyyyy}-${tmm}-${tdd}`;
  checkCalendarAvailability();
};

// User bookings list (loaded from localStorage or initialized with mock default)
const STORAGE_KEY = 'muhub_bookings';
const MY_BOOKINGS = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [
  {
    id: 'Q-9812',
    astrologer: 'อ. โกโก้ (โหราศาสตร์ไทย ระบบลาหิรี)',
    service: 'โทรด้วยเสียง ผ่านไลน์',
    time: '2026-06-20 (14:00 - 14:45)',
    name: 'ส้มส้ม',
    lineId: 'somsom_line',
    status: 'completed',
    statusText: 'ตรวจดวงแล้ว'
  }
];

function saveBookings() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(MY_BOOKINGS));
}

// ── GOOGLE CALENDAR SERVICE INTEGRATION ───────────────────────────────────
class GoogleCalendarService {
  constructor(apiKey, calendarId = 'muhub54@gmail.com') {
    this.apiKey = apiKey;
    this.calendarId = calendarId;
  }

  async fetchBusySlots(dateStr) {
    if (!this.apiKey) {
      return this.getMockBusySlots(dateStr);
    }
    
    // Check real Google Calendar API (Date format: YYYY-MM-DD)
    const timeMin = new Date(`${dateStr}T00:00:00Z`).toISOString();
    const timeMax = new Date(`${dateStr}T23:59:59Z`).toISOString();
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(this.calendarId)}/events?key=${this.apiKey}&timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message);
      }
      
      return (data.items || []).map(event => {
        const start = new Date(event.start.dateTime || event.start.date);
        const end = new Date(event.end.dateTime || event.end.date);
        return {
          startHour: start.getHours(),
          endHour: end.getHours()
        };
      });
    } catch (e) {
      console.error("GCal API fetch error:", e);
      throw e;
    }
  }

  async blockEvent(dateStr, slotStr, name, lineId, serviceName, astrologerName, questions = '') {
    if (!this.apiKey) {
      const mockEventId = 'mock-gcal-' + Math.floor(100000 + Math.random() * 900000);
      console.log("Simulating blockEvent: created mock event ID:", mockEventId);
      return {
        success: true,
        simulated: true,
        data: { eventId: mockEventId }
      };
    }

    const parts = slotStr.split('-');
    const startPart = parts[0].trim();
    const endPart = parts[1] ? parts[1].trim() : '';
    const startHour = startPart.substring(0, 2);
    const endHour = endPart ? endPart.substring(0, 2) : String(parseInt(startHour, 10) + 1).padStart(2, '0');
    const endMinute = endPart ? endPart.substring(3, 5) : '00';

    const startStr = `${dateStr}T${startHour}:00:00+07:00`;
    const endStr = `${dateStr}T${endHour}:${endMinute}:00+07:00`;
    
    const payload = {
      action: 'create',
      summary: `MuHub จองคิว: คุณ ${name} (Line: ${lineId || 'ไม่ระบุ'})`,
      description: `บริการ: ${serviceName}\nนักพยากรณ์: ${astrologerName}\nLine ID: ${lineId || 'ไม่ระบุ'}\nคำถามที่สนใจ: ${questions || 'ไม่มี'}\nบันทึกจากระบบ MuHub Booking`,
      startTime: startStr,
      endTime: endStr
    };

    console.log("Sending block request to Google Apps Script:", payload);

    const scriptUrl = "https://script.google.com/macros/s/AKfycbwUkfB7te_1-o_u_2ZroBzpuACWmFYd8XS5JN3iv9rItvql-887wQw95SIIQBXWUQumPA/exec";

    try {
      const response = await fetch(scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      if (data && data.success === false) {
        throw new Error(data.error || 'Google Apps Script returned failure');
      }
      
      console.log("Successfully blocked calendar via Google Apps Script:", data);
      return { success: true, simulated: false, data };
    } catch (e) {
      console.error("Google Apps Script Request details:", e);
      throw new Error("ไม่สามารถบันทึกลงปฏิทินจริงได้ (ตรวจสอบ Google Apps Script): " + e.message);
    }
  }

  async deleteEvent(eventId) {
    if (!eventId) return { success: false, error: "No event ID provided" };
    if (!this.apiKey || eventId.startsWith('mock-')) {
      console.log("Simulating deleteEvent for event ID:", eventId);
      return { success: true, simulated: true, message: "ลบกิจกรรมจำลองสำเร็จ" };
    }
    
    const payload = {
      action: 'delete',
      eventId: eventId
    };

    console.log("Sending delete request to Google Apps Script:", payload);
    const scriptUrl = "https://script.google.com/macros/s/AKfycbwUkfB7te_1-o_u_2ZroBzpuACWmFYd8XS5JN3iv9rItvql-887wQw95SIIQBXWUQumPA/exec";

    try {
      const response = await fetch(scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      return { success: true, data };
    } catch (e) {
      console.error("Google Apps Script Delete error:", e);
      return { success: false, error: e.message };
    }
  }

  async uploadSlip(base64Data, mimeType, filename) {
    if (!this.apiKey) {
      console.log("Simulating uploadSlip: created simulated slip file in GDrive folder 1RtwEoH4ES9QJT2oB8JobUQw1rncnETYF with name:", filename);
      return {
        success: true,
        simulated: true,
        fileUrl: "https://drive.google.com/open?id=mock-drive-file-id"
      };
    }

    const payload = {
      action: 'uploadSlip',
      folderId: '1RtwEoH4ES9QJT2oB8JobUQw1rncnETYF',
      filename: filename,
      mimeType: mimeType,
      base64Data: base64Data
    };

    console.log("Sending uploadSlip request to Google Apps Script:", { ...payload, base64Data: "(truncated)" });

    const scriptUrl = "https://script.google.com/macros/s/AKfycbwUkfB7te_1-o_u_2ZroBzpuACWmFYd8XS5JN3iv9rItvql-887wQw95SIIQBXWUQumPA/exec";

    try {
      const response = await fetch(scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (data && data.success === false) {
        throw new Error(data.error || 'Google Apps Script returned failure');
      }

      console.log("Successfully uploaded slip via Google Apps Script:", data);
      return { success: true, simulated: false, fileUrl: data.fileUrl };
    } catch (e) {
      console.error("Google Apps Script uploadSlip error:", e);
      throw new Error("ไม่สามารถอัปโหลดสลิปไปยัง Google Drive ได้: " + e.message);
    }
  }

  getMockBusySlots(dateStr) {
    // Generate deterministic busy slots based on selected date
    const dateNum = new Date(dateStr).getDate() || 1;
    // Map to 2 mock busy indexes (based on date modulo)
    const busyIdx1 = dateNum % 8;
    const busyIdx2 = (dateNum + 3) % 8;
    return [busyIdx1, busyIdx2];
  }
}

function getSelectedSessionDuration() {
  const select = document.getElementById('bookAstrologer');
  if (!select) return 45; // default 45 mins
  const selectedOption = select.options[select.selectedIndex];
  if (!selectedOption) return 45;
  const match = selectedOption.textContent.match(/(\d+)\s*นาที/);
  if (match) {
    return parseInt(match[1], 10);
  }
  return 45; // default fallback
}

window.onAstrologerChange = function() {
  document.getElementById('selectedTime').value = '';
  document.querySelectorAll('.slot-btn').forEach(el => el.classList.remove('active'));
  hideStatusMessage();
  checkCalendarAvailability();
};

// ใส่ Google Calendar API Key ของคุณที่นี่เพื่อเชื่อมต่อระบบจริงใน Background
const GOOGLE_CALENDAR_API_KEY = "AIzaSyBJDmuRqBOUAPnh8bwTL5EQFRj_28fF3K4"; 

let gcalApiKey = GOOGLE_CALENDAR_API_KEY;
let calendarService = new GoogleCalendarService(gcalApiKey);

window.onGCalApiKeyChange = function() {
  gcalApiKey = document.getElementById('gcalApiKey').value.trim();
  calendarService = new GoogleCalendarService(gcalApiKey);
  const badge = document.getElementById('gcalStatusBadge');
  if (gcalApiKey) {
    badge.innerHTML = '<span style="width: 6px; height: 6px; border-radius: 50%; background: #2A6BAD; display: inline-block;"></span> ดึงข้อมูลจริงจาก Calendar';
    badge.style.color = '#2A6BAD';
    badge.style.backgroundColor = '#E1F5FE';
  } else {
    badge.innerHTML = '<span style="width: 6px; height: 6px; border-radius: 50%; background: #2E7D32; display: inline-block;"></span> โหมดจำลอง (muhub54@gmail.com)';
    badge.style.color = '#2E7D32';
    badge.style.backgroundColor = '#E8F5E9';
  }
  checkCalendarAvailability();
};

window.onDateChange = function() {
  document.getElementById('selectedTime').value = '';
  document.querySelectorAll('.slot-btn').forEach(el => el.classList.remove('active'));
  hideStatusMessage();
  checkCalendarAvailability();
};

window.checkCalendarAvailability = async function() {
  const datePicker = document.getElementById('bookDate');
  const loader = document.getElementById('slotsLoader');
  const container = document.getElementById('slotsContainer');
  if (!datePicker || !container) return;

  const dateVal = datePicker.value;
  if (!dateVal) {
    container.innerHTML = '<div style="color: var(--dim); font-size: 0.85rem; text-align: center; width: 100%; padding: 1rem;">⚠️ กรุณาเลือกวันนัดหมายก่อนตรวจสอบเวลาว่าง</div>';
    return;
  }

  if (loader) loader.style.display = 'inline';
  container.innerHTML = '<div style="color: var(--dim); font-size: 0.85rem; text-align: center; width: 100%; padding: 1rem;">🔄 กำลังโหลดและตรวจสอบปฏิทิน...</div>';

  try {
    if (gcalApiKey) {
      // Real API fetch
      const busyRanges = await calendarService.fetchBusySlots(dateVal);
      renderSlotsWithBusyRanges(busyRanges);
    } else {
      // Mock fetch delay
      await new Promise(resolve => setTimeout(resolve, 600));
      const busyIndexes = calendarService.getMockBusySlots(dateVal);
      renderSlotsWithMockIndexes(busyIndexes);
    }
  } catch (error) {
    console.error(error);
    container.innerHTML = `<div style="color: var(--coral-d); font-size: 0.82rem; text-align: center; width: 100%; padding: 1rem; border: 1px solid rgba(220,53,69,0.2); background: rgba(220,53,69,0.05); border-radius: 8px; margin-bottom: 0.5rem;">❌ เกิดข้อผิดพลาดจาก Google Calendar API: ${error.message}<br>ระบบเปลี่ยนมาใช้ข้อมูลจำลองแทนเพื่อความต่อเนื่อง</div>`;
    
    // Fallback to mock
    setTimeout(() => {
      const busyIndexes = calendarService.getMockBusySlots(dateVal);
      renderSlotsWithMockIndexes(busyIndexes);
    }, 1000);
  } finally {
    if (loader) loader.style.display = 'none';
  }
};

function updateStatusMessage(isAvailable) {
  const statusMsg = document.getElementById('bookingStatusMessage');
  if (!statusMsg) return;
  
  if (isAvailable) {
    statusMsg.innerHTML = '🟢 ว่างครับ กรุณาคอนเฟิร์มข้อมูลดวงด้านล่าง แล้วกดยืนยัน';
    statusMsg.style.color = '#2E7D32';
    statusMsg.style.backgroundColor = '#E8F5E9';
    statusMsg.style.padding = '4px 12px';
    statusMsg.style.borderRadius = '6px';
    statusMsg.style.border = '1px solid rgba(46, 125, 50, 0.2)';
    statusMsg.style.display = 'inline-flex';
  } else {
    statusMsg.innerHTML = '🔴 ขออภัยครับ เวลานี้ถูกจองแล้ว กรุณาเลือกใหม่อีกครั้งครับ';
    statusMsg.style.color = '#C62828';
    statusMsg.style.backgroundColor = '#FFEBEE';
    statusMsg.style.padding = '4px 12px';
    statusMsg.style.borderRadius = '6px';
    statusMsg.style.border = '1px solid rgba(198, 40, 40, 0.2)';
    statusMsg.style.display = 'inline-flex';
  }
}

function hideStatusMessage() {
  const statusMsg = document.getElementById('bookingStatusMessage');
  if (statusMsg) {
    statusMsg.style.display = 'none';
  }
}

function renderSlotsWithMockIndexes(busyIndexes) {
  const container = document.getElementById('slotsContainer');
  if (!container) return;
  container.innerHTML = '';
  
  const selectedTime = document.getElementById('selectedTime').value;
  let selectedIsNowBusy = false;
  
  const duration = getSelectedSessionDuration();
  
  MOCK_SLOTS_BASE.forEach((slot, index) => {
    const startStr = `${String(slot.startHour).padStart(2, '0')}:00`;
    const endStr = `${String(slot.startHour).padStart(2, '0')}:${String(duration).padStart(2, '0')}`;
    const displayTime = `${startStr} - ${endStr}`;

    const isBusy = busyIndexes.includes(index);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'slot-btn' + (isBusy ? ' busy' : '');
    btn.textContent = displayTime;
    if (isBusy) {
      btn.title = "ไม่ว่าง (จาก Google Calendar)";
      if (displayTime === selectedTime) selectedIsNowBusy = true;
    } else {
      btn.onclick = () => selectSlot(btn, displayTime);
      if (displayTime === selectedTime) {
        btn.classList.add('active');
      }
    }
    container.appendChild(btn);
  });
  
  if (selectedTime) {
    if (selectedIsNowBusy) {
      document.getElementById('selectedTime').value = '';
      updateStatusMessage(false);
    } else {
      updateStatusMessage(true);
    }
  } else {
    hideStatusMessage();
  }
}

function renderSlotsWithBusyRanges(busyRanges) {
  const container = document.getElementById('slotsContainer');
  if (!container) return;
  container.innerHTML = '';

  const selectedTime = document.getElementById('selectedTime').value;
  let selectedIsNowBusy = false;

  const duration = getSelectedSessionDuration();

  MOCK_SLOTS_BASE.forEach(slot => {
    const isBusy = busyRanges.some(range => {
      return (range.startHour >= slot.startHour && range.startHour < slot.endHour) ||
             (range.endHour > slot.startHour && range.endHour <= slot.endHour) ||
             (range.startHour <= slot.startHour && range.endHour >= slot.endHour);
    });

    const startStr = `${String(slot.startHour).padStart(2, '0')}:00`;
    const endStr = `${String(slot.startHour).padStart(2, '0')}:${String(duration).padStart(2, '0')}`;
    const displayTime = `${startStr} - ${endStr}`;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'slot-btn' + (isBusy ? ' busy' : '');
    btn.textContent = displayTime;
    if (isBusy) {
      btn.title = "ไม่ว่าง (จาก Google Calendar)";
      if (displayTime === selectedTime) selectedIsNowBusy = true;
    } else {
      btn.onclick = () => selectSlot(btn, displayTime);
      if (displayTime === selectedTime) {
        btn.classList.add('active');
      }
    }
    container.appendChild(btn);
  });

  if (selectedTime) {
    if (selectedIsNowBusy) {
      document.getElementById('selectedTime').value = '';
      updateStatusMessage(false);
    } else {
      updateStatusMessage(true);
    }
  } else {
    hideStatusMessage();
  }
}

function selectSlot(btn, time) {
  document.querySelectorAll('.slot-btn').forEach(el => el.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('selectedTime').value = time;
  hideStatusMessage();
}

window.selectAstrologer = function(name) {
  const select = document.getElementById('bookAstrologer');
  if (select) {
    select.value = name;
  }
  switchTab('booking-tab');
  onAstrologerChange();
};

window.autoFillBooking = function() {
  const bNameVal = document.getElementById('bName').value.trim();
  const bLastNameVal = document.getElementById('bLastName') ? document.getElementById('bLastName').value.trim() : '';
  const calcName = (bNameVal + ' ' + bLastNameVal).trim() || 'เจ้าชะตา';
  document.getElementById('bookName').value = calcName;
  
  const calcLineId = document.getElementById('bLineId').value || '';
  document.getElementById('bookLineId').value = calcLineId;
  
  document.getElementById('bookDay').value = document.getElementById('bDay').value;
  document.getElementById('bookMonth').value = document.getElementById('bMonth').value;
  document.getElementById('bookYear').value = document.getElementById('bYear').value;
  
  document.getElementById('bookHour').value = document.getElementById('bHour').value;
  document.getElementById('bookMin').value = document.getElementById('bMin').value;
  
  const countryVal = document.getElementById('bCountry').value;
  const bookCountryEl = document.getElementById('bookCountry');
  bookCountryEl.value = countryVal;
  if (typeof onCountryChange === 'function') onCountryChange('book');

  const cityVal = document.getElementById('bCity').value;
  setTimeout(() => {
    const bookCityEl = document.getElementById('bookCity');
    if (bookCityEl) {
      bookCityEl.value = cityVal;
      if (!bookCityEl.value && cityVal) {
        populateCities('book', cityVal);
        bookCityEl.value = cityVal;
      }
    }
  }, 80);

  document.getElementById('bookLat').value = document.getElementById('bLat').value;
  document.getElementById('bookLon').value = document.getElementById('bLon').value;

  const latField = document.getElementById('bookLatField');
  const lonField = document.getElementById('bookLonField');
  if (countryVal === 'custom') {
    latField.style.display = 'flex';
    lonField.style.display = 'flex';
  } else {
    latField.style.display = 'none';
    lonField.style.display = 'none';
  }

  alert('\ud83d\udce5 \u0e14\u0e36\u0e07\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e14\u0e27\u0e07\u0e01\u0e33\u0e40\u0e19\u0e34\u0e14\u0e25\u0e48\u0e32\u0e2a\u0e38\u0e14\u0e40\u0e2a\u0e23\u0e47\u0e08\u0e2a\u0e34\u0e49\u0e19!');
};

// ── BOOKING CHECKOUT MODAL LOGIC ─────────────────────────────────────────
let bookingCountdownInterval = null;
let currentBookingData = null;

window.closeBookingCheckoutModal = function() {
  const el = document.getElementById('bookingCheckoutSection') || document.getElementById('bookingCheckoutModal');
  if (el) el.style.display = 'none';
  if (bookingCountdownInterval) clearInterval(bookingCountdownInterval);
};

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result.split(',')[1];
      resolve(base64String);
    };
    reader.onerror = error => reject(error);
  });
}

window.onBookingSlipSelected = function() {
  const fileInput = document.getElementById('bookingSlipFile');
  const label = document.getElementById('bookingSlipFilename');
  if (fileInput.files.length > 0) {
    label.textContent = fileInput.files[0].name;
  }
};

window.simulateSlipAutoFill = function() {
  const label = document.getElementById('bookingSlipFilename');
  label.textContent = 'slip_muhub_399.jpg (ไฟล์หลักฐาน)';
  
  const dataTransfer = new DataTransfer();
  const file = new File(["dummy slip"], "slip_muhub_399.jpg", { type: "image/jpeg" });
  dataTransfer.items.add(file);
  document.getElementById('bookingSlipFile').files = dataTransfer.files;
};

window.isFreeBooking = false;

window.applyPromoCode = function() {
  const codeInput = document.getElementById('promoCodeInput');
  const messageEl = document.getElementById('promoCodeMessage');
  const priceEl = document.getElementById('checkoutPriceText');
  const qrSection = document.getElementById('checkoutQrSection');
  const slipSection = document.getElementById('checkoutSlipSection');
  
  if (!codeInput || !messageEl || !priceEl) return;
  
  const code = codeInput.value.trim().toUpperCase();
  if (code === 'MUHUBFIRST') {
    // Check if this LINE ID has already used the free code
    const lineIdInput = document.getElementById('bookLineId');
    const lineId = lineIdInput ? lineIdInput.value.trim().toLowerCase() : '';
    const usedIds = JSON.parse(localStorage.getItem('muhub_free_used') || '[]');

    if (!lineId) {
      messageEl.style.display = 'block';
      messageEl.style.color = '#d32f2f';
      messageEl.textContent = '⚠️ กรุณาระบุ Line ID ก่อนใช้โค้ดส่วนลด';
      return;
    }

    if (usedIds.includes(lineId)) {
      window.isFreeBooking = false;
      messageEl.style.display = 'block';
      messageEl.style.color = '#d32f2f';
      messageEl.textContent = `❌ Line ID "${lineIdInput.value.trim()}" ได้ใช้สิทธิ์โค้ดฟรีไปแล้ว (1 สิทธิ์ต่อ 1 Line ID)`;
      if (qrSection) qrSection.style.display = 'flex';
      if (slipSection) slipSection.style.display = 'block';
      return;
    }

    window.isFreeBooking = true;
    messageEl.style.display = 'block';
    messageEl.style.color = '#2e7d32';
    messageEl.textContent = '✅ โค้ดใช้งานได้! รับสิทธิ์ดูดวงฟรี (ยอดชำระเป็น 0 ฿)';

    priceEl.textContent = '0 ฿ (ฟรีดวงชะตา)';
    priceEl.style.color = '#2e7d32';

    if (qrSection) qrSection.style.display = 'none';
    if (slipSection) slipSection.style.display = 'none';

    document.getElementById('bookingSlipFile').value = '';
  } else {
    window.isFreeBooking = false;
    messageEl.style.display = 'block';
    messageEl.style.color = '#d32f2f';
    messageEl.textContent = '❌ โค้ดไม่ถูกต้อง หรือ สิทธิ์โปรโมชั่นเต็มแล้ว';
    
    priceEl.textContent = '399 ฿';
    priceEl.style.color = 'var(--coral-d)';
    
    if (qrSection) qrSection.style.display = 'flex';
    if (slipSection) slipSection.style.display = 'block';
  }
};

window.submitBooking = function(event) {
  event.preventDefault();
  
  const astrologer = document.getElementById('bookAstrologer').value;
  const service = document.getElementById('bookService').value;
  const dateVal = document.getElementById('bookDate').value;
  const slot = document.getElementById('selectedTime').value;
  const name = document.getElementById('bookName').value;
  const lineId = document.getElementById('bookLineId').value;
  const questions = document.getElementById('bookQuestions').value;
  
  if (!slot) {
    alert('⚠️ กรุณาเลือกช่วงเวลาที่ต้องการดูดวง');
    return;
  }

  // Format date values to Thai
  const dateParts = dateVal.split('-');
  const yyyy = parseInt(dateParts[0]);
  const mm = parseInt(dateParts[1]);
  const dd = parseInt(dateParts[2]);
  const formattedDate = `${dd} ${MONTHS_TH[mm - 1]} พ.ศ. ${yyyy + 543}`;

  const birthDay   = document.getElementById('bookDay').value;
  const birthMonth = parseInt(document.getElementById('bookMonth').value);
  const birthYear  = document.getElementById('bookYear').value;
  const birthHour  = document.getElementById('bookHour').value;
  const birthMin   = document.getElementById('bookMin').value;
  const birthCountryEl = document.getElementById('bookCountry');
  const birthCityEl    = document.getElementById('bookCity');
  const birthCountry = birthCountryEl ? birthCountryEl.options[birthCountryEl.selectedIndex]?.text : '';
  const birthCity    = birthCityEl    ? birthCityEl.options[birthCityEl.selectedIndex]?.text    : '';
  const birthDateStr = `${birthDay} ${MONTHS_TH[birthMonth - 1]} พ.ศ. ${birthYear}`;

  currentBookingData = {
    astrologer,
    service,
    dateVal: formattedDate,
    rawDate: dateVal,
    slot,
    name,
    lineId,
    questions,
    isReschedule: !!reschedulingBookingId,
    rescheduleBookingId: reschedulingBookingId,
    birthDateStr,
    birthHour,
    birthMin,
    birthCountry,
    birthCity
  };

  // Populate Summary inside Modal
  document.getElementById('summaryAstrologer').textContent = astrologer;
  document.getElementById('summaryService').textContent = service;
  document.getElementById('summaryTime').textContent = `${formattedDate} (${slot})`;
  document.getElementById('summaryName').textContent = name;
  document.getElementById('summaryLine').textContent = lineId || '-';
  
  const summaryQRow = document.getElementById('summaryQuestionsRow');
  const summaryQ = document.getElementById('summaryQuestions');
  if (questions.trim()) {
    summaryQ.textContent = questions;
    summaryQRow.style.display = 'block';
  } else {
    summaryQ.textContent = '-';
    summaryQRow.style.display = 'none';
  }
  
  const refId = 'MU-' + Math.floor(10000 + Math.random() * 90000) + '-' + (yyyy + 543);
  document.getElementById('paymentRefId').textContent = refId;

  // Set default values for slip inputs
  document.getElementById('slipSenderName').value = name;
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  document.getElementById('slipTransferDateTime').value = `${year}-${month}-${day}T${hours}:${minutes}`;
  
  // Custom display for rescheduling
  if (currentBookingData.isReschedule) {
    document.getElementById('checkoutTitle').innerHTML = '🔄 ยืนยันการเลื่อนวันเวลานัดหมาย';
    document.getElementById('checkoutPriceContainer').style.display = 'none';
    document.getElementById('checkoutQrSection').style.display = 'none';
    document.getElementById('checkoutSlipSection').style.display = 'none';
    document.getElementById('checkoutRescheduleInfo').style.display = 'block';
  } else {
    document.getElementById('checkoutTitle').innerHTML = '💳 ยืนยันการชำระเงินค่าจองคิว';
    document.getElementById('checkoutPriceContainer').style.display = 'flex';
    document.getElementById('checkoutRescheduleInfo').style.display = 'none';
    
    const priceText = document.getElementById('checkoutPriceText');
    const qrSection = document.getElementById('checkoutQrSection');
    const slipSection = document.getElementById('checkoutSlipSection');
    
    if (window.isFreeBooking) {
      if (priceText) {
        priceText.textContent = '0 ฿ (ฟรีดวงชะตา)';
        priceText.style.color = '#2e7d32';
      }
      if (qrSection) qrSection.style.display = 'none';
      if (slipSection) slipSection.style.display = 'none';
      document.getElementById('bookingSlipFile').value = '';
    } else {
      if (priceText) {
        priceText.textContent = '399 ฿';
        priceText.style.color = 'var(--coral-d)';
      }
      if (qrSection) qrSection.style.display = 'flex';
      if (slipSection) slipSection.style.display = 'block';
    }

    document.getElementById('bookingSlipFile').value = '';
    document.getElementById('bookingSlipFilename').textContent = 'เลือกไฟล์รูปภาพสลิป';
  }
  
  const el = document.getElementById('bookingCheckoutSection') || document.getElementById('bookingCheckoutModal');
  if (el) {
    el.style.display = el.id === 'bookingCheckoutModal' ? 'flex' : 'block';
    setTimeout(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  
  let timeRemaining = 1800; // 30 minutes
  const timerLabel = document.getElementById('paymentTimer');
  if (bookingCountdownInterval) clearInterval(bookingCountdownInterval);
  
  bookingCountdownInterval = setInterval(() => {
    timeRemaining--;
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    timerLabel.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    if (timeRemaining <= 0) {
      clearInterval(bookingCountdownInterval);
      alert('⏰ หมดเวลาการทำรายการชำระเงิน กรุณาทำรายการจองใหม่อีกครั้ง');
      closeBookingCheckoutModal();
    }
  }, 1000);
};

function openLineWithBirthData(queueId) {
  const d = currentBookingData;
  if (!d) return;

  const block1 = [
    `📋 ข้อมูลวันเกิดสำหรับทำนายดวง`,
    `• ชื่อ: ${d.name}`,
    `• Line ID: ${d.lineId || '-'}`,
    `• วันเกิด: ${d.birthDateStr}`,
    `• เวลาเกิด: ${String(d.birthHour).padStart(2,'0')}:${String(d.birthMin).padStart(2,'0')} น.`,
    `• ประเทศ: ${d.birthCountry || '-'}`,
    `• จังหวัด: ${d.birthCity || '-'}`,
    d.questions ? `• คำถามพิเศษ: ${d.questions}` : null
  ].filter(Boolean).join('\n');

  const paymentStatus = window.isFreeBooking ? 'ใช้โค้ดโปรโมชั่น (ฟรี)' : 'ชำระเงินเรียบร้อยแล้ว ✅';
  const block2 = [
    `─────────────────`,
    `💳 รายละเอียดการจอง`,
    `• เลขอ้างอิง: ${queueId}`,
    `• แพคเกจ: ${d.service}`,
    `• หมอดู: ${d.astrologer}`,
    `• วันนัด: ${d.dateVal}`,
    `• เวลานัด: ${d.slot}`,
    `• สถานะการชำระเงิน: ${paymentStatus}`
  ].join('\n');

  const msg = block1 + '\n\n' + block2;
  const url = 'https://line.me/R/oaMessage/@muhub?text=' + encodeURIComponent(msg);
  window.open(url, '_blank');
}

async function saveCustomerToExcel(data) {
  try {
    const block1 = [
      `📋 ข้อมูลวันเกิดสำหรับทำนายดวง`,
      `• ชื่อ: ${data.name || '-'}`,
      `• Line ID: ${data.lineId || '-'}`,
      `• วันเกิด: ${data.birthDateStr || data.birthDate || '-'}`,
      `• เวลาเกิด: ${String(data.birthHour !== undefined ? data.birthHour : '08').padStart(2,'0')}:${String(data.birthMin !== undefined ? data.birthMin : '00').padStart(2,'0')} น.`,
      `• ประเทศ: ${data.birthCountry || '-'}`,
      `• จังหวัด: ${data.birthCity || '-'}`,
      data.questions ? `• คำถามพิเศษ: ${data.questions}` : null
    ].filter(Boolean).join('\n');

    const paymentStatus = window.isFreeBooking ? 'ใช้โค้ดโปรโมชั่น (ฟรี)' : 'ชำระเงินเรียบร้อยแล้ว ✅';
    const block2 = [
      `─────────────────`,
      `💳 รายละเอียดการจอง`,
      `• เลขอ้างอิง: ${data.queueId || ''}`,
      `• แพคเกจ: ${data.service || ''}`,
      `• หมอดู: ${data.astrologer || ''}`,
      `• วันนัด: ${data.dateVal || data.date || ''}`,
      `• เวลานัด: ${data.slot || ''}`,
      `• สถานะการชำระเงิน: ${paymentStatus}`
    ].join('\n');

    const lineMessage = block1 + '\n\n' + block2;

    const res = await fetch("http://localhost:5001/api/save-customer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        queueId: data.queueId || "", name: data.name || "", lineId: data.lineId || "",
        astrologer: data.astrologer || "", service: data.service || "",
        date: data.dateVal || "", slot: data.slot || "", questions: data.questions || "",
        birthDate: data.birthDateStr || "", birthHour: data.birthHour || "",
        birthMin: data.birthMin || "", birthCountry: data.birthCountry || "",
        birthCity: data.birthCity || "", gcalEventId: data.gcalEventId || "",
        lineMessage: lineMessage
      })
    });
    const result = await res.json();
    console.log("✅ บันทึกลง MuHub_Customer_DB.xlsx แถว:", result.row, "LINE sent:", result.lineSent);
    return result;
  } catch (err) {
    console.warn("⚠️ Excel server ไม่ตอบสนอง:", err.message);
    return null;
  }
}

window.confirmBookingPayment = async function() {
  const fileInput = document.getElementById('bookingSlipFile');
  const isReschedule = currentBookingData && currentBookingData.isReschedule;

  let cleanFilename = "";
  let uploadStatus = "";

  if (!isReschedule) {
    if (window.isFreeBooking) {
      // Free booking bypasses slip checks
      cleanFilename = "FREE_BOOKING_PROMO_CODE";
    } else {
      if (fileInput.files.length === 0) {
        alert('⚠️ กรุณาแนบไฟล์สลิปหลักฐานการชำระเงิน (หรือกดปุ่ม "จำลองไฟล์สลิป" เพื่อทดสอบ)');
        return;
      }

      const senderName = document.getElementById('slipSenderName').value.trim();
      if (!senderName) {
        alert('⚠️ กรุณาระบุชื่อบัญชีผู้โอน');
        return;
      }

      const dtVal = document.getElementById('slipTransferDateTime').value;
      if (!dtVal) {
        alert('⚠️ กรุณาระบุวันเวลาที่โอนเงิน');
        return;
      }

      const parts = dtVal.split('T');
      const datePart = parts[0].replace(/-/g, ''); // YYYYMMDD
      const timePart = parts[1] ? parts[1].replace(/:/g, '') : '0000'; // HHMM

      const lineId = currentBookingData.lineId ? currentBookingData.lineId.trim() : 'ไม่ระบุ';

      const originalFilename = fileInput.files[0].name;
      const lastDotIndex = originalFilename.lastIndexOf('.');
      const ext = lastDotIndex !== -1 ? originalFilename.substring(lastDotIndex) : '.jpg';

      const constructedFilename = datePart + "_" + timePart + "_" + senderName + "_" + lineId + ext;
      cleanFilename = constructedFilename.replace('/', '_').replace('\\', '_').replace('?', '_').replace('%', '_').replace('*', '_').replace(':', '_').replace('|', '_').replace('"', '_').replace('<', '_').replace('>', '_');
    }
  }
  
  const queueId = isReschedule ? currentBookingData.rescheduleBookingId : ('Q-' + Math.floor(1000 + Math.random() * 9000));
  
  if (isReschedule) {
    const booking = MY_BOOKINGS.find(b => b.id === queueId);
    if (booking) {
      // If there is an old event, delete it from Google Calendar
      if (booking.gcalEventId) {
        console.log("Rescheduling: Deleting old Google Calendar event:", booking.gcalEventId);
        calendarService.deleteEvent(booking.gcalEventId).catch(err => console.error("Error deleting old event:", err));
      }
      booking.gcalEventId = null; // Clear old event ID so it's not stale if creation fails
      booking.astrologer = currentBookingData.astrologer;
      booking.service = currentBookingData.service;
      booking.time = `${currentBookingData.dateVal} (${currentBookingData.slot})`;
      booking.name = currentBookingData.name;
      booking.lineId = currentBookingData.lineId;
      booking.questions = currentBookingData.questions;
      booking.status = 'pending';
      booking.statusText = 'รอตรวจสอบการเลื่อนนัด';
    }
  } else {
    const newBooking = {
      id: queueId,
      astrologer: currentBookingData.astrologer,
      service: currentBookingData.service,
      time: `${currentBookingData.dateVal} (${currentBookingData.slot})`,
      name: currentBookingData.name,
      lineId: currentBookingData.lineId,
      questions: currentBookingData.questions,
      status: window.isFreeBooking ? 'confirmed' : 'pending',
      statusText: window.isFreeBooking ? 'จองคิวสำเร็จ (ใช้โค้ดฟรี)' : 'รอตรวจสอบสลิป',
      gcalEventId: null
    };
    MY_BOOKINGS.unshift(newBooking);

    // Lock LINE ID from using free code again
    if (window.isFreeBooking && currentBookingData.lineId) {
      const key = 'muhub_free_used';
      const usedIds = JSON.parse(localStorage.getItem(key) || '[]');
      const lid = currentBookingData.lineId.trim().toLowerCase();
      if (!usedIds.includes(lid)) {
        usedIds.push(lid);
        localStorage.setItem(key, JSON.stringify(usedIds));
      }
    }
  }
  
  // Upload slip to Google Drive if not rescheduling and not free
  if (!isReschedule && !window.isFreeBooking) {
    try {
      const base64Data = await fileToBase64(fileInput.files[0]);
      const mimeType = fileInput.files[0].type || 'image/jpeg';
      const uploadResult = await calendarService.uploadSlip(
        base64Data,
        mimeType,
        cleanFilename
      );
      if (uploadResult.success && !uploadResult.simulated) {
        uploadStatus = `\n📁 [Google Drive] อัปโหลดสลิปเรียบร้อยแล้ว: ${uploadResult.fileUrl}`;
      } else if (uploadResult.simulated) {
        uploadStatus = `\n📁 [Google Drive] จำลองการอัปโหลดสลิปสำเร็จ (ชื่อไฟล์: ${cleanFilename})`;
      } else {
        uploadStatus = `\n⚠️ [Google Drive Alert] อัปโหลดสลิปไม่สำเร็จ: ${uploadResult.error}`;
      }
    } catch (uploadErr) {
      console.error("Error uploading slip:", uploadErr);
      uploadStatus = `\n⚠️ [Google Drive Error] ไม่สามารถส่งไฟล์สลิปได้: ${uploadErr.message || String(uploadErr)}`;
    }
  }

  saveBookings();
  renderBookings();
  closeBookingCheckoutModal();

  // Send data to block Google Calendar
  let blockStatus = "";
  let isRealGCalSuccess = false;
  let isSimulatedGCal = false;
  let gcalErrorMsg = "";
  let gcalEventId = null;

  try {
    const result = await calendarService.blockEvent(
      currentBookingData.rawDate,
      currentBookingData.slot,
      currentBookingData.name,
      currentBookingData.lineId,
      currentBookingData.service,
      currentBookingData.astrologer,
      currentBookingData.questions
    );
    if (result.success && !result.simulated) {
      isRealGCalSuccess = true;
      gcalEventId = result.data ? result.data.eventId : null;
      blockStatus = "\n📅 [Google Calendar] บันทึกนัดหมายในปฏิทินจริงเรียบร้อยแล้ว!";
    } else if (result.error) {
      gcalErrorMsg = result.message || result.error;
      blockStatus = `\n⚠️ [Google Calendar Alert] ${gcalErrorMsg}\n(ดูรายละเอียด Payload ใน Console)`;
    } else {
      isSimulatedGCal = true;
      gcalEventId = result.data ? result.data.eventId : null;
      blockStatus = "\n📅 [Google Calendar] บันทึกนัดหมายในปฏิทิน (โหมดจำลอง) เรียบร้อยแล้ว!";
    }
  } catch (err) {
    console.error("Error blocking calendar event:", err);
    gcalErrorMsg = err.message || String(err);
    blockStatus = `\n⚠️ [Google Calendar Error] ไม่สามารถเชื่อมต่อกับปฏิทินได้: ${gcalErrorMsg}`;
  }
  
  // Update the booking object with new eventId if successful
  if (gcalEventId) {
    const booking = MY_BOOKINGS.find(b => b.id === queueId);
    if (booking) {
      booking.gcalEventId = gcalEventId;
      saveBookings();
    }
  }

  // บันทึกข้อมูลลูกค้าลง MuHub_Customer_DB.xlsx
  let lineSent = false;
  try {
    const excelResult = await saveCustomerToExcel({ ...currentBookingData, queueId, gcalEventId });
    if (excelResult && excelResult.lineSent) {
      lineSent = true;
    }
  } catch (err) {
    console.error("saveCustomerToExcel error:", err);
  }

  // Reset booking form inputs
  document.getElementById('bookingForm').reset();
  window.isFreeBooking = false;
  const promoMsg = document.getElementById('promoCodeMessage');
  if (promoMsg) {
    promoMsg.style.display = 'none';
    promoMsg.textContent = '';
  }
  document.getElementById('bookDay').value = "13";
  document.getElementById('bookMonth').value = "4";
  document.getElementById('bookYear').value = "2533";
  document.getElementById('bookHour').value = "08";
  document.getElementById('bookMin').value = "00";
  document.getElementById('bookCountry').value = "TH";
  document.getElementById('bookQuestions').value = "";
  populateCities('book', 'bangkok');
  
  document.querySelectorAll('.slot-btn').forEach(el => el.classList.remove('active'));
  document.getElementById('selectedTime').value = '';
  
  // Hide warning banner
  if (isReschedule) {
    reschedulingBookingId = null;
    document.getElementById('rescheduleWarning').style.display = 'none';
  }
  
  // Set default date picker to tomorrow again
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tyyyy = tomorrow.getFullYear();
  const tmm = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const tdd = String(tomorrow.getDate()).padStart(2, '0');
  document.getElementById('bookDate').value = `${tyyyy}-${tmm}-${tdd}`;
  checkCalendarAvailability();

  const lineNotice = lineSent 
    ? "\n📲 [LINE OA] ระบบส่งข้อความยืนยันคิวให้ในห้องแชทเรียบร้อยแล้วค่ะ!" 
    : "\n📲 [LINE OA] กำลังเปิดหน้าแชท LINE เพื่อให้คุณส่งข้อความยืนยันด้วยตนเอง...";

  if (isReschedule) {
    alert(`✅ ยืนยันการเลื่อนวันเวลานัดคิว ${queueId} สำเร็จ! (อ้างอิงสลิปใบเดิม)${blockStatus}\nระบบกำลังจำลองการตรวจสอบจากแอดมิน (ใช้เวลา 5 วินาที)...`);
  } else if (window.isFreeBooking) {
    alert(`✅ จองคิวดูดวงฟรีสำเร็จ! หมายเลขคิวของคุณคือ: ${queueId}${blockStatus}${lineNotice}\nยินดีต้อนรับสู่บริการดูดวงของ MuHub ครับ!`);
    // Send birth data to LINE OA + capture horoscope chart to Drive
    if (currentBookingData && currentBookingData.lineId) {
      if (lineSent) {
        console.log("LINE message sent automatically by backend. Skipping redirect.");
      } else {
        openLineWithBirthData(queueId);
      }
    }
    captureAndUploadChart(currentBookingData);
  } else {
    alert(`✅ อัปโหลดสลิปหลักฐานสำเร็จ! หมายเลขคิวของคุณคือ: ${queueId}${uploadStatus}${blockStatus}${lineNotice}\nระบบกำลังจำลองการตรวจสอบจากแอดมิน (ใช้เวลา 5 วินาที)...`);
    // Send birth data to LINE OA + capture horoscope chart to Drive
    if (currentBookingData && currentBookingData.lineId) {
      if (lineSent) {
        console.log("LINE message sent automatically by backend. Skipping redirect.");
      } else {
        openLineWithBirthData(queueId);
      }
    }
    captureAndUploadChart(currentBookingData);
  }
  
  // Simulate admin verifying the slip (only if not free booking or rescheduling)
  if (!window.isFreeBooking || isReschedule) {
    setTimeout(() => {
      const booking = MY_BOOKINGS.find(b => b.id === queueId);
    if (booking) {
      booking.status = 'confirmed';
      if (isReschedule) {
        if (isRealGCalSuccess) {
          booking.statusText = 'คอนเฟิร์มนัด';
          booking.statusSub = 'บันทึก Google Calendar สำเร็จ';
          alert(`🔔 แจ้งเตือน: เลื่อนนัดสำหรับคิว ${queueId} ได้รับการอนุมัติและบันทึกลง Google Calendar เรียบร้อยแล้ว!`);
        } else if (isSimulatedGCal) {
          booking.statusText = 'คอนเฟิร์มนัด';
          booking.statusSub = 'บันทึกปฏิทิน (จำลอง)';
          alert(`🔔 แจ้งเตือน: เลื่อนนัดสำหรับคิว ${queueId} ได้รับการอนุมัติแล้ว (เลื่อนนัดใน Google Calendar โหมดจำลอง)`);
        } else {
          booking.statusText = 'คอนเฟิร์มนัด';
          booking.statusSub = '⚠️ บันทึกปฏิทินล้มเหลว';
          alert(`🔔 แจ้งเตือน: เลื่อนนัดสำหรับคิว ${queueId} ได้รับการอนุมัติแล้ว\n⚠️ แต่เลื่อนนัดลง Google Calendar ล้มเหลว: ${gcalErrorMsg}`);
        }
      } else {
        if (isRealGCalSuccess) {
          booking.statusText = 'คอนเฟิร์มนัด';
          booking.statusSub = 'บันทึก Google Calendar สำเร็จ';
          alert(`🔔 แจ้งเตือน: คิวจองหมายเลข ${queueId} ได้รับการอนุมัติสลิปและบันทึกคิวลงใน Google Calendar เรียบร้อยแล้ว!`);
        } else if (isSimulatedGCal) {
          booking.statusText = 'คอนเฟิร์มนัด';
          booking.statusSub = 'บันทึกปฏิทิน (จำลอง)';
          alert(`🔔 แจ้งเตือน: คิวจองหมายเลข ${queueId} ได้รับการอนุมัติสลิปแล้ว (บันทึกคิวลงใน Google Calendar โหมดจำลอง)`);
        } else {
          booking.statusText = 'คอนเฟิร์มนัด';
          booking.statusSub = '⚠️ บันทึกปฏิทินล้มเหลว';
          alert(`🔔 แจ้งเตือน: คิวจองหมายเลข ${queueId} ได้รับการอนุมัติสลิปแล้ว\n⚠️ แต่ไม่สามารถบันทึกลง Google Calendar ได้เนื่องจากเกิดข้อผิดพลาด: ${gcalErrorMsg}`);
        }
      }
      saveBookings();
      renderBookings();
    }
  }, 5000);
  }
};

window.cancelBooking = function(id) {
  if (confirm('คุณแน่ใจไหมว่าต้องการยกเลิกคอนเฟิร์มนัด? ทางเราไม่มีนโยบายโอนเงินคืนนะครับ')) {
    const idx = MY_BOOKINGS.findIndex(b => b.id === id);
    if (idx !== -1) {
      const booking = MY_BOOKINGS[idx];
      // If there is an associated Google Calendar event, delete it
      if (booking.gcalEventId) {
        console.log("Cancelling booking: Deleting Google Calendar event:", booking.gcalEventId);
        calendarService.deleteEvent(booking.gcalEventId).catch(err => console.error("Error deleting event:", err));
      }
      MY_BOOKINGS.splice(idx, 1);
      saveBookings();
      renderBookings();
      alert('❌ ยกเลิกคิวจองเรียบร้อยแล้ว (ระบบได้ลบนัดหมายใน Google Calendar ให้แล้วหากเชื่อมต่อไว้)');
    }
  }
};

let showActiveBookings = true;
let showCompletedBookings = true;

window.toggleBookingFilter = function(type) {
  if (type === 'active') {
    showActiveBookings = !showActiveBookings;
    document.getElementById('filterTogActive').classList.toggle('off', !showActiveBookings);
  } else {
    showCompletedBookings = !showCompletedBookings;
    document.getElementById('filterTogCompleted').classList.toggle('off', !showCompletedBookings);
  }
  renderBookings();
};

function renderBookings() {
  const container = document.getElementById('bookingsList');
  if (!container) return;
  
  // Auto-complete bookings that have passed their slot end time
  const now = new Date();
  let updatedAny = false;
  MY_BOOKINGS.forEach(b => {
    if (b.status !== 'completed' && b.time) {
      try {
        // Expected format: YYYY-MM-DD (HH:MM - HH:MM)
        const match = b.time.match(/^(\d{4}-\d{2}-\d{2})\s*\((\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})\)$/);
        if (match) {
          const datePart = match[1];
          const endTimePart = match[3];
          const endDateTime = new Date(`${datePart}T${endTimePart}:00`);
          if (now > endDateTime) {
            b.status = 'completed';
            b.statusText = 'ตรวจดวงแล้ว';
            updatedAny = true;
          }
        }
      } catch (e) {
        console.error("Error parsing booking time:", e);
      }
    }
  });
  if (updatedAny) {
    saveBookings();
  }
  
  const filtered = MY_BOOKINGS.filter(b => {
    if (b.status === 'completed') {
      return showCompletedBookings;
    } else {
      return showActiveBookings;
    }
  });

  if (filtered.length === 0) {
    container.innerHTML = '<div style="text-align:center;color:var(--dim);padding:2rem;">ไม่พบคิวตรงตามตัวเลือกการกรอง</div>';
    return;
  }
  
  container.innerHTML = '';
  filtered.forEach(b => {
    let badgeClass = 'status-pending';
    let displayStatus = b.statusText || 'รอตรวจสอบ';
    if (b.status === 'confirmed') { badgeClass = 'status-confirmed'; displayStatus = 'คอนเฟิร์มนัด'; }
    if (b.status === 'completed') { badgeClass = 'status-completed'; displayStatus = 'ตรวจดวงแล้ว'; }
    const actionButtons = b.status !== 'completed' ? `
      <div style="display:flex;gap:6px;margin-top:4px;">
        <button class="btn" style="padding:4px 12px;font-size:0.75rem;height:2rem;background:rgba(226,184,66,0.1);border:1px solid rgba(226,184,66,0.35);color:var(--gold);border-radius:6px;cursor:pointer;white-space:nowrap;" onclick="rescheduleBooking('${b.id}')">🕒 เลื่อนนัด</button>
        <button class="btn" style="padding:4px 12px;font-size:0.75rem;height:2rem;background:rgba(211,47,47,0.1);border:1px solid rgba(211,47,47,0.35);color:#ef9a9a;border-radius:6px;cursor:pointer;white-space:nowrap;" onclick="cancelBooking('${b.id}')">✕ ยกเลิกนัด</button>
      </div>` : '';
    
    container.innerHTML += `
      <div class="booking-item">
        <div class="booking-meta">
          <div style="font-weight:700;color:var(--text);font-size:1.05rem;">${b.astrologer}</div>
          <div style="font-size:0.85rem;color:var(--dim);"><span style="font-weight:600;">คิว ID:</span> ${b.id} — คุณ ${b.name} ${b.lineId ? `(Line: ${b.lineId})` : ''}</div>
          <div style="font-size:0.82rem;color:var(--dim);"><span style="font-weight:600;">บริการ:</span> ${b.service}</div>
          ${b.questions ? `<div style="font-size:0.82rem;color:var(--dim);"><span style="font-weight:600;">คำถาม:</span> ${b.questions}</div>` : ''}
          <div style="font-size:0.82rem;color:var(--text);font-weight:500;margin-top:4px;"><span style="font-size:1.1rem;vertical-align:-1px;">🕒</span> ${b.time}</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;">
          <span class="booking-status ${badgeClass}">${displayStatus}</span>
          ${actionButtons}
        </div>
      </div>
    `;
  });
}

// Shop modal variables
let currentItem = '';
let currentPrice = 0;
let currentItemType = '';

window.openShopModal = function(name, price, type) {
  currentItem = name;
  currentPrice = price;
  currentItemType = type;
  
  document.getElementById('modalItemTitle').textContent = 'สั่งซื้อ/บูชาเครื่องรางมงคล';
  document.getElementById('modalItemName').textContent = name;
  document.getElementById('modalItemPrice').textContent = price + ' ฿';
  
  const formArea = document.getElementById('modalFormArea');
  formArea.innerHTML = '';
  
  if (type === 'wallpaper') {
    formArea.innerHTML = `
      <div style="font-size:0.8rem;font-weight:700;margin-bottom:0.4rem;">เลือกเรื่องที่ต้องการเน้นเสริมดวง:</div>
      <select id="shopFocus" style="width:100%;margin-bottom:0.8rem;padding:0.4rem;border-radius:4px;border:1px solid #ddd;">
        <option value="การงาน/ความสำเร็จ">การงานการทำธุรกิจ การงานราบรื่น</option>
        <option value="การเงิน/โชคลาภ">การเงิน โชคลาภพูนทวี</option>
        <option value="ความรัก/เสน่ห์">ความรัก เมตตามหานิยม</option>
      </select>
      <div style="font-size:0.75rem;color:var(--dim);">* วอลเปเปอร์จะถูกคำนวณและปรับสีตามราศีลัคนาของท่านโดยอ้างอิงจากการผูกดวงล่าสุด</div>
    `;
  } else if (type === 'report') {
    formArea.innerHTML = `
      <div style="font-size:0.8rem;font-weight:700;margin-bottom:0.4rem;">ระบุอีเมลรับเอกสาร PDF:</div>
      <input type="email" id="shopEmail" style="width:100%;margin-bottom:0.4rem;padding:0.4rem;border-radius:4px;border:1px solid #ddd;" placeholder="example@gmail.com" required>
      <div style="font-size:0.75rem;color:var(--dim);">* ระบบจะจัดส่งสมุดสรุปชะตารายปีเป็นไฟล์ PDF ภายใน 10 นาทีหลังจากชำระเงิน</div>
    `;
  } else if (type === 'yantra') {
    formArea.innerHTML = `
      <div style="font-size:0.8rem;font-weight:700;margin-bottom:0.4rem;">ระบุที่อยู่จัดส่งแผ่นยันต์:</div>
      <textarea id="shopAddress" style="width:100%;height:80px;padding:0.4rem;border-radius:4px;border:1px solid #ddd;" placeholder="ที่อยู่ในการจัดส่งไปรษณีย์แบบละเอียด" required></textarea>
    `;
  } else {
    formArea.innerHTML = `
      <div style="font-size:0.8rem;font-weight:700;margin-bottom:0.4rem;">ระบุขนาดข้อมือและที่อยู่จัดส่ง:</div>
      <input type="text" id="shopSize" style="width:100%;margin-bottom:0.5rem;padding:0.4rem;border-radius:4px;border:1px solid #ddd;" placeholder="ขนาดข้อมือ (เซนติเมตร) เช่น 16 ซม." required>
      <textarea id="shopAddress" style="width:100%;height:60px;padding:0.4rem;border-radius:4px;border:1px solid #ddd;" placeholder="ที่อยู่ในการจัดส่งไปรษณีย์" required></textarea>
    `;
  }
  
  document.getElementById('shopModal').style.display = 'flex';
};

window.closeShopModal = function() {
  document.getElementById('shopModal').style.display = 'none';
};

window.simulatePurchase = function() {
  if (currentItemType === 'report') {
    const email = document.getElementById('shopEmail').value;
    if (!email) { alert('กรุณากรอกอีเมลเพื่อรับรายงาน'); return; }
  } else if (currentItemType === 'yantra') {
    const addr = document.getElementById('shopAddress').value;
    if (!addr) { alert('กรุณาระบุที่อยู่จัดส่งแผ่นยันต์'); return; }
  } else if (currentItemType === 'bracelet') {
    const size = document.getElementById('shopSize').value;
    const addr = document.getElementById('shopAddress').value;
    if (!size || !addr) { alert('กรุณาระบุขนาดข้อมือและที่อยู่จัดส่ง'); return; }
  }
  
  closeShopModal();
  
  // Calculate based on Lagna if possible
  const lagnaBadge = document.getElementById('lagnaBadge');
  const lagnaText = lagnaBadge ? lagnaBadge.textContent : 'ราศีเมษ';
  
  let resultMsg = `🎉 ชำระเงินจำลองสำเร็จ! บูชา: ${currentItem}\n`;
  if (currentItemType === 'wallpaper') {
    const focus = document.getElementById('shopFocus').value;
    resultMsg += `เรากำลังสร้างรูปภาพวอลเปเปอร์ที่เสริมดวงเรื่อง [${focus}] ปรับแต่งตาม [${lagnaText}] ให้คุณสำหรับดาวน์โหลด...`;
  } else {
    resultMsg += `คำสั่งซื้อของคุณได้รับการยืนยันแล้ว ทางเราจะรีบจัดส่งมงคลชีวิตชิ้นนี้ให้คุณโดยเร็วที่สุด!`;
  }
  
  alert(resultMsg);
};

// Initialize Slots and Bookings on load
const bookDatePicker = document.getElementById('bookDate');
if (bookDatePicker) {
  const todayDate = new Date();
  const yyyy = todayDate.getFullYear();
  const mm = String(todayDate.getMonth() + 1).padStart(2, '0');
  const dd = String(todayDate.getDate()).padStart(2, '0');
  bookDatePicker.min = `${yyyy}-${mm}-${dd}`;
  
  // Set max date to 30 days in advance
  const maxDate = new Date(todayDate);
  maxDate.setDate(todayDate.getDate() + 30);
  const myyyy = maxDate.getFullYear();
  const mmm = String(maxDate.getMonth() + 1).padStart(2, '0');
  const mdd = String(maxDate.getDate()).padStart(2, '0');
  bookDatePicker.max = `${myyyy}-${mmm}-${mdd}`;
  
  // Set default date to tomorrow
  const tomorrow = new Date(todayDate);
  tomorrow.setDate(todayDate.getDate() + 1);
  const tyyyy = tomorrow.getFullYear();
  const tmm = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const tdd = String(tomorrow.getDate()).padStart(2, '0');
  bookDatePicker.value = `${tyyyy}-${tmm}-${tdd}`;
}
// Check if API Key is configured in JavaScript
if (gcalApiKey) {
  const gcalInput = document.getElementById('gcalApiKey');
  if (gcalInput) gcalInput.value = gcalApiKey;
  const badge = document.getElementById('gcalStatusBadge');
  if (badge) {
    badge.innerHTML = '<span style="width: 6px; height: 6px; border-radius: 50%; background: #2A6BAD; display: inline-block;"></span> ดึงข้อมูลจริงจาก Calendar';
    badge.style.color = '#2A6BAD';
    badge.style.backgroundColor = '#E1F5FE';
  }
}

checkCalendarAvailability();
renderBookings();


// ── INIT ────────────────────────────────────────────────────────────────
populateDateDropdowns('b', '1990-04-13');
document.getElementById('bHour').value = "08";
document.getElementById('bMin').value = "00";
populateCities('b', 'bangkok');

populateDateDropdowns('book', '1990-04-13');
document.getElementById('bookHour').value = "08";
document.getElementById('bookMin').value = "00";

// Initialize transit date/month matching birth date, with year adjusted relative to current date
const bDayVal = parseInt(document.getElementById('bDay').value) || 13;
const bMonthVal = parseInt(document.getElementById('bMonth').value) || 4;

const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth() + 1;
const currentDay = today.getDate();

let transitYear = currentYear;
if (currentMonth < bMonthVal || (currentMonth === bMonthVal && currentDay < bDayVal)) {
  transitYear = currentYear - 1;
}

populateDateDropdowns('t');
document.getElementById('tDay').value = bDayVal;
document.getElementById('tMonth').value = bMonthVal;
document.getElementById('tYear').value = transitYear + 543;

// Set transit time to current hour/minute
document.getElementById('tHour').value = String(today.getHours()).padStart(2, '0');
document.getElementById('tMin').value = String(today.getMinutes()).padStart(2, '0');

drawWheel();
renderTable();
ensureLocationsLoaded();


// ── FREE HOROSCOPE & E-SIIMSI DATABASES ──────────────────────────────────
const ZODIAC_READINGS = [
  "ชาวราศีเมษเป็นผู้มีพลังสร้างสรรค์ล้นเหลือ มีความเป็นผู้นำ กล้าคิดกล้าทำ และชอบความท้าทาย ช่วงนี้มีโอกาสได้เริ่มต้นสิ่งใหม่ ๆ ที่จะนำความสำเร็จและชื่อเสียงมาให้ จงรักษาความกระตือรือร้นและพลังใจนี้ไว้ให้ดีเพื่อเปิดประตูบานใหม่สู่ความมั่นคง",
  "ชาวราศีพฤษภมีความมั่นคง หนักแน่น มีความอดทนสูง และรักในความงามและความประณีต เป็นผู้ที่บริหารจัดการเรื่องการเงินได้ดี ช่วงนี้ดวงชะตาเด่นเรื่องโชคลาภและความมั่นคงทางทรัพย์สิน สิ่งที่ทุ่มเทแรงกายแรงใจมานานกำลังจะผลิดอกออกผลเป็นทรัพย์สินเงินทอง",
  "ชาวราศีเมถุนมีความเฉลียวฉลาด ปรับตัวเก่ง มีวาทศิลป์และการสื่อสารที่เป็นเลิศ ช่วงนี้ดวงชะตามีเกณฑ์ได้ติดต่อเจรจางานสำคัญหรือพบปะผู้คนที่จะนำโอกาสดี ๆ มาสู่ตัวคุณ การค้าขายและการประสานงานจะมีผู้ใหญ่สนับสนุนทางอ้อมให้ราบรื่นยิ่งขึ้น",
  "ชาวราศีกรกฎมีความอ่อนโยน มีสัญชาตญาณในการปกป้องดูแลผู้อื่น รักครอบครัวและคนใกล้ชิด ช่วงนี้ดวงชะตาเน้นไปที่ความสงบสุขในบ้านเรือน การขยับขยายที่อยู่อาศัย หรือการเริ่มต้นธุรกิจส่วนตัวในครอบครัวที่จะเจริญเติบโตอย่างมั่นคงในระยะยาว",
  "ชาวราศีสิงห์มีความสง่างาม มีพลังแห่งความสร้างสรรค์ มีความมั่นใจในตนเองสูงและชอบเป็นจุดเด่น ช่วงนี้ดวงชะตามีพลังดึงดูดสิ่งดี ๆ เข้าหาตัว มีโอกาสได้รับเกียรติยศ ชื่อเสียง หรือการเลื่อนขั้นเลื่อนตำแหน่งงานใหม่ที่ท้าทายและสร้างบารมีเพิ่มพูน",
  "ชาวราศีกันย์เป็นผู้มีระเบียบวินัย ละเอียดรอบคอบ ใส่ใจในรายละเอียด และรักการบริการ ช่วงนี้ดวงการงานเด่นชัดมาก ความพยายามและผลงานประณีตที่คุณทุ่มเทแบบปิดทองหลังพระจะได้รับการยอมรับและชื่นชมจากสังคม มีเกณฑ์ได้รับความไว้วางใจให้คุมงานสำคัญ",
  "ชาวราศีตุลย์รักความยุติธรรม ความเท่าเทียม และการสร้างความสมดุลในทุกมิติของชีวิต มีมนุษยสัมพันธ์ดีเลิศ ช่วงนี้ดวงเด่นเรื่องความสัมพันธ์ การร่วมหุ้นส่วนทำธุรกิจ หรือคู่ครองคนใกล้ชิดที่จะคอยเป็นแรงเกื้อหนุนที่ดีในเรื่องเงินทองและพลังใจ",
  "ชาวราศีพิจิกมีความลึกลับ มีพลังจิตใจที่เข้มแข็ง เด็ดเดี่ยว และมีพลังในการเปลี่ยนแปลงชีวิตตนเอง ช่วงนี้มีเกณฑ์พ้นเคราะห์ สิ่งที่เคยติดขัดหรือสร้างความอึดอัดใจจะคลี่คลายอย่างอัศจรรย์ และได้พบโอกาสทองทางการเงินหรืออาชีพเสริมใหม่ ๆ",
  "ชาวราศีธนูรักเสรีภาพ การเรียนรู้สิ่งใหม่ การเดินทาง และมีทัศนคติเชิงบวกเสมอ ช่วงนี้ดวงชะตามีเกณฑ์ได้รับข่าวดีจากต่างแดน หรือความก้าวหน้าจากการศึกษาหาความรู้เพิ่มเติม การทำบุญเสริมบารมีจะช่วยเปิดทางสะดวกในการดำเนินชีวิตสูงยิ่งขึ้น",
  "ชาวราศีมังกรมีความรับผิดชอบสูง มุ่งมั่น ทะเยอทะยาน และมีความอดทนต่ออุปสรรคเพื่อเป้าหมายระยะยาว ช่วงนี้ผลแห่งความอดทนและเหนื่อยยากในอดีตกำลังจะสัมฤทธิ์ผล ชะตาชีวิตจะก้าวหน้าอย่างมั่นคง มีรายได้และทรัพย์สินที่จับต้องได้เข้ามาเพิ่มเติม",
  "ชาวราศีกุมภ์รักอิสระ มีความคิดสร้างสรรค์ที่ล้ำยุค มีอุดมการณ์สูง และชอบทำงานเพื่อส่วนรวม ช่วงนี้มีเกณฑ์ได้รับโชคลาภจากมิตรสหายหรือสังคม การทำงานร่วมกันเป็นทีมจะประสบความสำเร็จดีเยี่ยม และนวัตกรรมหรือไอเดียแปลกใหม่ของคุณจะสร้างมูลค่าได้สูง",
  "ชาวราศีมีนมีความเห็นอกเห็นใจผู้อื่น มีจินตนาการกว้างไกล มีเซนส์หรือลางสังหรณ์ที่แม่นยำ ช่วงนี้ดวงชะตาเปิดรับพลังงานบวกอย่างล้นหลาม มีเกณฑ์ได้โชคลาภจากการทำบุญ สิ่งศักดิ์สิทธิ์ให้พรนำทาง หรือพบทางสว่างในปัญหาที่กำลังเผชิญอยู่"
];

const THAKSA_PLANET_COLORS = [
  { name: "สีแดง", css: "#C62828" },
  { name: "สีเหลือง/สีครีม", css: "#F5C840" },
  { name: "สีชมพู", css: "#E91E63" },
  { name: "สีเขียว", css: "#2E7D32" },
  { name: "สีม่วง/สีดำ", css: "#4A148C" },
  { name: "สีส้ม/สีน้ำตาล", css: "#EF6C00" },
  { name: "สีเทา/สีบรอนซ์", css: "#616161" },
  { name: "สีน้ำเงิน/สีฟ้า", css: "#1565C0" }
];

const SIIMSI_PROPHECIES = [
  {
    numTH: "๑",
    title: "เทพประทานพร (Auspicious Beginning)",
    poem: "ใบที่หนึ่งชี้ชัดทัศนา เปรียบดั่งฟ้าเปิดทางสว่างไสว อุปสรรคขวากหนามจะปลาตไป คิดสิ่งใดสมหวังดั่งใจปอง",
    reading: "ดวงชะตาของท่านในวันนี้จัดว่าดีเยี่ยมเป็นอย่างยิ่ง เปรียบเสมือนท้องฟ้าที่มืดครึ้มได้เปิดออกให้แสงทองส่องสว่าง อุปสรรคหรือความเครียดสะสมจะเริ่มคลี่คลายตัวลงอย่างเห็นได้ชัด การริเริ่มงานใหม่ การลงทุน หรือการติดต่อเจรจาใด ๆ จะได้รับผลตอบรับที่ดีและมีผู้อุปถัมภ์ช่วยเหลือโดยตรง",
    luckyNum: "1, 9, 8"
  },
  {
    numTH: "๒",
    title: "รุ่งเรืองก้าวหน้า (Growth & Progress)",
    poem: "ใบที่สองต้องจิตคิดทำการ โชคบันดาลรุ่งเรืองและก้าวหน้า การงานดีเงินเดินสะพัดตา วาสนาหนุนนำค้ำเชิดชู",
    reading: "ความเหน็ดเหนื่อยและความพยายามสะสมของท่านกำลังจะสัมฤทธิ์ผลอย่างงดงาม ชะตาชีวิตอยู่ในช่วงขาขึ้นอย่างมั่นคง โดยเฉพาะในเรื่องหน้าที่การงานและการเรียนที่จะได้รับการชื่นชมหรือได้รับความไว้วางใจให้รับผิดชอบงานสำคัญ การเงินสะพัด ค้าขายได้กำไรงาม",
    luckyNum: "2, 5, 6"
  },
  {
    numTH: "๓",
    title: "ลาภลอยทวีคูณ (Unexpected Wealth)",
    poem: "ใบที่สามเปรียบดั่งลาภลอยฟ้า ทรัพย์หลั่งไหลเข้ามาบ่ขาดสาย ทั้งโชคดีโชคเลิศเกิดมากมาย กายสบายใจรื่นชื่นชีวัน",
    reading: "เด่นชัดเรื่องลาภผลพูนทวี มีเกณฑ์ได้รับโชคดีหรือทรัพย์สินเงินทองแบบไม่คาดฝัน หรือมีโอกาสได้รับเงินตกเบิก เงินก้อนพิเศษ หรือของขวัญถูกใจ ชะตากำลังเปิดรับทรัพย์สินทางบวก การลงทุนระยะสั้นจะให้ผลตอบแทนงดงาม ควรหมั่นทำทานบริจาคเพื่อเสริมบารมีเพิ่มพูน",
    luckyNum: "3, 8, 4"
  },
  {
    numTH: "๔",
    title: "เมตตามหานิยม (Love & Harmony)",
    poem: "ใบที่สี่มีเสน่ห์เมตตาจิต ใครพบคิดรักใคร่เสน่หา คนรุมล้อมพร้อมใจเอื้ออารี ยอดคนดีคู่ครองปองเคียงกาย",
    reading: "พลังเสน่ห์และเมตตามหานิยมทำงานเต็มที่ในชะตาชีวิตท่านวันนี้ การเจรจาขอความช่วยเหลือหรือสมัครงานจะได้รับความเห็นใจและเมตตาเป็นพิเศษ ด้านความสัมพันธ์รักใคร่เข้าเกณฑ์สมดุล คนโสดมีโอกาสพบคนถูกใจที่มีทัศนคติตรงกัน คนมีคู่จะเกื้อหนุนและเข้าใจกันดียิ่งขึ้น",
    luckyNum: "4, 6, 2"
  },
  {
    numTH: "๕",
    title: "ชนะอุปสรรค (Overcoming Obstacles)",
    poem: "ใบที่ห้าผจญภัยในขวากหนาม แต่พยายามจักช่วยให้พ้นภัย อย่าท้อแท้แรงกายและแรงใจ ผลสุดท้ายมีชัยได้ชื่นชม",
    reading: "ช่วงนี้ท่านอาจเผชิญกับการท้าทาย ปัญหาเฉพาะหน้า หรือความกดดันจากคนรอบข้าง ขอให้อย่าเพิ่งท้อแท้หรือตื่นตระหนก เพราะนี่คือเกณฑ์ทดสอบความแข็งแกร่งของชะตาชีวิต หากท่านมีสติและอดทน มุ่งมั่นแก้ไขทีละจุด ท่านจะสามารถฟันฝ่าและชนะอุปสรรคได้อย่างสง่างาม",
    luckyNum: "5, 1, 7"
  },
  {
    numTH: "๖",
    title: "ปัญญาพารุ่ง (Intellect & Wisdom)",
    poem: "ใบที่หกตกปัญญาเลิศล้ำ เรียนรู้ทำสิ่งใดก็เข้าใจ ความคิดแจ่มใสปัญญาพารุ่งเรือง ชัยชนะประเทืองอยู่ไม่ไกล",
    reading: "ดวงสติปัญญาและไหวพริบทำงานโดดเด่นสูงสุด เหมาะอย่างยิ่งแก่การทบทวนตำรา สอบแข่งขัน นำเสนองานเขียน วางแผนกลยุทธ์ หรือการแก้ปัญหาที่ซับซ้อน ไอเดียสร้างสรรค์จะแล่นฉิวและสามารถนำไปต่อยอดสร้างอาชีพหรือความโดดเด่นในกลุ่มเพื่อนร่วมงานได้ดีเยี่ยม",
    luckyNum: "6, 9, 3"
  },
  {
    numTH: "๗",
    title: "อดทนเก็บออม (Patience & Wealth)",
    poem: "ใบที่เจ็ดเสร็จสมอารมณ์หมาย แต่ต้องกายอดทนและเพียรสร้าง อย่าใจร้อนด่วนได้ในทุกทาง ทรัพย์สินอ่างเงินถังยังรอคุณ",
    reading: "ความสำเร็จที่มั่นคงถาวรต้องการเวลาและการเพียรสร้างอย่างสม่ำเสมอ แนะนำให้ท่านดำเนินชีวิตแบบค่อยเป็นค่อยไป หลีกเลี่ยงการร่วมทุนที่มีความเสี่ยงสูงหรือการตัดสินใจเรื่องเงินก้อนโตด้วยความรีบร้อน การประหยัดอดออมและสะสมทุนรอนในเวลานี้จะส่งผลดีเยี่ยมในอนาคตอันใกล้",
    luckyNum: "7, 4, 8"
  },
  {
    numTH: "๘",
    title: "มิตรสหายเกื้อหนุน (Supportive Friends)",
    poem: "ใบที่แปดแวดล้อมด้วยกัลยาณมิตร คอยชี้ทิศช่วยเหลือเกื้อหนุนใจ ไปหนใดมีแต่คนรักใคร่ ปลอดโรคภัยผาสุกสถาพร",
    reading: "ดวงการช่วยเหลือและกัลยาณมิตรดีเด่นเป็นพิเศษ ท่านจะได้รับการสนับสนุนเกื้อกูลจากคนรอบข้าง มิตรสหาย หรือเพื่อนร่วมงานที่คอยช่วยแนะนำแนวทางดี ๆ รวมถึงการขจัดปัญหาตกค้างให้หมดไป สุขภาพร่างกายแข็งแรงกระปรี้กระเปร่า พลังใจเต็มเปี่ยมพร้อมลุยงานใหญ่",
    luckyNum: "8, 5, 2"
  },
  {
    numTH: "๙",
    title: "สงบสยบเคลื่อนไหว (Mindfulness & Peace)",
    poem: "ใบที่เก้าเล่าขานงานสงบ นิ่งสยบความเคลื่อนไหวในใจตน หลีกเลี่ยงข้อพิพาทความสับสน พ้นภัยพ้นเคราะห์ร้ายกายสำราญ",
    reading: "วันนี้แนะนำให้เน้นความสงบเงียบ ปล่อยวาง และหลีกเลี่ยงการโต้เถียงหรือปะทะอารมณ์กับใครโดยไม่จำเป็น การเก็บตัวเงียบ ๆ วางแผนชีวิตส่วนตัว หรือหมั่นสวดมนต์นั่งสมาธิจะช่วยชำระล้างพลังงานลบและนำความมั่นคงมาสู่จิตใจ แคล้วคลาดปลอดภัยจากภัยร้ายทั้งปวง",
    luckyNum: "9, 0, 1"
  },
  {
    numTH: "๑๐",
    title: "พลังชีวิตใหม่ (Rebirth & Energy)",
    poem: "ใบที่สิบหยิบยื่นพลังชีวิต การอุทิศตนสร้างสิ่งดีหนุนนำ ก้าวข้ามพ้นเงาดำความช้ำใจ เริ่มวันใหม่สดใสและเบิกบาน",
    reading: "ถึงเวลาทิ้งความเศร้าหมอง ความกังวล หรืออดีตที่ไม่สมหวังไปเบื้องหลัง ชะตาชีวิตกำลังก้าวเข้าสู่รอบใหม่ที่เปี่ยมไปด้วยพลังชีวิตที่สดชื่น โอกาสดีทางหน้าที่การงาน ความสัมพันธ์ หรือสุขภาพที่ดีขึ้นกำลังรอท่านอยู่ จงเปิดใจรับสิ่งใหม่และยิ้มรับพลังงานเชิงบวกในทุกเช้าวันใหม่",
    luckyNum: "1, 0, 5"
  },
  {
    numTH: "๑๑",
    title: "วาสนาหนุนนำ (Destiny & Luck)",
    poem: "ใบที่สิบเอ็ดเก่งกล้าชะตาดี วาสนาบารมีมาหนุนส่ง เทพเทวาปกปักรักษาตรง ปลอดภัยพะวงทรงตัวมั่นคง",
    reading: "ดวงชะตามีเกณฑ์แคล้วคลาดจากอุปสรรคและภัยอันตรายอย่างอัศจรรย์ ด้วยบุญบารมีเดิมและกรรมดีที่ท่านเคยสร้างสมมา เทพเทวดาคอยคุ้มครองรักษาทิศทางชีวิตให้ราบรื่น ปลอดภัยจากภยันตรายและศัตรูหมู่มาร ให้มุ่งมั่นทำความดีและกตัญญูต่อไป ชีวิตจะเจริญรุ่งเรืองแน่นอน",
    luckyNum: "1, 2, 9"
  },
  {
    numTH: "๑๒",
    title: "ความสำเร็จสมบูรณ์ (Ultimate Fulfillment)",
    poem: "ใบที่สิบสองครองโชคสำเร็จเสร็จ สมความเพียรสมสุขในชีวิต ครอบครัวร่มเย็นสุขสถิต พรอันสัมฤทธิ์จงเป็นของท่านเทอญ",
    reading: "ถือเป็นใบเซียมซีที่มงคลสูงสุดในชุดนี้ บ่งบอกถึงความสำเร็จอย่างเต็มภาคภูมิและสมบูรณ์แบบ ทั้งในเรื่องการงานที่จะได้รับชื่อเสียงเกียรติยศ การเงินไหลมาเทมามั่นคง และชีวิตครอบครัวที่ร่มเย็นเป็นสุข ไร้ทุกข์โศกโรคภัย พรอันประเสริฐทุกประการจะสัมฤทธิ์แก่ท่านโดยพลัน",
    luckyNum: "8, 9, 7"
  }
];

const SIIMSI_PROPHECIES_GUANYIN = [
  {
    numTH: "๑",
    title: "มหาเมตตาอารี (Supreme Compassion)",
    poem: "ใบที่หนึ่งพึงจิตกตัญญู เมตตาคู่คุณธรรมค้ำเกื้อหนุน พระแม่กวนอิมประทานอุ่นไอคุณ เคราะห์กรรมขุ่นพ้นผ่านสำราญใจ",
    reading: "คำทำนายชี้ชัดว่า ท่านได้รับพระเมตตาจากพระโพธิสัตว์กวนอิม จิตใจที่เปี่ยมด้วยความเมตตาและกตัญญูจะนำพาความราบรื่นมาสู่ชีวิต ปัญหาที่เคยติดขัดจะได้รับความอุปถัมภ์จากผู้ใหญ่ที่มีความเมตตา การเงินการงานราบรื่นดี",
    luckyNum: "1, 9, 5"
  },
  {
    numTH: "๒",
    title: "ความสงบเย็นใจ (Inner Peace)",
    poem: "ใบที่สองส่องสว่างทางสงบ จิตสงบพบสุขเกษมศานต์ ดั่งน้ำทิพย์ชโลมใจในดวงมาลย์ ทุกภัยพาลพินาศหลีกพ้นตัว",
    reading: "เตือนใจให้รักษาความสงบภายในจิตใจ หลีกเลี่ยงการใช้อารมณ์หรือการปะทะคารม ความสงบเย็นเหมือนน้ำทิพย์จะทำให้ท่านมองเห็นแนวทางแก้ไขอุปสรรคได้อย่างมีสติ เรื่องร้ายจะกลายเป็นดี การงานมีเกณฑ์ก้าวหน้าจากความนิ่งสุขุม",
    luckyNum: "2, 8, 4"
  },
  {
    numTH: "๓",
    title: "ปล่อยวางพ้นทุกข์ (Letting Go & Relief)",
    poem: "ใบที่สามตามวิถีปล่อยวางจิต สิ่งที่ติดค้างใจจงถอดถอน ฟ้าหลังฝนงดงามดั่งขจร ความเดือดร้อนมลายสิ้นเป็นศิริมงคล",
    reading: "ช่วงนี้ชะตาชีวิตท่านกำลังจะหลุดพ้นจากพันธนาการของความกังวลใจ สิ่งที่เคยสร้างความทุกข์หรือตึงเครียดจะคลี่คลายลงเมื่อท่านรู้จักปล่อยวาง ทรัพย์สินเงินทองจะเริ่มไหลเวียนคล่องตัวขึ้น มีเกณฑ์ได้ลาภจากการทำบุญสุนทาน",
    luckyNum: "3, 6, 9"
  },
  {
    numTH: "๔",
    title: "วาจาเป็นเอก (Mindful Speech)",
    poem: "ใบที่สี่วาจาพาสร้างมิตร เอื้อความคิดมีสติคอยกำกับ พูดจาดีสิ่งดีจักมารับ ลาภยศยับเยินไปหากพาลชน",
    reading: "การสื่อสารและวาจาของท่านในวันนี้เป็นสิ่งสำคัญยิ่ง ควรใชวาจาที่สุภาพ อ่อนหวาน และเปี่ยมด้วยความหวังดี จะช่วยดึงดูดกัลยาณมิตรและโอกาสดี ๆ ในหน้าที่การงานเข้ามา การเจรจาต่อรองเรื่องสำคัญจะประสบผลสำเร็จอย่างงดงาม",
    luckyNum: "4, 1, 7"
  },
  {
    numTH: "๕",
    title: "บารมีทานหนุน (Charity & Merit)",
    poem: "ใบที่ห้าสร้างสมบุญบารมี ทานบารมีเกื้อหนุนหนทางใส ยิ่งให้ไปยิ่งได้กลับหลั่งไหลมา กายและใจผ่องแผ้วไร้ราคี",
    reading: "ดวงชะตาเด่นเรื่องการทำบุญสร้างกุศล การแบ่งปันหรือช่วยเหลือผู้ตกทุกข์ได้ยากในวันนี้จะช่วยเสริมดวงชะตาของท่านให้แข็งแกร่งยิ่งขึ้น สิ่งดี ๆ ที่ท่านเคยทำไว้จะส่งผลย้อนกลับมาหนุนนำในรูปของโชคลาภและการงานที่ราบรื่นอย่างไม่คาดฝัน",
    luckyNum: "5, 9, 2"
  },
  {
    numTH: "๖",
    title: "ปัญญาญาณสว่าง (Spiritual Wisdom)",
    poem: "ใบที่หกตกดวงปัญญาญาณ มองทุกสิ่งตามจริงไม่กังขา สติมั่นปัญญาเลิศเกิดนำพา พบทิศทางล้ำค่าในชีวี",
    reading: "ดวงสติปัญญาและทางธรรมสว่างไสว ท่านจะเกิดความเข้าใจอย่างลึกซึ้งในปัญหาที่เคยแก้ไม่ตก ความคิดสร้างสรรค์และการตัดสินใจในวันนี้จะมีความถูกต้องและแม่นยำสูง เหมาะแก่การริเริ่มสิ่งใหม่หรือวางแผนระยะยาวให้กับชีวิต",
    luckyNum: "6, 3, 8"
  },
  {
    numTH: "๗",
    title: "อดทนเพียรสร้าง (Patience & Compassion)",
    poem: "ใบที่เจ็ดเสร็จสมดังจิตมุ่ง แต่ต้องปรุงความอดทนไม่ย่อท้อ เหมือนดอกบัวชูช่อช้าแต่พอ ดีงามหนอดอกใบบานสะพรั่งตา",
    reading: "เปรียบดั่งดอกบัวที่ต้องอาศัยเวลาในการเติบโตพ้นน้ำแล้วบานสะพรั่ง ความสำเร็จของท่านในระยะนี้ต้องอาศัยความเพียรพยายามและความอดทนอย่างสูง อย่าใจร้อนด่วนได้ในการทำงานหรือการลงทุน ความสม่ำเสมอจะนำพาผลลัพธ์อันยิ่งใหญ่และยั่งยืนมาให้",
    luckyNum: "7, 0, 5"
  },
  {
    numTH: "๘",
    title: "ภัยพาลแคล้วคลาด (Protection & Safety)",
    poem: "ใบที่แปดแวดล้อมด้วยโพธิสัตว์ คอยขจัดเสนียดจัญไรให้พ้นทิศ ศัตรูพ่ายกลับกลายเป็นมิ่งมิตร ปลอดภัยพ้นวิกฤตชื่นชีวัน",
    reading: "ท่านอยู่ภายใต้การคุ้มครองปกปักรักษาของพระแม่กวนอิมและสิ่งศักดิ์สิทธิ์ ภยันตรายหรือความประสงค์ร้ายจากผู้อื่นจะทำอะไรท่านไม่ได้ ศัตรูหรือคู่แข่งจะแพ้ภัยตัวเองหรือเปลี่ยนใจมาเป็นมิตร แคล้วคลาดปลอดภัยจากโรคภัยไข้เจ็บทั้งปวง",
    luckyNum: "8, 2, 6"
  },
  {
    numTH: "๙",
    title: "ครอบครัวร่มเย็น (Family Harmony)",
    poem: "ใบที่เก้าเล่าความตามในบ้าน ครอบครัวขานรักใคร่ไม่มีสอง ความขัดแย้งคลี่คลายตามทำนอง มีเงินทองล้นเรือนสุขสถาพร",
    reading: "เน้นย้ำถึงความอบอุ่นร่มเย็นในครอบครัวและความสัมพันธ์กับคนใกล้ชิด ความเข้าใจผิดหรือข้อขัดแย้งในบ้านจะได้รับการปรับความเข้าใจและกลับมารักใคร่กลมเกลียวกันยิ่งขึ้น บ้านที่อบอุ่นจะเป็นแหล่งพลังงานที่ดีที่สุดในการขับเคลื่อนความสำเร็จและการเงินของท่าน",
    luckyNum: "9, 4, 1"
  },
  {
    numTH: "๑๐",
    title: "โชคลาภหลั่งไหล (Flow of Blessings)",
    poem: "ใบที่สิบหยิบจับอะไรดี โชคทวีทรัพย์สินหลั่งไหลหนุน ดั่งสายน้ำทิพย์เย็นช่วยค้ำจุน วาสนาเกื้อหนุนก้าวหน้าไกล",
    reading: "ดวงการเงินและโชคลาภหลั่งไหลเข้ามาอย่างราบรื่นดั่งสายน้ำทิพย์ มีเกณฑ์ได้รับข่าวดีเรื่องเงินทอง ทรัพย์สิน หรือข้อตกลงทางธุรกิจที่น่าพึงพอใจ การค้าขายมีกำไรดี ผู้ที่ทำงานประจำจะมีโอกาสได้รับความดีความชอบและก้าวหน้าในตำแหน่งหน้าที่",
    luckyNum: "1, 8, 3"
  },
  {
    numTH: "๑๑",
    title: "ความเพียรสำเร็จ (Diligent Success)",
    poem: "ใบที่สิบเอ็ดเหนื่อยยากพ้นผ่าน พรบันดาลสำเร็จเสร็จสมหมาย ความเพียรกล้าฝ่าฟันไม่คลอนแคลน ร่มเย็นแสนสุขสมอารมณ์ปอง",
    reading: "ความพยายามอย่างไม่ย่อท้อของท่านในช่วงที่ผ่านมาบัดนี้ถึงเวลาออกดอกออกผลแล้ว ความเหน็ดเหนื่อยจะเปลี่ยนเป็นความสำเร็จอันน่าภาคภูมิใจ ชะตาชีวิตกำลังปรับตัวเข้าสู่ช่วงที่มีความเสถียรมั่นคงและร่มเย็นเป็นสุข ขอให้รักษาคุณความดีนี้ไว้สืบไป",
    luckyNum: "2, 7, 9"
  },
  {
    numTH: "๑๒",
    title: "ศิริมงคลสูงสุด (Supreme Auspiciousness)",
    poem: "ใบที่สิบสองครองธรรมล้ำยอด บุญตลอดรอดพ้นทุกข์โศกหาย ครอบครัวสุขการงานเด่นเนตรเพร่งพราย รับพรทิพย์สุขสบายชั่วนิรันดร์",
    reading: "เป็นใบเซียมซีที่เป็นศิริมงคลสูงสุดของพระแม่กวนอิม ชี้ถึงชีวิตที่เพียบพร้อมไปด้วยศีลธรรมและความสงบสุข ทั้งหน้าที่การงาน ความรัก สุขภาพ และครอบครัวจะร่มเย็นสุขสำราญ ปราศจากความทุกข์โศกและสิ่งอัปมงคลทั้งปวง พรอันประเสริฐสัมฤทธิ์แก่ชะตาชีวิตท่านอย่างแท้จริง",
    luckyNum: "9, 8, 7"
  }
];

const SIIMSI_PROPHECIES_CITYPILLAR = [
  {
    numTH: "๑",
    title: "รากฐานมั่นคง (Solid Foundation)",
    poem: "ใบที่หนึ่งพึงชี้ปฐพีปึกแผ่น รากฐานแน่นแกร่งกล้าดั่งผาหิน ชีวิตรุ่งเรืองรุดพ้นมลทิน ทรัพย์แผ่นดินหลั่งไหลไม่ขาดแคลน",
    reading: "คำทำนายชี้ชัดว่า ชะตาชีวิตของท่านในระยะนี้จะมีความมั่นคงเป็นปึกแผ่นสูงสุด รากฐานการงานหรือธุรกิจที่สร้างมาจะเริ่มเห็นผลลัพธ์ที่แข็งแกร่ง อุปสรรคใด ๆ ก็ไม่สามารถทำลายความมุ่งมั่นของท่านได้ การเงินมั่นคงเป็นระบบดี",
    luckyNum: "1, 0, 8"
  },
  {
    numTH: "๒",
    title: "ยศถาบรรดาศักดิ์ (Promotion & Honor)",
    poem: "ใบที่สองส่องทางสง่างาม ยศเกียรติยามเลื่อนขั้นหน้าหน้าที่ ผู้ใหญ่หนุนนำช่วยด้วยปรานี บารมีแผ่กว้างทางเจริญ",
    reading: "เด่นชัดในเรื่องหน้าที่การงานและการยอมรับ มีเกณฑ์ได้รับการสนับสนุนจากผู้ใหญ่หรือผู้มีอำนาจ ได้เลื่อนขั้น เลื่อนตำแหน่ง หรือได้รับผิดชอบงานสำคัญที่มีเกียรติ ชะตาชีวิตได้รับการเชิดชูรอบทิศ",
    luckyNum: "2, 5, 9"
  },
  {
    numTH: "๓",
    title: "โชคลาภสถาพร (Enduring Wealth)",
    poem: "ใบที่สามตามมาโชคลาภล้น เงินและทองกองก้นทวีผล การลงทุนค้าขายไม่อับจน ลาภผลดลสุขล้ำค้ำจุนกาย",
    reading: "ดวงการเงินและโชคลาภมีความเสถียรและงอกเงยอย่างสม่ำเสมอ การค้าขายหรือการลงทุนระยะยาวจะผลิดอกออกผลอย่างงดงาม ชะตาเปิดรับทรัพย์จากทุกทิศทาง มีรายได้เข้ามาเพิ่มขึ้นและสามารถเก็บออมได้เป็นปึกแผ่น",
    luckyNum: "3, 7, 1"
  },
  {
    numTH: "๔",
    title: "ปลอดภัยแคล้วคลาด (Absolute Protection)",
    poem: "ใบที่สี่สิ่งศักดิ์สิทธิ์สถิตรักษา เทวาช่วยป้องปัดขจัดภัย ศัตรูหมู่มารไม่กล้ากรายกล้ำ ไปหนใดแคล้วคลาดปลอดภัยดี",
    reading: "ท่านได้รับการคุ้มครองดูแลอย่างเข้มแข็งจากองค์พระหลักเมืองและเทวดาอารักษ์ประจำเมือง สิ่งชั่วร้าย เสนียดจัญไร หรือผู้ที่คิดร้ายจะแพ้ภัยตัวเองและถอยห่างไป การเดินทางไกลหรือใกล้จะราบรื่น ปลอดภัยไร้กังวล",
    luckyNum: "4, 9, 6"
  },
  {
    numTH: "๕",
    title: "ก้าวหน้ามั่นคง (Steady Progress)",
    poem: "ใบที่ห้าท้าทายแต่ไม่ถอย ค่อยเป็นค่อยไปอย่างใจหวัง ความเพียรจะนำพาสู่พลัง ปลายทางดังสมปองต้องชะตา",
    reading: "แม้ชะตาชีวิตจะมีภารกิจที่ท้าทายเข้ามา แต่ความมั่นคงและรอบคอบของท่านจะช่วยให้ผ่านพ้นไปได้ด้วยดี ขอให้ก้าวเดินด้วยความสติ ไม่รีบร้อน แล้วความสำเร็จที่ยิ่งใหญ่และถาวรจะรออยู่ที่ปลายทางอย่างแน่นอน",
    luckyNum: "5, 2, 8"
  },
  {
    numTH: "๖",
    title: "กัลยาณมิตรดี (Great Connections)",
    poem: "ใบที่หกตกมิตรเกื้อหนุนช่วย พันธมิตรชูช่วยพารุ่งเรือง เจรจาค้าขายได้ทั่วเมือง ทุกย่างก้าวรุ่งเรืองเฟื่องฟูใจ",
    reading: "ดวงการเจรจาและการสร้างความสัมพันธ์ดีเยี่ยม มีเกณฑ์ได้รับความช่วยเหลือจากกัลยาณมิตรหรือหุ้นส่วนที่มีความซื่อสัตย์ การติดต่อประสานงานกับราชการหรือองค์กรใหญ่จะได้รับความสะดวกและสำเร็จลุล่วงด้วยดี",
    luckyNum: "6, 1, 4"
  },
  {
    numTH: "๗",
    title: "ชนะคดีความ (Victory over Disputes)",
    poem: "ใบที่เจ็ดเสร็จเรื่องที่เคืองขุ่น คดีความเกื้อหนุนสิ้นกังขา ความจริงปรากฏดั่งศาสตรา ชนะศัตรูถ้วนหน้าพ้นมลทิน",
    reading: "ใครที่มีปัญหาความขัดแย้ง ข้อพิพาท หรือคดีความติดค้าง ในวันนี้ดวงชะตาชี้ว่าจะได้รับการคลี่คลายในทางที่ดี ความยุติธรรมจะเข้าข้างท่าน อุปสรรคและความอึดอัดใจต่าง ๆ จะสลายไป นำความสบายใจกลับมา",
    luckyNum: "7, 8, 2"
  },
  {
    numTH: "๘",
    title: "ซื้อขายที่ดิน (Property & Real Estate)",
    poem: "ใบที่แปดแผ่นดินให้โชคใหญ่ ซื้อขายทรัพย์สินใดสมประสงค์ ที่ดินบ้านช่องงามมั่นคง เกียรติยศส่งสูงล้ำค้ำชะตา",
    reading: "โดดเด่นเป็นพิเศษสำหรับผู้ที่ทำงานเกี่ยวข้องกับอสังหาริมทรัพย์ ที่ดิน บ้าน หรือการย้ายที่อยู่อาศัย มีเกณฑ์ได้รับข่าวดีเรื่องการซื้อขายทรัพย์สินชิ้นใหญ่ หรือได้รับความมั่นคงในเรื่องที่อยู่อาศัยที่เป็นปึกแผ่นขึ้น",
    luckyNum: "8, 3, 0"
  },
  {
    numTH: "๙",
    title: "สติปัญญาหลักแหลม (Sharp Wisdom)",
    poem: "ใบที่เก้าเล่าปัญญาเฉียบแหลม คิดการใดแจ่มแจ้งไม่กังขา แก้ไขปัญหาพารุ่งเรือง มีชื่อเสียงเลื่องลือไกลทั่วแดน",
    reading: "ท่านมีวิสัยทัศน์และการตัดสินใจที่เฉียบคมในวันนี้ ความคิดและไอเดียของท่านจะได้รับการยอมรับอย่างกว้างขวาง สามารถแก้ปัญหาเฉพาะหน้าที่มีความซับซ้อนได้อย่างน่าทึ่ง เหมาะแก่การวางแผนอนาคตหรืองานใหญ่",
    luckyNum: "9, 5, 3"
  },
  {
    numTH: "๑๐",
    title: "ร่มเย็นเป็นสุข (Peaceful Abode)",
    poem: "ใบที่สิบหยิบบ้านวิมานแก้ว ครอบครัวแพร้วเพริดสุขสนุกสนาน ไร้ความทุกข์โศกเศร้าในดวงมาลย์ ทุกข์ภัยพาลสลายสิ้นถิ่นร่มเย็น",
    reading: "ครอบครัวและที่อยู่อาศัยของท่านจะร่มเย็นเป็นสุข ไร้ความขัดแย้ง คนในบ้านรักใคร่สามัคคีและช่วยเหลือเกื้อกูลกันเป็นอย่างดี สุขภาพร่างกายของคนในครอบครัวแข็งแรงแคล้วคลาด ปราศจากโรคภัยเบียดเบียน",
    luckyNum: "1, 4, 7"
  },
  {
    numTH: "๑๑",
    title: "สำเร็จยิ่งใหญ่ (Grand Success)",
    poem: "ใบที่สิบเอ็ดเหนื่อยยากแต่แรกเริ่ม ปลายทางเพิ่มสุขล้ำความสำเร็จ เกียรติยศชื่อเสียงไร้รอยตะเข็บ มั่นคงดั่งเสาเอกของแผ่นดิน",
    reading: "แม้ว่าหนทางในช่วงแรกอาจจะต้องเผชิญความเหน็ดเหนื่อยหรือต้องลงแรงมาก แต่ผลลัพธ์ปลายทางจะงดงามและยั่งยืนอย่างยิ่ง ประสบความสำเร็จในระดับที่สร้างชื่อเสียงและเกียรติยศ มั่นคงถาวรดั่งเสาหลักของชีวิต",
    luckyNum: "2, 8, 9"
  },
  {
    numTH: "๑๒",
    title: "ศิริมงคลอเนกอนันต์ (Ultimate Prosperity & Blessings)",
    poem: "ใบที่สิบสองครองโชคบารมีล้น ทุกข์ภัยพ้นสุขล้ำคำอธิษฐาน พระเสื้อเมืองทรงเมืองโปรดประทาน พรอันแสนวิมานแด่ตัวคุณ",
    reading: "ถือเป็นใบที่มงคลและทรงพลังที่สุดในชุดศาลหลักเมือง บ่งบอกถึงความสุขความเจริญอย่างรอบด้าน ทั้งความมั่นคงในอาชีพการงาน การเงินที่สะพัดและมั่นคง ความรักที่ยั่งยืน และครอบครัวที่อบอุ่น ได้รับพรศักดิ์สิทธิ์จากพระเสื้อเมืองทรงเมืองคุ้มครอง",
    luckyNum: "9, 9, 8"
  }
];


// ── FREE HOROSCOPE RENDER LOGIC ──────────────────────────────────────────
window.renderFreeHoroscope = function() {
  const noDataView = document.getElementById('free-no-data-view');
  const dashboardView = document.getElementById('free-dashboard-view');
  if (!noDataView || !dashboardView) return;
  
  if (!nData) {
    noDataView.style.display = 'block';
    dashboardView.style.display = 'none';
    return;
  }
  
  noDataView.style.display = 'none';
  dashboardView.style.display = 'block';
  
  // Initialize E-Siimsi deity view (checks daily limits and loads saved draws)
  if (window.selectSiimsiDeity) {
    window.selectSiimsiDeity(activeSiimsiDeity);
  }
  
  // 1. Welcome Title
  const welcomeTitle = document.getElementById('free-welcome-title');
  if (welcomeTitle) {
    welcomeTitle.textContent = `ยินดีต้อนรับสู่คำทำนายเฉพาะบุคคลของ คุณ${nData.name}`;
  }
  
  // 2. Lagna Analysis
  const lagnaSp = signPos(nData.pos.lagna);
  const lagnaIdx = lagnaSp.si; // 0 = Aries, 1 = Taurus, ...
  
  const badge = document.getElementById('free-lagna-badge');
  const desc = document.getElementById('free-lagna-desc');
  if (badge) badge.textContent = `ลัคนาราศี${SIGNS_TH[lagnaIdx]}`;
  if (desc) desc.textContent = ZODIAC_READINGS[lagnaIdx] || 'ไม่พบคำทำนายราศีเกิด';
  
  // 3. Yearly Thaksa Guide
  const thaksaMeta = document.getElementById('free-thaksa-meta');
  
  // Compute birth day and age (re-use same logic from renderThaksa)
  const by = birthYear;
  const bmo = birthMonth;
  const bd = birthDay;
  const bh = birthHour;
  const bmn = birthMin;
  
  const calendarDate = new Date(by, bmo - 1, bd);
  const calWeekday = calendarDate.getDay();
  let astroDay = calWeekday;
  if (bh < 6) {
    astroDay = (calWeekday + 6) % 7;
  }
  let thaksaDay = astroDay;
  if (astroDay === 3) {
    if (bh < 6 || bh >= 18) {
      thaksaDay = 7; // Wednesday Night (Rahu)
    }
  }
  
  const weekdayToStartIndex = [0, 1, 2, 3, 5, 7, 4, 6];
  const birthStartIndex = weekdayToStartIndex[thaksaDay];
  
  // Compute transit age
  let currentAge = 1;
  const isTransitActive = showT && tData;
  if (isTransitActive) {
    const tYearBE = parseInt(document.getElementById('tYear').value);
    const ty = tYearBE - 543;
    const tmo = parseInt(document.getElementById('tMonth').value);
    const td = parseInt(document.getElementById('tDay').value);
    
    currentAge = ty - by;
    const birthInTransitYear = new Date(ty, bmo - 1, bd, bh, bmn);
    const transitDateTime = new Date(ty, tmo - 1, td, 12, 0); // use mid-day for comparison
    if (transitDateTime > birthInTransitYear) {
      currentAge += 1;
    }
    currentAge = Math.max(1, currentAge);
  } else {
    // default to current age based on current local date
    const today = new Date();
    currentAge = today.getFullYear() - by;
    const birthThisYear = new Date(today.getFullYear(), bmo - 1, bd, bh, bmn);
    if (today > birthThisYear) {
      currentAge += 1;
    }
    currentAge = Math.max(1, currentAge);
  }
  
  const WEEKDAYS_TH = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธกลางวัน', 'วันพฤหัส', 'วันศุกร์', 'วันเสาร์', 'วันพุธกลางคืน'];
  if (thaksaMeta) {
    thaksaMeta.textContent = `วันเกิดของคุณ: ${WEEKDAYS_TH[thaksaDay]} | อายุย่าง: ${currentAge} ปี`;
  }
  
  // Compute yearly starting index (บริวารจร)
  const transitStartIndex = (birthStartIndex + (currentAge - 1)) % 8;
  
  // Sri (ศรี) is at index 3 clockwise from starting index
  const sriPlanetIdx = (transitStartIndex + 3) % 8;
  // Kali (กาลกิณี) is at index 7 clockwise from starting index
  const kaliPlanetIdx = (transitStartIndex + 7) % 8;
  
  const THAKSA_PLANETS = ['๑', '๒', '๓', '๔', '๗', '๕', '๘', '๖'];
  const PLANET_NAMES_TH = ['๑ (อาทิตย์)', '๒ (จันทร์)', '๓ (อังคาร)', '๔ (พุธ)', '๗ (เสาร์)', '๕ (พฤหัส)', '๘ (ราหู)', '๖ (ศุกร์)'];
  
  const sriColor = THAKSA_PLANET_COLORS[sriPlanetIdx];
  const kaliColor = THAKSA_PLANET_COLORS[kaliPlanetIdx];
  
  const sriEl = document.getElementById('free-thaksa-sri');
  const kaliEl = document.getElementById('free-thaksa-kali');
  
  if (sriEl) {
    sriEl.innerHTML = `<span class="thaksa-color-pill" style="background: ${sriColor.css}; border: 1px solid rgba(255,255,255,0.3);">${PLANET_NAMES_TH[sriPlanetIdx]} - ${sriColor.name}</span>`;
  }
  if (kaliEl) {
    kaliEl.innerHTML = `<span class="thaksa-color-pill" style="background: ${kaliColor.css}; border: 1px solid rgba(255,255,255,0.3);">${PLANET_NAMES_TH[kaliPlanetIdx]} - ${kaliColor.name}</span>`;
  }
  
  const goodColorsEl = document.getElementById('free-thaksa-colors-good');
  const badColorsEl = document.getElementById('free-thaksa-colors-bad');
  
  // Get helpful colors (Sri, Dech = index 2, Montri = index 6)
  const dechPlanetIdx = (transitStartIndex + 2) % 8;
  const dechColor = THAKSA_PLANET_COLORS[dechPlanetIdx];
  
  if (goodColorsEl) {
    goodColorsEl.textContent = `${sriColor.name} (หนุนทรัพย์), ${dechColor.name} (หนุนอำนาจบารมี)`;
  }
  if (badColorsEl) {
    badColorsEl.textContent = `${kaliColor.name} (หลีกเลี่ยงเป็นพิเศษ)`;
  }
  
  // 4. Dynamic Transit Aspect Ratings
  let scoreWork = 3, scoreMoney = 3, scoreLove = 3, scoreHealth = 4;
  
  if (isTransitActive && tData && tData.pos) {
    const getHouse = (lon) => (Math.floor(lon / 30) - lagnaIdx + 12) % 12 + 1;
    
    const hSun = getHouse(tData.pos.sun);
    const hMoon = getHouse(tData.pos.moon);
    const hMars = getHouse(tData.pos.mars);
    const hMercury = getHouse(tData.pos.mercury);
    const hJupiter = getHouse(tData.pos.jupiter);
    const hVenus = getHouse(tData.pos.venus);
    const hSaturn = getHouse(tData.pos.saturn);
    const hRahu = getHouse(tData.pos.rahu);
    
    // Evaluation Career
    if ([1, 5, 9, 10].includes(hJupiter)) scoreWork += 1;
    if ([1, 10].includes(hVenus)) scoreWork += 0.5;
    if ([5, 10].includes(hMercury)) scoreWork += 0.5;
    if ([10, 1].includes(hSaturn)) scoreWork -= 1;
    if ([10, 1].includes(hRahu)) scoreWork -= 0.5;
    if (hMars === 10) scoreWork -= 0.5;
    
    // Evaluation Wealth
    if ([2, 11, 5, 9].includes(hJupiter)) scoreMoney += 1;
    if ([2, 11].includes(hVenus)) scoreMoney += 1;
    if ([2, 11].includes(hMercury)) scoreMoney += 0.5;
    if ([2, 11].includes(hSaturn)) scoreMoney -= 1;
    if ([2, 11].includes(hRahu)) scoreMoney -= 0.5;
    
    // Evaluation Love
    if ([1, 5, 7].includes(hVenus)) scoreLove += 1.5;
    if ([1, 5, 7].includes(hJupiter)) scoreLove += 1;
    if (hSaturn === 7) scoreLove -= 1;
    if (hRahu === 7) scoreLove -= 0.5;
    if (hMars === 7) scoreLove -= 0.5;
    
    // Evaluation Health
    if ([1, 6, 8].includes(hSaturn)) scoreHealth -= 1;
    if ([1, 8].includes(hRahu)) scoreHealth -= 1;
    if ([1, 6, 8].includes(hMars)) scoreHealth -= 0.5;
    if ([1, 9].includes(hJupiter)) scoreHealth += 1;
  } else {
    // Fallback: stable daily ratings based on date and user's Lagna
    const today = new Date();
    const daySeed = today.getDate();
    const monthSeed = today.getMonth() + 1;
    
    const seed1 = (daySeed * 7 + lagnaIdx * 3) % 5;
    const seed2 = (daySeed * 3 + monthSeed * 5 + lagnaIdx * 7) % 5;
    const seed3 = (daySeed * 9 + lagnaIdx * 11) % 5;
    const seed4 = (daySeed * 4 + monthSeed * 2 + lagnaIdx * 13) % 5;
    
    scoreWork = 1 + seed1;
    scoreMoney = 1 + seed2;
    scoreLove = 1 + seed3;
    scoreHealth = 1 + seed4;
  }
  
  // Clamp values
  scoreWork = Math.max(1, Math.min(5, Math.round(scoreWork)));
  scoreMoney = Math.max(1, Math.min(5, Math.round(scoreMoney)));
  scoreLove = Math.max(1, Math.min(5, Math.round(scoreLove)));
  scoreHealth = Math.max(1, Math.min(5, Math.round(scoreHealth)));
  
  // Update progress bars & stars in UI
  const setBarAndStars = (aspect, score) => {
    const starsEl = document.getElementById(`free-stars-${aspect}`);
    const barEl = document.getElementById(`free-bar-${aspect}`);
    if (starsEl) {
      starsEl.textContent = '⭐'.repeat(score) + '☆'.repeat(5 - score);
    }
    if (barEl) {
      // Unified light-green to dark-green gradient matching the Love aspect
      const gradient = 'linear-gradient(90deg, #81C784 0%, #2E7D32 100%)';
      
      // Set width and background gradient with a slight delay for smooth transition
      setTimeout(() => {
        barEl.style.width = `${score * 20}%`;
        barEl.style.background = gradient;
      }, 100);
    }
  };
  
  setBarAndStars('work', scoreWork);
  setBarAndStars('money', scoreMoney);
  setBarAndStars('love', scoreLove);
  setBarAndStars('health', scoreHealth);
};


// ── WEB AUDIO API SIIMSI CLATTER SYNTHESIZER ──────────────────────────────
function playSiimsiSound() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Synthesize a sequence of wooden clicking clatters
    const totalClicks = 12 + Math.floor(Math.random() * 6);
    let time = ctx.currentTime;
    
    for (let i = 0; i < totalClicks; i++) {
      // Short noise buffer for the click impact
      const bufferSize = ctx.sampleRate * 0.025; // ~25ms click
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      
      // Fill with noise
      for (let j = 0; j < bufferSize; j++) {
        data[j] = Math.random() * 2 - 1;
      }
      
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      
      // Filter to give a wooden hollow resonance (around 900Hz - 1400Hz)
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 850 + Math.random() * 450;
      filter.Q.value = 3.5; // moderate resonance
      
      // Envelope to decay rapidly
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.18 + Math.random() * 0.15, time);
      gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.018);
      
      source.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      source.start(time);
      source.stop(time + 0.03);
      
      // Schedule next click with randomized timing (faster clatter towards end)
      time += 0.045 + (Math.random() * 0.075);
    }
  } catch (e) {
    console.warn("Web Audio API sound synthesis failed:", e);
  }
}



// ── THAI NUMEROLOGY SYSTEM ────────────────────────────────────────────────
const THAI_NUMEROLOGY_MAP = {
  'ก': 1, 'ด': 1, 'ท': 1, 'ถ': 1, 'ภ': 1, 'า': 1, 'ุ': 1, '่': 1,
  'ข': 2, 'ช': 2, 'บ': 2, 'ป': 2, 'ง': 2, 'เ': 2, 'แ': 2, 'ู': 2, '้': 2,
  'ฆ': 3, 'ฑ': 3, 'ฒ': 3, 'ต': 3, 'ฃ': 3, '๋': 3,
  'ค': 4, 'ธ': 4, 'ร': 4, 'ญ': 4, 'ษ': 4, 'โ': 4, 'ะ': 4, 'ิ': 4, 'ั': 4, 'ฅ': 4,
  'ฉ': 5, 'ณ': 5, 'ฌ': 5, 'น': 5, 'ม': 5, 'ห': 5, 'ฮ': 5, 'ฎ': 5, 'ฬ': 5, 'ึ': 5,
  'จ': 6, 'ล': 6, 'ว': 6, 'อ': 6, 'ใ': 6,
  'ศ': 7, 'ส': 7, 'ซ': 7, 'ี': 7, 'ื': 7, '๊': 7,
  'ย': 8, 'พ': 8, 'ฟ': 8, 'ผ': 8, 'ฝ': 8, '็': 8,
  'ฏ': 9, 'ฐ': 9, 'ไ': 9, '์': 9
};

const NUMEROLOGY_PLANETS = {
  0: { name: 'ดาวมฤตยู', quality: 'การเปลี่ยนแปลงเชิงบวก นวัตกรรม สิ่งลี้ลับ และการเดินทางต่างประเทศ' },
  1: { name: 'ดาวอาทิตย์', quality: 'ความเป็นผู้นำ เกียรติยศ เกียรติศักดิ์ศรี และความเชื่อมั่นในตนเองสูง' },
  2: { name: 'ดาวจันทร์', quality: 'สติปัญญา ความอ่อนโยน จินตนาการ และเมตตามหานิยม' },
  3: { name: 'ดาวอังคาร', quality: 'ความกล้าหาญ การต่อสู้ พพลังชีวิตอันเต็มเปี่ยม และความขยันอดทน' },
  4: { name: 'ดาวพุธ', quality: 'สติปัญญา ไหวพริบ การพูดการเจรจา และทักษะการค้าขาย' },
  5: { name: 'ดาวพฤหัสบดี', quality: 'คุณธรรม สติปัญญาขั้นสูง ความรอบรู้ และผู้ใหญ่ให้การอุปถัมภ์' },
  6: { name: 'ดาวศุกร์', quality: 'ความรัก เสน่ห์ การเงิน ความรื่นรมย์ และศิลปวิทยาการ' },
  7: { name: 'ดาวเสาร์', quality: 'ความอดทน ความจริงจัง ความรับผิดชอบ และการฝ่าฟันอุปสรรค' },
  8: { name: 'ดาวราหู', quality: 'ไหวพริบปฏิภาณ ความพลิกแพลง โชคลาภก้อนใหญ่ และความท้าทาย' },
  9: { name: 'ดาวเกตุ', quality: 'ลางสังหรณ์ สิ่งศักดิ์สิทธิ์คุ้มครอง และปาฏิหาริย์นำโชค' }
};

const PREDEFINED_NUMEROLOGY = {
  9: {
    title: "พลังแห่งสิ่งศักดิ์สิทธิ์คุ้มครอง (ดาวเกตุ)",
    grade: "มงคลยิ่ง ✨",
    desc: "เป็นเลขศาสตร์ที่ดีเยี่ยม มีดาวเกตุ (9) คุ้มครองชีวิต มักมีสัมผัสพิเศษหรือลางสังหรณ์ที่แม่นยำ แคล้วคลาดจากภัยอันตรายอย่างปาฏิหาริย์ มีดวงชะตาที่เกื้อหนุนให้ประสบความสำเร็จในชีวิตอย่างมั่นคงและมีความสุข"
  },
  14: {
    title: "พลังแห่งปัญญาคู่มิตรและความก้าวหน้า",
    grade: "มงคลยิ่ง ✨",
    desc: "เป็นการรวมกันของดาวอาทิตย์ (1) และดาวพุธ (4) ส่งเสริมสติปัญญา ไหวพริบปฏิภาณอันเป็นเลิศ โดดเด่นด้านการติดต่อเจรจา ประสานงานต่างประเทศ และได้รับการเกื้อหนุนจากผู้ใหญ่เป็นอย่างดี หน้าที่การงานก้าวหน้ารวดเร็ว"
  },
  15: {
    title: "พลังแห่งเสน่ห์เมตตาและความสำเร็จ",
    grade: "มงคลยิ่ง ✨",
    desc: "เป็นการรวมกันของดาวอาทิตย์ (1) และดาวพฤหัสบดี (5) ก่อให้เกิดพลังมิตรภาพอันยิ่งใหญ่ มีผู้ใหญ่ให้ความเมตตาอุปถัมภ์ค้ำชูตลอดเวลา มีสติปัญญาดีเด่น รักความยุติธรรม ชีวิตราบรื่นไร้อุปสรรคขัดขวาง"
  },
  19: {
    title: "พลังแห่งแสงอาทิตย์และความสำเร็จสูงสุด",
    grade: "มงคลยิ่ง ✨",
    desc: "เป็นการรวมกัน of ดาวอาทิตย์ (1) และดาวเกตุ (9) ส่งเสริมพลังแห่งเกียรติยศ ชื่อเสียง และความเป็นผู้นำอันโดดเด่น มีผู้คนนับหน้าถือตาและยำเกรง ประสบความสำเร็จในหน้าที่การงานขั้นสูงอย่างสง่างาม"
  },
  24: {
    title: "พลังแห่งเมตตามหานิยมและโชคลาภทรัพย์สิน",
    grade: "มงคลยอดเยี่ยม 🌟",
    desc: "เป็นการรวมกันของดาวจันทร์ (2) และดาวพุธ (4) ถือเป็นคู่มิตรที่ส่งเสริมเมตตามหานิยมสูงสุด เจรจาค้าขายคล่องแคล่ว วาทศิลป์เป็นเลิศ เงินทองไหลมาเทมา ได้รับการช่วยเหลืออุปถัมภ์จากทุกฝ่าย เพื่อนฝูงและคู่ครองดีเลิศ"
  },
  36: {
    title: "พลังแห่งความรักที่สมบูรณ์และการเงินมั่งคั่ง",
    grade: "มงคลยอดเยี่ยม 🌟",
    desc: "เป็นการรวมกันของดาวอังคาร (3) และดาวศุกร์ (6) ถือเป็นคู่มิตรเสน่ห์และโชคลาภที่สมบูรณ์แบบ ส่งผลให้มีเสน่ห์ดึงดูดใจอย่างยิ่ง มีเพศตรงข้ามคอยเกื้อหนุนช่วยเหลือ การเงินมั่งคั่งร่ำรวย ความรักหวานชื่นราบรื่น"
  },
  41: {
    title: "พลังแห่งสติปัญญาและความสำเร็จมั่นคง",
    grade: "มงคลยิ่ง ✨",
    desc: "เป็นการรวมกันของดาวพุธ (4) และดาวอาทิตย์ (1) ส่งเสริมไหวพริบปฏิภาณ ความรอบรู้ลึกซึ้ง มีความสามารถในการติดต่อธุรกิจการค้าทั้งในและต่างประเทศ ได้รับเกียรติยศและความราบรื่นในการทำงานเป็นอย่างดี"
  },
  42: {
    title: "พลังแห่งวาทศิลป์คู่มิตรและการเงินรุ่งเรือง",
    grade: "มงคลยอดเยี่ยม 🌟",
    desc: "เป็นการรวมกันของดาวพุธ (4) และดาวจันทร์ (2) ส่งเสริมเมตตามหานิยมและการพูดจาโน้มน้าวจิตใจผู้คน ค้าขายร่ำรวยราบรื่น มีโชคลาภก้อนโตหลั่งไหลเข้ามาอย่างสม่ำเสมอ ชีวิตเปี่ยมด้วยมิตรภาพและความสมบูรณ์"
  },
  45: {
    title: "พลังแห่งสติปัญญาอันล้ำเลิศและคุณธรรมสูงส่ง",
    grade: "มงคลยอดเยี่ยม 🌟",
    desc: "เป็นการรวมกันของดาวพุธ (4) และดาวพฤหัสบดี (5) ถือเป็นคู่ปัญญาธรรมอันประเสริฐที่สุด ส่งผลให้มีสติปัญญาเฉียบแหลม รักความถูกต้อง มีศีลธรรมอันดี ประสบความสำเร็จอย่างมั่นคงและได้รับการเคารพยกย่องในสังคม"
  },
  54: {
    title: "พลังแห่งคุณธรรมนำพาธุรกิจและความรุ่งเรือง",
    grade: "มงคลยิ่ง ✨",
    desc: "เป็นการรวมกันของดาวพฤหัสบดี (5) และดาวพุธ (4) ส่งเสริมพลังสติปัญญาและความรอบคอบรอบรู้ลึกซึ้ง ประสบความสำเร็จในธุรกิจการงานอย่างมั่นคง มีคุณธรรมสูงและได้รับการยอมรับนับถือจากคนทุกระดับ"
  },
  55: {
    title: "พลังแห่งสติปัญญาอันสูงสุดและผู้ใหญ่เมตตา",
    grade: "มงคลยอดเยี่ยม 🌟",
    desc: "เป็นการรวมกันของดาวพฤหัสบดี (5) สองดวง ก่อเกิดพลังแห่งธรรมะ สติปัญญา และความมั่นคงสูงสุด มีความรอบรู้ในศาสตร์ต่างๆ ลึกซึ้ง ได้รับความเมตตาจากผู้ใหญ่และสิ่งศักดิ์สิทธิ์ ชีวิตมีความสงบสุขและเจริญรุ่งเรืองอย่างยั่งยืน"
  },
  56: {
    title: "พลังแห่งคู่ทรัพย์คู่โชคและความรักสมบูรณ์",
    grade: "มงคลยอดเยี่ยม 🌟",
    desc: "เป็นการรวมกันของดาวพฤหัสบดี (5) และดาวศุกร์ (6) ถือเป็นคู่ทรัพย์คู่โชคที่สมดุลที่สุด ส่งเสริมโอกาสทองทางการเงิน โชคลาภหลั่งไหลเข้ามาสม่ำเสมอ ความรักราบรื่นและเปี่ยมสุข ประสบความสำเร็จอย่างรวดเร็ว"
  },
  59: {
    title: "พลังแห่งสติปัญญาและสิ่งศักดิ์สิทธิ์หนุนดวง",
    grade: "มงคลยอดเยี่ยม 🌟",
    desc: "เป็นการรวมกันของดาวพฤหัสบดี (5) และดาวเกตุ (9) ส่งเสริมพลังสติปัญญาระดับสูง ลางสังหรณ์แม่นยำ มีสิ่งศักดิ์สิทธิ์คอยคุ้มครองปกปักรักษา แคล้วคลาดปลอดภัยและเจริญก้าวหน้าในชีวิตอย่างสูงและมั่นคง"
  },
  63: {
    title: "พลังแห่งเสน่ห์เมตตาและการค้ามีชัยชนะ",
    grade: "มงคลยิ่ง ✨",
    desc: "เป็นการรวมกันของดาวศุกร์ (6) และดาวอังคาร (3) ส่งผลให้มีเสน่ห์ทางเพศตรงข้ามอย่างสูง ค้าขายร่ำรวย เจรจาธุรกิจมีชัยชนะเหนือคู่แข่ง หน้าที่การงานเติบโตรวดเร็วและได้รับการเกื้อหนุนอย่างอบอุ่น"
  },
  64: {
    title: "พลังแห่งโชคทรัพย์สินและความบันเทิงเริงร่า",
    grade: "มงคลยิ่ง ✨",
    desc: "เป็นการรวมกันของดาวศุกร์ (6) และดาวพุธ (4) ส่งส่งพลังโชคลาภ เงินทอง ศิลปะ และความรื่นรมย์ในชีวิต มีวาจามหาเสน่ห์ ดึงดูดทรัพย์และผู้คนให้เข้ามารักใคร่ มีความสุขสำราญและประสบความสำเร็จราบรื่น"
  },
  65: {
    title: "พลังแห่งคู่ทรัพย์คู่โชคอุปถัมภ์มั่นคง",
    grade: "มงคลยอดเยี่ยม 🌟",
    desc: "เป็นการรวมกันของดาวศุกร์ (6) และดาวพฤหัสบดี (5) ส่งผลให้เกิดความสำเร็จด้านการเงินและความรักอย่างยั่งยืน ได้รับความช่วยเหลือจากผู้ใหญ่อยู่เสมอ สุขภาพกายและใจดีเยี่ยม ชีวิตเปี่ยมด้วยโชคลาภและความสุข"
  },
  90: {
    title: "พลังแห่งสิ่งศักดิ์สิทธิ์ปกปักรักษาและแคล้วคลาด",
    grade: "มงคลยิ่ง ✨",
    desc: "เป็นการรวมกันของดาวเกตุ (9) และดาวมฤตยู (0) ส่งผลให้มีลางสังหรณ์และสัมผัสพิเศษลึกซึ้ง มีสิ่งศักดิ์สิทธิ์คอยปกปักรักษาชะตาชีวิตให้แคล้วคลาดปลอดภัยจากภยันตรายทั้งปวงอย่างปาฏิหาริย์"
  },
  13: {
    title: "พลังแห่งความพลิกผันและอุปสรรคกะทันหัน",
    grade: "ควรระวังเป็นพิเศษ ⚠️",
    desc: "ดาวอาทิตย์ (1) และดาวอังคาร (3) ร่วมส่งผล ก่อเกิดพลังแห่งความหุนหันพลันแล่นและการเปลี่ยนแปลงอย่างกะทันหัน มักต้องเหน็ดเหนื่อยฝ่าฟันอุปสรรคบ่อยครั้ง แนะนำให้ฝึกระงับอารมณ์ และหมั่นทำบุญสวดมนต์เพื่อเสริมสิริมงคล"
  },
  17: {
    title: "พลังแห่งความกดดันและการเผชิญหน้า",
    grade: "ควรระวังเป็นพิเศษ ⚠️",
    desc: "ดาวอาทิตย์ (1) และดาวเสาร์ (7) ร่วมพลัง ส่งผลให้ดวงชะตามีความกดดันสูง มักถูกเอาเปรียบหรือตกอยู่ท่ามกลางอุปสรรคที่ต้องใช้ความอดทนอย่างยิ่งยวด แนะนำให้ทำงานอย่างรอบคอบ หลีกเลี่ยงความขัดแย้ง และทำบุญโลงศพเพื่อแก้เคล็ด"
  },
  18: {
    title: "พลังแห่งความผันผวนและการถูกทรยศหักหลัง",
    grade: "ควรระวังเป็นพิเศษ ⚠️",
    desc: "ดาวอาทิตย์ (1) และดาวราหู (8) ร่วมพลัง ส่งเสริมเรื่องไหวพริบแต่ต้องระวังความใจร้อนและการคบมิตร มักมีปัญหาการถูกหักหลัง ทะเลาะเบาะแว้ง หรือการงานผันผวนบ่อย แนะนำให้รอบคอบเรื่องสัญญาเอกสาร และทำบุญค่าน้ำค่าไฟวัด"
  },
  21: {
    title: "พลังแห่งความขัดแย้งและความไม่แน่นอน",
    grade: "ควรระวังเป็นพิเศษ ⚠️",
    desc: "ดาวจันทร์ (2) และดาวอาทิตย์ (1) เป็นดาวคู่ตรงข้าม ส่งผลให้จิตใจมีความขัดแย้งในตัวเอง อารมณ์แปรปรวน และชีวิตมักขึ้นๆ ลงๆ ไม่แน่นอน แนะนำให้ฝึกจิตใจให้มั่นคง หนักแน่น และร่วมทำบุญสร้างอุโบสถเพื่อหนุนดวงชะตา"
  },
  27: {
    title: "พลังแห่งความเหน็ดเหนื่อยและการพลัดพราก",
    grade: "ควรระวังเป็นพิเศษ ⚠️",
    desc: "ดาวจันทร์ (2) และดาวเสาร์ (7) ส่งพลังร่วม มักพบความตึงเครียด วิตกกังวล หรือต้องเหน็ดเหนื่อยดูแลแบกรับภาระครอบครัวอย่างสูง แนะนำให้ปล่อยวางความเครียด หมั่นทำบุญบริจาคทรัพย์แก่โรงพยาบาลเพื่อช่วยชีวิตเพื่อนมนุษย์"
  },
  31: {
    title: "พลังแห่งอุปสรรคขัดขวางและอุบัติภัย",
    grade: "ควรระวังเป็นพิเศษ ⚠️",
    desc: "ดาวอังคาร (3) และดาวอาทิตย์ (1) ส่งพลังร้อนแรงคู่ขัดแย้ง มักส่งผลให้มีศัตรูคอยขัดขวาง มีปากเสียงรุนแรง หรือเจ็บป่วยกะทันหัน แนะนำให้หลีกเลี่ยงการใช้อารมณ์ตัดสินปัญหา และทำบุญบริจาคโลหิตเพื่อผ่อนคลายกรรมเคราะห์"
  },
  37: {
    title: "พลังแห่งความวิตกกังวลและอุปสรรคสะสม",
    grade: "ควรระวังเป็นพิเศษ ⚠️",
    desc: "ดาวอังคาร (3) และดาวเสาร์ (7) เป็นดาวคู่ศัตรูใหญ่ ส่งผลให้ชะตาชีวิตเต็มไปด้วยการต่อสู้ดิ้นรน อุปสรรคขัดลาภ และความวิตกกังวลสะสม แนะนำให้หมั่นช่วยเหลือผู้ยากไร้ ปล่อยปลาหน้าเขียงเพื่อสเดาะเคราะห์และต่อดวงชะตา"
  },
  48: {
    title: "พลังแห่งการถูกหลอกลวงและความพลิกผัน",
    grade: "ควรระวังเป็นพิเศษ ⚠️",
    desc: "ดาวพุธ (4) และดาวราหู (8) ส่งพลังร่วม อาจส่งผลให้ถูกฉ้อโกง หลงเชื่อคำลวงได้ง่าย หรือมีเรื่องคดีความเดือดร้อน แนะนำให้ศึกษาข้อมูลให้รอบคอบก่อนร่วมลงทุนใดๆ และหมั่นทำบุญบริจาคสิ่งของให้เด็กพิการหรือยากไร้"
  }
};

const AUSPICIOUS_NUMS = [9, 14, 15, 19, 23, 24, 32, 36, 41, 42, 45, 46, 50, 51, 54, 55, 56, 59, 63, 64, 65, 69, 79, 89, 90, 95];
const CAUTION_NUMS = [11, 12, 13, 17, 18, 20, 21, 25, 26, 27, 28, 29, 30, 31, 33, 34, 37, 38, 39, 43, 47, 48, 57, 58, 67, 68, 70, 71, 72, 73, 74, 75, 76, 77, 78, 80, 81, 82, 83, 84, 85, 86, 87, 88, 91, 92, 93, 94, 96, 97, 98, 99, 100];

// Function to calculate and synthesize reading for a given number
function interpretNumber(num, partName) {
  // If predefined exists, return it
  if (PREDEFINED_NUMEROLOGY[num]) {
    return PREDEFINED_NUMEROLOGY[num];
  }
  
  // Synthesize dynamically based on planets
  const digits = String(num).split('').map(Number);
  
  let title = "";
  let grade = "ปานกลาง ⚖️";
  if (AUSPICIOUS_NUMS.includes(num)) {
    grade = "มงคล ✨";
  } else if (CAUTION_NUMS.includes(num)) {
    grade = "ควรระวัง ⚠️";
  }
  
  let desc = "";
  if (digits.length === 1) {
    // Single digit planet
    const p = NUMEROLOGY_PLANETS[digits[0]] || NUMEROLOGY_PLANETS[9];
    title = `พลังแห่ง${p.name}`;
    desc = `ตัวเลขนี้ได้รับอิทธิพลโดยตรงจาก ${p.name} ซึ่งสื่อถึง ${p.quality} ส่งเสริมให้ชะตาชีวิตมีจุดเด่นในเรื่องดังกล่าวอย่างเด่นชัด มีโอกาสทางหน้าที่การงานที่ดี`;
  } else {
    // Two digit planet blend
    const tVal = digits[0];
    const uVal = digits[1];
    const p1 = NUMEROLOGY_PLANETS[tVal] || NUMEROLOGY_PLANETS[1];
    const p2 = NUMEROLOGY_PLANETS[uVal] || NUMEROLOGY_PLANETS[1];
    
    title = `พลังแห่งดวงดาวคู่ผสม ${p1.name} และ ${p2.name}`;
    
    if (grade === "มงคล ✨" || grade === "มงคลยอดเยี่ยม 🌟") {
      desc = `เป็นผลรวมตัวเลขที่ดี สื่อถึงการร่วมส่งกระแสพลังบวกระหว่าง ${p1.name} (ซึ่งเด่นด้าน${p1.quality}) และ ${p2.name} (ซึ่งเด่นด้าน${p2.quality}) ก่อเกิดผลลัพธ์ดึงดูดสิ่งดีงาม โชคลาภ และความเจริญรุ่งเรืองเข้ามาในดวงชะตาเป็นลำดับครับ`;
    } else if (grade === "ควรระวัง ⚠️") {
      desc = `เป็นตัวเลขผสมระหว่าง ${p1.name} (${p1.quality}) และ ${p2.name} (${p2.quality}) ซึ่งมีกระแสขัดแย้งกันอยู่บ้าง อาจทำให้ชีวิตเผชิญความกดดันหรืออุปสรรคสะสมเป็นระยะ ควรใช้ชีวิตด้วยสติ ความรอบคอบ และหมั่นสวดมนต์ทำบุญเสริมสิริมงคลเป็นด่านป้องกันครับ`;
    } else {
      desc = `เป็นผลรวมตัวเลขระดับปานกลาง เกิดจากการผสมพลังงานของ ${p1.name} (${p1.quality}) และ ${p2.name} (${p2.quality}) ส่งผลให้ชีวิตดำเนินไปอย่างเป็นธรรมชาติ มีความมั่นคงในระดับดี ควรหมั่นสร้างคุณงามความดีเพื่อส่งเสริมดวงชะตาให้รุ่งโรจน์ยิ่งๆ ขึ้นไป`;
    }
  }
  
  return { title, grade, desc };
}

window.pullNameFromHoroscope = function() {
  const bNameEl = document.getElementById('bName');
  const bLastNameEl = document.getElementById('bLastName');
  if (!bNameEl) return;
  
  let firstName = bNameEl.value.trim();
  let lastName = bLastNameEl ? bLastNameEl.value.trim() : '';
  
  if (!firstName) {
    alert("กรุณากรอกชื่อในหน้าหลัก (ผูกดวง) ก่อนนะครับ");
    return;
  }
  
  // Fallback: If lastName is empty but firstName has spaces, split it
  if (!lastName && firstName.includes(' ')) {
    const parts = firstName.split(/\s+/);
    firstName = parts[0] || '';
    lastName = parts.slice(1).join(' ') || '';
  }
  
  const fNameInput = document.getElementById('numFirstName');
  const lNameInput = document.getElementById('numLastName');
  
  if (fNameInput) fNameInput.value = firstName;
  if (lNameInput) lNameInput.value = lastName;
  
  if (typeof analyzeNumerology === 'function') {
    analyzeNumerology();
  }
};

window.analyzeNumerology = function() {
  const firstName = document.getElementById('numFirstName').value.trim();
  const lastName = document.getElementById('numLastName').value.trim();
  
  if (!firstName || !lastName) {
    alert("กรุณากรอกทั้งชื่อจริงและนามสกุลภาษาไทยให้ครบถ้วนครับ");
    return;
  }
  
  // Validate Thai characters (allowing vowels, tone marks, spaces, but no English or digits)
  const thaiRegex = /^[ก-์\s]+$/;
  if (!thaiRegex.test(firstName) || !thaiRegex.test(lastName)) {
    alert("กรุณากรอกชื่อและนามสกุลเป็นภาษาไทยเท่านั้นครับ (ไม่ใส่ตัวเลขหรือภาษาอังกฤษ)");
    return;
  }
  
  // Calculate sums and breakdowns
  const nameResult = calculateNumerologySum(firstName);
  const lastNameResult = calculateNumerologySum(lastName);
  const totalSum = nameResult.sum + lastNameResult.sum;
  
  function calculateNumerologySum(str) {
    let sum = 0;
    let breakdown = [];
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      if (THAI_NUMEROLOGY_MAP[char] !== undefined) {
        const val = THAI_NUMEROLOGY_MAP[char];
        sum += val;
        breakdown.push(`${char}(${val})`);
      }
    }
    return { sum, breakdown: breakdown.join(' + ') };
  }
  
  // Interpretations
  const nameInterpretation = interpretNumber(nameResult.sum, 'ชื่อ');
  const lastNameInterpretation = interpretNumber(lastNameResult.sum, 'นามสกุล');
  const totalInterpretation = interpretNumber(totalSum, 'รวม');
  
  // Helper to determine text color based on numerology grade
  function getNumerologyColor(grade) {
    if (grade.includes('มงคล')) {
      return '#2e7d32'; // Green
    } else if (grade.includes('ควรระวัง') || grade.includes('เสีย')) {
      return '#d32f2f'; // Red
    } else {
      return '#111111'; // Black
    }
  }
  
  const nameColor = getNumerologyColor(nameInterpretation.grade);
  const lastNameColor = getNumerologyColor(lastNameInterpretation.grade);
  const totalColor = getNumerologyColor(totalInterpretation.grade);
  
  // Update HTML elements with values and dynamic colors
  const nameValEl = document.getElementById('numValName');
  nameValEl.textContent = nameResult.sum;
  nameValEl.style.color = nameColor;
  
  const lastNameValEl = document.getElementById('numValLastName');
  lastNameValEl.textContent = lastNameResult.sum;
  lastNameValEl.style.color = lastNameColor;
  
  const totalValEl = document.getElementById('numValTotal');
  totalValEl.textContent = totalSum;
  totalValEl.style.color = totalColor;
  
  document.getElementById('numBreakdownName').innerHTML = `<b>ชื่อ:</b> ${nameResult.breakdown} = <b>${nameResult.sum}</b>`;
  document.getElementById('numBreakdownLastName').innerHTML = `<b>นามสกุล:</b> ${lastNameResult.breakdown} = <b>${lastNameResult.sum}</b>`;
  
  document.getElementById('numTextName').textContent = nameResult.sum;
  document.getElementById('numDescName').innerHTML = `<span style="font-weight:700; color:var(--text); font-size:0.72rem; background:rgba(226,184,66,0.1); padding:2px 6px; border-radius:4px; margin-right:5px;">เกรด: ${nameInterpretation.grade}</span><br><span style="font-weight:700; color:var(--text);">${nameInterpretation.title}</span><br>${nameInterpretation.desc}`;
  
  document.getElementById('numTextLastName').textContent = lastNameResult.sum;
  document.getElementById('numDescLastName').innerHTML = `<span style="font-weight:700; color:var(--text); font-size:0.72rem; background:rgba(226,184,66,0.1); padding:2px 6px; border-radius:4px; margin-right:5px;">เกรด: ${lastNameInterpretation.grade}</span><br><span style="font-weight:700; color:var(--text);">${lastNameInterpretation.title}</span><br>${lastNameInterpretation.desc}`;
  
  document.getElementById('numTextTotal').textContent = totalSum;
  document.getElementById('numDescTotal').innerHTML = `<span style="font-weight:800; color:#7A5510; font-size:0.74rem; background:rgba(245,200,64,0.18); padding:2px 6px; border-radius:4px; margin-right:5px;">ผลรวมพลังชะตา: ${totalInterpretation.grade}</span><br><span style="font-weight:800; color:#7A5510; font-size:0.86rem; display:block; margin:4px 0;">${totalInterpretation.title}</span>${totalInterpretation.desc}`;
  
  // Show results section
  const resultDiv = document.getElementById('numerologyResult');
  if (resultDiv) {
    resultDiv.style.display = 'block';
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
};

// ── E-SIIMSI GAME CONTROLLERS ─────────────────────────────────────────────
let activeSiimsiDeity = 'ganesh';
let isSiimsiShaking = false;

// Helper to get local date string YYYY-MM-DD
function getTodayString() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Check if a saved draw exists for today in localStorage
function checkSiimsiLimit(deity) {
  try {
    const history = JSON.parse(localStorage.getItem('muhub_siimsi_v2') || '{}');
    const todayStr = getTodayString();
    if (history[deity] && history[deity].date === todayStr) {
      return history[deity].roll;
    }
  } catch (e) {
    console.warn("Failed to read localStorage:", e);
  }
  return null;
}

// Deity selector tab switcher
window.selectSiimsiDeity = function(deity) {
  if (isSiimsiShaking) return;
  
  activeSiimsiDeity = deity;
  
  // 1. Update selector buttons active states
  const buttons = ['ganesh', 'guanyin', 'citypillar'];
  buttons.forEach(b => {
    const btn = document.getElementById(`deity-btn-${b}`);
    if (btn) {
      if (b === deity) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    }
  });
  
  // 2. Update the main card's class. This automatically triggers all deity-specific styles in CSS!
  const card = document.getElementById('siimsiCard');
  if (card) {
    card.className = `card deity-${deity}`;
  }
  
  // 3. Update title text
  const title = document.getElementById('siimsiCardTitle');
  if (title) {
    title.textContent = 'เซียมซีประจำวัน';
  }
  
  // 4. Update caption text
  const caption = document.getElementById('siimsiCaption');
  if (caption) {
    if (deity === 'ganesh') {
      caption.textContent = 'ตั้งจิตอธิษฐานนึกถึงสิ่งศักดิ์สิทธิ์หรือองค์พระพิฆเนศ มหาเทพแห่งความสำเร็จ แล้วแตะที่กระบอกเพื่อสุ่มรับพรนำทางชีวิตครับ';
    } else if (deity === 'guanyin') {
      caption.textContent = 'ตั้งจิตอธิษฐานนึกถึงพระเมตตาและบารมีแห่งองค์เจ้าแม่กวนอิม พระโพธิสัตว์แห่งความรักและความสงบ แล้วแตะที่กระบอกเพื่อสุ่มรับคำทำนายนำทางชีวิตครับ';
    } else if (deity === 'citypillar') {
      caption.textContent = 'ตั้งจิตอธิษฐานนึกถึงความมั่นคงเป็นปึกแผ่นและบารมีแห่งองค์พระหลักเมือง เทพารักษ์ผู้ปกปักรักษาชะตาเมือง แล้วแตะที่กระบอกเพื่อสุ่มรับพรเสาหลักชีวิตครับ';
    }
  }
  
  // 5. Check if the user already drew this E-Siimsi today
  const savedRoll = checkSiimsiLimit(deity);
  if (savedRoll !== null) {
    // If already drawn today, immediately show the scroll with their saved prophecy
    showSavedSiimsiProphecy(savedRoll);
  } else {
    // If not drawn today, show the shaker cup as normal
    resetSiimsi();
  }
};

// Show a saved prophecy directly (bypassing shake animation)
function showSavedSiimsiProphecy(roll) {
  const scroll = document.getElementById('siimsiScroll');
  const widget = document.getElementById('siimsiWidget');
  const pNum = document.getElementById('siimsiScrollNumber');
  const pTitle = document.getElementById('siimsiScrollTitle');
  const pBody = document.getElementById('siimsiScrollBody');
  const pLucky = document.getElementById('siimsiLuckyNum');
  const resetBtn = document.getElementById('siimsiResetBtn');
  
  let db = SIIMSI_PROPHECIES;
  let poemColor = 'var(--coral-d)';
  if (activeSiimsiDeity === 'guanyin') {
    db = SIIMSI_PROPHECIES_GUANYIN;
    poemColor = '#004d40';
  } else if (activeSiimsiDeity === 'citypillar') {
    db = SIIMSI_PROPHECIES_CITYPILLAR;
    poemColor = '#0d47a1';
  }
  
  const prophecy = db[roll] || db[0];
  
  if (pNum) pNum.textContent = `ใบที่ ${prophecy.numTH}`;
  if (pTitle) pTitle.textContent = prophecy.title;
  if (pBody) pBody.innerHTML = `<div style="text-align:center; font-style:italic; font-size:1.02rem; color:${poemColor}; margin-bottom:15rem; font-weight:700;">"${prophecy.poem}"</div>${prophecy.reading}`;
  if (pLucky) pLucky.textContent = `เลขมงคลนำโชค: ${prophecy.luckyNum}`;
  
  // Lock/Disable the reset button since they have already drawn today
  if (resetBtn) {
    resetBtn.innerHTML = 'เสี่ยงทายได้อีกครั้งพรุ่งนี้';
    resetBtn.disabled = true;
    resetBtn.style.opacity = '0.5';
    resetBtn.style.cursor = 'not-allowed';
    resetBtn.style.pointerEvents = 'none';
  }
  
  if (widget) widget.style.display = 'none';
  if (scroll) {
    scroll.style.display = 'block';
    scroll.classList.add('active');
  }
}

// Shaking cup controller
window.triggerSiimsiShake = function() {
  if (isSiimsiShaking) return;
  
  // Enforce the once-per-day limit per cup before shaking
  const savedRoll = checkSiimsiLimit(activeSiimsiDeity);
  if (savedRoll !== null) {
    showSavedSiimsiProphecy(savedRoll);
    return;
  }
  
  isSiimsiShaking = true;
  
  const cup = document.getElementById('siimsiCup');
  const instruction = document.getElementById('siimsiInstruction');
  const fallingStick = document.getElementById('fallingStick');
  const scroll = document.getElementById('siimsiScroll');
  const widget = document.getElementById('siimsiWidget');
  
  // Reset scroll view if visible
  if (scroll) {
    scroll.classList.remove('active');
    scroll.style.display = 'none';
  }
  if (widget) widget.style.display = 'flex';
  
  // Step 1: Start shaking animation
  if (cup) cup.classList.add('shaking');
  if (instruction) instruction.textContent = '🔮 กำลังตั้งจิตอธิษฐานและเขย่าสั่นเซียมซี...';
  
  // Play dynamic clattering sound using Web Audio API
  playSiimsiSound();
  
  // Step 2: Stop shaking and drop stick after 1.5 seconds
  setTimeout(() => {
    if (cup) cup.classList.remove('shaking');
    if (instruction) instruction.textContent = '🎋 ไม้เซียมซีมงคลร่วงหล่นลงมาแล้ว!';
    
    // Animate falling stick
    if (fallingStick) {
      fallingStick.classList.add('dropping');
    }
    
    // Step 3: Reveal the scroll prophecy after stick drops (1.2s animation)
    setTimeout(() => {
      if (fallingStick) {
        fallingStick.classList.remove('dropping');
      }
      
      // Hide the shaker widget and show the scroll card
      if (widget) widget.style.display = 'none';
      
      // Determine active database
      let db = SIIMSI_PROPHECIES;
      let poemColor = 'var(--coral-d)';
      if (activeSiimsiDeity === 'guanyin') {
        db = SIIMSI_PROPHECIES_GUANYIN;
        poemColor = '#004d40';
      } else if (activeSiimsiDeity === 'citypillar') {
        db = SIIMSI_PROPHECIES_CITYPILLAR;
        poemColor = '#0d47a1';
      }
      
      // Roll a random prophecy index
      const roll = Math.floor(Math.random() * db.length);
      const prophecy = db[roll];
      
      // Save the draw to localStorage immediately
      try {
        const todayStr = getTodayString();
        const history = JSON.parse(localStorage.getItem('muhub_siimsi_v2') || '{}');
        history[activeSiimsiDeity] = { date: todayStr, roll: roll };
        localStorage.setItem('muhub_siimsi_v2', JSON.stringify(history));
      } catch (e) {
        console.warn("Failed to save draw history:", e);
      }
      
      const pNum = document.getElementById('siimsiScrollNumber');
      const pTitle = document.getElementById('siimsiScrollTitle');
      const pBody = document.getElementById('siimsiScrollBody');
      const pLucky = document.getElementById('siimsiLuckyNum');
      const resetBtn = document.getElementById('siimsiResetBtn');
      
      if (pNum) pNum.textContent = `ใบที่ ${prophecy.numTH}`;
      if (pTitle) pTitle.textContent = prophecy.title;
      if (pBody) pBody.innerHTML = `<div style="text-align:center; font-style:italic; font-size:1.02rem; color:${poemColor}; margin-bottom:15rem; font-weight:700;">"${prophecy.poem}"</div>${prophecy.reading}`;
      if (pLucky) pLucky.textContent = `เลขมงคลนำโชค: ${prophecy.luckyNum}`;
      
      // Lock the reset button immediately since they have now drawn today
      if (resetBtn) {
        resetBtn.innerHTML = 'เสี่ยงทายได้อีกครั้งพรุ่งนี้';
        resetBtn.disabled = true;
        resetBtn.style.opacity = '0.5';
        resetBtn.style.cursor = 'not-allowed';
        resetBtn.style.pointerEvents = 'none';
      }
      
      if (scroll) {
        scroll.style.display = 'block';
        setTimeout(() => {
          scroll.classList.add('active');
        }, 50);
      }
      
      isSiimsiShaking = false;
    }, 1200);
    
  }, 1500);
};

// Reset E-Siimsi display (only used when they have NOT drawn today yet)
window.resetSiimsi = function() {
  const scroll = document.getElementById('siimsiScroll');
  const widget = document.getElementById('siimsiWidget');
  const instruction = document.getElementById('siimsiInstruction');
  const resetBtn = document.getElementById('siimsiResetBtn');
  
  if (scroll) {
    scroll.classList.remove('active');
    scroll.style.display = 'none';
  }
  if (widget) widget.style.display = 'flex';
  if (instruction) instruction.textContent = '👇 แตะกระบอกเซียมซีด้านล่างเพื่อเริ่มเขย่าเสี่ยงทายดวงชะตารายวัน';
  
  // Make sure the reset button is active/reset to default state
  if (resetBtn) {
    resetBtn.innerHTML = '🔄 เสี่ยงทายใหม่';
    resetBtn.disabled = false;
    resetBtn.style.opacity = '1';
    resetBtn.style.cursor = 'pointer';
    resetBtn.style.pointerEvents = 'auto';
  }
};

// ── FREE PAGE QUICK NAV ─────────────────────────────────────────────────
const FREE_NAV_IDS = ['free-card-transit', 'siimsiCard', 'free-card-lagna', 'free-card-thaksa', 'numerologyCard'];

window.freeScrollTo = function(cardId) {
  const el = document.getElementById(cardId);
  if (!el) return;
  const offset = 60;
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: 'smooth' });

  // Set active immediately on click (don't wait for scroll event)
  const nav = document.getElementById('freeQuickNav');
  if (nav) {
    const idx = FREE_NAV_IDS.indexOf(cardId);
    nav.querySelectorAll('.free-quicknav-btn').forEach((b, i) => b.classList.toggle('active', i === idx));
  }
};

// Highlight active nav button based on scroll position
(function initFreeQuickNav() {
  const NAV_MAP = FREE_NAV_IDS.map((id, i) => ({ id, btn: i }));

  function updateActive() {
    const nav = document.getElementById('freeQuickNav');
    if (!nav) return;
    const btns = nav.querySelectorAll('.free-quicknav-btn');
    let activeIdx = 0;
    NAV_MAP.forEach(({ id }, i) => {
      const el = document.getElementById(id);
      if (!el) return;
      const top = el.getBoundingClientRect().top;
      if (top <= 120) activeIdx = i;
    });
    btns.forEach((b, i) => b.classList.toggle('active', i === activeIdx));
  }

  window.addEventListener('scroll', updateActive, { passive: true });
  // Re-init when free dashboard becomes visible (after login)
  const observer = new MutationObserver(() => updateActive());
  document.addEventListener('DOMContentLoaded', () => {
    const view = document.getElementById('free-dashboard-view');
    if (view) observer.observe(view, { attributes: true, attributeFilter: ['style'] });
    updateActive();
  });
})();