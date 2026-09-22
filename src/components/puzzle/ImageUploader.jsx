import React, { useRef, useState } from 'react';
import Button from '../common/Button';

export default function ImageUploader({
  onImageSelect,
  previewUrl = null,
  onGeneratePuzzle,
  isGenerating = false,
  hasGenerated = false,
}) {
  const fileInputRef = useRef(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image format
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMsg('Please upload a valid image file (PNG, JPG, or WebP).');
      return;
    }

    setErrorMsg('');
    const reader = new FileReader();
    reader.onload = () => {
      if (onImageSelect) {
        onImageSelect(reader.result, file);
      }
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read selected image file.');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="image-uploader">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/jpg, image/webp"
        style={{ display: 'none' }}
      />

      {previewUrl ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <div className="image-preview-wrapper" onClick={handleClick} title="Click to change image">
            <img src={previewUrl} alt="Uploaded Puzzle Preview" />
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Button variant="outline" size="sm" fullWidth onClick={handleClick}>
              🔄 Change Image
            </Button>
            {onGeneratePuzzle && (
              <Button
                variant={hasGenerated ? 'outline' : 'secondary'}
                size="sm"
                fullWidth
                onClick={onGeneratePuzzle}
                disabled={isGenerating}
              >
                {isGenerating ? '⚙️ Slicing...' : hasGenerated ? '⚡ Regenerate' : '🧩 Slice Image'}
              </Button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="upload-dropzone" onClick={handleClick}>
            <div className="upload-icon">📸</div>
            <div className="upload-text">Click to upload custom image</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)' }}>
              PNG, JPG, or WebP supported
            </span>
          </div>
          <Button variant="outline" size="sm" fullWidth onClick={handleClick}>
            📁 Browse Image
          </Button>
        </>
      )}

      {errorMsg && (
        <div className="puzzle-alert puzzle-alert-warning" style={{ fontSize: '0.8rem', padding: 'var(--space-2)' }}>
          <span>⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
