import React, { useRef, useState } from "react";
import Cropper, { Area } from "react-easy-crop";
import { prcIdGetCroppedImg } from "@/utils/prc-id-get-cropped-img";
import { RotateCcw, RefreshCw, Crop } from "lucide-react";

// Props for the crop box
type Props = {
  label: string;
  aspect?: number;
  value: File | null;
  onChange: (file: File | null) => void;
  previewUrl?: string | null;
  onPreviewUpdate?: (url: string | null) => void;
  onDone: () => void;
};

function fileToUrl(file: File | null): string | null {
  return file ? URL.createObjectURL(file) : null;
}

const PrcIdCropBox: React.FC<Props> = ({
  label,
  aspect = 1.586, // ID-1 ratio (e.g., PH driver's license / PRC ID)
  value,
  onChange,
  onPreviewUpdate = () => {},
  onDone,
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(fileToUrl(value));
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) {
      const url = URL.createObjectURL(f);
      setImageSrc(url);
      onChange(f);
      onPreviewUpdate(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
    }
  }

  async function confirmCropAndAdvance() {
    if (imageSrc && croppedAreaPixels) {
      const blob = await prcIdGetCroppedImg(imageSrc, croppedAreaPixels, rotation);
      const croppedFile = new File([blob], "cropped.jpg", { type: "image/jpeg" });
      const url = URL.createObjectURL(croppedFile);
      onChange(croppedFile);
      onPreviewUpdate(url);
      onDone();
    }
  }

  function resetCrop() {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  }

  function changePhoto() {
    if (fileInputRef.current) fileInputRef.current.click();
  }

  const controlsDisabled = !imageSrc;

  return (
    <div className="mb-6 flex flex-col items-center w-full">
      <label className="block text-center font-semibold mb-4 text-gray-600 text-sm tracking-wide">
        {label.toUpperCase()}
      </label>
      <div className="relative w-full max-w-[300px]" style={{ aspectRatio: aspect }}>
        <div className="absolute inset-0 flex flex-col items-center justify-center border-2 border-dashed border-gray-400 rounded-xl overflow-hidden bg-white">
          {imageSrc ? (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={aspect}
              cropShape="rect"
              showGrid={true}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
              style={{
                containerStyle: { width: "100%", height: "100%" },
                mediaStyle: { objectFit: "contain" },
              }}
            />
          ) : (
            <button
              type="button"
              className="w-full h-full flex flex-col items-center justify-center"
              onClick={() => fileInputRef.current?.click()}
            >
              <span className="bg-gray-200 text-gray-400 rounded-full w-12 h-12 flex items-center justify-center text-3xl font-bold">
                +
              </span>
              <span className="block mt-2 text-sm text-gray-400">Add Photo</span>
            </button>
          )}
        </div>
      </div>
      <div className="flex flex-col items-center w-full mt-4">
{/* Zoom Control (centered and smaller) */}
<div className="flex items-center gap-3 w-[280px] mx-auto mt- mb-3">
  <span className="text-xs text-gray-500 font-medium">Zoom</span>
  <input
    type="range"
    min={1}
    max={3}
    step={0.01}
    value={zoom}
    disabled={controlsDisabled}
    onChange={(e) => setZoom(Number(e.target.value))}
    className={`flex-1 accent-[#F57979] h-3 ${
      controlsDisabled ? "opacity-40 cursor-not-allowed" : ""
    }`}
    style={{
      maxWidth: "220px",
      minWidth: "120px",
      height: "20px",
      accentColor: "#F57979",
    }}
  />
</div>

{/* Rotation Control */}
<div className="flex items-center gap-3 w-[280px] mx-auto mb-3">
  <span className="text-xs text-gray-500 font-medium">Rotate</span>
  <input
    type="range"
    min={-180}
    max={180}
    step={1}
    value={rotation}
    disabled={controlsDisabled}
    onChange={(e) => setRotation(Number(e.target.value))}
    className={`flex-1 accent-[#F57979] h-3 ${controlsDisabled ? "opacity-40 cursor-not-allowed" : ""}`}
    style={{
      maxWidth: "220px",
      minWidth: "120px",
      height: "20px",
      accentColor: "#F57979",
    }}
  />
  <span className="text-xs text-gray-500 w-10 text-right">{rotation}°</span>
</div>

        {/* ===== SCALED VERTICAL BUTTONS ===== */}
        <div className="flex flex-col gap-4 w-full max-w-sm mt-4">
          <button
            type="button"
            disabled={controlsDisabled}
            className={`w-[260px] mx-auto py-2 px-4 text-sm font-semibold rounded-full transition flex items-center justify-center gap-2 ${
              controlsDisabled
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-[#F57979] text-white shadow hover:bg-[#ea5b5b]"
            }`}
            onClick={confirmCropAndAdvance}
          >
            <Crop className="w-4 h-4" />
            Crop this photo
          </button>
          <button
            type="button"
            disabled={controlsDisabled}
            className={`w-[260px] mx-auto py-2 px-4 text-sm font-semibold rounded-full transition flex items-center justify-center gap-2 ${
              controlsDisabled
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
            }`}
            onClick={resetCrop}
          >
            <RotateCcw className="w-4 h-4" />
            Reset Crop
          </button>
          <button
            type="button"
            disabled={controlsDisabled}
            className={`w-[260px] mx-auto py-2 px-4 text-sm font-semibold rounded-full transition flex items-center justify-center gap-2 ${
              controlsDisabled
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-blue-50 text-blue-600 border border-blue-500 hover:bg-blue-100"
            }`}
            onClick={changePhoto}
          >
            <RefreshCw className="w-4 h-4" />
            Change Photo
          </button>
        </div>
      </div>
      <input
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        ref={fileInputRef}
        onChange={handleFile}
      />
    </div>
  );
};

export default PrcIdCropBox;





