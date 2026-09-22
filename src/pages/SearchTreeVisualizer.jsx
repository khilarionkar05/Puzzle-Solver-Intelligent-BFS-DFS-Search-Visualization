import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import SectionTitle from '../components/common/SectionTitle';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import PuzzleBoard from '../components/puzzle/PuzzleBoard';
import { solveBFS } from '../algorithms/bfs.js';
import { solveDFS } from '../algorithms/dfs.js';
import { getGoalState } from '../puzzles/numericalPuzzle.js';

const MAX_VISIBLE_NODES = 1000;

function loadConfig(location) {
  if (location.state?.puzzleState) return location.state;
  try {
    const saved = JSON.parse(sessionStorage.getItem('puzzle_solver_config') || 'null');
    return saved?.puzzleState ? saved : null;
  } catch {
    return null;
  }
}

function buildTree(events, initialState) {
  const nodes = new Map();
  let goalId = null;
  const ensure = (event) => {
    if (!nodes.has(event.nodeId)) {
      nodes.set(event.nodeId, {
        id: event.nodeId,
        state: [...(event.state || initialState)],
        parentId: event.parentId ?? null,
        children: [],
        depth: event.depth ?? 0,
        move: event.move || (event.nodeId === 1 ? 'INITIAL' : 'UNKNOWN'),
        searchOrder: event.searchOrder ?? null,
        status: 'GENERATED',
        isGoal: false,
      });
    }
    return nodes.get(event.nodeId);
  };
  events.forEach((event) => {
    if (!event?.type || event.type === 'search_limit') return;
    const node = ensure(event);
    if (event.parentId !== null && event.parentId !== undefined) {
      const parent = nodes.get(event.parentId);
      if (parent && !parent.children.includes(node.id)) parent.children.push(node.id);
    }
    if (event.type === 'root') node.status = 'ROOT';
    if (event.type === 'generate') node.status = 'FRONTIER';
    if (event.type === 'expand') node.status = 'EXPANDED';
    if (event.type === 'goal') { node.status = 'GOAL'; node.isGoal = true; goalId = node.id; }
  });
  if (!nodes.size) nodes.set(1, { id: 1, state: [...initialState], parentId: null, children: [], depth: 0, move: 'INITIAL', searchOrder: 1, status: 'ROOT', isGoal: false });
  if (goalId) {
    let node = nodes.get(goalId);
    while (node) {
      if (node.id !== goalId) node.status = 'PATH';
      node = node.parentId === null ? null : nodes.get(node.parentId);
    }
  }
  const list = [...nodes.values()].sort((a, b) => (a.searchOrder || a.id) - (b.searchOrder || b.id));
  return { nodes: list, root: nodes.get(events.find((event) => event.type === 'root')?.nodeId || 1) || list[0], goalId, depth: list.reduce((max, node) => Math.max(max, node.depth), 0) };
}

function Node({ node, selected, onSelect, gridSize, puzzleType, imageTilesMap }) {
  const colors = { ROOT: '#FDE68A', FRONTIER: '#FEF3C7', EXPANDED: '#E5E7EB', PATH: '#BBF7D0', GOAL: '#86EFAC' };
  return <button type="button" onClick={() => onSelect(node)} style={{ width: gridSize === 4 ? 150 : 140, padding: '0.5rem', border: `3px solid ${selected ? '#0891B2' : '#111827'}`, borderRadius: 8, background: colors[node.status] || '#fff', boxShadow: selected ? '5px 5px 0 #0891B2' : '4px 4px 0 #111827', cursor: 'pointer', textAlign: 'left' }}>
    <strong style={{ fontSize: '0.68rem' }}>{node.isGoal ? '★ GOAL' : node.id === 1 ? 'ROOT' : `NODE #${node.id}`}</strong>
    <PuzzleBoard tiles={node.state} gridSize={gridSize} puzzleType={puzzleType} imageTilesMap={imageTilesMap} showTileBadges={false} />
    <div style={{ fontSize: '0.65rem', lineHeight: 1.45 }}>Depth: {node.depth}<br />Order: #{node.searchOrder || '—'}<br />Move: {node.move}<br />{node.status}</div>
  </button>;
}

