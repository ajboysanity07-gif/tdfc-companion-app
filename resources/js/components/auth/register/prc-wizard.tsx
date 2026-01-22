import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Upload, Camera, RotateCcw, SwitchCamera, CircleCheckBig } from "lucide-react";
import PrcIdCropBox from "./prc-id-crop-box";
import CameraCaptureBox from "./camera-capture-box";

type WizardMode = "upload" | "camera" | null;
type WizardStep = 1 | 2 | 3 | 4;
const aspectRect = 1.586; // ID-1 ratio for PH IDs (e.g., driver's license, PRC ID)

const StepHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="w-full flex flex-col items-center sticky top-0 z-20 bg-white pt-2 pb-2 border-b border-gray-200">
    <span className="text-xl font-bold text-[#F57979] tracking-tight mb-2 mt-1">{children}</span>
  </div>
);

const SamplePreview: React.FC<{ showFront?: boolean; showBack?: boolean; caption: string }> = ({
  showFront,
  showBack,
  caption,
}) => (
  <div className="w-full flex flex-col items-center mb-2 mt-4">
    {showFront && (
      <img
        src="/images/prc-sample-front.png"
        alt="PRC ID Sample Front"
        className="w-[70vw] max-w-[300px] h-auto object-contain mb-4 mt-5"
      />
    )}
    {showBack && (
      <img
        src="/images/prc-sample-back.png"
        alt="PRC ID Sample Back"
        className="w-[70vw] max-w-[300px] h-auto object-contain mb-4 mt-5"
      />
    )}
    <div className="bg-blue-50 rounded-xl p-4 mb-5 border w-[80vw] max-w-[300px] text-center border-blue-100">
      <span className="block text-xs text-blue-500">{caption}</span>
    </div>
  </div>
);

const panelVariants = {
  enter: (direction: "right" | "left") => ({
    x: direction === "right" ? 320 : -320,
    opacity: 0,
    position: "absolute",
  }),
  center: { x: 0, opacity: 1, position: "relative" },
  exit: (direction: "right" | "left") => ({
    x: direction === "right" ? -320 : 320,
    opacity: 0,
    position: "absolute",
  }),
};

