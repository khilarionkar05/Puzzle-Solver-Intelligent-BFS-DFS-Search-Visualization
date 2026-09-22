import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import PuzzleBoard from '../components/puzzle/PuzzleBoard';
import { getGoalState } from '../puzzles/numericalPuzzle.js';
import { formatTime, formatNumber } from '../utils/performanceUtils.js';

export default function Result() {
  const location = useLocation();

  // Retrieve solver result data from navigation state or sessionStorage
  const [resultData] = useState(() => {
    if (location.state && location.state.solved !== undefined) {
      return location.state;
    }
    try {
      const saved = sessionStorage.getItem('puzzle_solver_result');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Unable to load result from sessionStorage:', e);
    }
    return null;
  });

  const gridSize = resultData?.gridSize || 3;
  const algorithm = (resultData?.algorithm || 'BFS').toUpperCase();
  const moves = resultData?.solutionDepth !== undefined ? resultData.solutionDepth : (resultData?.solutionPath?.length ? resultData.solutionPath.length - 1 : 0);
  const solvedTiles = getGoalState(gridSize);

  const bfsMetrics =
    algorithm === 'BFS' && resultData
      ? {
          states: formatNumber(resultData.statesExplored),
          moves: resultData.solutionDepth,
          time: formatTime(resultData.executionTime),
        }
      : { states: '--', moves: '--', time: '--' };

  const dfsMetrics =
    algorithm === 'DFS' && resultData
      ? {
          states: formatNumber(resultData.statesExplored),
          moves: resultData.solutionDepth,
          time: formatTime(resultData.executionTime),
        }
      : { states: '--', moves: '--', time: '--' };

  return (
    <PageContainer>
      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        {/* Solved Header Banner */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: 'var(--space-2)' }}>
            <span className="badge badge-green">Goal Reached</span>
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', color: 'var(--color-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            PUZZLE SOLVED <span style={{ color: 'var(--color-success)' }}>✓</span>
          </h1>
          <p style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-text-muted)' }}>
            Solved in <span style={{ color: 'var(--color-text)' }}>{moves} {moves === 1 ? 'move' : 'moves'}</span> via <span className="badge badge-yellow" style={{ fontSize: '0.9rem' }}>{algorithm}</span>
          </p>
        </div>

        {/* Solved Board Display */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: gridSize === 4 ? '420px' : '360px' }}>
            <PuzzleBoard
              tiles={solvedTiles}
              gridSize={gridSize}
              puzzleType={resultData?.puzzleType || 'numerical'}
              imageTilesMap={resultData?.puzzleType === 'image' ? resultData?.imageTilesMap : null}
            />
          </div>
        </div>

        {/* Performance Comparison Section */}
        <Card title="PERFORMANCE ANALYSIS" icon="📈">
          <p style={{ fontSize: '0.9rem', marginBottom: 'var(--space-3)' }}>
            Empirical search metrics recorded by the {algorithm} solver algorithm for this puzzle instance.
          </p>
          <div className="comparison-table-wrapper">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>BFS (Breadth-First)</th>
                  <th>DFS (Depth-First)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>States Explored</td>
                  <td>{bfsMetrics.states}</td>
                  <td>{dfsMetrics.states}</td>
                </tr>
                <tr>
                  <td>Solution Moves</td>
                  <td>{bfsMetrics.moves}</td>
                  <td>{dfsMetrics.moves}</td>
                </tr>
                <tr>
                  <td>Execution Time</td>
                  <td>{bfsMetrics.time}</td>
                  <td>{dfsMetrics.time}</td>
                </tr>
                <tr>
                  <td>Optimality</td>
                  <td>Guaranteed Shortest</td>
                  <td>Branch Deep Search</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* Action Button */}
        <div style={{ textAlign: 'center', marginTop: 'var(--space-2)' }}>
          <Link to="/puzzle">
            <Button variant="primary" size="lg">
              🔄 SOLVE ANOTHER PUZZLE
            </Button>
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}
