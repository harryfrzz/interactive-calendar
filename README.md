# Interactive Realistic Calendar

A visually rich, physics-based calendar app with realistic page-flip animations, sticky notes, task management, and date range selection.

## Features

- **Physics-based page flip** - Pull down/up to flip through months with realistic spring physics
- **Sticky notes** - Add notes to each month (draggable positioning)
- **Date range selection** - Click to select start and end dates
- **Day & Range notes** - Add notes to specific dates or entire date ranges
- **Task management** - Create tasks with color-coded labels
- **Events** - Add events to any date
- **Background patterns** - Choose from dots, grid, lines, or crosses
- **Month/Year picker** - Jump to any month or year

## Tech Stack

- **Next.js**
- **Framer Motion** - All animations including the page flip physics
- **Local Storage** - All data persists in browser (notes, tasks, events, etc.)
- **Tailwind CSS** - Styling

## How to Run Locally

```bash
# Clone the repository
git clone https://github.com/harryfrzz/interactive-calendar.git

# Navigate to the project directory
cd interactive-calendar

# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:3000 in your browser.

## LocalStorage

The app saves everything to browser localStorage:
- `calendar-notes` - Monthly sticky notes
- `calendar-date-notes` - Day-specific notes
- `calendar-range-notes` - Date range notes
- `calendar-events` - Events per date
- `calendar-tasks` - Task list
- `calendar-note-positions` - Sticky note positions

Clear your browser cache or localStorage to reset all data.

## About the Animation

The flip animation uses Framer Motion's `useSpring` hook to create physics-based spring animations. When you drag on the calendar page, it tracks the drag motion and applies spring physics for a realistic, bouncy flip effect.