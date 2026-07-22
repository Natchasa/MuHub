// app-init.js — Orchestrator and App Initialization

let locationsLoaded = false;
let loadingLocationsPromise = null;
const BIRTH_DATA_KEY = 'muhub_birth_data';

function toggleLayer(l) {
  if (l === 'n') {
    showN = !showN;
    document.getElementById('togN').classList.toggle('off', !showN);
  } else {
    showT = !showT;
    document.getElementById('togT').classList.toggle('off', !showT);
  }
  renderThaksa(birthYear, birthMonth, birthDay, birthHour, birthMin);
  drawWheel();
  renderTable();
}

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

    ['bName','bLastName','bLineId','bDay','bMonth','bYear','bHour','bMin',
     'tDay','tMonth','tYear','tHour','tMin'].forEach(id => {
      const el = document.getElementById(id);
      if (el && data[id] !== undefined) el.value = data[id];
    });

    ['bCountry','tCountry'].forEach(id => {
      const el = document.getElementById(id);
      if (el && data[id]) {
        el.value = data[id];
        onCountryChange(id === 'bCountry' ? 'b' : 't');
      }
    });

    ['bCity','tCity'].forEach(id => {
      const el = document.getElementById(id);
      if (el && data[id]) el.value = data[id];
    });

    ['bLat','bLon'].forEach(id => {
      const el = document.getElementById(id);
      if (el && data[id]) el.value = data[id];
    });

    console.log('Birth data restored from localStorage.');
    if (typeof syncPickersFromHidden === 'function') syncPickersFromHidden();
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
      const restored = restoreBirthData();
      if (!restored) {
        populateCities('b', 'bangkok');
        populateCities('t', 'bangkok');
      }
      if (typeof syncPickersFromHidden === 'function') syncPickersFromHidden();

      // Determine if there is a saved transit date in localStorage
      const raw = localStorage.getItem(BIRTH_DATA_KEY);
      let hasSavedTransit = false;
      if (raw) {
        try {
          const data = JSON.parse(raw);
          if (data.tDay !== undefined && data.tMonth !== undefined && data.tYear !== undefined) {
            hasSavedTransit = true;
          }
        } catch (e) {}
      }

      if (!hasSavedTransit) {
        const bDay = parseInt(document.getElementById('bDay').value) || 13;
        const bMonth = parseInt(document.getElementById('bMonth').value) || 4;
        const bYear = parseInt(document.getElementById('bYear').value) || 2533;
        const bHour = parseInt(document.getElementById('bHour').value) || 8;
        const bMin = parseInt(document.getElementById('bMin').value) || 0;
        
        const byCE = bYear - 543;
        const bCountry = document.getElementById('bCountry').value;
        let bLat = 13.7563, bLon = 100.5018, bTZ = 7.0;
        
        if (bCountry !== 'custom') {
          const cityId = document.getElementById('bCity').value;
          if (LOCATION_DATABASE[bCountry] && LOCATION_DATABASE[bCountry].cities) {
            const city = LOCATION_DATABASE[bCountry].cities.find(c => c.id === cityId);
            if (city) {
              bLat = city.lat;
              bLon = city.lon;
              bTZ = city.tz !== undefined ? city.tz : (LOCATION_DATABASE[bCountry].tz !== undefined ? LOCATION_DATABASE[bCountry].tz : Math.round(city.lon / 15.0));
            }
          }
        }
        
        const tempNatal = compute(byCE, bMonth, bDay, bHour, bMin, bTZ, bLat, bLon);
        const natalSunLon = tempNatal.pos.sun;
        
        const today = new Date();
        const currentYear = today.getFullYear();
        let transitYear = currentYear;
        if ((today.getMonth() + 1) < bMonth || ((today.getMonth() + 1) === bMonth && today.getDate() < bDay)) {
          transitYear = currentYear - 1;
        }
        
        const tReturnMs = findSolarReturnTime(natalSunLon, transitYear, bMonth, bDay);
        
        let tTZ = 7.0;
        const tCountry = document.getElementById('tCountry').value;
        if (tCountry !== 'custom') {
          const cityId = document.getElementById('tCity').value;
          if (LOCATION_DATABASE[tCountry] && LOCATION_DATABASE[tCountry].cities) {
            const city = LOCATION_DATABASE[tCountry].cities.find(c => c.id === cityId);
            if (city) {
              tTZ = city.tz !== undefined ? city.tz : (LOCATION_DATABASE[tCountry].tz !== undefined ? LOCATION_DATABASE[tCountry].tz : Math.round(city.lon / 15.0));
            }
          }
        }
        
        const localDate = new Date(tReturnMs + tTZ * 3600000);
        
        document.getElementById('tDay').value = localDate.getUTCDate();
        document.getElementById('tMonth').value = localDate.getUTCMonth() + 1;
        document.getElementById('tYear').value = localDate.getUTCFullYear() + 543;
        document.getElementById('tHour').value = String(localDate.getUTCHours()).padStart(2, '0');
        document.getElementById('tMin').value = String(localDate.getUTCMinutes()).padStart(2, '0');
      }
      
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

