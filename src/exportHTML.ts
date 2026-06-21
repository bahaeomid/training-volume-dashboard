// ── Training Volume Dashboard — HTML Export Utility ────────────────────────
// Generates a self-contained, print-friendly HTML report from computed data.
// No external dependencies — pure HTML + inline SVG.

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

// ── Colour tokens ───────────────────────────────────────────────────────────
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
  red:       '#ef4444',
  emerald:   '#10b981',
  amber:     '#f59e0b',
};

// ── Small helper: score colour (hex) ────────────────────────────────────────
const scoreHex = (v: number) => v < 40 ? C.below : v < 70 ? C.amber : C.emerald;

// ── SVG: horizontal stacked bar chart (Volume by Muscle) ───────────────────
function svgHorizontalStacked(
  items: Array<{ label: string; compound: number; isolation: number }>,
  opts: { width?: number; barH?: number; gap?: number; labelW?: number; rightPad?: number; showRefs?: boolean } = {}
): string {
  const W       = opts.width    ?? 680;
  const BAR_H   = opts.barH    ?? 20;
  const GAP     = opts.gap      ?? 7;
  const LABEL_W = opts.labelW  ?? 155;
  const R_PAD   = opts.rightPad ?? 55;
  const chartW  = W - LABEL_W - R_PAD;
  const totalH  = items.length * (BAR_H + GAP) + 30;
  const maxVal  = Math.max(20, ...items.map(d => d.compound + d.isolation));
  const scale   = (v: number) => (v / maxVal) * chartW;
  const refs    = opts.showRefs !== false;

  const bars = items.map((d, i) => {
    const y       = 20 + i * (BAR_H + GAP);
    const cW      = scale(d.compound);
    const iW      = scale(d.isolation);
    const total   = d.compound + d.isolation;
    const totalX  = LABEL_W + cW + iW + 4;
    return `
      <text x="${LABEL_W - 6}" y="${y + BAR_H / 2 + 4}" text-anchor="end" font-size="11" fill="#475569">${d.label}</text>
      ${cW > 0 ? `<rect x="${LABEL_W}" y="${y}" width="${cW}" height="${BAR_H}" fill="${C.compound}" rx="2"/>` : ''}
      ${iW > 0 ? `<rect x="${LABEL_W + cW}" y="${y}" width="${iW}" height="${BAR_H}" fill="${C.isolation}" rx="2"/>` : ''}
      <text x="${Math.min(totalX, W - R_PAD + 48)}" y="${y + BAR_H / 2 + 4}" font-size="10" font-weight="700" fill="#1e293b">${total.toFixed(1)}</text>`;
  }).join('');

  const refLines = refs ? [
    { x: scale(4),  color: '#dc2626', label: 'MEV 4' },
    { x: scale(10), color: '#059669', label: 'MAV 10' },
    { x: scale(20), color: '#d97706', label: 'MRV 20' },
  ].map(r => r.x > 0 && r.x <= chartW ? `
    <line x1="${LABEL_W + r.x}" y1="10" x2="${LABEL_W + r.x}" y2="${totalH - 16}" stroke="${r.color}" stroke-width="1.5" stroke-dasharray="5,3"/>
    <text x="${LABEL_W + r.x + 3}" y="10" font-size="8" fill="${r.color}">${r.label}</text>` : '').join('') : '';

  const legend = `
    <rect x="${LABEL_W}" y="${totalH - 14}" width="10" height="10" fill="${C.compound}" rx="2"/>
    <text x="${LABEL_W + 13}" y="${totalH - 5}" font-size="10" fill="#475569">Compound</text>
    <rect x="${LABEL_W + 80}" y="${totalH - 14}" width="10" height="10" fill="${C.isolation}" rx="2"/>
    <text x="${LABEL_W + 93}" y="${totalH - 5}" font-size="10" fill="#475569">Isolation</text>`;

  return `<svg viewBox="0 0 ${W} ${totalH + 20}" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:${W}px">${bars}${refLines}${legend}</svg>`;
}