export default function SearchTreeVisualizer() {
  const location = useLocation();
  const navigate = useNavigate();
  const config = useMemo(() => loadConfig(location), [location]);
  const algorithm = (config?.algorithm || 'BFS').toUpperCase();
  const gridSize = config?.gridSize || 3;
  const puzzleType = config?.puzzleType || 'numerical';
  const imageTilesMap = config?.imageTilesMap || null;
  const initialState = config?.puzzleState || getGoalState(gridSize);
  const [selected, setSelected] = useState(null);
  const [tree, setTree] = useState(null);
  const [result, setResult] = useState(null);

  const runSearch = () => {
    const events = [];
    const solver = algorithm === 'DFS'
      ? solveDFS(initialState, getGoalState(gridSize), gridSize, gridSize === 4 ? 40 : 35, 5000000, (event) => events.push(event))
      : solveBFS(initialState, getGoalState(gridSize), gridSize, 5000000, (event) => events.push(event));
    if (!events.some((event) => event.type === 'root')) events.unshift({ type: 'root', nodeId: 1, state: initialState, depth: 0, searchOrder: 1 });
    const built = buildTree(events, initialState);
    setTree(built);
    setResult(solver);
    setSelected(built.root);
  };

  const activeTree = tree || buildTree([], initialState);
  const nodeMap = new Map(activeTree.nodes.slice(0, MAX_VISIBLE_NODES).map((node) => [node.id, node]));
  const status = result?.solved ? 'SOLVED' : result?.terminationReason === 'unsolvable' ? 'UNSOLVABLE' : result?.terminationReason === 'search_limit' ? 'SEARCH LIMIT REACHED' : 'READY';

  return <PageContainer>
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}><SectionTitle tag="DAA Visualization" title="SEARCH TREE VISUALIZER" subtitle={`${algorithm} — ${algorithm === 'BFS' ? 'Breadth-First Search' : 'Depth-First Search'} from the current puzzle state.`} /><strong>{status}</strong></div>
    <Card title="SEARCH TREE" icon="🌳">
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}><Button variant="primary" size="sm" onClick={runSearch}>▶ START SEARCH</Button><Button variant="outline" size="sm" onClick={() => { setTree(null); setResult(null); setSelected(null); }}>↻ RESET</Button><Button variant="outline" size="sm" onClick={() => navigate('/solver', { state: { ...config, puzzleState: initialState } })}>← BACK TO SOLVER</Button></div>
      {!tree ? <div style={{ padding: '2rem', textAlign: 'center' }}>No search tree generated yet. Start the real {algorithm} search to inspect its states.</div> : <div style={{ overflow: 'auto', padding: '1rem', background: '#F8FAFC', border: '2px solid #111827', borderRadius: 8 }}><div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem' }}>{activeTree.nodes.slice(0, MAX_VISIBLE_NODES).map((node) => <div key={node.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>{node.parentId !== null && <div style={{ width: 2, height: 16, background: '#64748B' }} />}<Node node={node} selected={selected?.id === node.id} onSelect={setSelected} gridSize={gridSize} puzzleType={puzzleType} imageTilesMap={imageTilesMap} /></div>)}</div></div>}
    </Card>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}><Card title="SEARCH STATISTICS" icon="📊"><div>Nodes Generated: {result?.nodesGenerated || 0}</div><div>States Explored: {result?.statesExplored || 0}</div><div>Maximum Depth: {activeTree.depth}</div><div>Solution Depth: {result?.solved ? result.solutionDepth : '—'}</div><div>Execution Time: {result ? `${result.executionTime} ms` : '—'}</div></Card><Card title="SELECTED NODE" icon="🎯">{selected ? <><strong>NODE #{selected.id}</strong><div>State: {selected.state.join(' ')}</div><div>Depth: {selected.depth}</div><div>Parent: {selected.parentId === null ? 'ROOT' : `#${selected.parentId}`}</div><div>Move: {selected.move}</div><div>Status: {selected.status}</div></> : <div>Select a node after starting a search.</div>}</Card></div>
  </PageContainer>;
}
