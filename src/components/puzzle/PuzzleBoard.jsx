import React from 'react';
import PuzzleTile from './PuzzleTile';

/**
 * Reusable PuzzleBoard component supporting 3x3 and 4x4 matrix
 * @param {Array<number>} tiles - Array representing the board state (0 = empty)
 * @param {number} gridSize - 3 for 3x3 (8-Puzzle), 4 for 4x4 (15-Puzzle)
 * @param {function} onTileClick - Handler for tile click
 */
export default function PuzzleBoard({
  tiles = [6, 2, 3, 7, 0, 5, 8, 1, 4],
  gridSize = 3,
  onTileClick,
  className = '',
}) {
  const gridClass = gridSize === 4 ? 'puzzle-board-4x4' : 'puzzle-board-3x3';

  return (
    <div className={`puzzle-board ${gridClass} ${className}`.trim()}>
      {tiles.map((tileValue, index) => {
        // Goal state condition check for visual feedback (1..N-1, with 0 at the end)
        const isGoalPosition = (tileValue !== 0 && tileValue === index + 1);

        return (
          <PuzzleTile
            key={`${index}-${tileValue}`}
            value={tileValue}
            isEmpty={tileValue === 0}
            isCorrect={isGoalPosition}
            index={index}
            onClick={() => onTileClick && onTileClick(index)}
          />
        );
      })}
    </div>
  );
}
