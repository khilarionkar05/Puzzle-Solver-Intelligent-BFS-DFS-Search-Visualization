import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import SectionTitle from '../components/common/SectionTitle';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import PuzzleBoard from '../components/puzzle/PuzzleBoard';
import PuzzleTypeSelector from '../components/puzzle/PuzzleTypeSelector';
import GridSelector from '../components/puzzle/GridSelector';
import AlgorithmSelector from '../components/puzzle/AlgorithmSelector';
import ImageUploader from '../components/puzzle/ImageUploader';
import PuzzleControls from '../components/puzzle/PuzzleControls';
import {
  getGoalState,
  moveTile,
  generateSolvableShuffle,
} from '../puzzles/numericalPuzzle';
import { sliceImageToTiles } from '../puzzles/imagePuzzle';
import { isSolved } from '../utils/puzzleUtils';

export default function Puzzle() {
  const navigate = useNavigate();

  // Primary Configuration States
  const [puzzleType, setPuzzleType] = useState('numerical');
  const [gridSize, setGridSize] = useState(3);
  const [algorithm, setAlgorithm] = useState('BFS');
  const [moves, setMoves] = useState(0);

  // Dynamic Board State
  const [puzzleState, setPuzzleState] = useState(() => getGoalState(3));

  // Image Puzzle States
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imageTilesMap, setImageTilesMap] = useState(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Check if current puzzle board is in solved goal state
  const goalState = getGoalState(gridSize);
  const isCurrentStateSolved = isSolved(puzzleState, goalState);

  // Sync board state when grid size changes
  useEffect(() => {
    const newGoal = getGoalState(gridSize);
    setPuzzleState(newGoal);
    setMoves(0);
    setValidationError('');

    // If an image is already uploaded and grid size changed, re-slice image for new grid
    if (puzzleType === 'image' && uploadedImage) {
      handleGenerateImagePuzzle(uploadedImage, gridSize);
    }
  }, [gridSize]);

  // Handle switching between Numerical and Image modes
  const handleSelectPuzzleType = (type) => {
    setPuzzleType(type);
    setValidationError('');
    setMoves(0);
    const goal = getGoalState(gridSize);
    setPuzzleState(goal);
  };

  // Image upload handler
  const handleImageSelect = (dataUrl) => {
    setUploadedImage(dataUrl);
    setValidationError('');
    handleGenerateImagePuzzle(dataUrl, gridSize);
  };

  // Slices uploaded image into grid tiles and shuffles
  const handleGenerateImagePuzzle = async (imgSrc, currentGridSize) => {
    const targetSrc = imgSrc || uploadedImage;
    if (!targetSrc) {
      setValidationError('Please upload an image first.');
      return;
    }

    try {
      setIsGeneratingImage(true);
      setValidationError('');
      const slicedMap = await sliceImageToTiles(targetSrc, currentGridSize);
      setImageTilesMap(slicedMap);
      const shuffledState = generateSolvableShuffle(currentGridSize, 60);
      setPuzzleState(shuffledState);
      setMoves(0);
    } catch (err) {
      console.error('Failed to generate image puzzle:', err);
      setValidationError('Failed to process image. Please try another image.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Interactive Tile Click Handler
  const handleTileClick = (clickedIndex) => {
    // If in image mode and image has not been generated yet, prompt user
    if (puzzleType === 'image' && !imageTilesMap) {
      setValidationError('Please upload and slice an image first.');
      return;
    }

    const nextState = moveTile(puzzleState, clickedIndex, gridSize);
    if (nextState) {
      setPuzzleState(nextState);
      setMoves((prev) => prev + 1);
      setValidationError('');
    }
  };

  // Shuffle button handler (generates a guaranteed solvable permutation)
  const handleShuffle = () => {
    const shuffled = generateSolvableShuffle(gridSize, 60);
    setPuzzleState(shuffled);
    setMoves(0);
    setValidationError('');
  };

  // Reset button handler (restores solved goal state)
  const handleReset = () => {
    const solved = getGoalState(gridSize);
    setPuzzleState(solved);
    setMoves(0);
    setValidationError('');
  };

  // Navigate to Solver page with current dynamic configuration
  const handleSolveNavigation = () => {
    if (puzzleType === 'image' && !imageTilesMap) {
      setValidationError('Please upload and generate an image puzzle before solving.');
      return;
    }

    const solverConfig = {
      puzzleType,
      gridSize,
      algorithm,
      puzzleState,
      goalState,
      moves,
      imageTilesMap: puzzleType === 'image' ? imageTilesMap : null,
      uploadedImage: puzzleType === 'image' ? uploadedImage : null,
    };

    // Store in sessionStorage for reliability
    try {
      sessionStorage.setItem('puzzle_solver_config', JSON.stringify(solverConfig));
    } catch (e) {
      console.warn('SessionStorage quota exceeded or disabled:', e);
    }

    navigate('/solver', { state: solverConfig });
  };

  const boardTitle = gridSize === 4 ? '15-PUZZLE' : '8-PUZZLE';

  return (
    <PageContainer>
      <SectionTitle
        tag="Puzzle Setup"
        title="Interactive Puzzle Arena"
        subtitle="Configure your sliding puzzle parameters, test interactive moves, and prepare search algorithms."
      />

      <div className="puzzle-layout">
        {/* LEFT COLUMN: Controls & Configuration */}
        <aside className="controls-panel">
          <Card title="PUZZLE TYPE" icon="⚙️">
            <PuzzleTypeSelector
              selectedType={puzzleType}
              onSelectType={handleSelectPuzzleType}
            />
          </Card>

          {puzzleType === 'image' && (
            <Card title="IMAGE SOURCE" icon="🖼">
              <ImageUploader
                previewUrl={uploadedImage}
                onImageSelect={handleImageSelect}
                onGeneratePuzzle={() => handleGenerateImagePuzzle(uploadedImage, gridSize)}
                isGenerating={isGeneratingImage}
                hasGenerated={Boolean(imageTilesMap)}
              />
            </Card>
          )}

          <Card title="GRID SIZE" icon="📐">
            <GridSelector
              gridSize={gridSize}
              onSelectGridSize={setGridSize}
            />
          </Card>

          <Card title="SEARCH ALGORITHM" icon="🧠">
            <AlgorithmSelector
              selectedAlgorithm={algorithm}
              onSelectAlgorithm={setAlgorithm}
            />
          </Card>

          <Card title="ACTIONS" icon="🎮">
            <PuzzleControls
              onShuffle={handleShuffle}
              onReset={handleReset}
            />
          </Card>

          {validationError && (
            <div className="puzzle-alert puzzle-alert-warning">
              <span>⚠️</span>
              <span>{validationError}</span>
            </div>
          )}

          {isCurrentStateSolved && moves > 0 && (
            <div className="puzzle-alert puzzle-alert-success">
              <span>🎉</span>
              <span><strong>Solved!</strong> Goal reached in {moves} moves.</span>
            </div>
          )}

          <div className="instruction-box">
            <span>💡</span>
            <span>Move a tile adjacent to the empty slot (0) to slide. Click Shuffle to generate a random solvable puzzle.</span>
          </div>
        </aside>

        {/* RIGHT COLUMN: Puzzle Board & Status */}
        <section className="puzzle-board-container">
          <div className="board-header">
            <h2 className="board-title">{boardTitle}</h2>
            <div className="board-stats">
              <span className="stat-pill">MOVES: {moves}</span>
            </div>
          </div>

          <PuzzleBoard
            tiles={puzzleState}
            gridSize={gridSize}
            puzzleType={puzzleType}
            imageTilesMap={imageTilesMap}
            onTileClick={handleTileClick}
          />

          <div style={{ width: '100%', maxWidth: '440px' }}>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleSolveNavigation}
            >
              🚀 SOLVE PUZZLE
            </Button>
          </div>
        </section>
      </div>
    </PageContainer>
  );
}
