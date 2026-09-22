import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import SectionTitle from '../components/common/SectionTitle';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import PuzzleBoard from '../components/puzzle/PuzzleBoard';

export default function Solver() {
  const location = useLocation();
  const algorithm = location.state?.algorithm || 'BFS';
  const gridSize = location.state?.gridSize || 3;

  // Placeholder UI state
  const [solverStatus, setSolverStatus] = useState('READY');
  const [statesExplored, setStatesExplored] = useState(0);
  const [depth, setDepth] = useState(0);
  const [moves, setMoves] = useState(0);

  const sample3x3 = [6, 2, 3, 7, 0, 5, 8, 1, 4];
  const sample4x4 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 0, 15];
  const currentTiles = gridSize === 4 ? sample4x4 : sample3x3;

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
    setMoves(0);
  };

  return (
    <PageContainer>
      <SectionTitle
        tag="DAA Visualization"
        title={`${algorithm} SOLVER`}
        subtitle="Visualizing state space tree exploration using search algorithms."
      />

      <div className="puzzle-layout">
        {/* LEFT: Puzzle Board */}
        <section className="puzzle-board-container">
          <div className="board-header">
            <h2 className="board-title">Current State</h2>
            <div className={`status-indicator ${solverStatus === 'RUNNING' ? 'status-running' : 'status-ready'}`}>
              ● {solverStatus}
            </div>
          </div>

          <PuzzleBoard
            tiles={currentTiles}
            gridSize={gridSize}
          />
        </section>

        {/* RIGHT: Search Information & Controls */}
        <aside className="controls-panel">
          <Card title="SEARCH METRICS" icon="📊">
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-label">Algorithm</div>
                <div className="metric-value" style={{ fontSize: '1.25rem' }}>{algorithm}</div>
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
                <div className="metric-label">Path Moves</div>
                <div className="metric-value">{moves}</div>
              </div>
            </div>
          </Card>

          <Card title="SOLVER CONTROLS" icon="⚡">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
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
            <Button
              variant="outline"
              fullWidth
              onClick={handleReset}
            >
              🔄 RESET
            </Button>
          </Card>

          <Card title="DATA STRUCTURE" icon="📦">
            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
              {algorithm === 'BFS' ? (
                <p><strong>Queue (FIFO):</strong> Explores shallowest unexplored node first to guarantee the shortest path solution.</p>
              ) : (
                <p><strong>Stack (LIFO):</strong> Explores deepest unexplored node first with minimal memory overhead.</p>
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
