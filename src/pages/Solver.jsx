import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import SectionTitle from '../components/common/SectionTitle';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import PuzzleBoard from '../components/puzzle/PuzzleBoard';
import { solveBFS } from '../algorithms/bfs.js';
import { solveDFS } from '../algorithms/dfs.js';
import { getGoalState } from '../puzzles/numericalPuzzle.js';
import { formatTime } from '../utils/performanceUtils.js';

export default function Solver() {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve configuration from navigation state or fallback to sessionStorage
  const [config] = useState(() => {
    if (location.state && location.state.puzzleState) {
      return location.state;
    }
    try {
      const saved = sessionStorage.getItem('puzzle_solver_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.puzzleState) return parsed;
      }
    } catch (e) {
      console.warn('Unable to load config from sessionStorage:', e);
    }
    return null;
  });

  const algorithm = (config?.algorithm || 'BFS').toUpperCase();
  const gridSize = config?.gridSize || 3;
  const puzzleType = config?.puzzleType || 'numerical';
  const initialPuzzleState = config?.puzzleState || null;
  const imageTilesMap = config?.imageTilesMap || null;

  // Solver Lifecycle States
  const [solverStatus, setSolverStatus] = useState('READY'); // READY | SOLVING | PAUSED | SOLVED | NO SOLUTION | ERROR
  const [solutionPath, setSolutionPath] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(400); // ms per step

  // Search Metric States
  const [statesExplored, setStatesExplored] = useState(0);
  const [nodesGenerated, setNodesGenerated] = useState(0);
  const [solutionDepth, setSolutionDepth] = useState(0);
  const [executionTime, setExecutionTime] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Timer ref for controlled playback
  const timerRef = useRef(null);

  // Controlled Step-by-Step Playback Loop
  useEffect(() => {
    if (isPlaying && solutionPath.length > 0) {
      timerRef.current = setTimeout(() => {
        setCurrentStep((prev) => {
          if (prev < solutionPath.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, playbackSpeed);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isPlaying, currentStep, solutionPath, playbackSpeed]);

  // Execute BFS / DFS Algorithm
  const handleStartSolver = () => {
    if (!initialPuzzleState) return;

    setIsPlaying(false);
    setSolverStatus('SOLVING');
    setErrorMessage('');

    // Small timeout to allow React to render "SOLVING" status
    setTimeout(() => {
      try {
        const goalState = getGoalState(gridSize);
        let result;

        if (algorithm === 'DFS') {
          // DFS with depth limit suited to grid size
          const maxDfsDepth = gridSize === 4 ? 40 : 35;
          result = solveDFS(initialPuzzleState, goalState, gridSize, maxDfsDepth);
        } else {
          // BFS optimal shortest path search
          result = solveBFS(initialPuzzleState, goalState, gridSize);
        }

        setStatesExplored(result.statesExplored);
        setNodesGenerated(result.nodesGenerated);
        setExecutionTime(result.executionTime);

        if (result.solved && result.solutionPath && result.solutionPath.length > 0) {
          setSolutionPath(result.solutionPath);
          setSolutionDepth(result.solutionDepth);
          setCurrentStep(0);
          setSolverStatus('SOLVED');
          setIsPlaying(true); // Automatically begin step playback
        } else {
          setSolutionPath([]);
          setSolutionDepth(0);
          setSolverStatus('NO SOLUTION');
          setErrorMessage(result.error || 'No solution found within search limits.');
        }
      } catch (err) {
        console.error('Solver engine error:', err);
        setSolverStatus('ERROR');
        setErrorMessage(err.message || 'An unexpected error occurred during search.');
      }
    }, 50);
  };

  // Step Controls
  const handleNextStep = () => {
    setIsPlaying(false);
    if (currentStep < solutionPath.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setIsPlaying(false);
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleTogglePlay = () => {
    if (solutionPath.length === 0) return;
    if (currentStep >= solutionPath.length - 1) {
      // If at end, restart from beginning
      setCurrentStep(0);
      setIsPlaying(true);
    } else {
      setIsPlaying((prev) => !prev);
    }
  };

  // Reset solver to initial state
  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsPlaying(false);
    setCurrentStep(0);
    setSolutionPath([]);
    setStatesExplored(0);
    setNodesGenerated(0);
    setSolutionDepth(0);
    setExecutionTime(null);
    setSolverStatus('READY');
    setErrorMessage('');
  };

  // Navigate to Result page with full benchmark and solution object
  const handleViewResult = () => {
    const resultPayload = {
      algorithm,
      puzzleType,
      gridSize,
      initialState: initialPuzzleState,
      solutionPath,
      solutionDepth,
      statesExplored,
      nodesGenerated,
      executionTime,
      solved: solverStatus === 'SOLVED',
    };

    try {
      sessionStorage.setItem('puzzle_solver_result', JSON.stringify(resultPayload));
    } catch (e) {
      console.warn('Unable to save result to sessionStorage:', e);
    }

    navigate('/result', { state: resultPayload });
  };

  // Fallback if no puzzle was passed
  if (!initialPuzzleState) {
    return (
      <PageContainer>
        <div style={{ maxWidth: '600px', margin: 'var(--space-8) auto', textAlign: 'center' }}>
          <SectionTitle
            tag="DAA Visualization"
            title="SOLVER ARENA"
            subtitle="No puzzle configuration found. Please select and set up a puzzle first."
          />
          <Card style={{ marginTop: 'var(--space-4)' }}>
            <p style={{ marginBottom: 'var(--space-4)', fontSize: '1rem' }}>
              Please configure an 8-Puzzle, 15-Puzzle, or Image Puzzle to visualize the search tree exploration.
            </p>
            <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/puzzle')}>
              🧩 GO TO PUZZLE SETUP
            </Button>
          </Card>
        </div>
      </PageContainer>
    );
  }

  // Determine active board state for rendering
  const activeTiles =
    solutionPath.length > 0 && solutionPath[currentStep]
      ? solutionPath[currentStep]
      : initialPuzzleState;

  const totalSteps = solutionPath.length > 0 ? solutionPath.length - 1 : 0;

  return (
    <PageContainer>
      <SectionTitle
        tag="DAA Visualization"
        title={`${algorithm} SOLVER`}
        subtitle="Visualizing state space tree exploration using search algorithms."
      />

      <div className="puzzle-layout">
        {/* LEFT COLUMN: Puzzle Board Display & Step Controls */}
        <section className="puzzle-board-container">
          <div className="board-header">
            <h2 className="board-title">
              {solutionPath.length > 0
                ? `STEP ${currentStep} / ${totalSteps}`
                : 'INITIAL STATE'}
            </h2>
            <div
              className={`status-indicator ${
                solverStatus === 'RUNNING' || solverStatus === 'SOLVING'
                  ? 'status-running'
                  : solverStatus === 'SOLVED'
                  ? 'status-success'
                  : solverStatus === 'NO SOLUTION' || solverStatus === 'ERROR'
                  ? 'status-error'
                  : solverStatus === 'PAUSED'
                  ? 'status-paused'
                  : 'status-ready'
              }`}
            >
              ● {solverStatus}
            </div>
          </div>

          {/* Puzzle Board Rendering */}
          <PuzzleBoard
            tiles={activeTiles}
            gridSize={gridSize}
            puzzleType={puzzleType}
            imageTilesMap={imageTilesMap}
          />

          {/* Error / No Solution Message */}
          {errorMessage && (
            <div className="puzzle-alert puzzle-alert-warning" style={{ width: '100%', maxWidth: '440px' }}>
              <span>⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Step-by-Step Playback Controls */}
          {solutionPath.length > 0 && (
            <div style={{ width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr', gap: 'var(--space-2)' }}>
                <Button
                  variant="outline"
                  onClick={handlePrevStep}
                  disabled={currentStep === 0 || isPlaying}
                  size="md"
                >
                  ◀ PREV
                </Button>
                <Button
                  variant={isPlaying ? 'secondary' : 'primary'}
                  onClick={handleTogglePlay}
                  size="md"
                >
                  {isPlaying ? '⏸ PAUSE' : currentStep >= totalSteps ? '🔄 REPLAY' : '▶ PLAY'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleNextStep}
                  disabled={currentStep >= totalSteps || isPlaying}
                  size="md"
                >
                  NEXT ▶
                </Button>
              </div>

              {/* Speed toggle bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', padding: '0 4px', color: 'var(--color-text-muted)' }}>
                <span>Speed:</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setPlaybackSpeed(700)}
                    style={{
                      border: '1.5px solid var(--color-border)',
                      borderRadius: '4px',
                      padding: '2px 8px',
                      cursor: 'pointer',
                      fontWeight: 700,
                      backgroundColor: playbackSpeed === 700 ? 'var(--color-secondary)' : '#fff',
                    }}
                  >
                    0.5x
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlaybackSpeed(400)}
                    style={{
                      border: '1.5px solid var(--color-border)',
                      borderRadius: '4px',
                      padding: '2px 8px',
                      cursor: 'pointer',
                      fontWeight: 700,
                      backgroundColor: playbackSpeed === 400 ? 'var(--color-secondary)' : '#fff',
                    }}
                  >
                    1x
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlaybackSpeed(180)}
                    style={{
                      border: '1.5px solid var(--color-border)',
                      borderRadius: '4px',
                      padding: '2px 8px',
                      cursor: 'pointer',
                      fontWeight: 700,
                      backgroundColor: playbackSpeed === 180 ? 'var(--color-secondary)' : '#fff',
                    }}
                  >
                    2x
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Navigation link back to setup */}
          <div style={{ width: '100%', maxWidth: '440px' }}>
            <Button
              variant="outline"
              size="md"
              fullWidth
              onClick={() => navigate('/puzzle')}
            >
              ← Back to Puzzle Setup
            </Button>
          </div>
        </section>

        {/* RIGHT COLUMN: Search Metrics, Execution & Theory */}
        <aside className="controls-panel">
          <Card title="SEARCH METRICS" icon="📊">
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-label">Algorithm</div>
                <div className="metric-value" style={{ fontSize: '1.25rem' }}>
                  {algorithm}
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-label">States Explored</div>
                <div className="metric-value">{statesExplored}</div>
              </div>

              <div className="metric-card">
                <div className="metric-label">Nodes Generated</div>
                <div className="metric-value">{nodesGenerated}</div>
              </div>

              <div className="metric-card">
                <div className="metric-label">Solution Depth</div>
                <div className="metric-value">{solutionDepth}</div>
              </div>

              <div className="metric-card">
                <div className="metric-label">Current Step</div>
                <div className="metric-value">
                  {solutionPath.length > 0 ? currentStep : 0}
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-label">Execution Time</div>
                <div className="metric-value" style={{ fontSize: '1.15rem' }}>
                  {formatTime(executionTime)}
                </div>
              </div>
            </div>
          </Card>

          <Card title="SOLVER CONTROLS" icon="⚡">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleStartSolver}
                disabled={solverStatus === 'SOLVING'}
              >
                {solverStatus === 'SOLVING' ? '⚙️ SOLVING...' : '▶ START SOLVER'}
              </Button>

              <Button
                variant="outline"
                fullWidth
                onClick={handleReset}
                disabled={solverStatus === 'SOLVING'}
              >
                🔄 RESET TO INITIAL
              </Button>
            </div>
          </Card>

          <Card title="DATA STRUCTURE & STRATEGY" icon="📦">
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
              {algorithm === 'BFS' ? (
                <div>
                  <p>
                    <strong>Queue (FIFO):</strong> Explores shallowest unexplored node first.
                  </p>
                  <p style={{ marginTop: 'var(--space-1)', fontSize: '0.8rem' }}>
                    <strong>Optimality:</strong> Guaranteed shortest path solution (<code>O(b^d)</code> space/time).
                  </p>
                </div>
              ) : (
                <div>
                  <p>
                    <strong>Stack (LIFO):</strong> Explores deepest unexplored branch first.
                  </p>
                  <p style={{ marginTop: 'var(--space-1)', fontSize: '0.8rem' }}>
                    <strong>Space:</strong> Linear memory overhead (<code>O(b · m)</code>).
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Quick link to result analysis page */}
          {solverStatus === 'SOLVED' && (
            <Button
              variant="success"
              size="lg"
              fullWidth
              onClick={handleViewResult}
            >
              🏁 VIEW PERFORMANCE RESULT
            </Button>
          )}
        </aside>
      </div>
    </PageContainer>
  );
}
