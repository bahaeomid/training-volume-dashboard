// ── Training Volume Dashboard — HTML Export Utility ────────────────────────
// Self-contained HTML export: full-width SVG charts + vanilla-JS hover tooltips.

export interface ExportData {
  muscleData:            Array<{ muscle: string; total: number; Compound: number; Isolation: number }>;
  dayData:               Array<{ day: string; Compound: number; Isolation: number }>;
  frequencyData:         Array<{ muscle: string; frequency: number }>;
  volumeLandmarksData:   Array<{ muscle: string; volume: number; MEV: number; MAV: number; MRV: number; frequency: number }>;
  patternData:           Array<{ pattern: string; volume: number }>;
  compoundPatternData:   Array<{ pattern: string; volume: number }>;
  compoundVsIsolation:   { Compound: number; Isolation: number };
  programScore:          { score: number; grade: string; color: string; details: Array<{ category: string; score: number; max: number; pct: number }> };
  totalRawSets:          number;
  rawCompoundSets:       number;
  rawIsolationSets:      number;
  totalVolume:           number;
  weakPointIndex:        Array<{ muscle: string; wpi: number; volScore: number; freqScore: number; volume: number; frequency: number }>;
  sfrData:               Array<{ muscle: string; isolationPct: number; isolationSets: number; total: number }>;
  balanceAnalysis:       { weeklyCompound: number; weeklyIsolation: number; weeklyCompoundPct: number; dailyBalance: Array<{ day: string; compound: number; isolation: number; total: number; compoundPct: number }> };
  volumeCapViolations:   Array<{ day: string; muscle: string; volume: number }>;
  heatMapData:           Array<{ day: string; [key: string]: number | string }>;
  pushPullRatio:         { pushVol: number; pullVol: number; ratio: number | null };
  musclesByCategory:     Array<{ category: string; Compound: number; Isolation: number; total: number }>;
  filteredTrainingData:  Array<{ exercise: string; day: string; sets: number; primary: string[]; secondary: string[]; pattern: string; type: string; program?: string }>;
  countingMethod:        string;
  radarGroups:           { [key: string]: { label: string; muscles: string[] } };
  volumeByMuscle:        { [key: string]: number };
  muscleExerciseBreakdown: { [key: string]: Array<{ exercise: string; day: string; sets: number; role: string; type: string }> };
}

// ── Colours ─────────────────────────────────────────────────────────────────
const C = {
  compound:  '#6366f1',
  isolation: '#14b8a6',
  below:     '#f43f5e',
  mevmav:    '#10b981',
  mavmrv:    '#059669',
  aboveMRV:  '#f97316',
  freqLow:   '#f59e0b',
  freqOpt:   '#10b981',
  freqHigh:  '#8b5cf6',
  pattern:   ['#6366f1','#14b8a6','#f59e0b','#f43f5e','#8b5cf6','#10b981','#0ea5e9','#f97316','#ec4899','#84cc16'],
  emerald:   '#10b981',
  amber:     '#f59e0b',
};

const scoreHex = (v: number) => v < 40 ? C.below : v < 70 ? C.amber : C.emerald;
const esc = (s: string) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

// ── SVG helpers ──────────────────────────────────────────────────────────────

/**
 * Horizontal stacked bar chart (compound + isolation layers).
 * Full-width SVG — no max-width cap.
 */
function svgHorizontalStacked(
  items: Array<{ label: string; compound: number; isolation: number }>,
  chartName: string,
  opts: { barH?: number; gap?: number; labelW?: number; showRefs?: boolean } = {}
): string {
  const W       = 820;
  const BAR_H   = opts.barH    ?? 22;
  const GAP     = opts.gap     ?? 9;
  const LABEL_W = opts.labelW  ?? 160;
  const R_PAD   = 52;
  const chartW  = W - LABEL_W - R_PAD;
  const topPad  = 28;
  const botPad  = 24;
  const totalH  = topPad + items.length * (BAR_H + GAP) + botPad;
  const maxVal  = Math.max(20, ...items.map(d => d.compound + d.isolation));
  const scale   = (v: number) => (v / maxVal) * chartW;
  const refs    = opts.showRefs !== false;

  const bars = items.map((d, i) => {
    const y     = topPad + i * (BAR_H + GAP);
    const cW    = scale(d.compound);
    const iW    = scale(d.isolation);
    const total = +(d.compound + d.isolation).toFixed(1);
    const txX   = LABEL_W + cW + iW + 6;
    return `
    <text x="${LABEL_W - 8}" y="${y + BAR_H / 2 + 4}" text-anchor="end" font-size="11.5" fill="#475569" pointer-events="none">${esc(d.label)}</text>
    ${cW > 0.5 ? `<rect class="tvd-bar" x="${LABEL_W}" y="${y}" width="${cW}" height="${BAR_H}"
      fill="${C.compound}" rx="3"
      data-chart="${chartName}" data-idx="${i}" data-seg="compound"
      onmousemove="showTip(event,this)" onmouseleave="hideTip()"/>` : ''}
    ${iW > 0.5 ? `<rect class="tvd-bar" x="${LABEL_W + cW}" y="${y}" width="${iW}" height="${BAR_H}"
      fill="${C.isolation}" rx="3"
      data-chart="${chartName}" data-idx="${i}" data-seg="isolation"
      onmousemove="showTip(event,this)" onmouseleave="hideTip()"/>` : ''}
    ${total === 0 ? `<rect x="${LABEL_W}" y="${y + BAR_H/3}" width="${chartW * 0.03}" height="${BAR_H/3}" fill="#e2e8f0" rx="2" pointer-events="none"/>` : ''}
    <text x="${Math.min(txX, W - 8)}" y="${y + BAR_H / 2 + 4}" font-size="10.5" font-weight="700" fill="#1e293b" pointer-events="none">${total > 0 ? total : '–'}</text>`;
  }).join('');

  const refLines = refs ? [
    { v: 4,  color: '#dc2626', label: 'MEV' },
    { v: 10, color: '#059669', label: 'MAV' },
    { v: 20, color: '#d97706', label: 'MRV' },
  ].filter(r => scale(r.v) <= chartW).map(r => `
    <line x1="${LABEL_W + scale(r.v)}" y1="${topPad - 14}" x2="${LABEL_W + scale(r.v)}" y2="${totalH - botPad}"
      stroke="${r.color}" stroke-width="1.5" stroke-dasharray="5,3" pointer-events="none"/>
    <text x="${LABEL_W + scale(r.v) + 3}" y="${topPad - 4}" font-size="9" fill="${r.color}" font-weight="600" pointer-events="none">${r.label}</text>`).join('') : '';

  const legend = `
    <rect x="${LABEL_W}" y="${totalH - 16}" width="11" height="11" fill="${C.compound}" rx="2" pointer-events="none"/>
    <text x="${LABEL_W + 15}" y="${totalH - 6}" font-size="10.5" fill="#475569" pointer-events="none">Compound</text>
    <rect x="${LABEL_W + 90}" y="${totalH - 16}" width="11" height="11" fill="${C.isolation}" rx="2" pointer-events="none"/>
    <text x="${LABEL_W + 105}" y="${totalH - 6}" font-size="10.5" fill="#475569" pointer-events="none">Isolation</text>`;

  return `<svg viewBox="0 0 ${W} ${totalH}" xmlns="http://www.w3.org/2000/svg"
    style="width:100%;display:block">${bars}${refLines}${legend}</svg>`;
}

