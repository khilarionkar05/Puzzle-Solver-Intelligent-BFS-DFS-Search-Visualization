import React from 'react';

/**
 * Single Tile for Sliding Puzzle (supports numerical and image slices)
 * @param {number} value - Number displayed on tile (0 is empty)
 * @param {boolean} isEmpty - Flag if this is the blank space
 * @param {boolean} isCorrect - Flag if tile is in its goal position
 * @param {string|null} imageDataUrl - Base64 image slice if image mode
 * @param {boolean} showBadge - Flag to show number badge on image tile
 * @param {function} onClick - Click handler
 */
export default function PuzzleTile({
  value,
  isEmpty = false,
  isCorrect = false,
  imageDataUrl = null,
  showBadge = true,
  onClick,
  index,
}) {
  const isBlank = isEmpty || value === 0;
  const isImageTile = !isBlank && Boolean(imageDataUrl);

  const tileStyle = isImageTile
    ? {
        backgroundImage: `url(${imageDataUrl})`,
      }
    : undefined;

  return (
    <div
      className={`puzzle-tile ${isBlank ? 'tile-empty' : ''} ${isCorrect ? 'tile-correct' : ''} ${
        isImageTile ? 'puzzle-tile-image' : ''
      }`.trim()}
      style={tileStyle}
      onClick={isBlank ? undefined : onClick}
      role={isBlank ? 'presentation' : 'button'}
      tabIndex={isBlank ? -1 : 0}
      aria-label={isBlank ? 'Empty slot' : `Tile ${value}`}
    >
      {isImageTile ? (
        showBadge && <span className="tile-badge">{value}</span>
      ) : (
        !isBlank ? value : ''
      )}
    </div>
  );
}