window.addEventListener('load', () => {
  if (typeof initHourMinSelects === 'function') initHourMinSelects();
  setTimeout(ensureLocationsLoaded, 100);
});

window.setTransitNow = function() {
  const n = new Date();
  document.getElementById('tDay').value = n.getDate();
  document.getElementById('tMonth').value = n.getMonth() + 1;
  document.getElementById('tYear').value = n.getFullYear() + 543;
  document.getElementById('tHour').value = String(n.getHours()).padStart(2, '0');
  document.getElementById('tMin').value = String(n.getMinutes()).padStart(2, '0');
  if (typeof syncPickersFromHidden === 'function') syncPickersFromHidden();
};

window.setTransitSolarReturn = function() {
  if (!nData || !nData.pos || nData.pos.sun === undefined) {
    alert("⚠️ กรุณากรอกข้อมูลวันเกิดและกด 'ผูกดวง' (ดวงกำเนิด) ก่อนคำนวณดวงปี (Solar Return)");
    return;
  }

  let targetYearBE = parseInt(document.getElementById('tYear').value);
  if (isNaN(targetYearBE) || targetYearBE < 2400 || targetYearBE > 2700) {
    targetYearBE = new Date().getFullYear() + 543;
  }
  const targetYearCE = targetYearBE - 543;

  const bDay = parseInt(document.getElementById('bDay').value) || 13;
  const bMonth = parseInt(document.getElementById('bMonth').value) || 4;
  const natalSunLon = nData.pos.sun;
  
  let tz = 7.0;
  const tCountry = document.getElementById('tCountry').value;
  if (tCountry !== 'custom') {
    const cityId = document.getElementById('tCity').value;
    if (LOCATION_DATABASE[tCountry] && LOCATION_DATABASE[tCountry].cities) {
      const city = LOCATION_DATABASE[tCountry].cities.find(c => c.id === cityId);
      if (city) {
        tz = city.tz !== undefined ? city.tz : (LOCATION_DATABASE[tCountry].tz !== undefined ? LOCATION_DATABASE[tCountry].tz : Math.round(city.lon / 15.0));
      }
    }
  }

  const tReturnMs = findSolarReturnTime(natalSunLon, targetYearCE, bMonth, bDay);
  const localDate = new Date(tReturnMs + tz * 3600000);

  document.getElementById('tDay').value = localDate.getUTCDate();
  document.getElementById('tMonth').value = localDate.getUTCMonth() + 1;
  document.getElementById('tYear').value = localDate.getUTCFullYear() + 543;
  document.getElementById('tHour').value = String(localDate.getUTCHours()).padStart(2, '0');
  document.getElementById('tMin').value = String(localDate.getUTCMinutes()).padStart(2, '0');
  if (typeof syncPickersFromHidden === 'function') syncPickersFromHidden();

  runCalc(true);
};

function toggleUnknownTime() {
  const bHour = document.getElementById('bHour');
  const bMin = document.getElementById('bMin');
  const btn = document.getElementById('btnUnknownTime');
  const badge = document.getElementById('lagnaBadge');
  const bTimeInput = document.getElementById('bTime');
  isUnknownTime = !isUnknownTime;
  if (badge) badge.style.display = 'none';
  if (isUnknownTime) {
    bHour.dataset.prevVal = bHour.value;
    bMin.dataset.prevVal = bMin.value;
    bHour.value = "06";
    bMin.value = "00";
    bHour.disabled = true;
    bMin.disabled = true;
    if (bTimeInput) {
      bTimeInput.dataset.prevVal = bTimeInput.value;
      bTimeInput.value = "06:00";
      bTimeInput.disabled = true;
    }
    btn.innerHTML = '✓ ไม่ทราบเวลาเกิด';
    btn.className = 'btn btn-gold';
  } else {
    bHour.value = bHour.dataset.prevVal || "08";
    bMin.value = bMin.dataset.prevVal || "00";
    bHour.disabled = false;
    bMin.disabled = false;
    if (bTimeInput) {
      bTimeInput.value = bTimeInput.dataset.prevVal || "08:00";
      bTimeInput.disabled = false;
    }
    btn.innerHTML = 'ไม่ทราบเวลาเกิด';
    btn.className = 'btn btn-ghost';
  }
}

