import React, { useState, useMemo, useRef, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ReferenceLine, LabelList } from 'recharts';

// ── Reusable tooltip component — body-appended to escape stacking contexts ──
const InfoTooltip = ({ content, openLeft: forceLeft = false, dark = false }) => {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState<{top:number|string,bottom:number|string,left:number|string,right:number|string}>({top:0,bottom:'auto',left:0,right:'auto'});
  const btnRef = useRef(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const outerRef = useRef(null);

  // Create a fixed container div appended to body on mount
  useEffect(() => {
    const el = document.createElement('div');
    el.style.cssText = 'position:fixed;top:0;left:0;width:0;height:0;overflow:visible;z-index:2147483647;pointer-events:none;';
    document.body.appendChild(el);
    containerRef.current = el;
    return () => { if (el.parentNode) el.parentNode.removeChild(el); };
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.pointerEvents = show ? 'auto' : 'none';
    }
  }, [show]);

  // Close on outside click
  useEffect(() => {
    if (!show) return;
    const handler = (e) => {
      if (btnRef.current && btnRef.current.contains(e.target)) return;
      if (containerRef.current && containerRef.current.contains(e.target)) return;
      setShow(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [show]);

  const handleClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const spaceRight = window.innerWidth - rect.right;
      const spaceBelow = window.innerHeight - rect.bottom;
      const useLeft = forceLeft || spaceRight < 300;
      const openUp = spaceBelow < 280; // not enough room below — open upward
      setPos({
        top: openUp ? 'auto' : rect.bottom + 6,
        bottom: openUp ? (window.innerHeight - rect.top + 6) : 'auto',
        left: useLeft ? 'auto' : Math.max(8, rect.left),
        right: useLeft ? Math.max(8, window.innerWidth - rect.right) : 'auto',
      });
    }
    setShow(s => !s);
  };

  return (
    <span ref={outerRef} style={{position:'relative',display:'inline-block',marginLeft:'3px',verticalAlign:'middle'}}>
      <button
        ref={btnRef}
        onClick={handleClick}
        className={`text-xs rounded-full w-4 h-4 inline-flex items-center justify-center transition-colors leading-none ${dark ? 'text-slate-400 hover:text-blue-300 border border-slate-500 hover:border-blue-400 bg-slate-700' : 'text-slate-400 hover:text-blue-500 border border-slate-300 hover:border-blue-400 bg-white bg-opacity-80'}`}
        aria-label="More info"
        style={{fontSize:'9px',lineHeight:1}}
      >i</button>
      {show && (
        <div
          style={{
            position:'fixed',
            top: pos.top,
            bottom: pos.bottom,
            left: pos.left,
            right: pos.right,
            zIndex: 2147483647,
            minWidth:'260px',
            maxWidth:'300px',
            width:'280px',
            background:'#ffffff',
            border:'1px solid #e2e8f0',
            borderRadius:'12px',
            padding:'12px',
            boxShadow:'0 20px 60px rgba(0,0,0,0.35), 0 4px 16px rgba(0,0,0,0.2)',
            color:'#334155',
            fontSize:'12px',
            lineHeight:'1.6',
            fontWeight: 'normal',
            whiteSpace:'normal',
            wordBreak:'normal',
            isolation:'isolate',
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {content}
          <button
            onClick={(e)=>{e.stopPropagation();setShow(false);}}
            style={{position:'absolute',top:'6px',right:'8px',color:'#94a3b8',fontSize:'14px',lineHeight:1,background:'none',border:'none',cursor:'pointer'}}
          >✕</button>
        </div>
      )}
    </span>
  );
};


// ── Score Breakdown Pill ────────────────────────────────────────────────────
const ScoreBreakdownPill = ({ details, dm }) => {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState<{top: number, left: number}>({ top: 0, left: 0 });
  const btnRef = useRef(null);

  useEffect(() => {
    if (!show) return;
    const handler = (e) => {
      if (btnRef.current && btnRef.current.contains(e.target)) return;
      setShow(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [show]);

  const handleClick = (e) => {
    e.stopPropagation();
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 6, left: rect.left });
    }
    setShow(s => !s);
  };

  return (
    <span className="relative inline-block">
      <button
        ref={btnRef}
        onClick={handleClick}
        className={`ml-2 px-2 py-0.5 text-xs rounded-full border font-medium transition-all ${
          dm
            ? 'bg-slate-600 hover:bg-slate-500 border-slate-400 text-slate-200 hover:text-white'
            : 'bg-white bg-opacity-50 hover:bg-opacity-80 border-current opacity-60 hover:opacity-100'
        }`}
      >+ breakdown</button>
      {show && (
        <div
          style={{
            position: 'fixed', top: pos.top, left: pos.left,
            zIndex: 2147483647, width: '240px',
            background: dm ? '#1e293b' : '#fff',
            border: `1px solid ${dm ? '#475569' : '#e2e8f0'}`,
            borderRadius: '12px', padding: '16px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
            color: dm ? '#e2e8f0' : '#334155',
            fontSize: '12px',
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="font-semibold mb-2 text-sm">Score Breakdown</div>
          {details.map((d, i) => (
            <div key={i} className="mb-2">
              <div className="flex justify-between mb-0.5">
                <span>{d.category}</span>
                <span className="font-medium">{d.pct.toFixed(0)}%</span>
              </div>
              <div style={{height:'6px', borderRadius:'9999px', background: dm ? '#334155' : '#f1f5f9'}}>
                <div style={{height:'6px', borderRadius:'9999px', width: d.pct + '%', background: d.pct >= 80 ? '#22c55e' : d.pct >= 60 ? '#3b82f6' : d.pct >= 40 ? '#f59e0b' : '#ef4444'}}></div>
              </div>
            </div>
          ))}
          <button onClick={() => setShow(false)} style={{position:'absolute', top:'8px', right:'10px', opacity:0.5, background:'none', border:'none', cursor:'pointer', fontSize:'14px'}}>✕</button>
        </div>
      )}
    </span>
  );
};

const TrainingVolumeAnalysis = () => {
  const [view, setView] = useState('overview');  const [selectedMuscle, setSelectedMuscle] = useState(null);
  const [countingMethod, setCountingMethod] = useState('fractional');
  const [selectedProgram, setSelectedProgram] = useState('all');
  const [uploadedData, setUploadedData] = useState(null);
  const [showPatternDetails, setShowPatternDetails] = useState(false);
  const [highlightedFrequency, setHighlightedFrequency] = useState(null);
  const [scorecardSort, setScorecardSort] = useState<{col: 'wpi'|'sfr', dir: 'asc'|'desc'}>({ col: 'wpi', dir: 'asc' });
  const [radarGroup, setRadarGroup] = useState('push');
  const [highlightedVolumeLandmark, setHighlightedVolumeLandmark] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [modalSort, setModalSort] = useState('day'); // 'day' | 'compound'

  const defaultTrainingData = [
    { exercise: "Split Squats (SM)", day: "Day 4", sets: 2, primary: ["Glutes", "Quads"], secondary: [], pattern: "Squat Variations", type: "Compound", program: "4-day (Dec 19)" },
    { exercise: "Weighted Pullups", day: "Day 2", sets: 2, primary: ["Lats", "Scapular Depressors"], secondary: ["Biceps", "Rear Delts"], pattern: "Vertical Pull", type: "Compound", program: "4-day (Dec 19)" },
    { exercise: "Barbell Rows", day: "Day 2", sets: 2, primary: ["Lats", "Scapular Retractors"], secondary: ["Biceps", "Rear Delts"], pattern: "Horizontal Pull", type: "Compound", program: "4-day (Dec 19)" },
    { exercise: "Seated Incline Curls", day: "Day 2", sets: 3, primary: ["Biceps"], secondary: [], pattern: "Isolation Exercise", type: "Isolation", program: "4-day (Dec 19)" },
    { exercise: "Good Mornings (SM)", day: "Day 2", sets: 3, primary: ["Erectors", "Glutes", "Hams"], secondary: ["Scapular Retractors"], pattern: "Hip Hinge", type: "Compound", program: "4-day (Dec 19)" },
    { exercise: "Weighted Pullups", day: "Day 4", sets: 2, primary: ["Lats", "Scapular Depressors"], secondary: ["Biceps", "Rear Delts"], pattern: "Vertical Pull", type: "Compound", program: "4-day (Dec 19)" },
    { exercise: "Barbell Rows", day: "Day 4", sets: 2, primary: ["Lats", "Scapular Retractors"], secondary: ["Biceps", "Rear Delts"], pattern: "Horizontal Pull", type: "Compound", program: "4-day (Dec 19)" },
    { exercise: "Seated Incline Curls", day: "Day 4", sets: 3, primary: ["Biceps"], secondary: [], pattern: "Isolation Exercise", type: "Isolation", program: "4-day (Dec 19)" },
    { exercise: "Hammer Curls", day: "Day 4", sets: 3, primary: ["Biceps", "Forearms"], secondary: [], pattern: "Isolation Exercise", type: "Isolation", program: "4-day (Dec 19)" },
    { exercise: "Leg Extension", day: "Day 4", sets: 3, primary: ["Quads"], secondary: [], pattern: "Isolation Exercise", type: "Isolation", program: "4-day (Dec 19)" },
    { exercise: "Weighted Crunches", day: "Day 1", sets: 3, primary: ["Abs"], secondary: [], pattern: "Isolation Exercise", type: "Isolation", program: "4-day (Dec 19)" },
    { exercise: "OH Cable Extensions", day: "Day 1", sets: 3, primary: ["Triceps"], secondary: [], pattern: "Isolation Exercise", type: "Isolation", program: "4-day (Dec 19)" },
    { exercise: "Single-Arm Cable lateral raises", day: "Day 1", sets: 2, primary: ["Side Delts"], secondary: [], pattern: "Isolation Exercise", type: "Isolation", program: "4-day (Dec 19)" },
    { exercise: "Chest supported reverse fly", day: "Day 1", sets: 3, primary: ["Rear Delts"], secondary: [], pattern: "Isolation Exercise", type: "Isolation", program: "4-day (Dec 19)" },
    { exercise: "Incline Bench Press", day: "Day 1", sets: 3, primary: ["Chest", "Front Delts"], secondary: ["Side Delts", "Triceps"], pattern: "Horizontal Push", type: "Compound", program: "4-day (Dec 19)" },
    { exercise: "Cable Fly Crossovers", day: "Day 1", sets: 3, primary: ["Chest", "Front Delts"], secondary: [], pattern: "Fly", type: "Compound", program: "4-day (Dec 19)" },
    { exercise: "OH Press (SM)", day: "Day 3", sets: 3, primary: ["Front Delts"], secondary: ["Side Delts", "Triceps"], pattern: "Vertical Push", type: "Compound", program: "4-day (Dec 19)" },
    { exercise: "Chest supported lateral raises", day: "Day 3", sets: 2, primary: ["Side Delts"], secondary: [], pattern: "Isolation Exercise", type: "Isolation", program: "4-day (Dec 19)" },
    { exercise: "Skull Crushers", day: "Day 3", sets: 3, primary: ["Triceps"], secondary: [], pattern: "Isolation Exercise", type: "Isolation", program: "4-day (Dec 19)" },
    { exercise: "Cable Fly Crossovers", day: "Day 3", sets: 3, primary: ["Chest", "Front Delts"], secondary: [], pattern: "Fly", type: "Compound", program: "4-day (Dec 19)" },
    { exercise: "Incline Bench Press", day: "Day 3", sets: 2, primary: ["Chest", "Front Delts"], secondary: ["Side Delts", "Triceps"], pattern: "Horizontal Push", type: "Compound", program: "4-day (Dec 19)" },
    { exercise: "Upright Row (Cable)", day: "Day 3", sets: 2, primary: ["Scapular Elevators", "Side Delts"], secondary: ["Biceps", "Rear Delts"], pattern: "Upright Row", type: "Compound", program: "4-day (Dec 19)" },
    { exercise: "Back Squats (SM)", day: "Day 2", sets: 3, primary: ["Glutes", "Quads"], secondary: [], pattern: "Squat Variations", type: "Compound", program: "4-day (Dec 19)" },
    { exercise: "Chest Supported Lateral Raises", day: "Day 1", sets: 2, primary: ["Side Delts"], secondary: [], pattern: "Isolation Exercise", type: "Isolation", program: "4-day (Dec 19)" },
    { exercise: "Leg Raises", day: "Day 3", sets: 3, primary: ["Abs"], secondary: [], pattern: "Isolation Exercise", type: "Isolation", program: "4-day (Dec 19)" },
    { exercise: "Obliques", day: "Day 4", sets: 3, primary: ["Abs"], secondary: [], pattern: "Isolation Exercise", type: "Isolation", program: "4-day (Dec 19)" }
  ];

  const trainingData = uploadedData || defaultTrainingData;
  
  const filteredTrainingData = useMemo(() => {
    if (selectedProgram === 'all') return trainingData;
    return trainingData.filter(ex => ex.program === selectedProgram);
  }, [trainingData, selectedProgram]);

  const availablePrograms = useMemo(() => {
    const programs = [...new Set(trainingData
      .map(ex => ex.program)
      .filter(p => p && p.trim() && !p.includes(','))
    )];
    return programs.sort();
  }, [trainingData]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileType = file.name.split('.').pop().toLowerCase();
    
    if (fileType === 'csv') {
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      
      const data = lines.slice(1)
        .filter(line => line.trim() && !line.includes('Dummy Entry'))
        .map(line => {
          const regex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
          const values = line.split(regex).map(v => v.trim().replace(/^"|"$/g, ''));
          const exercise = {};
          
          headers.forEach((header, i) => {
            const value = values[i] || '';
            if (header === 'Sets') {
              exercise.sets = parseInt(value) || 0;
            } else if (header === 'Primary_Target_Muscle') {
              exercise.primary = value.split(',').map(m => m.trim()).filter(Boolean);
            } else if (header === 'Secondary_Target_Muscle') {
              exercise.secondary = value.split(',').map(m => m.trim()).filter(Boolean);
            } else if (header === 'Exercise') {
              exercise.exercise = value;
            } else if (header === 'Day') {
              exercise.day = value;
            } else if (header === 'Movement_Pattern') {
              exercise.pattern = value;
            } else if (header === 'Movement_Type') {
              exercise.type = value;
            } else if (header === 'Program') {
              exercise.program = value;
            }
          });
          
          if (exercise.sets > 0 && exercise.exercise) {
            return exercise;
          }
          return null;
        })
        .filter(ex => ex !== null);
      
      setUploadedData(data);
      setSelectedProgram('all');
    }
  };

  const calculateVolume = () => {
    const volumeByMuscle = {};
    const volumeByPattern = {};
    const volumeByType = {};
    const volumeByDay = {};
    const muscleExerciseBreakdown = {};
    const frequencyByMuscle = {};

    filteredTrainingData.forEach(exercise => {
      const sets = exercise.sets;
      const primary = exercise.primary;
      const secondary = exercise.secondary;
      const pattern = exercise.pattern;
      const type = exercise.type;
      const day = exercise.day;

      if (countingMethod === 'fractional') {
        primary.forEach(muscle => {
          const vol = sets / primary.length;
          volumeByMuscle[muscle] = (volumeByMuscle[muscle] || 0) + vol;
          
          frequencyByMuscle[muscle] = frequencyByMuscle[muscle] || new Set();
          frequencyByMuscle[muscle].add(day);
          
          if (!muscleExerciseBreakdown[muscle]) {
            muscleExerciseBreakdown[muscle] = [];
          }
          muscleExerciseBreakdown[muscle].push({
            exercise: exercise.exercise,
            day: day,
            sets: vol,
            role: 'Primary',
            type: type
          });
        });

        secondary.forEach(muscle => {
          const vol = (sets * 0.5) / secondary.length;
          volumeByMuscle[muscle] = (volumeByMuscle[muscle] || 0) + vol;
          
          frequencyByMuscle[muscle] = frequencyByMuscle[muscle] || new Set();
          frequencyByMuscle[muscle].add(day);
          
          if (!muscleExerciseBreakdown[muscle]) {
            muscleExerciseBreakdown[muscle] = [];
          }
          muscleExerciseBreakdown[muscle].push({
            exercise: exercise.exercise,
            day: day,
            sets: vol,
            role: 'Secondary',
            type: type
          });
        });
      } else if (countingMethod === 'allSets') {
        primary.forEach(muscle => {
          volumeByMuscle[muscle] = (volumeByMuscle[muscle] || 0) + sets;
          
          frequencyByMuscle[muscle] = frequencyByMuscle[muscle] || new Set();
          frequencyByMuscle[muscle].add(day);
          
          if (!muscleExerciseBreakdown[muscle]) {
            muscleExerciseBreakdown[muscle] = [];
          }
          muscleExerciseBreakdown[muscle].push({
            exercise: exercise.exercise,
            day: day,
            sets: sets,
            role: 'Primary',
            type: type
          });
        });

        secondary.forEach(muscle => {
          volumeByMuscle[muscle] = (volumeByMuscle[muscle] || 0) + sets;
          
          frequencyByMuscle[muscle] = frequencyByMuscle[muscle] || new Set();
          frequencyByMuscle[muscle].add(day);
          
          if (!muscleExerciseBreakdown[muscle]) {
            muscleExerciseBreakdown[muscle] = [];
          }
          muscleExerciseBreakdown[muscle].push({
            exercise: exercise.exercise,
            day: day,
            sets: sets,
            role: 'Secondary',
            type: type
          });
        });
      } else {
        primary.forEach(muscle => {
          volumeByMuscle[muscle] = (volumeByMuscle[muscle] || 0) + sets;
          
          frequencyByMuscle[muscle] = frequencyByMuscle[muscle] || new Set();
          frequencyByMuscle[muscle].add(day);
          
          if (!muscleExerciseBreakdown[muscle]) {
            muscleExerciseBreakdown[muscle] = [];
          }
          muscleExerciseBreakdown[muscle].push({
            exercise: exercise.exercise,
            day: day,
            sets: sets,
            role: 'Primary',
            type: type
          });
        });
      }

      volumeByPattern[pattern] = (volumeByPattern[pattern] || 0) + sets;
      volumeByType[type] = (volumeByType[type] || 0) + sets;

      if (!volumeByDay[day]) {
        volumeByDay[day] = { day: day, Compound: 0, Isolation: 0 };
      }
      volumeByDay[day][type] += sets;
    });

    const frequencyData = Object.entries(frequencyByMuscle).map(([muscle, days]) => ({
      muscle,
      frequency: days.size
    }));

    return { volumeByMuscle, volumeByPattern, volumeByType, volumeByDay, muscleExerciseBreakdown, frequencyData };
  };

  const calculated = useMemo(calculateVolume, [countingMethod, filteredTrainingData]);
  const { volumeByMuscle, volumeByPattern, volumeByType, volumeByDay, muscleExerciseBreakdown, frequencyData } = calculated;

  const muscleData = Object.entries(volumeByMuscle)
    .map(entry => {
      const compoundSets = muscleExerciseBreakdown[entry[0]]
        .filter(e => e.type === 'Compound')
        .reduce((sum, e) => sum + e.sets, 0);
      const isolationSets = muscleExerciseBreakdown[entry[0]]
        .filter(e => e.type === 'Isolation')
        .reduce((sum, e) => sum + e.sets, 0);
      
      return { 
        muscle: entry[0], 
        total: parseFloat(entry[1].toFixed(1)),
        Compound: parseFloat(compoundSets.toFixed(1)),
        Isolation: parseFloat(isolationSets.toFixed(1))
      };
    })
    .sort((a, b) => b.total - a.total);

  const patternData = Object.entries(volumeByPattern)
    .map(entry => ({ pattern: entry[0], volume: entry[1] }))
    .sort((a, b) => b.volume - a.volume);

  const compoundVsIsolation = {
    Compound: patternData.filter(p => p.pattern !== 'Isolation Exercise').reduce((sum, p) => sum + p.volume, 0),
    Isolation: patternData.find(p => p.pattern === 'Isolation Exercise')?.volume || 0
  };

  const compoundPatternData = patternData.filter(p => p.pattern !== 'Isolation Exercise');

  const dayData = Object.values(volumeByDay).sort((a, b) => {
    const dayOrder = { "Day 1": 1, "Day 2": 2, "Day 3": 3, "Day 4": 4, "Day 5": 5, "Day 6": 6, "Day 7": 7 };
    return dayOrder[a.day] - dayOrder[b.day];
  });

  const totalVolume = Object.values(volumeByMuscle).reduce((sum, vol) => sum + vol, 0);
  // Raw sets = sum of actual exercise sets performed (what you do in the gym)
  const totalRawSets = filteredTrainingData.reduce((sum, ex) => sum + ex.sets, 0);
  const rawCompoundSets = volumeByType['Compound'] || 0;
  const rawIsolationSets = volumeByType['Isolation'] || 0;

  // ── Push : Pull Ratio ─────────────────────────────────────────────────────
  // Push muscles: Chest, Front Delts, Side Delts, Triceps
  // Pull muscles: Lats, Scapular Retractors, Scapular Depressors, Rear Delts, Biceps
  const pushPullRatio = useMemo(() => {
    const pushMuscles = ['Chest', 'Front Delts', 'Side Delts', 'Triceps'];
    const pullMuscles = ['Lats', 'Scapular Retractors', 'Scapular Depressors', 'Rear Delts', 'Biceps'];
    const pushVol = pushMuscles.reduce((sum, m) => sum + (volumeByMuscle[m] || 0), 0);
    const pullVol = pullMuscles.reduce((sum, m) => sum + (volumeByMuscle[m] || 0), 0);
    const ratio = pullVol > 0 ? pushVol / pullVol : null;
    return { pushVol: parseFloat(pushVol.toFixed(1)), pullVol: parseFloat(pullVol.toFixed(1)), ratio: ratio ? parseFloat(ratio.toFixed(2)) : null };
  }, [volumeByMuscle]);

  // ── Weak Point Index (0–100, lower = needs more attention) ────────────────
  // Combines volume score (60%) + frequency score (40%), normalised per muscle
  const weakPointIndex = useMemo(() => {
    return muscleData.map(m => {
      const freq = frequencyData.find(f => f.muscle === m.muscle)?.frequency || 0;
      // Volume score: 0 at 0 sets, 100 at MAV (10), capped at 100 if above MAV
      const volScore = Math.min(100, (m.total / 10) * 100);
      // Frequency score: 0 at 0x, 100 at 2–3x, 70 at 1x, 60 at 4x+
      const freqScore = freq === 0 ? 0 : freq === 1 ? 35 : freq <= 3 ? 100 : 70;
      const wpi = Math.round(volScore * 0.6 + freqScore * 0.4);
      return { muscle: m.muscle, wpi, volScore: Math.round(volScore), freqScore, volume: m.total, frequency: freq };
    }).sort((a, b) => a.wpi - b.wpi); // lowest WPI = biggest weak points first
  }, [muscleData, frequencyData]);

  // ── Stimulus-to-Fatigue Ratio proxy (% of volume from isolation) ──────────
  // Higher % = more targeted stimulus relative to systemic fatigue
  const sfrData = useMemo(() => {
    return muscleData.map(m => {
      const isoSets = muscleExerciseBreakdown[m.muscle]
        ? muscleExerciseBreakdown[m.muscle].filter(e => e.type === 'Isolation').reduce((sum, e) => sum + e.sets, 0)
        : 0;
      const isolationPct = m.total > 0 ? Math.round((isoSets / m.total) * 100) : 0;
      return { muscle: m.muscle, isolationPct, isolationSets: parseFloat(isoSets.toFixed(1)), total: m.total };
    }).sort((a, b) => a.isolationPct - b.isolationPct);
  }, [muscleData, muscleExerciseBreakdown]);

  const volumeLandmarksData = muscleData.map(m => {
    const freq = frequencyData.find(f => f.muscle === m.muscle)?.frequency || 0;
    return {
      muscle: m.muscle,
      volume: m.total,
      MEV: 4,
      MAV: 10,
      MRV: 20,
      frequency: freq,
    };
  });

  const radarGroups = {
    push: {
      label: 'Push Muscles',
      muscles: ['Chest', 'Front Delts', 'Side Delts', 'Triceps']
    },
    pull: {
      label: 'Pull Muscles',
      muscles: ['Lats', 'Scapular Retractors', 'Scapular Depressors', 'Rear Delts', 'Biceps']
    },
    legs: {
      label: 'Leg Muscles',
      muscles: ['Quads', 'Glutes', 'Hams']
    },
    core: {
      label: 'Core & Misc',
      muscles: ['Abs', 'Erectors', 'Forearms', 'Scapular Elevators']
    }
  };

  const currentRadarData = radarGroups[radarGroup].muscles
    .filter(muscle => volumeByMuscle[muscle] !== undefined)
    .map(muscle => ({
      muscle,
      volume: volumeByMuscle[muscle] || 0,
      optimal: 10
    }));

  const PATTERN_COLORS = ['#6366f1','#14b8a6','#f59e0b','#f43f5e','#8b5cf6','#10b981','#0ea5e9','#f97316','#ec4899','#84cc16'];
  // Palette constants
  const C_COMPOUND  = '#6366f1'; // indigo
  const C_ISOLATION = '#14b8a6'; // teal
  const C_BELOW     = '#f43f5e'; // rose   — below MEV
  const C_IN_LOW    = '#10b981'; // emerald — MEV–MAV
  const C_IN_HIGH   = '#059669'; // emerald-dark — MAV–MRV
  const C_ABOVE     = '#f97316'; // orange  — above MRV
  const C_FREQ_LOW  = '#f59e0b'; // amber   — 1×/wk
  const C_FREQ_OPT  = '#10b981'; // emerald — 2–3×/wk
  const C_FREQ_HIGH = '#8b5cf6'; // violet  — 4+×/wk

  // Shared threshold color helpers (Tailwind classes) — used by WPI, SFR, score bars
  const scoreColor    = (v: number) => v < 40 ? 'text-rose-500'    : v < 70 ? 'text-amber-500'    : 'text-emerald-500';
  const scoreBarColor = (v: number) => v < 40 ? 'bg-rose-500'      : v < 70 ? 'bg-amber-500'      : 'bg-emerald-500';

  const heatMapData = useMemo(() => {
    const uniqueDays = [...new Set(filteredTrainingData.map(ex => ex.day))].sort((a, b) => {
      const dayOrder = { "Day 1": 1, "Day 2": 2, "Day 3": 3, "Day 4": 4, "Day 5": 5, "Day 6": 6, "Day 7": 7 };
      return dayOrder[a] - dayOrder[b];
    });
    const muscles = Object.keys(volumeByMuscle).sort();
    
    return uniqueDays.map(day => {
      const dayVolume = { day: day };
      muscles.forEach(muscle => {
        let vol = 0;
        filteredTrainingData
          .filter(ex => ex.day === day)
          .forEach(ex => {
            const isPrimary = ex.primary.includes(muscle);
            const isSecondary = ex.secondary.includes(muscle);
            if (countingMethod === 'fractional') {
              if (isPrimary) vol += ex.sets / ex.primary.length;
              if (isSecondary) vol += (ex.sets * 0.5) / ex.secondary.length;
            } else if (countingMethod === 'directOnly') {
              if (isPrimary) vol += ex.sets;
            } else { // allSets
              if (isPrimary || isSecondary) vol += ex.sets;
            }
          });
        dayVolume[muscle] = parseFloat(vol.toFixed(1));
      });
      return dayVolume;
    });
  }, [volumeByMuscle, filteredTrainingData, countingMethod]);

  const volumeCapViolations = useMemo(() => {
    const violations = [];
    heatMapData.forEach(dayData => {
      Object.keys(dayData).forEach(key => {
        if (key !== 'day' && dayData[key] > 10) {
          violations.push({
            day: dayData.day,
            muscle: key,
            volume: dayData[key]
          });
        }
      });
    });
    return violations;
  }, [heatMapData]);

  const balanceAnalysis = useMemo(() => {
    const weeklyCompound = volumeByType['Compound'] || 0;
    const weeklyIsolation = volumeByType['Isolation'] || 0;
    const weeklyTotal = weeklyCompound + weeklyIsolation;
    const weeklyCompoundPct = weeklyTotal > 0 ? (weeklyCompound / weeklyTotal) * 100 : 0;
    
    const dailyBalance = dayData.map(day => {
      const total = day.Compound + day.Isolation;
      const compoundPct = total > 0 ? (day.Compound / total) * 100 : 0;
      const hasIssue = day.Compound === 0 || day.Isolation === 0;
      return {
        day: day.day,
        compound: day.Compound,
        isolation: day.Isolation,
        total: total,
        compoundPct: compoundPct,
        hasIssue: hasIssue,
        issue: day.Compound === 0 ? 'No compounds' : day.Isolation === 0 ? 'No isolation' : null
      };
    });
    
    return {
      weeklyCompound,
      weeklyIsolation,
      weeklyCompoundPct,
      dailyBalance
    };
  }, [volumeByType, dayData]);

  const programScore = useMemo(() => {
    let score = 0;
    let maxScore = 0;
    const details = [];
    
    // Volume targets (40 points max)
    maxScore += 40;
    const inOptimalRange = muscleData.filter(m => m.total >= 4 && m.total <= 20).length;
    const totalMuscles = muscleData.length;
    const volumeScore = totalMuscles > 0 ? (inOptimalRange / totalMuscles) * 40 : 0;
    score += volumeScore;
    details.push({ category: 'Volume Targets', score: volumeScore, max: 40, pct: totalMuscles > 0 ? (inOptimalRange / totalMuscles) * 100 : 0 });
    
    // Frequency (30 points max)
    maxScore += 30;
    const optimalFreq = frequencyData.filter(f => f.frequency >= 2 && f.frequency <= 3).length;
    const totalFreq = frequencyData.length;
    const freqScore = totalFreq > 0 ? (optimalFreq / totalFreq) * 30 : 0;
    score += freqScore;
    details.push({ category: 'Training Frequency', score: freqScore, max: 30, pct: totalFreq > 0 ? (optimalFreq / totalFreq) * 100 : 0 });
    
    // Balance (20 points max)
    maxScore += 20;
    const balanceInRange = balanceAnalysis.weeklyCompoundPct >= 40 && balanceAnalysis.weeklyCompoundPct <= 70;
    const balanceScore = balanceInRange ? 20 : Math.max(0, 20 - Math.abs(balanceAnalysis.weeklyCompoundPct - 55) / 2);
    score += balanceScore;
    details.push({ category: 'Compound/Isolation Balance', score: balanceScore, max: 20, pct: (balanceScore / 20) * 100 });
    
    // Volume cap compliance (10 points max)
    maxScore += 10;
    const capScore = volumeCapViolations.length === 0 ? 10 : Math.max(0, 10 - volumeCapViolations.length * 2);
    score += capScore;
    details.push({ category: 'Session Volume Cap', score: capScore, max: 10, pct: (capScore / 10) * 100 });
    
    const finalScore = Math.round((score / maxScore) * 100);
    const grade = finalScore >= 90 ? 'A' : finalScore >= 80 ? 'B' : finalScore >= 70 ? 'C' : finalScore >= 60 ? 'D' : 'F';
    const color = finalScore >= 80 ? 'green' : finalScore >= 60 ? 'blue' : finalScore >= 40 ? 'amber' : 'red';
    
    return { score: finalScore, grade, color, details };
  }, [muscleData, frequencyData, balanceAnalysis, volumeCapViolations]);

  const musclesByCategory = useMemo(() => {
    const categories = {
      'Shoulders': [],
      'Chest': [],
      'Back': [],
      'Legs': [],
      'Biceps': [],
      'Triceps': [],
      'Other': []
    };

    muscleData.forEach(m => {
      const muscle = m.muscle;
      if (muscle === 'Chest') categories['Chest'].push(m);
      else if (['Front Delts', 'Side Delts', 'Rear Delts'].includes(muscle)) categories['Shoulders'].push(m);
      else if (muscle === 'Biceps') categories['Biceps'].push(m);
      else if (muscle === 'Triceps') categories['Triceps'].push(m);
      else if (['Lats', 'Scapular Retractors', 'Scapular Depressors', 'Scapular Elevators'].includes(muscle)) categories['Back'].push(m);
      else if (['Quads', 'Glutes', 'Hams'].includes(muscle)) categories['Legs'].push(m);
      else categories['Other'].push(m);
    });

    const categoryTotals = Object.entries(categories)
      .filter(([cat, muscles]) => muscles.length > 0)
      .map(([category, muscles]) => ({
        category: category,
        Compound: muscles.reduce((sum, m) => sum + m.Compound, 0),
        Isolation: muscles.reduce((sum, m) => sum + m.Isolation, 0),
        total: muscles.reduce((sum, m) => sum + m.total, 0)
      }))
      .sort((a, b) => b.total - a.total);

    return categoryTotals;
  }, [muscleData]);

  const dm = darkMode; // shorthand

  // Dark mode class helpers — rich midnight navy palette
  const bg = dm ? 'bg-gray-950' : 'bg-gradient-to-br from-slate-50 to-slate-100';
  const card = dm ? 'bg-gray-900 text-slate-100' : 'bg-white text-slate-800';
  const subtext = dm ? 'text-slate-400' : 'text-slate-600';
  const inputCls = dm ? 'bg-gray-800 border-gray-600 text-slate-100' : 'border-slate-300 text-slate-700';

  // Stat card bg in dark mode (slightly lighter than card bg for contrast)
  const statCard = (lightCls) => dm ? 'bg-gray-800 border border-gray-700' : lightCls;
  const headingCls = dm ? 'text-slate-100' : 'text-slate-800';
  const bodyTextCls = dm ? 'text-slate-300' : 'text-slate-700';
  const subtleBg = dm ? 'bg-gray-800 border border-gray-700' : 'bg-slate-50 border border-slate-200';
  const hoverRow = dm ? 'hover:bg-gray-700' : 'hover:bg-slate-50';
  const tableHead = dm ? 'bg-gray-800 text-slate-300' : 'bg-slate-100 text-slate-600';
  const divider = dm ? 'border-gray-700' : 'border-slate-200';

  // Chart theme — consistent across all Recharts components
  const chartAxisTick = { fill: dm ? '#94a3b8' : '#64748b', fontSize: 11 };
  const chartTooltipStyle = dm
    ? { background: '#1e293b', border: '1px solid #475569', color: '#f1f5f9', borderRadius: '8px', fontSize: '12px' }
    : { background: '#fff', border: '1px solid #e2e8f0', color: '#1e293b', borderRadius: '8px', fontSize: '12px' };
  const chartTooltipItemStyle = { color: dm ? '#f1f5f9' : '#1e293b' };
  const chartTooltipLabelStyle = { color: dm ? '#f1f5f9' : '#1e293b', fontWeight: 600 };
  const chartPanelCls = dm ? 'bg-gray-800 border border-gray-700 rounded-xl p-4' : 'bg-white border border-slate-200 rounded-xl p-4';
  // Shared cursor style — removes hover backdrop fill on all bar charts
  const noFillCursor = { fill: 'transparent', stroke: 'none' };

  return (
    <div className={`w-full min-h-screen ${bg} p-4 md:p-8`} style={{ fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif" }}>
      <div className="max-w-7xl mx-auto">
        <div className={`${card} rounded-2xl shadow-sm border ${dm ? 'border-gray-800' : 'border-slate-100'} p-6 mb-5`}>
          <div className="flex justify-between items-start mb-5">
            <div>
              <h1 className={`text-3xl font-bold tracking-tight ${dm ? 'text-slate-100' : 'text-slate-900'}`}>Training Volume Analysis</h1>
              <p className={`text-sm mt-1 ${dm ? 'text-slate-500' : 'text-slate-400'}`}>Program structure, muscle volume &amp; weekly distribution</p>
            </div>
            <button
              onClick={() => setDarkMode(d => !d)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all ${dm ? 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-500 shadow-sm'}`}
            >
              {darkMode ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>

          {/* ── Control bar: CSV | Program filter | Vol method ── */}
          <div className={`rounded-xl border p-4 mb-5 ${dm ? 'bg-gray-800 border-gray-700' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center gap-0">
              {/* CSV upload */}
              <div className="flex-1 pr-6">
                <div className={`text-xs font-semibold mb-1.5 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
                  Upload Program (CSV)
                  <InfoTooltip dark={dm} content={<span>
                    <strong>8 required columns (headers must match exactly):</strong><br/>
                    Exercise · Day · Sets · Primary_Target_Muscle · Secondary_Target_Muscle · Movement_Pattern · Movement_Type · Program<br/><br/>
                    Muscles are comma-separated within a cell. Leave Secondary blank if none. Movement_Type = "Compound" or "Isolation".
                  </span>} />
                </div>
                <div className={`flex items-center h-9 rounded-lg border px-3 ${dm ? 'bg-gray-700 border-gray-600' : 'bg-white border-slate-300'}`}>
                  <input
                    id="csv-upload"
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className={`block w-full text-xs file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${dm ? 'text-slate-300' : 'text-slate-500'}`}
                  />
                </div>
              </div>
              {/* Divider */}
              <div className={`w-px self-stretch mx-2 ${dm ? 'bg-gray-600' : 'bg-slate-200'}`}></div>
              {/* Program filter */}
              <div className="flex-1 px-6">
                <div className={`text-xs font-semibold mb-1.5 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Filter by Program</div>
                <select
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)}
                  className={`block w-full h-9 px-3 border rounded-lg text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${dm ? 'bg-gray-700 border-gray-600 text-slate-100' : 'bg-white border-slate-300 text-slate-700'}`}
                >
                  <option value="all">All Programs</option>
                  {availablePrograms.map(prog => (
                    <option key={prog} value={prog}>{prog}</option>
                  ))}
                </select>
              </div>
              {/* Divider */}
              <div className={`w-px self-stretch mx-2 ${dm ? 'bg-gray-600' : 'bg-slate-200'}`}></div>
              {/* Vol method pill toggle */}
              <div className="flex-1 pl-6">
                <div className={`text-xs font-semibold mb-1.5 flex items-center ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
                  Volume Method
                  <InfoTooltip dark={dm} content={<span>Controls how sets are attributed to muscles when an exercise targets more than one.<br/><br/><strong>Fractional (recommended):</strong> primary muscles split 1 set equally; secondaries each get 0.5 sets shared.<br/><br/><strong>Direct Sets Only:</strong> only primaries counted, full sets each.<br/><br/><strong>All Sets Equal:</strong> every targeted muscle gets the full set count — inflates secondaries significantly.</span>} />
                </div>
                <div className={`flex rounded-lg border overflow-hidden text-xs font-medium h-9 ${dm ? 'border-gray-600' : 'border-slate-300'}`}>
                  {[['fractional','Fractional'],['directOnly','Direct'],['allSets','All Equal']].map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => setCountingMethod(val)}
                      className={`flex-1 transition-colors ${countingMethod === val
                        ? 'bg-blue-600 text-white'
                        : dm ? 'bg-gray-700 text-slate-300 hover:bg-gray-600' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                    >{label}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-6 gap-3">
            {/* Program Score card */}
            <div className={`rounded-xl p-4 border border-t-4 ${programScore.color === 'green' ? 'border-t-emerald-500' : programScore.color === 'blue' ? 'border-t-blue-500' : programScore.color === 'amber' ? 'border-t-amber-500' : 'border-t-red-500'} ${dm ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className={`text-xs font-medium flex items-center mb-2 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
                Program Score
                <InfoTooltip dark={dm} content={<span>Composite score out of 100 across 4 dimensions:<br/><br/><strong>Volume Targets (40pts)</strong> — % of muscles within MEV–MRV range<br/><strong>Training Frequency (30pts)</strong> — % of muscles trained 2–3×/week<br/><strong>Balance (20pts)</strong> — compound sets as 40–70% of total<br/><strong>Session Cap (10pts)</strong> — deductions for muscles exceeding 10 sets/day</span>} />
              </div>
              <div className={`text-3xl font-bold tracking-tight ${programScore.color === 'green' ? 'text-emerald-500' : programScore.color === 'blue' ? 'text-blue-500' : programScore.color === 'amber' ? 'text-amber-500' : 'text-red-500'}`}>{programScore.score}</div>
              <div className={`text-xs mt-1 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Grade: {programScore.grade} <ScoreBreakdownPill details={programScore.details} dm={dm} /></div>
            </div>
            {/* Total Raw Sets — slate, no semantic colour */}
            <div className={`rounded-xl p-4 border border-t-4 border-t-slate-400 ${dm ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className={`text-xs font-medium flex items-center mb-2 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
                Total Sets (Raw)
                <InfoTooltip dark={dm} content={<span>The actual number of sets you perform each week — this is what you physically do in the gym. Compound + Isolation sets always add up to this number.<br/><br/>Note: this differs from Muscle-Weighted Volume, which distributes sets fractionally across all muscles targeted by each exercise.</span>} />
              </div>
              <div className={`text-3xl font-bold tracking-tight ${dm ? 'text-slate-100' : 'text-slate-800'}`}>{totalRawSets}</div>
              <div className={`text-xs mt-1 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{rawCompoundSets}C + {rawIsolationSets}I</div>
            </div>
            {/* Muscle-Weighted Sets — slate, no semantic colour */}
            <div className={`rounded-xl p-4 border border-t-4 border-t-slate-400 ${dm ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className={`text-xs font-medium flex items-center mb-2 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
                Muscle-Weighted Sets
                <InfoTooltip dark={dm} content={<span>Volume redistributed across every muscle targeted by each exercise, based on the selected calculation method.<br/><br/><strong>Fractional (current best estimate):</strong> primary muscles split 1 set equally; secondary muscles each get 0.5 sets shared. This is the most balanced estimate.<br/><br/><strong>Direct Sets Only</strong> and <strong>All Sets Equal</strong> are more optimistic — they assign full sets to all primary (and secondary) muscles, ignoring the fact that one exercise's output is shared across multiple muscles. This inflates volume numbers significantly for muscles like Biceps, Rear Delts, and Triceps that frequently appear as secondaries.<br/><br/>Use Fractional for realistic planning; other methods are useful for sensitivity checks.</span>} />
              </div>
              <div className={`text-3xl font-bold tracking-tight ${dm ? 'text-slate-100' : 'text-slate-800'}`}>{totalVolume.toFixed(1)}</div>
              <div className={`text-xs mt-1 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>across {Object.keys(volumeByMuscle).length} muscles</div>
            </div>
            {/* Compound Sets — indigo, matching C_COMPOUND */}
            <div className="rounded-xl p-4 border border-t-4 border-t-indigo-500" style={{borderColor: dm ? '#374151' : '#e2e8f0', background: dm ? '#1f2937' : '#fff', boxShadow: dm ? 'none' : '0 1px 3px rgba(0,0,0,0.06)'}}>
              <div className={`text-xs font-medium flex items-center mb-2 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
                Compound Sets
                <InfoTooltip dark={dm} content={<span>Raw sets from compound exercises (squats, rows, presses, pulls, etc.) that train multiple muscle groups simultaneously.<br/><br/>Counted at face value — 3 sets of Bench Press = 3 compound sets, regardless of how many muscles it engages.<br/><br/>Colour matches compound bars throughout the dashboard.</span>} />
              </div>
              <div className="text-3xl font-bold tracking-tight" style={{color: C_COMPOUND}}>{rawCompoundSets}</div>
              <div className={`text-xs mt-1 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{totalRawSets > 0 ? ((rawCompoundSets / totalRawSets) * 100).toFixed(0) : 0}% of total</div>
            </div>
            {/* Isolation Sets — teal, matching C_ISOLATION */}
            <div className="rounded-xl p-4 border border-t-4" style={{borderTopColor: C_ISOLATION, borderColor: dm ? '#374151' : '#e2e8f0', background: dm ? '#1f2937' : '#fff', boxShadow: dm ? 'none' : '0 1px 3px rgba(0,0,0,0.06)'}}>
              <div className={`text-xs font-medium flex items-center mb-2 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
                Isolation Sets
                <InfoTooltip dark={dm} content={<span>Raw sets from isolation exercises (curls, extensions, raises, etc.) that target one muscle group.<br/><br/>Isolation work complements compounds for complete development. Aim for 30–60% of total weekly sets.<br/><br/>Colour matches isolation bars throughout the dashboard.</span>} />
              </div>
              <div className="text-3xl font-bold tracking-tight" style={{color: C_ISOLATION}}>{rawIsolationSets}</div>
              <div className={`text-xs mt-1 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{totalRawSets > 0 ? ((rawIsolationSets / totalRawSets) * 100).toFixed(0) : 0}% of total</div>
            </div>
            {/* Training Days — amber */}
            <div className={`rounded-xl p-4 border border-t-4 border-t-amber-500 ${dm ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className={`text-xs font-medium flex items-center mb-2 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
                Training Days
                <InfoTooltip dark={dm} content={<span>Number of unique training days in the selected program.<br/><br/>Research supports spreading volume across more sessions (training each muscle 2–3×/week) rather than concentrating it in fewer days for better muscle protein synthesis.</span>} />
              </div>
              <div className={`text-3xl font-bold tracking-tight text-amber-500`}>{dayData.length}</div>
              <div className={`text-xs mt-1 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Avg: {dayData.length > 0 ? (totalRawSets / dayData.length).toFixed(1) : 0} sets/day</div>
            </div>
          </div>
          {/* Tile colour key */}
          <div className={`flex flex-wrap gap-x-5 gap-y-1 mt-2 mb-1 px-1 text-xs ${dm ? 'text-slate-500' : 'text-slate-400'}`}>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{background: C_COMPOUND}}></span>Compound sets</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{background: C_ISOLATION}}></span>Isolation sets</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block"></span>Training days</span>
            <span className={`flex items-center gap-1.5 ${dm ? 'text-slate-600' : 'text-slate-300'}`}><span className="w-2.5 h-2.5 rounded-sm bg-slate-400 inline-block"></span>Informational (no target)</span>
          </div>



        </div>

        <div className={`flex gap-1.5 mb-4 flex-wrap p-1 rounded-xl ${dm ? 'bg-gray-900 border border-gray-800' : 'bg-slate-100 border border-slate-200'}`}>
          {[
            { key: 'overview',  label: 'Overview' },
            { key: 'volume',    label: 'Volume Detail' },
            { key: 'targets',   label: 'Targets & Frequency' },
            { key: 'structure', label: 'Program Structure' },
            { key: 'radar',     label: 'Balance Check' },
          ].map(({ key, label }) => (
            <div key={key}>
              <button
                onClick={() => { setView(key); setSelectedMuscle(null); }}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  view === key
                    ? dm ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-800 shadow-sm'
                    : dm ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {label}
              </button>
            </div>
          ))}
        </div>

        <div className={`${card} rounded-2xl border ${dm ? 'border-gray-800 shadow-none' : 'border-slate-100 shadow-sm'} p-6`}>
          {view === 'overview' && (
            <div>
              {/* ── Executive Summary ─── */}
              {(() => {
                const optimalMuscles = muscleData.filter(m => m.total >= 4 && m.total <= 20);
                const optimalFreqMuscles = frequencyData.filter(f => f.frequency >= 2 && f.frequency <= 3);
                const lagging = muscleData.filter(m => m.total < 4).sort((a, b) => a.total - b.total);
                const zeroVol = Object.keys(volumeByMuscle).length === 0 ? [] : (() => {
                  const allTracked = ['Quads','Glutes','Hams','Chest','Lats','Front Delts','Side Delts','Rear Delts','Biceps','Triceps','Abs','Erectors'];
                  return allTracked.filter(m => !volumeByMuscle[m] || volumeByMuscle[m] === 0);
                })();
                const lowFreq = frequencyData.filter(f => f.frequency === 1);
                const highVolMuscles = muscleData.filter(m => m.total > 15);
                const aboveMRV = muscleData.filter(m => m.total > 20);
                const deloadNeeded = aboveMRV.length >= 2 || muscleData.filter(m => m.total > 15).length >= 4;
                const strengths = [];
                if (optimalMuscles.length >= muscleData.length * 0.6) strengths.push({ text: `${optimalMuscles.length}/${muscleData.length} muscles in optimal volume range`, detail: optimalMuscles.map(m => m.muscle).join(', '), tab: 'targets', tabLabel: 'Targets & Frequency' });
                if (optimalFreqMuscles.length >= frequencyData.length * 0.5) strengths.push({ text: `${optimalFreqMuscles.length} muscles at optimal frequency (2–3×/wk)`, detail: optimalFreqMuscles.map(f => f.muscle + ' (' + f.frequency + 'x)').join(', '), tab: 'targets', tabLabel: 'Targets & Frequency' });
                if (balanceAnalysis.weeklyCompoundPct >= 40 && balanceAnalysis.weeklyCompoundPct <= 70) strengths.push({ text: `Compound/isolation balance: ${balanceAnalysis.weeklyCompoundPct.toFixed(0)}%`, detail: `${rawCompoundSets} compound sets + ${rawIsolationSets} isolation sets. Ideal range is 40–70% compound.`, tab: 'structure', tabLabel: 'Program Structure' });
                if (volumeCapViolations.length === 0) strengths.push({ text: 'No session volume cap violations', detail: 'All muscles are within the 10 sets/day hypertrophy cap. Good distribution.', tab: 'structure', tabLabel: 'Program Structure' });

                // Shared row style for all tiles
                const rowCls = `flex items-start gap-1.5 text-xs`;
                const labelCls = `flex-1 leading-relaxed flex items-center gap-1 flex-wrap`;

                // Shared styles — all tiles identical, all rows identical
                const tileCls = `rounded-lg p-3 ${dm ? 'bg-gray-700' : 'bg-white border border-slate-200'}`;
                const tileHeadCls = `text-xs font-semibold mb-2.5 flex items-center gap-1 ${dm ? 'text-slate-300' : 'text-slate-600'}`;
                const bodyListCls = `space-y-1.5 ${dm ? 'text-slate-300' : 'text-slate-600'}`;
                const dot = (_status?: string) => (
                  <span className={`flex-shrink-0 w-1.5 h-1.5 rounded-full mt-1.5 ${dm ? 'bg-slate-500' : 'bg-slate-300'}`}></span>
                );

                return (
                  <div className={`mb-5 rounded-xl border p-4 ${dm ? 'bg-gray-800 border-gray-700' : 'bg-slate-50 border-slate-200'}`}>
                    <h2 className={`text-xs font-semibold mb-3 uppercase tracking-widest ${dm ? 'text-slate-500' : 'text-slate-400'}`}>Executive Summary</h2>
                    <div className="grid grid-cols-2 gap-3">

                      {/* Tile 1 — Strengths */}
                      <div className={tileCls}>
                        <div className={tileHeadCls}>
                          Strengths
                          <InfoTooltip dark={dm} content={<span>Metrics where your program is performing well. Click ⓘ on any item for details and a link to the relevant tab.</span>} />
                        </div>
                        {strengths.length === 0
                          ? <p className={`text-xs ${dm ? 'text-slate-400' : 'text-slate-500'}`}>No strengths detected yet.</p>
                          : <ul className={bodyListCls}>
                              {strengths.map((s, i) => (
                                <li key={i} className={rowCls}>
                                  {dot('ok')}
                                  <span className={labelCls}>{s.text} <InfoTooltip dark={dm} content={<span>{s.detail}<br/><br/><button onClick={() => setView(s.tab)} className="text-blue-500 underline text-xs">→ {s.tabLabel} tab</button></span>} /></span>
                                </li>
                              ))}
                            </ul>
                        }
                      </div>

                      {/* Tile 2 — Needs Attention */}
                      <div className={tileCls}>
                        <div className={tileHeadCls}>
                          Needs Attention
                          <InfoTooltip dark={dm} content={<span>Issues that may limit your progress. Click ⓘ on any item for details and a link to the relevant tab.</span>} />
                        </div>
                        {lagging.length === 0 && lowFreq.length === 0 && volumeCapViolations.length === 0 && zeroVol.length === 0
                          ? <p className={`text-xs ${dm ? 'text-slate-400' : 'text-slate-500'}`}>No issues detected.</p>
                          : <ul className={bodyListCls}>
                              {lagging.length > 0 && (
                                <li className={rowCls}>
                                  {dot('bad')}
                                  <span className={labelCls}>{lagging.length} muscle{lagging.length > 1 ? 's' : ''} below MEV <InfoTooltip dark={dm} content={<span><strong>Below MEV muscles:</strong><br/>{lagging.map(m => m.muscle + ' (' + m.total.toFixed(1) + ' sets)').join(', ')}<br/><br/>MEV = ~4 sets/week. Below this, stimulus is insufficient for growth.<br/><br/><button onClick={() => setView('targets')} className="text-blue-500 underline text-xs">→ Targets &amp; Frequency tab</button></span>} /></span>
                                </li>
                              )}
                              {zeroVol.length > 0 && (
                                <li className={rowCls}>
                                  {dot('bad')}
                                  <span className={labelCls}>{zeroVol.length} muscle group{zeroVol.length > 1 ? 's' : ''} untrained <InfoTooltip dark={dm} content={<span><strong>Untrained groups:</strong><br/>{zeroVol.join(', ')}<br/><br/>These have zero sets. Consider whether this is intentional.<br/><br/><button onClick={() => setView('volume')} className="text-blue-500 underline text-xs">→ Volume Detail tab</button></span>} /></span>
                                </li>
                              )}
                              {lowFreq.length > 0 && (
                                <li className={rowCls}>
                                  {dot('warn')}
                                  <span className={labelCls}>{lowFreq.length} muscle{lowFreq.length > 1 ? 's' : ''} trained only 1×/week <InfoTooltip dark={dm} content={<span><strong>Low frequency muscles:</strong><br/>{lowFreq.map(f => f.muscle).join(', ')}<br/><br/>Research supports 2–3× per week for optimal muscle protein synthesis.<br/><br/><button onClick={() => setView('targets')} className="text-blue-500 underline text-xs">→ Targets &amp; Frequency tab</button></span>} /></span>
                                </li>
                              )}
                              {volumeCapViolations.length > 0 && (
                                <li className={rowCls}>
                                  {dot('warn')}
                                  <span className={labelCls}>{volumeCapViolations.length} session cap violation{volumeCapViolations.length > 1 ? 's' : ''} <InfoTooltip dark={dm} content={<span><strong>Sessions exceeding 10 sets/muscle:</strong><br/>{volumeCapViolations.map(v => v.day + ': ' + v.muscle + ' (' + v.volume.toFixed(1) + ' sets)').join(', ')}<br/><br/><button onClick={() => setView('structure')} className="text-blue-500 underline text-xs">→ Program Structure tab</button></span>} /></span>
                                </li>
                              )}
                            </ul>
                        }
                      </div>

                      {/* Tile 3 — Recovery & Fatigue */}
                      <div className={tileCls}>
                        <div className={tileHeadCls}>
                          Recovery &amp; Fatigue
                          <InfoTooltip dark={dm} content={<span>Total weekly load and recovery signals. A deload is recommended when multiple muscles are near or above MRV (20 sets/week).</span>} />
                        </div>
                        <ul className={bodyListCls}>
                          <li className={rowCls}>
                            {dot('neutral')}
                            <span className={labelCls}>{totalRawSets} raw sets across {dayData.length} days</span>
                          </li>
                          {highVolMuscles.length > 0 && (
                            <li className={rowCls}>
                              {dot('warn')}
                              <span className={labelCls}>{highVolMuscles.length} high-volume muscle{highVolMuscles.length > 1 ? 's' : ''} (&gt;15 sets) <InfoTooltip dark={dm} content={<span><strong>High-volume muscles:</strong><br/>{highVolMuscles.map(m => m.muscle + ' (' + m.total.toFixed(1) + ')').join(', ')}<br/><br/>These approach MRV. Monitor for soreness or performance regression.</span>} /></span>
                            </li>
                          )}
                          {deloadNeeded
                            ? <li className={rowCls}>{dot('warn')}<span className={labelCls}>Deload may be warranted — multiple muscles near MRV</span></li>
                            : <li className={rowCls}>{dot('ok')}<span className={labelCls}>Load appears manageable — no deload signals</span></li>
                          }
                        </ul>
                      </div>

                      {/* Tile 4 — Program Structure */}
                      <div className={tileCls}>
                        <div className={tileHeadCls}>
                          Program Structure
                          <InfoTooltip dark={dm} content={<span>A quick audit of structural completeness — whether key movement patterns are covered and volume is reasonably spread across days.</span>} />
                        </div>
                        {(() => {
                          const allPatterns = filteredTrainingData.map(e => e.pattern);
                          const hasSquat = allPatterns.some(p => p.toLowerCase().includes('squat'));
                          const hasHinge = allPatterns.some(p => p.toLowerCase().includes('hinge'));
                          const hasVertPull = allPatterns.some(p => p.toLowerCase().includes('vertical pull'));
                          const hasHorizPull = allPatterns.some(p => p.toLowerCase().includes('horizontal pull'));
                          const hasHorizPush = allPatterns.some(p => p.toLowerCase().includes('horizontal push'));
                          const hasVertPush = allPatterns.some(p => p.toLowerCase().includes('vertical push'));
                          const missingPatterns = [
                            !hasSquat && 'Squat / Leg Press',
                            !hasHinge && 'Hip Hinge (Deadlift)',
                            !hasVertPull && 'Vertical Pull',
                            !hasHorizPull && 'Horizontal Pull',
                            !hasHorizPush && 'Horizontal Push',
                            !hasVertPush && 'Vertical Push',
                          ].filter(Boolean);
                          const avgSetsPerDay = dayData.length > 0 ? totalRawSets / dayData.length : 0;
                          const maxSets = dayData.reduce((max, d) => Math.max(max, d.Compound + d.Isolation), 0);
                          const heaviestDays = dayData.filter(d => (d.Compound + d.Isolation) === maxSets);
                          return (
                            <ul className={bodyListCls}>
                              {missingPatterns.length === 0
                                ? <li className={rowCls}>{dot('ok')}<span className={labelCls}>All 6 fundamental patterns covered</span></li>
                                : <li className={rowCls}>
                                    {dot('bad')}
                                    <span className={labelCls}>{missingPatterns.length} movement pattern{missingPatterns.length > 1 ? 's' : ''} missing <InfoTooltip dark={dm} content={<span><strong>Missing:</strong> {missingPatterns.join(', ')}</span>} /></span>
                                  </li>
                              }
                              <li className={rowCls}>{dot('neutral')}<span className={labelCls}>Avg {avgSetsPerDay.toFixed(1)} sets/day</span></li>
                              <li className={rowCls}>
                                {dot('neutral')}
                                <span className={labelCls}>Heaviest: <strong>{heaviestDays.map(d => d.day).join(', ')}</strong> ({maxSets} sets) <InfoTooltip dark={dm} content={<span>Heaviest training day(s) by total sets. Aim for no day exceeding 2× the lightest day's volume.</span>} /></span>
                              </li>
                            </ul>
                          );
                        })()}
                      </div>

                    </div>
                  </div>
                );
              })()}

              <h2 className={`text-xl font-bold mb-4 ${headingCls}`}>Weekly Volume by Major Muscle Groups</h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={musclesByCategory} layout="horizontal">
                  
                  <XAxis dataKey="category" tick={chartAxisTick} />
                  <YAxis tick={chartAxisTick} />
                  <Tooltip cursor={noFillCursor} content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    const compound = payload.find(p => p.dataKey === 'Compound')?.value || 0;
                    const isolation = payload.find(p => p.dataKey === 'Isolation')?.value || 0;
                    const total = compound + isolation;
                    return (
                      <div style={chartTooltipStyle} className="px-3 py-2 rounded-lg shadow-lg">
                        <p className="font-semibold text-sm mb-1">{label}</p>
                        <p className="text-xs" style={{color: C_COMPOUND}}>Compound: {compound}</p>
                        <p className="text-xs" style={{color: C_ISOLATION}}>Isolation: {isolation}</p>
                        <p className={`text-xs font-semibold mt-1 pt-1 border-t ${dm ? 'border-slate-600 text-slate-200' : 'border-slate-200 text-slate-700'}`}>Total: {total}</p>
                      </div>
                    );
                  }} />
                  <Legend />
                  <Bar dataKey="Compound" stackId="a" fill={C_COMPOUND} activeBar={false} onClick={(data) => setSelectedMuscle(data.category)} style={{cursor: 'pointer'}} />
                  <Bar dataKey="Isolation" stackId="a" fill={C_ISOLATION} activeBar={false} onClick={(data) => setSelectedMuscle(data.category)} style={{cursor: 'pointer'}}>
                    <LabelList
                      valueAccessor={(entry) => (entry.Compound || 0) + (entry.Isolation || 0)}
                      position="insideTop"
                      style={{ fill: '#fff', fontSize: 11, fontWeight: 700 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className={`text-xs mt-3 ${dm ? 'text-slate-500' : 'text-slate-400'}`}>Click any bar to see exercise breakdown by muscle group</p>

            </div>
          )}

          {view === 'volume' && (
            <div>
              <h2 className={`text-xl font-bold mb-4 ${headingCls}`}>Weekly Volume by Muscle Group</h2>
              <ResponsiveContainer width="100%" height={700}>
                <BarChart data={muscleData} layout="vertical" margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                  
                  <XAxis type="number" tick={chartAxisTick} />
                  <YAxis dataKey="muscle" type="category" width={140} tick={{ fontSize: 10, fill: dm ? '#94a3b8' : '#64748b' }} interval={0} />
                  <Tooltip cursor={noFillCursor} content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    const compound = payload.find(p => p.dataKey === 'Compound')?.value || 0;
                    const isolation = payload.find(p => p.dataKey === 'Isolation')?.value || 0;
                    const total = +compound + +isolation;
                    return (
                      <div style={chartTooltipStyle} className="px-3 py-2 rounded-lg shadow-lg">
                        <p className="font-semibold text-sm mb-1">{label}</p>
                        <p className="text-xs" style={{color: C_COMPOUND}}>Compound: {(+compound).toFixed(1)}</p>
                        <p className="text-xs" style={{color: C_ISOLATION}}>Isolation: {(+isolation).toFixed(1)}</p>
                        <p className={`text-xs font-semibold mt-1 pt-1 border-t ${dm ? 'border-slate-600 text-slate-200' : 'border-slate-200 text-slate-700'}`}>Total: {total.toFixed(1)}</p>
                      </div>
                    );
                  }} />
                  <Legend />
                  <Bar dataKey="Compound" stackId="a" fill={C_COMPOUND} activeBar={false} onClick={(data) => setSelectedMuscle(data.muscle)} style={{cursor: 'pointer'}} />
                  <Bar dataKey="Isolation" stackId="a" fill={C_ISOLATION} activeBar={false} onClick={(data) => setSelectedMuscle(data.muscle)} style={{cursor: 'pointer'}}>
                    <LabelList
                      valueAccessor={(entry) => { const t = (entry.Compound || 0) + (entry.Isolation || 0); return t > 0 ? t : ''; }}
                      position="insideRight"
                      style={{ fill: '#fff', fontSize: 10, fontWeight: 700 }}
                    />
                  </Bar>
                  <ReferenceLine x={4} stroke="#dc2626" strokeWidth={1} strokeDasharray="5 4" />
                  <ReferenceLine x={10} stroke="#059669" strokeWidth={1} strokeDasharray="5 4" />
                  <ReferenceLine x={20} stroke="#d97706" strokeWidth={1} strokeDasharray="5 4" />
                </BarChart>
              </ResponsiveContainer>
              <div className={`mt-2 flex gap-4 text-xs justify-center ${dm ? 'text-slate-400' : 'text-slate-600'}`}>
                <span className="flex items-center gap-1">
                  <span className="w-8 h-0.5" style={{borderTop: '3px dashed #dc2626'}}></span> MEV (4)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-8 h-0.5" style={{borderTop: '3px dashed #059669'}}></span> MAV (10)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-8 h-0.5" style={{borderTop: '3px dashed #d97706'}}></span> MRV (20)
                </span>
              </div>


              {/* ── Muscle Readiness Scorecard (WPI + SFR) ── */}
              <div className={`mt-6 rounded-xl border ${dm ? 'bg-gray-800 border-gray-700' : 'bg-slate-50 border-slate-200'} p-4`}>
                <div className={`font-semibold flex items-center gap-1 mb-1 ${dm ? 'text-slate-200' : 'text-slate-800'}`}>
                  Muscle Readiness Scorecard
                </div>
                <p className={`text-xs mb-3 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
                  Click column header to sort. Click any row to see exercise breakdown.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm" style={{tableLayout: 'fixed'}}>
                    <colgroup>
                      <col style={{width: '130px'}} />
                      <col style={{width: '56px'}} />
                      <col style={{width: '76px'}} />
                      <col style={{width: '44px'}} />
                      <col style={{width: '44px'}} />
                      <col style={{width: '60px'}} />
                      <col style={{width: '44px'}} />
                      <col style={{width: '68px'}} />
                    </colgroup>
                    <thead>
                      <tr className={dm ? 'text-slate-400' : 'text-slate-500'}>
                        <th className="text-left text-xs font-semibold pb-2">Muscle</th>
                        <th className="text-left text-xs font-semibold pb-2">
                          <span className="flex items-center gap-0.5">
                            <button
                              onClick={() => setScorecardSort(s => s.col === 'wpi' ? {...s, dir: s.dir === 'asc' ? 'desc' : 'asc'} : {col:'wpi', dir:'asc'})}
                              className={`flex items-center gap-0.5 hover:opacity-80 ${scorecardSort.col === 'wpi' ? (dm ? 'text-blue-400' : 'text-blue-600') : ''}`}
                            >
                              WPI {scorecardSort.col === 'wpi' ? (scorecardSort.dir === 'asc' ? '↑' : '↓') : '↕'}
                            </button>
                            <InfoTooltip dark={dm} content={<span><strong>Weak Point Index (0–100)</strong><br/><br/>Composite score: <strong>Volume (60%)</strong> + <strong>Frequency (40%)</strong>.<br/><br/>Volume score: scales 0→100 from 0 sets to MAV (10 sets).<br/>Frequency score: 0 untrained · 35 at 1×/wk · 100 at 2–3×/wk · 70 at 4+×/wk.<br/><br/>Lower WPI = muscle needs more attention.<br/>🔴 &lt;40 underdeveloped · 🟡 40–69 adequate · 🟢 ≥70 well-trained</span>} openLeft />
                          </span>
                        </th>
                        <th className="text-left text-xs font-semibold pb-2">WPI bar</th>
                        <th className="text-left text-xs font-semibold pb-2">Vol</th>
                        <th className="text-left text-xs font-semibold pb-2">Freq</th>
                        <th className="text-left text-xs font-semibold pb-2">
                          <span className="flex items-center gap-0.5">
                            <button
                              onClick={() => setScorecardSort(s => s.col === 'sfr' ? {...s, dir: s.dir === 'asc' ? 'desc' : 'asc'} : {col:'sfr', dir:'asc'})}
                              className={`flex items-center gap-0.5 hover:opacity-80 ${scorecardSort.col === 'sfr' ? (dm ? 'text-blue-400' : 'text-blue-600') : ''}`}
                            >
                              SFR% {scorecardSort.col === 'sfr' ? (scorecardSort.dir === 'asc' ? '↑' : '↓') : '↕'}
                            </button>
                            <InfoTooltip dark={dm} content={<span><strong>SFR Proxy — Isolation %</strong><br/><br/>The % of a muscle's total volume that comes from <em>isolation exercises</em> (e.g. curls, extensions, raises).<br/><br/>Isolation sets produce targeted stimulus with lower systemic fatigue than compound sets. A higher SFR% means your volume for that muscle is more fatigue-efficient.<br/><br/><strong>Formula:</strong> Isolation sets ÷ Total sets × 100<br/><br/>🔴 &lt;40% — mostly compound-sourced; consider adding isolation work<br/>🟡 40–69% — reasonable compound/isolation mix<br/>🟢 ≥70% — isolation-dominant; high stimulus efficiency<br/><br/>No universally correct value — use to spot muscles relying entirely on compound volume.</span>} openLeft />
                          </span>
                        </th>
                        <th className="text-left text-xs font-semibold pb-2">Iso</th>
                        <th className="text-left text-xs font-semibold pb-2">SFR bar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...weakPointIndex]
                        .map(m => {
                          const sfr = sfrData.find(s => s.muscle === m.muscle);
                          return { ...m, sfrPct: sfr ? sfr.isolationPct : 0, isoSets: sfr ? sfr.isolationSets : 0 };
                        })
                        .sort((a, b) => {
                          const v = scorecardSort.col === 'wpi' ? a.wpi - b.wpi : a.sfrPct - b.sfrPct;
                          return scorecardSort.dir === 'asc' ? v : -v;
                        })
                        .map((m, i) => (
                          <tr key={i} onClick={() => setSelectedMuscle(m.muscle)} className={`cursor-pointer border-t ${dm ? 'border-gray-700 hover:bg-gray-700' : 'border-slate-100 hover:bg-slate-50'}`}>
                            <td className={`py-1.5 font-medium text-xs truncate ${dm ? 'text-slate-200' : 'text-slate-700'}`}>{m.muscle}</td>
                            <td className={`py-1.5 font-bold text-sm ${scoreColor(m.wpi)}`}>{m.wpi}</td>
                            <td className="py-1.5 pr-2">
                              <div className={`h-2 rounded-full ${dm ? 'bg-gray-700' : 'bg-slate-200'}`}>
                                <div className={`h-2 rounded-full transition-all ${scoreBarColor(m.wpi)}`} style={{ width: m.wpi + '%' }}></div>
                              </div>
                            </td>
                            <td className={`py-1.5 text-xs ${dm ? 'text-slate-300' : 'text-slate-600'}`}>{m.volume.toFixed(1)}</td>
                            <td className={`py-1.5 text-xs ${dm ? 'text-slate-300' : 'text-slate-600'}`}>{m.frequency}×</td>
                            <td className={`py-1.5 font-bold text-sm ${scoreColor(m.sfrPct)}`}>{m.sfrPct}%</td>
                            <td className={`py-1.5 text-xs ${dm ? 'text-slate-300' : 'text-slate-600'}`}>{m.isoSets.toFixed(1)}</td>
                            <td className="py-1.5">
                              <div className={`h-2 rounded-full overflow-hidden ${dm ? 'bg-gray-700' : 'bg-slate-200'}`}>
                                <div className={`h-2 transition-all ${scoreBarColor(m.sfrPct)}`} style={{ width: m.sfrPct + '%' }}></div>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {view === 'targets' && (
            <div>
              <h2 className={`text-xl font-bold mb-4 ${dm ? 'text-slate-100' : 'text-slate-800'}`}>Training Frequency Per Muscle</h2>
              <p className={`text-sm mb-4 ${dm ? 'text-slate-400' : 'text-slate-600'}`}>Research suggests 2-3x per week is optimal for most muscles. Click bars below to highlight muscles.</p>
              
              <div className={chartPanelCls + " mb-6"}>
                <h3 className={`font-semibold mb-3 ${dm ? 'text-slate-200' : 'text-slate-800'}`}>Frequency Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart 
                    data={[
                      { category: '1x/week', count: frequencyData.filter(f => f.frequency === 1).length, fill: C_FREQ_LOW, key: 'low' },
                      { category: '2x/week', count: frequencyData.filter(f => f.frequency === 2).length, fill: C_FREQ_OPT, key: 'optimal2' },
                      { category: '3x/week', count: frequencyData.filter(f => f.frequency === 3).length, fill: C_FREQ_OPT, key: 'optimal3' },
                      { category: '4+x/week', count: frequencyData.filter(f => f.frequency >= 4).length, fill: C_FREQ_HIGH, key: 'high' }
                    ]}
                    onClick={(data) => {
                      if (data && data.activePayload && data.activePayload[0]) {
                        const clickedKey = data.activePayload[0].payload.key;
                        setHighlightedFrequency(highlightedFrequency === clickedKey ? null : clickedKey);
                      }
                    }}
                    activeBar={false}
                  >
                    
                    <XAxis dataKey="category" tick={chartAxisTick} />
                    <YAxis tick={chartAxisTick} label={{ value: 'Number of Muscles', angle: -90, position: 'insideLeft', fill: dm ? '#94a3b8' : '#64748b', fontSize: 11 }} />
                    <Tooltip contentStyle={chartTooltipStyle} itemStyle={chartTooltipItemStyle} labelStyle={chartTooltipLabelStyle} cursor={noFillCursor} />
                    <Bar dataKey="count" style={{cursor: 'pointer'}}>
                      {[
                        { category: '1x/week', fill: C_FREQ_LOW },
                        { category: '2x/week', fill: C_FREQ_OPT },
                        { category: '3x/week', fill: C_FREQ_OPT },
                        { category: '4+x/week', fill: C_FREQ_HIGH }
                      ].map((entry, index) => (
                        <Cell key={'cell-' + index} fill={entry.fill} />
                      ))}
                      <LabelList dataKey="count" position="insideTop" style={{ fill: '#fff', fontSize: 12, fontWeight: 700 }} formatter={(v) => v > 0 ? v : ''} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                  { key: 'low', label: 'Low (1×/wk)', color: 'amber', muscles: frequencyData.filter(f => f.frequency === 1), suffix: '1x' },
                  { key: 'optimal2', label: 'Optimal (2×/wk)', color: 'emerald', muscles: frequencyData.filter(f => f.frequency === 2), suffix: '2x' },
                  { key: 'optimal3', label: 'Optimal (3×/wk)', color: 'emerald', muscles: frequencyData.filter(f => f.frequency === 3), suffix: '3x' },
                  { key: 'high', label: 'High (4+×/wk)', color: 'violet', muscles: frequencyData.filter(f => f.frequency >= 4).sort((a,b) => b.frequency - a.frequency), suffix: (f) => f.frequency + 'x' },
                ].map(({ key, label, color, muscles, suffix }) => {
                  const colorMap = {
                    amber:   { border: highlightedFrequency === key ? 'border-amber-400' : (dm ? 'border-gray-700' : 'border-slate-200'), accent: 'bg-amber-400', count: dm ? 'text-amber-300' : 'text-amber-600', bar: dm ? 'bg-gray-700' : 'bg-slate-100', muscleTxt: dm ? 'text-slate-300' : 'text-slate-700' },
                    emerald: { border: highlightedFrequency === key ? 'border-emerald-400' : (dm ? 'border-gray-700' : 'border-slate-200'), accent: 'bg-emerald-500', count: dm ? 'text-emerald-300' : 'text-emerald-600', bar: dm ? 'bg-gray-700' : 'bg-slate-100', muscleTxt: dm ? 'text-slate-300' : 'text-slate-700' },
                    violet:  { border: highlightedFrequency === key ? 'border-violet-400' : (dm ? 'border-gray-700' : 'border-slate-200'), accent: 'bg-violet-500', count: dm ? 'text-violet-300' : 'text-violet-600', bar: dm ? 'bg-gray-700' : 'bg-slate-100', muscleTxt: dm ? 'text-slate-300' : 'text-slate-700' },
                  };
                  const cl = colorMap[color];
                  return (
                    <div key={key} className={`rounded-xl border-2 transition-all ${cl.border} ${dm ? 'bg-gray-800' : 'bg-white shadow-sm'} p-4`}>
                      <div className={`flex items-center gap-2 mb-3`}>
                        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cl.accent}`}></span>
                        <span className={`text-xs font-semibold tracking-wide ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{label}</span>
                      </div>
                      <div className={`text-3xl font-bold mb-3 ${cl.count}`}>{muscles.length}</div>
                      <div className="space-y-1.5">
                        {muscles.length > 0 ? muscles.map(f => {
                          const pct = Math.min((f.frequency / 5) * 100, 100);
                          const sfx = typeof suffix === 'function' ? suffix(f) : suffix;
                          return (
                            <button key={f.muscle} onClick={() => setSelectedMuscle(f.muscle)} className="w-full text-left group">
                              <div className="flex justify-between items-center mb-0.5">
                                <span className={`text-xs group-hover:underline ${cl.muscleTxt}`}>{f.muscle}</span>
                                <span className={`text-xs font-medium ${cl.count}`}>{sfx}</span>
                              </div>
                              <div className={`h-1 rounded-full ${cl.bar}`}>
                                <div className={`h-1 rounded-full ${cl.accent}`} style={{width: pct + '%'}}></div>
                              </div>
                            </button>
                          );
                        }) : <p className={`text-xs ${dm ? 'text-slate-500' : 'text-slate-400'}`}>None</p>}
                      </div>
                      
                    </div>
                  );
                })}
              </div>

              {/* ── Volume Landmarks ─────────────────── */}
              <div className={`mt-8 pt-6 border-t ${dm ? 'border-gray-700' : 'border-slate-200'}`}>
              <h2 className={`text-xl font-bold mb-2 flex items-center ${dm ? 'text-slate-100' : 'text-slate-800'}`}>
                Volume Landmarks Analysis
                <InfoTooltip dark={dm} content={<span>MEV (Minimum Effective Volume) — ~4 sets/week: the least you need to stimulate growth.<br/><br/>MAV (Maximum Adaptive Volume) — ~10 sets/week: the sweet spot for most people most of the time.<br/><br/>MRV (Maximum Recoverable Volume) — ~20 sets/week: beyond this, recovery is compromised and performance declines. These are rough population averages; individual thresholds vary.</span>} />
              </h2>
              
              <div className={chartPanelCls + " mb-6"}>
                <h3 className={`font-semibold mb-3 ${headingCls}`}>Volume Status Distribution</h3>
                <p className="text-sm text-slate-600 mb-2">Click bars below to highlight corresponding muscles</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart 
                    data={[
                      { status: 'Below MEV', count: volumeLandmarksData.filter(m => m.volume < 4).length, fill: C_BELOW, key: 'below' },
                      { status: 'MEV-MAV (4-10)', count: volumeLandmarksData.filter(m => m.volume >= 4 && m.volume < 10).length, fill: C_IN_LOW, key: 'optimal' },
                      { status: 'MAV-MRV (10-20)', count: volumeLandmarksData.filter(m => m.volume >= 10 && m.volume <= 20).length, fill: C_IN_HIGH, key: 'optimal' },
                      { status: 'Above MRV', count: volumeLandmarksData.filter(m => m.volume > 20).length, fill: C_ABOVE, key: 'above' }
                    ]}
                    onClick={(data) => {
                      if (data && data.activePayload && data.activePayload[0]) {
                        const clickedKey = data.activePayload[0].payload.key;
                        setHighlightedVolumeLandmark(highlightedVolumeLandmark === clickedKey ? null : clickedKey);
                      }
                    }}
                    activeBar={false}
                  >
                    
                    <XAxis dataKey="status" tick={chartAxisTick} />
                    <YAxis tick={chartAxisTick} label={{ value: 'Number of Muscles', angle: -90, position: 'insideLeft', fill: dm ? '#94a3b8' : '#64748b', fontSize: 11 }} />
                    <Tooltip contentStyle={chartTooltipStyle} itemStyle={chartTooltipItemStyle} labelStyle={chartTooltipLabelStyle} cursor={noFillCursor} />
                    <Bar dataKey="count" style={{cursor: 'pointer'}}>
                      {[
                        { status: 'Below MEV', fill: C_BELOW },
                        { status: 'MEV-MAV (4-10)', fill: C_IN_LOW },
                        { status: 'MAV-MRV (10-20)', fill: C_IN_HIGH },
                        { status: 'Above MRV', fill: C_ABOVE }
                      ].map((entry, index) => (
                        <Cell key={'cell-' + index} fill={entry.fill} />
                      ))}
                      <LabelList dataKey="count" position="insideTop" style={{ fill: '#fff', fontSize: 12, fontWeight: 700 }} formatter={(v) => v > 0 ? v : ''} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                  { key: 'below',    label: 'Below MEV',    range: '< 4 sets',    color: 'rose',    muscles: volumeLandmarksData.filter(m => m.volume < 4).sort((a,b) => b.volume - a.volume) },
                  { key: 'mevmav',   label: 'MEV – MAV',   range: '4 – 10 sets',  color: 'emerald', muscles: volumeLandmarksData.filter(m => m.volume >= 4 && m.volume < 10).sort((a,b) => b.volume - a.volume) },
                  { key: 'mavmrv',   label: 'MAV – MRV',   range: '10 – 20 sets', color: 'green',   muscles: volumeLandmarksData.filter(m => m.volume >= 10 && m.volume <= 20).sort((a,b) => b.volume - a.volume) },
                  { key: 'above',    label: 'Above MRV',   range: '> 20 sets',    color: 'orange',  muscles: volumeLandmarksData.filter(m => m.volume > 20).sort((a,b) => b.volume - a.volume) },
                ].map(({ key, label, range, color, muscles }) => {
                  const isHighlighted = highlightedVolumeLandmark === key || highlightedVolumeLandmark === 'optimal' && (key === 'mevmav' || key === 'mavmrv');
                  const colorMap = {
                    rose:    { border: isHighlighted ? 'border-rose-400' : (dm ? 'border-gray-700' : 'border-slate-200'), accent: 'bg-rose-400',    count: dm ? 'text-rose-300' : 'text-rose-600',    muscleTxt: dm ? 'text-slate-300' : 'text-slate-700', badgeCls: dm ? 'bg-rose-900 text-rose-300' : 'bg-rose-100 text-rose-700' },
                    emerald: { border: isHighlighted ? 'border-emerald-400' : (dm ? 'border-gray-700' : 'border-slate-200'), accent: 'bg-emerald-500', count: dm ? 'text-emerald-300' : 'text-emerald-600', muscleTxt: dm ? 'text-slate-300' : 'text-slate-700', badgeCls: dm ? 'bg-emerald-900 text-emerald-300' : 'bg-emerald-100 text-emerald-700' },
                    green:   { border: isHighlighted ? 'border-green-400' : (dm ? 'border-gray-700' : 'border-slate-200'), accent: 'bg-green-600',   count: dm ? 'text-green-300' : 'text-green-700',  muscleTxt: dm ? 'text-slate-300' : 'text-slate-700', badgeCls: dm ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700' },
                    orange:  { border: isHighlighted ? 'border-orange-400' : (dm ? 'border-gray-700' : 'border-slate-200'), accent: 'bg-orange-400',  count: dm ? 'text-orange-300' : 'text-orange-600', muscleTxt: dm ? 'text-slate-300' : 'text-slate-700', badgeCls: dm ? 'bg-orange-900 text-orange-300' : 'bg-orange-100 text-orange-700' },
                  };
                  const cl = colorMap[color];
                  return (
                    <div key={key} className={`rounded-xl border-2 transition-all ${cl.border} ${dm ? 'bg-gray-800' : 'bg-white shadow-sm'} p-4`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cl.accent}`}></span>
                        <span className={`text-xs font-semibold tracking-wide ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{label}</span>
                      </div>
                      <div className={`text-xs mb-3 ${dm ? 'text-slate-500' : 'text-slate-400'}`}>{range}</div>
                      <div className={`text-3xl font-bold mb-3 ${cl.count}`}>{muscles.length}</div>
                      <div className="space-y-2">
                        {muscles.length > 0 ? muscles.map(m => {
                          const barPct = Math.min((m.volume / 20) * 100, 100);
                          return (
                            <button key={m.muscle} onClick={() => setSelectedMuscle(m.muscle)} className="w-full text-left group">
                              <div className="flex justify-between items-center mb-0.5">
                                <span className={`text-xs group-hover:underline ${cl.muscleTxt}`}>{m.muscle}</span>
                                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${cl.badgeCls}`}>{m.volume.toFixed(1)} sets</span>
                              </div>
                              <div className={`h-1 rounded-full ${dm ? 'bg-gray-700' : 'bg-slate-200'}`}>
                                <div className={`h-1 rounded-full ${cl.accent}`} style={{width: barPct + '%'}}></div>
                              </div>
                            </button>
                          );
                        }) : <p className={`text-xs ${dm ? 'text-slate-500' : 'text-slate-400'}`}>None {key === 'below' ? '— all above minimum' : key === 'above' ? '— recovery well managed' : ''}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── Combined landmark + session insights box ── */}
              <div className={`rounded-xl border p-4 ${dm ? 'bg-gray-800 border-gray-700' : 'bg-slate-50 border-slate-200'}`}>
                <div className={`text-xs font-semibold tracking-wide mb-3 flex items-center ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
                  Volume Insights
                  <InfoTooltip dark={dm} content={<span>Consolidates two checks: <strong>weekly landmark status</strong> (are muscles above MEV and below MRV?) and <strong>session cap</strong> (does any muscle exceed ~10 sets in a single day, beyond which extra sets add fatigue without proportional growth?)</span>} />
                </div>
                <div className={`space-y-2 text-sm ${dm ? 'text-slate-300' : 'text-slate-700'}`}>
                  {volumeLandmarksData.filter(m => m.volume < 4).length > 0 && (
                    <p><span className="text-rose-500 font-semibold">⬆ Add volume for growth</span> — {volumeLandmarksData.filter(m => m.volume < 4).sort((a,b) => b.volume - a.volume).map(m => m.muscle).join(', ')} {volumeLandmarksData.filter(m => m.volume < 4).length === 1 ? 'is' : 'are'} below MEV (&lt;4 sets). Increase weekly sets to stimulate hypertrophy.</p>
                  )}
                  {volumeLandmarksData.filter(m => m.volume > 20).length > 0 && (
                    <p><span className="text-rose-500 font-semibold">⬇ Reduce to aid recovery</span> — {volumeLandmarksData.filter(m => m.volume > 20).sort((a,b) => b.volume - a.volume).map(m => m.muscle).join(', ')} {volumeLandmarksData.filter(m => m.volume > 20).length === 1 ? 'exceeds' : 'exceed'} MRV (&gt;20 sets). Consider cutting sets to avoid accumulating fatigue.</p>
                  )}
                  {volumeLandmarksData.filter(m => m.volume < 4).length === 0 && volumeLandmarksData.filter(m => m.volume > 20).length === 0 && (
                    <p><span className={`font-semibold text-emerald-500`}>✓ All muscles within recoverable range</span> — no muscles below MEV or above MRV.</p>
                  )}
                  {volumeCapViolations.length === 0
                    ? <p><span className={`font-semibold text-emerald-500`}>✓ Session cap clear</span> — every muscle stays within the 10 sets/session cap across all training days.</p>
                    : <p>
                        <span className="text-amber-500 font-semibold">⚠️ Session overload</span> — {volumeCapViolations.map(v => `${v.muscle} on ${v.day} (${v.volume.toFixed(1)} sets)`).join('; ')}. Redistribute to another day for better absorption.
                      </p>
                  }
                </div>
              </div>
              </div>
            </div>
          )}

          {view === 'structure' && (
            <div>
              {/* ── Daily Split (now first) ─────────────────────── */}
              <h2 className={`text-xl font-bold mb-4 ${dm ? 'text-slate-100' : 'text-slate-800'}`}>Daily Volume Distribution</h2>

              {/* Bar chart */}
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={dayData} activeBar={false}>
                  
                  <XAxis dataKey="day" tick={chartAxisTick} />
                  <YAxis tick={chartAxisTick} />
                  <Tooltip cursor={noFillCursor} content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    const compound = payload.find(p => p.dataKey === 'Compound')?.value || 0;
                    const isolation = payload.find(p => p.dataKey === 'Isolation')?.value || 0;
                    const total = compound + isolation;
                    return (
                      <div style={chartTooltipStyle} className="px-3 py-2 rounded-lg shadow-lg">
                        <p className="font-semibold text-sm mb-1">{label}</p>
                        <p className="text-xs" style={{color: C_COMPOUND}}>Compound: {compound}</p>
                        <p className="text-xs" style={{color: C_ISOLATION}}>Isolation: {isolation}</p>
                        <p className={`text-xs font-semibold mt-1 pt-1 border-t ${dm ? 'border-slate-600 text-slate-200' : 'border-slate-200 text-slate-700'}`}>Total: {total}</p>
                      </div>
                    );
                  }} />
                  <Legend />
                  <Bar dataKey="Compound" stackId="a" fill={C_COMPOUND} activeBar={false} onClick={(data) => setSelectedMuscle(data.day)} style={{cursor: 'pointer'}} />
                  <Bar dataKey="Isolation" stackId="a" fill={C_ISOLATION} activeBar={false} onClick={(data) => setSelectedMuscle(data.day)} style={{cursor: 'pointer'}}>
                    <LabelList
                      valueAccessor={(entry) => (entry.Compound || 0) + (entry.Isolation || 0)}
                      position="insideTop"
                      style={{ fill: '#fff', fontSize: 12, fontWeight: 700 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* Weekly insight box */}
              {(() => {
                const pct = balanceAnalysis.weeklyCompoundPct;
                const isGood = pct >= 40 && pct <= 70;
                const maxSets = Math.max(...dayData.map(d => d.Compound + d.Isolation));
                const minSets = Math.min(...dayData.map(d => d.Compound + d.Isolation));
                const imbalanced = maxSets > minSets * 2;
                return (
                  <div className={`rounded-xl border p-4 ${dm ? 'bg-gray-800 border-gray-700' : 'bg-slate-50 border-slate-200'}`}>
                    <div className={`text-xs font-semibold tracking-wide mb-2 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
                      Weekly Insight
                      <InfoTooltip dark={dm} content={<span>A quick read of how well your weekly volume is distributed. A balanced week has a consistent load across days and a compound/isolation ratio in the 40–70% compound range.</span>} />
                    </div>
                    <p className={`text-sm ${dm ? 'text-slate-300' : 'text-slate-700'}`}>
                      {isGood && !imbalanced
                        ? <span><span className="text-emerald-500 font-semibold">✓ Good balance</span> — {pct.toFixed(0)}% compound across {dayData.length} training days, with no major day-to-day volume spikes.</span>
                        : <>
                            {!isGood && <span><span className="text-amber-500 font-semibold">⚠️ Compound ratio off</span> — currently {pct.toFixed(0)}% compound (target: 40–70%). {pct < 40 ? 'Consider adding more compound movements.' : 'Consider shifting some compound sets to isolation work.'} </span>}
                            {imbalanced && <span><span className="text-amber-500 font-semibold">⚠️ Day imbalance</span> — heaviest day ({maxSets} sets) is more than 2× the lightest ({minSets} sets). Consider redistributing volume for more consistent recovery.</span>}
                          </>
                      }
                    </p>
                  </div>
                );
              })()}

              {/* ── Patterns ─────────────────────────── */}
              <div className={`mt-8 pt-6 border-t ${dm ? 'border-gray-700' : 'border-slate-200'}`}>
              <h2 className={`text-xl font-bold mb-4 flex items-center ${dm ? 'text-slate-100' : 'text-slate-800'}`}>
                Weekly Volume by Movement Pattern
                <InfoTooltip dark={dm} content={<span>Movement pattern categories are based on Eric Helms' framework from The Muscle and Strength Training Pyramid. Each pattern trains a distinct set of primary and secondary muscle groups, ensuring comprehensive muscular development when all patterns are represented in a program.</span>} />
              </h2>
              
              {!showPatternDetails ? (
                <div>
                  <p className={`text-sm mb-4 ${dm ? 'text-slate-400' : 'text-slate-600'}`}>Click on Compound bar to see detailed breakdown by movement pattern</p>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                      { type: 'Compound', volume: compoundVsIsolation.Compound },
                      { type: 'Isolation', volume: compoundVsIsolation.Isolation }
                    ]} activeBar={false}>
                      
                      <XAxis dataKey="type" tick={chartAxisTick} />
                      <YAxis tick={chartAxisTick} />
                      <Tooltip cursor={noFillCursor} contentStyle={chartTooltipStyle} itemStyle={chartTooltipItemStyle} labelStyle={chartTooltipLabelStyle} formatter={(value) => [value + ' sets', 'Total']} />
                      <Bar dataKey="volume" onClick={(data) => data.type === 'Compound' && setShowPatternDetails(true)} style={{cursor: 'pointer'}}>
                        <Cell fill={C_COMPOUND} />
                        <Cell fill={C_ISOLATION} />
                        <LabelList dataKey="volume" position="insideTop" style={{ fill: '#fff', fontSize: 13, fontWeight: 700 }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div>
                  <div className="mb-4 flex justify-between items-center">
                    <p className={`text-sm ${dm ? 'text-slate-400' : 'text-slate-600'}`}>Detailed breakdown of compound movement patterns</p>
                    <button
                      onClick={() => setShowPatternDetails(false)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${dm ? 'bg-gray-700 hover:bg-gray-600 text-slate-200' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'}`}
                    >
                      ← Back to Summary
                    </button>
                  </div>
                  <ResponsiveContainer width="100%" height={500}>
                    <BarChart data={compoundPatternData} layout="vertical" margin={{ left: 150 }} activeBar={false}>
                      
                      <XAxis type="number" tick={chartAxisTick} />
                      <YAxis dataKey="pattern" type="category" width={140} />
                      <Tooltip contentStyle={chartTooltipStyle} itemStyle={chartTooltipItemStyle} labelStyle={chartTooltipLabelStyle} cursor={noFillCursor} />
                      <Bar dataKey="volume" fill={C_COMPOUND} onClick={(data) => setSelectedMuscle(data.pattern)} style={{cursor: 'pointer'}}>
                        {compoundPatternData.map((entry, index) => (
                          <Cell key={'cell-' + index} fill={PATTERN_COLORS[index % PATTERN_COLORS.length]} />
                        ))}
                        <LabelList dataKey="volume" position="insideRight" style={{ fill: '#fff', fontSize: 12, fontWeight: 600 }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Patterns insight box */}
              {(() => {
                const topPattern = compoundPatternData[0];
                const totalCompound = compoundVsIsolation.Compound;
                const totalIsolation = compoundVsIsolation.Isolation;
                const total = totalCompound + totalIsolation;
                const compoundPct = total > 0 ? Math.round((totalCompound / total) * 100) : 0;
                const isBalanced = compoundPct >= 40 && compoundPct <= 70;
                return (
                  <div className={`mt-5 rounded-xl border p-4 ${dm ? 'bg-gray-800 border-gray-700' : 'bg-slate-50 border-slate-200'}`}>
                    <div className={`text-xs font-semibold tracking-wide mb-2 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
                      Pattern Insight
                    </div>
                    <p className={`text-sm ${dm ? 'text-slate-300' : 'text-slate-700'}`}>
                      {isBalanced
                        ? <span><span className={`font-semibold text-emerald-500`}>✓ Good compound/isolation balance</span> — {compoundPct}% of your weekly sets come from compound movements (target: 40–70%). {topPattern ? `Most volume comes from ${topPattern.pattern} (${topPattern.volume} sets).` : ''}</span>
                        : compoundPct < 40
                          ? <span><span className="text-amber-500 font-semibold">⚠️ Isolation-heavy</span> — only {compoundPct}% compound sets (target: 40–70%). Consider adding more compound movements to build systemic strength and efficiency.</span>
                          : <span><span className="text-amber-500 font-semibold">⚠️ Compound-heavy</span> — {compoundPct}% compound sets (target: 40–70%). Consider adding targeted isolation work for muscles that only appear as secondaries in compound lifts.</span>
                      }
                    </p>
                  </div>
                );
              })()}
              </div>

              {/* ── Heatmap ──────────────────────────── */}
              <div className={`mt-8 pt-6 border-t ${dm ? 'border-gray-700' : 'border-slate-200'}`}>
              <h2 className={`text-xl font-bold mb-2 flex items-center ${dm ? 'text-slate-100' : 'text-slate-800'}`}>
                Volume Distribution Heatmap
                <InfoTooltip dark={dm} content={<span>Each cell shows how many (muscle-weighted) sets a muscle receives on a given day. Use this to spot: distribution imbalances (one muscle crammed into one day), session overload (red cells = &gt;10 sets/muscle/day which exceeds the hypertrophy cap), and muscles trained on consecutive days without recovery time. Ideally, volume for each muscle should be spread across 2–3 days with gaps between sessions.</span>} />
              </h2>
              <p className="text-sm text-slate-600 mb-4">Darker <span style={{color:'#6366f1'}}>indigo</span> = more volume. <span className="text-red-500">Red</span> = session cap exceeded (&gt;10 sets).</p>
              
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={dm ? 'bg-gray-800 text-slate-300' : 'bg-slate-100'}>
                      <th className="p-2 text-left font-semibold">Muscle</th>
                      {heatMapData.map(d => (
                        <th key={d.day} className="p-2 text-center font-semibold">{d.day}</th>
                      ))}
                      <th className="p-2 text-center font-semibold">Total</th>
                      <th className="p-2 text-center font-semibold">Days</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(volumeByMuscle).sort((a, b) => volumeByMuscle[b] - volumeByMuscle[a]).map(muscle => {
                      const freq = frequencyData.find(f => f.muscle === muscle)?.frequency || 0;
                      return (
                        <tr key={muscle} className={`border-b cursor-pointer ${dm ? 'border-gray-700 hover:bg-gray-700 text-slate-200' : 'hover:bg-slate-50'}`} onClick={() => setSelectedMuscle(muscle)}>
                          <td className="p-2 font-medium">{muscle}</td>
                          {heatMapData.map(dayDataItem => {
                            const vol = dayDataItem[muscle] || 0;
                            const allVolsForMuscle = heatMapData.map(d => d[muscle] || 0);
                            const maxVol = Math.max(...allVolsForMuscle);
                            const intensity = vol > 0 ? (vol / maxVol) * 100 : 0;
                            const exceedsCap = vol > 10;
                            const bgColor = vol > 0 ? (exceedsCap ? 'rgba(239, 68, 68, ' + (intensity / 100) + ')' : `rgba(99, 102, 241, ${intensity / 100})`) : 'transparent';
                            const textColor = intensity > 50 ? 'white' : (dm ? '#e2e8f0' : '#1e293b');
                            return (
                              <td 
                                key={dayDataItem.day} 
                                className="p-2 text-center"
                                style={{
                                  backgroundColor: bgColor,
                                  color: textColor,
                                  fontWeight: exceedsCap ? 'bold' : 'normal'
                                }}
                              >
                                {vol > 0 ? vol.toFixed(1) : '-'}
                              </td>
                            );
                          })}
                          <td className={`p-2 text-center font-bold ${dm ? 'bg-gray-800' : 'bg-slate-50'}`}>
                            {volumeByMuscle[muscle].toFixed(1)}
                          </td>
                          <td className={`p-2 text-center font-semibold ${dm ? 'bg-gray-800' : 'bg-slate-50'}`}>
                            {freq}x
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Heatmap insight box */}
              {(() => {
                const violations = volumeCapViolations.length;
                const muscles = Object.keys(volumeByMuscle);
                // Find muscles trained on consecutive days
                const dayOrder = { "Day 1": 1, "Day 2": 2, "Day 3": 3, "Day 4": 4, "Day 5": 5, "Day 6": 6, "Day 7": 7 };
                const consecutiveMuscles = muscles.filter(muscle => {
                  const trainedDays = heatMapData
                    .filter(d => (d[muscle] || 0) > 0)
                    .map(d => dayOrder[d.day] || 0)
                    .sort((a, b) => a - b);
                  for (let i = 0; i < trainedDays.length - 1; i++) {
                    if (trainedDays[i + 1] - trainedDays[i] === 1) return true;
                  }
                  return false;
                });
                return (
                  <div className={`mt-5 rounded-xl border p-4 ${dm ? 'bg-gray-800 border-gray-700' : 'bg-slate-50 border-slate-200'}`}>
                    <div className={`text-xs font-semibold tracking-wide mb-2 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
                      Heatmap Insight
                    </div>
                    <p className={`text-sm ${dm ? 'text-slate-300' : 'text-slate-700'}`}>
                      {violations === 0 && consecutiveMuscles.length === 0
                        ? <span><span className={`font-semibold text-emerald-500`}>✓ Good distribution</span> — no session cap violations and no muscles trained on back-to-back days. Volume is well spread across the week.</span>
                        : <>
                            {violations > 0 && (
                              <span>
                                <span className="text-rose-500 font-semibold">⚠️ {violations} session cap violation{violations > 1 ? 's' : ''}</span> — hypertrophy response caps at ~10 sets/muscle/session. Redistribute to another day for better absorption.
                                <div className={`mt-2 ml-2 text-xs space-y-0.5 ${dm ? 'text-red-300' : 'text-red-700'}`}>
                                  {volumeCapViolations.map((v, idx) => (
                                    <div key={idx}>• <strong>{v.day}</strong>: {v.muscle} — {v.volume.toFixed(1)} sets (over by {(v.volume - 10).toFixed(1)})</div>
                                  ))}
                                </div>
                              </span>
                            )}
                            {consecutiveMuscles.length > 0 && <span className="block mt-2"><span className="text-amber-500 font-semibold">⚠️ Back-to-back training</span> — {consecutiveMuscles.slice(0, 4).join(', ')}{consecutiveMuscles.length > 4 ? ` +${consecutiveMuscles.length - 4} more` : ''} are trained on consecutive days. Aim for 48h between sessions for the same muscle.</span>}
                          </>
                      }
                    </p>
                  </div>
                );
              })()}
              </div>
            </div>
          )}

          {view === 'radar' && (
            <div>
              <h2 className={`text-xl font-bold mb-4 ${dm ? 'text-slate-100' : 'text-slate-800'}`}>Training Balance Radar</h2>

              {/* Category selector */}
              <div className={`flex gap-2 mb-5 p-1 rounded-xl w-fit ${dm ? 'bg-gray-900' : 'bg-slate-100'}`}>
                {Object.entries(radarGroups).map(([key, group]) => (
                  <button
                    key={key}
                    onClick={() => setRadarGroup(key)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      radarGroup === key
                        ? dm ? 'bg-blue-600 text-white shadow' : 'bg-white text-slate-800 shadow-sm'
                        : dm ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {group.label}
                  </button>
                ))}
              </div>

              {/* 1×2 grid: radar left, assessment right */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">

                {/* Left — radar chart */}
                <div className={`rounded-xl border p-4 ${dm ? 'bg-gray-800 border-gray-700' : 'bg-slate-50 border-slate-200'}`}>
                  <ResponsiveContainer width="100%" height={380}>
                    <RadarChart data={currentRadarData}>
                      <PolarGrid stroke={dm ? '#334155' : '#cbd5e1'} />
                      <PolarAngleAxis dataKey="muscle" tick={chartAxisTick} />
                      <PolarRadiusAxis angle={90} domain={[0, Math.max(20, ...currentRadarData.map(d => d.volume))]} tick={chartAxisTick} />
                      <Radar name="Your Volume" dataKey="volume" stroke={C_COMPOUND} fill={C_COMPOUND} fillOpacity={0.5} />
                      <Tooltip contentStyle={chartTooltipStyle} itemStyle={chartTooltipItemStyle} labelStyle={chartTooltipLabelStyle} cursor={noFillCursor} />
                    </RadarChart>
                  </ResponsiveContainer>
                  <p className={`text-xs text-center mt-1 ${dm ? 'text-slate-500' : 'text-slate-400'}`}>MEV = 4 · MAV = 10 · MRV = 20</p>
                </div>

                {/* Right — balance assessment */}
                <div className={`rounded-xl border p-4 flex flex-col ${dm ? 'bg-gray-800 border-gray-700' : 'bg-slate-50 border-slate-200'}`}>
                  <div className={`text-xs font-semibold uppercase tracking-widest mb-3 ${dm ? 'text-slate-500' : 'text-slate-400'}`}>
                    {radarGroups[radarGroup].label} — Volume Breakdown
                  </div>

                  <div className="space-y-3">
                    {currentRadarData.map(m => {
                      const status = m.volume >= 4 && m.volume <= 20 ? 'optimal' : m.volume > 20 ? 'high' : 'low';
                      const barPct = Math.min((m.volume / 20) * 100, 100);
                      const barColor = status === 'optimal' ? 'bg-emerald-500' : status === 'high' ? 'bg-amber-500' : 'bg-red-400';
                      const badge = status === 'optimal'
                        ? <span className={`text-xs px-1.5 py-0.5 rounded-full ${dm ? 'bg-emerald-900 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}>✓</span>
                        : status === 'high'
                          ? <span className={`text-xs px-1.5 py-0.5 rounded-full ${dm ? 'bg-amber-900 text-amber-300' : 'bg-amber-100 text-amber-700'}`}>↑ above MRV</span>
                          : <span className={`text-xs px-1.5 py-0.5 rounded-full ${dm ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-700'}`}>↓ below MEV</span>;
                      return (
                        <button
                          key={m.muscle}
                          onClick={() => setSelectedMuscle(m.muscle)}
                          className={`w-full text-left group`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-sm font-medium group-hover:underline ${dm ? 'text-slate-200' : 'text-slate-700'}`}>{m.muscle}</span>
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-semibold ${dm ? 'text-slate-300' : 'text-slate-600'}`}>{m.volume.toFixed(1)} sets</span>
                              {badge}
                            </div>
                          </div>
                          <div className={`h-1.5 rounded-full w-full ${dm ? 'bg-gray-700' : 'bg-slate-200'}`}>
                            <div className={`h-1.5 rounded-full transition-all ${barColor}`} style={{ width: barPct + '%' }}></div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {currentRadarData.length === 0 && (
                    <p className={`text-sm ${dm ? 'text-slate-400' : 'text-slate-500'}`}>No data for this group.</p>
                  )}

                  <p className={`text-xs mt-auto pt-3 ${dm ? 'text-slate-500' : 'text-slate-400'}`}>Click any row to see exercise breakdown</p>
                </div>
              </div>

              {/* Push:Pull ratio below the grid */}
              <div className={`mt-5 rounded-xl border p-4 ${dm ? 'bg-gray-800 border-gray-700' : 'bg-slate-50 border-slate-200'}`}>
                <h3 className={`font-semibold mb-3 flex items-center gap-1 ${dm ? 'text-slate-200' : 'text-slate-800'}`}>
                  Push : Pull Ratio
                  <InfoTooltip dark={dm} content={<span><strong>Push muscles:</strong> Chest, Front Delts, Side Delts, Triceps<br/><strong>Pull muscles:</strong> Lats, Scapular Retractors, Scapular Depressors, Rear Delts, Biceps<br/><br/>Informational only — no universal correct ratio. Many coaches suggest slight pull-emphasis (ratio below 1.0) to protect shoulder health.</span>} />
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className={`rounded-lg p-3 text-center ${dm ? 'bg-gray-700' : 'bg-white border border-slate-200'}`}>
                    <div className={`text-xs font-medium mb-1 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Push</div>
                    <div className={`text-2xl font-bold ${dm ? 'text-slate-100' : 'text-slate-800'}`}>{pushPullRatio.pushVol}</div>
                    <div className={`text-xs ${dm ? 'text-slate-500' : 'text-slate-400'}`}>sets</div>
                  </div>
                  <div className={`rounded-lg p-3 text-center ${dm ? 'bg-gray-700' : 'bg-white border border-slate-200'}`}>
                    <div className={`text-xs font-medium mb-1 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Ratio (push ÷ pull)</div>
                    <div className={`text-2xl font-bold ${
                      pushPullRatio.ratio === null ? (dm ? 'text-slate-400' : 'text-slate-400') :
                      pushPullRatio.ratio > 1.2 ? 'text-amber-500' :
                      pushPullRatio.ratio < 0.8 ? 'text-blue-500' : 'text-emerald-500'
                    }`}>
                      {pushPullRatio.ratio !== null ? pushPullRatio.ratio.toFixed(2) : 'N/A'}
                    </div>
                    <div className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      pushPullRatio.ratio === null ? (dm ? 'bg-gray-600 text-slate-400' : 'bg-slate-100 text-slate-400') :
                      pushPullRatio.ratio > 1.2 ? 'bg-amber-100 text-amber-700' :
                      pushPullRatio.ratio < 0.8 ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {pushPullRatio.ratio === null ? 'no pull volume' :
                       pushPullRatio.ratio > 1.2 ? '⚠️ Push-heavy' :
                       pushPullRatio.ratio < 0.8 ? '↑ Pull-heavy' : '✓ Balanced'}
                    </div>
                  </div>
                  <div className={`rounded-lg p-3 text-center ${dm ? 'bg-gray-700' : 'bg-white border border-slate-200'}`}>
                    <div className={`text-xs font-medium mb-1 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Pull</div>
                    <div className={`text-2xl font-bold ${dm ? 'text-slate-100' : 'text-slate-800'}`}>{pushPullRatio.pullVol}</div>
                    <div className={`text-xs ${dm ? 'text-slate-500' : 'text-slate-400'}`}>sets</div>
                  </div>
                </div>
                {pushPullRatio.pushVol + pushPullRatio.pullVol > 0 && (
                  <div className="mt-3">
                    <div className={`text-xs mb-1 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Volume split</div>
                    <div className={`h-2.5 rounded-full overflow-hidden flex ${dm ? 'bg-gray-700' : 'bg-slate-200'}`}>
                      <div className="bg-indigo-500 transition-all" style={{ width: ((pushPullRatio.pushVol / (pushPullRatio.pushVol + pushPullRatio.pullVol)) * 100) + '%' }}></div>
                      <div className="bg-teal-500 transition-all flex-1"></div>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span className={dm ? 'text-indigo-400' : 'text-indigo-600'}>Push {((pushPullRatio.pushVol / (pushPullRatio.pushVol + pushPullRatio.pullVol)) * 100).toFixed(0)}%</span>
                      <span className={dm ? 'text-teal-400' : 'text-teal-600'}>Pull {((pushPullRatio.pullVol / (pushPullRatio.pushVol + pushPullRatio.pullVol)) * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {selectedMuscle && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{backgroundColor: 'rgba(0,0,0,0.45)'}}
            onClick={() => setSelectedMuscle(null)}
          >
          <div
            className={`w-full max-w-2xl flex flex-col rounded-2xl shadow-2xl ${dm ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-slate-200'}`}
            style={{maxHeight: 'min(80vh, 700px)'}}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-6 py-4 border-b flex-shrink-0" style={{borderColor: dm ? '#374151' : '#e2e8f0'}}>
              <h2 className={`text-lg font-bold ${headingCls}`}>
                {selectedMuscle} — Exercise Breakdown
              </h2>
              <div className="flex items-center gap-3">
                {!selectedMuscle.startsWith('Day ') && !patternData.some(p => p.pattern === selectedMuscle) && (
                  <div className={`flex rounded-lg border overflow-hidden text-xs font-medium ${dm ? 'border-gray-600' : 'border-slate-300'}`}>
                    <button onClick={() => setModalSort('day')} className={`px-3 py-1.5 transition-colors ${modalSort === 'day' ? 'bg-blue-600 text-white' : dm ? 'bg-gray-700 text-slate-300 hover:bg-gray-600' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>By Day</button>
                    <button onClick={() => setModalSort('compound')} className={`px-3 py-1.5 transition-colors ${modalSort === 'compound' ? 'bg-blue-600 text-white' : dm ? 'bg-gray-700 text-slate-300 hover:bg-gray-600' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>Compound First</button>
                  </div>
                )}
                <button
                  onClick={() => setSelectedMuscle(null)}
                  className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${dm ? 'text-slate-400 hover:bg-gray-700 hover:text-white' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'}`}
                >✕</button>
              </div>
            </div>
            <div className="overflow-y-auto flex-1 px-6 py-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={dm ? 'bg-gray-800 text-slate-300' : 'bg-slate-100'}>
                    <th className="p-2 text-left font-semibold">Exercise</th>
                    <th className="p-2 text-center font-semibold">Day</th>
                    {!selectedMuscle.startsWith('Day ') && <th className="p-2 text-center font-semibold">Role</th>}
                    <th className="p-2 text-center font-semibold">Type</th>
                    <th className="p-2 text-center font-semibold">Sets</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    if (selectedMuscle.startsWith('Day ')) {
                      const dayExercises = filteredTrainingData.filter(ex => ex.day === selectedMuscle);
                      return dayExercises.map((ex, idx) => (
                        <tr key={idx} className={`border-b ${dm ? 'border-gray-700 hover:bg-gray-700 text-slate-200' : 'hover:bg-slate-50'}`}>
                          <td className="p-2">{ex.exercise}</td>
                          <td className="p-2 text-center">{ex.day}</td>
                          <td className="p-2 text-center">{ex.type}</td>
                          <td className="p-2 text-center font-semibold">{ex.sets}</td>
                        </tr>
                      ));
                    } else if (patternData.some(p => p.pattern === selectedMuscle)) {
                      const patternExercises = filteredTrainingData.filter(ex => ex.pattern === selectedMuscle);
                      return patternExercises.map((ex, idx) => (
                        <tr key={idx} className={`border-b ${dm ? 'border-gray-700 hover:bg-gray-700 text-slate-200' : 'hover:bg-slate-50'}`}>
                          <td className="p-2">{ex.exercise}</td>
                          <td className="p-2 text-center">{ex.day}</td>
                          <td className="p-2 text-center">{ex.type}</td>
                          <td className="p-2 text-center font-semibold">{ex.sets}</td>
                        </tr>
                      ));
                    } else {
                      let musclesToShow = [];
                      if (selectedMuscle === 'Shoulders') {
                        musclesToShow = ['Front Delts', 'Side Delts', 'Rear Delts'];
                      } else if (selectedMuscle === 'Back') {
                        musclesToShow = ['Lats', 'Scapular Retractors', 'Scapular Depressors', 'Scapular Elevators'];
                      } else if (selectedMuscle === 'Legs') {
                        musclesToShow = ['Quads', 'Glutes', 'Hams'];
                      } else if (selectedMuscle === 'Other') {
                        musclesToShow = ['Abs', 'Forearms', 'Erectors'];
                      } else {
                        musclesToShow = [selectedMuscle];
                      }
                      
                      const allExercises = [];
                      musclesToShow.forEach(muscle => {
                        if (muscleExerciseBreakdown[muscle]) {
                          muscleExerciseBreakdown[muscle].forEach(ex => {
                            allExercises.push({ ...ex, targetMuscle: muscle });
                          });
                        }
                      });
                      
                      return allExercises
                        .sort((a, b) => {
                          if (modalSort === 'compound') {
                            if (a.type !== b.type) return a.type === 'Compound' ? -1 : 1;
                          }
                          const dayOrder = { "Day 1": 1, "Day 2": 2, "Day 3": 3, "Day 4": 4, "Day 5": 5, "Day 6": 6, "Day 7": 7 };
                          return dayOrder[a.day] - dayOrder[b.day];
                        })
                        .map((item, idx) => {
                          const roleClass = item.role === 'Primary' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800';
                          const exerciseName = musclesToShow.length > 1 ? item.exercise + ' (' + item.targetMuscle + ')' : item.exercise;
                          return (
                            <tr key={idx} className={`border-b ${dm ? 'border-gray-700 hover:bg-gray-700 text-slate-200' : 'hover:bg-slate-50'}`}>
                              <td className="p-2">{exerciseName}</td>
                              <td className="p-2 text-center">{item.day}</td>
                              <td className="p-2 text-center">
                                <span className={'px-2 py-1 rounded text-xs ' + roleClass}>
                                  {item.role}
                                </span>
                              </td>
                              <td className="p-2 text-center">{item.type}</td>
                              <td className="p-2 text-center font-semibold">{item.sets.toFixed(1)}</td>
                            </tr>
                          );
                        });
                    }
                  })()}
                  <tr className={`font-bold ${dm ? 'bg-gray-800 text-slate-200' : 'bg-slate-50'}`}>
                    <td colSpan={selectedMuscle.startsWith('Day ') || patternData.some(p => p.pattern === selectedMuscle) ? 3 : 4} className="p-2 text-right">Total Volume:</td>
                    <td className="p-2 text-center">
                      {(() => {
                        if (selectedMuscle.startsWith('Day ')) {
                          return filteredTrainingData.filter(ex => ex.day === selectedMuscle).reduce((sum, ex) => sum + ex.sets, 0);
                        } else if (patternData.some(p => p.pattern === selectedMuscle)) {
                          return filteredTrainingData.filter(ex => ex.pattern === selectedMuscle).reduce((sum, ex) => sum + ex.sets, 0);
                        } else {
                          let musclesToShow = [];
                          if (selectedMuscle === 'Shoulders') {
                            musclesToShow = ['Front Delts', 'Side Delts', 'Rear Delts'];
                          } else if (selectedMuscle === 'Back') {
                            musclesToShow = ['Lats', 'Scapular Retractors', 'Scapular Depressors', 'Scapular Elevators'];
                          } else if (selectedMuscle === 'Legs') {
                            musclesToShow = ['Quads', 'Glutes', 'Hams'];
                          } else if (selectedMuscle === 'Other') {
                            musclesToShow = ['Abs', 'Forearms', 'Erectors'];
                          } else {
                            musclesToShow = [selectedMuscle];
                          }
                          
                          let totalVol = 0;
                          musclesToShow.forEach(muscle => {
                            if (volumeByMuscle[muscle]) {
                              totalVol += volumeByMuscle[muscle];
                            }
                          });
                          
                          return totalVol.toFixed(1);
                        }
                      })()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            </div>
          </div>
          </div>
        )}
</div>
</div>
);
};

export default TrainingVolumeAnalysis;
                  