/**
 * Vertical stacked bar chart (compound + isolation).
 */
function svgVerticalStacked(
  items: Array<{ label: string; compound: number; isolation: number }>,
  chartName: string,
  opts: { height?: number; bottomPad?: number } = {}
): string {
  const W      = 820;
  const H      = opts.height    ?? 300;
  const B_PAD  = opts.bottomPad ?? 64;
  const L_PAD  = 48;
  const R_PAD  = 20;
  const T_PAD  = 24;
  const chartH = H - B_PAD - T_PAD;
  const chartW = W - L_PAD - R_PAD;
  const maxVal = Math.max(1, ...items.map(d => d.compound + d.isolation));
  const scaleY = (v: number) => (v / maxVal) * chartH;
  const step   = chartW / items.length;
  const barW   = Math.max(24, Math.min(70, step * 0.55));

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map(pct => {
    const y   = T_PAD + chartH - pct * chartH;
    const val = Math.round(pct * maxVal);
    return `<line x1="${L_PAD}" y1="${y}" x2="${L_PAD + chartW}" y2="${y}"
      stroke="#e2e8f0" stroke-width="1" pointer-events="none"/>
    <text x="${L_PAD - 6}" y="${y + 4}" text-anchor="end" font-size="9.5" fill="#94a3b8" pointer-events="none">${val}</text>`;
  }).join('');

  const bars = items.map((d, i) => {
    const cx    = L_PAD + i * step + step / 2;
    const x     = cx - barW / 2;
    const cH    = scaleY(d.compound);
    const iH    = scaleY(d.isolation);
    const total = d.compound + d.isolation;
    const botY  = T_PAD + chartH;
    const compPct = total > 0 ? ((d.compound / total) * 100).toFixed(0) : '0';
    return `
    ${iH > 0.5 ? `<rect class="tvd-bar" x="${x}" y="${botY - iH}" width="${barW}" height="${iH}"
      fill="${C.isolation}" rx="2"
      data-chart="${chartName}" data-idx="${i}" data-seg="isolation"
      onmousemove="showTip(event,this)" onmouseleave="hideTip()"/>` : ''}
    ${cH > 0.5 ? `<rect class="tvd-bar" x="${x}" y="${botY - iH - cH}" width="${barW}" height="${cH}"
      fill="${C.compound}" rx="2"
      data-chart="${chartName}" data-idx="${i}" data-seg="compound"
      onmousemove="showTip(event,this)" onmouseleave="hideTip()"/>` : ''}
    ${total > 0 ? `<text x="${cx}" y="${botY - iH - cH - 5}" text-anchor="middle"
      font-size="10" font-weight="700" fill="#1e293b" pointer-events="none">${total}</text>` : ''}
    <text x="${cx}" y="${botY + 16}" text-anchor="middle" font-size="10.5" fill="#475569" pointer-events="none">${esc(d.label)}</text>`;
  }).join('');

  const legend = `
    <rect x="${L_PAD}" y="${H - 18}" width="11" height="11" fill="${C.compound}" rx="2" pointer-events="none"/>
    <text x="${L_PAD + 15}" y="${H - 8}" font-size="10.5" fill="#475569" pointer-events="none">Compound</text>
    <rect x="${L_PAD + 98}" y="${H - 18}" width="11" height="11" fill="${C.isolation}" rx="2" pointer-events="none"/>
    <text x="${L_PAD + 113}" y="${H - 8}" font-size="10.5" fill="#475569" pointer-events="none">Isolation</text>`;

  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg"
    style="width:100%;display:block">${gridLines}${bars}${legend}</svg>`;
}

/**
 * Simple vertical bar chart (single colour per bar, e.g. frequency counts).
 */
function svgVerticalSimple(
  items: Array<{ label: string; value: number; color: string }>,
  chartName: string,
  opts: { height?: number } = {}
): string {
  const W      = 820;
  const H      = opts.height ?? 240;
  const B_PAD  = 56;
  const L_PAD  = 44;
  const R_PAD  = 20;
  const T_PAD  = 24;
  const chartH = H - B_PAD - T_PAD;
  const chartW = W - L_PAD - R_PAD;
  const maxVal = Math.max(1, ...items.map(d => d.value));
  const scaleY = (v: number) => (v / maxVal) * chartH;
  const step   = chartW / items.length;
  const barW   = Math.max(30, Math.min(90, step * 0.5));

  const grid = [0, 0.5, 1].map(pct => {
    const y = T_PAD + chartH - pct * chartH;
    return `<line x1="${L_PAD}" y1="${y}" x2="${L_PAD + chartW}" y2="${y}"
      stroke="#e2e8f0" stroke-width="1" pointer-events="none"/>
    <text x="${L_PAD - 6}" y="${y + 4}" text-anchor="end" font-size="9.5" fill="#94a3b8" pointer-events="none">${Math.round(pct * maxVal)}</text>`;
  }).join('');

  const bars = items.map((d, i) => {
    const cx   = L_PAD + i * step + step / 2;
    const x    = cx - barW / 2;
    const h    = scaleY(d.value);
    const botY = T_PAD + chartH;
    return `
    ${h > 0.5 ? `<rect class="tvd-bar" x="${x}" y="${botY - h}" width="${barW}" height="${h}"
      fill="${d.color}" rx="4"
      data-chart="${chartName}" data-idx="${i}"
      onmousemove="showTip(event,this)" onmouseleave="hideTip()"/>` : ''}
    ${d.value > 0 ? `<text x="${cx}" y="${botY - h - 5}" text-anchor="middle"
      font-size="11" font-weight="700" fill="#1e293b" pointer-events="none">${d.value}</text>` : ''}
    <text x="${cx}" y="${botY + 16}" text-anchor="middle" font-size="11" fill="#475569" pointer-events="none">${esc(d.label)}</text>`;
  }).join('');

  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg"
    style="width:100%;display:block">${grid}${bars}</svg>`;
}

/**
 * Simple horizontal bar chart (single colour per bar, e.g. movement patterns / balance groups).
 */
function svgHorizontalSimple(
  items: Array<{ label: string; value: number; color: string }>,
  chartName: string,
  opts: { labelW?: number; maxVal?: number; groupKey?: string; width?: number; barH?: number; gap?: number } = {}
): string {
  const W       = opts.width  ?? 820;
  const BAR_H   = opts.barH   ?? 20;
  const GAP     = opts.gap    ?? 8;
  const LABEL_W = opts.labelW ?? 170;
  const R_PAD   = 52;
  const chartW  = W - LABEL_W - R_PAD;
  const topPad  = 10;
  const botPad  = 10;
  const totalH  = topPad + items.length * (BAR_H + GAP) + botPad;
  const maxVal  = opts.maxVal ?? Math.max(1, ...items.map(d => d.value));
  const scale   = (v: number) => Math.max(0, (v / maxVal) * chartW);
  const gk      = opts.groupKey ?? '';
  // Scale font sizes with bar height so labels stay vertically centred
  const fs      = Math.max(10, Math.min(13, BAR_H * 0.58));

  const bars = items.map((d, i) => {
    const y  = topPad + i * (BAR_H + GAP);
    const bW = scale(d.value);
    return `
    <text x="${LABEL_W - 8}" y="${y + BAR_H / 2 + fs * 0.36}" text-anchor="end"
      font-size="${fs}" fill="#475569" pointer-events="none">${esc(d.label)}</text>
    ${bW > 0.5
      ? `<rect class="tvd-bar" x="${LABEL_W}" y="${y}" width="${bW}" height="${BAR_H}"
          fill="${d.color}" rx="3"
          data-chart="${chartName}" data-idx="${i}" data-group="${gk}"
          onmousemove="showTip(event,this)" onmouseleave="hideTip()"/>`
      : `<rect x="${LABEL_W}" y="${y + BAR_H/3}" width="${chartW * 0.02}" height="${BAR_H/3}"
          fill="#e2e8f0" rx="2" pointer-events="none"/>`}
    <text x="${LABEL_W + bW + 7}" y="${y + BAR_H / 2 + fs * 0.36}"
      font-size="${fs}" font-weight="700" fill="#1e293b" pointer-events="none">${d.value.toFixed(1)}</text>`;
  }).join('');

  return `<svg viewBox="0 0 ${W} ${totalH}" xmlns="http://www.w3.org/2000/svg"
    style="width:100%;display:block">${bars}</svg>`;
}

