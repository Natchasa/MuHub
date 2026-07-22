// free-horoscope.js — Free Horoscope Analysis and Thai Numerology System

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

const THAI_NUMEROLOGY_MAP = {
  'ก': 1, 'ด': 1, 'ท': 1, 'ถ': 1, 'ภ': 1, 'า': 1, 'ุ': 1, '่': 1,
  'ข': 2, 'ช': 2, 'บ': 2, 'ป': 2, 'ง': 2, 'เ': 2, 'แ': 2, 'ู': 2, '้': 2,
  'ค': 3, 'ฆ': 3, 'ต': 3, 'ฑ': 3, 'ฒ': 3, 'ู': 3, 'ั': 3, 'ี': 3, '็': 3,
  'ค': 4, 'ธ': 4, 'ญ': 4, 'ร': 4, 'ว': 4, 'ะ': 4, 'ิ': 4, 'โ': 4, 'ุ': 4,
  'ฉ': 5, 'ฌ': 5, 'ฎ': 5, 'ณ': 5, 'น': 5, 'ม': 5, 'ห': 5, 'ฬ': 5, 'ึ': 5, 'ุ': 5,
  'จ': 6, 'ล': 6, 'ว': 6, 'อ': 6, 'ใ': 6, 'ู': 6, 'ู': 6, 'ิ': 6,
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
    desc: "เป็นการรวมกันของดาวพฤหัสบดี (5) และดาวพุธ (4) ส่งเสริมพลังสติปัญญาและความรอบความรอบรู้ลึกซึ้ง ประสบความสำเร็จในธุรกิจการงานอย่างมั่นคง มีคุณธรรมสูงและได้รับการยอมรับนับถือจากคนทุกระดับ"
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

window.renderFreeHoroscope = function() {
  const noDataView = document.getElementById('free-no-data-view');
  const dashboardView = document.getElementById('free-dashboard-view');
  if (!noDataView || !dashboardView) return;
  
  // แสดงแดชบอร์ดหลักเสมอเพื่อให้เข้าถึง ปฏิทิน/เซียมซี/วิเคราะห์ชื่อ ได้ทันที
  noDataView.style.display = 'none';
  dashboardView.style.display = 'block';
  
  const hasData = !!nData;
  
  // ซ่อน/แสดง แบนเนอร์แนะนำให้กรอกข้อมูลวันเกิด
  const suggestBanner = document.getElementById('free-bind-suggest-banner');
  if (suggestBanner) {
    suggestBanner.style.display = hasData ? 'none' : 'block';
  }
  // ซ่อน/แสดง ปุ่มนำทางด่วนบนหัวแดชบอร์ดตามสถานะข้อมูลดวงชะตา
  const navTransit = document.getElementById('btn-nav-transit');
  const navLagna = document.getElementById('btn-nav-lagna');
  if (navTransit) navTransit.style.display = hasData ? 'inline-block' : 'none';
  if (navLagna) navLagna.style.display = hasData ? 'inline-block' : 'none';
  // ซ่อน/แสดง การ์ดวิเคราะห์ดวงชะตาเฉพาะบุคคล
  const personalCards = ['free-card-transit', 'free-card-lagna'];
  personalCards.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = hasData ? 'block' : 'none';
  });

  if (window.selectSiimsiDeity) {
    window.selectSiimsiDeity(activeSiimsiDeity);
  }

  if (window.renderAuspiciousCalendar) {
    window.renderAuspiciousCalendar();
  }
  
  const welcomeTitle = document.getElementById('free-welcome-title');
  if (welcomeTitle) {
    welcomeTitle.textContent = hasData 
      ? `คำทำนายดวงเฉพาะคุณ ของคุณ${nData.name}` 
      : 'คำทำนายดวงเฉพาะคุณ';
  }
  
  const thaksaMeta = document.getElementById('free-thaksa-meta');
  if (!hasData) {
    if (thaksaMeta) {
      thaksaMeta.textContent = 'กรุณาผูกดวงชะตาในแท็บแรกเพื่อไฮไลท์วันเกิดของคุณ';
    }
    if (typeof renderDailyColorsTable === 'function') renderDailyColorsTable(null);
    return;
  }
  
  const lagnaSp = signPos(nData.pos.lagna);
  const lagnaIdx = lagnaSp.si;
  
  const badge = document.getElementById('free-lagna-badge');
  const desc = document.getElementById('free-lagna-desc');
  if (badge) badge.textContent = `ลัคนาราศี${SIGNS_TH[lagnaIdx]}`;
  if (desc) desc.textContent = ZODIAC_READINGS[lagnaIdx] || 'ไม่พบคำทำนายราศีเกิด';
  
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
      thaksaDay = 7;
    }
  }
  
  let currentAge = 1;
  const isTransitActive = showT && tData;
  if (isTransitActive) {
    const tYearBE = parseInt(document.getElementById('tYear').value);
    const ty = tYearBE - 543;
    const tmo = parseInt(document.getElementById('tMonth').value);
    const td = parseInt(document.getElementById('tDay').value);
    
    currentAge = ty - by;
    const birthInTransitYear = new Date(ty, bmo - 1, bd, bh, bmn);
    const transitDateTime = new Date(ty, tmo - 1, td, 12, 0);
    if (transitDateTime > birthInTransitYear) {
      currentAge += 1;
    }
    currentAge = Math.max(1, currentAge);
  } else {
    const today = new Date();
    currentAge = today.getFullYear() - by;
    const birthThisYear = new Date(today.getFullYear(), bmo - 1, bd, bh, bmn);
    if (today > birthThisYear) {
      currentAge += 1;
    }
    currentAge = Math.max(1, currentAge);
  }
  
  const WEEKDAYS_TH = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธกลางวัน', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์', 'วันพุธกลางคืน'];
  if (thaksaMeta) {
    thaksaMeta.textContent = `วันเกิดของคุณ: ${WEEKDAYS_TH[thaksaDay]}ที่ ${bd} ${THAI_MONTH_NAMES[bmo-1]} พ.ศ. ${by + 543} | อายุย่าง: ${currentAge} ปี`;
  }

  if (typeof renderYearlyThaksaColors === 'function') {
    renderYearlyThaksaColors(thaksaDay, currentAge);
  }
  
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
    
    if ([1, 5, 9, 10].includes(hJupiter)) scoreWork += 1;
    if ([1, 10].includes(hVenus)) scoreWork += 0.5;
    if ([5, 10].includes(hMercury)) scoreWork += 0.5;
    if ([10, 1].includes(hSaturn)) scoreWork -= 1;
    if ([10, 1].includes(hRahu)) scoreWork -= 0.5;
    if (hMars === 10) scoreWork -= 0.5;
    
    if ([2, 11, 5, 9].includes(hJupiter)) scoreMoney += 1;
    if ([2, 11].includes(hVenus)) scoreMoney += 1;
    if ([2, 11].includes(hMercury)) scoreMoney += 0.5;
    if ([2, 11].includes(hSaturn)) scoreMoney -= 1;
    if ([2, 11].includes(hRahu)) scoreMoney -= 0.5;
    
    if ([1, 5, 7].includes(hVenus)) scoreLove += 1.5;
    if ([1, 5, 7].includes(hJupiter)) scoreLove += 1;
    if (hSaturn === 7) scoreLove -= 1;
    if (hRahu === 7) scoreLove -= 0.5;
    if (hMars === 7) scoreLove -= 0.5;
    
    if ([1, 6, 8].includes(hSaturn)) scoreHealth -= 1;
    if ([1, 8].includes(hRahu)) scoreHealth -= 1;
    if ([1, 6, 8].includes(hMars)) scoreHealth -= 0.5;
    if ([1, 9].includes(hJupiter)) scoreHealth += 1;
  } else {
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
  
  scoreWork = Math.max(1, Math.min(5, Math.round(scoreWork)));
  scoreMoney = Math.max(1, Math.min(5, Math.round(scoreMoney)));
  scoreLove = Math.max(1, Math.min(5, Math.round(scoreLove)));
  scoreHealth = Math.max(1, Math.min(5, Math.round(scoreHealth)));
  
  // Calculate scoreOverall as a weighted average
  let scoreOverall = scoreWork * 0.3 + scoreMoney * 0.3 + scoreLove * 0.2 + scoreHealth * 0.2;
  scoreOverall = Math.max(1.0, Math.min(5.0, Math.round(scoreOverall * 10) / 10)); // round to 1 decimal place
  
  // Update Legend Labels
  const updateLegend = () => {
    const elOverall = document.getElementById('free-val-overall');
    const elWork = document.getElementById('free-val-work');
    const elMoney = document.getElementById('free-val-money');
    const elLove = document.getElementById('free-val-love');
    const elHealth = document.getElementById('free-val-health');
    
    if (elOverall) elOverall.textContent = scoreOverall.toFixed(1) + ' / 5.0';
    if (elWork) elWork.textContent = scoreWork.toFixed(1) + ' / 5.0';
    if (elMoney) elMoney.textContent = scoreMoney.toFixed(1) + ' / 5.0';
    if (elLove) elLove.textContent = scoreLove.toFixed(1) + ' / 5.0';
    if (elHealth) elHealth.textContent = scoreHealth.toFixed(1) + ' / 5.0';
  };
  
  updateLegend();
  
  // Draw the spiderweb radar chart!
  if (window.drawRadarChart) {
    window.drawRadarChart(scoreOverall, scoreWork, scoreMoney, scoreLove, scoreHealth);
  }
};

