import React, { useState, useEffect } from "react";
import PrcIdCropBox from "./prc-id-crop-box";

type Props = {
  open: boolean;
  frontImage: File | null;
  backImage: File | null;
  onCancel: () => void;
  onSave: (front: File | null, back: File | null) => void;
};

const aspectRect = 1.8;

const PrcIdCropModal: React.FC<Props> = ({
  open,
  frontImage,
  backImage,
  onCancel,
  onSave
}) => {
  const [front, setFront] = useState<File | null>(frontImage);
  const [back, setBack] = useState<File | null>(backImage);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);

  useEffect(() => {
    setFront(frontImage);
    setBack(backImage);
    setFrontPreview(null);
    setBackPreview(null);
  }, [frontImage, backImage, open]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    // Target the true scroll container
    const scrollContainer = document.querySelector('.min-h-screen');
    if (open && scrollContainer) {
      (scrollContainer as HTMLElement).style.overflow = 'hidden';
    } else if (scrollContainer) {
      (scrollContainer as HTMLElement).style.overflow = '';
    }
    return () => {
      if (scrollContainer) (scrollContainer as HTMLElement).style.overflow = '';
    };
  }, [open]);

  return open ? (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div
        className="bg-white shadow-2xl max-w-md w-full mx-auto flex flex-col h-screen md:h[650px] md:max-h-[90vh] md:rounded-xl"
        style={{ maxWidth: "100vw", maxHeight: "100vh" }}
      >
        <div className="overflow-y-auto py-7 px-5 w-full flex-1 flex flex-col">
          <div className="mb-4">
            <h2 className="text-center font-bold text-2xl text-[#F57979] mb-2 tracking-tight">
              Upload PRC ID Photos
            </h2>
            <div className="w-full border-b border-gray-200"></div>
          </div>

          <PrcIdCropBox
            label="Front ID"
            aspect={aspectRect}
            value={front}
            onChange={setFront}
            previewUrl={frontPreview}
            onPreviewUpdate={setFrontPreview}
            onDone={() => {}}
          />
          <PrcIdCropBox
            label="Back ID"
            aspect={aspectRect}
            value={back}
            onChange={setBack}
            previewUrl={backPreview}
            onPreviewUpdate={setBackPreview}
            onDone={() => {}}
          />

          <div className="w-full mt-6 mb-3">
            <div className="flex flex-row justify-center gap-8">
              <div className="flex flex-col items-center">
                <div className="bg-white border border-gray-300 shadow rounded-xl w-32 h-18 flex items-center justify-center">
                  {frontPreview ? (
                    <img src={frontPreview} className="w-full h-full object-cover rounded-xl" alt="Front Preview" />
                  ) : (
                    <span className="text-xs text-gray-400">No Photo</span>
                  )}
                </div>
                <span className="mt-2 text-xs text-gray-600 text-center">Front ID</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-white border border-gray-300 shadow rounded-xl w-32 h-18 flex items-center justify-center">
                  {backPreview ? (
                    <img src={backPreview} className="w-full h-full object-cover rounded-xl" alt="Back Preview" />
                  ) : (
                    <span className="text-xs text-gray-400">No Photo</span>
                  )}
                </div>
                <span className="mt-2 text-xs text-gray-600 text-center">Back ID</span>
              </div>
            </div>
          </div>

          <div className="flex flex-row gap-4 w-full justify-center items-end mt-6 mb-2">
            <button
              type="button"
              className="w-36 py-3 border rounded-xl border-gray-300 bg-white text-black font-semibold transition hover:bg-gray-100"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!frontPreview || !backPreview}
              className="w-36 py-3 rounded-xl bg-[#F57979] text-white font-bold shadow-md transition hover:bg-[#ea5b5b] disabled:opacity-50"
              onClick={() => onSave(front, back)}
            >
              Use Both Photos
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : null;
};

export default PrcIdCropModal;
