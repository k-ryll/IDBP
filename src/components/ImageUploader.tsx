// src/components/ImageUploader.tsx
import React, { useState, ChangeEvent } from 'react';

interface ImageUploaderProps {
  uploadedImages: string[];
  onImagesChange: (images: string[]) => void;
  currentImage: string | null;
  onCurrentImageChange: (image: string) => void;
  onCropImage: (imageUrl: string) => void; // If you want to start cropping
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  uploadedImages,
  onImagesChange,
  currentImage,
  onCurrentImageChange,
  onCropImage
}) => {
  // For simplicity, we do not handle cropping here directly
  // but we could add a "Crop" button and call onCropImage

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const imageUrl = event.target.result as string;
          onImagesChange([...uploadedImages, imageUrl]);
          onCurrentImageChange(imageUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="image-uploader">
      <h2>Upload &amp; Manage Images</h2>
      
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="file-input"
        id="file-upload"
        multiple
      />
      <label htmlFor="file-upload" className="file-label">
        Choose Images
      </label>

      {uploadedImages.length > 0 && (
        <div className="image-gallery">
          <h3>Your Images</h3>
          <div className="image-thumbnails">
            {uploadedImages.map((img, index) => (
              <div
                key={`img-${index}`}
                className={`image-thumbnail ${currentImage === img ? 'selected' : ''}`}
                onClick={() => onCurrentImageChange(img)}
              >
                <img src={img} alt={`Thumbnail ${index}`} />
              </div>
            ))}
          </div>

          {currentImage && (
            <div className="selected-image-actions">
              <button className="crop-button" onClick={() => onCropImage(currentImage)}>
                Crop This Image
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