function interpretNumber(num, partName) {
  if (PREDEFINED_NUMEROLOGY[num]) {
    return PREDEFINED_NUMEROLOGY[num];
  }
  
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
    const p = NUMEROLOGY_PLANETS[digits[0]] || NUMEROLOGY_PLANETS[9];
    title = `พลังแห่ง${p.name}`;
    desc = `ตัวเลขนี้ได้รับอิทธิพลโดยตรงจาก ${p.name} ซึ่งสื่อถึง ${p.quality} ส่งเสริมให้ชะตาชีวิตมีจุดเด่นในเรื่องดังกล่าวอย่างเด่นชัด มีโอกาสทางหน้าที่การงานที่ดี`;
  } else {
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
    alert("คุณไม่ได้ผูกดวง สามารถพิมพ์ชื่อนามสกุลเพื่อวิเคราะห์ได้เลยครับ");
    return;
  }
  
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
  
  const thaiRegex = /^[ก-์\s]+$/;
  if (!thaiRegex.test(firstName) || !thaiRegex.test(lastName)) {
    alert("กรุณากรอกชื่อและนามสกุลเป็นภาษาไทยเท่านั้นครับ (ไม่ใส่ตัวเลขหรือภาษาอังกฤษ)");
    return;
  }
  
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
  
  const nameInterpretation = interpretNumber(nameResult.sum, 'ชื่อ');
  const lastNameInterpretation = interpretNumber(lastNameResult.sum, 'นามสกุล');
  const totalInterpretation = interpretNumber(totalSum, 'รวม');
  
  function getNumerologyColor(grade) {
    if (grade.includes('มงคล')) {
      return '#2e7d32';
    } else if (grade.includes('ควรระวัง') || grade.includes('เสีย')) {
      return '#d32f2f';
    } else {
      return '#111111';
    }
  }
  
  const nameColor = getNumerologyColor(nameInterpretation.grade);
  const lastNameColor = getNumerologyColor(lastNameInterpretation.grade);
  const totalColor = getNumerologyColor(totalInterpretation.grade);
  
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
  
  const resultDiv = document.getElementById('numerologyResult');
  if (resultDiv) {
    resultDiv.style.display = 'block';
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
};

// ── AUSPICIOUS DAYS CALENDAR SYSTEM ─────────────────────────────────────────
let calendarCurrentYear = new Date().getFullYear();
let calendarCurrentMonth = new Date().getMonth();
let calendarSelectedDay = new Date().getDate();

const THAI_MONTH_NAMES = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];

function getKalayogaForDate(year, month, day) {
  // Thai Songkran (วันเถลิงศก) is around April 16 (month is 0-indexed: 3 = April)
  // If date is before April 16, use the previous Julasakaraj year
  let beYear = year + 543;
  if (month < 3 || (month === 3 && day < 16)) {
    beYear -= 1;
  }
  let j = beYear - 1181; // Julasakaraj

  // Official Kalayoga lookup table per Julasakaraj (0=Sun, 1=Mon, ..., 6=Sat)
  const KALAYOGA_TABLE = {
    1380: { thongchai: 5, athipati: 0, ubat: 2, lokawinat: 4 }, // 2561
    1381: { thongchai: 6, athipati: 1, ubat: 3, lokawinat: 5 }, // 2562
    1382: { thongchai: 1, athipati: 3, ubat: 5, lokawinat: 0 }, // 2563
    1383: { thongchai: 2, athipati: 4, ubat: 6, lokawinat: 1 }, // 2564
    1384: { thongchai: 3, athipati: 2, ubat: 5, lokawinat: 0 }, // 2565
    1385: { thongchai: 6, athipati: 3, ubat: 0, lokawinat: 5 }, // 2566
    1386: { thongchai: 2, athipati: 4, ubat: 6, lokawinat: 1 }, // 2567
    1387: { thongchai: 4, athipati: 0, ubat: 1, lokawinat: 6 }, // 2568
    1388: { thongchai: 0, athipati: 2, ubat: 4, lokawinat: 6 }, // 2569
    1389: { thongchai: 3, athipati: 5, ubat: 0, lokawinat: 2 }, // 2570
    1390: { thongchai: 1, athipati: 3, ubat: 5, lokawinat: 0 }, // 2571
    1391: { thongchai: 6, athipati: 1, ubat: 3, lokawinat: 5 }, // 2572
    1392: { thongchai: 4, athipati: 0, ubat: 1, lokawinat: 6 }, // 2573
    1393: { thongchai: 2, athipati: 4, ubat: 6, lokawinat: 1 }, // 2574
    1394: { thongchai: 0, athipati: 2, ubat: 4, lokawinat: 6 }  // 2575
  };

  if (KALAYOGA_TABLE[j]) {
    return KALAYOGA_TABLE[j];
  }

  // Suriyayatra formula calculation fallback
  const H = Math.floor((j * 292207 + 373) / 800);
  const w_t = (H + 3) % 7;
  return {
    thongchai: (w_t + 1) % 7,
    athipati: w_t % 7,
    ubat: (w_t + 3) % 7,
    lokawinat: (w_t + 5) % 7
  };
}

function getRealEphemerisTransitAspect(year, month, day) {
  // Calibrated Vedic Lahiri Ayanamsa Benchmark (นิรายนะระบบลาหิรี N.C. Lahiri Ephemeris):
  // Benchmark Epoch: July 16, 2026 at 12:00 PM ICT (05:00 UTC)
  // At this exact moment, Lahiri Moon (๒) is at 104.0° (Cancer / ราศีกรกฎ - Pushya / ปุษยนักษัตร สมโณฤกษ์)
  const epoch2026Jul16 = Date.UTC(2026, 6, 16, 5, 0, 0);
  const targetDate = Date.UTC(year, month, day, 5, 0, 0);
  const daysDiff = (targetDate - epoch2026Jul16) / 86400000;
  const weekday = new Date(year, month, day).getDay();

  // Moon daily motion rate = ~13.17639° / day (Lahiri Sidereal Ayanamsa System)
  const moonDeg = ((104.0 + daysDiff * 13.17639) % 360 + 360) % 360;
  const moonSignIdx = Math.floor(moonDeg / 30);
  const nakshatraIdx = Math.floor(moonDeg / (360 / 27));

  const ZODIAC_NAMES = ["เมษ", "พฤษภ", "เมถุน", "กรกฎ", "สิงห์", "กันย์", "ตุลย์", "พิจิก", "ธนู", "มังกร", "กุมภ์", "มีน"];
  const WEEKDAY_PLANET_NAMES = ["ดาวอาทิตย์ (๑)", "ดาวจันทร์ (๒)", "ดาวอังคาร (๓)", "ดาวพุธ (๔)", "ดาวพฤหัสบดี (๕)", "ดาวศุกร์ (๖)", "ดาวเสาร์ (๗)"];

  const NAKSHATRA_27_FULL = [
    "อัศวินี (ทลิทโทฤกษ์ - ฤกษ์เริ่มต้นบุกเบิกงานใหม่)",
    "ภรณี (มหัทธโนฤกษ์ - ฤกษ์มหาเศรษฐีโชคลาภ)",
    "กฤตติกา (โจโรฤกษ์ - ฤกษ์ชิงชัยและฝ่าฟันอุปสรรค)",
    "โรหิณี (ภูมิปาโลฤกษ์ - ฤกษ์แผ่นดินตั้งมั่นและที่อยู่อาศัย)",
    "มฤคศิระ (เทศาตรีฤกษ์ - ฤกษ์การค้าและมิตรภาพ)",
    "อารทรา (เทวีฤกษ์ - ฤกษ์มหาเสน่ห์และเมตตามหานิยม)",
    "ปุนัพพสุ (ราชาฤกษ์ - ฤกษ์บารมีและเกียรติยศ)",
    "ปุษยะ (สมโณฤกษ์ - ฤกษ์ความสงบ ทำบุญและปฏิบัติธรรม)",
    "อาศเลษา (ทักษาฤกษ์ - ฤกษ์ฟื้นฟูและเสริมความสมบูรณ์)",

    "มาฆะ (ทลิทโทฤกษ์ - ฤกษ์เริ่มต้นบุกเบิกงานใหม่)",
    "บุพพผลคุนี (มหัทธโนฤกษ์ - ฤกษ์มหาเศรษฐีโชคลาภ)",
    "อุตตรผลคุนี (โจโรฤกษ์ - ฤกษ์ชิงชัยและฝ่าฟันอุปสรรค)",
    "หัสตะ (ภูมิปาโลฤกษ์ - ฤกษ์แผ่นดินตั้งมั่นและอสังหาฯ)",
    "จิตรา (เทศาตรีฤกษ์ - ฤกษ์การค้า วาทศิลป์และบันเทิง)",
    "สวาตี (เทวีฤกษ์ - ฤกษ์มหาเสน่ห์และความงาม)",
    "วิสาขะ (ราชาฤกษ์ - ฤกษ์มหาชัยชนะและบารมี)",
    "อนุราธะ (สมโณฤกษ์ - ฤกษ์ความสงบ สวดมนต์และสร้างบุญ)",
    "เชษฐะ (ทักษาฤกษ์ - ฤกษ์เสริมสิริมงคลฟื้นฟูดวง)",

    "มูละ (ทลิทโทฤกษ์ - ฤกษ์เริ่มต้นบุกเบิกงานใหม่)",
    "บุพพาษาฒ (มหัทธโนฤกษ์ - ฤกษ์มหาเศรษฐีโชคลาภ)",
    "อุตตราษาฒ (โจโรฤกษ์ - ฤกษ์ชิงชัยและแก้ปัญหา)",
    "ศรวณะ (ภูมิปาโลฤกษ์ - ฤกษ์วางรากฐานมั่นคง)",
    "ธนิษฐา (เทศาตรีฤกษ์ - ฤกษ์การค้าและสังสรรค์)",
    "ศตภิษัช (เทวีฤกษ์ - ฤกษ์เสน่หาความผาสุก)",
    "บุพพภัทรบท (ราชาฤกษ์ - ฤกษ์รับตำแหน่งบารมี)",
    "อุตตรภัทรบท (สมโณฤกษ์ - ฤกษ์ความสงบจิตใจ)",
    "เรวดี (ทักษาฤกษ์ - ฤกษ์มงคลสมบูรณ์พูนสุข)"
  ];

  const moonNakshatraFull = NAKSHATRA_27_FULL[nakshatraIdx % 27];
  const dayLordName = WEEKDAY_PLANET_NAMES[weekday];
  const moonSignName = ZODIAC_NAMES[moonSignIdx];

  return `ดาวจันทร์ (๒) จรในราศี${moonSignName} เสวย${moonNakshatraFull} ผสานพลัง${dayLordName}ประจำวัน หนุนพลังโชคลาภ ความสำเร็จ และกิจกรรมมงคล`;
}

