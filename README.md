# Training Volume Dashboard

A React-based dashboard for analyzing and visualizing training volume by muscle group, movement pattern, and exercise. Built with React, TypeScript, Vite, Recharts, and Tailwind CSS.

## Features

### Program Analysis
- **Program Score**: Automatically grades your training program (A-F) based on volume targets, training frequency, compound/isolation balance, and session volume caps
- **Executive Summary**: At-a-glance overview of program strengths, areas needing attention, recovery signals, and structural completeness
- **CSV Upload**: Import your own training program data from CSV files
- **Dark Mode**: Toggle between light and dark themes

### Dashboard Tabs
- **Overview**: High-level view with Executive Summary and weekly volume by major muscle groups
- **Volume Detail**: Detailed weekly volume breakdown with Muscle Readiness Scorecard (WPI + SFR%)
- **Targets & Frequency**: Training frequency analysis and Volume Landmarks (MEV/MAV/MRV) visualization
- **Program Structure**: Daily volume distribution, movement patterns, and volume heatmap
- **Balance Check**: Radar charts comparing volume against optimal targets by muscle group + Push:Pull ratio

### Key Stats
- **Program Score**: Composite score (0-100) with letter grade
- **Total Sets (Raw)**: Actual sets performed per week
- **Muscle-Weighted Sets**: Volume redistributed across all targeted muscles
- **Compound/Isolation Sets**: Raw counts and percentages
- **Training Days**: Number of sessions per week

### Volume Calculation Methods
- **Fractional**: Primary muscles get full sets, secondary muscles get 0.5 sets (default)
- **Direct Sets Only**: Only counts primary target muscles
- **All Sets Equal**: Counts full sets for both primary and secondary muscles

### Advanced Analytics
- **Weak Point Index (WPI)**: Composite score (0-100) combining volume (60%) and frequency (40%) to identify underdeveloped muscles
- **Stimulus-to-Fatigue Ratio (SFR%)**: Percentage of volume from isolation exercises - higher means more targeted stimulus with less systemic fatigue
- **Push:Pull Ratio**: Balance analysis between push and pull muscle groups
- **Volume Cap Detection**: Identifies when muscles exceed 10 sets/session (hypertrophy cap)
- **Back-to-Back Training Alerts**: Warns when muscles are trained on consecutive days

### Exercise Breakdown
- Click on any chart element or category to see detailed exercise breakdown
- View exercise details including sets, reps (when available), role (primary/secondary), and type (compound/isolation)
- Sortable by day or compound-first order

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/training-volume-dashboard.git
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
- `Movement_Pattern`: Type of movement (e.g., "Horizontal Push", "Vertical Pull")
- `Movement_Type`: Either "Compound" or "Isolation"
- `Program`: Program name (optional)

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Recharts** - Charting library
- **Tailwind CSS** - Styling

## Volume Landmarks Reference

| Landmark | Sets/Week | Description |
|----------|-----------|-------------|
| MEV | ~4 | Minimum Effective Volume - minimum needed for any growth |
| MAV | ~10 | Maximum Adaptive Volume - optimal range for most people |
| MRV | ~20 | Maximum Recoverable Volume - upper limit before overtraining |

## Project Structure

```
training-volume-dashboard/
├── src/
│   ├── App.tsx                 # Main app component
│   ├── main.tsx               # React entry point
│   ├── TrainingVolumeDashboard.tsx  # Main dashboard component
│   ├── index.css              # Global styles with Tailwind
│   └── vite-env.d.ts          # Vite type definitions
├── index.html                 # HTML entry point
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
├── vite.config.ts             # Vite config
├── tailwind.config.js         # Tailwind config
└── postcss.config.js          # PostCSS config
```

## License

MIT License - see LICENSE file for details
