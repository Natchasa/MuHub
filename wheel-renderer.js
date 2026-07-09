// wheel-renderer.js — SVG Wheel drawing for Thai Horoscope

const CX = 260;
const CY = 260;

// Radii
const RO = 252;  // zodiac outer
const RZ = 194;  // zodiac inner / transit outer band
const RT = 174;  // transit planet mid
const RD = 157;  // divider
const RN = 140;  // natal planet mid
const RC = 118;  // center

// Colors
const C_BG = '#FFF8E7';          // light bg
const C_ZOD_W = '#FFF9EE';       // zodiac light sector
const C_ZOD_B = '#FFF0DC';       // zodiac cream sector
const C_ZOD_WT = '#2B1505';      // text on light sector
const C_ZOD_BT = '#8B6030';      // text on cream sector
const C_NAT = '#7A5510';         // natal dot fill (dark gold)
const C_NAT_T = '#2B1505';       // natal text (dark brown)
const C_TRN = '#F07060';         // transit dot fill (coral)
const C_TRN_T = '#B03828';       // transit text (dark coral)
const C_DIV = '#D4AF37';         // divider ring (gold)

function f(n) {
  return Math.round(n * 10) / 10;
}

// Aries center (lon=15) at top (12 o'clock), counterclockwise
// offset -15 so that midpoint of Aries sector is exactly at 12 o'clock
function toXY(r, lon) {
  const a = toRad(90 + lon - 15);
  return [CX + r * Math.cos(a), CY - r * Math.sin(a)];
}