function getSunAspectReadings(year, month, day) {
  const epoch2026Jul16 = Date.UTC(2026, 6, 16, 5, 0, 0);
  const targetDate = Date.UTC(year, month, day, 5, 0, 0);
  const daysDiff = (targetDate - epoch2026Jul16) / 86400000;

  // 1. Sun Longitude (๑) ~0.9856° / day (Base: July 16, 2026 = 93.0° Cancer 3°)
  const sunDeg = ((93.0 + daysDiff * 0.9856) % 360 + 360) % 360;
  const sunSignIdx = Math.floor(sunDeg / 30);

  // 2. Moon Longitude (๒) ~13.17639° / day (Base: July 16, 2026 = 104.0° Pushya)
  const moonDeg = ((104.0 + daysDiff * 13.17639) % 360 + 360) % 360;
  const moonSignIdx = Math.floor(moonDeg / 30);

  // 3. Jupiter Longitude (๕) ~0.0831° / day
  const jupDeg = ((72.0 + daysDiff * 0.0831) % 360 + 360) % 360;
  const jupSignIdx = Math.floor(jupDeg / 30);

  // 4. Saturn Longitude (๗) ~0.0334° / day
  const satDeg = ((346.0 + daysDiff * 0.0334) % 360 + 360) % 360;
  const satSignIdx = Math.floor(satDeg / 30);

  // 5. Mars Longitude (๓) ~0.524° / day
  const marsDeg = ((45.0 + daysDiff * 0.524) % 360 + 360) % 360;
  const marsSignIdx = Math.floor(marsDeg / 30);

  // Aspect Differences relative to Sun (๑)
  const moonDiff = (moonSignIdx - sunSignIdx + 12) % 12;
  const jupDiff = (jupSignIdx - sunSignIdx + 12) % 12;
  const satDiff = (satSignIdx - sunSignIdx + 12) % 12;
  const marsDiff = (marsSignIdx - sunSignIdx + 12) % 12;

  let goodEffects = [];
  let badEffects = [];

  // Evaluate Good Aspects (กุม 0, โยค 2/10, ตรีโกณ 4/8)
  if ([0, 2, 4, 8, 10].includes(moonDiff)) {
    goodEffects.push("ดาวจันทร์ (๒) ทำมุมดี (กุม/โยค/ตรีโกณ) หนุนเสน่ห์และโชคลาภ");
  }
  if ([0, 2, 4, 8, 10].includes(jupDiff)) {
    goodEffects.push("ดาวพฤหัสบดี (๕) ทำมุมมิตรใหญ่ส่งกำลัง เสริมบารมีผู้ใหญ่เอ็นดู");
  }
  if (goodEffects.length === 0) {
    goodEffects.push("ดาวอาทิตย์ (๑) ส่องสว่างราบรื่น เหมาะแก่การดำเนินชีวิตตามปกติ");
  }

  // Evaluate Bad Aspects (ฉาก 3/9, อริ 5, มรณะ 7, วินาศ 11)
  if ([3, 5, 7, 9, 11].includes(satDiff)) {
    badEffects.push("ดาวเสาร์ (๗) ทำมุมร้าย (ฉาก/อริ/มรณะ/วินาศ) สื่อถึงภาระงานสะสมและการอึดอัดใจ");
  }
  if ([3, 5, 7, 9, 11].includes(marsDiff)) {
    badEffects.push("ดาวอังคาร (๓) ทำมุมขัดแย้ง สื่อถึงความใจร้อนและเสี่ยงปะทะอารมณ์");
  }
  if ([3, 5, 7, 9, 11].includes(moonDiff)) {
    badEffects.push("ดาวจันทร์ (๒) ทำมุมขัดแย้ง สื่อถึงอารมณ์แปรปรวนและเอกสารผิดพลาด");
  }
  if (badEffects.length === 0) {
    badEffects.push("ความประมาทในการลงทุนและการสื่อสารที่ไม่ชัดเจน");
  }

  return {
    suitableText: goodEffects[0],
    avoidText: badEffects[0]
  };
}

