import React, { useState } from 'react';
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

export default function Puzzle() {
  const navigate = useNavigate();

  // Foundation UI states (No complex algorithm logic yet)
  const [puzzleType, setPuzzleType] = useState('numerical');
  const [gridSize, setGridSize] = useState(3);
  const [algorithm, setAlgorithm] = useState('BFS');
  const [moves, setMoves] = useState(0);

  // Sample placeholder board representations
  const sample3x3 = [6, 2, 3, 7, 0, 5, 8, 1, 4];
  const sample4x4 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 0, 15];

  const currentTiles = gridSize === 4 ? sample4x4 : sample3x3;
  const boardTitle = gridSize === 4 ? '15-PUZZLE' : '8-PUZZLE';

  const handleSolveNavigation = () => {
    // Navigate to solver visualization page
    navigate('/solver', {
      state: {
        puzzleType,
        gridSize,
        algorithm,
      },
    });
  };

  const handleShuffleClick = () => {
    // Placeholder click handler
    console.log('Shuffle requested');
  };

  const handleResetClick = () => {
    // Placeholder click handler
    setMoves(0);
    console.log('Reset requested');
  };

  return (
    <PageContainer>
      <SectionTitle
        tag="Puzzle Setup"
        title="Interactive Puzzle Arena"
        subtitle="Configure your sliding puzzle parameters and prepare the search algorithm."
      />

      <div className="puzzle-layout">
        {/* LEFT COLUMN: Controls & Configuration */}
        <aside className="controls-panel">
          <Card title="PUZZLE TYPE" icon="⚙️">
            <PuzzleTypeSelector
              selectedType={puzzleType}
              onSelectType={setPuzzleType}
            />
          </Card>

          {puzzleType === 'image' && (
            <Card title="IMAGE SOURCE" icon="🖼">
              <ImageUploader onImageSelect={(file) => console.log('File selected:', file)} />
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
              onShuffle={handleShuffleClick}
              onReset={handleResetClick}
            />
          </Card>

          <div className="instruction-box">
            <span>💡</span>
            <span>Move a tile next to the empty space to solve the puzzle.</span>
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
            tiles={currentTiles}
            gridSize={gridSize}
            onTileClick={(idx) => console.log('Tile clicked at index:', idx)}
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
