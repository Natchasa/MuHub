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
  const navThaksa = document.getElementById('btn-nav-thaksa');
  if (navTransit) navTransit.style.display = hasData ? 'inline-block' : 'none';
  if (navLagna) navLagna.style.display = hasData ? 'inline-block' : 'none';
  if (navThaksa) navThaksa.style.display = hasData ? 'inline-block' : 'none';
  
  // ซ่อน/แสดง การ์ดวิเคราะห์ดวงชะตาเฉพาะบุคคล
  const personalCards = ['free-card-transit', 'free-card-lagna', 'free-card-thaksa'];
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
  
  // หากไม่มีข้อมูลผูกดวง ให้ยุติการคำนวณด้านล่างนี้ทันทีเพื่อป้องกันข้อผิดพลาด
  if (!hasData) return;
  
  const lagnaSp = signPos(nData.pos.lagna);
  const lagnaIdx = lagnaSp.si;
  
  const badge = document.getElementById('free-lagna-badge');
  const desc = document.getElementById('free-lagna-desc');
  if (badge) badge.textContent = `ลัคนาราศี${SIGNS_TH[lagnaIdx]}`;
  if (desc) desc.textContent = ZODIAC_READINGS[lagnaIdx] || 'ไม่พบคำทำนายราศีเกิด';
  
  const thaksaMeta = document.getElementById('free-thaksa-meta');
  
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
  
  const weekdayToStartIndex = [0, 1, 2, 3, 5, 7, 4, 6];
  const birthStartIndex = weekdayToStartIndex[thaksaDay];
  
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
  
  const WEEKDAYS_TH = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธกลางวัน', 'วันพฤหัส', 'วันศุกร์', 'วันเสาร์', 'วันพุธกลางคืน'];
  if (thaksaMeta) {
    thaksaMeta.textContent = `วันเกิดของคุณ: ${WEEKDAYS_TH[thaksaDay]} | อายุย่าง: ${currentAge} ปี`;
  }
  
  const transitStartIndex = (birthStartIndex + (currentAge - 1)) % 8;
  
  const sriPlanetIdx = (transitStartIndex + 3) % 8;
  const kaliPlanetIdx = (transitStartIndex + 7) % 8;
  
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
  
  const dechPlanetIdx = (transitStartIndex + 2) % 8;
  const dechColor = THAKSA_PLANET_COLORS[dechPlanetIdx];
  
  if (goodColorsEl) {
    goodColorsEl.textContent = `${sriColor.name} (หนุนทรัพย์), ${dechColor.name} (หนุนอำนาจบารมี)`;
  }
  if (badColorsEl) {
    badColorsEl.textContent = `${kaliColor.name} (หลีกเลี่ยงเป็นพิเศษ)`;
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

function getAuspiciousDetails(year, month, day) {
  // คำนวณค่าแบบกึ่งสุ่มคงที่ (Deterministic Hash) เพื่อให้ได้ค่าที่คงเดิมสำหรับวันเดิมเสมอ
  const key = (year * 31 + (month + 1) * 7 + day) % 10;
  
  if (key === 0 || key === 3) {
    return {
      type: "auspicious",
      badge: "🟢 วันฤกษ์มงคลพิเศษ (วันธงชัย)",
      badgeColor: "#2E7D32",
      badgeBg: "#E8F5E9",
      meaning: "ฤกษ์วันธงชัยแห่งชัยชนะ ความเจริญก้าวหน้าสูงสุด พลังงานสมบูรณ์แบบเพื่อเริ่มงานใหญ่และกิจกรรมสำคัญ",
      suitable: "🚗 ออกรถใหม่, 🏠 ขึ้นบ้านใหม่/ย้ายบ้าน, 💼 เปิดร้านค้า/จดทะเบียนบริษัท, 💍 มงคลสมรส",
      avoid: "กิจกรรมที่เน้นความขัดแย้ง หรือเริ่มการปราบปรามทางกฎหมาย",
      direction: "ทิศตะวันออกเฉียงเหนือ (ทิศมงคล)",
      time: "09:09 - 10:30 น. และ 15:15 - 16:30 น.",
      numbers: "1, 5, 9"
    };
  } else if (key === 5) {
    return {
      type: "auspicious",
      badge: "🟢 วันฤกษ์มงคล (วันอธิบดี)",
      badgeColor: "#1B5E20",
      badgeBg: "#E8F5E9",
      meaning: "ฤกษ์วันอธิบดี ส่งเสริมเกียรติยศ อำนาจบารมี การเจรจาราบรื่น และมีผู้ใหญ่คอยหนุนหลังช่วยเหลือ",
      suitable: "👔 สัมภาษณ์งาน/คุยเจรจาธุรกิจ, 🤝 เซ็นสัญญาสำคัญ, 🏠 ขึ้นบ้านใหม่, 🙏 ทำบุญเสริมดวง",
      avoid: "การให้ยืมเงิน หรือทำธุรกรรมกู้หนี้ยืมสิน",
      direction: "ทิศใต้ (ทิศนำโชค)",
      time: "08:30 - 09:45 น. และ 13:30 - 15:00 น.",
      numbers: "2, 4, 6"
    };
  } else if (key === 2) {
    return {
      type: "caution",
      badge: "🔴 วันควรระวังพิเศษ (วันอุบาทว์)",
      badgeColor: "#C62828",
      badgeBg: "#FFEBEE",
      meaning: "วันอุบาทว์ พลังของดวงดาวมีการขัดแย้งและหักเห หลีกเลี่ยงกิจกรรมสำคัญเพื่อป้องกันการติดขัด",
      suitable: "🧹 จัดระเบียบทำความสะอาดบ้าน, 🧘‍♂️ สวดมนต์นั่งสมาธิปฏิบัติธรรม, 🏥 ตรวจสุขภาพ",
      avoid: "🚗 ออกรถใหม่, 💍 จัดงานวิวาห์, 💼 ลงนามในเอกสารสัญญาทางธุรกิจ",
      direction: "ทิศเหนือ (ทิศหลีกเลี่ยงภัย)",
      time: "10:30 - 11:45 น. (เน้นสวดมนต์สั้นเสริมมงคล)",
      numbers: "3, 7, 8"
    };
  } else if (key === 7) {
    return {
      type: "caution",
      badge: "🔴 วันควรระวังสูงสุด (วันโลกาวินาศ)",
      badgeColor: "#B71C1C",
      badgeBg: "#FFEBEE",
      meaning: "วันโลกาวินาศ พลังธรรมชาติแปรปรวน ส่งผลเชิงลบต่อการเจริญเติบโตหรือกิจกรรมที่เริ่มใหม่",
      suitable: "🧼 ทำบิ๊กคลีนนิ่ง, 🗑️ เคลียร์ขยะ/สิ่งของชำรุดออกนอกบ้าน, 🛠️ ซ่อมแซมระบบน้ำไฟ",
      avoid: "🏠 ขึ้นบ้านใหม่/ย้ายบ้าน, 💼 เปิดตัวโปรเจกต์ใหม่, 🎓 สมัครหรือเข้าทำงานวันแรก",
      direction: "ทิศตะวันตก (ทิศป้องกันเคราะห์)",
      time: "14:15 - 15:30 น. (เหมาะในการสวดมนต์แก้เคล็ด)",
      numbers: "0, 3, 5"
    };
  } else {
    return {
      type: "neutral",
      badge: "⚪ วันดีทั่วไป / ปานกลาง",
      badgeColor: "#616161",
      badgeBg: "#F5F5F5",
      meaning: "วันกำลังปานกลาง พลังงานดาวเคลื่อนที่สมดุลดีตามรอบวงโคจร เหมาะสำหรับกิจกรรมชีวิตปกติ",
      suitable: "🛒 ซื้อเครื่องใช้ไฟฟ้า/ของเข้าบ้าน, 💻 ทำงานตามปกติ, 🏃‍♂️ กิจกรรมเพื่อสุขภาพ, 📞 สังสรรค์เพื่อนฝูง",
      avoid: "การเก็งกำไรที่มีความเสี่ยงสูงมาก หรือการลงทุนที่ใช้ความเสี่ยงเกินตัว",
      direction: "ทิศตะวันออก (ทิศนำโชค)",
      time: "07:30 - 09:00 น. และ 11:00 - 12:30 น.",
      numbers: "4, 8, 9"
    };
  }
}

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
    emptyCell.className = 'calendar-day-cell empty';
    grid.appendChild(emptyCell);
  }

  // สร้างเซลล์วันที่
  for (let day = 1; day <= totalDays; day++) {
    const cell = document.createElement('div');
    cell.className = 'calendar-day-cell';
    
    // ตั้งค่า active
    if (day === calendarSelectedDay) {
      cell.classList.add('active');
    }

    const details = getAuspiciousDetails(calendarCurrentYear, calendarCurrentMonth, day);

    cell.innerHTML = `
      <span class="day-number">${day}</span>
      <span class="day-indicator ${details.type}"></span>
    `;

    cell.onclick = () => {
      // เอาคลาส active ออกจากเซลล์อื่นทั้งหมด
      grid.querySelectorAll('.calendar-day-cell').forEach(c => c.classList.remove('active'));
      cell.classList.add('active');
      
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
  const detailsMeaning = document.getElementById('calDetailsMeaning');
  const detailsSuitable = document.getElementById('calDetailsSuitable');
  const detailsAvoid = document.getElementById('calDetailsAvoid');
  const detailsDirection = document.getElementById('calDetailsDirection');
  const detailsNumbers = document.getElementById('calDetailsNumbers');
  const detailsTime = document.getElementById('calDetailsTime');

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

  detailsMeaning.textContent = details.meaning;
  detailsSuitable.textContent = details.suitable;
  detailsAvoid.textContent = details.avoid;
  detailsDirection.textContent = details.direction;
  detailsNumbers.textContent = details.numbers;
  detailsTime.textContent = details.time;

  window.lastSelectedCalendarDetails = {
    dateStr: `${dayName}ที่ ${day} ${THAI_MONTH_NAMES[calendarCurrentMonth]} พ.ศ. ${calendarCurrentYear + 543}`,
    badge: details.badge,
    meaning: details.meaning,
    suitable: details.suitable,
    avoid: details.avoid,
    direction: details.direction,
    numbers: details.numbers,
    time: details.time
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
  const textToCopy = `📅 บอกต่อฤกษ์มงคลสำหรับคุณ: ${d.dateStr}\n✨ ${d.badge}\n💫 ความหมาย: ${d.meaning}\n✅ เหมาะสำหรับ: ${d.suitable}\n❌ ควรหลีกเลี่ยง: ${d.avoid}\n⏱️ ช่วงเวลาทอง: ${d.time}\n🧭 ทิศนำโชค: ${d.direction} | 🔑 เลขมงคล: ${d.numbers}\n\nตรวจเช็คตารางฤกษ์ดีประจำเดือนล่วงหน้าฟรีได้ที่ MuHub ➔ ${shareUrl}`;

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
