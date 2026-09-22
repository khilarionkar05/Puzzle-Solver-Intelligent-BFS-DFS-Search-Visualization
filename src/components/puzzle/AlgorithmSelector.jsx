import React from 'react';
import Button from '../common/Button';

export default function AlgorithmSelector({
  selectedAlgorithm = 'BFS',
  onSelectAlgorithm,
}) {
  return (
    <div className="button-group-toggle">
      <Button
        variant={selectedAlgorithm === 'BFS' ? 'secondary' : 'outline'}
        onClick={() => onSelectAlgorithm && onSelectAlgorithm('BFS')}
        size="md"
      >
        🌊 BFS
      </Button>
      <Button
        variant={selectedAlgorithm === 'DFS' ? 'secondary' : 'outline'}
        onClick={() => onSelectAlgorithm && onSelectAlgorithm('DFS')}
        size="md"
      >
        🌲 DFS
      </Button>
    </div>
  );
}
