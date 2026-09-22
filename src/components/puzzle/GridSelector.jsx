import React from 'react';

export default function GridSelector({
  gridSize = 3,
  onSelectGridSize,
}) {
  return (
    <select
      className="custom-select"
      value={gridSize}
      onChange={(e) => onSelectGridSize && onSelectGridSize(Number(e.target.value))}
      aria-label="Select grid size"
    >
      <option value={3}>3 × 3 (8-Puzzle)</option>
      <option value={4}>4 × 4 (15-Puzzle)</option>
    </select>
  );
}
