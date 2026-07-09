// siimsi.js — MuHub E-Siimsi Fortune Telling (Ganesh, Guanyin, City Pillar)

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
    poem: "ใบที่เจ็ดเสร็จสมอารมณ์หมาย แต่ต้องกายอดทนและเพียรสร้าง อย่างใจร้อนด่วนได้ในทุกทาง ทรัพย์สินอ่างเงินถังยังรอคุณ",
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
    poem: "ใบที่สี่วาจาพาสสร้างมิตร เอื้อความคิดมีสติคอยกำกับ พูดจาดีสิ่งดีจักมารับ ลาภยศยับเยินไปหากพาลชน",
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
  
  // 2. Update the main card's class.
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
    showSavedSiimsiProphecy(savedRoll);
  } else {
    resetSiimsi();
  }
};

// Show a saved prophecy directly
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
  window.lastSiimsiProphecy = prophecy;
  
  if (pNum) pNum.textContent = `ใบที่ ${prophecy.numTH}`;
  if (pTitle) pTitle.textContent = prophecy.title;
  if (pBody) pBody.innerHTML = `<div style="text-align:center; font-style:italic; font-size:1.02rem; color:${poemColor}; margin-bottom:15rem; font-weight:700;">"${prophecy.poem}"</div>${prophecy.reading}`;
  if (pLucky) pLucky.textContent = `เลขมงคลนำโชค: ${prophecy.luckyNum}`;
  
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
  
  if (scroll) {
    scroll.classList.remove('active');
    scroll.style.display = 'none';
  }
  if (widget) widget.style.display = 'flex';
  
  if (cup) cup.classList.add('shaking');
  if (instruction) instruction.textContent = '🔮 กำลังตั้งจิตอธิษฐานและเขย่าสั่นเซียมซี...';
  
  playSiimsiSound();
  
  setTimeout(() => {
    if (cup) cup.classList.remove('shaking');
    if (instruction) instruction.textContent = '🎋 ไม้เซียมซีมงคลร่วงหล่นลงมาแล้ว!';
    
    if (fallingStick) {
      fallingStick.classList.add('dropping');
    }
    
    setTimeout(() => {
      if (fallingStick) {
        fallingStick.classList.remove('dropping');
      }
      
      if (widget) widget.style.display = 'none';
      
      let db = SIIMSI_PROPHECIES;
      let poemColor = 'var(--coral-d)';
      if (activeSiimsiDeity === 'guanyin') {
        db = SIIMSI_PROPHECIES_GUANYIN;
        poemColor = '#004d40';
      } else if (activeSiimsiDeity === 'citypillar') {
        db = SIIMSI_PROPHECIES_CITYPILLAR;
        poemColor = '#0d47a1';
      }
      
      const roll = Math.floor(Math.random() * db.length);
      const prophecy = db[roll];
      window.lastSiimsiProphecy = prophecy;
      
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

// Reset E-Siimsi display
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
  
  if (resetBtn) {
    resetBtn.innerHTML = '🔄 เสี่ยงทายใหม่';
    resetBtn.disabled = false;
    resetBtn.style.opacity = '1';
    resetBtn.style.cursor = 'pointer';
    resetBtn.style.pointerEvents = 'auto';
  }
};

// Synthesize wooden clatters
function playSiimsiSound() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    const totalClicks = 12 + Math.floor(Math.random() * 6);
    let time = ctx.currentTime;
    
    for (let i = 0; i < totalClicks; i++) {
      const bufferSize = ctx.sampleRate * 0.025;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      
      for (let j = 0; j < bufferSize; j++) {
        data[j] = Math.random() * 2 - 1;
      }
      
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 850 + Math.random() * 450;
      filter.Q.value = 3.5;
      
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.18 + Math.random() * 0.15, time);
      gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.018);
      
      source.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      source.start(time);
      source.stop(time + 0.03);
      
      time += 0.045 + (Math.random() * 0.075);
    }
  } catch (e) {
    console.warn("Web Audio API sound synthesis failed:", e);
  }
}

// 4. Zero-Maintenance Share Fortune logic
window.shareSiimsiResult = function() {
  if (!window.lastSiimsiProphecy) {
    alert('ยังไม่มีผลคำทำนายให้แชร์ กรุณาเขย่าเซียมซีก่อนครับ');
    return;
  }
  const deityNames = {
    ganesh: 'พระพิฆเนศ',
    guanyin: 'เจ้าแม่กวนอิม',
    citypillar: 'ศาลหลักเมือง'
  };
  const deityName = deityNames[activeSiimsiDeity] || 'สิ่งศักดิ์สิทธิ์';
  const prophecy = window.lastSiimsiProphecy;
  const shareUrl = window.location.origin + window.location.pathname + '#free-horoscope';
  const textToCopy = `✨ ฉันเสี่ยงเซียมซี ${deityName} จาก MuHub ได้ใบที่ ${prophecy.numTH} "${prophecy.title}"!\n\n"${prophecy.poem}"\n\nเลขมงคลนำโชค: ${prophecy.luckyNum}\n\nลองเข้ามาเสี่ยงทายดวงชะตารายวันของคุณได้ที่นี่ ➔ ${shareUrl}`;

  navigator.clipboard.writeText(textToCopy).then(() => {
    alert('คัดลอกลิงก์และผลเซียมซีนำโชคเรียบร้อย! ส่งต่อให้เพื่อนใน Line หรือ Facebook ได้เลยครับ');
  }).catch(err => {
    console.error('Failed to copy: ', err);
  });
};
