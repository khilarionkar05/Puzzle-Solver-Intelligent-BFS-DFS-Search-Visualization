import React, { useMemo, useState, useEffect } from 'react';
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

function getStatusColor(status) {
  switch (status) {
    case 'CURRENT':
      return '#00E5FF';
    case 'FRONTIER':
      return '#FFE600';
    case 'EXPANDED':
      return '#E2E8F0';
    case 'PATH':
      return '#10B981';
    case 'GOAL':
      return '#10B981';
    case 'PRUNED':
      return '#94A3B8';
    default:
      return '#FFFFFF';
  }
}

function buildTreeFromEvents(events, initialState) {
  const nodes = new Map();
  let rootNode = null;
  let goalNode = null;
  let maxDepth = 0;

  for (const event of events) {
    if (!event || !event.type) continue;

    const node = nodes.get(event.nodeId) || {
      id: event.nodeId,
      state: Array.isArray(event.state) ? [...event.state] : [...initialState],
      parentId: event.parentId ?? null,
      depth: event.depth ?? 0,
      move: event.move ?? null,
      searchOrder: event.searchOrder ?? null,
      status: 'UNVISITED',
      children: [],
      isGoal: false,
    };

    node.state = Array.isArray(event.state) ? [...event.state] : [...node.state];
    node.parentId = event.parentId ?? node.parentId ?? null;
    node.depth = typeof event.depth === 'number' ? event.depth : node.depth;
    node.move = event.move ?? node.move ?? null;
    node.searchOrder = event.searchOrder ?? node.searchOrder ?? null;

    if (event.type === 'root') {
      node.status = 'CURRENT';
      node.isGoal = false;
      rootNode = node;
    } else if (event.type === 'generate') {
      node.status = 'FRONTIER';
    } else if (event.type === 'expand') {
      node.status = 'EXPANDED';
    } else if (event.type === 'goal') {
      node.status = 'GOAL';
      node.isGoal = true;
      goalNode = node;
    }

    if (event.parentId !== null && event.parentId !== undefined) {
      const parent = nodes.get(event.parentId) || {
        id: event.parentId,
        state: [...initialState],
        parentId: null,
        depth:0,
        move: null,
        searchOrder: null,
        status: 'UNVISITED',
        children: [],
      };
      if (!nodes.has(event.parentId)) nodes.set(event.parentId, parent);
      if (!parent.children.includes(node.id)) parent.children.push(node.id);
    }

    nodes.set(node.id, node);
    maxDepth = Math.max(maxDepth, node.depth ?? 0);
  }

  if (!rootNode) {
    rootNode = {
      id: 0,
      state: [...initialState],
      parentId: null,
      depth: 0,
      move: null,
      searchOrder: 1,
      status: 'CURRENT',
      children: [],
      isGoal: false,
    };
    nodes.set(rootNode.id, rootNode);
  }

  for (const node of nodes.values()) {
    if (node.parentId !== null && nodes.has(node.parentId)) {
      const parent = nodes.get(node.parentId);
      if (!parent.children.includes(node.id)) parent.children.push(node.id);
    }
  }

  const goalPath = [];
  let currentGoal = goalNode || rootNode;
  while (currentGoal) {
    goalPath.push(currentGoal.id);
    currentGoal = currentGoal.parentId !== null && nodes.has(currentGoal.parentId) ? nodes.get(currentGoal.parentId) : null;
  }
  goalPath.reverse();

  const pathSet = new Set(goalPath);
  for (const node of nodes.values()) {
    if (pathSet.has(node.id)) {
      node.status = node.isGoal ? 'GOAL' : 'PATH';
    }
  }

  return {
    nodes: Array.from(nodes.values()).sort((a, b) => (a.searchOrder ?? Number.MAX_SAFE_INTEGER) - (b.searchOrder ?? Number.MAX_SAFE_INTEGER)),
    rootNode,
    goalNode,
    maxDepth,
    pathIds: goalPath,
  };
}