// ── SVG: vertical stacked bar chart (Daily Distribution) ───────────────────
function svgVerticalStacked(
  items: Array<{ label: string; compound: number; isolation: number }>,
  opts: { width?: number; height?: number; bottomPad?: number } = {}
): string {
  const W       = opts.width    ?? 600;
  const H       = opts.height   ?? 260;
  const B_PAD   = opts.bottomPad ?? 50;
  const L_PAD   = 45;
  const R_PAD   = 20;
  const T_PAD   = 20;
  const chartH  = H - B_PAD - T_PAD;
  const chartW  = W - L_PAD - R_PAD;
  const maxVal  = Math.max(1, ...items.map(d => d.compound + d.isolation));
  const scale   = (v: number) => (v / maxVal) * chartH;
  const barW    = Math.max(20, Math.min(55, (chartW / items.length) * 0.6));
  const step    = chartW / items.length;

  const yAxisLines = [0, 0.25, 0.5, 0.75, 1].map(pct => {
    const y = T_PAD + chartH - pct * chartH;
    const val = Math.round(pct * maxVal);
    return `
      <line x1="${L_PAD}" y1="${y}" x2="${L_PAD + chartW}" y2="${y}" stroke="#e2e8f0" stroke-width="1"/>
      <text x="${L_PAD - 4}" y="${y + 4}" text-anchor="end" font-size="9" fill="#94a3b8">${val}</text>`;
  }).join('');

  const bars = items.map((d, i) => {
    const cx   = L_PAD + i * step + step / 2;
    const x    = cx - barW / 2;
    const cH   = scale(d.compound);
    const iH   = scale(d.isolation);
    const total = d.compound + d.isolation;
    const botY  = T_PAD + chartH;
    return `
      ${iH > 0 ? `<rect x="${x}" y="${botY - iH}" width="${barW}" height="${iH}" fill="${C.isolation}" rx="2"/>` : ''}
      ${cH > 0 ? `<rect x="${x}" y="${botY - iH - cH}" width="${barW}" height="${cH}" fill="${C.compound}" rx="2"/>` : ''}
      ${total > 0 ? `<text x="${cx}" y="${botY - iH - cH - 4}" text-anchor="middle" font-size="10" font-weight="700" fill="#1e293b">${total}</text>` : ''}
      <text x="${cx}" y="${botY + 14}" text-anchor="middle" font-size="10" fill="#475569">${d.label}</text>`;
  }).join('');

  const legend = `
    <rect x="${L_PAD}" y="${H - 14}" width="10" height="10" fill="${C.compound}" rx="2"/>
    <text x="${L_PAD + 13}" y="${H - 5}" font-size="10" fill="#475569">Compound</text>
    <rect x="${L_PAD + 90}" y="${H - 14}" width="10" height="10" fill="${C.isolation}" rx="2"/>
    <text x="${L_PAD + 103}" y="${H - 5}" font-size="10" fill="#475569">Isolation</text>`;

  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:${W}px">${yAxisLines}${bars}${legend}</svg>`;
}

// ── SVG: simple vertical bar chart (Frequency Distribution) ────────────────
function svgSimpleVertical(
  items: Array<{ label: string; value: number; color: string }>,
  opts: { width?: number; height?: number } = {}
): string {
  const W      = opts.width  ?? 480;
  const H      = opts.height ?? 220;
  const B_PAD  = 40;
  const L_PAD  = 35;
  const R_PAD  = 20;
  const T_PAD  = 20;
  const chartH = H - B_PAD - T_PAD;
  const chartW = W - L_PAD - R_PAD;
  const maxVal = Math.max(1, ...items.map(d => d.value));
  const scale  = (v: number) => (v / maxVal) * chartH;
  const barW   = Math.max(20, Math.min(70, (chartW / items.length) * 0.6));
  const step   = chartW / items.length;

  const grid = [0, 0.5, 1].map(pct => {
    const y = T_PAD + chartH - pct * chartH;
    const v = Math.round(pct * maxVal);
    return `<line x1="${L_PAD}" y1="${y}" x2="${L_PAD + chartW}" y2="${y}" stroke="#e2e8f0" stroke-width="1"/>
    <text x="${L_PAD - 4}" y="${y + 4}" text-anchor="end" font-size="9" fill="#94a3b8">${v}</text>`;
  }).join('');

  const bars = items.map((d, i) => {
    const cx  = L_PAD + i * step + step / 2;
    const x   = cx - barW / 2;
    const h   = scale(d.value);
    const botY = T_PAD + chartH;
    return `
      ${h > 0 ? `<rect x="${x}" y="${botY - h}" width="${barW}" height="${h}" fill="${d.color}" rx="3"/>` : ''}
      ${d.value > 0 ? `<text x="${cx}" y="${botY - h - 4}" text-anchor="middle" font-size="11" font-weight="700" fill="#1e293b">${d.value}</text>` : ''}
      <text x="${cx}" y="${botY + 14}" text-anchor="middle" font-size="10" fill="#475569">${d.label}</text>`;
  }).join('');

  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:${W}px">${grid}${bars}</svg>`;
}

// ── SVG: simple horizontal bar (single-color, e.g. radar group or patterns) ─
function svgHorizontalSimple(
  items: Array<{ label: string; value: number; color?: string }>,
  opts: { width?: number; barH?: number; gap?: number; labelW?: number; maxVal?: number } = {}
): string {
  const W       = opts.width    ?? 520;
  const BAR_H   = opts.barH    ?? 18;
  const GAP     = opts.gap      ?? 6;
  const LABEL_W = opts.labelW  ?? 160;
  const R_PAD   = 55;
  const chartW  = W - LABEL_W - R_PAD;
  const maxVal  = opts.maxVal ?? Math.max(1, ...items.map(d => d.value));
  const scale   = (v: number) => (v / maxVal) * chartW;
  const totalH  = items.length * (BAR_H + GAP) + 16;

  const bars = items.map((d, i) => {
    const y    = i * (BAR_H + GAP) + 8;
    const bW   = scale(d.value);
    const col  = d.color ?? C.compound;
    return `
      <text x="${LABEL_W - 6}" y="${y + BAR_H / 2 + 4}" text-anchor="end" font-size="11" fill="#475569">${d.label}</text>
      ${bW > 0 ? `<rect x="${LABEL_W}" y="${y}" width="${bW}" height="${BAR_H}" fill="${col}" rx="2"/>` : `<rect x="${LABEL_W}" y="${y + BAR_H/3}" width="${chartW}" height="${BAR_H/3}" fill="#f1f5f9" rx="1"/>`}
      <text x="${LABEL_W + bW + 5}" y="${y + BAR_H / 2 + 4}" font-size="10" font-weight="700" fill="#1e293b">${d.value.toFixed(1)}</text>`;
  }).join('');

  return `<svg viewBox="0 0 ${W} ${totalH}" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:${W}px">${bars}</svg>`;
}

