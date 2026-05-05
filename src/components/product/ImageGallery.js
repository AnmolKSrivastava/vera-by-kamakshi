// src/components/product/ImageGallery.js
import React, { useState, useRef } from 'react';
import './ImageGallery.css';

const ImageGallery = ({ images = [], productName }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [lensPosition, setLensPosition] = useState({ x: 0, y: 0 });
  const [showLens, setShowLens] = useState(false);
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  // Fallback to single image if images array not provided
  const imageArray = Array.isArray(images) && images.length > 0 
    ? images 
    : [images].filter(Boolean);

  if (imageArray.length === 0) return null;

  const handleThumbnailClick = (index) => {
    setSelectedIndex(index);
    setIsZoomed(false);
    setShowLens(false);
  };

  const handleMainImageClick = () => {
    setIsZoomed(!isZoomed);
    setShowLens(false);
  };

  const handleMouseMove = (e) => {
    if (!isZoomed || !containerRef.current || !imageRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    
    // Calculate mouse position relative to container
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate lens position (centered on mouse)
    const lensSize = 150;
    const lensX = Math.max(0, Math.min(x - lensSize / 2, rect.width - lensSize));
    const lensY = Math.max(0, Math.min(y - lensSize / 2, rect.height - lensSize));
    
    setLensPosition({ x: lensX, y: lensY });
    setShowLens(true);
  };

  const handleMouseLeave = () => {
    setShowLens(false);
  };

  return (
    <div className="image-gallery">
      <div 
        ref={containerRef}
        className={`main-image-container ${isZoomed ? 'zoomed' : ''}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <img 
          ref={imageRef}
          src={imageArray[selectedIndex]} 
          alt={`${productName} - View ${selectedIndex + 1}`}
          className="main-image"
          decoding="async"
          fetchPriority="high"
          onClick={handleMainImageClick}
        />
        
        {/* Magnifying lens effect */}
        {isZoomed && showLens && (
          <div 
            className="zoom-lens"
            style={{
              left: `${lensPosition.x}px`,
              top: `${lensPosition.y}px`,
              backgroundImage: `url(${imageArray[selectedIndex]})`,
              backgroundPosition: `-${lensPosition.x * 2}px -${lensPosition.y * 2}px`,
              backgroundSize: '300%'
            }}
          />
        )}
        
        <div className="zoom-hint">
          {isZoomed ? '🔍 Hover to magnify • Click to exit' : '🔍 Click to zoom in'}
        </div>
      </div>
      
      {imageArray.length > 1 && (
        <div className="thumbnail-strip">
          {imageArray.map((image, index) => (
            <button
              key={index}
              className={`thumbnail ${selectedIndex === index ? 'active' : ''}`}
              onClick={() => handleThumbnailClick(index)}
            >
              <img src={image} alt={`${productName} thumbnail ${index + 1}`} loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
