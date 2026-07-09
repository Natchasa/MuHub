// thaksa.js — Thaksa calculation and table rendering

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
    'มีลาภต่างๆ ได้คู่ บริาร ได้มรดก สัตว์ ยานพาหนะ หลักฐาน อาชีพและศึกษามีผล',
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

function renderThaksa(by, bmo, bd, bh, bmn) {
  const container = document.getElementById('thaksa-container');
  if (!container) return;

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

  const THAKSA_PLANETS = ['๑', '๒', '๓', '๔', '๗', '๕', '๘', '๖'];
  const weekdayToStartIndex = [0, 1, 2, 3, 5, 7, 4, 6];
  const birthStartIndex = weekdayToStartIndex[thaksaDay];

  const isTransitActive = showT && tData;
  age = 1;
  let isTokaLang = false;
  let transitStartIndex = birthStartIndex;

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

    const WEEKDAYS_TH = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธกลางวัน', 'วันพฤหัส', 'วันศุกร์', 'วันเสาร์', 'วันพุธกลางคืน'];
    const birthDayName = WEEKDAYS_TH[thaksaDay];
    const subtitleEl = document.getElementById('thaksa-subtitle');
    if (subtitleEl) {
      subtitleEl.innerHTML = `เกิด${birthDayName} อายุย่าง ${age} ปี`;
    }

    transitStartIndex = (birthStartIndex + (age - 1)) % 8;
    isTokaLang = false;
  } else {
    const WEEKDAYS_TH = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธกลางวัน', 'วันพฤหัส', 'วันศุกร์', 'วันเสาร์', 'วันพุธกลางคืน'];
    const birthDayName = WEEKDAYS_TH[thaksaDay];
    const subtitleEl = document.getElementById('thaksa-subtitle');
    if (subtitleEl) {
      subtitleEl.innerHTML = `เกิด${birthDayName}`;
    }
  }

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

  for (let i = 0; i < 8; i++) {
    const pos = cellPositions[i];
    const planetNum = THAKSA_PLANETS[i];
    
    const natalLabelIndex = (i - birthStartIndex + 8) % 8;
    const natalLabel = THAKSA_HOUSES[natalLabelIndex];
    
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
        // Center cell
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
