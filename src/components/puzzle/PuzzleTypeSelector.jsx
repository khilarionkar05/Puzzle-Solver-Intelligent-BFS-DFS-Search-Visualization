import React from 'react';
import Button from '../common/Button';

export default function PuzzleTypeSelector({
  selectedType = 'numerical',
  onSelectType,
}) {
  return (
    <div className="button-group-toggle">
      <Button
        variant={selectedType === 'numerical' ? 'primary' : 'outline'}
        onClick={() => onSelectType && onSelectType('numerical')}
        size="md"
      >
        🔢 Numerical
      </Button>
      <Button
        variant={selectedType === 'image' ? 'primary' : 'outline'}
        onClick={() => onSelectType && onSelectType('image')}
        size="md"
      >
        🖼 Image
      </Button>
    </div>
  );
}
