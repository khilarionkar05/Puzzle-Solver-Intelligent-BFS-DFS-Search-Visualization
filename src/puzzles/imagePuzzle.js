/**
 * Image Sliding Puzzle Logic Module
 *
 * (Image slicing and canvas rendering will be added in a later phase)
 */

export function createEmptyImageGrid(gridSize = 3) {
  const total = gridSize * gridSize;
  const tiles = [];
  for (let i = 1; i < total; i++) {
    tiles.push(i);
  }
  tiles.push(0);
  return tiles;
}

export default {
  createEmptyImageGrid,
};