function getAuspiciousDetails(year, month, day) {
  const weekday = new Date(year, month, day).getDay(); // 0 = Sun ... 6 = Sat
  const kalayoga = getKalayogaForDate(year, month, day);

  const DIRECTIONS_POOL = [
    "ทิศตะวันออก", "ทิศตะวันออกเฉียงใต้", "ทิศตะวันออกเฉียงเหนือ",
    "ทิศใต้", "ทิศเหนือ", "ทิศตะวันตกเฉียงใต้", "ทิศตะวันตกเฉียงเหนือ"
  ];
  const direction = DIRECTIONS_POOL[(day + month * 2) % DIRECTIONS_POOL.length];

  const WEEKDAY_TIMES = [
    "• 06:09 - 07:30 น.<br>• 13:30 - 15:00 น.",
    "• 08:19 - 09:30 น.<br>• 14:15 - 15:45 น.",
    "• 09:09 - 10:30 น.<br>• 15:15 - 16:30 น.",
    "• 08:30 - 09:45 น.<br>• 13:30 - 15:00 น.",
    "• 09:39 - 11:00 น.<br>• 15:39 - 17:00 น.",
    "• 07:49 - 09:15 น.<br>• 12:49 - 14:15 น.",
    "• 10:09 - 11:30 น.<br>• 16:09 - 17:30 น."
  ];

  const LUCKY_NUM_PATTERNS = [
    "1, 5, 9", "2, 4, 6", "3, 8, 9", "5, 6, 8", "1, 4, 7",
    "2, 5, 8", "3, 6, 9", "4, 7, 9", "1, 6, 8", "2, 7, 9"
  ];
  const numbers = LUCKY_NUM_PATTERNS[(day * 11 + month * 7 + year) % LUCKY_NUM_PATTERNS.length];

  // คำนวณตำแหน่งมุมดาวจรจริงตามคัมภีร์สุริยยาตร์ / ดาราศาสตร์จริงประจำวันนั้นๆ
  const transitAspect = getRealEphemerisTransitAspect(year, month, day);
  const sunAspects = getSunAspectReadings(year, month, day);

  const MEANING_MATRIX = {
    thongchai: [
      "ฤกษ์วันธงชัยแห่งเกียรติยศและโชคลาภ กระแสพลังงานดาวส่งเสริมให้ดวงชะตามีพลังบารมีโดดเด่น เหมาะอย่างยิ่งสำหรับการเปิดตัวธุรกิจใหม่ การออกรถใหม่รับทรัพย์ หรือการยื่นข้อเสนอโครงการใหญ่ การเจรจาค้าขายในวันนี้มีโอกาสได้รับการตอบรับและผลประโยชน์สูง มีเกณฑ์ได้รับข่าวดีเรื่องเงินทองและความช่วยเหลือจากมิตรแท้",
      "ฤกษ์วันธงชัยมหาเสน่ห์และโภคทรัพย์ พลังงานดาวส่องสว่างส่งผลดีเลิศต่อการเงินและการค้าขาย การเจรจาตกลงสัญญาคล่องตัว ผู้ใหญ่และผู้ร่วมงานให้ความเมตตาเอ็นดู เหมาะแก่การจัดงานมงคลสมรส ขึ้นบ้านใหม่ หรือเปิดร้านค้าเพื่อดึงดูดลูกค้าและโชคลาภเงินทองเข้ามาไม่ขาดสาย",
      "ฤกษ์วันธงชัยมหาชัยชนะแห่งการบุกเบิก ขับเคลื่อนพลังความกล้าหาญและความมั่นใจ เหมาะแก่การเริ่มต้นสิ่งใหม่ๆ การเอาชนะอุปสรรคที่ค้างคา การเจรจาทวงสิทธิ์ หรือการแข่งขันทางธุรกิจ มีโอกาสได้รับชัยชนะและความสำเร็จสูง ขจัดความลังเลสงสัยแล้วลุยทำตามแผนได้อย่างมั่นใจ",
      "ฤกษ์วันธงชัยวาทศิลป์การค้า เด่นด้านการสื่อสารและการลงนามเอกสารสำคัญ การเจรจาทำสัญญาซื้อขาย การปิดยอดขาย หรือการขยายเครือข่ายธุรกิจราบรื่น ผู้คนให้ความยอมรับและเชื่อมั่นในคำพูด มีเกณฑ์ได้รับลาภลอยจากการเดินทางและการประสานงานทางธุรกิจ",
      "ฤกษ์วันธงชัยมหาอุตม์ตั้งมั่น เสริมสร้างความเจริญรุ่งเรืองและความมั่นคงในชีวิตระยะยาว เหมาะสำหรับการย้ายเข้าบ้านใหม่ การทำบุญเปิดอาคารสำนักงาน หรือการวางรากฐานชีวิตคู่ กระแสพลังบวกเปิดทางให้ชีวิตดำเนินไปด้วยความราบรื่นและเปี่ยมด้วยสิริมงคล"
    ],
    athipati: [
      "ฤกษ์วันอธิบดีส่งเสริมพลังอำนาจและเกียรติยศ เด่นด้านการปกครองบริวาร การบริหารงานใหญ่ และการเข้าหาผู้ใหญ่เพื่อขอตำแหน่งหรือโอกาสใหม่ การเจรจาธุรกิจที่มีผู้ใหญ่เป็นประธานประสบผลสำเร็จด้วยดี คำพูดน่าเชื่อถือได้รับความเคารพยำเกรงจากคนรอบข้าง",
      "ฤกษ์วันอธิบดีเมตตาบารมี การประสานงานและการเจรจาการค้าเป็นไปด้วยความมิตรและได้รับความเห็นชอบอย่างง่ายดาย เหมาะแก่การสัมภาษณ์งานใหม่ การลงนามในสัญญาสำคัญ หรือการขอความช่วยเหลือจากพันธมิตร มีเกณฑ์ได้รับข่าวดีเรื่องการงานและได้รับการสนับสนุนจากผู้มีอำนาจ",
      "ฤกษ์วันอธิบดีเด็ดเดี่ยวและมั่นคง เสริมพลังในการตัดสินใจเรื่องสำคัญและการจัดการปัญหาความวุ่นวาย การคุมคนและบริหารองค์กรเป็นไปตามเป้าหมาย เหมาะแก่การกราบขอพรผู้ใหญ่ การทำบุญเสริมดวงชะตา และการเริ่มต้นวางโครงสร้างงานใหญ่เพื่อความสำเร็จยั่งยืน",
      "ฤกษ์วันอธิบดีการค้าปัญญา เสริมสร้างไหวพริบและสติปัญญาในการวางแผนทางการเงิน การเจรจาตกลงผลประโยชน์ หรือการเปิดร้านค้าใหม่ ผลตอบแทนเป็นไปตามคาดหวัง การลงทุนระยะสั้นและยาวมีเกณฑ์ได้รับผลกำไรที่น่าพึงพอใจ",
      "ฤกษ์วันอธิบดีครูบารมี เด่นด้านงานวิชาการ การศึกษาเรียนรู้ การกราบไหว้ครูอาจารย์และการขอพรสิ่งศักดิ์สิทธิ์ การเสนอผลงานวิจัยหรือการสอบแข่งขันมีโอกาสได้รับข่าวดี การดำเนินชีวิตเปี่ยมด้วยสติและได้รับการอุปถัมภ์ชูเชิดจากผู้ใหญ่"
    ],
    ubat: [
      "วันอุบาทว์สภาวะอารมณ์และพลังงานรอบตัวตึงเครียด ระวังเรื่องทิฐิ ความใจร้อน และการใช้อารมณ์ตัดสินปัญหา อาจทำให้เกิดความขัดแย้งกับผู้คนรอบข้างโดยไม่จำเป็น ควรหลีกเลี่ยงการทำสัญญาสำคัญ การออกรถ หรือการลงทุนเสี่ยงภัย เน้นการทำความสะอาดบ้าน พักผ่อน และสวดมนต์นั่งสมาธิแก้เคล็ด",
      "วันอุบาทว์กระแสพลังงานมีความผันผวน ระวังเอกสารสัญญาหรือข้อมูลสำคัญตกหล่นสูญหาย การเจรจาติดขัดและอาจมีความเข้าใจผิดเกิดขึ้นได้ง่าย หลีกเลี่ยงการจัดงานมงคลวิวาห์หรือการย้ายเข้าบ้านใหม่ในวันนี้ ควรเน้นการเคลียร์งานค้าง จัดระเบียบเอกสาร และทำบุญโชคลาภเสริมสิริมงคล",
      "วันอุบาทว์ระวังอุบัติเหตุ ความใจร้อน และการมีปากเสียงกับคนในครอบครัวหรือผู้ร่วมงาน การเดินทางไกลควรเพิ่มความระมัดระวังเป็นพิเศษ งดเว้นการเจรจาเรื่องผลประโยชน์หรือการกู้หนี้ยืมสิน ควรใช้เวลาไปกับการดูแลสุขภาพ สวดมนต์ปล่อยนกปล่อยปลาเพื่อผ่อนคลายความตึงเครียด",
      "วันอุบาทว์ระวังการสื่อสารคลาดเคลื่อนและการเข้าใจผิดทางธุรกิจ ไม่เหมาะแก่การเซ็นสัญญากู้ยืม หรือการเริ่มโปรเจกต์ใหม่ คำพูดอาจถูกตีความผิดความหมายได้ง่าย ควรใช้สติ ความสงบ และตรวจสอบข้อมูลให้รอบคอบก่อนลงมือทำสิ่งใดในวันนี้",
      "วันอุบาทว์ระวังความประมาทในการลงทุนและการถูกหลอกลวง การเข้าหาผู้ใหญ่ในวันนี้อาจไม่ได้ผลดีเท่าที่ควร งดเว้นการเสี่ยงโชคและการทำกิจกรรมมงคลใหญ่ ควรเน้นการสวดมนต์ไหว้พระ ปฏิบัติธรรม และสรงน้ำพระเพื่อปัดเป่าอุปสรรคและเสริมพลังบวกให้กับตนเอง"
    ],
    lokawinat: [
      "วันโลกาวินาศกระแสธรรมชาติและพลังงานแปรปรวน อาจทำให้เกิดอุปสรรคซ้อนอุปสรรค การเดินทางหรือระบบสื่อสารติดขัด ไม่เหมาะสำหรับการเปิดตัวงานใหม่ การขึ้นบ้านใหม่ หรือการย้ายที่อยู่อาศัย ควรใช้ชีวิตด้วยความไม่ประมาท เคลียร์ขยะสิ่งของชำรุดออกนอกบ้าน และทำทานเสริมบุญบารมี",
      "วันโลกาวินาศระวังเรื่องความอึดอัดใจและการมีปากเสียงในครอบครัว สิ่งที่คาดหวังอาจไม่เป็นไปตามแผนและมีเหตุให้เสียเงินทองกะทันหัน หลีกเลี่ยงการเสี่ยงโชค งานมงคลสมรส หรือการเข้าพบผู้ใหญ่ ควรเน้นการทำบิ๊กคลีนนิ่งบ้าน พักผ่อนจิตใจ และสวดมนต์อธิษฐานจิตเพื่อความผาสุก",
      "วันโลกาวินาศระวังสิ่งของชำรุดเสียหาย ระบบน้ำไฟในบ้านมีปัญหา หรือมีความขัดแย้งกะทันหันกับคนรอบข้าง ไม่ควรเริ่มงานใหญ่หรือรับปากช่วยเหลือใครเกินตัว ควรเน้นการซ่อมแซมสิ่งของที่ชำรุด ทำบุญบริจาคทานค่าน้ำค่าไฟวัด และตั้งมั่นในศีลธรรมเพื่อเป็นเกราะคุ้มครองดวงชะตา",
      "วันโลกาวินาศระบบการเงินและการสื่อสารอาจเกิดความคลาดเคลื่อน ไม่ควรลงนามในสัญญาสำคัญ เอกสารคดีความ หรือการทำธุรกรรมกู้หนี้ยืมสิน การตัดสินใจด้วยความใจร้อนอาจนำมาซึ่งความสูญเสีย ควรสงบสติอารมณ์ ปล่อยวางเรื่องเครียด และทำบุญถวายสังฆทานเสริมดวง",
      "วันโลกาวินาศระวังความประมาทและการตกหลุมพรางทางความคิด อาจมีเรื่องให้วุ่นวายใจจากบริวาร หลีกเลี่ยงการทำกิจกรรมเสี่ยงภัยและการเดินทางยามวิกาล ควรเน้นการปฏิบัติธรรม สวดมนต์คาถาชินบัญชร และทำบุญให้เจ้ากรรมนายเวร เพื่อเปลี่ยนร้ายให้กลายเป็นดี"
    ],
    neutral: [
      "วันกำลังปานกลาง กระแสพลังงานราบรื่นและเป็นธรรมชาติ เหมาะสำหรับดำเนินกิจกรรมประจำวันตามปกติ ทำงานตามแผนงานเดิมที่วางไว้ และการพัฒนาทักษะตนเอง การเจรจาค้าขายเป็นไปอย่างเรียบง่าย ควรเน้นความสม่ำเสมอ ความตั้งใจจริง และการดูแลสุขภาพร่างกายให้แข็งแรง",
      "วันกำลังปานกลาง บรรยากาศผ่อนคลาย เหมาะแก่การเจรจาสังสรรค์เล็กๆ กับเพื่อนฝูง การดูแลคนในครอบครัว และการชอปปิงของใช้เข้าบ้าน การงานดำเนินไปตามระบบโดยไม่มีอุปสรรคใหญ่ ควรใช้เวลานี้เติมพลังกายใจและวางแผนเป้าหมายใหม่สำหรับอนาคต",
      "วันกำลังปานกลาง เหมาะแก่การเคลียร์งานค้าง สะสางเอกสารที่ค้างคา และการจัดระเบียบโต๊ะทำงาน การเงินหมุนเวียนได้เรื่อยๆ ตามปกติ ควรหาเวลาออกกำลังกายเสริมสร้างภูมิคุ้มกันร่างกาย ทำจิตใจให้สดใส และทำบุญตักบาตรตามโอกาสเพื่อเสริมความราบรื่น",
      "วันกำลังปานกลาง เด่นด้านการประสานงาน นัดหมายส่งมอบงาน และการอ่านหนังสือหาความรู้ใหม่ๆ การพูดคุยแลกเปลี่ยนความคิดเห็นกับผู้ร่วมงานเป็นไปด้วยดี ควรเน้นการสร้างมิตรภาพและการทำความดีเล็กๆ น้อยๆ ในชีวิตประจำวันเพื่อสะสมแต้มบุญ",
      "วันกำลังปานกลาง เหมาะแก่การทบทวนตนเอง การวางแผนการเงินระยะยาว และการเรียนรู้สิ่งใหม่ๆ ที่สนใจ การดำเนินชีวิตเป็นไปด้วยความเรียบร้อย ไร้แรงปะทะ ควรหมั่นกราบไหว้พระในบ้าน แสดงความกตัญญูต่อผู้มีพระคุณ เพื่อส่งเสริมดวงชะตาให้มีความสุขและเจริญรุ่งเรือง"
    ]
  };

  const meaningIdx = (day + month * 3) % 5;

  if (weekday === kalayoga.thongchai) {
    return {
      type: "auspicious",
      badge: "🟢 วันธงชัย",
      badgeColor: "#2E7D32",
      badgeBg: "#E8F5E9",
      meaning: MEANING_MATRIX.thongchai[meaningIdx],
      suitable: "🚗 ออกรถใหม่, 🏠 ขึ้นบ้านใหม่/ย้ายบ้าน, 💼 เปิดร้านค้า/จดทะเบียนบริษัท, 💍 มงคลสมรส",
      avoid: "กิจกรรมที่เน้นความขัดแย้ง หรือการเริ่มปราบปรามทางกฎหมาย",
      direction: direction,
      time: WEEKDAY_TIMES[weekday],
      numbers: numbers
    };
  } else if (weekday === kalayoga.athipati) {
    return {
      type: "auspicious",
      badge: "🟢 วันอธิบดี",
      badgeColor: "#1B5E20",
      badgeBg: "#E8F5E9",
      meaning: MEANING_MATRIX.athipati[meaningIdx],
      suitable: "👔 สัมภาษณ์งาน/คุยเจรจาธุรกิจ, 🤝 เซ็นสัญญาสำคัญ, 🏠 ขึ้นบ้านใหม่, 🙏 ทำบุญเสริมดวง",
      avoid: "การให้ยืมเงิน หรือทำธุรกรรมกู้หนี้ยืมสิน",
      direction: direction,
      time: WEEKDAY_TIMES[weekday],
      numbers: numbers
    };
  } else if (weekday === kalayoga.ubat) {
    return {
      type: "caution",
      badge: "🔴 วันอุบาทว์",
      badgeColor: "#C62828",
      badgeBg: "#FFEBEE",
      meaning: MEANING_MATRIX.ubat[meaningIdx],
      suitable: "🧹 จัดระเบียบทำความสะอาดบ้าน, 🧘‍♂️ สวดมนต์นั่งสมาธิปฏิบัติธรรม, 🏥 ตรวจสุขภาพ",
      avoid: "🚗 ออกรถใหม่, 💍 จัดงานวิวาห์, 💼 ลงนามในเอกสารสัญญาทางธุรกิจ",
      direction: direction,
      time: WEEKDAY_TIMES[weekday],
      numbers: numbers
    };
  } else if (weekday === kalayoga.lokawinat) {
    return {
      type: "caution",
      badge: "🔴 วันโลกาวินาศ",
      badgeColor: "#B71C1C",
      badgeBg: "#FFEBEE",
      meaning: MEANING_MATRIX.lokawinat[meaningIdx],
      suitable: "🧼 ทำบิ๊กคลีนนิ่ง, 🗑️ เคลียร์ขยะสิ่งของชำรุดออกนอกบ้าน, 🛠️ ซ่อมแซมระบบน้ำไฟ",
      avoid: "🏠 ขึ้นบ้านใหม่/ย้ายบ้าน, 💼 เปิดตัวโปรเจกต์ใหม่, 🎓 สมัครหรือเข้าทำงานวันแรก",
      direction: direction,
      time: WEEKDAY_TIMES[weekday],
      numbers: numbers
    };
  } else {
    return {
      type: "neutral",
      badge: "⚪ ฤกษ์ปานกลาง",
      badgeColor: "#616161",
      badgeBg: "#F5F5F5",
      meaning: MEANING_MATRIX.neutral[meaningIdx],
      suitable: "🛒 ซื้อเครื่องใช้ไฟฟ้า/ของเข้าบ้าน, 💻 ทำงานตามปกติ, 🏃‍♂️ กิจกรรมเพื่อสุขภาพ, 📞 สังสรรค์เพื่อนฝูง",
      avoid: "การเก็งกำไรที่มีความเสี่ยงสูงมาก หรือการลงทุนที่ใช้ความเสี่ยงเกินตัว",
      direction: direction,
      time: WEEKDAY_TIMES[weekday],
      numbers: numbers
    };
  }
}