// ── HTML layout helpers ──────────────────────────────────────────────────────

const progressBar = (pct: number, color: string) =>
  `<div style="background:#e2e8f0;border-radius:4px;height:6px;overflow:hidden;margin-top:3px">
    <div style="background:${color};height:100%;width:${Math.min(100,pct).toFixed(1)}%;border-radius:4px"></div>
  </div>`;

const kpiCard = (label: string, value: string, sub: string, accent: string) =>
  `<div style="background:#fff;border:1px solid #e2e8f0;border-top:4px solid ${accent};border-radius:12px;padding:18px 16px">
    <div style="font-size:11px;color:#64748b;font-weight:500;margin-bottom:6px;text-transform:uppercase;letter-spacing:.04em">${label}</div>
    <div style="font-size:28px;font-weight:800;color:${accent};line-height:1.1">${value}</div>
    <div style="font-size:11px;color:#94a3b8;margin-top:5px">${sub}</div>
  </div>`;

const section = (title: string, content: string, icon = '') =>
  `<div style="margin-bottom:44px">
    <div style="border-left:4px solid #6366f1;padding-left:14px;margin-bottom:22px">
      <h2 style="font-size:19px;font-weight:800;color:#1e293b;margin:0;letter-spacing:-.01em">${icon ? icon + ' ' : ''}${title}</h2>
    </div>
    <div style="background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:24px">${content}</div>
  </div>`;

const subSection = (title: string, content: string) =>
  `<div style="margin-bottom:28px">
    <h3 style="font-size:13px;font-weight:700;color:#334155;margin:0 0 14px;text-transform:uppercase;letter-spacing:.05em">${title}</h3>
    ${content}
  </div>`;

const insightBox = (html: string) =>
  `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-left:3px solid #6366f1;border-radius:8px;padding:12px 16px;font-size:12px;color:#334155;line-height:1.7;margin-top:14px">${html}</div>`;

const badge = (text: string, bg: string, color: string) =>
  `<span style="display:inline-block;background:${bg};color:${color};border-radius:20px;padding:1px 9px;font-size:10px;font-weight:700">${text}</span>`;

const miniCard = (label: string, count: string|number, items: string[], color: string) =>
  `<div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:14px">
    <div style="font-size:10px;font-weight:700;color:${color};text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">${label}</div>
    <div style="font-size:28px;font-weight:800;color:${color};margin-bottom:10px">${count}</div>
    ${items.map(m => `<div style="font-size:11px;color:#475569;margin-bottom:3px;padding-left:8px;border-left:2px solid ${color}20">${esc(m)}</div>`).join('')}
    ${items.length === 0 ? `<div style="font-size:11px;color:#94a3b8;font-style:italic">None</div>` : ''}
  </div>`;

const htmlTable = (headers: string[], rows: string[][], align: ('left'|'center'|'right')[] = []) =>
  `<div style="overflow-x:auto">
  <table style="width:100%;border-collapse:collapse;font-size:12px">
    <thead>
      <tr style="background:#f8fafc;border-bottom:2px solid #e2e8f0">
        ${headers.map((h, i) =>
          `<th style="padding:9px 12px;text-align:${align[i]??'left'};font-weight:700;color:#475569;white-space:nowrap;font-size:11px;text-transform:uppercase;letter-spacing:.04em">${h}</th>`
        ).join('')}
      </tr>
    </thead>
    <tbody>
      ${rows.map((row, ri) =>
        `<tr style="border-bottom:1px solid #f1f5f9;background:${ri % 2 ? '#fafafa' : '#fff'}">
          ${row.map((cell, ci) =>
            `<td style="padding:8px 12px;text-align:${align[ci]??'left'};color:#334155">${cell}</td>`
          ).join('')}
        </tr>`
      ).join('')}
    </tbody>
  </table>
  </div>`;

// ── JavaScript tooltip block ─────────────────────────────────────────────────

