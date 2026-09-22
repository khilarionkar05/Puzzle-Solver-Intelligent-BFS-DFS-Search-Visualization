import React from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import PuzzleBoard from '../components/puzzle/PuzzleBoard';

export default function Result() {
  // Solved 3x3 goal state
  const solvedTiles = [1, 2, 3, 4, 5, 6, 7, 8, 0];

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
            Solved in <span style={{ color: 'var(--color-text)' }}>0 moves</span>
          </p>
        </div>

        {/* Solved Board Display */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: '360px' }}>
            <PuzzleBoard tiles={solvedTiles} gridSize={3} />
          </div>
        </div>

        {/* Performance Comparison Section */}
        <Card title="PERFORMANCE COMPARISON (BFS vs DFS)" icon="📈">
          <p style={{ fontSize: '0.9rem', marginBottom: 'var(--space-3)' }}>
            Empirical benchmark metrics between Breadth-First Search and Depth-First Search for this puzzle state.
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
                  <td>--</td>
                  <td>--</td>
                </tr>
                <tr>
                  <td>Solution Moves</td>
                  <td>--</td>
                  <td>--</td>
                </tr>
                <tr>
                  <td>Execution Time</td>
                  <td>--</td>
                  <td>--</td>
                </tr>
                <tr>
                  <td>Optimality</td>
                  <td>Guaranteed Shortest</td>
                  <td>Non-Optimal</td>
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
