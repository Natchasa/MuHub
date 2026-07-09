// shop.js — MuHub Shop Modal Logic

// Shop modal variables local to shop logic
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

window.orderViaLine = function() {
  let details = [];
  if (currentItemType === 'wallpaper') {
    const focus = document.getElementById('shopFocus').value;
    details.push(`• สิ่งที่ต้องการเน้น: ${focus}`);
  } else if (currentItemType === 'report') {
    const email = document.getElementById('shopEmail').value;
    if (!email) { alert('กรุณากรอกอีเมลเพื่อรับรายงาน'); return; }
    details.push(`• อีเมลรับ PDF: ${email}`);
  } else if (currentItemType === 'yantra') {
    const addr = document.getElementById('shopAddress').value;
    if (!addr) { alert('กรุณาระบุที่อยู่จัดส่งแผ่นยันต์'); return; }
    details.push(`• ที่อยู่จัดส่ง: ${addr}`);
  } else if (currentItemType === 'bracelet') {
    const size = document.getElementById('shopSize').value;
    const addr = document.getElementById('shopAddress').value;
    if (!size || !addr) { alert('กรุณาระบุขนาดข้อมือและที่อยู่จัดส่ง'); return; }
    details.push(`• ขนาดข้อมือ: ${size}`);
    details.push(`• ที่อยู่จัดส่ง: ${addr}`);
  }
  
  closeShopModal();
  
  // ดึงค่าลัคนาจากป้ายหากมี
  const lagnaBadge = document.getElementById('lagnaBadge');
  const lagnaText = lagnaBadge ? lagnaBadge.textContent : '';
  if (lagnaText) {
    details.push(`• ลัคนาราศีเกิด: ${lagnaText}`);
  }
  
  const msg = [
    `🛒 สั่งซื้อ/บูชาเครื่องราง MuHub`,
    `• สินค้า: ${currentItem}`,
    `• ราคา: ${currentPrice} บาท`,
    ...details,
    `─────────────────`,
    `ส่งข้อความนี้เพื่อติดต่อแอดมิน ชำระเงิน และยืนยันคำสั่งซื้อค่ะ`
  ].join('\n');
  
  const url = 'https://line.me/R/oaMessage/@muhub?text=' + encodeURIComponent(msg);
  window.open(url, '_blank');
};
