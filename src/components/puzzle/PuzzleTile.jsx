import React from 'react';

/**
 * Single Tile for Sliding Puzzle
 * @param {number} value - Number displayed on tile (0 is empty)
 * @param {boolean} isEmpty - Flag if this is the blank space
 * @param {boolean} isCorrect - Flag if tile is in its goal position
 * @param {function} onClick - Click handler
 */
export default function PuzzleTile({
  value,
  isEmpty = false,
  isCorrect = false,
  onClick,
  index,
}) {
  const isBlank = isEmpty || value === 0;

  return (
    <div
      className={`puzzle-tile ${isBlank ? 'tile-empty' : ''} ${isCorrect ? 'tile-correct' : ''}`}
      onClick={isBlank ? undefined : onClick}
      role={isBlank ? 'presentation' : 'button'}
      tabIndex={isBlank ? -1 : 0}
      aria-label={isBlank ? 'Empty slot' : `Tile ${value}`}
    >
      {!isBlank ? value : ''}
    </div>
  );
}
