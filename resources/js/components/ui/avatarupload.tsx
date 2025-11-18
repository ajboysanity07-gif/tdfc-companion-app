import React, { useRef, useState } from "react";
import AvatarCropModal from "./avatar-crop-modal"; // Update import!
import { Plus } from "lucide-react";

type Props = {
  onFile: (file: File) => void;
  previewUrl?: string | null;
  label?: string;
  isAuthenticated?: boolean;
  userId?: string | number;
};

export default function AvatarUpload({
  onFile,
  previewUrl,
  label,
  isAuthenticated = false,
  userId
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [modalSrc, setModalSrc] = useState<string | null>(null);

  const handlePick = () => inputRef.current?.click();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setModalSrc(String(reader.result));
    reader.readAsDataURL(f);
  };

  // Use-callback for modal (when cropping done)
  const handleCroppedFile = (file: File) => {
    onFile(file);
    setModalSrc(null);
  };

  return (
    <>
      <div className="flex items-center gap-4">
        <div
          className="broken-ring grid h-24 w-24 place-items-center rounded-full text-[--color-brand] ring-2 ring-black/5"
          onClick={handlePick}
          role="button"
          aria-label="Upload avatar"
          title="Upload"
        >
          {previewUrl ? (
            <img className="h-24 w-24 rounded-full object-cover" src={previewUrl} alt="Avatar preview" />
          ) : (
            <Plus className="h-8 w-8" />
          )}
        </div>
        {label && <span className="text-sm text-black/70">{label}</span>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onChange}
      />
      {modalSrc && (
        <AvatarCropModal
          src={modalSrc}
          aspect={1}
          initialZoom={1}
          isAuthenticated={isAuthenticated ?? false}
          userId={userId}
          onCancel={() => setModalSrc(null)}
          onCroppedFile={handleCroppedFile}
        />
      )}
    </>
  );
}
