import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import SectionTitle from '../components/common/SectionTitle';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import PuzzleBoard from '../components/puzzle/PuzzleBoard';
import { solveBFS } from '../algorithms/bfs.js';
import { solveDFS } from '../algorithms/dfs.js';

export default function HowItWorks() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('BFS'); // 'BFS' | 'DFS'
  const [activeWorkflowStep, setActiveWorkflowStep] = useState(0);

  // Interactive Demonstration State
  // A standard solvable 2-move sample puzzle
  const demoInitialState = [1, 2, 3, 4, 0, 6, 7, 5, 8];
  const [demoStep, setDemoStep] = useState(0);
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  const demoTimerRef = useRef(null);

  // Workflow step definitions with interactive explanations
  const workflowSteps = [
    {
      num: '01',
      title: 'Puzzle Setup',
      shortDesc: 'Initial permutation of numerical or image tiles.',
      detail: 'The puzzle is initialized with tiles in a solvable shuffled permutation where 0 represents the blank slot.',
    },
    {
      num: '02',
      title: 'Generate States',
      shortDesc: 'Identify valid moves by sliding adjacent tiles.',
      detail: 'From the blank slot (0), adjacent tiles (Up, Down, Left, Right) are identified and swapped to create branch states.',
    },
    {
      num: '03',
      title: 'BFS / DFS Search',
      shortDesc: 'Traverse state space tree using Queue or Stack.',
      detail: 'BFS uses a Queue to explore level-by-level (FIFO). DFS uses a Stack to explore deeply along one branch (LIFO).',
    },
    {
      num: '04',
      title: 'Find Goal State',
      shortDesc: 'Check if current state matches target sequence.',
      detail: 'Each explored state is checked against the target goal [1, 2, 3, 4, 5, 6, 7, 8, 0]. Visited states are tracked in a Set.',
    },
    {
      num: '05',
      title: 'Reconstruct Solution',
      shortDesc: 'Trace back parent pointers to render animated moves.',
      detail: 'Once goal state is reached, parent pointers are traversed backward to construct the exact sequence of puzzle moves.',
    },
  ];

  // Pre-computed real solution steps for demonstration
  const bfsDemoSteps = [
    {
      step: 0,
      name: 'Initial State S0',
      tiles: [1, 2, 3, 4, 0, 6, 7, 5, 8],
      action: 'Search begins at root node S0 (Blank at center).',
      frontier: ['S0 (Root)'],
      frontierType: 'Queue (FIFO)',
    },
    {
      step: 1,
      name: 'Explore S0 -> S1',
      tiles: [1, 2, 3, 4, 5, 6, 7, 0, 8],
      action: 'Slide tile 5 up into blank slot. Node S1 enqueued.',
      frontier: ['S1 (Depth 1)', 'S_up', 'S_left', 'S_right'],
      frontierType: 'Queue (FIFO)',
    },
    {
      step: 2,
      name: 'Goal Reached S2',
      tiles: [1, 2, 3, 4, 5, 6, 7, 8, 0],
      action: 'Slide tile 8 left into blank slot. Goal verified! S2 is target.',
      frontier: ['S2 (Goal Node)'],
      frontierType: 'Queue (FIFO)',
    },
  ];

  const dfsDemoSteps = [
    {
      step: 0,
      name: 'Initial State S0',
      tiles: [1, 2, 3, 4, 0, 6, 7, 5, 8],
      action: 'Push root node S0 onto Stack (LIFO).',
      frontier: ['[Top] S0 (Root)'],
      frontierType: 'Stack (LIFO)',
    },
    {
      step: 1,
      name: 'Deep Branch S0 -> S1',
      tiles: [1, 2, 3, 4, 5, 6, 7, 0, 8],
      action: 'Pop S0, push children. Take deepest branch S1.',
      frontier: ['[Top] S1 (Depth 1)', 'S_alt2', 'S_alt1'],
      frontierType: 'Stack (LIFO)',
    },
    {
      step: 2,
      name: 'Goal State S2',
      tiles: [1, 2, 3, 4, 5, 6, 7, 8, 0],
      action: 'Pop S1, advance to next branch. Target matched!',
      frontier: ['[Top] S2 (Goal Node)'],
      frontierType: 'Stack (LIFO)',
    },
  ];

  const currentDemoSteps = selectedAlgorithm === 'BFS' ? bfsDemoSteps : dfsDemoSteps;
  const currentStepData = currentDemoSteps[Math.min(demoStep, currentDemoSteps.length - 1)];

  // Interactive Playback Timer
  useEffect(() => {
    if (isPlayingDemo) {
      demoTimerRef.current = setTimeout(() => {
        setDemoStep((prev) => {
          if (prev < currentDemoSteps.length - 1) {
            return prev + 1;
          } else {
            setIsPlayingDemo(false);
            return prev;
          }
        });
      }, 1000);
    }

    return () => {
      if (demoTimerRef.current) {
        clearTimeout(demoTimerRef.current);
      }
    };
  }, [isPlayingDemo, demoStep, currentDemoSteps]);

  const handleNextDemo = () => {
    setIsPlayingDemo(false);
    if (demoStep < currentDemoSteps.length - 1) {
      setDemoStep((prev) => prev + 1);
    }
  };

  const handlePrevDemo = () => {
    setIsPlayingDemo(false);
    if (demoStep > 0) {
      setDemoStep((prev) => prev - 1);
    }
  };

  const handleTogglePlayDemo = () => {
    if (demoStep >= currentDemoSteps.length - 1) {
      setDemoStep(0);
      setIsPlayingDemo(true);
    } else {
      setIsPlayingDemo((prev) => !prev);
    }
  };

  const handleResetDemo = () => {
    if (demoTimerRef.current) clearTimeout(demoTimerRef.current);
    setIsPlayingDemo(false);
    setDemoStep(0);
  };

  return (
    <PageContainer>
      <div style={{ maxWidth: '920px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
        <SectionTitle
          tag="DAA Theory & Interactive Demonstration"
          title="HOW IT WORKS"
          subtitle="Interactive guide to uninformed state space exploration using BFS and DFS."
        />

        {/* Algorithm Selector Switcher */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ display: 'inline-flex', gap: 'var(--space-2)', backgroundColor: 'var(--color-surface)', padding: '6px', border: 'var(--border-width) solid var(--color-border)', borderRadius: 'var(--border-radius)', boxShadow: 'var(--box-shadow-sm)' }}>
            <Button
              variant={selectedAlgorithm === 'BFS' ? 'primary' : 'outline'}
              size="md"
              onClick={() => {
                setSelectedAlgorithm('BFS');
                handleResetDemo();
              }}
            >
              🌊 Breadth-First Search (BFS)
            </Button>
            <Button
              variant={selectedAlgorithm === 'DFS' ? 'secondary' : 'outline'}
              size="md"
              onClick={() => {
                setSelectedAlgorithm('DFS');
                handleResetDemo();
              }}
            >
              🌲 Depth-First Search (DFS)
            </Button>
          </div>
        </div>

        {/* Interactive Workflow Diagram */}
        <Card title="SEARCH & SOLVING WORKFLOW (CLICK STEPS TO EXPLORE)" icon="🔄">
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: 'var(--space-3)', 
            marginTop: 'var(--space-2)' 
          }}>
            {workflowSteps.map((step, idx) => {
              const isActive = activeWorkflowStep === idx;
              return (
                <div 
                  key={step.num}
                  onClick={() => setActiveWorkflowStep(idx)}
                  style={{ 
                    backgroundColor: isActive ? '#FEF3C7' : 'var(--color-surface-alt)', 
                    border: 'var(--border-width) solid var(--color-border)', 
                    borderRadius: 'var(--border-radius)', 
                    padding: 'var(--space-3)',
                    cursor: 'pointer',
                    transform: isActive ? 'translateY(-2px)' : 'none',
                    boxShadow: isActive ? 'var(--box-shadow-sm)' : 'none',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div style={{ 
                    display: 'inline-block',
                    backgroundColor: isActive ? 'var(--color-secondary)' : 'var(--color-surface)', 
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
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>{step.shortDesc}</p>
                </div>
              );
            })}
          </div>

          {/* Active Step Detailed Description Banner */}
          <div style={{ 
            marginTop: 'var(--space-4)', 
            padding: 'var(--space-3) var(--space-4)', 
            backgroundColor: '#EFF6FF', 
            border: 'var(--border-width-sm) solid var(--color-border)', 
            borderRadius: 'var(--border-radius-sm)',
            fontSize: '0.9rem',
            color: '#1E3A8A'
          }}>
            <strong>Step {workflowSteps[activeWorkflowStep].num} — {workflowSteps[activeWorkflowStep].title}:</strong>{' '}
            {workflowSteps[activeWorkflowStep].detail}
          </div>
        </Card>

        {/* Live Interactive State-by-State Demonstration Arena */}
        <Card title={`INTERACTIVE ${selectedAlgorithm} STATE TRANSITION DEMO`} icon="🎮">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-6)', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '340px' }}>
                <span className="badge badge-yellow" style={{ fontSize: '0.8rem' }}>
                  {currentStepData.name}
                </span>
                <span className="stat-pill" style={{ fontSize: '0.8rem' }}>
                  STEP {demoStep} / {currentDemoSteps.length - 1}
                </span>
              </div>

              {/* Real Puzzle Board Display */}
              <div style={{ width: '100%', maxWidth: '320px' }}>
                <PuzzleBoard tiles={currentStepData.tiles} gridSize={3} />
              </div>

              {/* Step Action Explanation */}
              <div className="instruction-box" style={{ width: '100%', maxWidth: '440px' }}>
                <span>💡</span>
                <span>{currentStepData.action}</span>
              </div>

              {/* Dynamic Queue / Stack Frontier Representation */}
              <div style={{ 
                width: '100%', 
                maxWidth: '440px',
                backgroundColor: 'var(--color-surface-alt)', 
                border: 'var(--border-width) solid var(--color-border)', 
                borderRadius: 'var(--border-radius)', 
                padding: 'var(--space-3)' 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)', fontSize: '0.8rem', fontWeight: 800 }}>
                  <span>ACTIVE FRONTIER DATA STRUCTURE:</span>
                  <span className="badge badge-cyan">{currentStepData.frontierType}</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {currentStepData.frontier.map((item, idx) => (
                    <span 
                      key={idx} 
                      style={{ 
                        backgroundColor: idx === 0 ? 'var(--color-secondary)' : '#fff', 
                        border: '1.5px solid var(--color-border)', 
                        borderRadius: '4px', 
                        padding: '2px 8px', 
                        fontSize: '0.75rem', 
                        fontWeight: 700, 
                        fontFamily: 'var(--font-mono)' 
                      }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Step Controls */}
              <div style={{ display: 'flex', gap: 'var(--space-2)', width: '100%', maxWidth: '440px' }}>
                <Button 
                  variant="outline" 
                  size="md" 
                  onClick={handlePrevDemo} 
                  disabled={demoStep === 0 || isPlayingDemo}
                  style={{ flex: 1 }}
                >
                  ◀ PREV
                </Button>
                <Button 
                  variant={isPlayingDemo ? 'secondary' : 'primary'} 
                  size="md" 
                  onClick={handleTogglePlayDemo}
                  style={{ flex: 1.2 }}
                >
                  {isPlayingDemo ? '⏸ PAUSE' : demoStep >= currentDemoSteps.length - 1 ? '🔄 REPLAY' : '▶ AUTO PLAY'}
                </Button>
                <Button 
                  variant="outline" 
                  size="md" 
                  onClick={handleNextDemo} 
                  disabled={demoStep >= currentDemoSteps.length - 1 || isPlayingDemo}
                  style={{ flex: 1 }}
                >
                  NEXT ▶
                </Button>
                <Button 
                  variant="outline" 
                  size="md" 
                  onClick={handleResetDemo}
                >
                  🔄
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* BFS vs DFS Strategy Comparison Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
          <Card 
            title="BREADTH-FIRST SEARCH (BFS)" 
            icon="🌊"
            style={{
              borderColor: selectedAlgorithm === 'BFS' ? 'var(--color-border)' : 'rgba(0,0,0,0.3)',
              backgroundColor: selectedAlgorithm === 'BFS' ? '#FFFFFF' : 'var(--color-surface-alt)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <span className="badge badge-cyan" style={{ alignSelf: 'flex-start' }}>Queue (FIFO)</span>
              <p style={{ fontSize: '0.95rem' }}>
                Explores all neighboring nodes at the present depth level before moving on to nodes at the next depth level.
              </p>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.9rem', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <li><strong>Completeness:</strong> Complete (always finds goal if branching is finite).</li>
                <li><strong>Optimality:</strong> Guaranteed to find the shortest path of moves.</li>
                <li><strong>Memory:</strong> High space requirement (<code>O(b^d)</code>).</li>
              </ul>
            </div>
          </Card>

          <Card 
            title="DEPTH-FIRST SEARCH (DFS)" 
            icon="🌲"
            style={{
              borderColor: selectedAlgorithm === 'DFS' ? 'var(--color-border)' : 'rgba(0,0,0,0.3)',
              backgroundColor: selectedAlgorithm === 'DFS' ? '#FFFFFF' : 'var(--color-surface-alt)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <span className="badge badge-yellow" style={{ alignSelf: 'flex-start' }}>Stack (LIFO)</span>
              <p style={{ fontSize: '0.95rem' }}>
                Explores as far as possible along each branch before backtracking to previous unexplored decision points.
              </p>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.9rem', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <li><strong>Completeness:</strong> Incomplete in infinite spaces without depth limit.</li>
                <li><strong>Optimality:</strong> Non-optimal (path may be excessively long).</li>
                <li><strong>Memory:</strong> Low space requirement (<code>O(b · m)</code>).</li>
              </ul>
            </div>
          </Card>
        </div>

        {/* Complexity Analysis Section */}
        <Card title="TIME & SPACE COMPLEXITY ANALYSIS" icon="📐">
          <div className="comparison-table-wrapper">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Algorithm</th>
                  <th>Time Complexity</th>
                  <th>Space Complexity</th>
                  <th>Data Structure</th>
                  <th>Optimality</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ backgroundColor: selectedAlgorithm === 'BFS' ? '#E0F2FE' : 'transparent' }}>
                  <td><strong>BFS</strong></td>
                  <td><code>O(b<sup>d</sup>)</code></td>
                  <td><code>O(b<sup>d</sup>)</code></td>
                  <td>Queue (FIFO)</td>
                  <td>Guaranteed Shortest</td>
                </tr>
                <tr style={{ backgroundColor: selectedAlgorithm === 'DFS' ? '#FEF3C7' : 'transparent' }}>
                  <td><strong>DFS</strong></td>
                  <td><code>O(b<sup>m</sup>)</code></td>
                  <td><code>O(b · m)</code></td>
                  <td>Stack (LIFO)</td>
                  <td>Non-Optimal</td>
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