let calendarActiveFilter = 'all';

function checkDayMatchesFilter(details, filter) {
  if (filter === 'all') return true;
  if (filter === 'auspicious') return details.type === 'auspicious';
  if (filter === 'car') return details.suitable.includes('ออกรถ');
  if (filter === 'home') return details.suitable.includes('ขึ้นบ้านใหม่');
  if (filter === 'shop') return details.suitable.includes('เปิดร้าน') || details.suitable.includes('ธุรกิจ');
  if (filter === 'wedding') return details.suitable.includes('มงคลสมรส');
  return true;
}

function getPersonalizedAuspiciousAdvice(year, month, day) {
  const thaksaDay = (typeof window.currentThaksaDay !== 'undefined' && window.currentThaksaDay !== null)
    ? window.currentThaksaDay
    : (window.lastCalculatedHoroscope ? window.lastCalculatedHoroscope.thaksaDay : null);

  if (thaksaDay === null || typeof thaksaDay === 'undefined') {
    return null;
  }

  const d = new Date(year, month, day);
  const weekday = d.getDay(); // 0=Sun .. 6=Sat

  // 0:Sun, 1:Mon, 2:Tue, 3:Wed, 4:Thu, 5:Fri, 6:Sat, 7:WedNight
  const KALI_MAP = { 0: 5, 1: 0, 2: 1, 3: 2, 4: 6, 5: 6, 6: 3, 7: 4 };
  const FRIEND_MAP = { 0: 4, 1: 3, 2: 5, 3: 1, 4: 0, 5: 2, 6: 7, 7: 6 };

  const tabooWeekday = KALI_MAP[thaksaDay];
  const friendWeekday = FRIEND_MAP[thaksaDay];

  const weekdaysThai = ["วันอาทิตย์", "วันจันทร์", "วันอังคาร", "วันพุธ", "วันพฤหัสบดี", "วันศุกร์", "วันเสาร์"];

  if (weekday === tabooWeekday) {
    return {
      type: "taboo",
      text: `⚠️ วันนี้ตรงกับวันกาลกิณีดวงเกิดของคุณ (${weekdaysThai[tabooWeekday]}) ควรหลีกเลี่ยงการเริ่มงานมงคลสำคัญหรือออกรถใหม่`,
      bg: "#FFEBEE",
      border: "#EF9A9A",
      color: "#C62828"
    };
  } else if (weekday === friendWeekday || (thaksaDay === 6 && weekday === 3)) {
    return {
      type: "friend",
      text: `🌟 วันคู่มิตรดวงเกิด! วันนี้เป็นวันคู่มิตรส่งเสริมดวงชะตาของคุณ ช่วยทวีคูณความสำเร็จและราบรื่นเป็นพิเศษ`,
      bg: "#E8F5E9",
      border: "#A5D6A7",
      color: "#1B5E20"
    };
  }

  return null;
}

window.setCalendarFilter = function(filterType) {
  calendarActiveFilter = filterType;
  
  const filterBtns = document.querySelectorAll('.cal-filter-btn');
  filterBtns.forEach(btn => {
    if (btn.id === `cal-filter-${filterType}`) {
      btn.classList.add('active');
      btn.style.background = 'var(--gold)';
      btn.style.color = '#ffffff';
      btn.style.borderColor = 'var(--gold-d)';
      btn.style.fontWeight = '700';
    } else {
      btn.classList.remove('active');
      btn.style.background = 'var(--cream)';
      btn.style.color = 'var(--text)';
      btn.style.borderColor = 'var(--border)';
      btn.style.fontWeight = '400';
    }
  });

  window.renderAuspiciousCalendar();
};

window.renderAuspiciousCalendar = function() {
  const label = document.getElementById('calendarMonthLabel');
  const grid = document.getElementById('calendarDaysGrid');
  if (!label || !grid) return;

  // ตั้งค่าชื่อหัวข้อเดือน (ปี พ.ศ. = ปี ค.ศ. + 543)
  label.textContent = `${THAI_MONTH_NAMES[calendarCurrentMonth]} ${calendarCurrentYear + 543}`;
  grid.innerHTML = '';

  // หาวันแรกของเดือนและจำนวนวันทั้งหมดในเดือนนั้น
  const firstDayIndex = new Date(calendarCurrentYear, calendarCurrentMonth, 1).getDay(); // 0 = Sun, ..., 6 = Sat
  const totalDays = new Date(calendarCurrentYear, calendarCurrentMonth + 1, 0).getDate();

  // สร้างเซลล์ว่าง (Pad cells) ก่อนวันแรกของเดือน
  for (let i = 0; i < firstDayIndex; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.className = 'cal-day empty';
    grid.appendChild(emptyCell);
  }

  // สร้างเซลล์วันที่
  for (let day = 1; day <= totalDays; day++) {
    const details = getAuspiciousDetails(calendarCurrentYear, calendarCurrentMonth, day);
    const matchesFilter = checkDayMatchesFilter(details, calendarActiveFilter);

    const cell = document.createElement('div');
    cell.className = `cal-day cal-type-${details.type}`;
    if (day === calendarSelectedDay) {
      cell.classList.add('selected');
      cell.classList.add('active');
    }

    if (!matchesFilter) {
      cell.style.opacity = '0.25';
      cell.style.filter = 'grayscale(0.8)';
    } else if (calendarActiveFilter !== 'all') {
      cell.style.boxShadow = '0 0 8px rgba(226, 184, 66, 0.9)';
      cell.style.borderColor = 'var(--gold-d)';
    }

    cell.innerHTML = `
      <div class="cal-day-num">${day}</div>
      <div class="cal-day-dot" style="background-color: ${details.badgeColor}"></div>
    `;

    cell.onclick = () => {
      grid.querySelectorAll('.cal-day').forEach(c => c.classList.remove('selected'));
      cell.classList.add('selected');
      
      calendarSelectedDay = day;
      window.selectCalendarDay(day);
    };

    grid.appendChild(cell);
  }

  // อัปเดตข้อมูลการ์ดรายละเอียดประจำวันที่เลือกไว้โดยอัตโนมัติ
  window.selectCalendarDay(calendarSelectedDay);
};

window.changeCalendarMonth = function(offset) {
  calendarCurrentMonth += offset;
  if (calendarCurrentMonth < 0) {
    calendarCurrentMonth = 11;
    calendarCurrentYear -= 1;
  } else if (calendarCurrentMonth > 11) {
    calendarCurrentMonth = 0;
    calendarCurrentYear += 1;
  }
  
  // เช็คขอบเขตวันของเดือนใหม่เพื่อไม่ให้เลยวันสูงสุด (เช่น กุมภาพันธ์มี 28 วัน)
  const totalDaysInNewMonth = new Date(calendarCurrentYear, calendarCurrentMonth + 1, 0).getDate();
  if (calendarSelectedDay > totalDaysInNewMonth) {
    calendarSelectedDay = totalDaysInNewMonth;
  }

  window.renderAuspiciousCalendar();
};

