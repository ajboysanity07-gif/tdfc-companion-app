import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Cropper, { Area, MediaSize } from "react-easy-crop";
import { router } from '@inertiajs/react';

type Props = {
  src: string;
  onCancel: () => void;
  onCroppedFile: (file: File) => void;
  initialZoom?: number;
  aspect?: number;
  isAuthenticated?: boolean;
  userId?: string | number;
};

export default function AvatarCropModal({
  src,
  onCancel,
  onCroppedFile,
  initialZoom = 1,
  aspect = 1,
  isAuthenticated = false,
  userId,
}: Props) {
  const [localSrc, setLocalSrc] = useState<string>(src);
  const [internalUrlToRevoke, setInternalUrlToRevoke] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(initialZoom);
  const [minZoom, setMinZoom] = useState<number>(1);
  const [area, setArea] = useState<Area | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [container, setContainer] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  useEffect(() => {
    const measure = () => {
      if (!containerRef.current) return;
      const r = containerRef.current.getBoundingClientRect();
      setContainer({ w: r.width, h: r.height });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const cropSize = useMemo(() => {
    const side = Math.max(0, Math.min(container.w, container.h) * 0.82);
    return side > 0 ? { width: side, height: side } : undefined;
  }, [container.w, container.h]);

  const handleComplete = (_: Area, pixels: Area) => setArea(pixels);

  // Keep the loaded media size so minZoom is recomputed whenever the crop circle OR the image changes.
  // (Previously this ran once on image load; if the container hadn't been measured yet it bailed out,
  // leaving the photo smaller than the circle and locked by restrictPosition, so it could not be dragged.)
  const [media, setMedia] = useState<MediaSize | null>(null);
  const handleMediaLoaded = useCallback((ms: MediaSize) => setMedia(ms), []);

  useEffect(() => {
    if (!media || !cropSize) return;
    // Smallest zoom at which the photo fully covers the circle.
    const required = Math.max(cropSize.width / media.width, cropSize.height / media.height, 1);
    setMinZoom(required);
    setZoom((z) => Math.min(Math.max(z, required), 4));
  }, [media, cropSize]);

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(minZoom);
  };

  const handleUse = async () => {
    if (!area) return;
    const blob = await cropToBlob(localSrc, area);
    const file = new File([blob], "avatar.png", { type: "image/png" });
    onCroppedFile(file);
    if (internalUrlToRevoke) {
      URL.revokeObjectURL(internalUrlToRevoke);
      setInternalUrlToRevoke(null);
    }
  };

  const handleUploadPhoto = async () => {
    if (!area || !isAuthenticated) return;

    setIsUploading(true);
    try {
      const blob = await cropToBlob(localSrc, area);
      const file = new File([blob], "avatar.png", { type: "image/png" });

      const formData = new FormData();
      formData.append('avatar', file);
      if (userId) {
        formData.append('user_id', userId.toString());
      }

      router.post('/profile/avatar', formData, {
        onSuccess: () => {
          console.log('Avatar uploaded successfully');
          onCroppedFile(file);
          if (internalUrlToRevoke) {
            URL.revokeObjectURL(internalUrlToRevoke);
            setInternalUrlToRevoke(null);
          }
          window.location.reload();
        },
        onError: (errors) => {
          console.error('Avatar upload failed:', errors);
          alert('Failed to upload avatar. Please try again.');
        },
        forceFormData: true
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Failed to upload avatar. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    if (internalUrlToRevoke) URL.revokeObjectURL(internalUrlToRevoke);
    setInternalUrlToRevoke(url);
    setLocalSrc(url);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setMedia(null);
  };

  const handleCancel = () => {
    if (internalUrlToRevoke) URL.revokeObjectURL(internalUrlToRevoke);
    onCancel();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-xl p-3 sm:p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-card shadow-2xl">
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <div className="text-left text-[15px] font-semibold text-foreground/40">Crop your photo</div>
          <div className="flex items-center gap-2">
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground/80 hover:bg-foreground/5"
            >
              Change Photo
            </button>
          </div>
        </div>
        <div ref={containerRef} className="relative h-[58vh] touch-none select-none sm:h-[62vh]">
          <Cropper
            image={localSrc}
            crop={crop}
            zoom={zoom}
            minZoom={minZoom}
            maxZoom={4}
            aspect={aspect}
            cropShape="round"
            cropSize={cropSize}
            objectFit="contain"
            showGrid={false}
            restrictPosition={true}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleComplete}
            onMediaLoaded={handleMediaLoaded}
            zoomWithScroll
            style={{ containerStyle: { cursor: "grab" }, cropAreaStyle: { border: "2px solid rgba(255,255,255,.9)" } }}
          />
          <p className="pointer-events-none absolute inset-x-0 bottom-2 text-center text-xs font-medium text-white/90 [text-shadow:0_1px_3px_rgba(0,0,0,.6)]">
            Drag to move · Scroll or pinch to zoom
          </p>
        </div>
        <div className="flex flex-col gap-4 px-4 pb-4 pt-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full items-center gap-3 sm:max-w-md">
            <label htmlFor="avatar-zoom" className="whitespace-nowrap text-sm font-medium text-foreground/70">
              Zoom
            </label>
            <input
              id="avatar-zoom"
              type="range"
              min={minZoom}
              max={4}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full accent-brand-blue"
              aria-label="Zoom"
            />
            <span className="w-12 text-right text-xs tabular-nums text-foreground/50">{zoom.toFixed(2)}×</span>
            <button type="button" onClick={handleReset} className="text-xs font-semibold text-foreground/70 underline-offset-2 hover:underline">
              Reset
            </button>
          </div>
          <div className="flex w-full items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground/80 hover:bg-foreground/5"
            >
              Close
            </button>
            {isAuthenticated && (
              <button
                type="button"
                onClick={handleUploadPhoto}
                disabled={isUploading}
                className="inline-flex items-center rounded-full bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </>
                ) : (
                  'Upload Photo'
                )}
              </button>
            )}
            {!isAuthenticated && (
              <button
                type="button"
                onClick={handleUse}
                className="inline-flex items-center rounded-full bg-brand-red px-5 py-2.5 text-sm font-semibold text-brand-ink hover:opacity-95"
              >
                Use Photo
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

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