function NodeCard({ node, onSelect, selectedId, pathIds }) {
  const isSelected = selectedId === node.id;
  const isPath = pathIds.includes(node.id);
  const baseColor = getStatusColor(node.status || 'UNVISITED');
  const borderColor = node.isGoal ? '#10B981' : isSelected ? '#00E5FF' : '#111827';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', minWidth: '170px' }}>
      <button
        type="button"
        onClick={() => onSelect(node)}
        style={{
          border: '2.5px solid ' + borderColor,
          borderRadius: '12px',
          background: baseColor,
          boxShadow: isSelected ? '6px 6px 0 #111827' : '4px 4px 0 #111827',
          padding: '0.6rem 0.5rem',
          cursor: 'pointer',
          minWidth: '170px',
          maxWidth: '190px',
          fontWeight: 800,
          color: '#111827',
          transition: 'all 0.2s ease',
          transform: isSelected ? 'translate(-2px, -2px)' : 'none',
        }}
      >
        <div style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
          {node.isGoal ? 'GOAL' : node.id === 0 ? 'ROOT' : `NODE #${node.id}`}
        </div>
        <div style={{ transform: 'scale(0.78)', transformOrigin: 'center top' }}>
          <PuzzleBoard
            tiles={node.state}
            gridSize={Math.sqrt(node.state.length)}
            puzzleType="numerical"
            showTileBadges={false}
          />
        </div>
        <div style={{ fontSize: '0.7rem', marginTop: '0.35rem' }}>Depth: {node.depth}</div>
        <div style={{ fontSize: '0.65rem', marginTop: '0.2rem', opacity: 0.8 }}>{node.status}</div>
      </button>
    </div>
  );
}