const PRCIDWizard = ({
  open,
  onCancel,
  onComplete,
}: {
  open: boolean;
  onCancel: () => void;
  onComplete: (front: File | null, back: File | null) => void;
}) => {
  const [step, setStep] = useState<WizardStep>(1);
  const [mode, setMode] = useState<WizardMode>(null);

  const [direction, setDirection] = useState<"right" | "left">("right");
  const goToStep = (next: WizardStep) => {
    setDirection(next > step ? "right" : "left");
    setStep(next);
  };

  const [uploadFront, setUploadFront] = useState<File | null>(null);
  const [uploadFrontPreview, setUploadFrontPreview] = useState<string | null>(null);
  const [uploadBack, setUploadBack] = useState<File | null>(null);
  const [uploadBackPreview, setUploadBackPreview] = useState<string | null>(null);

  const [cameraFront, setCameraFront] = useState<File | null>(null);
  const [cameraFrontPreview, setCameraFrontPreview] = useState<string | null>(null);
  const [cameraBack, setCameraBack] = useState<File | null>(null);
  const [cameraBackPreview, setCameraBackPreview] = useState<string | null>(null);

  const resetWizard = () => {
    setStep(1);
    setMode(null);
    setUploadFront(null);
    setUploadFrontPreview(null);
    setUploadBack(null);
    setUploadBackPreview(null);
    setCameraFront(null);
    setCameraFrontPreview(null);
    setCameraBack(null);
    setCameraBackPreview(null);
    setDirection("right");
  };

  function dataURLtoFile(dataurl: string, filename: string): File {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  }

  function getFinalPreviews() {
    if (mode === "upload") {
      return { front: uploadFrontPreview, back: uploadBackPreview };
    }
    return { front: cameraFrontPreview, back: cameraBackPreview };
  }

  function getFinalFiles() {
    if (mode === "upload") {
      return { front: uploadFront, back: uploadBack };
    }
    return { front: cameraFront, back: cameraBack };
  }

  const switchToCamera = () => {
    setUploadFront(null);
    setUploadFrontPreview(null);
    setUploadBack(null);
    setUploadBackPreview(null);
    setMode("camera");
    goToStep(2);
  };

  const reUploadPhotos = () => {
    setUploadFront(null);
    setUploadFrontPreview(null);
    setUploadBack(null);
    setUploadBackPreview(null);
    goToStep(2);
  };

  const reTakePhotos = () => {
    setCameraFront(null);
    setCameraFrontPreview(null);
    setCameraBack(null);
    setCameraBackPreview(null);
    goToStep(2);
  };

  // Lock parent scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="bg-white shadow-2xl w-full mx-auto flex flex-col relative
                      h-screen md:h-[85vh] md:rounded-2xl md:max-w-lg
                      overflow-hidden"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 200 }}
          >
            <div
              className="overflow-y-auto overflow-x-hidden flex items-start px-5 py-5 w-full flex-1 min-h-0 scrollbar-thin"
            >
              <AnimatePresence custom={direction} mode="wait" initial={false}>
                <motion.div
                  key={step + "|" + mode}
                  custom={direction}
                  variants={panelVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    type: "tween",
                    ease: "easeInOut",
                    duration: 0.3,
                  }}
                  className="w-full"
                >
                  {step === 1 && (
                    <>
                      <StepHeader>Upload your PRC ID</StepHeader>
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
                        <SamplePreview
                          showFront
                          showBack
                          caption="Your PRC ID photos (front and back) should be clear and all details legible."
                        />
                      </motion.div>
                      <div className="flex flex-col items-center">
                        <p className="text-sm text-gray-600 mb-3 w-[80vw] max-w-[300px] text-center">
                          Choose how you'd like to provide your PRC ID photos
                        </p>
                        <div className="space-y-4 w-full max-w-xs">
                          <button
                            type="button"
                            className="w-full px-6 py-4 bg-[#F57979] hover:bg-[#ea5b5b] text-white rounded-xl font-bold shadow-md transition flex items-center justify-center gap-3"
                            onClick={() => {
                              setMode("upload");
                              goToStep(2);
                            }}
                          >
                            <Upload className="w-5 h-5" />
                            Upload a Photo
                          </button>
                          <button
                            type="button"
                            className="w-full px-6 py-4 bg-[#F57979] hover:bg-[#ea5b5b] text-white rounded-xl font-bold shadow-md transition flex items-center justify-center gap-3"
                            onClick={() => {
                              setMode("camera");
                              goToStep(2);
                            }}
                          >
                            <Camera className="w-5 h-5" />
                            Use a Camera
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {step === 2 && mode === "upload" && (
                    <>
                      <StepHeader>Upload Front PRC ID</StepHeader>
                      <SamplePreview
                        showFront
                        caption="Upload a photo of your PRC ID's front side. Make sure it's clear, legible, and no sections are cut off."
                      />
                      <div className="w-[310px] place-self-center h-px bg-gray-200 mb-5" />
                      <PrcIdCropBox
                        label="Front PRC ID"
                        aspect={aspectRect}
                        value={uploadFront}
                        onChange={setUploadFront}
                        previewUrl={uploadFrontPreview}
                        onPreviewUpdate={setUploadFrontPreview}
                        onDone={() => goToStep(3)}
                      />
                    </>
                  )}

                  {step === 3 && mode === "upload" && (
                    <>
                      <StepHeader>Upload Back PRC ID</StepHeader>
                      <SamplePreview
                        showBack
                        caption="Now upload the back side. Ensure the back is well-lit and text is crisp."
                      />
                      <div className="w-[310px] place-self-center h-px bg-gray-200 mb-5" />
                      <PrcIdCropBox
                        label="Back PRC ID"
                        aspect={aspectRect}
                        value={uploadBack}
                        onChange={setUploadBack}
                        previewUrl={uploadBackPreview}
                        onPreviewUpdate={setUploadBackPreview}
                        onDone={() => goToStep(4)}
                      />
                    </>
                  )}

                  {step === 2 && mode === "camera" && (
                    <>
                      <StepHeader>Take Front PRC ID Photo</StepHeader>
                      <SamplePreview
                        showFront
                        caption="Capture a clear photo of the front. Align your PRC ID with the example shown."
                      />
                      <div className="w-[310px] place-self-center h-px bg-gray-200 mb-5" />
                      <CameraCaptureBox
                        label="Front PRC ID"
                        onCapture={(imgSrc) => {
                          const file = dataURLtoFile(imgSrc, "front-prc-id.jpg");
                          setCameraFront(file);
                          setCameraFrontPreview(imgSrc);
                          goToStep(3);
                        }}
                      />
                    </>
                  )}

                  {step === 3 && mode === "camera" && (
                    <>
                      <StepHeader>Take Back PRC ID Photo</StepHeader>
                      <SamplePreview
                        showBack
                        caption="Capture the back. Make sure the backside is not blurred or cropped out."
                      />
                      <div className="w-[310px] place-self-center h-px bg-gray-200 mb-5" />
                      <CameraCaptureBox
                        label="Back PRC ID"
                        onCapture={(imgSrc) => {
                          const file = dataURLtoFile(imgSrc, "back-prc-id.jpg");
                          setCameraBack(file);
                          setCameraBackPreview(imgSrc);
                          goToStep(4);
                        }}
                      />
                    </>
                  )}

                  {step === 4 && (
  <>
    <StepHeader>Review Your PRC IDs</StepHeader>
    <div className="flex flex-row items-center justify-center gap-4 mt-4 mb-2">
      <img
        src="/images/prc-sample-front.png"
        alt="PRC ID Sample Front"
        className="w-40 rounded-lg border border-gray-200 shadow-sm"
      />
      <img
        src="/images/prc-sample-back.png"
        alt="PRC ID Sample Back"
        className="w-40 rounded-lg border border-gray-200 shadow-sm"
      />
    </div>
    <div className="bg-blue-50 rounded-xl p-3 mb-5 mt-2 border text-center border-blue-100 w-full max-w-[320px] mx-auto">
      <span className="block text-xs text-blue-500">
        Compare your submitted PRC IDs to these samples. Only proceed if your uploads match the clarity and alignment.
      </span>
    </div>
    <div className="w-40 place-self-center h-px bg-gray-200 mb-3" />
    <div className="flex flex-col items-center justify-center w-full">
      <span className="mb-2 text-base font-bold text-gray-700">Front PRC ID</span>
      <div className="bg-white border-2 border-gray-300 shadow-lg rounded-xl w-60 h-[136px] flex items-center justify-center mb-4">
        {getFinalPreviews().front ? (
          <img
            src={getFinalPreviews().front!}
            className="w-full h-full object-cover rounded-xl"
            alt="Front PRC ID Preview"
          />
        ) : (
          <span className="text-sm text-gray-400">No Photo</span>
        )}
      </div>

      <span className="mb-2 text-base font-bold text-gray-700">Back PRC ID</span>
      <div className="bg-white border-2 border-gray-300 shadow-lg rounded-xl w-60 h-[136px] flex items-center justify-center mb-3">
        {getFinalPreviews().back ? (
          <img
            src={getFinalPreviews().back!}
            className="w-full h-full object-cover rounded-xl"
            alt="Back PRC ID Preview"
          />
        ) : (
          <span className="text-sm text-gray-400">No Photo</span>
        )}
      </div>


                        <div className="flex flex-col gap-4 w-[260px] mx-auto px-0">
                          {mode === "upload" && (
                            <button
                              type="button"
                              className="w-full py-2 px-4 text-sm font-semibold border border-blue-500 bg-blue-50 text-blue-600 rounded-full transition hover:bg-blue-100 flex items-center justify-center gap-2"
                              onClick={switchToCamera}
                            >
                              <Camera className="w-4 h-4" />
                              Use Camera Instead
                            </button>
                          )}
                          {mode === "upload" && (
                            <button
                              type="button"
                              className="w-full py-2 px-4 text-sm font-semibold border border-gray-300 bg-gray-50 text-gray-700 rounded-full transition hover:bg-gray-100 flex items-center justify-center gap-2"
                              onClick={reUploadPhotos}
                            >
                              <RotateCcw className="w-4 h-4" />
                              Re-Upload Photos
                            </button>
                          )}
                          {mode === "camera" && (
                            <button
                              type="button"
                              className="w-full py-2 px-4 text-sm font-semibold border border-gray-300 bg-gray-50 text-gray-700 rounded-full transition hover:bg-gray-100 flex items-center justify-center gap-2"
                              onClick={reTakePhotos}
                            >
                              <RotateCcw className="w-4 h-4" />
                              Retake Photos
                            </button>
                          )}
                          {mode === "camera" && (
                            <button
                              type="button"
                              className="w-full py-2 px-4 text-sm font-semibold border border-blue-500 bg-blue-50 text-blue-600 rounded-full transition hover:bg-blue-100 flex items-center justify-center gap-2"
                              onClick={reUploadPhotos}
                            >
                              <SwitchCamera className="w-4 h-4" />
                              Upload Photos Instead
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={!getFinalPreviews().front || !getFinalPreviews().back}
                            className="w-full py-2 px-4 text-sm font-semibold rounded-full bg-[#F57979] text-white shadow transition hover:bg-[#ea5b5b] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            onClick={() => {
                              const { front, back } = getFinalFiles();
                              onComplete(front, back);
                              resetWizard();
                            }}
                          >
                            <CircleCheckBig className="w-4 h-4" />
                            Use Both Photos
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="sticky bottom-0 left-0 w-full py-4 px-5 flex flex-row gap-4 justify-center items-center bg-white border-t border-gray-200 shadow-lg shrink-0">
              <button
                type="button"
                className="w-32 py-3 border rounded-full border-gray-300 bg-white text-black font-semibold transition hover:bg-gray-50"
                onClick={() => {
                  if (step === 1) {
                    resetWizard();
                    onCancel();
                  } else {
                    goToStep((step - 1) as WizardStep);
                  }
                }}
              >
                Back
              </button>
              <button
                type="button"
                className="w-32 py-3 border rounded-full border-gray-300 bg-gray-100 text-black font-semibold transition hover:bg-gray-200"
                onClick={() => {
                  resetWizard();
                  onCancel();
                }}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default PRCIDWizard;
