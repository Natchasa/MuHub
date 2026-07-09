// table-renderer.js — Render planet dignity and positions table

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

function renderTable() {
  const tbody = document.getElementById('tableTbody');
  let h = '';

  function rows(data, cls, label, useThaiNum) {
    const isNatal = (cls === 'col-n');
    const rowBg = isNatal ? '#ffffff' : '#FFF9E6';
    const rowTextColor = '#000000';
    const nameColor = '#000000';
    const symbolColor = isNatal ? '#2B1505' : '#B03828';
    const headerBg = isNatal ? '#fff0dc' : '#FFEAB0';
    const headerTextColor = '#000000';

    h += `<tr class="group-head"><td colspan="5" style="background: ${headerBg}; color: ${headerTextColor}; padding: .4rem .8rem; font-size: .78rem; font-weight: 700; border-bottom: 1.5px solid #E8D0A0; text-align: left;">${label} — ${data.dateStr} ${data.timeStr}</td></tr>`;
    for (const p of PLANETS) {
      if (data.pos[p.id] === undefined) continue;
      const sp = signPos(data.pos[p.id]);
      let retTag = '';
      const motion = data.retro && data.retro[p.id];
      if (motion === "พักร์" || motion === true) {
        retTag = `<span style="color:#ff3333; font-weight:bold; margin-left:4px; font-size:0.75rem;">(พ)</span>`;
      } else if (motion === "มนต์") {
        retTag = `<span style="color:#2E7D32; font-weight:bold; margin-left:4px; font-size:0.75rem;">(ม)</span>`;
      } else if (motion === "เสริด") {
        retTag = `<span style="color:#1976D2; font-weight:bold; margin-left:4px; font-size:0.75rem;">(ส)</span>`;
      }
      const lbl = useThaiNum ? p.numTH : p.numAR;
      const thName = (p.id === 'lagna' && isNatal && isUnknownTime) ? 'ลัคนา (อ.)' : p.th;
      const dignityHTML = getDignityHTML(p.id, sp.si);
      h += `<tr style="background: ${rowBg}; color: ${rowTextColor};">
          <td style="text-align:center; font-weight:700; font-size:1.05rem; color: ${symbolColor}; border-bottom: 1px solid #E8D0A044; border-right: 1px solid #E8D0A044;">${lbl}</td>
          <td style="border-bottom: 1px solid #E8D0A044; border-right: 1px solid #E8D0A044;"><span class="pname" style="font-weight:700; color: ${nameColor};">${thName}</span>${retTag}</td>
          <td style="border-bottom: 1px solid #E8D0A044; border-right: 1px solid #E8D0A044; font-weight:500; color: ${rowTextColor};">${SIGNS_TH[sp.si]}</td>
          <td style="font-family:monospace; font-size:0.95rem; font-weight:600; border-bottom: 1px solid #E8D0A044; border-right: 1px solid #E8D0A044; color: ${rowTextColor}; white-space: nowrap;">${String(sp.deg).padStart(2,'0')}° ${String(sp.min).padStart(2,'0')}'</td>
          <td style="border-bottom: 1px solid #E8D0A044; color: ${rowTextColor};">${dignityHTML}</td>
          </tr>`;
    }
  }

  if (showN && nData) rows(nData, 'col-n', 'ดวงกำเนิด', true);
  if (showT && tData) rows(tData, 'col-t', 'ดวงจร', false);
  tbody.innerHTML = h || '<tr><td colspan="5" style="padding:.6rem;color:var(--dim);text-align:center">กดผูกดวงเพื่อดูผล</td></tr>';
}
