import React from 'react';
import Button from '../common/Button';

export default function PuzzleControls({
  onShuffle,
  onReset,
  onSolve,
  disabled = false,
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
        <Button
          variant="outline"
          onClick={onShuffle}
          disabled={disabled}
        >
          🎲 Shuffle
        </Button>
        <Button
          variant="outline"
          onClick={onReset}
          disabled={disabled}
        >
          🔄 Reset
        </Button>
      </div>
      {onSolve && (
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={onSolve}
          disabled={disabled}
        >
          🚀 Solve Puzzle
        </Button>
      )}
    </div>
  );
}
