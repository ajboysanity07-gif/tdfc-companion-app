import React, { useEffect, useState } from 'react';

interface IDCropWizardModalProps {
  step: 'front' | 'back';
  src: string;
  onCancel: () => void;
  onCrop: (cropped: File) => void;
  onNext: () => void;
  isLast: boolean;
}

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

const IDCropWizardModal: React.FC<IDCropWizardModalProps> = ({
  step,
  src,
  onCancel,
  onCrop,
  onNext,
  isLast,
}) => {
  const [cropWidth, setCropWidth] = useState(500);
  const [cropHeight, setCropHeight] = useState(320);

  useEffect(() => {
    function updateCropSize() {
      const aspect = 500 / 320;
      const pad = window.innerWidth < 640 ? 190 : 130;
      const maxH = window.innerHeight - pad;
      const w = Math.min(window.innerWidth * 0.97, maxH * aspect, 500);
      const h = w / aspect;
      setCropWidth(w);
      setCropHeight(h);
    }
    updateCropSize();
    window.addEventListener('resize', updateCropSize);
    return () => window.removeEventListener('resize', updateCropSize);
  }, []);

  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [imgSize, setImgSize] = useState({ w: 1, h: 1 });
  const [minZoom, setMinZoom] = useState(1);

  useEffect(() => {
    setZoom(1);
    setMinZoom(1);
    setPosition({ x: 0, y: 0 });
    setImgSize({ w: 1, h: 1 });
  }, [src]);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleImgLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    setImgSize({ w: naturalWidth, h: naturalHeight });
    const scale = Math.min(cropWidth / naturalWidth, cropHeight / naturalHeight);
    setMinZoom(scale);
    setZoom(scale);
    setPosition({ x: 0, y: 0 });
  };

  const updatePositionForZoom = (newZoom: number) => {
    const scaledW = imgSize.w * newZoom;
    const scaledH = imgSize.h * newZoom;
    const maxOffsetX = Math.max((scaledW - cropWidth) / 2, 0);
    const maxOffsetY = Math.max((scaledH - cropHeight) / 2, 0);
    setPosition(pos => ({
      x: clamp(pos.x, -maxOffsetX, maxOffsetX),
      y: clamp(pos.y, -maxOffsetY, maxOffsetY),
    }));
  };

  const setZoomSafe = (z: number) => {
    const newZoom = Math.max(minZoom, z);
    setZoom(newZoom);
    updatePositionForZoom(newZoom);
  };

  // Mouse/touch drag handlers...
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > minZoom) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setDragOffset({ x: position.x, y: position.y });
    }
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const scaledW = imgSize.w * zoom, scaledH = imgSize.h * zoom;
    const maxOffsetX = Math.max((scaledW - cropWidth) / 2, 0), maxOffsetY = Math.max((scaledH - cropHeight) / 2, 0);
    const deltaX = e.clientX - dragStart.x, deltaY = e.clientY - dragStart.y;
    setPosition({
      x: clamp(dragOffset.x + deltaX, -maxOffsetX, maxOffsetX),
      y: clamp(dragOffset.y + deltaY, -maxOffsetY, maxOffsetY)
    });
  };
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoom > minZoom && e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      setDragOffset({ x: position.x, y: position.y });
    }
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const scaledW = imgSize.w * zoom, scaledH = imgSize.h * zoom;
    const maxOffsetX = Math.max((scaledW - cropWidth) / 2, 0), maxOffsetY = Math.max((scaledH - cropHeight) / 2, 0);
    const deltaX = e.touches[0].clientX - dragStart.x, deltaY = e.touches[0].clientY - dragStart.y;
    setPosition({
      x: clamp(dragOffset.x + deltaX, -maxOffsetX, maxOffsetX),
      y: clamp(dragOffset.y + deltaY, -maxOffsetY, maxOffsetY)
    });
  };
  const handleTouchEnd = () => setIsDragging(false);

  const [cropping, setCropping] = useState(false);
  const handleCrop = async () => {
    setCropping(true);
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const file = new File([blob], step === 'front' ? 'prc-front.png' : 'prc-back.png', { type: blob.type });
      onCrop(file);
      onNext();
    } catch (error) {
      console.error('Cropping failed:', error);
    } finally {
      setCropping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-0 sm:p-8">
      <div className={`
        w-full h-full max-w-full rounded-none
        bg-white shadow-xl flex flex-col max-h-screen overflow-y-auto
        ${window.innerWidth >= 640 ? "sm:rounded-2xl sm:max-w-xl sm:h-auto" : ""}
      `}>
        {/* Header */}
        <div className="pt-7 px-4 pb-3">
          <h2 className="text-xl font-bold text-center text-gray-800 mb-2">
            Crop the {step === 'front' ? 'FRONT' : 'BACK'} of your PRC ID
          </h2>
          <div className="flex justify-center items-center gap-2 mb-3">
            <div className={`w-3 h-3 rounded-full ${step === 'front' ? 'bg-[#F57979]' : 'bg-green-500'}`}></div>
            <div className="w-8 h-px bg-gray-300"></div>
            <div className={`w-3 h-3 rounded-full ${step === 'back' ? 'bg-[#F57979]' : 'bg-gray-300'}`}></div>
          </div>
          <div className="flex justify-center items-center mb-3">
            <span className="bg-gray-100 text-gray-700 rounded px-3 py-1 text-sm font-medium">
              Use slider to zoom
            </span>
          </div>
        </div>

        {/* Crop area */}
        <div className="flex flex-col items-center px-4 mb-4">
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 relative overflow-hidden"
            style={{
              width: cropWidth,
              height: cropHeight,
              cursor: zoom > minZoom ? 'grab' : 'default',
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={src}
              alt={`PRC ${step} to crop`}
              onLoad={handleImgLoad}
              className="absolute transition-transform duration-200 select-none"
              style={{
                width: imgSize.w,
                height: imgSize.h,
                left: '50%',
                top: '50%',
                transform: `
                  translate(-50%, -50%)
                  scale(${zoom})
                  translate(${position.x / zoom}px, ${position.y / zoom}px)
                `,
                transformOrigin: 'center center',
                maxWidth: 'none',
                maxHeight: 'none'
              }}
              draggable={false}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mb-4 px-4">
          <span className="text-sm font-medium text-gray-700">Zoom:</span>
          <input
            type="range"
            min={minZoom}
            max={3}
            step={0.01}
            value={zoom}
            onChange={e => setZoomSafe(Number(e.target.value))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-sm text-gray-600 min-w-[50px]">{zoom.toFixed(2)}×</span>
        </div>
        <div className="flex justify-center mb-4">
          <button
            type="button"
            onClick={() => { setZoom(minZoom); setPosition({ x: 0, y: 0 }); }}
            className="text-sm text-gray-600 hover:text-gray-800 underline"
          >
            Reset Position & Zoom
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-4 pb-6">
          <button
            type="button"
            className="flex-1 px-6 py-3 rounded-lg border border-gray-300 bg-white text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            onClick={onCancel}
            disabled={cropping}
          >
            Cancel
          </button>
          <button
            type="button"
            className="flex-1 px-6 py-3 rounded-lg bg-[#F57979] text-white font-bold hover:bg-[#F57979]/90 disabled:opacity-50 transition-colors"
            onClick={handleCrop}
            disabled={cropping}
          >
            {cropping ? 'Processing...' : isLast ? 'Use This Photo' : 'Next: Back Side'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IDCropWizardModal;
