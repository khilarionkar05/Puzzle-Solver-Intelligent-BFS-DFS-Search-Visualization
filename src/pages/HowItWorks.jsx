import React from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import SectionTitle from '../components/common/SectionTitle';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

export default function HowItWorks() {
  const steps = [
    { num: '01', title: 'Puzzle Setup', desc: 'Initial permutation of numerical or image tiles.' },
    { num: '02', title: 'Generate States', desc: 'Identify valid moves by sliding adjacent tiles into the empty space.' },
    { num: '03', title: 'BFS / DFS Search', desc: 'Traverse the state space tree using Queue (BFS) or Stack (DFS).' },
    { num: '04', title: 'Find Goal State', desc: 'Check if current state matches target sequence (1 to N-1, 0).' },
    { num: '05', title: 'Reconstruct Solution', desc: 'Trace back parent pointers to render animated moves.' },
  ];

  return (
    <PageContainer>
      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
        <SectionTitle
          tag="DAA Theory"
          title="HOW IT WORKS"
          subtitle="Understanding uninformed search strategies for sliding tile puzzle state spaces."
        />

        {/* Workflow Diagram */}
        <Card title="SEARCH & SOLVING WORKFLOW" icon="🔄">
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: 'var(--space-3)', 
            marginTop: 'var(--space-3)' 
          }}>
            {steps.map((step, idx) => (
              <div 
                key={step.num} 
                style={{ 
                  backgroundColor: 'var(--color-surface-alt)', 
                  border: 'var(--border-width) solid var(--color-border)', 
                  borderRadius: 'var(--border-radius)', 
                  padding: 'var(--space-3)',
                  position: 'relative'
                }}
              >
                <div style={{ 
                  display: 'inline-block',
                  backgroundColor: 'var(--color-secondary)', 
                  border: 'var(--border-width-sm) solid var(--color-border)',
                  borderRadius: 'var(--border-radius-sm)',
                  padding: '0.1rem 0.4rem',
                  fontSize: '0.75rem',
                  fontWeight: '800',
                  fontFamily: 'var(--font-mono)',
                  marginBottom: 'var(--space-2)'
                }}>
                  {step.num}
                </div>
                <h4 style={{ fontSize: '0.95rem', marginBottom: 'var(--space-1)' }}>{step.title}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* BFS vs DFS Strategy Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
          <Card title="BREADTH-FIRST SEARCH (BFS)" icon="🌊">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <span className="badge badge-cyan" style={{ alignSelf: 'flex-start' }}>Queue (FIFO)</span>
              <p style={{ fontSize: '0.95rem' }}>
                Explores all neighboring nodes at the present depth level before moving on to nodes at the next depth level.
              </p>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.9rem', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <li><strong>Completeness:</strong> Complete if branching factor is finite.</li>
                <li><strong>Optimality:</strong> Always finds the shortest path of moves.</li>
              </ul>
            </div>
          </Card>

          <Card title="DEPTH-FIRST SEARCH (DFS)" icon="🌲">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <span className="badge badge-yellow" style={{ alignSelf: 'flex-start' }}>Stack (LIFO)</span>
              <p style={{ fontSize: '0.95rem' }}>
                Explores as far as possible along each branch before backtracking to previous unexplored decision points.
              </p>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.9rem', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <li><strong>Completeness:</strong> Incomplete in infinite spaces without depth limit.</li>
                <li><strong>Optimality:</strong> Non-optimal (path may be excessively long).</li>
              </ul>
            </div>
          </Card>
        </div>

        {/* Complexity Analysis Section */}
        <Card title="TIME & SPACE COMPLEXITY" icon="📐">
          <div className="comparison-table-wrapper">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Algorithm</th>
                  <th>Time Complexity</th>
                  <th>Space Complexity</th>
                  <th>Data Structure</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>BFS</strong></td>
                  <td><code>O(b<sup>d</sup>)</code></td>
                  <td><code>O(b<sup>d</sup>)</code></td>
                  <td>Queue (FIFO)</td>
                </tr>
                <tr>
                  <td><strong>DFS</strong></td>
                  <td><code>O(b<sup>m</sup>)</code></td>
                  <td><code>O(b · m)</code></td>
                  <td>Stack (LIFO)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ 
            marginTop: 'var(--space-4)', 
            backgroundColor: 'var(--color-surface-alt)', 
            border: 'var(--border-width-sm) solid var(--color-border)', 
            borderRadius: 'var(--border-radius-sm)',
            padding: 'var(--space-3)',
            fontSize: '0.875rem'
          }}>
            <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: 'var(--space-1)' }}>Notation Guide:</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', fontFamily: 'var(--font-mono)' }}>
              <span><strong>b</strong> = branching factor (~2 to 4 moves per state)</span>
              <span><strong>d</strong> = shallowest solution depth</span>
              <span><strong>m</strong> = maximum search tree depth</span>
            </div>
          </div>
        </Card>

        {/* Bottom CTA */}
        <div style={{ textAlign: 'center' }}>
          <Link to="/puzzle">
            <Button variant="primary" size="lg">
              🚀 Try The Puzzle Solver Now
            </Button>
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}
