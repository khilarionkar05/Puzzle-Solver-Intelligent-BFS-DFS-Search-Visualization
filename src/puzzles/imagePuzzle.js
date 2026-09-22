/**
 * Image Sliding Puzzle Logic Module
 * Slices uploaded images via HTML5 Canvas into interactive tile slices.
 */
import { generateSolvableShuffle, getGoalState } from './numericalPuzzle';

/**
 * Loads an image from a URL or data URL and returns an HTMLImageElement
 * @param {string} src
 * @returns {Promise<HTMLImageElement>}
 */
export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error('Failed to load image: ' + err));
    img.src = src;
  });
}

/**
 * Slices an image into an array of tile data URLs according to the grid size.
 * Cropping is centered and square-ratio preserved.
 * @param {string} imageSrc - Object URL or Base64 Data URL of the uploaded image
 * @param {number} gridSize - 3 for 3x3, 4 for 4x4
 * @returns {Promise<Record<number, { id: number, dataUrl: string | null }>>}
 */
export async function sliceImageToTiles(imageSrc, gridSize = 3) {
  const img = await loadImage(imageSrc);
  const totalTiles = gridSize * gridSize;

  // Determine square bounding box centered within original image
  const size = Math.min(img.width, img.height);
  const sx = (img.width - size) / 2;
  const sy = (img.height - size) / 2;
  const sliceSize = size / gridSize;

  // Standard output tile resolution for crisp display
  const outputTileSize = 160;
  const canvas = document.createElement('canvas');
  canvas.width = outputTileSize;
  canvas.height = outputTileSize;
  const ctx = canvas.getContext('2d');

  const tilesMap = {};

  for (let i = 0; i < totalTiles; i++) {
    const tileNumber = i + 1;
    const row = Math.floor(i / gridSize);
    const col = i % gridSize;

    // Last tile (tile index totalTiles - 1) is the empty blank space (id: 0)
    if (tileNumber === totalTiles) {
      tilesMap[0] = {
        id: 0,
        dataUrl: null,
      };
    } else {
      ctx.clearRect(0, 0, outputTileSize, outputTileSize);
      ctx.drawImage(
        img,
        sx + col * sliceSize,
        sy + row * sliceSize,
        sliceSize,
        sliceSize,
        0,
        0,
        outputTileSize,
        outputTileSize
      );

      tilesMap[tileNumber] = {
        id: tileNumber,
        dataUrl: canvas.toDataURL('image/png'),
      };
    }
  }

  return tilesMap;
}

/**
 * Creates and initializes an image puzzle with sliced tiles and a solvable shuffled state
 * @param {string} imageSrc
 * @param {number} gridSize
 * @returns {Promise<{ tilesMap: Record<number, any>, initialState: Array<number>, goalState: Array<number> }>}
 */
export async function initializeImagePuzzle(imageSrc, gridSize = 3) {
  const tilesMap = await sliceImageToTiles(imageSrc, gridSize);
  const goalState = getGoalState(gridSize);
  const initialState = generateSolvableShuffle(gridSize, 60);

  return {
    tilesMap,
    initialState,
    goalState,
  };
}

export default {
  loadImage,
  sliceImageToTiles,
  initializeImagePuzzle,
};
