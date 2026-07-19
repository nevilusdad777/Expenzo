import React, { useState, useRef, useEffect } from 'react';
import { FiX, FiZoomIn, FiMove } from 'react-icons/fi';

interface ImageCropperModalProps {
  imageSrc: string;
  onCancel: () => void;
  onCrop: (croppedBase64: string) => void;
}

export function ImageCropperModal({ imageSrc, onCancel, onCrop }: ImageCropperModalProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Reset positioning when image source changes
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [imageSrc]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch Support
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    setDragStart({
      x: e.touches[0].clientX - pan.x,
      y: e.touches[0].clientY - pan.y,
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPan({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleCrop = () => {
    const img = imageRef.current;
    if (!img) return;

    const canvas = document.createElement('canvas');
    const size = 150; // Output dimension for avatar
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Viewport is 200x200 centered in container
    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const viewportSize = 200;
    
    // Viewport left and top relative to the container
    const vLeft = (containerRect.width - viewportSize) / 2;
    const vTop = (containerRect.height - viewportSize) / 2;

    // Width and height of the image as rendered inside the container (before scale/translation)
    const renderWidth = img.clientWidth;
    const renderHeight = img.clientHeight;

    // Scale mapping factor from render size to actual natural image size
    const scaleX = img.naturalWidth / renderWidth;
    const scaleY = img.naturalHeight / renderHeight;

    // Image positions relative to container
    const imgLeft = (containerRect.width - renderWidth) / 2 + pan.x - (renderWidth * (zoom - 1)) / 2;
    const imgTop = (containerRect.height - renderHeight) / 2 + pan.y - (renderHeight * (zoom - 1)) / 2;

    // Viewport coordinates relative to the scaled image:
    const relativeX = (vLeft - imgLeft) / zoom;
    const relativeY = (vTop - imgTop) / zoom;
    const relativeSize = viewportSize / zoom;

    // Convert back to natural image scale
    const sourceX = relativeX * scaleX;
    const sourceY = relativeY * scaleY;
    const sourceWidth = relativeSize * scaleX;
    const sourceHeight = relativeSize * scaleY;

    // Draw the cropped section onto the 150x150 canvas
    ctx.drawImage(
      img,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      size,
      size
    );

    const croppedBase64 = canvas.toDataURL('image/jpeg', 0.85);
    onCrop(croppedBase64);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="glass-panel w-full max-w-sm rounded-[24px] p-6 border border-white/10 shadow-2xl relative flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FiMove className="text-primary" /> Crop Profile Picture
          </h3>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-full hover:bg-white/5 text-on-surface-variant hover:text-white transition-colors"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Viewport Container */}
        <div 
          ref={containerRef}
          className="relative w-full h-[260px] bg-black/40 rounded-xl border border-white/5 overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing select-none animate-fade-in"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
        >
          {/* Main Image */}
          <img
            ref={imageRef}
            src={imageSrc}
            alt="Source avatar"
            className="max-w-[80%] max-h-[80%] pointer-events-none transition-transform duration-75 select-none"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
            }}
          />

          {/* Viewport Crop Circle Mask */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* Circular cut-out viewport (size 200px) */}
            <div className="w-[200px] h-[200px] rounded-full border-2 border-primary shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] z-10"></div>
          </div>
        </div>

        {/* Zoom Control Slider */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-on-surface-variant font-medium">
            <span className="flex items-center gap-1.5"><FiZoomIn /> Zoom Scale</span>
            <span className="text-white font-bold">{Math.round(zoom * 100)}%</span>
          </div>
          <input
            type="range"
            min="1"
            max="3"
            step="0.05"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-full border border-white/10 text-xs font-semibold text-on-surface-variant hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCrop}
            className="px-5 py-2 rounded-full bg-primary hover:bg-primary-fixed text-on-primary-container font-semibold text-xs transition-all active:scale-95 shadow-[0_0_15px_rgba(196,192,255,0.3)]"
          >
            Crop & Apply
          </button>
        </div>
      </div>
    </div>
  );
}