function buildScript(d: ExportData): string {
  // Frequency distribution buckets
  const freqBuckets = [
    { label: '1×/week',  count: d.frequencyData.filter(f => f.frequency === 1).length,  muscles: d.frequencyData.filter(f => f.frequency === 1).map(f => f.muscle)  },
    { label: '2×/week',  count: d.frequencyData.filter(f => f.frequency === 2).length,  muscles: d.frequencyData.filter(f => f.frequency === 2).map(f => f.muscle)  },
    { label: '3×/week',  count: d.frequencyData.filter(f => f.frequency === 3).length,  muscles: d.frequencyData.filter(f => f.frequency === 3).map(f => f.muscle)  },
    { label: '4+×/week', count: d.frequencyData.filter(f => f.frequency >= 4).length,   muscles: d.frequencyData.filter(f => f.frequency >= 4).map(f => f.muscle + ' (' + f.frequency + 'x)') },
  ];

  // Balance group items keyed by group id
  const balanceItemMap: Record<string, Array<{muscle:string;value:number}>> = {};
  Object.entries(d.radarGroups).forEach(([key, group]) => {
    balanceItemMap[key] = group.muscles
      .filter(m => d.volumeByMuscle[m] !== undefined)
      .map(m => ({ muscle: m, value: d.volumeByMuscle[m] || 0 }));
  });

  // Muscle max-vol-per-day map for heatmap tooltip
  const muscleMaxVolPerDay: Record<string, number> = {};
  const heatMuscles = Object.keys(d.volumeByMuscle);
  heatMuscles.forEach(muscle => {
    muscleMaxVolPerDay[muscle] = Math.max(0, ...d.heatMapData.map(row => (row[muscle] as number) || 0));
  });

  // Category data for major muscle groups chart
  const catData = d.musclesByCategory.map(c => ({
    category: c.category, Compound: c.Compound, Isolation: c.Isolation, total: c.Compound + c.Isolation
  }));

  const tvd = {
    muscleData:   d.muscleData,
    freqMap:      Object.fromEntries(d.frequencyData.map(f => [f.muscle, f.frequency])),
    dayData:      d.dayData,
    catData,
    freqBuckets,
    patternData:  d.compoundPatternData,
    balanceItems: balanceItemMap,
    muscleMaxVolPerDay,
    radarGroups:  Object.fromEntries(Object.entries(d.radarGroups).map(([k, g]) => [k, g.label])),
  };

  return `<script>
(function(){
  var TVD = ${JSON.stringify(tvd)};
  var tip = document.getElementById('tvd-tip');

  function lm(vol) {
    if (vol <= 0)   return '<span style="color:#94a3b8">No volume</span>';
    if (vol < 4)    return '<span style="color:#f43f5e;font-weight:600">↓ Below MEV (&lt;4 sets)</span>';
    if (vol < 10)   return '<span style="color:#10b981;font-weight:600">✓ MEV–MAV (4–10 sets)</span>';
    if (vol <= 20)  return '<span style="color:#059669;font-weight:600">✓ MAV–MRV (10–20 sets)</span>';
    return '<span style="color:#f97316;font-weight:600">↑ Above MRV (&gt;20 sets)</span>';
  }
  function e(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;'); }
  function pct(a,b){ return b > 0 ? ((a/b)*100).toFixed(0)+'%' : '0%'; }

  window.showTip = function(evt, el) {
    var chart = el.dataset.chart;
    var idx   = parseInt(el.dataset.idx || '0');
    var seg   = el.dataset.seg || '';
    var html  = '';

    if (chart === 'muscle' || chart === 'catbar') {
      var m = chart === 'muscle' ? TVD.muscleData[idx] : TVD.catData[idx];
      var freq = chart === 'muscle' ? (TVD.freqMap[m.muscle] || 0) : null;
      var name = m.muscle || m.category;
      var tot  = m.total || (m.Compound + m.Isolation);
      html = '<div style="font-weight:700;font-size:13px;margin-bottom:8px;color:#1e293b">'+e(name)+'</div>'
           + '<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">'
           + '<span style="display:inline-block;width:10px;height:10px;background:#6366f1;border-radius:2px"></span>'
           + '<span style="color:#475569">Compound</span>'
           + '<strong style="margin-left:auto">'+m.Compound.toFixed(1)+' sets</strong></div>'
           + '<div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">'
           + '<span style="display:inline-block;width:10px;height:10px;background:#14b8a6;border-radius:2px"></span>'
           + '<span style="color:#475569">Isolation</span>'
           + '<strong style="margin-left:auto">'+m.Isolation.toFixed(1)+' sets</strong></div>'
           + '<div style="border-top:1px solid #f1f5f9;padding-top:8px;margin-bottom:6px">'
           + '<div style="display:flex;justify-content:space-between"><span style="color:#475569">Total</span>'
           + '<strong>'+tot.toFixed(1)+' sets</strong></div></div>'
           + lm(tot)
           + (freq !== null ? '<br><span style="color:#64748b">Freq: '+freq+'×/week</span>' : '');
      if (seg) {
        html += '<div style="margin-top:6px;font-size:10px;color:#94a3b8">Click = '+seg+' segment highlighted</div>';
      }
    } else if (chart === 'day') {
      var day = TVD.dayData[idx];
      var tot2 = day.Compound + day.Isolation;
      var cp   = pct(day.Compound, tot2);
      var ip   = pct(day.Isolation, tot2);
      html = '<div style="font-weight:700;font-size:13px;margin-bottom:8px;color:#1e293b">'+e(day.day)+'</div>'
           + '<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">'
           + '<span style="display:inline-block;width:10px;height:10px;background:#6366f1;border-radius:2px"></span>'
           + '<span style="color:#475569">Compound</span>'
           + '<strong style="margin-left:auto">'+day.Compound+' sets ('+cp+')</strong></div>'
           + '<div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">'
           + '<span style="display:inline-block;width:10px;height:10px;background:#14b8a6;border-radius:2px"></span>'
           + '<span style="color:#475569">Isolation</span>'
           + '<strong style="margin-left:auto">'+day.Isolation+' sets ('+ip+')</strong></div>'
           + '<div style="border-top:1px solid #f1f5f9;padding-top:8px">'
           + '<div style="display:flex;justify-content:space-between"><span style="color:#475569">Total</span>'
           + '<strong>'+tot2+' sets</strong></div></div>'
           + (tot2 > 20
             ? '<br><span style="color:#f43f5e;font-weight:600">⚠ Heavy day — consider splitting</span>'
             : (tot2 > 12 ? '<br><span style="color:#f59e0b;font-weight:600">Moderate load day</span>'
                          : '<br><span style="color:#10b981;font-weight:600">✓ Manageable day load</span>'));
    } else if (chart === 'freq') {
      var fb = TVD.freqBuckets[idx];
      html = '<div style="font-weight:700;font-size:13px;margin-bottom:8px;color:#1e293b">'+e(fb.label)+'</div>'
           + '<div style="color:#475569;margin-bottom:6px">'+fb.count+' muscle'+(fb.count!==1?'s':'')+'</div>'
           + (fb.muscles.length > 0
             ? '<div style="font-size:11px;color:#64748b">'+fb.muscles.map(e).join(', ')+'</div>'
             : '<div style="font-size:11px;color:#94a3b8;font-style:italic">None</div>');
    } else if (chart === 'pattern') {
      var pt = TVD.patternData[idx];
      html = '<div style="font-weight:700;font-size:13px;margin-bottom:8px;color:#1e293b">'+e(pt.pattern)+'</div>'
           + '<div style="display:flex;justify-content:space-between"><span style="color:#475569">Volume</span>'
           + '<strong>'+pt.volume+' sets</strong></div>';
    } else if (chart.indexOf('balance') === 0) {
      var gk  = el.dataset.group || '';
      var bi  = TVD.balanceItems[gk];
      if (bi && bi[idx]) {
        var bm = bi[idx];
        html = '<div style="font-weight:700;font-size:13px;margin-bottom:6px;color:#1e293b">'+e(bm.muscle)+'</div>'
             + '<div style="display:flex;justify-content:space-between;margin-bottom:6px">'
             + '<span style="color:#475569">Volume</span><strong>'+bm.value.toFixed(1)+' sets</strong></div>'
             + '<div style="color:#64748b;font-size:11px">Group: '+e(TVD.radarGroups[gk] || gk)+'</div><br>'
             + lm(bm.value);
      }
    } else if (chart === 'heat') {
      var muscle2 = el.dataset.muscle || '';
      var day2    = el.dataset.day    || '';
      var vol2    = parseFloat(el.dataset.vol    || '0');
      var maxV    = parseFloat(el.dataset.maxvol || '0');
      var overCap = vol2 > 10;
      var pctDay  = maxV > 0 ? ((vol2/maxV)*100).toFixed(0) : '0';
      html = '<div style="font-weight:700;font-size:13px;margin-bottom:6px;color:#1e293b">'+e(muscle2)+'<span style="font-weight:400;color:#64748b"> on '+e(day2)+'</span></div>';
      if (vol2 > 0) {
        html += '<div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="color:#475569">Sets</span><strong>'+vol2.toFixed(1)+'</strong></div>';
        html += '<div style="color:#64748b;font-size:11px;margin-bottom:6px">'+pctDay+'% of peak day for this muscle</div>';
        html += overCap
          ? '<span style="color:#ef4444;font-weight:600">⚠ Cap exceeded — max 10 sets/session<br>Over by '+(vol2-10).toFixed(1)+' sets</span>'
          : '<span style="color:#10b981;font-weight:600">✓ Within session cap</span>';
      } else {
        html += '<div style="color:#94a3b8;font-style:italic">Not trained this day</div>';
      }
    }

    if (!html) return;
    tip.innerHTML = html;
    tip.style.display = 'block';
    positionTip(evt);
  };

  window.hideTip = function() { tip.style.display = 'none'; };

  function positionTip(evt) {
    if (tip.style.display !== 'block') return;
    var x  = evt.clientX + 16, y = evt.clientY - 12;
    var tw = tip.offsetWidth,   th = tip.offsetHeight;
    if (x + tw + 12 > window.innerWidth)  x = evt.clientX - tw - 16;
    if (y + th + 12 > window.innerHeight) y = evt.clientY - th - 12;
    tip.style.left = x + 'px';
    tip.style.top  = y + 'px';
  }
  document.addEventListener('mousemove', function(evt) {
    if (tip.style.display === 'block') positionTip(evt);
  });
})();
</script>`;
}