window.selectCalendarDay = function(day) {
  const detailsCard = document.getElementById('calendarDetailsCard');
  const detailsDate = document.getElementById('calDetailsDate');
  const detailsBadge = document.getElementById('calDetailsBadge');
  const personalAdvice = document.getElementById('calPersonalAdvice');
  const detailsMeaning = document.getElementById('calDetailsMeaning');
  const detailsSuitable = document.getElementById('calDetailsSuitable');
  const detailsAvoid = document.getElementById('calDetailsAvoid');
  const detailsDirection = document.getElementById('calDetailsDirection');
  const detailsNumbers = document.getElementById('calDetailsNumbers');

  if (!detailsCard) return;

  const details = getAuspiciousDetails(calendarCurrentYear, calendarCurrentMonth, day);
  
  // หาวันในสัปดาห์ในภาษาไทย
  const d = new Date(calendarCurrentYear, calendarCurrentMonth, day);
  const weekdaysThai = ["วันอาทิตย์", "วันจันทร์", "วันอังคาร", "วันพุธ", "วันพฤหัสบดี", "วันศุกร์", "วันเสาร์"];
  const dayName = weekdaysThai[d.getDay()];

  // อัปเดตข้อมูลลงในการ์ด
  detailsDate.textContent = `${dayName}ที่ ${day} ${THAI_MONTH_NAMES[calendarCurrentMonth]} พ.ศ. ${calendarCurrentYear + 543}`;
  
  detailsBadge.textContent = details.badge;
  detailsBadge.style.color = details.badgeColor;
  detailsBadge.style.backgroundColor = details.badgeBg;
  detailsBadge.style.border = `1.5px solid ${details.badgeColor}20`;

  // ตรวจสอบคำแนะนำดวงชะตาเฉพาะบุคคล
  const advice = getPersonalizedAuspiciousAdvice(calendarCurrentYear, calendarCurrentMonth, day);
  if (personalAdvice) {
    if (advice) {
      personalAdvice.textContent = advice.text;
      personalAdvice.style.backgroundColor = advice.bg;
      personalAdvice.style.border = `1.5px solid ${advice.border}`;
      personalAdvice.style.color = advice.color;
      personalAdvice.style.display = 'block';
    } else {
      personalAdvice.style.display = 'none';
    }
  }

  detailsMeaning.textContent = details.meaning;
  detailsSuitable.textContent = details.suitable;
  detailsAvoid.textContent = details.avoid;
  detailsDirection.textContent = details.direction;
  detailsNumbers.textContent = details.numbers;

  window.lastSelectedCalendarDetails = {
    dateStr: `${dayName}ที่ ${day} ${THAI_MONTH_NAMES[calendarCurrentMonth]} พ.ศ. ${calendarCurrentYear + 543}`,
    badge: details.badge,
    meaning: details.meaning,
    suitable: details.suitable,
    avoid: details.avoid,
    direction: details.direction,
    numbers: details.numbers
  };

  // แสดงการ์ดรายละเอียด
  detailsCard.style.display = 'block';
};

window.shareAuspiciousDay = function() {
  if (!window.lastSelectedCalendarDetails) {
    alert('กรุณาคลิกเลือกวันที่บนปฏิทินก่อนครับ');
    return;
  }
  const d = window.lastSelectedCalendarDetails;
  const shareUrl = window.location.origin + window.location.pathname + '#free-horoscope';
  const textToCopy = `📅 บอกต่อฤกษ์มงคลสำหรับคุณ: ${d.dateStr}\n✨ ${d.badge}\n💡 ${d.meaning}\n✅ เหมาะสำหรับ: ${d.suitable}\n❌ ควรหลีกเลี่ยง: ${d.avoid}\n🧭 ทิศนำโชค: ${d.direction} | 🔑 เลขมงคล: ${d.numbers}\n\nตรวจเช็คตารางฤกษ์ดีประจำเดือนล่วงหน้าฟรีได้ที่ MuHub ➔ ${shareUrl}`;

  navigator.clipboard.writeText(textToCopy).then(() => {
    alert('คัดลอกลิงก์และคำแนะนำฤกษ์มงคลเรียบร้อย! ส่งต่อให้คนที่คุณรักได้เลยครับ');
  }).catch(err => {
    console.error('Failed to copy: ', err);
  });
};

// Free Page Quick Nav
const FREE_NAV_IDS = ['free-card-transit', 'auspiciousCalendarCard', 'siimsiCard', 'free-card-lagna', 'free-card-thaksa', 'numerologyCard'];

window.freeScrollTo = function(cardId) {
  const el = document.getElementById(cardId);
  if (el) {
    const quickNav = document.getElementById('freeQuickNav');
    const navOffset = quickNav ? quickNav.offsetHeight + 10 : 60;
    const bodyRect = document.body.getBoundingClientRect().top;
    const elementRect = el.getBoundingClientRect().top;
    const elementPosition = elementRect - bodyRect;
    const offsetPosition = elementPosition - navOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
};

(function initFreeQuickNav() {
  window.addEventListener('scroll', () => {
    const activeTab = document.querySelector('.tab-content:not(.hidden)');
    if (!activeTab || activeTab.id !== 'my-bookings-tab') return;

    let currentActive = null;
    const quickNav = document.getElementById('freeQuickNav');
    const navOffset = quickNav ? quickNav.offsetHeight + 80 : 120;

    for (const id of FREE_NAV_IDS) {
      const el = document.getElementById(id);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= navOffset) {
          currentActive = id;
        }
      }
    }

    const buttons = document.querySelectorAll('.free-quicknav-btn');
    buttons.forEach(btn => {
      const onclickAttr = btn.getAttribute('onclick');
      if (onclickAttr && onclickAttr.includes(currentActive)) {
        btn.classList.add('active');
        btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      } else {
        btn.classList.remove('active');
      }
    });
  });
})();