async function runCalc(isUserClick = false) {
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

  const btn = document.getElementById('btnRunCalc');
  const wheelSvg = document.getElementById('wheel-svg');
  let originalBtnText = "";
  
  if (btn) {
    originalBtnText = btn.innerHTML;
    btn.innerHTML = '🔄 กำลังคำนวณ...';
    btn.disabled = true;
  }
  if (wheelSvg) {
    wheelSvg.style.opacity = '0.5';
    wheelSvg.style.transition = 'opacity 0.2s';
  }

  try {
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
    
    renderThaksa(by, bmo, bd, bh, bmn);
    drawWheel();
    renderTable();
    
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

    if (typeof renderFreeHoroscope === 'function') {
      renderFreeHoroscope();
    }

    saveBirthData();

    if (isUserClick) {
      // นับเป็น "ต้นทาง" ของ conversion funnel: มีคนกดผูกดวงสำเร็จ 1 ครั้ง
      trackEvent('calculator_used', { country: document.getElementById('bCountry').value });
    }
  } catch (error) {
    console.error("Calculation error:", error);
    alert('❌ เกิดข้อผิดพลาดในการคำนวณดวงชะตา: ' + (error.message || String(error)));
  } finally {
    if (btn) {
      btn.innerHTML = originalBtnText || '✦ ผูกดวง';
      btn.disabled = false;
    }
    if (wheelSvg) {
      wheelSvg.style.opacity = '1';
    }
  }
}

