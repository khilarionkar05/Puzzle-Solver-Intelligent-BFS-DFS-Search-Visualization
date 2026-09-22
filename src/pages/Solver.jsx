import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import SectionTitle from '../components/common/SectionTitle';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import PuzzleBoard from '../components/puzzle/PuzzleBoard';
import { getGoalState } from '../puzzles/numericalPuzzle';

export default function Solver() {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve configuration from navigation state or sessionStorage
  const [config, setConfig] = useState(() => {
    if (location.state) {
      return location.state;
    }
    try {
      const saved = sessionStorage.getItem('puzzle_solver_config');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Unable to load from sessionStorage:', e);
    }
    return {
      puzzleType: 'numerical',
      gridSize: 3,
      algorithm: 'BFS',
      puzzleState: [6, 2, 3, 7, 0, 5, 8, 1, 4],
      moves: 0,
      imageTilesMap: null,
    };
  });

  const algorithm = config.algorithm || 'BFS';
  const gridSize = config.gridSize || 3;
  const puzzleType = config.puzzleType || 'numerical';
  const puzzleState = config.puzzleState || getGoalState(gridSize);
  const imageTilesMap = config.imageTilesMap || null;

  // Visual Solver UI states (Execution engine in progress)
  const [solverStatus, setSolverStatus] = useState('READY');
  const [statesExplored, setStatesExplored] = useState(0);
  const [depth, setDepth] = useState(0);
  const [currentMoves, setCurrentMoves] = useState(config.moves || 0);

  const handleStart = () => {
    setSolverStatus('RUNNING');
  };

  const handlePause = () => {
    setSolverStatus('PAUSED');
  };

  const handleReset = () => {
    setSolverStatus('READY');
    setStatesExplored(0);
    setDepth(0);
    setCurrentMoves(0);
  };

  return (
    <PageContainer>
      <SectionTitle
        tag="DAA Visualization"
        title={`${algorithm.toUpperCase()} SOLVER`}
        subtitle="Visualizing state space tree exploration using search algorithms."
      />

      <div className="puzzle-layout">
        {/* LEFT: Current Puzzle Board State */}
        <section className="puzzle-board-container">
          <div className="board-header">
            <h2 className="board-title">Initial State</h2>
            <div
              className={`status-indicator ${
                solverStatus === 'RUNNING'
                  ? 'status-running'
                  : solverStatus === 'PAUSED'
                  ? 'status-ready'
                  : 'status-ready'
              }`}
            >
              ● {solverStatus}
            </div>
          </div>

          <PuzzleBoard
            tiles={puzzleState}
            gridSize={gridSize}
            puzzleType={puzzleType}
            imageTilesMap={imageTilesMap}
          />

          <div style={{ width: '100%', maxWidth: '440px', display: 'flex', gap: 'var(--space-2)' }}>
            <Button
              variant="outline"
              size="md"
              fullWidth
              onClick={() => navigate('/puzzle')}
            >
              ← Back to Setup
            </Button>
          </div>
        </section>

        {/* RIGHT: Search Information & Controls */}
        <aside className="controls-panel">
          <Card title="SEARCH METRICS" icon="📊">
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-label">Algorithm</div>
                <div className="metric-value" style={{ fontSize: '1.25rem' }}>
                  {algorithm.toUpperCase()}
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-label">States Explored</div>
                <div className="metric-value">{statesExplored}</div>
              </div>

              <div className="metric-card">
                <div className="metric-label">Search Depth</div>
                <div className="metric-value">{depth}</div>
              </div>

              <div className="metric-card">
                <div className="metric-label">Setup Moves</div>
                <div className="metric-value">{currentMoves}</div>
              </div>
            </div>
          </Card>

          <Card title="SOLVER CONTROLS" icon="⚡">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'var(--space-2)',
                marginBottom: 'var(--space-3)',
              }}
            >
              <Button
                variant="primary"
                onClick={handleStart}
                disabled={solverStatus === 'RUNNING'}
              >
                ▶ START
              </Button>
              <Button
                variant="secondary"
                onClick={handlePause}
                disabled={solverStatus !== 'RUNNING'}
              >
                ⏸ PAUSE
              </Button>
            </div>
            <Button variant="outline" fullWidth onClick={handleReset}>
              🔄 RESET
            </Button>
          </Card>

          <Card title="DATA STRUCTURE" icon="📦">
            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
              {algorithm.toUpperCase() === 'BFS' ? (
                <p>
                  <strong>Queue (FIFO):</strong> Explores shallowest unexplored node first to guarantee the shortest path solution.
                </p>
              ) : (
                <p>
                  <strong>Stack (LIFO):</strong> Explores deepest unexplored node first with minimal memory overhead.
                </p>
              )}
            </div>
          </Card>

          {/* Quick link to result page preview */}
          <Link to="/result" style={{ width: '100%' }}>
            <Button variant="outline" fullWidth>
              🏁 View Result Page Preview
            </Button>
          </Link>
        </aside>
      </div>
    </PageContainer>
  );
}