window.drawRadarChart = function(overall, work, money, love, health) {
  const canvas = document.getElementById('radarChartCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  // Set resolution based on devicePixelRatio to avoid blurriness
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  
  // If rect has zero width/height (hidden canvas), fallback to attributes
  const w = rect.width || canvas.clientWidth || 340;
  const h = rect.height || canvas.clientHeight || 340;
  
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  
  // Scale context
  ctx.scale(dpr, dpr);
  
  // Clear canvas
  ctx.clearRect(0, 0, w, h);
  
  const cx = w / 2;
  const cy = h / 2; // centered
  const maxRadius = Math.min(w, h) * 0.25;
  const levels = 5;
  
  const aspects = [
    { name: '🌟 ภาพรวม', score: overall, angle: -Math.PI / 2 },
    { name: '💼 การงาน', score: work, angle: -Math.PI / 2 + 1 * (2 * Math.PI / 5) },
    { name: '💰 การเงิน', score: money, angle: -Math.PI / 2 + 2 * (2 * Math.PI / 5) },
    { name: '💖 ความรัก', score: love, angle: -Math.PI / 2 + 3 * (2 * Math.PI / 5) },
    { name: '🩺 สุขภาพ', score: health, angle: -Math.PI / 2 + 4 * (2 * Math.PI / 5) }
  ];
  
  // Helper for non-linear scale levels (1-2-3 close together, 3-4-5 spaced wider)
  const LEVEL_SCALES = [0, 0.10, 0.22, 0.38, 0.66, 1.00];
  const getScaleRadius = (score) => {
    if (score <= 1.0) return LEVEL_SCALES[1] * maxRadius * score;
    if (score >= 5.0) return maxRadius;
    const idx = Math.floor(score);
    const frac = score - idx;
    return (LEVEL_SCALES[idx] + (LEVEL_SCALES[idx + 1] - LEVEL_SCALES[idx]) * frac) * maxRadius;
  };
  
  // 1. Draw web grid lines (pentagons)
  ctx.lineWidth = 1;
  for (let i = 1; i <= levels; i++) {
    const r = LEVEL_SCALES[i] * maxRadius;
    ctx.beginPath();
    aspects.forEach((asp, idx) => {
      const x = cx + Math.cos(asp.angle) * r;
      const y = cy + Math.sin(asp.angle) * r;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    
    // Outer border is slightly bolder
    ctx.strokeStyle = i === levels ? 'rgba(226, 184, 66, 0.7)' : 'rgba(226, 184, 66, 0.22)';
    ctx.stroke();
    
    // Add grid background color
    if (i % 2 === 0) {
      ctx.fillStyle = 'rgba(245, 200, 64, 0.015)';
      ctx.fill();
    }
  }
  
  // 2. Draw spokes
  ctx.beginPath();
  aspects.forEach(asp => {
    ctx.moveTo(cx, cy);
    const x = cx + Math.cos(asp.angle) * maxRadius;
    const y = cy + Math.sin(asp.angle) * maxRadius;
    ctx.lineTo(x, y);
  });
  ctx.strokeStyle = 'rgba(226, 184, 66, 0.35)';
  ctx.stroke();
  
  // 3. Draw labels with dynamic alignment and stars underneath
  aspects.forEach(asp => {
    const labelR = maxRadius + 24; // Increased distance to make room for name + stars
    const x = cx + Math.cos(asp.angle) * labelR;
    const y = cy + Math.sin(asp.angle) * labelR;
    
    // Dynamic text alignment based on horizontal position
    const cosVal = Math.cos(asp.angle);
    if (cosVal > 0.1) ctx.textAlign = 'left';
    else if (cosVal < -0.1) ctx.textAlign = 'right';
    else ctx.textAlign = 'center';
    
    ctx.textBaseline = 'middle';
    
    // Draw Name Label (Shifted slightly up)
    ctx.font = "bold 12px 'Sarabun', 'Outfit', sans-serif";
    ctx.fillStyle = '#21170D'; // Darker legibile deep golden-charcoal
    ctx.fillText(asp.name, x, y - 6);
    
    // Draw Stars (Shifted slightly down)
    ctx.font = "11px 'Sarabun', 'Outfit', sans-serif";
    ctx.fillStyle = '#FFB300'; // Bright shiny gold for stars
    
    const starCount = Math.round(asp.score);
    const starString = '★'.repeat(starCount) + '☆'.repeat(5 - starCount);
    ctx.fillText(starString, x, y + 7);
  });
  
  // 4. Draw data polygon using non-linear scale radius
  ctx.beginPath();
  aspects.forEach((asp, idx) => {
    const r = getScaleRadius(asp.score);
    const x = cx + Math.cos(asp.angle) * r;
    const y = cy + Math.sin(asp.angle) * r;
    if (idx === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  
  // Fill gradient: soft sparkly-purple gradient to contrast with gold spokes
  const fillGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, maxRadius);
  fillGrad.addColorStop(0, 'rgba(224, 170, 255, 0.18)'); // soft orchid
  fillGrad.addColorStop(1, 'rgba(106, 13, 173, 0.35)');  // deep violet
  ctx.fillStyle = fillGrad;
  ctx.fill();

  // Stroke data boundary: shimmering purple gradient with a soft glow ("sparkly")
  const strokeGrad = ctx.createLinearGradient(cx - maxRadius, cy - maxRadius, cx + maxRadius, cy + maxRadius);
  strokeGrad.addColorStop(0, '#E0AAFF');   // pale lavender highlight
  strokeGrad.addColorStop(0.5, '#9D4EDD'); // vivid orchid
  strokeGrad.addColorStop(1, '#5A189A');   // deep royal purple
  ctx.save();
  ctx.shadowColor = 'rgba(199, 125, 255, 0.65)';
  ctx.shadowBlur = 10;
  ctx.strokeStyle = strokeGrad;
  ctx.lineWidth = 2.5;         // bolder stroke for sharpness
  ctx.stroke();
  ctx.restore(); // clear glow so it doesn't bleed into dots/labels below



  // 5. Draw score values using non-linear scale radius (No dots for a clean, premium look)
  aspects.forEach(asp => {
    const r = getScaleRadius(asp.score);
    const x = cx + Math.cos(asp.angle) * r;
    const y = cy + Math.sin(asp.angle) * r;

    // Score label offset
    const cosVal = Math.cos(asp.angle);
    const sinVal = Math.sin(asp.angle);
    let textX = x;
    let textY = y;
    
    if (cosVal > 0.1) textX += 11;
    else if (cosVal < -0.1) textX -= 11;
    
    if (sinVal > 0.5) textY += 10;
    else if (sinVal < -0.5) textY -= 10;
    else if (Math.abs(cosVal) <= 0.1) {
      if (sinVal > 0) textY += 10;
      else textY -= 10;
    }
    
    ctx.font = "bold 11px 'Sarabun', 'Outfit', sans-serif";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Draw white outline/halo for premium readability
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3.5;
    ctx.lineJoin = 'round';
    ctx.strokeText(`${asp.score.toFixed(1)}`, textX, textY);
    
    ctx.fillStyle = '#7B2CBF';
    ctx.fillText(`${asp.score.toFixed(1)}`, textX, textY);
  });
};

function renderDailyColorsTable(thaksaDay = null) {
  if (window.selectedCalendarTabIdx === undefined) {
    window.selectedCalendarTabIdx = new Date().getDay();
  }

  const container = document.getElementById('colorTableContainer');
  const detailPanel = document.getElementById('colorDetailPanel');
  if (!container) return;

  const todayWeekday = new Date().getDay();

  const daysData = [
    { dayShort: 'อา', dayFull: 'วันอาทิตย์', weekdayIdx: 0, dayColor: '#FF5252',
      aspects: { work: ['ชมพู'], luck: ['เขียว'], love: ['ดำ', 'น้ำตาล', 'เทา'], kali: ['ฟ้า', 'น้ำเงิน'] }
    },
    { dayShort: 'จ', dayFull: 'วันจันทร์', weekdayIdx: 1, dayColor: '#FFB300',
      aspects: { work: ['เขียว'], luck: ['ม่วง'], love: ['ฟ้า', 'น้ำเงิน'], kali: ['แดง'] }
    },
    { dayShort: 'อ', dayFull: 'วันอังคาร', weekdayIdx: 2, dayColor: '#E91E63',
      aspects: { work: ['ม่วง'], luck: ['ส้ม'], love: ['แดง'], kali: ['เหลือง', 'ขาว', 'ครีม'] }
    },
    { dayShort: 'พ', dayFull: 'วันพุธ', weekdayIdx: 3, dayColor: '#43A047',
      aspects: { work: ['ส้ม', 'แสด'], luck: ['ดำ', 'น้ำตาล', 'เทา'], love: ['เหลือง', 'ขาว', 'ครีม'], kali: ['ชมพู'] }
    },
    { dayShort: 'พฤ', dayFull: 'วันพฤหัสบดี', weekdayIdx: 4, dayColor: '#FB8C00',
      aspects: { work: ['ฟ้า', 'น้ำเงิน'], luck: ['แดง'], love: ['เขียว'], kali: ['ม่วง'] }
    },
    { dayShort: 'ศ', dayFull: 'วันศุกร์', weekdayIdx: 5, dayColor: '#26C6DA',
      aspects: { work: ['เหลือง', 'ขาว', 'ครีม'], luck: ['ชมพู'], love: ['ส้ม', 'แสด'], kali: ['ดำ', 'น้ำตาล', 'เทา'] }
    },
    { dayShort: 'ส', dayFull: 'วันเสาร์', weekdayIdx: 6, dayColor: '#5E35B1',
      aspects: { work: ['ดำ', 'น้ำตาล', 'เทา'], luck: ['ฟ้า', 'น้ำเงิน'], love: ['ชมพู'], kali: ['เขียว'] }
    }
  ];

  const colorMap = {
    'เขียว': '#43A047', 'ชมพู': '#F06292', 'เทา': '#9E9E9E', 'น้ำเงิน': '#1565C0',
    'ฟ้า': '#29B6F6', 'ม่วง': '#9C27B0', 'แดง': '#E53935', 'ส้ม': '#FF9800',
    'แสด': '#FF5722', 'ขาว': '#F5F5F5', 'ครีม': '#FFF9C4', 'เหลือง': '#FFEB3B',
    'ดำ': '#212121', 'น้ำตาล': '#8D6E63'
  };

  const catMeta = [
    { key: 'work', label: 'เดช\nอำนาจ สิทธิ์', shortLabel: 'เดช', emoji: '💼', borderColor: '#1565C0' },
    { key: 'luck', label: 'ศรี\nโชคลาภ เงินทอง', shortLabel: 'ศรี', emoji: '💰', borderColor: '#2E7D32' },
    { key: 'love', label: 'มนตรี\nอุปถัมภ์ช่วยเหลือ', shortLabel: 'มนตรี', emoji: '💖', borderColor: '#AD1457' },
    { key: 'kali', label: 'กาลกิณี\nอัปโชค ไม่ดี', shortLabel: 'กาลกิณี', emoji: '⚠️', borderColor: '#C62828' }
  ];

  // Build the color block swatch for a list of colors
  function buildSwatches(colorsList, compact = false) {
    return colorsList.map(c => {
      const hex = colorMap[c] || '#ccc';
      const isLight = ['ขาว','ครีม','เหลือง'].includes(c);
      const txtColor = isLight ? '#555' : '#fff';
      const border = isLight ? 'box-shadow: inset 0 0 0 1px rgba(0,0,0,0.15);' : '';
      const size = compact ? '28px' : '40px';
      const fontSize = compact ? '0.56rem' : '0.72rem';
      return `<div style="width:${size};height:${size};min-width:${size};border-radius:8px;background:${hex};${border}display:flex;align-items:center;justify-content:center;color:${txtColor};font-size:${fontSize};font-weight:800;text-align:center;line-height:1.1;">${c}</div>`;
    }).join('');
  }

  // ── Full week grid ─────────────────────────────────────────────────────
  // Header row: col labels
  let tableHTML = `
    <div style="display:grid;grid-template-columns:56px repeat(4,1fr);gap:4px;min-width:340px;">

      <!-- Header -->
      <div style="display:contents;">
        <div style="padding:6px 4px;"></div>
        ${catMeta.map(cat => `
          <div style="background:linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03));border-radius:8px;padding:5px 3px;text-align:center;border-bottom:2px solid ${cat.borderColor}30;">
            <div style="font-size:1rem;line-height:1;">${cat.emoji}</div>
            <div style="font-size:0.62rem;font-weight:800;color:var(--text);line-height:1.2;margin-top:2px;white-space:pre-line;">${cat.label}</div>
          </div>
        `).join('')}
      </div>`;

  daysData.forEach(day => {
    const isToday = day.weekdayIdx === todayWeekday;
    const isBirth = thaksaDay !== null && (thaksaDay === day.weekdayIdx || (thaksaDay === 7 && day.weekdayIdx === 3));
    const isActive = day.weekdayIdx === window.selectedCalendarTabIdx;

    const rowBg = isActive
      ? `background:linear-gradient(135deg,${day.dayColor}22,${day.dayColor}0a);box-shadow:0 2px 12px ${day.dayColor}20;`
      : 'background:transparent;';
    const rowBorder = isActive ? `border-left:3px solid ${day.dayColor};border-radius:12px;` : 'border-left:3px solid transparent;border-radius:12px;';

    const dayLabelBg = isActive ? day.dayColor : (isToday ? day.dayColor + '33' : 'var(--cream)');
    const dayLabelColor = isActive ? '#fff' : (isToday ? day.dayColor : 'var(--text)');

    let badges = '';
    if (isToday && !isActive) badges += `<span style="font-size:0.5rem;background:${day.dayColor};color:#fff;border-radius:4px;padding:1px 3px;line-height:1;">วันนี้</span>`;
    if (isBirth) badges += `<span style="font-size:0.5rem;background:var(--gold-d);color:#fff;border-radius:4px;padding:1px 3px;line-height:1;">🎂</span>`;

    tableHTML += `
      <div style="display:contents;cursor:pointer;" onclick="selectDailyColorTab(${day.weekdayIdx}, ${thaksaDay})">

        <!-- Day label cell -->
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;padding:6px 2px;${rowBg}${rowBorder}border-radius:10px;transition:all 0.2s;">
          <div style="width:34px;height:34px;border-radius:50%;background:${dayLabelBg};color:${dayLabelColor};font-size:0.82rem;font-weight:900;display:flex;align-items:center;justify-content:center;border:2px solid ${isActive ? day.dayColor : 'var(--border)'};transition:all 0.2s;">
            ${day.dayShort}
          </div>
          <div style="display:flex;flex-direction:column;align-items:center;gap:1px;">${badges}</div>
        </div>

        ${catMeta.map((cat, ci) => {
          const colors = day.aspects[cat.key];
          const isKali = cat.key === 'kali';
          const cellBg = isKali
            ? (isActive ? '#FF252520' : 'rgba(220,38,38,0.04)')
            : (isActive ? `${day.dayColor}15` : 'rgba(255,255,255,0.4)');
          const cellBorder = isActive ? `border:1.5px solid ${isKali ? '#C6282844' : day.dayColor + '44'};` : 'border:1.5px solid var(--border);';
          return `
            <div style="display:flex;align-items:center;justify-content:center;gap:3px;padding:5px 2px;border-radius:8px;background:${cellBg};${cellBorder}flex-wrap:wrap;transition:all 0.2s;">
              ${buildSwatches(colors, true)}
            </div>
          `;
        }).join('')}

      </div>`;
  });

  tableHTML += `</div>`;
  container.innerHTML = tableHTML;

  // ── Detail panel for selected day ─────────────────────────────────────
  if (detailPanel) {
    const activeDay = daysData.find(d => d.weekdayIdx === window.selectedCalendarTabIdx);
    if (!activeDay) { detailPanel.innerHTML = ''; return; }

    const isBirth = thaksaDay !== null && (thaksaDay === activeDay.weekdayIdx || (thaksaDay === 7 && activeDay.weekdayIdx === 3));
    const isToday = activeDay.weekdayIdx === todayWeekday;

    const tipsMap = {
      0: 'ใส่เสื้อสีเขียวคู่กับเครื่องประดับสีเงิน ช่วยเรียกทรัพย์และโชคดีตลอดทั้งวัน',
      1: 'หลีกเลี่ยงสีแดงเด็ดขาด ใส่โทนสีขาวครีมคู่สีม่วงเพื่อดึงดูดเสน่ห์และมิตรไมตรี',
      2: 'ใส่ชุดสีชมพูหรือม่วงเพิ่มอำนาจบารมีและความน่าเกรงขาม ดีสำหรับงานเจรจา',
      3: 'สีส้มช่วยเสริมพลังการค้าขายและเจรจางาน ดึงดูดผู้ใหญ่เมตตาและพลังบวก',
      4: 'แต่งสีส้มคู่สีทองหรือใส่เครื่องประดับแวววาวเพื่อเสริมโชคและเรื่องความรัก',
      5: 'สีฟ้าน้ำเงินนำความสำเร็จในการประสานงาน เรื่องการเงินคล่องตัวและราบรื่น',
      6: 'สีน้ำเงินเข้มหนุนดวงการเงินและโชคลาภ ดึงดูดแต่พลังงานดีๆ เข้าหาตัว'
    };

    let badge = '';
    if (isBirth) badge = `<span style="background:var(--gold-d);color:#fff;padding:2px 8px;border-radius:12px;font-size:0.65rem;font-weight:700;margin-left:6px;">🎂 วันเกิดคุณ</span>`;
    else if (isToday) badge = `<span style="background:${activeDay.dayColor};color:#fff;padding:2px 8px;border-radius:12px;font-size:0.65rem;font-weight:700;margin-left:6px;">วันนี้</span>`;

    detailPanel.innerHTML = `
      <div style="background:linear-gradient(135deg,${activeDay.dayColor}18,${activeDay.dayColor}08);border:1.5px solid ${activeDay.dayColor}44;border-radius:14px;padding:1rem;transition:all 0.3s;">
        <div style="display:flex;align-items:center;margin-bottom:0.85rem;border-bottom:1.5px dashed ${activeDay.dayColor}55;padding-bottom:0.6rem;">
          <div style="width:40px;height:40px;border-radius:50%;background:${activeDay.dayColor};color:#fff;font-size:1rem;font-weight:900;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 4px 12px ${activeDay.dayColor}44;">
            ${activeDay.dayShort}
          </div>
          <div style="margin-left:0.7rem;flex:1;text-align:left;">
            <div style="font-size:1rem;font-weight:800;color:${activeDay.dayColor};">${activeDay.dayFull} ${badge}</div>
            <div style="font-size:0.72rem;color:var(--dim);margin-top:1px;">แตะแถวอื่นเพื่อดูสีแต่ละวัน</div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;">
          ${catMeta.map(cat => {
            const colors = activeDay.aspects[cat.key];
            const isKali = cat.key === 'kali';
            const bg = isKali ? '#FFF5F5' : '#ffffff';
            const borderC = isKali ? '#FFD1D1' : cat.borderColor + '33';
            return `
              <div style="background:${bg};border:1.5px solid ${borderC};border-radius:10px;padding:0.6rem 0.7rem;">
                <div style="font-size:0.65rem;font-weight:800;color:${cat.borderColor};letter-spacing:0.05em;margin-bottom:5px;">${cat.emoji} ${cat.label.replace('\n',' · ')}</div>
                <div style="display:flex;gap:4px;flex-wrap:wrap;align-items:center;">
                  ${buildSwatches(colors, false)}
                </div>
                <div style="font-size:0.78rem;font-weight:700;color:${isKali ? '#C62828' : 'var(--text)'};margin-top:4px;">
                  ${colors.join(' / ')}
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <div style="margin-top:0.8rem;padding:0.6rem 0.8rem;background:rgba(255,255,255,0.7);border-radius:8px;border-left:3px solid ${activeDay.dayColor};font-size:0.78rem;font-weight:600;color:var(--text-muted);line-height:1.5;text-align:left;">
          💡 <strong>คำแนะนำเสริมดวง</strong>: ${tipsMap[activeDay.weekdayIdx]}
        </div>
      </div>
    `;
  }
}

window.renderYearlyThaksaColors = function(thaksaDay, age) {
  const container = document.getElementById('freeThaksaColorsContainer');
  if (!container) return;
  if (thaksaDay === null || thaksaDay === undefined) {
    container.innerHTML = '<div style="font-size: 0.85rem; color: var(--dim); padding: 1rem; text-align: center;">กรุณาผูกดวงชะตาเพื่อดูสีมงคลประจำปีเฉพาะบุคคล</div>';
    return;
  }

  const THAKSA_PLANET_COLOR_CIRCLES = [
    { colors: ['#E53935', '#FF7043'] },               // ๑ อาทิตย์: สีแดง, สีส้มแดง
    { colors: ['#FFFFFF', '#FFF59D', '#FDD835'] },     // ๒ จันทร์: สีขาว, สีเหลืองอ่อน, สีครีม
    { colors: ['#F8BBD0', '#F06292', '#EC407A'] },     // ๓ อังคาร: สีชมพู, สีบานเย็น
    { colors: ['#81C784', '#4CAF50', '#2E7D32'] },     // ๔ พุธ: สีเขียวอ่อน, สีเขียวใบไม้, สีเขียวแก่
    { colors: ['#9C27B0', '#212121', '#616161'] },     // ๗ เสาร์: สีม่วง, สีดำ, สีเทาเข้ม
    { colors: ['#FF9800', '#FF7043', '#FFD54F'] },     // ๕ พฤหัส: สีส้ม, สีแสด, สีเหลืองทอง
    { colors: ['#B0BEC5', '#78909C', '#5D4037'] },     // ๘ ราหู: สีบรอนซ์, สีเทา, สีน้ำตาล
    { colors: ['#4FC3F7', '#0288D1', '#1565C0'] }      // ๖ ศุกร์: สีฟ้า, สีน้ำเงิน, สีคราม
  ];

  const weekdayToStartIndex = [0, 1, 2, 3, 5, 7, 4, 6];
  const birthStartIndex = weekdayToStartIndex[thaksaDay];
  const natalSri = THAKSA_PLANET_COLOR_CIRCLES[(birthStartIndex + 3) % 8];
  const natalKalakini = THAKSA_PLANET_COLOR_CIRCLES[(birthStartIndex + 7) % 8];
  const transitStart8 = (birthStartIndex + (age - 1)) % 8;
  const transitSri = THAKSA_PLANET_COLOR_CIRCLES[(transitStart8 + 3) % 8];
  const transitKalakini = THAKSA_PLANET_COLOR_CIRCLES[(transitStart8 + 7) % 8];

  function renderGlowingCircles(planetObj) {
    return `<div style="display: flex; gap: 8px; align-items: center;">` +
      planetObj.colors.map(hex => 
        `<div style="width: 24px; height: 24px; border-radius: 50%; background: ${hex}; border: 2px solid #ffffff; box-shadow: 0 0 8px rgba(255, 255, 255, 0.9), 0 2px 5px rgba(0,0,0,0.18);"></div>`
      ).join('') +
    `</div>`;
  }

  container.innerHTML = `
    <div style="font-size: 0.82rem; font-weight: 600; color: var(--dim); margin-bottom: 0.75rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.4rem;">
      <span>คำนวณตามอายุย่าง ${age} ปี</span>
    </div>

    <div style="display: flex; flex-direction: column; gap: 0.75rem;">
      <!-- สีมงคลประจำปี -->
      <div style="background: rgba(76, 175, 80, 0.05); border: 1.5px solid rgba(76, 175, 80, 0.3); border-radius: 12px; padding: 0.85rem 1rem;">
        <div style="font-size: 0.84rem; font-weight: 700; color: #2E7D32; margin-bottom: 0.6rem; display: flex; align-items: center; gap: 6px;">
          <span>✨ สีมงคล</span>
        </div>
        
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem; background: #ffffff; padding: 0.6rem 0.8rem; border-radius: 8px; border: 1px solid rgba(76, 175, 80, 0.15);">
            <span style="font-weight: 700; color: #1B5E20; font-size: 0.86rem;">ตามดวงกำเนิด</span>
            ${renderGlowingCircles(natalSri)}
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem; background: #ffffff; padding: 0.6rem 0.8rem; border-radius: 8px; border: 1px solid rgba(76, 175, 80, 0.15);">
            <span style="font-weight: 700; color: #C62828; font-size: 0.86rem;">ประจำปี</span>
            ${renderGlowingCircles(transitSri)}
          </div>
        </div>
      </div>

      <!-- สีที่ควรหลีกเลี่ยง -->
      <div style="background: rgba(239, 83, 80, 0.05); border: 1.5px solid rgba(239, 83, 80, 0.3); border-radius: 12px; padding: 0.85rem 1rem;">
        <div style="font-size: 0.84rem; font-weight: 700; color: #C62828; margin-bottom: 0.6rem; display: flex; align-items: center; gap: 6px;">
          <span>🚫 สีที่ควรหลีกเลี่ยง</span>
        </div>
        
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem; background: #ffffff; padding: 0.6rem 0.8rem; border-radius: 8px; border: 1px solid rgba(239, 83, 80, 0.15);">
            <span style="font-weight: 700; color: #1B5E20; font-size: 0.86rem;">ตามดวงกำเนิด</span>
            ${renderGlowingCircles(natalKalakini)}
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem; background: #ffffff; padding: 0.6rem 0.8rem; border-radius: 8px; border: 1px solid rgba(239, 83, 80, 0.15);">
            <span style="font-weight: 700; color: #C62828; font-size: 0.86rem;">ประจำปี</span>
            ${renderGlowingCircles(transitKalakini)}
          </div>
        </div>
      </div>
    </div>
  `;
};

