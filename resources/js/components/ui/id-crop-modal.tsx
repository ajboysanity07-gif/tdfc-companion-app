// resources/js/components/ui/DocumentCropModal.tsx
import React, { useRef, useState } from "react";
import Cropper, { Area } from "react-easy-crop";

type Props = {
  /** image data URL or object URL to crop */
  src: string;
  /** original filename to display / preserve in the form */
  originalName?: string | null;
  /** called when user cancels */
  onCancel: () => void;
  /**
   * returns a cropped File (PNG) AND the display name you should show in the form
   * (usually the original filename)
   */
  onCroppedFile: (file: File, displayName: string) => void;
  /** optional: default zoom */
  initialZoom?: number;
  /** rectangular aspect ratio, default ~ID card (85.6×54mm) */
  aspect?: number; // width / height
};

export default function DocumentCropModal({
  src,
  originalName = null,
  onCancel,
  onCroppedFile,
  initialZoom = 1,
  aspect = 1.586, // landscape
}: Props) {
  const [localSrc, setLocalSrc] = useState<string>(src);
  const [localName, setLocalName] = useState<string | null>(originalName);

  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(initialZoom);
  const [area, setArea] = useState<Area | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const onComplete = (_: Area, pixels: Area) => setArea(pixels);

  const handleUse = async () => {
    if (!area) return;
    const blob = await cropToBlob(localSrc, area);
    const displayName = localName ?? "PRC_ID.png";
    const file = new File([blob], displayName, { type: "image/png" });
    onCroppedFile(file, displayName);
  };

  const openChooser = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setLocalSrc(url);
    setLocalName(f.name);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-xl p-3 sm:p-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header with Change Photo */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <div className="text-left text-[15px] font-semibold text-black/40">
            Fit your PRC ID inside the crop
          </div>
          <div className="flex items-center gap-2">
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            <button
              type="button"
              onClick={openChooser}
              className="inline-flex items-center rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-black/80 hover:bg-black/5"
            >
              Change Photo
            </button>
          </div>
        </div>

        {/* Crop area */}
        <div className="relative h-[58vh] sm:h-[62vh]">
          <Cropper
            image={localSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            cropShape="rect"
            objectFit="contain"
            showGrid={false}
            restrictPosition={true}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onComplete}
          />
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-4 px-4 pb-4 pt-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Zoom slider */}
          <div className="flex w-full items-center gap-3 sm:max-w-md">
            <label htmlFor="doc-zoom" className="whitespace-nowrap text-sm font-medium text-black/70">
              Zoom
            </label>
            <input
              id="doc-zoom"
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full accent-[#3B82F6]"
              aria-label="Zoom"
            />
            <span className="w-12 text-right text-xs tabular-nums text-black/50">{zoom.toFixed(2)}×</span>
          </div>

          <div className="flex w-full items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-black/80 hover:bg-black/5"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUse}
              className="inline-flex items-center rounded-full bg-[#F57979] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-95"
            >
              Use Photo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* helpers */
async function cropToBlob(imageSrc: string, area: Area): Promise<Blob> {
  const img = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const w = Math.round(area.width);
  const h = Math.round(area.height);
  canvas.width = w;
  canvas.height = h;
  ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, w, h);
  return new Promise((resolve) => {
    canvas.toBlob((b) => resolve((b as Blob) ?? new Blob()), "image/png", 0.92);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.crossOrigin = "anonymous";
    img.src = src;
  });
}
