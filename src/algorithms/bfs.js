/**
 * Breadth-First Search (BFS) Solver Module
 * Mini-Project for Design and Analysis of Algorithms (DAA)
 *
 * Traverses the sliding puzzle state space tree level-by-level using a FIFO Queue.
 * Guarantees finding the optimal (shortest path) solution if one exists.
 */
import { getGoalState, getValidMoveIndices, isSolvable } from '../puzzles/numericalPuzzle.js';

export const MAX_STATES = 5000000;

/**
 * Executes Breadth-First Search to find the shortest path from initial to goal state.
 * @param {Array<number>} initialState
 * @param {Array<number>} [customGoalState]
 * @param {number} [gridSize=3]
 * @param {number} [maxStates=1000000]
 * @returns {{
 *   solved: boolean,
 *   terminationReason: 'solved' | 'unsolvable' | 'search_limit',
 *   algorithm: 'BFS',
 *   initialState: Array<number>,
 *   finalState: Array<number>,
 *   solutionPath: Array<Array<number>>,
 *   solutionDepth: number,
 *   statesExplored: number,
 *   nodesGenerated: number,
 *   executionTime: number,
 *   error?: string
 * }}
 */
export function solveBFS(initialState, customGoalState = null, gridSize = 3, maxStates = MAX_STATES, onEvent = null) {
  const startTime = performance.now();

  const goalState = customGoalState || getGoalState(gridSize);
  const goalKey = goalState.join(',');
  const initialKey = initialState.join(',');
  const emit = (type, payload = {}) => {
    if (typeof onEvent === 'function') {
      onEvent({ type, ...payload });
    }
  };

  // 1. Mathematical Solvability Verification BEFORE search
  if (!isSolvable(initialState, gridSize)) {
    const endTime = performance.now();
    return {
      solved: false,
      terminationReason: 'unsolvable',
      algorithm: 'BFS',
      initialState,
      finalState: initialState,
      solutionPath: [],
      solutionDepth: 0,
      statesExplored: 0,
      nodesGenerated: 0,
      executionTime: Number((endTime - startTime).toFixed(2)),
      error: 'The puzzle configuration is mathematically unsolvable.',
    };
  }

  // 2. Trivial Goal Check (0 moves)
  if (initialKey === goalKey) {
    const endTime = performance.now();
    return {
      solved: true,
      terminationReason: 'solved',
      algorithm: 'BFS',
      initialState,
      finalState: initialState,
      solutionPath: [initialState],
      solutionDepth: 0,
      statesExplored: 1,
      nodesGenerated: 1,
      executionTime: Number((endTime - startTime).toFixed(2)),
    };
  }

  const initialEmptyIndex = initialState.indexOf(0);
  const nodeLookup = new Map();
  let nextNodeId = 1;

  const createNode = ({ state, parentId = null, depth = 0, move = null, searchOrder = null }) => {
    const key = state.join(',');
    let node = nodeLookup.get(key);
    if (!node) {
      node = {
        id: nextNodeId++,
        state: [...state],
        parentId,
        depth,
        move,
        searchOrder,
      };
      nodeLookup.set(key, node);
    }
    if (parentId !== null && node.parentId === null) node.parentId = parentId;
    if (searchOrder !== null) node.searchOrder = searchOrder;
    return node;
  };

  const rootNode = createNode({ state: initialState, depth: 0, searchOrder: 1 });
  emit('root', {
    nodeId: rootNode.id,
    state: initialState,
    parentId: null,
    depth: 0,
    move: null,
    searchOrder: 1,
  });

  // FIFO Queue with head pointer index to avoid O(N) Array.shift() overhead
  const queue = [
    {
      state: initialState,
      emptyIndex: initialEmptyIndex,
      parent: null,
      depth: 0,
      nodeId: rootNode.id,
      move: null,
    },
  ];

  const visited = new Set();
  visited.add(initialKey);

  let head = 0;
  let statesExplored = 0;
  let nodesGenerated = 1;

  while (head < queue.length) {
    const current = queue[head++];
    statesExplored++;

    const currentNode = createNode({
      state: current.state,
      parentId: current.parent ? current.parent.nodeId : null,
      depth: current.depth,
      move: current.move,
      searchOrder: statesExplored,
    });

    emit('expand', {
      nodeId: currentNode.id,
      state: current.state,
      parentId: current.parent ? current.parent.nodeId : null,
      depth: current.depth,
      move: current.move,
      searchOrder: statesExplored,
    });

    // Check goal condition
    if (current.state.join(',') === goalKey) {
      // Reconstruct solution path
      const path = [];
      let curr = current;
      while (curr !== null) {
        path.push(curr.state);
        curr = curr.parent;
      }
      path.reverse();

      const endTime = performance.now();
      return {
        solved: true,
        terminationReason: 'solved',
        algorithm: 'BFS',
        initialState,
        finalState: path[path.length - 1],
        solutionPath: path,
        solutionDepth: path.length - 1,
        statesExplored,
        nodesGenerated,
        executionTime: Number((endTime - startTime).toFixed(2)),
      };
    }

    if (statesExplored >= maxStates) {
      break;
    }

    const validMoves = getValidMoveIndices(current.emptyIndex, gridSize);

    for (let i = 0; i < validMoves.length; i++) {
      const targetIndex = validMoves[i];
      const nextState = [...current.state];
      nextState[current.emptyIndex] = nextState[targetIndex];
      nextState[targetIndex] = 0;

      const nextKey = nextState.join(',');
      if (!visited.has(nextKey)) {
        visited.add(nextKey);
        nodesGenerated++;

        const moveDirection = (() => {
          const blankRow = Math.floor(current.emptyIndex / gridSize);
          const blankCol = current.emptyIndex % gridSize;
          const targetRow = Math.floor(targetIndex / gridSize);
          const targetCol = targetIndex % gridSize;
          if (targetRow === blankRow - 1 && targetCol === blankCol) return 'UP';
          if (targetRow === blankRow + 1 && targetCol === blankCol) return 'DOWN';
          if (targetRow === blankRow && targetCol === blankCol - 1) return 'LEFT';
          if (targetRow === blankRow && targetCol === blankCol + 1) return 'RIGHT';
          return null;
        })();

        const childNode = createNode({
          state: nextState,
          parentId: current.nodeId,
          depth: current.depth + 1,
          move: moveDirection,
        });

        emit('generate', {
          nodeId: childNode.id,
          parentId: current.nodeId,
          state: nextState,
          depth: current.depth + 1,
          move: moveDirection,
          searchOrder: nodesGenerated,
        });

        queue.push({
          state: nextState,
          emptyIndex: targetIndex,
          parent: current,
          depth: current.depth + 1,
          nodeId: childNode.id,
          move: moveDirection,
        });
      }
    }
  }

  const endTime = performance.now();
  emit('search_limit', {
    statesExplored,
    nodesGenerated,
  });

  return {
    solved: false,
    terminationReason: 'search_limit',
    algorithm: 'BFS',
    initialState,
    finalState: initialState,
    solutionPath: [],
    solutionDepth: 0,
    statesExplored,
    nodesGenerated,
    executionTime: Number((endTime - startTime).toFixed(2)),
    error: `Search stopped after exploring ${statesExplored.toLocaleString()} states without reaching goal.`,
  };
}

export default {
  solveBFS,
};
