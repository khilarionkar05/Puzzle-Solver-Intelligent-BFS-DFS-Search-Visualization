import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import SectionTitle from '../components/common/SectionTitle';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import PuzzleBoard from '../components/puzzle/PuzzleBoard';
import { getGoalState } from '../puzzles/numericalPuzzle.js';
import { solveBFS } from '../algorithms/bfs.js';
import { solveDFS } from '../algorithms/dfs.js';
import { formatTime, formatNumber } from '../utils/performanceUtils.js';

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve solver result data from navigation state or sessionStorage
  const [resultData] = useState(() => {
    if (location.state && location.state.solved !== undefined) {
      return location.state;
    }
    try {
      const saved = sessionStorage.getItem('puzzle_solver_result');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.solved !== undefined) return parsed;
      }
    } catch (e) {
      console.warn('Unable to load result from sessionStorage:', e);
    }
    return null;
  });

  // Dual Benchmark comparison state
  const [comparisonData, setComparisonData] = useState(null);
  const [isComparing, setIsComparing] = useState(false);

  // If no result is available, render clean fallback state
  if (!resultData) {
    return (
      <PageContainer>
        <div style={{ maxWidth: '600px', margin: 'var(--space-8) auto', textAlign: 'center' }}>
          <SectionTitle
            tag="Performance Report"
            title="NO RESULT AVAILABLE"
            subtitle="No solver execution data was found. Please configure and solve a puzzle first."
          />
          <Card style={{ marginTop: 'var(--space-4)' }}>
            <p style={{ marginBottom: 'var(--space-4)', fontSize: '1rem' }}>
              Select a puzzle and run the BFS or DFS search algorithm to generate empirical performance metrics.
            </p>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => navigate('/puzzle')}
            >
              🧩 GO TO PUZZLE SETUP
            </Button>
          </Card>
        </div>
      </PageContainer>
    );
  }

  const {
    algorithm = 'BFS',
    puzzleType = 'numerical',
    gridSize = 3,
    initialState,
    solutionPath = [],
    solutionDepth = 0,
    statesExplored = 0,
    nodesGenerated = 0,
    executionTime = 0,
    solved = false,
    terminationReason = 'search_limit',
    imageTilesMap = null,
  } = resultData;

  const normalizedAlgo = algorithm.toUpperCase();
  const movesCount = solved ? solutionDepth : 0;
  const goalState = getGoalState(gridSize);

  // Solved final board display state
  const finalBoardState =
    solved && solutionPath.length > 0
      ? solutionPath[solutionPath.length - 1]
      : goalState;

  // Run side-by-side benchmark comparison on the exact same initial puzzle state
  const handleRunComparison = () => {
    if (!initialState) return;

    setIsComparing(true);
    setTimeout(() => {
      try {
        const bfsRes = solveBFS(initialState, goalState, gridSize);
        const maxDfsDepth = gridSize === 4 ? 40 : 35;
        const dfsRes = solveDFS(initialState, goalState, gridSize, maxDfsDepth);

        setComparisonData({
          bfs: bfsRes,
          dfs: dfsRes,
        });
      } catch (err) {
        console.error('Benchmark execution error:', err);
      } finally {
        setIsComparing(false);
      }
    }, 50);
  };

  // Navigate back to Solver with existing solution path for step playback
  const handleViewSolutionSteps = () => {
    navigate('/solver', {
      state: {
        algorithm: normalizedAlgo,
        puzzleType,
        gridSize,
        puzzleState: initialState,
        imageTilesMap,
      },
    });
  };

  // Navigate back to Puzzle setup
  const handleSolveAnotherPuzzle = () => {
    try {
      sessionStorage.removeItem('puzzle_solver_result');
    } catch (e) {
      console.warn('Unable to clear sessionStorage:', e);
    }
    navigate('/puzzle');
  };

  // Compile metrics for display
  const bfsMetrics = comparisonData
    ? {
        states: formatNumber(comparisonData.bfs.statesExplored),
        nodes: formatNumber(comparisonData.bfs.nodesGenerated),
        moves: comparisonData.bfs.solved ? comparisonData.bfs.solutionDepth : comparisonData.bfs.terminationReason === 'search_limit' ? 'Search Limit' : 'No Solution',
        time: formatTime(comparisonData.bfs.executionTime),
        status: comparisonData.bfs.solved ? 'Solved ✓' : comparisonData.bfs.terminationReason === 'search_limit' ? 'Search Limit ✗' : 'Unsolvable ✗',
      }
    : normalizedAlgo === 'BFS'
    ? {
        states: formatNumber(statesExplored),
        nodes: formatNumber(nodesGenerated),
        moves: solved ? movesCount : terminationReason === 'search_limit' ? 'Search Limit' : 'No Solution',
        time: formatTime(executionTime),
        status: solved ? 'Solved ✓' : terminationReason === 'search_limit' ? 'Search Limit ✗' : 'Unsolvable ✗',
      }
    : {
        states: 'Not Run',
        nodes: 'Not Run',
        moves: 'Not Run',
        time: 'Not Run',
        status: 'Not Run',
      };

  const dfsMetrics = comparisonData
    ? {
        states: formatNumber(comparisonData.dfs.statesExplored),
        nodes: formatNumber(comparisonData.dfs.nodesGenerated),
        moves: comparisonData.dfs.solved ? comparisonData.dfs.solutionDepth : comparisonData.dfs.terminationReason === 'search_limit' ? 'Search Limit' : 'No Solution',
        time: formatTime(comparisonData.dfs.executionTime),
        status: comparisonData.dfs.solved ? 'Solved ✓' : comparisonData.dfs.terminationReason === 'search_limit' ? 'Search Limit ✗' : 'Unsolvable ✗',
      }
    : normalizedAlgo === 'DFS'
    ? {
        states: formatNumber(statesExplored),
        nodes: formatNumber(nodesGenerated),
        moves: solved ? movesCount : terminationReason === 'search_limit' ? 'Search Limit' : 'No Solution',
        time: formatTime(executionTime),
        status: solved ? 'Solved ✓' : terminationReason === 'search_limit' ? 'Search Limit ✗' : 'Unsolvable ✗',
      }
    : {
        states: 'Not Run',
        nodes: 'Not Run',
        moves: 'Not Run',
        time: 'Not Run',
        status: 'Not Run',
      };

  const puzzleTypeLabel = puzzleType === 'image' ? 'Image Puzzle' : 'Numerical Puzzle';

  return (
    <PageContainer>
      <div style={{ maxWidth: '840px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        {/* Result Header Banner */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: 'var(--space-2)' }}>
            <span className={`badge ${solved ? 'badge-green' : 'badge-yellow'}`}>
              {solved ? 'Goal State Reached' : 'Search Concluded'}
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              color: 'var(--color-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            {solved ? (
              <>
                PUZZLE SOLVED <span style={{ color: 'var(--color-success)' }}>✓</span>
              </>
            ) : terminationReason === 'search_limit' ? (
              <>
                SEARCH LIMIT REACHED <span style={{ color: 'var(--color-warning)' }}>⚠</span>
              </>
            ) : (
              <>
                UNSOLVABLE <span style={{ color: 'var(--color-danger)' }}>✗</span>
              </>
            )}
          </h1>

          <p style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--color-text-muted)' }}>
            {solved ? (
              <>
                Solved in <span style={{ color: 'var(--color-text)' }}>{movesCount} {movesCount === 1 ? 'move' : 'moves'}</span> via{' '}
                <span className="badge badge-yellow" style={{ fontSize: '0.85rem' }}>
                  {normalizedAlgo}
                </span>{' '}
                ({puzzleTypeLabel}, {gridSize}×{gridSize})
              </>
            ) : (
              <>
                Search terminated without reaching goal state via{' '}
                <span className="badge badge-yellow" style={{ fontSize: '0.85rem' }}>
                  {normalizedAlgo}
                </span>
              </>
            )}
          </p>
        </div>

        {/* Solved Board Display */}
        {solved && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: gridSize === 4 ? '400px' : '340px' }}>
              <PuzzleBoard
                tiles={finalBoardState}
                gridSize={gridSize}
                puzzleType={puzzleType}
                imageTilesMap={imageTilesMap}
              />
            </div>
          </div>
        )}

        {/* Empirical Performance Analysis Section */}
        <Card title="EMPIRICAL PERFORMANCE ANALYSIS" icon="📈">
          <p style={{ fontSize: '0.9rem', marginBottom: 'var(--space-3)', color: 'var(--color-text-muted)' }}>
            Real metrics recorded during search tree exploration on the exact initial puzzle permutation.
          </p>

          <div className="comparison-table-wrapper">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Performance Metric</th>
                  <th>BFS (Breadth-First)</th>
                  <th>DFS (Depth-First)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Search Status</strong></td>
                  <td>{bfsMetrics.status}</td>
                  <td>{dfsMetrics.status}</td>
                </tr>
                <tr>
                  <td><strong>States Explored</strong></td>
                  <td>{bfsMetrics.states}</td>
                  <td>{dfsMetrics.states}</td>
                </tr>
                <tr>
                  <td><strong>Nodes Generated</strong></td>
                  <td>{bfsMetrics.nodes}</td>
                  <td>{dfsMetrics.nodes}</td>
                </tr>
                <tr>
                  <td><strong>Solution Moves (Depth)</strong></td>
                  <td>{bfsMetrics.moves}</td>
                  <td>{dfsMetrics.moves}</td>
                </tr>
                <tr>
                  <td><strong>Execution Time</strong></td>
                  <td>{bfsMetrics.time}</td>
                  <td>{dfsMetrics.time}</td>
                </tr>
                <tr>
                  <td><strong>Optimality Guarantee</strong></td>
                  <td>Guaranteed Shortest Path</td>
                  <td>Non-Optimal (Branch Deep)</td>
                </tr>
                <tr>
                  <td><strong>Space Complexity</strong></td>
                  <td><code>O(b^d)</code> (High Memory)</td>
                  <td><code>O(b·m)</code> (Linear Memory)</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Compare BFS vs DFS button if comparison hasn't been triggered */}
          {!comparisonData && initialState && (
            <div style={{ marginTop: 'var(--space-4)', textAlign: 'center' }}>
              <Button
                variant="secondary"
                size="md"
                onClick={handleRunComparison}
                disabled={isComparing}
              >
                {isComparing ? '⚙️ Running Dual Benchmark...' : '⚡ Run BFS vs DFS Benchmark on this Puzzle'}
              </Button>
            </div>
          )}
        </Card>

        {/* Navigation Action Buttons */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-3)',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginTop: 'var(--space-2)',
          }}
        >
          {solutionPath.length > 0 && (
            <Button
              variant="outline"
              size="lg"
              onClick={handleViewSolutionSteps}
            >
              🎬 VIEW SOLUTION STEPS
            </Button>
          )}

          <Button
            variant="primary"
            size="lg"
            onClick={handleSolveAnotherPuzzle}
          >
            🔄 SOLVE ANOTHER PUZZLE
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
