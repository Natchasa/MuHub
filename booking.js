// หมายเหตุ: ค่านี้ต้องตรงกับ APP_API_TOKEN ใน config.json ของ muhub_excel_server.py
// เนื่องจากเป็น static frontend (ไม่มี login/session) ค่านี้จะมองเห็นได้ผ่าน view-source
// เสมอ จึงช่วยกันบอท/สคริปต์กราดสุ่มยิงเท่านั้น ไม่ใช่การยืนยันตัวตนที่ปลอดภัย 100%
const APP_API_TOKEN = "8X8BL4z7J8BMqi403bXNUkgrZgSNtu19WWPp1ltuyOY";

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
    this.calendarId = calendarId;
  }

  async fetchBusySlots(dateStr) {
    const url = `/api/calendar/busy?date=${encodeURIComponent(dateStr)}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      return data.busy_slots || [];
    } catch (e) {
      console.error("GCal proxy fetch busy slots error:", e);
      throw e;
    }
  }

  async blockEvent(dateStr, slotStr, name, lineId, serviceName, astrologerName, questions = '') {
    const url = `/api/calendar/block`;
    const payload = { dateStr, slotStr, name, lineId, serviceName, astrologerName, questions };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (response.status !== 200) {
        throw new Error(data.detail || 'Apps Script proxy error');
      }
      return data;
    } catch (e) {
      console.error("Block event proxy error:", e);
      throw new Error("ไม่สามารถบันทึกลงปฏิทินได้: " + e.message);
    }
  }

  async deleteEvent(eventId) {
    if (!eventId) return { success: false, error: "No event ID provided" };
    const url = `/api/calendar/delete`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId })
      });
      return await response.json();
    } catch (e) {
      console.error("Delete event proxy error:", e);
      return { success: false, error: e.message };
    }
  }

  async uploadSlip(base64Data, mimeType, filename) {
    const url = `/api/calendar/upload-slip`;
    const payload = { base64Data, mimeType, filename };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (response.status !== 200) {
        throw new Error(data.detail || 'Upload slip proxy error');
      }
      return data;
    } catch (e) {
      console.error("Upload slip proxy error:", e);
      throw new Error("ไม่สามารถส่งไฟล์สลิปได้: " + e.message);
    }
  }
}

window.onAstrologerChange = function() {
  document.getElementById('selectedTime').value = '';
  document.querySelectorAll('.slot-btn').forEach(el => el.classList.remove('active'));
  hideStatusMessage();
  checkCalendarAvailability();
};

let calendarService = new GoogleCalendarService();

window.onGCalApiKeyChange = function() {
  const badge = document.getElementById('gcalStatusBadge');
  if (badge) {
    badge.innerHTML = '<span style="width: 6px; height: 6px; border-radius: 50%; background: #2A6BAD; display: inline-block;"></span> เชื่อมต่อข้อมูลจริงผ่าน Server (Secure)';
    badge.style.color = '#2A6BAD';
    badge.style.backgroundColor = '#E1F5FE';
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

  // Render slots immediately so they are visible before checking schedule
  const currentSlots = container.querySelectorAll('.slot-btn');
  if (currentSlots.length === 0) {
    renderSlotsWithBusyRanges([]);
  }

  const dateVal = datePicker.value;
  if (!dateVal) {
    return;
  }

  if (loader) loader.style.display = 'inline';

  try {
    const busyRanges = await calendarService.fetchBusySlots(dateVal);
    renderSlotsWithBusyRanges(busyRanges);
  } catch (error) {
    console.warn("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์หลังบ้านได้ ระบบสลับไปใช้โหมดจำลองช่วงเวลาว่าง (Offline/Simulated Mode):", error);
    // จำลองช่วงเวลาที่ไม่ว่างตามตัวเลขวันที่เพื่อให้สามารถจำลองจองคิวทดสอบได้
    const parts = dateVal.split("-");
    const day = parts.length > 2 ? (parseInt(parts[2], 10) || 1) : 1;
    const mockBusy = [
      { startHour: (day % 8) + 9, endHour: (day % 8) + 10 },
      { startHour: ((day + 3) % 8) + 12, endHour: ((day + 3) % 8) + 13 }
    ];
    renderSlotsWithBusyRanges(mockBusy);
  } finally {
    if (loader) loader.style.display = 'none';
  }
};

function getSelectedSessionDuration() {
  const select = document.getElementById('bookAstrologer');
  if (!select) return 45;
  const selectedOption = select.options[select.selectedIndex];
  if (!selectedOption) return 45;
  const match = selectedOption.textContent.match(/(\d+)\s*นาที/);
  if (match) {
    return parseInt(match[1], 10);
  }
  return 45;
}

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
  
  // เลื่อนหน้าจอลงไปยังฟอร์มกรอกข้อมูลจองคิวโดยอัตโนมัติอย่างนุ่มนวล
  const formCard = document.getElementById('bookingFormCard');
  if (formCard) {
    setTimeout(() => {
      formCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }
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
  
  // Clear promo code input and state
  const promoInput = document.getElementById('promoCodeInput');
  if (promoInput) promoInput.value = '';
  const promoMsg = document.getElementById('promoCodeMessage');
  if (promoMsg) {
    promoMsg.style.display = 'none';
    promoMsg.textContent = '';
  }
  window.isFreeBooking = false;
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
    // Check if code has expired (valid until 31/12/2026)
    const now = new Date();
    const expiryLimit = new Date(2026, 11, 31, 23, 59, 59);
    if (now > expiryLimit) {
      window.isFreeBooking = false;
      messageEl.style.display = 'block';
      messageEl.style.color = '#d32f2f';
      messageEl.textContent = '❌ โค้ด "MUHUBFIRST" หมดอายุการใช้งานแล้ว (หมดเขต 31 ธ.ค. 2569)';
      if (qrSection) qrSection.style.display = 'flex';
      if (slipSection) slipSection.style.display = 'block';
      return;
    }

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
      headers: { "Content-Type": "application/json", "X-App-Token": APP_API_TOKEN },
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
  const promoInput = document.getElementById('promoCodeInput');
  if (promoInput) promoInput.value = '';
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
    alert(`✅ อัปโหลดสลิปหลักฐานสำเร็จ! หมายเลขคิวของคุณคือ: ${queueId}${uploadStatus}${blockStatus}${lineNotice}\nระบบได้รับข้อมูลเรียบร้อยแล้วค่ะ ทางแอดมินจะตรวจสอบสลิปและอนุมัติคิวให้คุณโดยเร็วที่สุดค่ะ`);
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

// ── Excel Server Real Booking Status Polling ────────────────────────────────
async function checkPendingBookings() {
  const pendingBookings = MY_BOOKINGS.filter(b => b.status === 'pending');
  if (pendingBookings.length === 0) return;

  let updatedAny = false;
  for (const b of pendingBookings) {
    try {
      const res = await fetch(`http://localhost:5001/api/booking-status?queueId=${encodeURIComponent(b.id)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.found && data.status === 'confirmed') {
          b.status = 'confirmed';
          b.statusText = 'คอนเฟิร์มนัด';
          b.statusSub = data.raw_status || 'บันทึกสำเร็จ';
          updatedAny = true;
          console.log(`[BookingStatus] Booking ${b.id} has been confirmed on Excel server!`);
          alert(`🔔 แจ้งเตือน: คิวจองหมายเลข ${b.id} ของคุณได้รับการอนุมัติและยืนยันคิวเรียบร้อยแล้วค่ะ!`);
        }
      }
    } catch (err) {
      console.warn(`[BookingStatus] Failed to check status for ${b.id}:`, err.message);
    }
  }

  if (updatedAny) {
    saveBookings();
    renderBookings();
  }
}

// Start polling every 15 seconds, and check once immediately on page load
setInterval(checkPendingBookings, 15000);
setTimeout(checkPendingBookings, 1000);
