# Puzzle Solver

**Intelligent Puzzle Solver Using BFS / DFS**

## Project Type
DAA Mini Project (Design and Analysis of Algorithms)

## Technologies
- **React** (v18.3)
- **Vite**
- **JavaScript** (ESModules)
- **CSS** (Vanilla Modern Neo-Brutalist Design System)
- **React Router** (v6)

## Features
- **Numerical Puzzle (8-Puzzle / 15-Puzzle)** — *[UI Foundation Complete / State Logic in Progress]*
- **Image Puzzle** — *[UI Foundation Complete / Slicing & Processing in Progress]*
- **Breadth-First Search (BFS)** — *[Implementation in progress]*
- **Depth-First Search (DFS)** — *[Implementation in progress]*
- **Solution Visualization** — *[UI Structure Ready / Step Animation in Progress]*
- **Performance Analysis (BFS vs DFS)** — *[UI Structure Ready / Benchmark Engine in Progress]*

---

## Project Structure

```
puzzle-solver/
│
├── public/
│   └── assets/
│
├── src/
│   ├── assets/
│   │   ├── images/
│   │   └── icons/
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.jsx
│   │   │   └── PageContainer.jsx
│   │   │
│   │   ├── common/
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   └── SectionTitle.jsx
│   │   │
│   │   └── puzzle/
│   │       ├── PuzzleBoard.jsx
│   │       ├── PuzzleTile.jsx
│   │       ├── PuzzleControls.jsx
│   │       ├── PuzzleTypeSelector.jsx
│   │       ├── GridSelector.jsx
│   │       ├── AlgorithmSelector.jsx
│   │       └── ImageUploader.jsx
│   │
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Puzzle.jsx
│   │   ├── Solver.jsx
│   │   ├── Result.jsx
│   │   └── HowItWorks.jsx
│   │
│   ├── algorithms/
│   │   ├── bfs.js
│   │   └── dfs.js
│   │
│   ├── puzzles/
│   │   ├── numericalPuzzle.js
│   │   └── imagePuzzle.js
│   │
│   ├── utils/
│   │   ├── puzzleUtils.js
│   │   └── performanceUtils.js
│   │
│   ├── styles/
│   │   ├── global.css
│   │   ├── variables.css
│   │   └── puzzle.css
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## How to Run

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

---

## Next Implementation Steps

1. Implement BFS queue-based search algorithm in `src/algorithms/bfs.js`.
2. Implement DFS stack-based search algorithm with depth limits in `src/algorithms/dfs.js`.
3. Implement sliding tile state transitions, valid move generators, and inversion-based solvability checker in `src/puzzles/numericalPuzzle.js` & `src/utils/puzzleUtils.js`.
4. Connect interactive board moves and solver animation controls on `/puzzle` and `/solver` pages.
5. Implement canvas slicing for custom uploaded image puzzles in `src/puzzles/imagePuzzle.js`.
6. Compute empirical benchmark metrics (States explored, Execution time, Path length) on `/result`.
