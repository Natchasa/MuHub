// state.js — Global State and Constants for MuHub Thai Horoscope

const SIGNS_TH = ['เมษ','พฤษภ','มิถุน','กรกฎ','สิงห์','กันย์',
                  'ตุลย์','พิจิก','ธนู','มกร','กุมภ์','มีน'];

const NAKSHATRA = [
  'อัศวินี','ภรณี','กฤตติกา','โรหิณี','มฤคศิรา','อาร์ทรา',
  'ปุนรวสุ','ปุษยะ','อาศเลษา','มฆา','ปูรวผลคุณี','อุตรผลคุณี',
  'หัสตะ','จิตรา','สวาติ','วิศาขา','อนุราธา','เชยษฐา',
  'มูลา','ปูรวาษาฑา','อุตราษาฑา','ศรวณะ','ธนิษฐา','ศตภิษา',
  'ปูรวภัทรปทา','อุตรภัทรปทา','เรวดี'
];

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

const MONTHS_TH = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const WEEKDAYS_SHORT_TH = [
  'วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'
];

// Global State Variables
let LOCATION_DATABASE = {};
let nData = null;
let tData = null;
let showN = true;
let showT = true;
let age = 1;
let birthYear = 1990;
let birthMonth = 4;
let birthDay = 13;
let birthHour = 8;
let birthMin = 0;
let isUnknownTime = false;

// ── Conversion funnel tracking ─────────────────────────────────────────────
// เก็บสถิติง่ายๆ ว่ามีคนกด "ผูกดวง" กี่คน เทียบกับกี่คนที่จองจริง (ข้อมูลจองมีอยู่
// แล้วในชีต Bookings/Cust แต่ยังไม่มีตัวเลข "ต้นทาง" ว่ามีคนใช้เครื่องคำนวณกี่คน)
// ยิงแบบ fire-and-forget เสมอ ไม่บล็อก UI และไม่โชว์ error ให้ลูกค้าเห็นแม้
// เซิร์ฟเวอร์ Excel จะปิดอยู่ (เช่นตอนเปิดแอปแบบ static ไม่ผ่าน server.py)
let _muhubSessionId = null;
function getMuhubSessionId() {
  if (!_muhubSessionId) {
    _muhubSessionId = 'S-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  }
  return _muhubSessionId;
}

function trackEvent(eventName, detail) {
  try {
    const token = (typeof APP_API_TOKEN !== 'undefined') ? APP_API_TOKEN : '';
    fetch('http://localhost:5001/api/track-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-App-Token': token },
      body: JSON.stringify({
        event: eventName,
        sessionId: getMuhubSessionId(),
        detail: detail || {}
      })
    }).catch(() => { /* เงียบไว้ ไม่กระทบลูกค้าถ้า tracking server ปิดอยู่ */ });
  } catch (e) {
    // no-op — tracking ต้องไม่มีวันทำให้ฟีเจอร์หลักพัง
  }
}