// ── Mini progress bar (inline HTML) ─────────────────────────────────────────
const progressBar = (pct: number, color: string, h = 6) =>
  `<div style="background:#e2e8f0;border-radius:4px;height:${h}px;overflow:hidden;margin-top:2px">
    <div style="background:${color};height:100%;width:${Math.min(100, pct)}%;border-radius:4px"></div>
  </div>`;

// ── KPI card ─────────────────────────────────────────────────────────────────
const kpiCard = (label: string, value: string, sub: string, accent: string) => `
  <div style="background:#fff;border:1px solid #e2e8f0;border-top:4px solid ${accent};border-radius:12px;padding:16px 14px">
    <div style="font-size:11px;color:#64748b;font-weight:500;margin-bottom:6px">${label}</div>
    <div style="font-size:26px;font-weight:700;color:${accent};line-height:1.1">${value}</div>
    <div style="font-size:11px;color:#94a3b8;margin-top:4px">${sub}</div>
  </div>`;

// ── Section wrapper ─────────────────────────────────────────────────────────
const section = (title: string, content: string, icon = '') => `
  <div style="margin-bottom:36px">
    <div style="border-left:4px solid #6366f1;padding-left:12px;margin-bottom:20px">
      <h2 style="font-size:18px;font-weight:700;color:#1e293b;margin:0">${icon ? icon + ' ' : ''}${title}</h2>
    </div>
    ${content}
  </div>`;

const subSection = (title: string, content: string) => `
  <div style="margin-bottom:24px">
    <h3 style="font-size:14px;font-weight:600;color:#334155;margin:0 0 12px">${title}</h3>
    ${content}
  </div>`;

// ── Table builder ────────────────────────────────────────────────────────────
const table = (headers: string[], rows: string[][], align: ('left'|'center'|'right')[] = []) => `
  <div style="overflow-x:auto">
  <table style="width:100%;border-collapse:collapse;font-size:12px">
    <thead>
      <tr style="background:#f8fafc;border-bottom:2px solid #e2e8f0">
        ${headers.map((h, i) => `<th style="padding:8px 10px;text-align:${align[i]??'left'};font-weight:600;color:#475569;white-space:nowrap">${h}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${rows.map((row, ri) => `
        <tr style="border-bottom:1px solid #f1f5f9;background:${ri % 2 === 1 ? '#fafafa' : '#fff'}">
          ${row.map((cell, ci) => `<td style="padding:7px 10px;text-align:${align[ci]??'left'};color:#334155">${cell}</td>`).join('')}
        </tr>`).join('')}
    </tbody>
  </table>
  </div>`;

// ── Insight box ──────────────────────────────────────────────────────────────
const insightBox = (content: string) =>
  `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px;font-size:12px;color:#334155;line-height:1.6;margin-top:12px">${content}</div>`;

// ── 4-column grid ─────────────────────────────────────────────────────────────
const grid4 = (cells: string[]) =>
  `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px">${cells.join('')}</div>`;

const miniCard = (label: string, count: string | number, items: string[], color: string) => `
  <div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:14px">
    <div style="font-size:10px;font-weight:600;color:${color};text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px">${label}</div>
    <div style="font-size:24px;font-weight:700;color:${color};margin-bottom:8px">${count}</div>
    ${items.map(m => `<div style="font-size:11px;color:#475569;margin-bottom:2px">· ${m}</div>`).join('')}
    ${items.length === 0 ? `<div style="font-size:11px;color:#94a3b8">None</div>` : ''}
  </div>`;

// ── Badge ────────────────────────────────────────────────────────────────────
const badge = (text: string, bg: string, color: string) =>
  `<span style="display:inline-block;background:${bg};color:${color};border-radius:20px;padding:1px 8px;font-size:10px;font-weight:600">${text}</span>`;

