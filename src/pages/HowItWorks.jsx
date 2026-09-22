import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import SectionTitle from '../components/common/SectionTitle';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import PuzzleBoard from '../components/puzzle/PuzzleBoard';
import {
  getGoalState,
  countInversions,
  isSolvable,
  generateSolvableShuffle,
  moveTile,
} from '../puzzles/numericalPuzzle.js';
import {
  get2DMatrix,
  calculateStateSpaceCardinality,
  getValidDirections,
  applyDirectionalMove,
  serializeState,
} from '../utils/puzzleUtils.js';
import { solveBFS } from '../algorithms/bfs.js';
import { solveDFS } from '../algorithms/dfs.js';
import { formatTime, formatNumber } from '../utils/performanceUtils.js';

export default function HowItWorks() {
  // Grid Configuration State
  const [gridSize, setGridSize] = useState(3); // 3 | 4

  // Central Interactive Laboratory State
  const [currentDemoState, setCurrentDemoState] = useState(() => [1, 2, 3, 4, 0, 6, 7, 5, 8]);

  // Algorithm & Workflow Selection States
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('BFS'); // 'BFS' | 'DFS'
  const [activeWorkflowStep, setActiveWorkflowStep] = useState(0);

  // Search Engine Simulation States
  const [simulationResult, setSimulationResult] = useState(null);
  const [simulationStep, setSimulationStep] = useState(0);
  const [isPlayingSim, setIsPlayingSim] = useState(false);
  const simTimerRef = useRef(null);

  // Sync state when grid size changes
  useEffect(() => {
    if (gridSize === 4) {
      setCurrentDemoState([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 0, 14, 15]);
    } else {
      setCurrentDemoState([1, 2, 3, 4, 0, 6, 7, 5, 8]);
    }
    setSimulationResult(null);
    setSimulationStep(0);
    setIsPlayingSim(false);
  }, [gridSize]);

  // Re-run simulation when algorithm or demo puzzle state changes
  useEffect(() => {
    const goal = getGoalState(gridSize);
    const solvable = isSolvable(currentDemoState, gridSize);

    if (solvable) {
      try {
        let res;
        if (selectedAlgorithm === 'BFS') {
          res = solveBFS(currentDemoState, goal, gridSize, 25000);
        } else {
          res = solveDFS(currentDemoState, goal, gridSize, 30, 25000);
        }
        setSimulationResult(res);
        setSimulationStep(0);
        setIsPlayingSim(false);
      } catch (err) {
        console.error('Simulation error:', err);
      }
    } else {
      setSimulationResult(null);
      setSimulationStep(0);
      setIsPlayingSim(false);
    }
  }, [currentDemoState, selectedAlgorithm, gridSize]);

  // Controlled Simulation Playback Timer
  useEffect(() => {
    if (isPlayingSim && simulationResult?.solutionPath?.length > 0) {
      simTimerRef.current = setTimeout(() => {
        setSimulationStep((prev) => {
          if (prev < simulationResult.solutionPath.length - 1) {
            return prev + 1;
          } else {
            setIsPlayingSim(false);
            return prev;
          }
        });
      }, 700);
    }

    return () => {
      if (simTimerRef.current) clearTimeout(simTimerRef.current);
    };
  }, [isPlayingSim, simulationStep, simulationResult]);

  // Mathematical Calculations Derived Directly from Central State
  const matrix2D = get2DMatrix(currentDemoState, gridSize);
  const serializedState = serializeState(currentDemoState);
  const emptyIndex = currentDemoState.indexOf(0);
  const emptyRow = Math.floor(emptyIndex / gridSize);
  const emptyCol = emptyIndex % gridSize;
  const validDirs = getValidDirections(emptyIndex, gridSize);
  const inversions = countInversions(currentDemoState);
  const parity = inversions % 2 === 0 ? 'EVEN' : 'ODD';
  const solvable = isSolvable(currentDemoState, gridSize);
  const cardinality = calculateStateSpaceCardinality(gridSize);

  // Directional move handler
  const handleDirectionMove = (dir) => {
    const next = applyDirectionalMove(currentDemoState, dir, gridSize);
    if (next) {
      setCurrentDemoState(next);
    }
  };

  // Direct tile click on lab board
  const handleLabTileClick = (idx) => {
    const next = moveTile(currentDemoState, idx, gridSize);
    if (next) {
      setCurrentDemoState(next);
    }
  };

  // Shuffle laboratory state
  const handleShuffleLab = () => {
    const shuffled = generateSolvableShuffle(gridSize, 20);
    setCurrentDemoState(shuffled);
  };

  // Reset to solved goal state
  const handleResetGoal = () => {
    const goal = getGoalState(gridSize);
    setCurrentDemoState(goal);
  };

  // Invert two tiles to demonstrate an UNSOLVABLE state to students
  const handleMakeUnsolvable = () => {
    const goal = getGoalState(gridSize);
    // Swap 1 and 2 to create odd parity
    const unsolvable = [...goal];
    const temp = unsolvable[0];
    unsolvable[0] = unsolvable[1];
    unsolvable[1] = temp;
    setCurrentDemoState(unsolvable);
  };

  // Workflow definitions
  const workflowSteps = [
    {
      num: '01',
      title: 'Puzzle State',
      shortDesc: 'Initial permutation representation.',
      detail: 'The puzzle is represented as a 1D vector and 2D matrix where 0 denotes the movable empty space.',
    },
    {
      num: '02',
      title: 'Successor Generation',
      shortDesc: 'Branching valid directional moves.',
      detail: 'Transitions occur by sliding adjacent tiles (Up, Down, Left, Right) into the empty slot, producing next state nodes.',
    },
    {
      num: '03',
      title: 'Frontier Search',
      shortDesc: 'Queue (BFS) or Stack (DFS) traversal.',
      detail: 'BFS explores level-by-level with a FIFO queue (optimal). DFS explores deep branch paths with a LIFO stack.',
    },
    {
      num: '04',
      title: 'Goal Verification',
      shortDesc: 'Checking target configuration.',
      detail: 'Each state is tested against target sequence [1..N-1, 0]. Explored states are stored in a Set to prevent cycles.',
    },
    {
      num: '05',
      title: 'Path Reconstruction',
      shortDesc: 'Tracing back parent pointers.',
      detail: 'Once the goal node is located, parent pointers are traversed backward to reconstruct the exact solution sequence.',
    },
  ];

  // Simulation board state
  const simActiveBoard =
    simulationResult?.solutionPath && simulationResult.solutionPath.length > 0
      ? simulationResult.solutionPath[simulationStep]
      : currentDemoState;

  const simTotalSteps = simulationResult?.solutionPath
    ? simulationResult.solutionPath.length - 1
    : 0;

  // BFS Pseudocode
  const bfsPseudocode = `// Breadth-First Search (Queue FIFO)
function BFS(initialState, goalState):
    queue = new Queue()
    visited = new Set()
    
    queue.enqueue({ state: initialState, parent: null, depth: 0 })
    visited.add(serialize(initialState))
    
    while not queue.isEmpty():
        current = queue.dequeue()
        
        if current.state == goalState:
            return reconstructPath(current)
            
        for each validMove in getValidMoves(current.state):
            nextState = applyMove(current.state, validMove)
            if serialize(nextState) not in visited:
                visited.add(serialize(nextState))
                queue.enqueue({ state: nextState, parent: current, depth: current.depth + 1 })
                
    return "NO_SOLUTION"`;

  // DFS Pseudocode
  const dfsPseudocode = `// Depth-First Search (Stack LIFO / Depth-Bounded)
function DFS(initialState, goalState, maxDepth):
    stack = new Stack()
    visitedDepth = new Map()
    
    stack.push({ state: initialState, parent: null, depth: 0 })
    visitedDepth.set(serialize(initialState), 0)
    
    while not stack.isEmpty():
        current = stack.pop()
        
        if current.state == goalState:
            return reconstructPath(current)
            
        if current.depth >= maxDepth:
            continue
            
        for each validMove in getValidMoves(current.state):
            nextState = applyMove(current.state, validMove)
            nextDepth = current.depth + 1
            if nextState not visited or nextDepth < visitedDepth.get(nextState):
                visitedDepth.set(serialize(nextState), nextDepth)
                stack.push({ state: nextState, parent: current, depth: nextDepth })
                
    return "NO_SOLUTION"`;

  return (
    <PageContainer>
      <div style={{ maxWidth: '980px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
        {/* Header */}
        <SectionTitle
          tag="DAA Algorithm Compendium"
          title="HOW IT WORKS"
          subtitle="Interactive mathematical foundations and search visualization for sliding tile puzzles."
        />

        {/* ============================================================ */}
        {/* SECTION 1: INTERACTIVE STATE SPACE LABORATORY */}
        {/* ============================================================ */}
        <Card title="1. INTERACTIVE STATE REPRESENTATION LABORATORY" icon="🔬">
          <p style={{ fontSize: '0.9rem', marginBottom: 'var(--space-4)', color: 'var(--color-text-muted)' }}>
            Interact with the board below to see real-time updates across 2D matrix notation, 1D vector mapping, legal operators, inversion parity, and solvability.
          </p>

          {/* Grid Size Switcher */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>GRID SIZE:</span>
              <Button
                variant={gridSize === 3 ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setGridSize(3)}
              >
                3 × 3 (8-Puzzle)
              </Button>
              <Button
                variant={gridSize === 4 ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setGridSize(4)}
              >
                4 × 4 (15-Puzzle)
              </Button>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <Button variant="outline" size="sm" onClick={handleShuffleLab}>
                🎲 Solvable Shuffle
              </Button>
              <Button variant="outline" size="sm" onClick={handleResetGoal}>
                🔄 Goal State
              </Button>
              <Button variant="outline" size="sm" onClick={handleMakeUnsolvable} title="Swap 2 tiles to show an unsolvable parity">
                ⚠️ Make Unsolvable
              </Button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-6)', alignItems: 'start' }}>
            {/* Interactive Board & D-Pad */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div style={{ width: '100%', maxWidth: gridSize === 4 ? '320px' : '260px' }}>
                <PuzzleBoard
                  tiles={currentDemoState}
                  gridSize={gridSize}
                  onTileClick={handleLabTileClick}
                />
              </div>

              {/* D-Pad Directional Move Operators */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', marginTop: 'var(--space-2)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-subtle)' }}>
                  BLANK SLIDE OPERATORS
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDirectionMove('UP')}
                  disabled={!validDirs.UP}
                  style={{ width: '70px' }}
                >
                  ↑ UP
                </Button>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDirectionMove('LEFT')}
                    disabled={!validDirs.LEFT}
                    style={{ width: '70px' }}
                  >
                    ← LEFT
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDirectionMove('DOWN')}
                    disabled={!validDirs.DOWN}
                    style={{ width: '70px' }}
                  >
                    ↓ DOWN
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDirectionMove('RIGHT')}
                    disabled={!validDirs.RIGHT}
                    style={{ width: '70px' }}
                  >
                    → RIGHT
                  </Button>
                </div>
              </div>
            </div>

            {/* Live Data Representations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {/* 2D Matrix M[r][c] */}
              <div style={{ backgroundColor: 'var(--color-surface-alt)', border: 'var(--border-width) solid var(--color-border)', borderRadius: 'var(--border-radius)', padding: 'var(--space-3)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
                  2D MATRIX NOTATION M[r][c]
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {matrix2D.map((row, rIdx) => (
                    <div key={rIdx} style={{ display: 'flex', gap: '8px' }}>
                      <span style={{ color: 'var(--color-text-subtle)', width: '45px' }}>r={rIdx}:</span>
                      <span>[ {row.map((v) => (v === 0 ? '·' : v)).join(' , ')} ]</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 1D Vector & Formula */}
              <div style={{ backgroundColor: 'var(--color-surface-alt)', border: 'var(--border-width) solid var(--color-border)', borderRadius: 'var(--border-radius)', padding: 'var(--space-3)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: 'var(--space-1)' }}>
                  1D VECTOR & STATE KEY
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', wordBreak: 'break-all', marginBottom: 'var(--space-1)' }}>
                  Vector: <strong>[ {currentDemoState.join(', ')} ]</strong>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  Serialized Key: <code>"{serializedState}"</code>
                </div>
                <div style={{ marginTop: 'var(--space-2)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-subtle)' }}>
                  Mapping Formula: <code>index = r × {gridSize} + c</code> | Blank at (r={emptyRow}, c={emptyCol})
                </div>
              </div>

              {/* Solvability & Inversion Parity */}
              <div style={{ 
                backgroundColor: solvable ? '#ECFDF5' : '#FEF2F2', 
                border: 'var(--border-width) solid var(--color-border)', 
                borderRadius: 'var(--border-radius)', 
                padding: 'var(--space-3)' 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-1)' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>INVERSION PARITY & SOLVABILITY:</span>
                  <span className={`badge ${solvable ? 'badge-green' : 'badge-yellow'}`}>
                    {solvable ? 'SOLVABLE ✓' : 'UNSOLVABLE ✗'}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                  <span>Inversions: <strong>{inversions}</strong> ({parity})</span>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    {gridSize === 3
                      ? 'Rule: 3×3 puzzle is solvable if and only if total inversions are EVEN.'
                      : `Rule: 4×4 puzzle is solvable if (inversions + blank row from bottom) is ODD. Blank row from bottom = ${gridSize - emptyRow}.`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* State Space Cardinality */}
          <div style={{ 
            marginTop: 'var(--space-5)', 
            padding: 'var(--space-3) var(--space-4)', 
            backgroundColor: '#FEF3C7', 
            border: 'var(--border-width) solid var(--color-border)', 
            borderRadius: 'var(--border-radius)',
            fontSize: '0.85rem'
          }}>
            <strong>State Space Cardinality ({gridSize}×{gridSize}):</strong> Total Permutations = <code>{gridSize * gridSize}!</code> ({cardinality.totalPermutations}). 
            Because inversion parity divides state space into two equal disjoint subgraphs, exactly <strong>50%</strong> (<code>{cardinality.reachableStates} states</code>) are reachable from the goal!
          </div>
        </Card>

        {/* ============================================================ */}
        {/* SECTION 2: INTERACTIVE SEARCH & SOLVING WORKFLOW */}
        {/* ============================================================ */}
        <Card title="2. SEARCH & SOLVING WORKFLOW (CLICK STEPS TO EXPLORE)" icon="🔄">
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

        {/* ============================================================ */}
        {/* SECTION 3: REAL BFS & DFS STATE TRANSITION DEMONSTRATION */}
        {/* ============================================================ */}
        <Card title={`3. LIVE ${selectedAlgorithm} SEARCH & FRONTIER DEMONSTRATION`} icon="⚡">
          {/* Switcher */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-4)' }}>
            <div style={{ display: 'inline-flex', gap: 'var(--space-2)', backgroundColor: 'var(--color-surface)', padding: '6px', border: 'var(--border-width) solid var(--color-border)', borderRadius: 'var(--border-radius)', boxShadow: 'var(--box-shadow-sm)' }}>
              <Button
                variant={selectedAlgorithm === 'BFS' ? 'primary' : 'outline'}
                size="md"
                onClick={() => setSelectedAlgorithm('BFS')}
              >
                🌊 Breadth-First Search (Queue FIFO)
              </Button>
              <Button
                variant={selectedAlgorithm === 'DFS' ? 'secondary' : 'outline'}
                size="md"
                onClick={() => setSelectedAlgorithm('DFS')}
              >
                🌲 Depth-First Search (Stack LIFO)
              </Button>
            </div>
          </div>

          {!solvable ? (
            <div className="puzzle-alert puzzle-alert-warning" style={{ textAlign: 'center', justifyContent: 'center' }}>
              <span>⚠️ The current board permutation is mathematically unsolvable. Click "Solvable Shuffle" above to run search demonstration.</span>
            </div>
          ) : !simulationResult?.solved ? (
            <div className="puzzle-alert puzzle-alert-warning" style={{ textAlign: 'center', justifyContent: 'center' }}>
              <span>⚠️ Search depth limit reached without finding goal. Try a shallower permutation or switch to BFS.</span>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-6)', alignItems: 'center' }}>
              {/* Simulation Board & Steps */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '300px' }}>
                  <span className="badge badge-yellow">
                    {simulationStep === 0 ? 'Start State' : simulationStep === simTotalSteps ? 'Goal State' : `Step ${simulationStep}`}
                  </span>
                  <span className="stat-pill" style={{ fontSize: '0.8rem' }}>
                    STEP {simulationStep} / {simTotalSteps}
                  </span>
                </div>

                <div style={{ width: '100%', maxWidth: gridSize === 4 ? '320px' : '280px' }}>
                  <PuzzleBoard tiles={simActiveBoard} gridSize={gridSize} />
                </div>

                {/* Simulation Step Controls */}
                <div style={{ display: 'flex', gap: 'var(--space-2)', width: '100%', maxWidth: '360px' }}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsPlayingSim(false);
                      if (simulationStep > 0) setSimulationStep((p) => p - 1);
                    }}
                    disabled={simulationStep === 0 || isPlayingSim}
                    style={{ flex: 1 }}
                  >
                    ◀ PREV
                  </Button>
                  <Button
                    variant={isPlayingSim ? 'secondary' : 'primary'}
                    size="sm"
                    onClick={() => {
                      if (simulationStep >= simTotalSteps) {
                        setSimulationStep(0);
                        setIsPlayingSim(true);
                      } else {
                        setIsPlayingSim((p) => !p);
                      }
                    }}
                    style={{ flex: 1.2 }}
                  >
                    {isPlayingSim ? '⏸ PAUSE' : simulationStep >= simTotalSteps ? '🔄 REPLAY' : '▶ AUTO PLAY'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsPlayingSim(false);
                      if (simulationStep < simTotalSteps) setSimulationStep((p) => p + 1);
                    }}
                    disabled={simulationStep >= simTotalSteps || isPlayingSim}
                    style={{ flex: 1 }}
                  >
                    NEXT ▶
                  </Button>
                </div>
              </div>

              {/* Data Structure Frontier & Visited Information */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <div style={{ backgroundColor: 'var(--color-surface-alt)', border: 'var(--border-width) solid var(--color-border)', borderRadius: 'var(--border-radius)', padding: 'var(--space-3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>
                      {selectedAlgorithm === 'BFS' ? 'QUEUE (FIFO) FRONTIER:' : 'STACK (LIFO) FRONTIER:'}
                    </span>
                    <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
                      {selectedAlgorithm === 'BFS' ? 'First In, First Out' : 'Last In, First Out'}
                    </span>
                  </div>

                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-text)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {selectedAlgorithm === 'BFS' ? (
                      <div>
                        <code>Front → [S_{simulationStep}] ... [S_{Math.min(simulationStep + 3, simTotalSteps)}] ← Rear</code>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                          Nodes are dequeued from the front and child states are appended to the rear, guaranteeing level-by-level search.
                        </p>
                      </div>
                    ) : (
                      <div>
                        <code>Top ↓ [S_{simulationStep}] → [S_{Math.max(0, simulationStep - 1)}] → Base</code>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                          Nodes are pushed and popped from the top of the stack, diving into deep branches before backtracking.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Real Search Engine Measured Metrics */}
                <div style={{ backgroundColor: 'var(--color-surface-alt)', border: 'var(--border-width) solid var(--color-border)', borderRadius: 'var(--border-radius)', padding: 'var(--space-3)' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
                    REAL SOLVER ENGINE EXECUTION METRICS:
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-2)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                    <div>States Explored: <strong>{formatNumber(simulationResult.statesExplored)}</strong></div>
                    <div>Nodes Generated: <strong>{formatNumber(simulationResult.nodesGenerated)}</strong></div>
                    <div>Solution Depth: <strong>{simulationResult.solutionDepth} moves</strong></div>
                    <div>Execution Time: <strong>{formatTime(simulationResult.executionTime)}</strong></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* ============================================================ */}
        {/* SECTION 4: TIME & SPACE COMPLEXITY MATRIX */}
        {/* ============================================================ */}
        <Card title="4. TIME & SPACE COMPLEXITY ANALYSIS" icon="📐">
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
                  <td><strong>BFS (Breadth-First)</strong></td>
                  <td><code>O(b<sup>d</sup>)</code></td>
                  <td><code>O(b<sup>d</sup>)</code></td>
                  <td>Queue (FIFO)</td>
                  <td>Guaranteed Shortest</td>
                </tr>
                <tr style={{ backgroundColor: selectedAlgorithm === 'DFS' ? '#FEF3C7' : 'transparent' }}>
                  <td><strong>DFS (Depth-First)</strong></td>
                  <td><code>O(b<sup>m</sup>)</code></td>
                  <td><code>O(b · m)</code></td>
                  <td>Stack (LIFO)</td>
                  <td>Non-Optimal (Branch Deep)</td>
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
            <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: 'var(--space-1)' }}>DAA Notation Definitions:</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', fontFamily: 'var(--font-mono)' }}>
              <span><strong>b</strong> = Effective branching factor (~2 to 4 moves per state)</span>
              <span><strong>d</strong> = Shallowest goal solution depth</span>
              <span><strong>m</strong> = Maximum search tree depth</span>
            </div>
          </div>
        </Card>

        {/* ============================================================ */}
        {/* SECTION 5: ALGORITHM PSEUDOCODE COMPENDIUM */}
        {/* ============================================================ */}
        <Card title={`5. ${selectedAlgorithm} PSEUDOCODE SPECIFICATION`} icon="💻">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
              {selectedAlgorithm === 'BFS' ? 'Queue-Based Breadth-First Search Algorithm' : 'Stack-Based Depth-First Search Algorithm'}
            </span>
            <span className="badge badge-yellow">{selectedAlgorithm} Algorithm</span>
          </div>
          <pre style={{ 
            backgroundColor: '#1E293B', 
            color: '#F8FAFC', 
            padding: 'var(--space-4)', 
            borderRadius: 'var(--border-radius)', 
            overflowX: 'auto',
            fontSize: '0.8rem',
            lineHeight: '1.5',
            border: 'var(--border-width) solid var(--color-border)'
          }}>
            <code>{selectedAlgorithm === 'BFS' ? bfsPseudocode : dfsPseudocode}</code>
          </pre>
        </Card>

        {/* ============================================================ */}
        {/* SECTION 6: BOTTOM LAUNCH CTA */}
        {/* ============================================================ */}
        <div style={{ textAlign: 'center', margin: 'var(--space-4) 0' }}>
          <Link to="/puzzle">
            <Button variant="primary" size="lg">
              🚀 Launch Live Puzzle Solver Arena
            </Button>
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}