function TreeBranch({ node, onSelect, selectedId, pathIds, level = 0 }) {
  const childNodes = node.children || [];
  const children = childNodes
    .map((childId) => ({ id: childId }))
    .map((childRef) => {
      const childNode = nodeMap.get(childRef.id);
      return childNode ? childNode : null;
    })
    .filter(Boolean);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <NodeCard node={node} onSelect={onSelect} selectedId={selectedId} pathIds={pathIds} />
      {children.length > 0 && (
        <div style={{ display: 'flex', gap: '1.2rem', justifyContent: 'center', alignItems: 'flex-start', flexWrap: 'wrap', width: '100%' }}>
          {children.map((childNode) => (
            <div key={childNode.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '2px', height: '18px', background: '#111827', marginTop: '0.1rem' }} />
              <TreeBranch node={childNode} onSelect={onSelect} selectedId={selectedId} pathIds={pathIds} level={level + 1} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

let nodeMap = new Map();

export default function SearchTreeVisualizer() {
  const location = useLocation();
  const navigate = useNavigate();

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
  const initialState = config?.puzzleState || getGoalState(gridSize);
  const goalState = getGoalState(gridSize);

  const [status, setStatus] = useState('READY');
  const [selectedNode, setSelectedNode] = useState(null);
  const [treeData, setTreeData] = useState(null);
  const [result, setResult] = useState(null);
  const [searchOrder, setSearchOrder] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!config) return;
    handleStartSearch();
  }, []);

  const handleStartSearch = () => {
    if (!initialState) return;

    setStatus('EXPLORING');
    setIsRunning(true);

    const events = [];
    const onEvent = (event) => {
      events.push(event);
      if (event.type === 'expand') {
        setSearchOrder((prev) => [...prev, { id: event.nodeId, depth: event.depth, state: event.state }]);
      }
    };

    const solverResult =
      algorithm === 'DFS'
        ? solveDFS(initialState, goalState, gridSize, gridSize === 4 ? 40 : 35, 5000000, onEvent)
        : solveBFS(initialState, goalState, gridSize, 5000000, onEvent);

    const built = buildTreeFromEvents(events, initialState);
    nodeMap = new Map(built.nodes.map((node) => [node.id, node]));

    setTreeData(built);
    setResult(solverResult);
    setSelectedNode(built.rootNode || built.nodes[0] || null);
    setStatus(
      solverResult.solved ? 'GOAL FOUND' : solverResult.terminationReason === 'search_limit' ? 'SEARCH LIMIT REACHED' : solverResult.terminationReason === 'unsolvable' ? 'UNSOLVABLE' : 'READY'
    );
    setIsRunning(false);
  };

  const rootNode = treeData?.rootNode || null;
  const goalNode = treeData?.goalNode || null;
  const selectedNodeState = selectedNode || rootNode;
  const visibleNodes = treeData?.nodes?.slice(0, MAX_VISIBLE_NODES) || [];
  const recentlyExpanded = searchOrder.slice(-10);

  const stats = useMemo(() => {
    if (!result) {
      return {
        nodesGenerated: 0,
        nodesExpanded: 0,
        currentDepth: 0,
        treeDepth: 0,
        visitedStates: 0,
      };
    }

    return {
      nodesGenerated: result.nodesGenerated || 0,
      nodesExpanded: result.statesExplored || 0,
      currentDepth: selectedNodeState?.depth ?? 0,
      treeDepth: treeData?.maxDepth ?? 0,
      visitedStates: result.statesExplored || 0,
    };
  }, [result, selectedNodeState, treeData]);

  const infoStrip = [
    { label: 'Puzzle', value: gridSize === 4 ? '15-PUZZLE' : '8-PUZZLE' },
    { label: 'Grid', value: `${gridSize} × ${gridSize}` },
    { label: 'Algorithm', value: algorithm },
    { label: 'Status', value: status },
  ];

  const solutionPath = useMemo(() => {
    if (!treeData?.goalNode) return [];
    const path = [];
    let current = treeData.goalNode;
    while (current) {
      path.push(current);
      current = current.parentId !== null && nodeMap.has(current.parentId) ? nodeMap.get(current.parentId) : null;
    }
    return path.reverse();
  }, [treeData]);

  const renderTree = () => {
    if (!treeData || !treeData.rootNode) return null;

    return (
      <div style={{ overflow: 'auto', padding: '1rem', background: '#F8FAFC', border: '2.5px solid #111827', borderRadius: '16px', boxShadow: '4px 4px 0 #111827' }}>
        <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: '1rem' }}>
          <TreeBranch
            node={treeData.rootNode}
            onSelect={setSelectedNode}
            selectedId={selectedNode?.id ?? treeData.rootNode.id}
            pathIds={(treeData.pathIds || []).slice(0)}
          />
        </div>
      </div>
    );
  };

  const selectedPathTrail = selectedNodeState
    ? (() => {
        const trail = [];
        let current = selectedNodeState;
        while (current) {
          trail.push(current);
          current = current.parentId !== null && nodeMap.has(current.parentId) ? nodeMap.get(current.parentId) : null;
        }
        return trail.reverse();
      })()
    : [];

  return (
    <PageContainer>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: 'var(--space-4)' }}>
        <SectionTitle
          tag="DAA Visualization"
          title="SEARCH TREE VISUALIZER"
          subtitle="Visualize how BFS and DFS explore the puzzle state space from the initial state to the goal."
        />
        <div className="status-indicator status-ready" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>●</span>
          <span>{algorithm}</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
        <Button variant={algorithm === 'BFS' ? 'primary' : 'outline'} size="sm" onClick={() => { /* preserved from selected config */ }}>BFS</Button>
        <Button variant={algorithm === 'DFS' ? 'primary' : 'outline'} size="sm" onClick={() => { /* preserved from selected config */ }}>DFS</Button>
        <Button variant="primary" size="sm" onClick={handleStartSearch}>{isRunning ? '⏸ PAUSE' : '▶ START SEARCH'}</Button>
        <Button variant="outline" size="sm" onClick={() => navigate('/solver', { state: { algorithm, puzzleType: config?.puzzleType || 'numerical', gridSize, puzzleState: initialState, imageTilesMap: config?.imageTilesMap || null } })}>← BACK TO SOLVER</Button>
        <Button variant="outline" size="sm" onClick={() => { setSelectedNode(rootNode); setStatus('READY'); setResult(null); setTreeData(null); }}>↻ RESET</Button>
        <Button variant="outline" size="sm" onClick={() => {}}>FIT TREE</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
        {infoStrip.map((item) => (
          <div key={item.label} style={{ background: '#fff', border: '2.5px solid #111827', borderRadius: '12px', boxShadow: '4px 4px 0 #111827', padding: '0.75rem 1rem' }}>
            <div style={{ fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 800, color: '#4B5563' }}>{item.label}</div>
            <div style={{ fontSize: '1rem', fontWeight: 800, marginTop: '0.25rem' }}>{item.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 0.9fr', gap: '1rem' }}>
        <div>
          <Card title="SEARCH TREE" icon="🌳">
            {renderTree() || (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#4B5563' }}>No search tree generated yet.</div>
            )}
          </Card>
        </div>

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Card title="SEARCH STATISTICS" icon="📊">
            <div style={{ display: 'grid', gap: '0.7rem' }}>
              <div><strong>Nodes Generated:</strong> {stats.nodesGenerated}</div>
              <div><strong>Nodes Expanded:</strong> {stats.nodesExpanded}</div>
              <div><strong>Current Depth:</strong> {stats.currentDepth}</div>
              <div><strong>Tree Depth:</strong> {stats.treeDepth}</div>
              <div><strong>Visited States:</strong> {stats.visitedStates}</div>
            </div>
          </Card>

          <Card title="LEGEND" icon="🧭">
            <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.8rem' }}>
              <div>● CURRENT</div>
              <div>● FRONTIER</div>
              <div>● EXPANDED</div>
              <div>● SOLUTION PATH</div>
              <div>● GOAL</div>
            </div>
          </Card>

          <Card title="SEARCH ORDER" icon="🔢">
            <div style={{ display: 'grid', gap: '0.35rem', fontSize: '0.8rem' }}>
              {recentlyExpanded.length > 0 ? recentlyExpanded.map((entry, index) => (
                <div key={`${entry.id}-${index}`}>#{index + 1} {entry.state.join(' ')}</div>
              )) : <div>—</div>}
            </div>
          </Card>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
        <Card title="SELECTED NODE" icon="🎯">
          {selectedNodeState ? (
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <div><strong>NODE #{selectedNodeState.id}</strong></div>
              <div><strong>State:</strong> {selectedNodeState.state.join(' ')}</div>
              <div><strong>Depth:</strong> {selectedNodeState.depth}</div>
              <div><strong>Parent:</strong> {selectedNodeState.parentId !== null ? `#${selectedNodeState.parentId}` : 'ROOT'}</div>
              <div><strong>Move:</strong> {selectedNodeState.move || '—'}</div>
              <div><strong>Status:</strong> {selectedNodeState.status || 'UNVISITED'}</div>
              <div><strong>Children:</strong> {(selectedNodeState.children || []).length}</div>
            </div>
          ) : (
            <div>—</div>
          )}
        </Card>

        <Card title="ROOT → GOAL PATH" icon="🧩">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem' }}>
            {selectedPathTrail.length > 0 ? selectedPathTrail.map((node, index) => (
              <div key={`${node.id}-${index}`}>
                {index > 0 ? '↓ ' : ''}{node.isGoal ? 'GOAL' : node.id === 0 ? 'ROOT' : `NODE #${node.id}`}
              </div>
            )) : <div>ROOT</div>}
          </div>
        </Card>
      </div>

      {result && (
        <div style={{ marginTop: '1rem' }}>
          <Card title="RESULT" icon="✅">
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <div><strong>Solution Found:</strong> {result.solved ? 'Yes' : 'No'}</div>
              <div><strong>Solution Depth:</strong> {result.solutionDepth ?? '—'}</div>
              <div><strong>States Explored:</strong> {result.statesExplored ?? 0}</div>
              <div><strong>Nodes Generated:</strong> {result.nodesGenerated ?? 0}</div>
              <div><strong>Algorithm:</strong> {result.algorithm}</div>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <Button variant="primary" size="sm" onClick={() => navigate('/solver', { state: config })}>VIEW SOLUTION</Button>
            </div>
          </Card>
        </div>
      )}
    </PageContainer>
  );
}