async function uploadScreenshotToDrive(base64Data, filename) {
  const folderId = '14Qaj4FOPwQHQQmequjHkh6O4gQMp-2mf';
  const payload = {
    action: 'uploadSlip',
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

  let lineId, name, dateVal, timeVal;
  if (bookingData) {
    lineId   = bookingData.lineId  ? bookingData.lineId.trim()  : 'NA';
    name     = bookingData.name    ? bookingData.name.trim()    : 'ไม่มีชื่อ';
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

  const rawFilename = `${lineId}_${name}_${dateVal}_${timeVal}.jpg`;
  const filename = rawFilename.replace(/[\/\\?%*:|"<>\s]/g, '_');

  let revealedForCapture = false;

  try {
    await new Promise(resolve => {
      requestAnimationFrame(() => requestAnimationFrame(resolve));
    });

    if (tabEl.classList.contains('hidden') || getComputedStyle(tabEl).display === 'none') {
      tabEl.classList.remove('hidden');
      tabEl.style.visibility = 'hidden';
      tabEl.style.position = 'absolute';
      tabEl.style.top = '-99999px';
      tabEl.style.pointerEvents = 'none';
      revealedForCapture = true;
      await new Promise(resolve => requestAnimationFrame(resolve));
    }

    const canvas = await html2canvas(tabEl, {
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#FFF8E7',
      scale: 1,
      logging: false
    });

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    const base64Data = dataUrl.split(',')[1];

    console.log("Uploading chart screenshot to Drive...");
    const result = await uploadScreenshotToDrive(base64Data, filename);
    if (result && result.success) {
      console.log("Successfully uploaded chart screenshot. File URL:", result.fileUrl);
    }
  } catch (err) {
    console.error("Failed to capture and upload chart:", err);
  } finally {
    if (revealedForCapture) {
      tabEl.classList.add('hidden');
      tabEl.style.visibility = '';
      tabEl.style.position = '';
      tabEl.style.top = '';
      tabEl.style.pointerEvents = '';
    }
  }
}

window.switchTab = function(tabId) {
  if (tabId === 'booking-tab' || tabId === 'calculator-tab' || tabId === 'my-bookings-tab') {
    ensureLocationsLoaded();
  }
  if (tabId === 'booking-tab') {
    // จุดกลางของ funnel: มีคนเปิดหน้าจองคิว (เทียบกับ calculator_used จะเห็น
    // อัตราการ "สนใจจอง" และเทียบกับจำนวนแถวใน Bookings/Cust จะเห็นอัตราจองจริงสำเร็จ)
    trackEvent('booking_tab_opened', {});
  }
  if (tabId === 'my-bookings-tab') {
    if (typeof renderFreeHoroscope === 'function') {
      renderFreeHoroscope();
    }
  }
  document.querySelectorAll('.tab-content').forEach(el => {
    el.classList.add('hidden');
    el.classList.remove('active');
  });
  
  const activeTab = document.getElementById(tabId);
  if (activeTab) {
    activeTab.classList.remove('hidden');
    activeTab.classList.add('active');
  }
  
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  const activeBtn = document.getElementById('btn-' + tabId);
  if (activeBtn) {
    activeBtn.classList.add('active');
  }

  if (typeof updateTabSEO === 'function') {
    updateTabSEO(tabId);
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Initialization
populateDateDropdowns('b', '1990-04-13');
document.getElementById('bHour').value = "08";
document.getElementById('bMin').value = "00";
populateCities('b', 'bangkok');

populateDateDropdowns('book', '1990-04-13');
document.getElementById('bookHour').value = "08";
document.getElementById('bookMin').value = "00";

const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth() + 1;
const currentDay = today.getDate();

populateDateDropdowns('t');
document.getElementById('tDay').value = currentDay;
document.getElementById('tMonth').value = currentMonth;
document.getElementById('tYear').value = currentYear + 543;

document.getElementById('tHour').value = String(today.getHours()).padStart(2, '0');
document.getElementById('tMin').value = String(today.getMinutes()).padStart(2, '0');

// Initialize Booking Date Picker
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

checkCalendarAvailability();
renderBookings();
drawWheel();
renderTable();
ensureLocationsLoaded();

// Register PWA Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then((reg) => console.log('Service Worker registered successfully with scope:', reg.scope))
      .catch((err) => console.warn('Service Worker registration failed:', err));
  });
}

// Date and Time pickers synchronization helpers
window.onBDateChange = function() {
  const dateVal = document.getElementById('bDate').value;
  if (!dateVal) return;
  const [y, m, d] = dateVal.split('-').map(Number);
  document.getElementById('bDay').value = d;
  document.getElementById('bMonth').value = m;
  document.getElementById('bYear').value = y + 543;
};

window.onBTimeChange = function() {
  const timeVal = document.getElementById('bTime').value;
  if (!timeVal) return;
  const [h, m] = timeVal.split(':');
  document.getElementById('bHour').value = h;
  document.getElementById('bMin').value = m;
};

window.onTDateChange = function() {
  const dateVal = document.getElementById('tDate').value;
  if (!dateVal) return;
  const [y, m, d] = dateVal.split('-').map(Number);
  document.getElementById('tDay').value = d;
  document.getElementById('tMonth').value = m;
  document.getElementById('tYear').value = y + 543;
};

window.onTTimeChange = function() {
  const timeVal = document.getElementById('tTime').value;
  if (!timeVal) return;
  const [h, m] = timeVal.split(':');
  document.getElementById('tHour').value = h;
  document.getElementById('tMin').value = m;
};

window.syncPickersFromHidden = function() {
  const bDay = document.getElementById('bDay').value;
  const bMonth = document.getElementById('bMonth').value;
  const bYearBE = document.getElementById('bYear').value;
  const bDateInput = document.getElementById('bDate');
  if (bDateInput && bDay && bMonth && bYearBE) {
    const yCE = parseInt(bYearBE) - 543;
    const mStr = String(bMonth).padStart(2, '0');
    const dStr = String(bDay).padStart(2, '0');
    bDateInput.value = `${yCE}-${mStr}-${dStr}`;
  }
  
  const bHour = document.getElementById('bHour').value;
  const bMin = document.getElementById('bMin').value;
  const bTimeInput = document.getElementById('bTime');
  if (bTimeInput && bHour !== undefined && bMin !== undefined) {
    const hStr = String(bHour).padStart(2, '0');
    const mStr = String(bMin).padStart(2, '0');
    bTimeInput.value = `${hStr}:${mStr}`;
    const bHourSel = document.getElementById('bHourSelect');
    const bMinSel = document.getElementById('bMinSelect');
    if (bHourSel) bHourSel.value = hStr;
    if (bMinSel) bMinSel.value = mStr;
  }
  
  const tDay = document.getElementById('tDay').value;
  const tMonth = document.getElementById('tMonth').value;
  const tYearBE = document.getElementById('tYear').value;
  const tDateInput = document.getElementById('tDate');
  if (tDateInput && tDay && tMonth && tYearBE) {
    const yCE = parseInt(tYearBE) - 543;
    const mStr = String(tMonth).padStart(2, '0');
    const dStr = String(tDay).padStart(2, '0');
    tDateInput.value = `${yCE}-${mStr}-${dStr}`;
  }
  
  const tHour = document.getElementById('tHour').value;
  const tMin = document.getElementById('tMin').value;
  const tTimeInput = document.getElementById('tTime');
  if (tTimeInput && tHour !== undefined && tMin !== undefined) {
    const hStr = String(tHour).padStart(2, '0');
    const mStr = String(tMin).padStart(2, '0');
    tTimeInput.value = `${hStr}:${mStr}`;
    const tHourSel = document.getElementById('tHourSelect');
    const tMinSel = document.getElementById('tMinSelect');
    if (tHourSel) tHourSel.value = hStr;
    if (tMinSel) tMinSel.value = mStr;
  }
};

function initHourMinSelects() {
  const bHourSel = document.getElementById('bHourSelect');
  const bMinSel = document.getElementById('bMinSelect');
  const tHourSel = document.getElementById('tHourSelect');
  const tMinSel = document.getElementById('tMinSelect');

  if (bHourSel && bMinSel) {
    bHourSel.innerHTML = Array.from({length: 24}, (_, i) => `<option value="${String(i).padStart(2, '0')}">${String(i).padStart(2, '0')}</option>`).join('');
    bMinSel.innerHTML = Array.from({length: 60}, (_, i) => `<option value="${String(i).padStart(2, '0')}">${String(i).padStart(2, '0')}</option>`).join('');
  }
  if (tHourSel && tMinSel) {
    tHourSel.innerHTML = Array.from({length: 24}, (_, i) => `<option value="${String(i).padStart(2, '0')}">${String(i).padStart(2, '0')}</option>`).join('');
    tMinSel.innerHTML = Array.from({length: 60}, (_, i) => `<option value="${String(i).padStart(2, '0')}">${String(i).padStart(2, '0')}</option>`).join('');
  }

  const bTime = document.getElementById('bTime');
  const tTime = document.getElementById('tTime');

  if (bTime && bTime.value) {
    const parts = bTime.value.split(':');
    if (parts.length >= 2) {
      if (bHourSel) bHourSel.value = parts[0];
      if (bMinSel) bMinSel.value = parts[1];
    }
  }
  if (tTime && tTime.value) {
    const parts = tTime.value.split(':');
    if (parts.length >= 2) {
      if (tHourSel) tHourSel.value = parts[0];
      if (tMinSel) tMinSel.value = parts[1];
    }
  }
}

window.syncBTime = function() {
  const hSel = document.getElementById('bHourSelect');
  const mSel = document.getElementById('bMinSelect');
  const bTime = document.getElementById('bTime');
  if (bTime && hSel && mSel) {
    bTime.value = `${hSel.value}:${mSel.value}`;
    if (typeof onBTimeChange === 'function') onBTimeChange();
  }
};

window.syncTTime = function() {
  const hSel = document.getElementById('tHourSelect');
  const mSel = document.getElementById('tMinSelect');
  const tTime = document.getElementById('tTime');
  if (tTime && hSel && mSel) {
    tTime.value = `${hSel.value}:${mSel.value}`;
    if (typeof onTTimeChange === 'function') onTTimeChange();
  }
};

window.syncHiddenDate = function(prefix) {
  const day = document.getElementById(prefix + 'Day').value;
  const month = document.getElementById(prefix + 'Month').value;
  const yearBE = document.getElementById(prefix + 'Year').value;
  const dateInput = document.getElementById(prefix + 'Date');
  if (dateInput && day && month && yearBE) {
    const yCE = parseInt(yearBE) - 543;
    const mStr = String(month).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    dateInput.value = `${yCE}-${mStr}-${dStr}`;
  }
};