function drawWheel() {
  let s = '';

  // 1. Backgrounds
  // Outer circle (transit background) - warm cream/gold
  s += `<circle cx="${CX}" cy="${CY}" r="256" fill="var(--cream2)"/>`;
  // Inner circle (natal background) - white
  s += `<circle cx="${CX}" cy="${CY}" r="210" fill="#ffffff"/>`;

  // 2. Outer boundary circle (gold)
  s += `<circle cx="${CX}" cy="${CY}" r="210" fill="none" stroke="#D4AF37" stroke-width="3.5"/>`;

  // 3. House dividing lines (gold)
  s += `<line x1="215" y1="54.9" x2="215" y2="465.1" stroke="#D4AF37" stroke-width="2"/>`;
  s += `<line x1="305" y1="54.9" x2="305" y2="465.1" stroke="#D4AF37" stroke-width="2"/>`;
  s += `<line x1="54.9" y1="215" x2="465.1" y2="215" stroke="#D4AF37" stroke-width="2"/>`;
  s += `<line x1="54.9" y1="305" x2="465.1" y2="305" stroke="#D4AF37" stroke-width="2"/>`;
  s += `<line x1="111.5" y1="111.5" x2="215" y2="215" stroke="#D4AF37" stroke-width="2"/>`;
  s += `<line x1="305" y1="305" x2="408.5" y2="408.5" stroke="#D4AF37" stroke-width="2"/>`;
  s += `<line x1="408.5" y1="111.5" x2="305" y2="215" stroke="#D4AF37" stroke-width="2"/>`;
  s += `<line x1="215" y1="305" x2="111.5" y2="408.5" stroke="#D4AF37" stroke-width="2"/>`;

  // 5. Zodiac Sign Labels
  for (let i = 0; i < 12; i++) {
    const isAxis = (i % 3 === 0);
    const rLabel = isAxis ? 190 : 196;
    const a = toRad(90 + i * 30);
    const lx = CX + rLabel * Math.cos(a);
    const ly = CY - rLabel * Math.sin(a);
    s += `<text x="${f(lx)}" y="${f(ly)}" text-anchor="middle" dominant-baseline="middle"
          font-size="12" fill="var(--dim)" font-family="Sarabun,sans-serif" font-weight="700" opacity="0.9">${SIGNS_TH[i]}</text>`;
  }

  // 6. Draw Natal Planets
  const natalGroups = Array.from({ length: 12 }, () => []);
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

  for (let i = 0; i < 12; i++) {
    const grp = natalGroups[i];
    const N = grp.length;
    if (N === 0) continue;

    const a = toRad(90 + i * 30);
    const rCenter = (i % 3 === 0) ? 130 : 135;
    const spacing = 28;

    grp.forEach((p, k) => {
      const r = rCenter + (k - (N - 1) / 2) * spacing;
      const px = CX + r * Math.cos(a);
      const py = CY - r * Math.sin(a);

      if (p.id === 'lagna') {
        s += `<circle cx="${f(px)}" cy="${f(py)}" r="14" fill="#FFE070" stroke="#7A5510" stroke-width="1.5" />`;
        s += `<text x="${f(px)}" y="${f(py)}" text-anchor="middle" dominant-baseline="central"
              font-size="17" fill="#2B1505" font-family="Sarabun,sans-serif" font-weight="800">${p.numTH}</text>`;
      } else {
        s += `<text x="${f(px)}" y="${f(py)}" text-anchor="middle" dominant-baseline="central"
              font-size="20" fill="${C_NAT_T}" font-family="Sarabun,sans-serif" font-weight="700">${p.numTH}</text>`;
      }
      if (p.retro === "พักร์" || p.retro === true) {
        s += `<text x="${f(px + 2.5)}" y="${f(py - 2.2)}" font-size="11" fill="#7A5510" font-family="Sarabun,sans-serif" font-weight="bold">พ</text>`;
      } else if (p.retro === "มนต์") {
        s += `<text x="${f(px + 2.5)}" y="${f(py - 2.2)}" font-size="11" fill="#2E7D32" font-family="Sarabun,sans-serif" font-weight="bold">ม</text>`;
      } else if (p.retro === "เสริด") {
        s += `<text x="${f(px + 2.5)}" y="${f(py - 2.2)}" font-size="11" fill="#1976D2" font-family="Sarabun,sans-serif" font-weight="bold">ส</text>`;
      }
    });
  }

  // 7. Draw Transit Planets
  if (showT && tData) {
    const boundaries = [
      78.9, 101.1, 135.0, 168.9, 191.1, 225.0, 258.9, 281.1, 315.0, 348.9, 371.1, 405.0
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
        if (v < min - 180) v += 360;
        if (v > min + 180) v -= 360;
        return mod360(Math.max(min, Math.min(max, v)));
      } else {
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

    let ageLagnaLon = null;
    if (nData) {
      const natalLagnaSp = signPos(nData.pos.lagna);
      const L = natalLagnaSp.si;
      const C = Math.floor((age - 1) / 12);
      const S = (age - 1) % 12;
      const T_L = (L + C + S) % 12;
      ageLagnaLon = T_L * 30 + 15;
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

    const MIN_GAP_DEG = 4.5;
    for (let iter = 0; iter < 20; iter++) {
      transitPlanets.sort((a, b) => a.angle - b.angle);
      for (let i = 0; i < transitPlanets.length; i++) {
        const p1 = transitPlanets[i];
        const p2 = transitPlanets[(i + 1) % transitPlanets.length];
        let diff = p2.angle - p1.angle;
        if (diff < 0) diff += 360;
        if (diff < MIN_GAP_DEG) {
          const overlap = MIN_GAP_DEG - diff;
          const shift = overlap / 2;
          p1.angle = clampAngle(p1.angle - shift, p1.minAngle, p1.maxAngle);
          p2.angle = clampAngle(p2.angle + shift, p2.minAngle, p2.maxAngle);
        }
      }
    }

    const fixedR = 233;
    transitPlanets.forEach(p => {
      const tx = CX + fixedR * Math.cos(toRad(p.angle));
      const ty = CY - fixedR * Math.sin(toRad(p.angle));
      const lbl = p.numAR;
      const isR = p.retro;

      if (p.isAgeLagna) {
        s += `<text x="${f(tx)}" y="${f(ty)}" text-anchor="middle" dominant-baseline="central"
             font-size="26" fill="#2E7D32" font-family="Sarabun,sans-serif" font-weight="900">★</text>`;
      } else {
        s += `<text x="${f(tx)}" y="${f(ty)}" text-anchor="middle" dominant-baseline="central"
             font-size="16" fill="${C_TRN_T}" font-family="Sarabun,sans-serif" font-weight="700">${lbl}</text>`;
        if (isR === "พักร์" || isR === true) {
          s += `<text x="${f(tx + 3.2)}" y="${f(ty - 3.0)}" font-size="10" fill="#4a148c" font-family="Sarabun,sans-serif" font-weight="bold">พ</text>`;
        } else if (isR === "มนต์") {
          s += `<text x="${f(tx + 3.2)}" y="${f(ty - 3.0)}" font-size="10" fill="#2E7D32" font-family="Sarabun,sans-serif" font-weight="bold">ม</text>`;
        } else if (isR === "เสริด") {
          s += `<text x="${f(tx + 3.2)}" y="${f(ty - 3.0)}" font-size="10" fill="#1976D2" font-family="Sarabun,sans-serif" font-weight="bold">ส</text>`;
        }
      }
    });
  }

  // 8. Center circle content
  if (nData) {
    const sunSp = signPos(nData.pos.sun);
    s += `<image href="logo.png" x="226" y="216" width="68" height="68"/>`;
    const sunStr = `${sunSp.deg}/${String(sunSp.min).padStart(2, '0')}`;
    s += `<text x="${CX}" y="${CY + 35}" text-anchor="middle" font-size="12" fill="#2B1505" font-family="Sarabun,sans-serif" font-weight="700">${sunStr}</text>`;
  } else {
    s += `<text x="${CX}" y="${CY}" text-anchor="middle" dominant-baseline="middle" font-size="15" fill="#D4AF37" font-family="Sarabun,sans-serif">ผูกดวง</text>`;
  }

  document.getElementById('wheel-svg').innerHTML = s;
}
