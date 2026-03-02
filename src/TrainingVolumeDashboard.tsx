import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line, ReferenceLine } from 'recharts';

const TrainingVolumeDashboard = () => {
  const [view, setView] = useState('overview');
  const [selectedMuscle, setSelectedMuscle] = useState(null);
  const [countingMethod, setCountingMethod] = useState('fractional');
  const [selectedProgram, setSelectedProgram] = useState('all');
  const [uploadedData, setUploadedData] = useState(null);
  const [showPatternDetails, setShowPatternDetails] = useState(false);
  const [highlightedFrequency, setHighlightedFrequency] = useState(null);
  const [radarGroup, setRadarGroup] = useState('push');
  const [highlightedVolumeLandmark, setHighlightedVolumeLandmark] = useState(null);

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
      .filter(p => p && p.trim() && !p.includes(',') && !p.includes('Back') && !p.includes('Chest') && !p.includes('Legs'))
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

  const volumeLandmarksData = muscleData.map(m => {
    const freq = frequencyData.find(f => f.muscle === m.muscle)?.frequency || 0;
    return {
      muscle: m.muscle,
      volume: m.total,
      MEV: 4,
      MAV: 10,
      MRV: 20,
      frequency: freq,
      volumePerSession: freq > 0 ? m.total / freq : 0
    };
  });

  const radarData = ['Chest', 'Lats', 'Side Delts', 'Quads', 'Biceps', 'Triceps']
    .map(muscle => ({
      muscle,
      volume: volumeByMuscle[muscle] || 0,
      optimal: 10
    }));

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

  const PATTERN_COLORS = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#95a5a6', '#34495e', '#d35400'];

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
            if (ex.primary.includes(muscle)) {
              vol += ex.sets / ex.primary.length;
            }
            if (ex.secondary.includes(muscle)) {
              vol += (ex.sets * 0.5) / ex.secondary.length;
            }
          });
        dayVolume[muscle] = parseFloat(vol.toFixed(1));
      });
      return dayVolume;
    });
  }, [volumeByMuscle, filteredTrainingData]);

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

  const actionItems = useMemo(() => {
    const items = [];
    
    const belowMEV = muscleData.filter(m => m.total < 4);
    const aboveMRV = muscleData.filter(m => m.total > 20);
    
    if (belowMEV.length > 0) {
      items.push({
        type: 'warning',
        message: `${belowMEV.length} muscle${belowMEV.length > 1 ? 's' : ''} below MEV (4 sets): ${belowMEV.slice(0, 3).map(m => m.muscle).join(', ')}${belowMEV.length > 3 ? '...' : ''}`,
        action: 'Add 2-4 sets per muscle for growth'
      });
    }
    
    if (aboveMRV.length > 0) {
      items.push({
        type: 'caution',
        message: `${aboveMRV.length} muscle${aboveMRV.length > 1 ? 's' : ''} above MRV (20 sets): ${aboveMRV.map(m => m.muscle).join(', ')}`,
        action: 'Reduce volume to improve recovery'
      });
    }
    
    const lowFreq = frequencyData.filter(f => f.frequency === 1);
    if (lowFreq.length > 0) {
      items.push({
        type: 'info',
        message: `${lowFreq.length} muscle${lowFreq.length > 1 ? 's' : ''} trained only 1x/week: ${lowFreq.slice(0, 3).map(f => f.muscle).join(', ')}${lowFreq.length > 3 ? '...' : ''}`,
        action: 'Consider 2x/week for better growth'
      });
    }
    
    if (volumeCapViolations.length > 0) {
      items.push({
        type: 'warning',
        message: `${volumeCapViolations.length} session${volumeCapViolations.length > 1 ? 's' : ''} exceed 10 sets per muscle`,
        action: 'Redistribute volume across more days'
      });
    }
    
    if (balanceAnalysis.weeklyCompoundPct < 40 || balanceAnalysis.weeklyCompoundPct > 70) {
      items.push({
        type: 'info',
        message: `Compound/isolation ratio: ${balanceAnalysis.weeklyCompoundPct.toFixed(0)}% compound`,
        action: 'Aim for 40-70% compound exercises'
      });
    }
    
    if (items.length === 0) {
      items.push({
        type: 'success',
        message: 'Program looks well-balanced!',
        action: 'All key metrics within optimal ranges'
      });
    }
    
    return items.slice(0, 4);
  }, [muscleData, frequencyData, volumeCapViolations, balanceAnalysis]);

  const programScore = useMemo(() => {
    let score = 0;
    let maxScore = 0;
    const details = [];
    
    maxScore += 40;
    const inOptimalRange = muscleData.filter(m => m.total >= 4 && m.total <= 20).length;
    const totalMuscles = muscleData.length;
    const volumeScore = totalMuscles > 0 ? (inOptimalRange / totalMuscles) * 40 : 0;
    score += volumeScore;
    details.push({ category: 'Volume Targets', score: volumeScore, max: 40, pct: totalMuscles > 0 ? (inOptimalRange / totalMuscles) * 100 : 0 });
    
    maxScore += 30;
    const optimalFreq = frequencyData.filter(f => f.frequency >= 2 && f.frequency <= 3).length;
    const totalFreq = frequencyData.length;
    const freqScore = totalFreq > 0 ? (optimalFreq / totalFreq) * 30 : 0;
    score += freqScore;
    details.push({ category: 'Training Frequency', score: freqScore, max: 30, pct: totalFreq > 0 ? (optimalFreq / totalFreq) * 100 : 0 });
    
    maxScore += 20;
    const balanceInRange = balanceAnalysis.weeklyCompoundPct >= 40 && balanceAnalysis.weeklyCompoundPct <= 70;
    const balanceScore = balanceInRange ? 20 : Math.max(0, 20 - Math.abs(balanceAnalysis.weeklyCompoundPct - 55) / 2);
    score += balanceScore;
    details.push({ category: 'Compound/Isolation Balance', score: balanceScore, max: 20, pct: (balanceScore / 20) * 100 });
    
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

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-slate-800 mb-4">Training Volume Analysis Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Upload Training Program (CSV)</label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                title="CSV headers: Exercise, Day, Sets, Primary_Target_Muscle, Secondary_Target_Muscle, Movement_Pattern, Movement_Type, Program"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Filter by Program</label>
              <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Programs</option>
                {availablePrograms.map(prog => (
                  <option key={prog} value={prog}>{prog}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-5 gap-4">
            <div className={'rounded-lg p-4 ' + (programScore.color === 'green' ? 'bg-green-50' : programScore.color === 'blue' ? 'bg-blue-50' : programScore.color === 'amber' ? 'bg-amber-50' : 'bg-red-50')}>
              <div className={'text-sm font-semibold ' + (programScore.color === 'green' ? 'text-green-600' : programScore.color === 'blue' ? 'text-blue-600' : programScore.color === 'amber' ? 'text-amber-600' : 'text-red-600')}>Program Score</div>
              <div className={'text-3xl font-bold ' + (programScore.color === 'green' ? 'text-green-900' : programScore.color === 'blue' ? 'text-blue-900' : programScore.color === 'amber' ? 'text-amber-900' : 'text-red-900')}>{programScore.score}</div>
              <div className={'text-xs ' + (programScore.color === 'green' ? 'text-green-700' : programScore.color === 'blue' ? 'text-blue-700' : programScore.color === 'amber' ? 'text-amber-700' : 'text-red-700')}>Grade: {programScore.grade}</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-blue-600 font-semibold">Total Weekly Sets</div>
              <div className="text-2xl font-bold text-blue-900">{totalVolume.toFixed(1)}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-green-600 font-semibold">Compound Sets</div>
              <div className="text-2xl font-bold text-green-900">{volumeByType['Compound'] || 0}</div>
              <div className="text-xs text-green-700">{((volumeByType['Compound'] || 0) / totalVolume * 100).toFixed(0)}% of total</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-sm text-purple-600 font-semibold">Isolation Sets</div>
              <div className="text-2xl font-bold text-purple-900">{volumeByType['Isolation'] || 0}</div>
              <div className="text-xs text-purple-700">{((volumeByType['Isolation'] || 0) / totalVolume * 100).toFixed(0)}% of total</div>
            </div>
            <div className="bg-amber-50 rounded-lg p-4">
              <div className="text-sm text-amber-600 font-semibold">Training Days</div>
              <div className="text-2xl font-bold text-amber-900">{dayData.length}</div>
              <div className="text-xs text-amber-700">Avg: {(totalVolume / dayData.length).toFixed(1)} sets/day</div>
            </div>
          </div>

          {programScore.score < 80 && (
            <div className="mt-4 bg-slate-50 border-l-4 border-slate-400 p-3 rounded">
              <p className="text-sm text-slate-700 font-semibold mb-2">Score Breakdown:</p>
              <div className="grid grid-cols-4 gap-2 text-xs">
                {programScore.details.map((detail, idx) => (
                  <div key={idx} className="text-slate-600">
                    <span className="font-medium">{detail.category}:</span> {detail.pct.toFixed(0)}%
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
            <p className="text-sm text-amber-900 mb-2">
              <strong>Volume Calculation Method:</strong>
            </p>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setCountingMethod('fractional')}
                className={'px-3 py-1 rounded text-sm font-medium ' + (countingMethod === 'fractional' ? 'bg-amber-600 text-white' : 'bg-white text-amber-900 border border-amber-300')}
                title="Primary = 1.0 set, Secondary = 0.5 sets, split equally among muscles"
              >
                Fractional
              </button>
              <button
                onClick={() => setCountingMethod('directOnly')}
                className={'px-3 py-1 rounded text-sm font-medium ' + (countingMethod === 'directOnly' ? 'bg-amber-600 text-white' : 'bg-white text-amber-900 border border-amber-300')}
                title="Only counts primary target muscles, ignores secondary involvement"
              >
                Direct Sets Only
              </button>
              <button
                onClick={() => setCountingMethod('allSets')}
                className={'px-3 py-1 rounded text-sm font-medium ' + (countingMethod === 'allSets' ? 'bg-amber-600 text-white' : 'bg-white text-amber-900 border border-amber-300')}
                title="Counts full sets for both primary AND secondary muscles"
              >
                All Sets Equal
              </button>
            </div>
            <p className="text-xs text-amber-800 mt-2">
              {countingMethod === 'fractional' && '• Primary = 1.0 set, Secondary = 0.5 sets, split equally among muscles'}
              {countingMethod === 'directOnly' && '• Only counts primary target muscles, ignores secondary involvement'}
              {countingMethod === 'allSets' && '• Counts full sets for both primary AND secondary muscles'}
            </p>
          </div>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {['overview', 'muscles', 'landmarks', 'frequency', 'daily', 'patterns', 'heatmap', 'radar'].map(v => (
            <button
              key={v}
              onClick={() => {
                setView(v);
                setSelectedMuscle(null);
              }}
              className={'px-4 py-2 rounded-lg font-medium transition-all ' + (view === v ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-700 hover:bg-slate-100')}
            >
              {v === 'overview' ? 'Overview' :
               v === 'muscles' ? 'Muscle Volume' :
               v === 'frequency' ? 'Training Frequency' :
               v === 'landmarks' ? 'Volume Targets' :
               v === 'patterns' ? 'Movement Patterns' :
               v === 'daily' ? 'Daily Split': 
               v === 'radar' ? 'Balance Check' : 'Volume Heatmap'}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          {view === 'overview' && (
            <div>
              {actionItems.length > 0 && (
                <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-4 rounded-lg">
                  <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <span className="text-xl">💡</span> Quick Insights & Action Items
                  </h3>
                  <div className="space-y-2">
                    {actionItems.map((item, idx) => {
                      const colors = {
                        warning: 'bg-amber-50 border-amber-300 text-amber-900',
                        caution: 'bg-red-50 border-red-300 text-red-900',
                        info: 'bg-blue-50 border-blue-300 text-blue-900',
                        success: 'bg-green-50 border-green-300 text-green-900'
                      };
                      const icons = {
                        warning: '⚠️',
                        caution: '🔴',
                        info: 'ℹ️',
                        success: '✅'
                      };
                      return (
                        <div key={idx} className={'p-3 rounded border-l-2 ' + colors[item.type]}>
                          <div className="flex items-start gap-2">
                            <span className="text-lg">{icons[item.type]}</span>
                            <div className="flex-1">
                              <div className="font-semibold text-sm">{item.message}</div>
                              <div className="text-xs mt-1 opacity-80">→ {item.action}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              <h2 className="text-xl font-bold text-slate-800 mb-4">Weekly Volume by Major Muscle Groups</h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={musclesByCategory} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Compound" stackId="a" fill="#3498db" onClick={(data) => setSelectedMuscle(data.category)} style={{cursor: 'pointer'}} />
                  <Bar dataKey="Isolation" stackId="a" fill="#f39c12" onClick={(data) => setSelectedMuscle(data.category)} style={{cursor: 'pointer'}} />
                  <ReferenceLine y={4} stroke="#dc2626" strokeWidth={3} strokeDasharray="8 4" label={{ value: 'MEV', position: 'right', fill: '#dc2626', fontSize: 11, fontWeight: 'bold' }} />
                  <ReferenceLine y={10} stroke="#059669" strokeWidth={3} strokeDasharray="8 4" label={{ value: 'MAV', position: 'right', fill: '#059669', fontSize: 11, fontWeight: 'bold' }} />
                  <ReferenceLine y={20} stroke="#d97706" strokeWidth={3} strokeDasharray="8 4" label={{ value: 'MRV', position: 'right', fill: '#d97706', fontSize: 11, fontWeight: 'bold' }} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-2 flex gap-4 text-xs text-slate-600 justify-center">
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
              <div className="mt-6">
                <p className="text-sm text-slate-600 mb-2">Click on any muscle group below to see exercise breakdown:</p>
                <div className="grid grid-cols-2 gap-2">
                  {musclesByCategory.map(cat => {
                    const categoryMuscles = [];
                    if (cat.category === 'Shoulders') {
                      categoryMuscles.push('Front Delts', 'Side Delts', 'Rear Delts');
                    } else if (cat.category === 'Back') {
                      categoryMuscles.push('Lats', 'Scapular Retractors', 'Scapular Depressors', 'Scapular Elevators');
                    } else if (cat.category === 'Legs') {
                      categoryMuscles.push('Quads', 'Glutes', 'Hams');
                    } else if (cat.category === 'Other') {
                      categoryMuscles.push('Abs', 'Forearms', 'Erectors');
                    } else {
                      categoryMuscles.push(cat.category);
                    }
                    
                    return (
                      <button
                        key={cat.category}
                        onClick={() => {
                          if (categoryMuscles.length === 1) {
                            setSelectedMuscle(categoryMuscles[0]);
                          } else {
                            setSelectedMuscle(cat.category);
                          }
                        }}
                        className="text-left p-3 bg-slate-50 hover:bg-blue-50 rounded transition-colors"
                      >
                        <div className="font-semibold">{cat.category}</div>
                        <div className="text-sm text-slate-600">
                          Total: {cat.total.toFixed(1)} sets ({cat.Compound.toFixed(1)} compound, {cat.Isolation.toFixed(1)} isolation)
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {view === 'muscles' && (
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-4">Weekly Volume by Muscle Group</h2>
              <ResponsiveContainer width="100%" height={700}>
                <BarChart data={muscleData} layout="vertical" margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="muscle" type="category" width={140} tick={{ fontSize: 10 }} interval={0} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Compound" stackId="a" fill="#3498db" onClick={(data) => setSelectedMuscle(data.muscle)} style={{cursor: 'pointer'}} />
                  <Bar dataKey="Isolation" stackId="a" fill="#f39c12" onClick={(data) => setSelectedMuscle(data.muscle)} style={{cursor: 'pointer'}} />
                  <ReferenceLine x={4} stroke="#dc2626" strokeWidth={3} strokeDasharray="8 4" label={{ value: 'MEV', position: 'top', fill: '#dc2626', fontSize: 11, fontWeight: 'bold' }} />
                  <ReferenceLine x={10} stroke="#059669" strokeWidth={3} strokeDasharray="8 4" label={{ value: 'MAV', position: 'top', fill: '#059669', fontSize: 11, fontWeight: 'bold' }} />
                  <ReferenceLine x={20} stroke="#d97706" strokeWidth={3} strokeDasharray="8 4" label={{ value: 'MRV', position: 'top', fill: '#d97706', fontSize: 11, fontWeight: 'bold' }} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-2 flex gap-4 text-xs text-slate-600 justify-center">
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
              <div className="mt-6 grid grid-cols-4 gap-4">
                <div className="bg-red-50 p-3 rounded-lg">
                  <h3 className="font-semibold text-red-900 mb-1 text-sm">Below MEV (&lt;4)</h3>
                  <p className="text-xs text-red-700">
                    {muscleData.filter(m => m.total < 4)
                      .map(m => m.muscle + ' (' + m.total + ')').join(', ') || 'None'}
                  </p>
                </div>
                <div className="bg-amber-50 p-3 rounded-lg">
                  <h3 className="font-semibold text-amber-900 mb-1 text-sm">MEV-MAV (4-10)</h3>
                  <p className="text-xs text-amber-700">
                    {muscleData.filter(m => m.total >= 4 && m.total < 10)
                      .map(m => m.muscle + ' (' + m.total + ')').join(', ') || 'None'}
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-1 text-sm">MAV-MRV (10-20)</h3>
                  <p className="text-xs text-green-700">
                    {muscleData.filter(m => m.total >= 10 && m.total <= 20)
                      .map(m => m.muscle + ' (' + m.total + ')').join(', ') || 'None'}
                  </p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <h3 className="font-semibold text-purple-900 mb-1 text-sm">Above MRV (&gt;20)</h3>
                  <p className="text-xs text-purple-700">
                    {muscleData.filter(m => m.total > 20)
                      .map(m => m.muscle + ' (' + m.total + ')').join(', ') || 'None'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {view === 'frequency' && (
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-4">Training Frequency Per Muscle</h2>
              <p className="text-sm text-slate-600 mb-4">Research suggests 2-3x per week is optimal for most muscles. Click bars below to highlight muscles.</p>
              
              <div className="bg-slate-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-slate-800 mb-3">Frequency Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart 
                    data={[
                      { category: '1x/week', count: frequencyData.filter(f => f.frequency === 1).length, fill: '#f59e0b', key: 'low' },
                      { category: '2x/week', count: frequencyData.filter(f => f.frequency === 2).length, fill: '#10b981', key: 'optimal2' },
                      { category: '3x/week', count: frequencyData.filter(f => f.frequency === 3).length, fill: '#10b981', key: 'optimal3' },
                      { category: '4+x/week', count: frequencyData.filter(f => f.frequency >= 4).length, fill: '#8b5cf6', key: 'high' }
                    ]}
                    onClick={(data) => {
                      if (data && data.activePayload && data.activePayload[0]) {
                        const clickedKey = data.activePayload[0].payload.key;
                        setHighlightedFrequency(highlightedFrequency === clickedKey ? null : clickedKey);
                      }
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis label={{ value: 'Number of Muscles', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Bar dataKey="count" style={{cursor: 'pointer'}}>
                      {[
                        { category: '1x/week', count: frequencyData.filter(f => f.frequency === 1).length, fill: '#f59e0b' },
                        { category: '2x/week', count: frequencyData.filter(f => f.frequency === 2).length, fill: '#10b981' },
                        { category: '3x/week', count: frequencyData.filter(f => f.frequency === 3).length, fill: '#10b981' },
                        { category: '4+x/week', count: frequencyData.filter(f => f.frequency >= 4).length, fill: '#8b5cf6' }
                      ].map((entry, index) => (
                        <Cell key={'cell-' + index} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className={'bg-amber-50 p-4 rounded-lg border-2 transition-all ' + (highlightedFrequency === 'low' ? 'border-amber-500 shadow-lg' : 'border-amber-200')}>
                  <h3 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                    <span className="text-2xl">⚠️</span> Low Frequency (1x)
                  </h3>
                  <div className="text-3xl font-bold text-amber-700 mb-2">
                    {frequencyData.filter(f => f.frequency === 1).length}
                  </div>
                  <div className="text-sm text-amber-700 space-y-1">
                    {frequencyData.filter(f => f.frequency === 1).length > 0 ? (
                      frequencyData.filter(f => f.frequency === 1).map(f => (
                        <button
                          key={f.muscle}
                          onClick={() => setSelectedMuscle(f.muscle)}
                          className={'block w-full text-left hover:underline ' + (highlightedFrequency === 'low' ? 'font-bold' : '')}
                        >
                          {f.muscle} (1x)
                        </button>
                      ))
                    ) : (
                      <div className="text-amber-600">None</div>
                    )}
                  </div>
                  {frequencyData.filter(f => f.frequency === 1).length > 0 && (
                    <div className="text-xs text-amber-600 mt-2">
                      Consider adding a 2nd session per week
                    </div>
                  )}
                </div>
                
                <div className={'bg-green-50 p-4 rounded-lg border-2 transition-all ' + (highlightedFrequency === 'optimal2' ? 'border-green-500 shadow-lg' : 'border-green-200')}>
                  <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                    <span className="text-2xl">✓</span> Optimal (2x)
                  </h3>
                  <div className="text-3xl font-bold text-green-700 mb-2">
                    {frequencyData.filter(f => f.frequency === 2).length}
                  </div>
                  <div className="text-sm text-green-700 space-y-1">
                    {frequencyData.filter(f => f.frequency === 2).length > 0 ? (
                      frequencyData.filter(f => f.frequency === 2)
                        .map(f => (
                          <button
                            key={f.muscle}
                            onClick={() => setSelectedMuscle(f.muscle)}
                            className={'block w-full text-left hover:underline ' + (highlightedFrequency === 'optimal2' ? 'font-bold' : '')}
                          >
                            {f.muscle} (2x)
                          </button>
                        ))
                    ) : (
                      <div className="text-green-600">None</div>
                    )}
                  </div>
                </div>
                
                <div className={'bg-green-50 p-4 rounded-lg border-2 transition-all ' + (highlightedFrequency === 'optimal3' ? 'border-green-500 shadow-lg' : 'border-green-200')}>
                  <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                    <span className="text-2xl">✓</span> Optimal (3x)
                  </h3>
                  <div className="text-3xl font-bold text-green-700 mb-2">
                    {frequencyData.filter(f => f.frequency === 3).length}
                  </div>
                  <div className="text-sm text-green-700 space-y-1">
                    {frequencyData.filter(f => f.frequency === 3).length > 0 ? (
                      frequencyData.filter(f => f.frequency === 3)
                        .map(f => (
                          <button
                            key={f.muscle}
                            onClick={() => setSelectedMuscle(f.muscle)}
                            className={'block w-full text-left hover:underline ' + (highlightedFrequency === 'optimal3' ? 'font-bold' : '')}
                          >
                            {f.muscle} (3x)
                          </button>
                        ))
                    ) : (
                      <div className="text-green-600">None</div>
                    )}
                  </div>
                </div>
                
                <div className={'bg-purple-50 p-4 rounded-lg border-2 transition-all ' + (highlightedFrequency === 'high' ? 'border-purple-500 shadow-lg' : 'border-purple-200')}>
                  <h3 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                    <span className="text-2xl">⚡</span> High Frequency (4+x)
                  </h3>
                  <div className="text-3xl font-bold text-purple-700 mb-2">
                    {frequencyData.filter(f => f.frequency >= 4).length}
                  </div>
                  <div className="text-sm text-purple-700 space-y-1">
                    {frequencyData.filter(f => f.frequency >= 4).length > 0 ? (
                      frequencyData.filter(f => f.frequency >= 4)
                        .sort((a, b) => b.frequency - a.frequency)
                        .map(f => (
                          <button
                            key={f.muscle}
                            onClick={() => setSelectedMuscle(f.muscle)}
                            className={'block w-full text-left hover:underline ' + (highlightedFrequency === 'high' ? 'font-bold' : '')}
                          >
                            {f.muscle} ({f.frequency}x)
                          </button>
                        ))
                    ) : (
                      <div className="text-purple-600">None</div>
                    )}
                  </div>
                  {frequencyData.filter(f => f.frequency >= 4).length > 0 && (
                    <div className="text-xs text-purple-600 mt-2">
                      Very high - monitor recovery
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {view === 'landmarks' && (
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-4">Volume Landmarks Analysis</h2>
              <p className="text-sm text-slate-600 mb-4">
                MEV (Minimum Effective Volume): ~4 sets | MAV (Maximum Adaptive Volume): ~10 sets | MRV (Maximum Recoverable Volume): ~20 sets
              </p>
              
              <div className="bg-slate-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-slate-800 mb-3">Volume Status Distribution</h3>
                <p className="text-sm text-slate-600 mb-2">Click bars below to highlight corresponding muscles</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart 
                    data={[
                      { status: 'Below MEV', count: volumeLandmarksData.filter(m => m.volume < 4).length, fill: '#ef4444', key: 'below' },
                      { status: 'MEV-MAV (4-10)', count: volumeLandmarksData.filter(m => m.volume >= 4 && m.volume < 10).length, fill: '#22c55e', key: 'optimal' },
                      { status: 'MAV-MRV (10-20)', count: volumeLandmarksData.filter(m => m.volume >= 10 && m.volume <= 20).length, fill: '#16a34a', key: 'optimal' },
                      { status: 'Above MRV', count: volumeLandmarksData.filter(m => m.volume > 20).length, fill: '#f59e0b', key: 'above' }
                    ]}
                    onClick={(data) => {
                      if (data && data.activePayload && data.activePayload[0]) {
                        const clickedKey = data.activePayload[0].payload.key;
                        setHighlightedVolumeLandmark(highlightedVolumeLandmark === clickedKey ? null : clickedKey);
                      }
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                    <YAxis label={{ value: 'Number of Muscles', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Bar dataKey="count" style={{cursor: 'pointer'}}>
                      {[
                        { status: 'Below MEV', fill: '#ef4444' },
                        { status: 'MEV-MAV (4-10)', fill: '#22c55e' },
                        { status: 'MAV-MRV (10-20)', fill: '#16a34a' },
                        { status: 'Above MRV', fill: '#f59e0b' }
                      ].map((entry, index) => (
                        <Cell key={'cell-' + index} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className={'bg-red-50 p-4 rounded-lg border-2 transition-all ' + (highlightedVolumeLandmark === 'below' ? 'border-red-500 shadow-lg' : 'border-red-200')}>
                  <h3 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                    <span className="text-2xl">⬇️</span> Below MEV (&lt;4 sets)
                  </h3>
                  <div className="text-3xl font-bold text-red-700 mb-2">
                    {volumeLandmarksData.filter(m => m.volume < 4).length}
                  </div>
                  <div className="text-sm text-red-700 space-y-1 max-h-40 overflow-y-auto">
                    {volumeLandmarksData.filter(m => m.volume < 4).length > 0 ? (
                      volumeLandmarksData.filter(m => m.volume < 4)
                        .sort((a, b) => a.volume - b.volume)
                        .map(m => (
                          <button
                            key={m.muscle}
                            onClick={() => setSelectedMuscle(m.muscle)}
                            className={'block w-full text-left hover:underline ' + (highlightedVolumeLandmark === 'below' ? 'font-bold' : '')}
                          >
                            {m.muscle}: {m.volume.toFixed(1)} sets
                          </button>
                        ))
                    ) : (
                      <div className="text-red-600">None - All muscles above minimum!</div>
                    )}
                  </div>
                  {volumeLandmarksData.filter(m => m.volume < 4).length > 0 && (
                    <div className="text-xs text-red-600 mt-2">
                      Consider adding volume for growth
                    </div>
                  )}
                </div>
                
                <div className={'bg-green-50 p-4 rounded-lg border-2 transition-all ' + (highlightedVolumeLandmark === 'optimal' ? 'border-green-500 shadow-lg' : 'border-green-200')}>
                  <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                    <span className="text-2xl">✓</span> Optimal Range (4-20 sets)
                  </h3>
                  <div className="text-3xl font-bold text-green-700 mb-2">
                    {volumeLandmarksData.filter(m => m.volume >= 4 && m.volume <= 20).length}
                  </div>
                  <div className="text-sm text-green-700 space-y-1 max-h-40 overflow-y-auto">
                    {volumeLandmarksData.filter(m => m.volume >= 4 && m.volume <= 20).length > 0 ? (
                      volumeLandmarksData.filter(m => m.volume >= 4 && m.volume <= 20)
                        .sort((a, b) => b.volume - a.volume)
                        .map(m => {
                          const status = m.volume >= 10 ? 'MAV' : 'MEV-MAV';
                          return (
                            <button
                              key={m.muscle}
                              onClick={() => setSelectedMuscle(m.muscle)}
                              className={'block w-full text-left hover:underline ' + (highlightedVolumeLandmark === 'optimal' ? 'font-bold' : '')}
                            >
                              {m.muscle}: {m.volume.toFixed(1)} sets ({status})
                            </button>
                          );
                        })
                    ) : (
                      <div className="text-green-600">None in range</div>
                    )}
                  </div>
                </div>
                
                <div className={'bg-amber-50 p-4 rounded-lg border-2 transition-all ' + (highlightedVolumeLandmark === 'above' ? 'border-amber-500 shadow-lg' : 'border-amber-200')}>
                  <h3 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                    <span className="text-2xl">⚠️</span> Above MRV (&gt;20 sets)
                  </h3>
                  <div className="text-3xl font-bold text-amber-700 mb-2">
                    {volumeLandmarksData.filter(m => m.volume > 20).length}
                  </div>
                  <div className="text-sm text-amber-700 space-y-1 max-h-40 overflow-y-auto">
                    {volumeLandmarksData.filter(m => m.volume > 20).length > 0 ? (
                      volumeLandmarksData.filter(m => m.volume > 20)
                        .sort((a, b) => b.volume - a.volume)
                        .map(m => (
                          <button
                            key={m.muscle}
                            onClick={() => setSelectedMuscle(m.muscle)}
                            className={'block w-full text-left hover:underline ' + (highlightedVolumeLandmark === 'above' ? 'font-bold' : '')}
                          >
                            {m.muscle}: {m.volume.toFixed(1)} sets
                          </button>
                        ))
                    ) : (
                      <div className="text-amber-600">None - Good recovery management!</div>
                    )}
                  </div>
                  {volumeLandmarksData.filter(m => m.volume > 20).length > 0 && (
                    <div className="text-xs text-amber-600 mt-2">
                      May impair recovery - consider reducing
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Volume Per Session Analysis</h3>
                <div className="text-sm text-blue-700">
                  {volumeLandmarksData
                    .filter(v => v.volumePerSession > 10)
                    .map(v => (
                      <div key={v.muscle} className="mb-1">
                        <strong>{v.muscle}:</strong> {v.volumePerSession.toFixed(1)} sets/session ({v.frequency}x per week) - May cause excessive fatigue
                      </div>
                    ))}
                  {volumeLandmarksData.filter(v => v.volumePerSession > 10).length === 0 && (
                    <div>✓ All muscles have reasonable volume per session (under 10 sets)</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {view === 'patterns' && (
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-4">Weekly Volume by Movement Pattern</h2>
              
              {!showPatternDetails ? (
                <div>
                  <p className="text-sm text-slate-600 mb-4">Click on Compound bar to see detailed breakdown by movement pattern</p>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                      { type: 'Compound', volume: compoundVsIsolation.Compound },
                      { type: 'Isolation', volume: compoundVsIsolation.Isolation }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="volume" onClick={(data) => data.type === 'Compound' && setShowPatternDetails(true)} style={{cursor: 'pointer'}}>
                        <Cell fill="#3498db" />
                        <Cell fill="#f39c12" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-blue-900">Compound Exercises</h3>
                      <p className="text-2xl font-bold text-blue-700">{compoundVsIsolation.Compound} sets</p>
                      <p className="text-xs text-blue-600 mt-1">Click bar above to see pattern breakdown</p>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-amber-900">Isolation Exercises</h3>
                      <p className="text-2xl font-bold text-amber-700">{compoundVsIsolation.Isolation} sets</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-4 flex justify-between items-center">
                    <p className="text-sm text-slate-600">Detailed breakdown of compound movement patterns</p>
                    <button
                      onClick={() => setShowPatternDetails(false)}
                      className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg text-sm font-medium"
                    >
                      ← Back to Summary
                    </button>
                  </div>
                  <ResponsiveContainer width="100%" height={500}>
                    <BarChart data={compoundPatternData} layout="vertical" margin={{ left: 150 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="pattern" type="category" width={140} />
                      <Tooltip />
                      <Bar dataKey="volume" fill="#2ecc71" onClick={(data) => setSelectedMuscle(data.pattern)} style={{cursor: 'pointer'}}>
                        {compoundPatternData.map((entry, index) => (
                          <Cell key={'cell-' + index} fill={PATTERN_COLORS[index % PATTERN_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {view === 'daily' && (
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-4">Daily Volume Distribution</h2>
              
              {balanceAnalysis.dailyBalance.some(d => d.hasIssue) && (
                <div className="mb-4 bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
                  <h3 className="font-semibold text-amber-900 mb-2">⚠️ Balance Issues Detected</h3>
                  <p className="text-sm text-amber-700 mb-2">
                    Each training day should include both compound and isolation exercises for balanced development:
                  </p>
                  <div className="text-sm text-amber-800">
                    {balanceAnalysis.dailyBalance.filter(d => d.hasIssue).map((d, idx) => (
                      <div key={idx}>• <strong>{d.day}</strong>: {d.issue}</div>
                    ))}
                  </div>
                </div>
              )}
              
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={dayData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Compound" stackId="a" fill="#3498db" onClick={(data) => setSelectedMuscle(data.day)} style={{cursor: 'pointer'}} />
                  <Bar dataKey="Isolation" stackId="a" fill="#e74c3c" onClick={(data) => setSelectedMuscle(data.day)} style={{cursor: 'pointer'}} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-6">
                <h3 className="font-semibold text-slate-800 mb-3">Daily Breakdown</h3>
                <p className="text-sm text-slate-600 mb-2">Click on any day to see exercise breakdown</p>
                <div className="grid grid-cols-2 gap-4">
                  {balanceAnalysis.dailyBalance.map(day => {
                    const totalSets = day.total;
                    const statusColor = day.hasIssue ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-300';
                    
                    return (
                      <button
                        key={day.day}
                        onClick={() => setSelectedMuscle(day.day)}
                        className={'p-3 border-l-4 rounded text-left hover:bg-blue-50 transition-colors ' + statusColor}
                      >
                        <div className="font-semibold">{day.day}: {totalSets} sets</div>
                        <div className="text-sm text-slate-600">
                          {day.compound} compound ({day.compoundPct.toFixed(0)}%), {day.isolation} isolation
                        </div>
                        {day.hasIssue && (
                          <div className="text-xs text-amber-700 mt-1">⚠️ {day.issue}</div>
                        )}
                      </button>
                    );
                  })}
                </div>
                
                <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Weekly Balance Summary</h3>
                  <div className="text-sm text-blue-700">
                    <div className="mb-1">
                      <strong>Total Weekly Sets:</strong> {balanceAnalysis.weeklyCompound + balanceAnalysis.weeklyIsolation}
                    </div>
                    <div className="mb-1">
                      <strong>Compound:</strong> {balanceAnalysis.weeklyCompound} sets ({balanceAnalysis.weeklyCompoundPct.toFixed(0)}%)
                    </div>
                    <div className="mb-1">
                      <strong>Isolation:</strong> {balanceAnalysis.weeklyIsolation} sets ({(100 - balanceAnalysis.weeklyCompoundPct).toFixed(0)}%)
                    </div>
                    <div className="mt-2 text-xs">
                      {balanceAnalysis.weeklyCompoundPct >= 40 && balanceAnalysis.weeklyCompoundPct <= 70 ? 
                        '✓ Good weekly balance between compound and isolation work' : 
                        '⚠️ Consider adjusting balance - aim for 40-70% compound exercises'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {view === 'heatmap' && (
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-4">Volume Distribution Heat Map</h2>
              <p className="text-sm text-slate-600 mb-4">Shows which muscles are trained on which days. Darker colors = higher volume.</p>
              
              {volumeCapViolations.length > 0 && (
                <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded">
                  <h3 className="font-semibold text-red-900 mb-2">⚠️ Volume Cap Violations ({'>'}10 sets/day)</h3>
                  <p className="text-sm text-red-700 mb-2">
                    Hypertrophy response typically caps at ~10 sets per muscle per session. Consider redistributing volume:
                  </p>
                  <div className="text-sm text-red-800">
                    {volumeCapViolations.map((v, idx) => (
                      <div key={idx} className="mb-1">
                        • <strong>{v.day}</strong>: {v.muscle} has {v.volume} sets (exceeds by {(v.volume - 10).toFixed(1)} sets)
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-100">
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
                        <tr key={muscle} className="border-b hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedMuscle(muscle)}>
                          <td className="p-2 font-medium">{muscle}</td>
                          {heatMapData.map(dayDataItem => {
                            const vol = dayDataItem[muscle] || 0;
                            const allVolsForMuscle = heatMapData.map(d => d[muscle] || 0);
                            const maxVol = Math.max(...allVolsForMuscle);
                            const intensity = vol > 0 ? (vol / maxVol) * 100 : 0;
                            const exceedsCap = vol > 10;
                            const bgColor = vol > 0 ? (exceedsCap ? 'rgba(239, 68, 68, ' + (intensity / 100) + ')' : 'rgba(59, 130, 246, ' + (intensity / 100) + ')') : 'transparent';
                            const textColor = intensity > 50 ? 'white' : 'black';
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
                          <td className="p-2 text-center font-bold bg-slate-50">
                            {volumeByMuscle[muscle].toFixed(1)}
                          </td>
                          <td className="p-2 text-center font-semibold bg-slate-50">
                            {freq}x
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {view === 'radar' && (
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-4">Training Balance Radar</h2>
              <p className="text-sm text-slate-600 mb-4">Compare your actual volume (red) against optimal targets (blue). Select muscle group below:</p>
              
              <div className="flex gap-2 mb-6 flex-wrap">
                {Object.entries(radarGroups).map(([key, group]) => (
                  <button
                    key={key}
                    onClick={() => setRadarGroup(key)}
                    className={'px-4 py-2 rounded-lg font-medium transition-all ' + (radarGroup === key ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300')}
                  >
                    {group.label}
                  </button>
                ))}
              </div>
              
              <ResponsiveContainer width="100%" height={500}>
                <RadarChart data={currentRadarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="muscle" />
                  <PolarRadiusAxis angle={90} domain={[0, 20]} />
                  <Radar name="Your Volume" dataKey="volume" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                  <Radar name="Optimal (10 sets)" dataKey="optimal" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
              
              <div className="mt-6 bg-amber-50 p-4 rounded-lg">
                <h3 className="font-semibold text-amber-900 mb-2">Balance Assessment for {radarGroups[radarGroup].label}</h3>
                <div className="text-sm text-amber-700 space-y-2">
                  <p>A well-balanced program should have relatively equal volume for muscles within each group.</p>
                  <div className="mt-2">
                    <strong>Current Group Analysis:</strong>
                    <div className="mt-1 space-y-1">
                      {currentRadarData.map(m => {
                        const diff = m.volume - m.optimal;
                        const status = Math.abs(diff) <= 3 ? 'optimal' : diff > 3 ? 'high' : 'low';
                        const statusColor = status === 'optimal' ? 'text-green-700' : status === 'high' ? 'text-amber-700' : 'text-red-700';
                        return (
                          <button
                            key={m.muscle}
                            onClick={() => setSelectedMuscle(m.muscle)}
                            className={'block w-full text-left hover:underline ' + statusColor}
                          >
                            • {m.muscle}: {m.volume.toFixed(1)} sets 
                            {status === 'optimal' && ' ✓'}
                            {status === 'high' && ' (above optimal)'}
                            {status === 'low' && ' (below optimal)'}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {selectedMuscle && (
          <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-800">
                {selectedMuscle.startsWith('Day ') ? selectedMuscle + ' - Exercise Breakdown' : selectedMuscle + ' - Exercise Breakdown'}
              </h2>
              <button 
                onClick={() => setSelectedMuscle(null)}
                className="text-slate-500 hover:text-slate-700 text-xl px-3 py-1"
              >
                ✕
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-100">
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
                        <tr key={idx} className="border-b hover:bg-slate-50">
                          <td className="p-2">{ex.exercise}</td>
                          <td className="p-2 text-center">{ex.day}</td>
                          <td className="p-2 text-center">{ex.type}</td>
                          <td className="p-2 text-center font-semibold">{ex.sets}</td>
                        </tr>
                      ));
                    } else if (patternData.some(p => p.pattern === selectedMuscle)) {
                      const patternExercises = filteredTrainingData.filter(ex => ex.pattern === selectedMuscle);
                      return patternExercises.map((ex, idx) => (
                        <tr key={idx} className="border-b hover:bg-slate-50">
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
                          const dayOrder = { "Day 1": 1, "Day 2": 2, "Day 3": 3, "Day 4": 4, "Day 5": 5, "Day 6": 6, "Day 7": 7 };
                          return dayOrder[a.day] - dayOrder[b.day];
                        })
                        .map((item, idx) => {
                          const roleClass = item.role === 'Primary' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800';
                          const exerciseName = musclesToShow.length > 1 ? item.exercise + ' (' + item.targetMuscle + ')' : item.exercise;
                          return (
                            <tr key={idx} className="border-b hover:bg-slate-50">
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
                  <tr className="bg-slate-50 font-bold">
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
        )}

        <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Program Analysis and Recommendations</h2>
          
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-blue-800">For V-Taper Development</h3>
              <p className="text-sm text-slate-700 mt-2">
                <strong>Key Muscles:</strong> Lats (width), Side Delts (width), Rear Delts (thickness), Upper Chest (fill-out)
              </p>
              <p className="text-sm text-slate-700 mt-1">
                <strong>Current Status:</strong> Side Delts ({volumeByMuscle['Side Delts']?.toFixed(1) || 0} sets) and Rear Delts ({volumeByMuscle['Rear Delts']?.toFixed(1) || 0} sets) are well-trained. 
                Lats at {volumeByMuscle['Lats']?.toFixed(1) || 0} sets could use 2-3 more sets for optimal width development. 
                Upper chest portion gets good work from incline pressing.
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold text-green-800">Strengths</h3>
              <p className="text-sm text-slate-700 mt-2">
                Good balance between compound and isolation work. Most major muscle groups trained at appropriate frequencies. Recovery time between muscle group sessions appears adequate.
              </p>
            </div>

            <div className="border-l-4 border-amber-500 pl-4">
              <h3 className="font-semibold text-amber-800">Areas for Optimization</h3>
              <p className="text-sm text-slate-700 mt-2">
                Consider adding 2-3 sets for lats (for V-taper goals). Check frequency view for muscles trained only 1x per week - these may benefit from increased frequency. 
                Volume per session should ideally stay under 10 sets per muscle to avoid excessive fatigue.
              </p>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-semibold text-purple-800">Recovery and Fatigue</h3>
              <p className="text-sm text-slate-700 mt-2">
                Total weekly volume of {totalVolume.toFixed(0)} sets. Monitor recovery between sessions. Most research suggests 48-72 hours between training the same muscle group for optimal growth.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-3">📊 How to Use This Dashboard</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p><strong>Overview:</strong> Quick insights panel shows action items. See major muscle groups with MEV/MAV/MRV reference lines. Click bars or boxes for exercise breakdown.</p>
            <p><strong>Muscle Volume:</strong> Detailed weekly volume for each muscle with reference lines. Click any bar to see which exercises contribute to that muscle's volume.</p>
            <p><strong>Volume Targets:</strong> Compare your volume against MEV (4 sets), MAV (10 sets), and MRV (20 sets) benchmarks. Click chart bars to highlight muscle categories.</p>
            <p><strong>Training Frequency:</strong> See how many days per week each muscle is trained. Aim for 2-3x optimal frequency. Click chart to highlight frequency groups.</p>
            <p><strong>Daily Split:</strong> Training load distribution across the week with compound/isolation balance. Click day cards or chart bars for exercise details.</p>
            <p><strong>Movement Patterns:</strong> Compound vs isolation split with drill-down into specific patterns (squat, push, pull, etc.). Click bars to see exercises.</p>
            <p><strong>Volume Heatmap:</strong> Visual matrix showing which muscles train on which days. Red cells indicate {'>'}10 sets/day violations. Click any muscle to see breakdown.</p>
            <p><strong>Balance Check:</strong> Radar chart comparing your volume to optimal targets across muscle groups. Switch between Push, Pull, Legs, and Core categories.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingVolumeDashboard;