// ── Main export function ─────────────────────────────────────────────────────

export function generateExportHTML(d: ExportData): string {
  const now = new Date().toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' });
  const scoreColor = d.programScore.color === 'green' ? C.emerald
    : d.programScore.color === 'blue' ? '#3b82f6'
    : d.programScore.color === 'amber' ? C.amber : C.below;

  // ── KPI row ──────────────────────────────────────────────────────────────
  const kpiRow = `
    <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:12px;margin-bottom:32px">
      ${kpiCard('Program Score', String(d.programScore.score), `Grade: ${d.programScore.grade}`, scoreColor)}
      ${kpiCard('Total Sets (Raw)', String(d.totalRawSets), `${d.rawCompoundSets}C + ${d.rawIsolationSets}I`, '#64748b')}
      ${kpiCard('Muscle-Weighted', d.totalVolume.toFixed(1), `across ${Object.keys(d.volumeByMuscle).length} muscles`, '#64748b')}
      ${kpiCard('Compound Sets', String(d.rawCompoundSets), `${d.totalRawSets > 0 ? ((d.rawCompoundSets/d.totalRawSets)*100).toFixed(0) : 0}% of total`, C.compound)}
      ${kpiCard('Isolation Sets', String(d.rawIsolationSets), `${d.totalRawSets > 0 ? ((d.rawIsolationSets/d.totalRawSets)*100).toFixed(0) : 0}% of total`, C.isolation)}
      ${kpiCard('Training Days', String(d.dayData.length), `Avg: ${d.dayData.length > 0 ? (d.totalRawSets/d.dayData.length).toFixed(1) : 0} sets/day`, C.amber)}
    </div>`;

  // ── Score breakdown ───────────────────────────────────────────────────────
  const scoreBreakdown = `
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px">
      ${d.programScore.details.map(det => `
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px">
          <div style="font-size:10px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px">${det.category}</div>
          <div style="font-size:20px;font-weight:800;color:${scoreHex(det.pct)}">${det.pct.toFixed(0)}%</div>
          ${progressBar(det.pct, scoreHex(det.pct))}
          <div style="font-size:10px;color:#94a3b8;margin-top:5px">${det.score.toFixed(1)} / ${det.max} pts</div>
        </div>`).join('')}
    </div>`;

  // ── Executive summary ──────────────────────────────────────────────────────
  const optimalMuscles = d.muscleData.filter(m => m.total >= 4 && m.total <= 20);
  const optimalFreqMs  = d.frequencyData.filter(f => f.frequency >= 2 && f.frequency <= 3);
  const balanceOK      = d.balanceAnalysis.weeklyCompoundPct >= 40 && d.balanceAnalysis.weeklyCompoundPct <= 70;
  const lagging        = d.muscleData.filter(m => m.total < 4);
  const lowFreq        = d.frequencyData.filter(f => f.frequency === 1);
  const allTracked     = ['Quads','Glutes','Hams','Chest','Lats','Front Delts','Side Delts','Rear Delts','Biceps','Triceps','Abs'];
  const zeroVol        = allTracked.filter(m => !d.volumeByMuscle[m]);
  const aboveMRV       = d.muscleData.filter(m => m.total > 20);
  const highVol        = d.muscleData.filter(m => m.total > 15);

  const strengths = [
    optimalMuscles.length >= d.muscleData.length * 0.6 && `${optimalMuscles.length}/${d.muscleData.length} muscles in optimal volume range (MEV–MRV)`,
    optimalFreqMs.length  >= d.frequencyData.length * 0.5 && `${optimalFreqMs.length} muscles at optimal frequency (2–3×/wk)`,
    balanceOK && `Compound/isolation balance: ${d.balanceAnalysis.weeklyCompoundPct.toFixed(0)}% — within 40–70% target`,
    d.volumeCapViolations.length === 0 && 'No session volume cap violations',
  ].filter(Boolean) as string[];

  const attention = [
    lagging.length > 0 && `${lagging.length} muscle${lagging.length > 1 ? 's' : ''} below MEV: ${lagging.map(m => m.muscle + ' (' + m.total.toFixed(1) + ')').join(', ')}`,
    zeroVol.length > 0 && `${zeroVol.length} muscle group${zeroVol.length > 1 ? 's' : ''} untrained: ${zeroVol.join(', ')}`,
    lowFreq.length > 0 && `${lowFreq.length} muscle${lowFreq.length > 1 ? 's' : ''} only 1×/week: ${lowFreq.map(f => f.muscle).join(', ')}`,
    d.volumeCapViolations.length > 0 && `${d.volumeCapViolations.length} session cap violation${d.volumeCapViolations.length > 1 ? 's' : ''}: ${d.volumeCapViolations.map(v => v.day + ': ' + v.muscle + ' (' + v.volume.toFixed(1) + ')').join(', ')}`,
  ].filter(Boolean) as string[];

  const deloadNeeded = aboveMRV.length >= 2 || highVol.length >= 4;

  const execSummary = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px">
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px">
        <div style="font-size:11px;font-weight:700;color:#16a34a;margin-bottom:10px;text-transform:uppercase;letter-spacing:.05em">✓ Strengths</div>
        ${strengths.length === 0
          ? '<div style="font-size:12px;color:#94a3b8;font-style:italic">None detected</div>'
          : strengths.map(s => `<div style="font-size:12px;color:#166534;margin-bottom:6px;display:flex;gap:7px"><span>·</span><span>${esc(s)}</span></div>`).join('')}
      </div>
      <div style="background:#fff5f5;border:1px solid #fecaca;border-radius:10px;padding:16px">
        <div style="font-size:11px;font-weight:700;color:#dc2626;margin-bottom:10px;text-transform:uppercase;letter-spacing:.05em">⚠ Needs Attention</div>
        ${attention.length === 0
          ? '<div style="font-size:12px;color:#94a3b8;font-style:italic">No issues detected</div>'
          : attention.map(s => `<div style="font-size:12px;color:#991b1b;margin-bottom:6px;display:flex;gap:7px"><span>·</span><span>${esc(s)}</span></div>`).join('')}
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:16px">
        <div style="font-size:11px;font-weight:700;color:#6366f1;margin-bottom:10px;text-transform:uppercase;letter-spacing:.05em">Recovery &amp; Fatigue</div>
        <div style="font-size:12px;color:#334155;margin-bottom:6px">Total weekly load: <strong>${d.totalRawSets} sets</strong></div>
        ${highVol.length > 0 ? `<div style="font-size:12px;color:#334155;margin-bottom:6px">${highVol.length} high-vol muscles (&gt;15 sets): ${highVol.map(m => esc(m.muscle)+'('+m.total.toFixed(1)+')').join(', ')}</div>` : ''}
        <div style="font-size:12px;color:${deloadNeeded ? C.amber : C.emerald};font-weight:600">${deloadNeeded ? '⚠️ Deload may be warranted — multiple muscles near MRV' : '✓ Load appears manageable'}</div>
      </div>
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:16px">
        <div style="font-size:11px;font-weight:700;color:#6366f1;margin-bottom:10px;text-transform:uppercase;letter-spacing:.05em">Program Structure</div>
        ${(() => {
          const allPats = d.filteredTrainingData.map(e => e.pattern.toLowerCase());
          const missing = [
            !allPats.some(p => p.includes('squat'))           && 'Squat/Leg Press',
            !allPats.some(p => p.includes('hinge'))           && 'Hip Hinge',
            !allPats.some(p => p.includes('vertical pull'))   && 'Vertical Pull',
            !allPats.some(p => p.includes('horizontal pull')) && 'Horizontal Pull',
            !allPats.some(p => p.includes('horizontal push')) && 'Horizontal Push',
            !allPats.some(p => p.includes('vertical push'))   && 'Vertical Push',
          ].filter(Boolean);
          const avgSPD = d.dayData.length > 0 ? (d.totalRawSets / d.dayData.length).toFixed(1) : '0';
          const maxDay = d.dayData.reduce((m, dd) => Math.max(m, dd.Compound + dd.Isolation), 0);
          const heavy  = d.dayData.filter(dd => (dd.Compound + dd.Isolation) === maxDay).map(dd => dd.day).join(', ');
          return `<div style="font-size:12px;color:${missing.length===0?C.emerald:C.below};font-weight:600;margin-bottom:6px">
            ${missing.length===0 ? '✓ All 6 movement patterns covered' : missing.length+' patterns missing: '+missing.map(String).join(', ')}</div>
          <div style="font-size:12px;color:#334155;margin-bottom:4px">Avg ${avgSPD} sets/day · ${d.dayData.length} training days</div>
          <div style="font-size:12px;color:#334155">Heaviest: <strong>${esc(heavy)}</strong> (${maxDay} sets)</div>`;
        })()}
      </div>
    </div>`;

  // ── Volume Detail charts ───────────────────────────────────────────────────
  const volumeDetailChart = svgHorizontalStacked(
    d.muscleData.map(m => ({ label: m.muscle, compound: m.Compound, isolation: m.Isolation })),
    'muscle',
    { showRefs: true }
  );
  const muscleGroupChart = svgVerticalStacked(
    d.musclesByCategory.map(c => ({ label: c.category, compound: c.Compound, isolation: c.Isolation })),
    'catbar',
    { height: 300 }
  );

  const scorecardRows = d.weakPointIndex.map(m => {
    const sfr = d.sfrData.find(s => s.muscle === m.muscle);
    const sp  = sfr ? sfr.isolationPct : 0;
    const lm  = m.volume < 4 ? badge('↓ Below MEV','#fee2e2','#991b1b')
               : m.volume <= 10 ? badge('MEV–MAV','#dcfce7','#166534')
               : m.volume <= 20 ? badge('MAV–MRV','#d1fae5','#065f46')
               : badge('↑ Above MRV','#fef3c7','#92400e');
    return [
      `<strong>${esc(m.muscle)}</strong>`,
      `<span style="font-size:15px;font-weight:800;color:${scoreHex(m.wpi)}">${m.wpi}</span>`,
      `<div style="width:100px">${progressBar(m.wpi, scoreHex(m.wpi))}</div>`,
      m.volume.toFixed(1),
      m.frequency + '×/wk',
      lm,
      `<span style="font-weight:700;color:${scoreHex(sp)}">${sp}%</span>`,
      sfr ? sfr.isolationSets.toFixed(1) : '0',
    ];
  });

  // ── Targets & Frequency ───────────────────────────────────────────────────
  const freqChartItems = [
    { label: '1×/week',  value: d.frequencyData.filter(f => f.frequency === 1).length,  color: C.freqLow  },
    { label: '2×/week',  value: d.frequencyData.filter(f => f.frequency === 2).length,  color: C.freqOpt  },
    { label: '3×/week',  value: d.frequencyData.filter(f => f.frequency === 3).length,  color: C.freqOpt  },
    { label: '4+×/week', value: d.frequencyData.filter(f => f.frequency >= 4).length,   color: C.freqHigh },
  ];
  const freqChart = svgVerticalSimple(freqChartItems, 'freq', { height: 240 });

  const belowMEV = d.volumeLandmarksData.filter(m => m.volume < 4).sort((a,b) => b.volume-a.volume);
  const mevMav   = d.volumeLandmarksData.filter(m => m.volume >= 4 && m.volume < 10).sort((a,b) => b.volume-a.volume);
  const mavMrv   = d.volumeLandmarksData.filter(m => m.volume >= 10 && m.volume <= 20).sort((a,b) => b.volume-a.volume);
  const abvMRV   = d.volumeLandmarksData.filter(m => m.volume > 20).sort((a,b) => b.volume-a.volume);
  const landmarkGrid = `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px">
    ${miniCard('Below MEV (< 4 sets)', belowMEV.length, belowMEV.map(m => m.muscle+' — '+m.volume.toFixed(1)), C.below)}
    ${miniCard('MEV–MAV (4–10 sets)',  mevMav.length,   mevMav.map(m => m.muscle+' — '+m.volume.toFixed(1)),   C.mevmav)}
    ${miniCard('MAV–MRV (10–20 sets)', mavMrv.length,   mavMrv.map(m => m.muscle+' — '+m.volume.toFixed(1)),   C.mavmrv)}
    ${miniCard('Above MRV (> 20 sets)',abvMRV.length,   abvMRV.map(m => m.muscle+' — '+m.volume.toFixed(1)),   C.aboveMRV)}
  </div>`;

  // ── Program Structure ─────────────────────────────────────────────────────
  const dailyChart = svgVerticalStacked(
    d.dayData.map(dd => ({ label: dd.day, compound: dd.Compound, isolation: dd.Isolation })),
    'day', { height: 300 }
  );
  const patternChart = svgHorizontalSimple(
    d.compoundPatternData.map((p, i) => ({ label: p.pattern, value: p.volume, color: C.pattern[i % C.pattern.length] })),
    'pattern', { labelW: 175, width: 450, barH: 28, gap: 11 }
  );
  const compTotal = d.compoundVsIsolation.Compound + d.compoundVsIsolation.Isolation;
  const compPct   = compTotal > 0 ? ((d.compoundVsIsolation.Compound / compTotal) * 100).toFixed(0) : '0';
  const isoBal    = d.balanceAnalysis.weeklyCompoundPct >= 40 && d.balanceAnalysis.weeklyCompoundPct <= 70;

  // ── Heatmap ──────────────────────────────────────────────────────────────
  const heatMuscles = Object.keys(d.volumeByMuscle).sort((a,b) => d.volumeByMuscle[b]-d.volumeByMuscle[a]);
  const heatDays    = d.heatMapData.map(r => r.day as string);
  const muscleMaxVol: Record<string, number> = {};
  heatMuscles.forEach(m => {
    muscleMaxVol[m] = Math.max(0, ...d.heatMapData.map(r => (r[m] as number)||0));
  });
  const heatHeader  = ['Muscle', ...heatDays, 'Total', 'Freq'];
  const heatRows: string[][] = heatMuscles.map(muscle => {
    const freq = d.frequencyData.find(f => f.muscle === muscle)?.frequency ?? 0;
    const cells = d.heatMapData.map(row => {
      const vol     = (row[muscle] as number) || 0;
      const maxVol  = muscleMaxVol[muscle];
      const inten   = vol > 0 && maxVol > 0 ? vol / maxVol : 0;
      const overCap = vol > 10;
      const bg      = vol > 0
        ? overCap
          ? `rgba(239,68,68,${(0.2 + inten * 0.7).toFixed(2)})`
          : `rgba(99,102,241,${(0.1 + inten * 0.6).toFixed(2)})`
        : 'transparent';
      const textCol = inten > 0.65 ? '#fff' : '#334155';
      return `<div
        data-chart="heat"
        data-muscle="${esc(muscle)}"
        data-day="${esc(row.day as string)}"
        data-vol="${vol.toFixed(1)}"
        data-maxvol="${maxVol.toFixed(1)}"
        onmousemove="showTip(event,this)" onmouseleave="hideTip()"
        style="background:${bg};border-radius:5px;padding:4px 7px;text-align:center;
          font-weight:${overCap?700:400};color:${textCol};
          cursor:${vol>0?'pointer':'default'};min-width:36px;display:inline-block"
      >${vol > 0 ? vol.toFixed(1) : '–'}</div>`;
    });
    return [
      `<strong>${esc(muscle)}</strong>`,
      ...cells,
      `<strong>${d.volumeByMuscle[muscle].toFixed(1)}</strong>`,
      freq + '×',
    ];
  });

  // ── Balance Check ────────────────────────────────────────────────────────
  const balanceCards = Object.entries(d.radarGroups).map(([key, group]) => {
    const items = group.muscles
      .filter(m => d.volumeByMuscle[m] !== undefined)
      .map(m => ({
        label: m,
        value: d.volumeByMuscle[m] || 0,
        color: (d.volumeByMuscle[m]||0) >= 4 && (d.volumeByMuscle[m]||0) <= 20 ? C.emerald
              : (d.volumeByMuscle[m]||0) > 20 ? C.aboveMRV : C.below,
      }));
    const chart = items.length > 0
      ? svgHorizontalSimple(items, `balance-${key}`, { labelW: 145, maxVal: Math.max(20, ...items.map(i => i.value)), groupKey: key, width: 420, barH: 32, gap: 12 })
      : '<div style="font-size:11px;color:#94a3b8;font-style:italic;padding:12px 0">No data</div>';
    const itemDetail = items.map(it => {
      const lBadge = it.value >= 4 && it.value <= 20 ? badge('✓ Optimal','#dcfce7','#166534')
                   : it.value > 20 ? badge('↑ Above MRV','#fef3c7','#92400e')
                   : badge('↓ Below MEV','#fee2e2','#991b1b');
      return `<div style="display:flex;justify-content:space-between;align-items:center;
        margin-bottom:5px;font-size:12px;padding-top:5px;border-top:1px solid #f1f5f9">
        <span style="color:#334155">${esc(it.label)}</span>
        <span style="display:flex;align-items:center;gap:8px">
          <span style="color:#64748b">${it.value.toFixed(1)} sets</span>${lBadge}
        </span></div>`;
    }).join('');
    return `<div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:18px">
      <div style="font-size:12px;font-weight:700;color:#6366f1;margin-bottom:14px;text-transform:uppercase;letter-spacing:.05em">${esc(group.label)}</div>
      ${chart}
      ${items.length > 0 ? '<div style="margin-top:14px">'+itemDetail+'</div>' : ''}
    </div>`;
  });

  const { pushVol, pullVol, ratio } = d.pushPullRatio;
  const ppTotal   = pushVol + pullVol;
  const pushPct   = ppTotal > 0 ? ((pushVol/ppTotal)*100).toFixed(0) : '0';
  const pullPct   = ppTotal > 0 ? ((pullVol/ppTotal)*100).toFixed(0) : '0';
  const ppStatus  = ratio === null ? badge('No pull volume','#f1f5f9','#64748b')
                  : ratio > 1.2 ? badge('⚠ Push-heavy','#fef3c7','#92400e')
                  : ratio < 0.8 ? badge('↑ Pull-heavy','#dbeafe','#1d4ed8')
                  : badge('✓ Balanced','#dcfce7','#16a34a');

  // ── Exercise table ───────────────────────────────────────────────────────
  const exerciseRows = d.filteredTrainingData.map(ex => [
    `<strong>${esc(ex.exercise)}</strong>`,
    ex.day,
    `<span style="background:${ex.type==='Compound'?'#ede9fe':'#ccfbf1'};color:${ex.type==='Compound'?'#6366f1':'#0d9488'};border-radius:4px;padding:1px 7px;font-size:10px;font-weight:700">${ex.type}</span>`,
    String(ex.sets),
    ex.primary.map(esc).join(', '),
    ex.secondary.map(esc).join(', ') || '–',
    esc(ex.pattern),
    esc(ex.program || '–'),
  ]);

  // ── Assemble ─────────────────────────────────────────────────────────────
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Training Volume Analysis — Export</title>
  <style>
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
    body {
      font-family: 'Inter','Segoe UI',system-ui,sans-serif;
      background: #f1f5f9;
      color: #1e293b;
      line-height: 1.5;
      padding: 40px 24px;
      font-size: 13px;
    }
    .page { max-width: 1000px; margin: 0 auto; }
    h2 { font-size:19px; font-weight:800; }
    h3 { font-size:13px; font-weight:700; }
    .tvd-bar { cursor:pointer; transition:opacity .1s; }
    .tvd-bar:hover { opacity:.72; }
    #tvd-tip {
      position: fixed;
      z-index: 9999;
      pointer-events: none;
      display: none;
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 12px 16px;
      font-size: 12px;
      line-height: 1.65;
      box-shadow: 0 8px 32px rgba(0,0,0,.14), 0 2px 8px rgba(0,0,0,.06);
      min-width: 190px;
      max-width: 280px;
    }
    @media print {
      body { background:#fff; padding:20px; }
      .page-break { page-break-before:always; }
      .tvd-bar { cursor:default !important; }
      #tvd-tip { display:none !important; }
    }
  </style>
</head>
<body>
<div id="tvd-tip"></div>
<div class="page">

  <!-- Header -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:20px;border-bottom:3px solid #e2e8f0">
    <div>
      <h1 style="font-size:30px;font-weight:800;color:#1e293b;letter-spacing:-.02em;margin-bottom:4px">Training Volume Analysis</h1>
      <p style="color:#64748b;font-size:13px">Program structure · muscle volume · weekly distribution</p>
    </div>
    <div style="text-align:right;flex-shrink:0;margin-left:20px">
      <div style="font-size:11px;color:#94a3b8;margin-bottom:2px">Exported on</div>
      <div style="font-size:13px;font-weight:600;color:#475569;margin-bottom:8px">${now}</div>
      <div style="display:inline-block;background:#6366f1;color:#fff;border-radius:20px;padding:4px 16px;font-size:12px;font-weight:700;letter-spacing:.02em">
        Score: ${d.programScore.score} · Grade ${d.programScore.grade}
      </div>
    </div>
  </div>

  <!-- KPI Row -->
  ${kpiRow}

  <!-- Score Breakdown -->
  ${section('Program Score Breakdown', scoreBreakdown, '📊')}

  <!-- Overview -->
  ${section('Overview — Executive Summary',
    execSummary +
    '<div style="margin-top:28px">' +
      subSection('Weekly Volume by Major Muscle Group', muscleGroupChart) +
    '</div>',
  '🗒️')}

  <div class="page-break"></div>

  <!-- Volume Detail -->
  ${section('Volume Detail — Weekly Sets by Muscle',
    subSection('Weekly Volume by Muscle Group', `
      <div style="font-size:11px;color:#64748b;margin-bottom:14px;display:flex;gap:18px;flex-wrap:wrap">
        <span>— — <span style="color:#dc2626;font-weight:600">MEV = 4 sets</span> (minimum effective)</span>
        <span>— — <span style="color:#059669;font-weight:600">MAV = 10 sets</span> (maximum adaptive)</span>
        <span>— — <span style="color:#d97706;font-weight:600">MRV = 20 sets</span> (maximum recoverable)</span>
      </div>
      ${volumeDetailChart}
    `) +
    subSection('Muscle Readiness Scorecard (WPI + SFR)',
      htmlTable(
        ['Muscle','WPI','Progress','Vol (sets)','Freq','Landmark','SFR%','Iso Sets'],
        scorecardRows,
        ['left','center','left','center','center','left','center','center']
      ) +
      insightBox('<strong>WPI</strong> (Weak Point Index, 0–100): Volume 60% + Frequency 40% — lower = needs more attention. <strong>SFR%</strong>: % of sets from isolation exercises — higher = more targeted stimulus per unit fatigue.')
    ),
  '📈')}

  <div class="page-break"></div>

  <!-- Targets & Frequency -->
  ${section('Targets & Frequency',
    subSection('Training Frequency Distribution', freqChart) +
    subSection('Volume Landmarks', landmarkGrid) +
    insightBox((() => {
      const parts: string[] = [];
      if (belowMEV.length===0 && abvMRV.length===0) return `<span style="color:${C.emerald};font-weight:600">✓ All muscles within recoverable range</span> — no muscles below MEV or above MRV.`;
      if (belowMEV.length > 0) parts.push(`<span style="color:${C.below};font-weight:600">↑ Add volume</span> — ${belowMEV.map(m=>m.muscle).join(', ')} below MEV. Increase to stimulate hypertrophy.`);
      if (abvMRV.length  > 0) parts.push(`<span style="color:${C.amber};font-weight:600">↓ Reduce load</span> — ${abvMRV.map(m=>m.muscle).join(', ')} exceed MRV. Cut sets to aid recovery.`);
      if (d.volumeCapViolations.length === 0) parts.push(`<span style="color:${C.emerald};font-weight:600">✓ Session caps clear</span> — all muscles within 10 sets/session.`);
      else parts.push(`<span style="color:${C.amber};font-weight:600">⚠ Cap violations</span> — ${d.volumeCapViolations.map(v=>v.day+': '+v.muscle+' ('+v.volume.toFixed(1)+')').join('; ')}.`);
      return parts.join('<br/>');
    })()),
  '🎯')}

  <div class="page-break"></div>

  <!-- Program Structure -->
  ${section('Program Structure',
    subSection('Daily Volume Distribution', dailyChart) +
    `<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:4px">
      <div>
        ${subSection('Compound vs Isolation', `
          <div style="display:flex;gap:12px;margin-bottom:14px">
            <div style="flex:1;background:#f5f3ff;border:1px solid #ddd6fe;border-radius:10px;padding:14px;text-align:center">
              <div style="font-size:10px;color:#7c3aed;font-weight:600;text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px">Compound</div>
              <div style="font-size:24px;font-weight:800;color:${C.compound}">${d.compoundVsIsolation.Compound}</div>
              <div style="font-size:11px;color:#94a3b8">${compPct}% of total</div>
            </div>
            <div style="flex:1;background:#f0fdfa;border:1px solid #99f6e4;border-radius:10px;padding:14px;text-align:center">
              <div style="font-size:10px;color:#0d9488;font-weight:600;text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px">Isolation</div>
              <div style="font-size:24px;font-weight:800;color:${C.isolation}">${d.compoundVsIsolation.Isolation}</div>
              <div style="font-size:11px;color:#94a3b8">${100-parseInt(compPct)}% of total</div>
            </div>
          </div>
          ${insightBox(isoBal
            ? `<span style="color:${C.emerald};font-weight:600">✓ Good balance</span> — ${compPct}% compound (target 40–70%).`
            : parseInt(compPct) < 40
              ? `<span style="color:${C.amber};font-weight:600">⚠ Isolation-heavy</span> — only ${compPct}% compound (target 40–70%). Consider more multi-joint work.`
              : `<span style="color:${C.amber};font-weight:600">⚠ Compound-heavy</span> — ${compPct}% compound (target 40–70%). Consider more isolation work.`
          )}
        `)}
      </div>
      <div>
        ${subSection('Movement Pattern Breakdown', patternChart)}
      </div>
    </div>` +
    `<div style="margin-top:28px">
      ${subSection('Volume Distribution Heatmap',
        htmlTable(heatHeader, heatRows, ['left',...heatDays.map(()=>'center' as const),'center','center']) +
        insightBox('<strong>Reading the heatmap:</strong> Darker = more volume that day for that muscle. <span style="color:#ef4444;font-weight:600">Red</span> = session cap exceeded (&gt;10 sets/muscle/session). Hover any cell for details.')
      )}
    </div>`,
  '🏗️')}

  <div class="page-break"></div>

  <!-- Balance Check -->
  ${section('Balance Check',
    `<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px">
      ${balanceCards.join('')}
    </div>` +
    subSection('Push : Pull Ratio',
      `<div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:18px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
          <div>
            <span style="font-size:13px;color:#334155">Push: <strong>${pushVol}</strong> sets · Pull: <strong>${pullVol}</strong> sets · Ratio (push÷pull): <strong>${ratio !== null ? ratio.toFixed(2) : 'N/A'}</strong></span>
          </div>
          ${ppStatus}
        </div>
        <div style="background:#e2e8f0;border-radius:6px;height:10px;overflow:hidden;display:flex">
          <div style="background:${C.compound};width:${pushPct}%;transition:width .3s"></div>
          <div style="background:${C.isolation};width:${pullPct}%;transition:width .3s"></div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:11px;margin-top:5px;color:#64748b">
          <span>Push ${pushPct}%</span><span>Pull ${pullPct}%</span>
        </div>
        ${insightBox(ratio === null ? 'No pull volume detected — ensure back/bicep training is included.'
          : ratio > 1.2 ? `<span style="color:${C.amber};font-weight:600">Push-dominant (${ratio.toFixed(2)})</span> — target closer to 1:1. Add rows, pull-ups, or face pulls.`
          : ratio < 0.8 ? `<span style="color:'#3b82f6';font-weight:600">Pull-dominant (${ratio.toFixed(2)})</span> — slightly unbalanced but lower injury risk. Acceptable.`
          : `<span style="color:${C.emerald};font-weight:600">✓ Well balanced (${ratio.toFixed(2)})</span> — push:pull ratio within healthy 0.8–1.2 range.`
        )}
      </div>`
    ),
  '⚖️')}

  <!-- Exercise List -->
  ${section('Full Exercise List',
    htmlTable(
      ['Exercise','Day','Type','Sets','Primary Muscles','Secondary Muscles','Pattern','Program'],
      exerciseRows,
      ['left','center','center','center','left','left','left','left']
    ),
  '📋')}

  <!-- Footer -->
  <div style="margin-top:40px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8;text-align:center">
    Generated by Training Volume Dashboard · ${now}
  </div>

</div>
${buildScript(d)}
</body>
</html>`;
}

// ── Trigger download ─────────────────────────────────────────────────────────
export function downloadExportHTML(data: ExportData): void {
  const html = generateExportHTML(data);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `training-volume-export-${new Date().toISOString().slice(0,10)}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