// ── Main export function ─────────────────────────────────────────────────────
export function generateExportHTML(d: ExportData): string {
  const {
    muscleData, dayData, frequencyData, volumeLandmarksData,
    compoundPatternData, compoundVsIsolation, programScore,
    totalRawSets, rawCompoundSets, rawIsolationSets, totalVolume,
    weakPointIndex, sfrData, balanceAnalysis, volumeCapViolations,
    heatMapData, pushPullRatio, musclesByCategory, filteredTrainingData,
    radarGroups, volumeByMuscle, muscleExerciseBreakdown,
  } = d;

  const now = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const scoreColor = programScore.color === 'green' ? C.emerald : programScore.color === 'blue' ? '#3b82f6' : programScore.color === 'amber' ? C.amber : C.below;

  // ── 1. KPI Cards ────────────────────────────────────────────────────────
  const kpiRow = `
    <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:10px;margin-bottom:28px">
      ${kpiCard('Program Score',   String(programScore.score), `Grade: ${programScore.grade}`,                     scoreColor)}
      ${kpiCard('Total Sets (Raw)',String(totalRawSets),        `${rawCompoundSets}C + ${rawIsolationSets}I`,       '#64748b')}
      ${kpiCard('Muscle-Weighted', totalVolume.toFixed(1),     `across ${Object.keys(volumeByMuscle).length} muscles`, '#64748b')}
      ${kpiCard('Compound Sets',   String(rawCompoundSets),    `${totalRawSets > 0 ? ((rawCompoundSets/totalRawSets)*100).toFixed(0) : 0}% of total`,   C.compound)}
      ${kpiCard('Isolation Sets',  String(rawIsolationSets),   `${totalRawSets > 0 ? ((rawIsolationSets/totalRawSets)*100).toFixed(0) : 0}% of total`,  C.isolation)}
      ${kpiCard('Training Days',   String(dayData.length),     `Avg: ${dayData.length > 0 ? (totalRawSets/dayData.length).toFixed(1) : 0} sets/day`,     C.amber)}
    </div>`;

  // ── 2. Score Breakdown ─────────────────────────────────────────────────
  const scoreBreakdown = `
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:24px">
      ${programScore.details.map(det => `
        <div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:12px">
          <div style="font-size:10px;color:#64748b;font-weight:500;margin-bottom:6px">${det.category}</div>
          <div style="font-size:16px;font-weight:700;color:${scoreHex(det.pct)}">${det.pct.toFixed(0)}%</div>
          ${progressBar(det.pct, scoreHex(det.pct))}
          <div style="font-size:10px;color:#94a3b8;margin-top:4px">${det.score.toFixed(1)} / ${det.max} pts</div>
        </div>`).join('')}
    </div>`;

  // ── 3. Executive Summary ────────────────────────────────────────────────
  const optimalMuscles    = muscleData.filter(m => m.total >= 4 && m.total <= 20);
  const optimalFreqMs     = frequencyData.filter(f => f.frequency >= 2 && f.frequency <= 3);
  const balanceInRange    = balanceAnalysis.weeklyCompoundPct >= 40 && balanceAnalysis.weeklyCompoundPct <= 70;
  const lagging           = muscleData.filter(m => m.total < 4);
  const lowFreq           = frequencyData.filter(f => f.frequency === 1);
  const allTracked        = ['Quads','Glutes','Hams','Chest','Lats','Front Delts','Side Delts','Rear Delts','Biceps','Triceps','Abs','Erectors'];
  const zeroVol           = allTracked.filter(m => !volumeByMuscle[m] || volumeByMuscle[m] === 0);
  const highVolMuscles    = muscleData.filter(m => m.total > 15);
  const aboveMRV          = muscleData.filter(m => m.total > 20);
  const deloadNeeded      = aboveMRV.length >= 2 || highVolMuscles.length >= 4;

  const strengthsList = [
    optimalMuscles.length >= muscleData.length * 0.6 && `${optimalMuscles.length}/${muscleData.length} muscles in optimal volume range (MEV–MRV)`,
    optimalFreqMs.length  >= frequencyData.length * 0.5 && `${optimalFreqMs.length} muscles at optimal frequency (2–3×/wk)`,
    balanceInRange && `Compound/isolation balance: ${balanceAnalysis.weeklyCompoundPct.toFixed(0)}% — within 40–70% target`,
    volumeCapViolations.length === 0 && 'No session volume cap violations',
  ].filter(Boolean) as string[];

  const attentionList = [
    lagging.length > 0 && `${lagging.length} muscle${lagging.length > 1 ? 's' : ''} below MEV: ${lagging.map(m => m.muscle + ' (' + m.total.toFixed(1) + ' sets)').join(', ')}`,
    zeroVol.length > 0 && `${zeroVol.length} muscle group${zeroVol.length > 1 ? 's' : ''} untrained: ${zeroVol.join(', ')}`,
    lowFreq.length > 0 && `${lowFreq.length} muscle${lowFreq.length > 1 ? 's' : ''} only trained 1×/week: ${lowFreq.map(f => f.muscle).join(', ')}`,
    volumeCapViolations.length > 0 && `${volumeCapViolations.length} session cap violation${volumeCapViolations.length > 1 ? 's' : ''}: ${volumeCapViolations.map(v => v.day + ': ' + v.muscle + ' (' + v.volume.toFixed(1) + ' sets)').join(', ')}`,
  ].filter(Boolean) as string[];

  const execSummary = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px">
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:14px">
        <div style="font-size:11px;font-weight:600;color:#16a34a;margin-bottom:10px">✓ Strengths</div>
        ${strengthsList.length === 0 ? '<div style="font-size:11px;color:#94a3b8">None detected</div>' : strengthsList.map(s => `<div style="font-size:12px;color:#334155;margin-bottom:6px;padding-left:10px;position:relative"><span style="position:absolute;left:0;color:#16a34a">·</span>${s}</div>`).join('')}
      </div>
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:14px">
        <div style="font-size:11px;font-weight:600;color:#dc2626;margin-bottom:10px">⚠ Needs Attention</div>
        ${attentionList.length === 0 ? '<div style="font-size:11px;color:#94a3b8">No issues detected</div>' : attentionList.map(s => `<div style="font-size:12px;color:#334155;margin-bottom:6px;padding-left:10px;position:relative"><span style="position:absolute;left:0;color:#dc2626">·</span>${s}</div>`).join('')}
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:14px">
        <div style="font-size:11px;font-weight:600;color:#6366f1;margin-bottom:10px">Recovery &amp; Fatigue</div>
        <div style="font-size:12px;color:#334155;margin-bottom:5px">Total weekly load: <strong>${totalRawSets} sets</strong></div>
        ${highVolMuscles.length > 0 ? `<div style="font-size:12px;color:#334155;margin-bottom:5px">${highVolMuscles.length} high-volume muscles (&gt;15 sets): ${highVolMuscles.map(m => m.muscle + ' (' + m.total.toFixed(1) + ')').join(', ')}</div>` : ''}
        <div style="font-size:12px;color:${deloadNeeded ? C.amber : C.emerald}">${deloadNeeded ? '⚠️ Deload may be warranted — multiple muscles near MRV' : '✓ Load appears manageable — no deload signals'}</div>
      </div>
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:14px">
        <div style="font-size:11px;font-weight:600;color:#6366f1;margin-bottom:10px">Program Structure</div>
        ${(() => {
          const allPatterns = filteredTrainingData.map(e => e.pattern);
          const missingPatterns = [
            !allPatterns.some(p => p.toLowerCase().includes('squat'))          && 'Squat / Leg Press',
            !allPatterns.some(p => p.toLowerCase().includes('hinge'))          && 'Hip Hinge (Deadlift)',
            !allPatterns.some(p => p.toLowerCase().includes('vertical pull'))  && 'Vertical Pull',
            !allPatterns.some(p => p.toLowerCase().includes('horizontal pull')) && 'Horizontal Pull',
            !allPatterns.some(p => p.toLowerCase().includes('horizontal push')) && 'Horizontal Push',
            !allPatterns.some(p => p.toLowerCase().includes('vertical push'))  && 'Vertical Push',
          ].filter(Boolean);
          const avgSPD = dayData.length > 0 ? (totalRawSets / dayData.length).toFixed(1) : '0';
          const maxDaySets = dayData.reduce((m, d) => Math.max(m, d.Compound + d.Isolation), 0);
          const heaviest   = dayData.filter(d => (d.Compound + d.Isolation) === maxDaySets).map(d => d.day).join(', ');
          return `
            <div style="font-size:12px;color:${missingPatterns.length === 0 ? C.emerald : C.below};margin-bottom:5px">${missingPatterns.length === 0 ? '✓ All 6 fundamental patterns covered' : `${missingPatterns.length} movement pattern${missingPatterns.length > 1 ? 's' : ''} missing: ${missingPatterns.join(', ')}`}</div>
            <div style="font-size:12px;color:#334155;margin-bottom:5px">Avg ${avgSPD} sets/day across ${dayData.length} training days</div>
            <div style="font-size:12px;color:#334155">Heaviest day: <strong>${heaviest}</strong> (${maxDaySets} sets)</div>`;
        })()}
      </div>
    </div>`;

  // ── 4. Muscle Group Overview Chart ──────────────────────────────────────
  const muscleGroupChart = svgVerticalStacked(
    musclesByCategory.map(c => ({ label: c.category, compound: c.Compound, isolation: c.Isolation })),
    { width: 680, height: 280, bottomPad: 60 }
  );

  // ── 5. Volume Detail ─────────────────────────────────────────────────────
  const volumeDetailChart = svgHorizontalStacked(
    muscleData.map(m => ({ label: m.muscle, compound: m.Compound, isolation: m.Isolation })),
    { width: 680, showRefs: true }
  );

  const scorecardRows = [...weakPointIndex].map(m => {
    const sfr = sfrData.find(s => s.muscle === m.muscle);
    const sfrPct = sfr ? sfr.isolationPct : 0;
    return [
      m.muscle,
      `<span style="color:${scoreHex(m.wpi)};font-weight:700">${m.wpi}</span>`,
      `<div style="width:80px">${progressBar(m.wpi, scoreHex(m.wpi))}</div>`,
      m.volume.toFixed(1),
      m.frequency + '×',
      `<span style="color:${scoreHex(sfrPct)};font-weight:700">${sfrPct}%</span>`,
      sfr ? sfr.isolationSets.toFixed(1) : '0',
    ];
  });

  const scorecardTable = table(
    ['Muscle', 'WPI', 'WPI Bar', 'Vol', 'Freq', 'SFR%', 'Iso Sets'],
    scorecardRows,
    ['left','center','left','center','center','center','center']
  );

  // ── 6. Targets & Frequency ───────────────────────────────────────────────
  const freqCounts = [
    { label: '1×/week',   value: frequencyData.filter(f => f.frequency === 1).length,   color: C.freqLow  },
    { label: '2×/week',   value: frequencyData.filter(f => f.frequency === 2).length,   color: C.freqOpt  },
    { label: '3×/week',   value: frequencyData.filter(f => f.frequency === 3).length,   color: C.freqOpt  },
    { label: '4+×/week',  value: frequencyData.filter(f => f.frequency >= 4).length,    color: C.freqHigh },
  ];
  const freqChart = svgSimpleVertical(freqCounts, { width: 400, height: 200 });

  const freqGrid = grid4([
    miniCard('Low (1×/wk)',      freqCounts[0].value, frequencyData.filter(f => f.frequency === 1).map(f => f.muscle), C.freqLow),
    miniCard('Optimal (2×/wk)', freqCounts[1].value, frequencyData.filter(f => f.frequency === 2).map(f => f.muscle), C.freqOpt),
    miniCard('Optimal (3×/wk)', freqCounts[2].value, frequencyData.filter(f => f.frequency === 3).map(f => f.muscle), C.freqOpt),
    miniCard('High (4+×/wk)',   freqCounts[3].value, frequencyData.filter(f => f.frequency >= 4).map(f => f.muscle + ' (' + f.frequency + 'x)'), C.freqHigh),
  ]);

  const belowMEV  = volumeLandmarksData.filter(m => m.volume < 4).sort((a,b) => b.volume - a.volume);
  const mevMav    = volumeLandmarksData.filter(m => m.volume >= 4 && m.volume < 10).sort((a,b) => b.volume - a.volume);
  const mavMrv    = volumeLandmarksData.filter(m => m.volume >= 10 && m.volume <= 20).sort((a,b) => b.volume - a.volume);
  const abvMRV    = volumeLandmarksData.filter(m => m.volume > 20).sort((a,b) => b.volume - a.volume);

  const landmarkGrid = grid4([
    miniCard('Below MEV (< 4)', belowMEV.length, belowMEV.map(m => m.muscle + ' — ' + m.volume.toFixed(1)), C.below),
    miniCard('MEV–MAV (4–10)', mevMav.length, mevMav.map(m => m.muscle + ' — ' + m.volume.toFixed(1)), C.mevmav),
    miniCard('MAV–MRV (10–20)', mavMrv.length, mavMrv.map(m => m.muscle + ' — ' + m.volume.toFixed(1)), C.mavmrv),
    miniCard('Above MRV (> 20)', abvMRV.length, abvMRV.map(m => m.muscle + ' — ' + m.volume.toFixed(1)), C.aboveMRV),
  ]);

  const landmarkInsight = (() => {
    if (belowMEV.length === 0 && abvMRV.length === 0) return `<span style="color:${C.emerald};font-weight:600">✓ All muscles within recoverable range</span> — no muscles below MEV or above MRV.`;
    const parts = [];
    if (belowMEV.length > 0) parts.push(`<span style="color:${C.below};font-weight:600">↑ Add volume</span> — ${belowMEV.map(m => m.muscle).join(', ')} below MEV (&lt;4 sets). Increase to stimulate hypertrophy.`);
    if (abvMRV.length > 0)   parts.push(`<span style="color:${C.amber};font-weight:600">↓ Reduce to aid recovery</span> — ${abvMRV.map(m => m.muscle).join(', ')} exceed MRV (&gt;20 sets). Cut sets to avoid accumulating fatigue.`);
    if (volumeCapViolations.length === 0) parts.push(`<span style="color:${C.emerald};font-weight:600">✓ Session cap clear</span> — all muscles within 10 sets/session.`);
    else parts.push(`<span style="color:${C.amber};font-weight:600">⚠️ Session overload</span> — ${volumeCapViolations.map(v => v.muscle + ' on ' + v.day + ' (' + v.volume.toFixed(1) + ' sets)').join('; ')}.`);
    return parts.join('<br/>');
  })();

  // ── 7. Program Structure ─────────────────────────────────────────────────
  const dailyChart = svgVerticalStacked(
    dayData.map(d => ({ label: d.day, compound: d.Compound, isolation: d.Isolation })),
    { width: 500, height: 270, bottomPad: 55 }
  );

  const compPct = (compoundVsIsolation.Compound + compoundVsIsolation.Isolation) > 0
    ? ((compoundVsIsolation.Compound / (compoundVsIsolation.Compound + compoundVsIsolation.Isolation)) * 100).toFixed(0)
    : '0';
  const isBalanced = balanceAnalysis.weeklyCompoundPct >= 40 && balanceAnalysis.weeklyCompoundPct <= 70;

  const patternChart = svgHorizontalSimple(
    compoundPatternData.map((p, i) => ({ label: p.pattern, value: p.volume, color: C.pattern[i % C.pattern.length] })),
    { width: 500, labelW: 180, maxVal: Math.max(1, ...compoundPatternData.map(p => p.volume)) }
  );

  // Heatmap as HTML table
  const heatMuscles = Object.keys(volumeByMuscle).sort((a, b) => volumeByMuscle[b] - volumeByMuscle[a]);
  const heatDays    = heatMapData.map(d => d.day);
  const heatHeader  = ['Muscle', ...heatDays, 'Total', 'Freq'];
  const heatRows: string[][] = heatMuscles.map(muscle => {
    const freq = (frequencyData.find(f => f.muscle === muscle)?.frequency ?? 0);
    const cells = heatMapData.map(dayData => {
      const vol = (dayData[muscle] as number) || 0;
      const allVols = heatMapData.map(d => (d[muscle] as number) || 0);
      const maxVol  = Math.max(...allVols);
      const intensity = vol > 0 && maxVol > 0 ? vol / maxVol : 0;
      const overCap   = vol > 10;
      const bgColor   = vol > 0
        ? overCap
          ? `rgba(239,68,68,${Math.max(0.25, intensity)})`
          : `rgba(99,102,241,${Math.max(0.12, intensity)})`
        : 'transparent';
      return `<span style="display:block;background:${bgColor};border-radius:4px;padding:3px 6px;text-align:center;font-weight:${overCap ? 700 : 400};color:${intensity > 0.6 ? '#fff' : '#334155'}">${vol > 0 ? vol.toFixed(1) : '–'}</span>`;
    });
    return [muscle, ...cells, volumeByMuscle[muscle].toFixed(1), freq + '×'];
  });

  const heatmapTable = table(heatHeader, heatRows, ['left', ...heatDays.map(() => 'center' as const), 'center', 'center']);

  const heatmapInsight = (() => {
    const violations = volumeCapViolations.length;
    if (violations === 0) return `<span style="color:${C.emerald};font-weight:600">✓ Good distribution</span> — no session cap violations. Volume is well spread across the week.`;
    return `<span style="color:${C.below};font-weight:600">⚠️ ${violations} session cap violation${violations > 1 ? 's' : ''}</span> — ${volumeCapViolations.map(v => v.day + ': ' + v.muscle + ' (' + v.volume.toFixed(1) + ' sets, over by ' + (v.volume - 10).toFixed(1) + ')').join('; ')}. Redistribute to another day.`;
  })();

  // ── 8. Balance Check ─────────────────────────────────────────────────────
  const balanceGroups = Object.entries(radarGroups).map(([, group]) => {
    const items = group.muscles
      .filter(m => volumeByMuscle[m] !== undefined)
      .map(m => ({
        label: m,
        value: volumeByMuscle[m] || 0,
        color: (volumeByMuscle[m] || 0) >= 4 && (volumeByMuscle[m] || 0) <= 20 ? C.emerald : (volumeByMuscle[m] || 0) > 20 ? C.amber : C.below,
      }));
    const chart = svgHorizontalSimple(items, { width: 300, labelW: 130, maxVal: 20 });
    const itemList = items.map(it => {
      const status = it.value >= 4 && it.value <= 20 ? 'optimal' : it.value > 20 ? 'high' : 'low';
      const b = status === 'optimal' ? badge('✓', '#dcfce7', '#16a34a') : status === 'high' ? badge('↑ above MRV', '#fef3c7', '#92400e') : badge('↓ below MEV', '#fee2e2', '#991b1b');
      return `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;font-size:12px"><span style="color:#334155">${it.label}</span><span>${it.value.toFixed(1)} sets &nbsp;${b}</span></div>`;
    }).join('');
    return `
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:14px">
        <div style="font-size:12px;font-weight:600;color:#6366f1;margin-bottom:10px">${group.label}</div>
        ${items.length > 0 ? chart + '<div style="margin-top:12px">' + itemList + '</div>' : '<div style="font-size:11px;color:#94a3b8">No data</div>'}
      </div>`;
  });

  const pushPullInsight = (() => {
    const { pushVol, pullVol, ratio } = pushPullRatio;
    const total = pushVol + pullVol;
    if (total === 0) return '<span style="color:#94a3b8">Insufficient push/pull data</span>';
    const pushPct = ((pushVol / total) * 100).toFixed(0);
    const pullPct = ((pullVol / total) * 100).toFixed(0);
    const statusBadge = ratio === null ? badge('No pull volume', '#f1f5f9', '#64748b') :
      ratio > 1.2 ? badge('⚠️ Push-heavy', '#fef3c7', '#92400e') :
      ratio < 0.8 ? badge('↑ Pull-heavy', '#dbeafe', '#1d4ed8') :
      badge('✓ Balanced', '#dcfce7', '#16a34a');
    return `Push: <strong>${pushVol}</strong> sets · Pull: <strong>${pullVol}</strong> sets · Ratio (push÷pull): <strong>${ratio !== null ? ratio.toFixed(2) : 'N/A'}</strong> ${statusBadge}<br/>
      <div style="margin-top:8px;background:#e2e8f0;border-radius:4px;height:8px;overflow:hidden;display:flex">
        <div style="background:${C.compound};width:${pushPct}%"></div>
        <div style="background:${C.isolation};width:${pullPct}%"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:10px;margin-top:3px;color:#64748b"><span>Push ${pushPct}%</span><span>Pull ${pullPct}%</span></div>`;
  })();

  // ── 9. Exercise List ─────────────────────────────────────────────────────
  const exerciseRows = filteredTrainingData.map(ex => [
    ex.exercise,
    ex.day,
    ex.type,
    String(ex.sets),
    ex.primary.join(', '),
    ex.secondary.join(', ') || '–',
    ex.pattern,
    ex.program || '–',
  ]);

  const exerciseTable = table(
    ['Exercise', 'Day', 'Type', 'Sets', 'Primary Muscles', 'Secondary Muscles', 'Pattern', 'Program'],
    exerciseRows,
    ['left','center','center','center','left','left','left','left']
  );

  // ── 10. Assemble HTML ────────────────────────────────────────────────────
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Training Volume Analysis — Export</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
      background: #f8fafc;
      color: #1e293b;
      line-height: 1.5;
      padding: 40px 24px;
    }
    .page { max-width: 900px; margin: 0 auto; }
    h2 { font-size: 18px; font-weight: 700; }
    h3 { font-size: 14px; font-weight: 600; }
    @media print {
      body { background: #fff; padding: 20px; }
      .no-print { display: none !important; }
      .page-break { page-break-before: always; }
    }
  </style>
</head>
<body>
<div class="page">

  <!-- ── Header ── -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;padding-bottom:20px;border-bottom:2px solid #e2e8f0">
    <div>
      <h1 style="font-size:28px;font-weight:800;color:#1e293b;letter-spacing:-.02em">Training Volume Analysis</h1>
      <p style="color:#64748b;font-size:13px;margin-top:4px">Program structure · muscle volume · weekly distribution</p>
    </div>
    <div style="text-align:right">
      <div style="font-size:11px;color:#94a3b8">Exported on</div>
      <div style="font-size:13px;font-weight:600;color:#475569">${now}</div>
      <div style="margin-top:6px;display:inline-block;background:#6366f1;color:#fff;border-radius:20px;padding:3px 12px;font-size:12px;font-weight:700">
        Score: ${programScore.score} · Grade ${programScore.grade}
      </div>
    </div>
  </div>

  <!-- ── KPI Row ── -->
  ${kpiRow}

  <!-- ── Score Breakdown ── -->
  ${section('Program Score Breakdown', scoreBreakdown, '📊')}

  <!-- ── Overview ── -->
  ${section('Overview — Executive Summary', execSummary + '<div style="margin-top:24px">' + subSection('Weekly Volume by Major Muscle Groups', muscleGroupChart) + '</div>', '🗒️')}

  <div class="page-break"></div>

  <!-- ── Volume Detail ── -->
  ${section('Volume Detail — Weekly Sets by Muscle', `
    ${subSection('Weekly Volume by Muscle Group (stacked by exercise type)', volumeDetailChart)}
    <div style="display:flex;gap:16px;font-size:11px;color:#64748b;margin-bottom:20px">
      <span>— — <span style="color:#dc2626">MEV = 4 sets</span> (minimum effective volume)</span>
      <span>— — <span style="color:#059669">MAV = 10 sets</span> (maximum adaptive volume)</span>
      <span>— — <span style="color:#d97706">MRV = 20 sets</span> (maximum recoverable volume)</span>
    </div>
    ${subSection('Muscle Readiness Scorecard (WPI + SFR)', scorecardTable)}
    ${insightBox('<strong>WPI</strong> = Weak Point Index (0–100): Volume 60% + Frequency 40%. Lower = needs attention. <strong>SFR%</strong> = % of sets from isolation exercises (higher = more targeted stimulus with less systemic fatigue).')}
  `, '📈')}

  <div class="page-break"></div>

  <!-- ── Targets & Frequency ── -->
  ${section('Targets & Frequency', `
    ${subSection('Training Frequency Distribution', freqChart)}
    ${subSection('Frequency Breakdown by Muscle', freqGrid)}
    <div style="margin-top:24px">
    ${subSection('Volume Landmarks (MEV / MAV / MRV)', landmarkGrid)}
    ${insightBox(landmarkInsight)}
    </div>
  `, '🎯')}

  <div class="page-break"></div>

  <!-- ── Program Structure ── -->
  ${section('Program Structure', `
    ${subSection('Daily Volume Distribution', dailyChart)}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:20px">
      <div>
        ${subSection('Compound vs Isolation', `
          <div style="display:flex;gap:16px;margin-bottom:12px">
            <div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:14px;flex:1;text-align:center">
              <div style="font-size:11px;color:#64748b;margin-bottom:4px">Compound Sets</div>
              <div style="font-size:24px;font-weight:700;color:${C.compound}">${compoundVsIsolation.Compound}</div>
              <div style="font-size:11px;color:#94a3b8">${compPct}% of total</div>
            </div>
            <div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:14px;flex:1;text-align:center">
              <div style="font-size:11px;color:#64748b;margin-bottom:4px">Isolation Sets</div>
              <div style="font-size:24px;font-weight:700;color:${C.isolation}">${compoundVsIsolation.Isolation}</div>
              <div style="font-size:11px;color:#94a3b8">${100 - parseInt(compPct)}% of total</div>
            </div>
          </div>
          ${insightBox(isBalanced ? `<span style="color:${C.emerald};font-weight:600">✓ Good compound/isolation balance</span> — ${compPct}% compound (target: 40–70%).` : parseInt(compPct) < 40 ? `<span style="color:${C.amber};font-weight:600">⚠️ Isolation-heavy</span> — only ${compPct}% compound sets (target 40–70%). Consider more compound movements.` : `<span style="color:${C.amber};font-weight:600">⚠️ Compound-heavy</span> — ${compPct}% compound (target 40–70%). Consider targeted isolation work.`)}
        `)}
      </div>
      <div>
        ${subSection('Compound Movement Pattern Breakdown', patternChart)}
      </div>
    </div>
    <div style="margin-top:24px">
      ${subSection('Volume Distribution Heatmap', heatmapTable)}
      ${insightBox('<strong>Reading the heatmap:</strong> Darker cells = more volume that day. Red = session cap exceeded (&gt;10 sets/muscle/day).<br/>' + heatmapInsight)}
    </div>
  `, '🏗️')}

  <div class="page-break"></div>

  <!-- ── Balance Check ── -->
  ${section('Balance Check — Muscle Group Radar', `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:24px">
      ${balanceGroups.join('')}
    </div>
    ${subSection('Push : Pull Ratio', `
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:16px;font-size:13px;color:#334155">
        ${pushPullInsight}
      </div>
    `)}
  `, '⚖️')}

  <!-- ── Exercise List ── -->
  ${section('Full Exercise List', exerciseTable, '📋')}

  <!-- ── Footer ── -->
  <div style="margin-top:40px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8;text-align:center">
    Generated by Training Volume Dashboard · ${now}
  </div>

</div>
</body>
</html>`;
}

// ── Trigger download ──────────────────────────────────────────────────────────
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
