# Training Volume Dashboard

A comprehensive React-based dashboard for analyzing and visualizing training volume by muscle group, movement pattern, and exercise type. Built with React, TypeScript, Vite, Recharts, and Tailwind CSS.

## Overview

This dashboard helps athletes, coaches, and fitness enthusiasts analyze their training programs to ensure optimal volume distribution across muscle groups. It provides deep insights into training frequency, volume landmarks (MEV/MAV/MRV), compound vs isolation balance, and identifies potential weak points and recovery issues.

## Features

### Program Analysis

- **Program Score (A-F)**: Automatically grades your training program based on 4 weighted dimensions:
  - Volume Targets (40 pts): % of muscles within MEV-MRV range
  - Training Frequency (30 pts): % of muscles trained 2-3×/week
  - Compound/Isolation Balance (20 pts): Compound sets as 40-70% of total
  - Session Volume Cap (10 pts): No muscles exceeding 10 sets/day

- **Executive Summary**: At-a-glance view with 4 key sections:
  - **Strengths**: What's working well in your program
  - **Needs Attention**: Issues that may limit progress (low volume, low frequency, cap violations)
  - **Recovery & Fatigue**: Weekly load signals and deload recommendations
  - **Program Structure**: Movement pattern coverage and volume distribution

- **CSV Upload**: Import custom training programs with 8 required columns
- **Program Filtering**: Switch between multiple programs in your CSV
- **Dark Mode**: Toggle between light and dark themes for comfortable viewing
- **Interactive Tooltips**: Contextual help on every metric and chart element

### Dashboard Tabs

The dashboard is organized into 5 main views:

#### 1. Overview
- Executive Summary with actionable insights
- Weekly volume bar chart by major muscle groups (Shoulders, Chest, Back, Legs, Biceps, Triceps, Other)
- Color-coded compound vs isolation stacking
- Click any bar to drill down into exercise breakdown

#### 2. Volume Detail
- Detailed vertical bar chart of weekly volume by individual muscle
- Reference lines for MEV (4), MAV (10), and MRV (20) landmarks
- **Muscle Readiness Scorecard** table with sortable columns:
  - **WPI (Weak Point Index)**: Composite 0-100 score combining volume (60%) + frequency (40%)
  - **SFR% (Stimulus-to-Fatigue Ratio)**: % of volume from isolation exercises
  - Volume (sets), Frequency (×/week), Isolation sets
- Visual progress bars for WPI and SFR% with color coding

#### 3. Targets & Frequency
- **Frequency Distribution Chart**: Bar chart showing muscles at 1×, 2×, 3×, 4+× per week
- **Frequency Buckets**: Four color-coded cards:
  - Low (1×/wk) - amber
  - Optimal (2×/wk) - emerald
  - Optimal (3×/wk) - emerald
  - High (4+×/wk) - violet
- **Volume Landmarks Chart**: Distribution of muscles below MEV, in MEV-MAV, in MAV-MRV, above MRV
- **Volume Status Cards**: Four buckets with individual muscle volume bars
- **Volume Insights**: Automated text analysis of volume status and session cap compliance

#### 4. Program Structure
- **Daily Volume Distribution**: Stacked bar chart of compound vs isolation by day
- **Weekly Insight**: Automated analysis of compound/isolation ratio and day-to-day balance
- **Movement Patterns**:
  - Summary bar chart (Compound vs Isolation)
  - Detailed breakdown by pattern (Horizontal Push, Vertical Pull, Squat Variations, etc.)
  - Pattern colors for easy identification
- **Volume Distribution Heatmap**:
  - Rows: Individual muscles (sorted by volume)
  - Columns: Training days
  - Cells: Volume intensity with color gradient (indigo = higher, red = cap exceeded)
  - Summary columns: Total weekly volume and training frequency
- **Heatmap Insights**: Alerts for session cap violations and back-to-back training

#### 5. Balance Check
- **Radar Charts**: Four muscle group views with volume vs optimal (MAV=10)
  - Push Muscles: Chest, Front Delts, Side Delts, Triceps
  - Pull Muscles: Lats, Scapular Retractors, Scapular Depressors, Rear Delts, Biceps
  - Leg Muscles: Quads, Glutes, Hams
  - Core & Misc: Abs, Erectors, Forearms, Scapular Elevators
- **Push:Pull Ratio**: Three-card display with ratio calculation
  - Push volume, Pull volume, Ratio (push÷pull)
  - Visual split bar showing percentage distribution
  - Status indicator: Balanced, Push-heavy, or Pull-heavy

### Key Stats Dashboard

Six stat cards at the top of the dashboard:

1. **Program Score** (0-100 with letter grade A-F)
2. **Total Sets (Raw)**: Actual sets performed per week
3. **Muscle-Weighted Sets**: Volume redistributed across all targeted muscles
4. **Compound Sets**: Raw compound sets with percentage
5. **Isolation Sets**: Raw isolation sets with percentage
6. **Training Days**: Number of sessions per week with avg sets/day

### Volume Calculation Methods

Three methods for attributing sets to muscles:

- **Fractional (Default)**: Primary muscles split 1 set equally; secondary muscles each get 0.5 sets
- **Direct Sets Only**: Only primary muscles counted, full sets each
- **All Sets Equal**: Every targeted muscle gets the full set count

### Advanced Analytics

- **Weak Point Index (WPI)**: Identifies underdeveloped muscles using formula:
  - Volume Score (0-100): Scales from 0 sets to MAV (10 sets)
  - Frequency Score: 0 (untrained), 35 (1×/wk), 100 (2-3×/wk), 70 (4+×/wk)
  - Combined: Volume×0.6 + Frequency×0.4
  
- **Stimulus-to-Fatigue Ratio (SFR%)**: Isolation percentage indicating targeted stimulus efficiency
  - <40%: Mostly compound-sourced
  - 40-69%: Reasonable mix
  - ≥70%: Isolation-dominant

- **Push:Pull Ratio**: Balance between push (Chest, Front Delts, Side Delts, Triceps) and pull (Lats, Scapular Retractors, Scapular Depressors, Rear Delts, Biceps) muscles

- **Volume Cap Detection**: Flags when any muscle exceeds 10 sets in a single session

- **Back-to-Back Training Alerts**: Warns when muscles are trained on consecutive days

### Exercise Breakdown Modal

Click any chart element to open a detailed modal showing:
- Exercise name
- Training day
- Role (Primary/Secondary) with color-coded badges
- Type (Compound/Isolation)
- Sets (muscle-weighted)
- Sorting options: By Day or Compound First
- Total volume for the selected muscle/group

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/bahaeomid/training-volume-dashboard.git
cd training-volume-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## CSV Data Format

To upload your own training program, create a CSV file with the following headers:

```csv
Exercise,Day,Sets,Primary_Target_Muscle,Secondary_Target_Muscle,Movement_Pattern,Movement_Type,Program
Bench Press,Day 1,3,"Chest,Front Delts","Triceps","Horizontal Push","Compound","4-day Split"
```

### Required CSV Headers
- `Exercise`: Name of the exercise
- `Day`: Training day (e.g., "Day 1", "Day 2")
- `Sets`: Number of sets performed
- `Primary_Target_Muscle`: Primary muscle(s) targeted (comma-separated)
- `Secondary_Target_Muscle`: Secondary muscle(s) involved (comma-separated)
- `Movement_Pattern`: Type of movement (e.g., "Horizontal Push", "Vertical Pull", "Squat Variations", "Hip Hinge")
- `Movement_Type`: Either "Compound" or "Isolation"
- `Program`: Program name (optional, for filtering)

### Movement Pattern Reference
- Horizontal Push (e.g., Bench Press, Incline Press)
- Horizontal Pull (e.g., Rows, Face Pulls)
- Vertical Push (e.g., Overhead Press)
- Vertical Pull (e.g., Pullups, Lat Pulldowns)
- Squat Variations (e.g., Back Squats, Leg Press)
- Hip Hinge (e.g., Deadlifts, Good Mornings)
- Isolation Exercise (e.g., Curls, Extensions, Raises)

## Volume Landmarks Reference

| Landmark | Sets/Week | Description |
|----------|-----------|-------------|
| MEV | ~4 | Minimum Effective Volume - minimum needed for any growth stimulus |
| MAV | ~10 | Maximum Adaptive Volume - optimal range for most people most of the time |
| MRV | ~20 | Maximum Recoverable Volume - upper limit before recovery is compromised |

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Recharts** - Composable charting library (Bar, Radar, ReferenceLine)
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library (optional)

## Project Structure

```
training-volume-dashboard/
├── src/
│   ├── App.tsx                 # Main app wrapper
│   ├── main.tsx               # React entry point
│   ├── TrainingVolumeDashboard.tsx  # Main dashboard component (~2000 lines)
│   ├── index.css              # Global styles with Tailwind directives
│   └── vite-env.d.ts          # Vite type definitions
├── index.html                 # HTML entry point
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── vite.config.ts             # Vite build configuration
├── tailwind.config.js         # Tailwind theme customization
├── postcss.config.js          # PostCSS configuration
└── README.md                  # This file
```

## Color Scheme

The dashboard uses a consistent color palette throughout:

- **Compound**: Indigo (#6366f1)
- **Isolation**: Teal (#14b8a6)
- **Below MEV**: Rose (#f43f5e)
- **MEV-MAV**: Emerald (#10b981)
- **MAV-MRV**: Emerald Dark (#059669)
- **Above MRV**: Orange (#f97316)
- **Low Frequency (1×)**: Amber (#f59e0b)
- **Optimal Frequency (2-3×)**: Emerald (#10b981)
- **High Frequency (4+×)**: Violet (#8b5cf6)

## Score Color Coding

- **Red (<40)**: Underdeveloped / needs attention
- **Amber (40-69)**: Adequate
- **Green (≥70)**: Well-trained / optimal

## License

MIT License - see LICENSE file for details

## Credits

Built with insights from exercise science research and frameworks including Eric Helms' Muscle and Strength Training Pyramid.
