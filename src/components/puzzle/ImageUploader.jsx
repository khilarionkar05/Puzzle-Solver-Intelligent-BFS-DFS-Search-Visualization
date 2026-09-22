import React, { useRef } from 'react';
import Button from '../common/Button';

export default function ImageUploader({
  onImageSelect,
  previewUrl = null,
}) {
  const fileInputRef = useRef(null);

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onImageSelect) {
      onImageSelect(file);
    }
  };

  return (
    <div className="image-uploader">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
      />
      <div className="upload-dropzone" onClick={handleClick}>
        <div className="upload-icon">📸</div>
        <div className="upload-text">
          {previewUrl ? 'Change selected image' : 'Click to upload image'}
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)' }}>
          JPG, PNG, WebP supported
        </span>
      </div>
      <Button variant="outline" size="sm" fullWidth onClick={handleClick}>
        📁 Browse Image
      </Button>
    </div>
  );
}
