import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Upload, Camera, RotateCcw, SwitchCamera, CircleCheckBig } from "lucide-react";
import PrcIdCropBox from "./prc-id-crop-box";
import CameraCaptureBox from "./camera-capture-box";

type WizardMode = "upload" | "camera" | null;
type WizardStep = 1 | 2 | 3;
const aspectRect = 2.37;

const StepHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="w-full flex flex-col items-center sticky top-0 z-20 bg-white pt-2 pb-2 border-b border-gray-200">
    <span className="text-xl font-bold text-[#F57979] tracking-tight mb-2 mt-1">{children}</span>
  </div>
);

const SamplePreview: React.FC<{ showFront?: boolean; caption: string }> = ({
  showFront,
  caption,
}) => (
  <div className="w-full flex flex-col items-center mb-2 mt-4">
    {showFront && (
      <img
        src="/images/sample-payslip.png"
        alt="Payslip Sample Front"
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

const PayslipWizard = ({
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
  const [cameraFront, setCameraFront] = useState<File | null>(null);
  const [cameraFrontPreview, setCameraFrontPreview] = useState<string | null>(null);

  // Prevent parent scroll when wizard is open
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

  const resetWizard = () => {
    setStep(1);
    setMode(null);
    setUploadFront(null);
    setUploadFrontPreview(null);
    setCameraFront(null);
    setCameraFrontPreview(null);
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
      return { front: uploadFrontPreview };
    }
    return { front: cameraFrontPreview };
  }

  function getFinalFiles() {
    if (mode === "upload") {
      return { front: uploadFront };
    }
    return { front: cameraFront };
  }

  const switchToCamera = () => {
    setUploadFront(null);
    setUploadFrontPreview(null);
    setMode("camera");
    goToStep(2);
  };

  const reUploadPhotos = () => {
    setUploadFront(null);
    setUploadFrontPreview(null);
    goToStep(2);
  };

  const reTakePhotos = () => {
    setCameraFront(null);
    setCameraFrontPreview(null);
    goToStep(2);
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center md:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Modal body with fixed height (desktop) and scrollable main area */}
          <motion.div
            className="bg-white shadow-2xl w-full mx-auto flex flex-col relative overflow-hidden
                      h-screen md:h-[820px] md:max-h-[90vh] md:rounded-2xl md:max-w-lg"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 200 }}
          >
            {/* Main content and step wizard: fill space, vertically center 100% */}
            <div className="flex-1 min-h-0 flex flex-col px-5 w-full relative">
              <AnimatePresence custom={direction} mode="wait">
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
                  className="w-full h-full"
                >
{step === 1 && (

    <div>
      <StepHeader>Upload your Payslip</StepHeader>
        <div className="m-auto flex flex-col items-center justify-center w-full md:mt-20" style={{ marginTop: '120px' }}>
      <SamplePreview
        showFront
        caption="*Your payslip photo should be clear and all text readable."
      />
      <p className="text-sm text-gray-600 mb-3 mt-2 w-[80vw] max-w-[300px] text-center">
        Choose how you'd like to provide your Payslip photos
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
  </div>
)}
                  {step === 2 && mode === "upload" && (
                    <>
                      <StepHeader>Upload Your Payslip</StepHeader>
                      <div className="m-auto flex flex-col items-center justify-center w-full md:mt-20" style={{ marginTop: '45px' }}></div>
                      <SamplePreview
                        showFront
                        caption="Upload a photo of your payslip. Make sure it's clear, legible, and no corners are cut off."
                      />
                      <div className="w-[310px] place-self-center h-px bg-gray-200 mb-5" />
                      <PrcIdCropBox
                        label="Payslip"
                        aspect={aspectRect}
                        value={uploadFront}
                        onChange={setUploadFront}
                        previewUrl={uploadFrontPreview}
                        onPreviewUpdate={setUploadFrontPreview}
                        onDone={() => goToStep(3)}
                      />
                    </>
                  )}

                  {step === 2 && mode === "camera" && (
                    <>
                      <StepHeader>Take Payslip Photo</StepHeader>
                      <SamplePreview
                        showFront
                        caption="Capture a clear photo. Align your payslip with the example shown."
                      />
                      <div className="w-[310px] place-self-center h-px bg-gray-200 mb-5" />
                      <CameraCaptureBox
                        label="Payslip"
                        onCapture={(imgSrc) => {
                          const file = dataURLtoFile(imgSrc, "payslip.jpg");
                          setCameraFront(file);
                          setCameraFrontPreview(imgSrc);
                          goToStep(3);
                        }}
                      />
                    </>
                  )}

                  {step === 3 && (
                    <>
                      <StepHeader>Review Your Payslip</StepHeader>
                      <div className="m-auto flex flex-col items-center justify-center w-full md:mt-20" style={{ marginTop: '45px' }}></div>
                      <SamplePreview
                        showFront
                        caption="Compare your submitted payslip to this sample. Only proceed if your upload matches the clarity and alignment."
                      />
                      <div className="w-[310px] place-self-center h-px bg-gray-200 mb-5" />
                      <div className="flex flex-col items-center justify-center w-full">
                        <span className="mb-3 text-base font-semibold text-gray-700">Your Payslip</span>
                        <div className="bg-white border-2 border-gray-300 shadow-lg w-[300px] h-[127px] flex items-center justify-center mb-5">
                          {getFinalPreviews().front ? (
                            <img
                              src={getFinalPreviews().front!}
                              className="w-full h-full object-cover"
                              alt="Payslip Preview"
                            />
                          ) : (
                            <span className="text-sm text-gray-400">No Photo</span>
                          )}
                        </div>

                        <div className="flex flex-col gap-4 w-[260px] mx-auto px-0">
                          {mode === "upload" && (
                            <button
                              type="button"
                              className="w-full py-2 px-4 text-sm font-semibold border border-blue-500 bg-blue-50 text-blue-600 rounded-card transition hover:bg-blue-100 flex items-center justify-center gap-2"
                              onClick={switchToCamera}
                            >
                              <Camera className="w-4 h-4" />
                              Use Camera Instead
                            </button>
                          )}
                          {mode === "upload" && (
                            <button
                              type="button"
                              className="w-full py-2 px-4 text-sm font-semibold border border-gray-300 bg-gray-50 text-gray-700 rounded-card transition hover:bg-gray-100 flex items-center justify-center gap-2"
                              onClick={reUploadPhotos}
                            >
                              <RotateCcw className="w-4 h-4" />
                              Re-Upload Photo
                            </button>
                          )}
                          {mode === "camera" && (
                            <button
                              type="button"
                              className="w-full py-2 px-4 text-sm font-semibold border border-gray-300 bg-gray-50 text-gray-700 rounded-card transition hover:bg-gray-100 flex items-center justify-center gap-2"
                              onClick={reTakePhotos}
                            >
                              <RotateCcw className="w-4 h-4" />
                              Retake Photo
                            </button>
                          )}
                          {mode === "camera" && (
                            <button
                              type="button"
                              className="w-full py-2 px-4 text-sm font-semibold border border-blue-500 bg-blue-50 text-blue-600 rounded-card transition hover:bg-blue-100 flex items-center justify-center gap-2"
                              onClick={reUploadPhotos}
                            >
                              <SwitchCamera className="w-4 h-4" />
                              Upload Photo Instead
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={!getFinalPreviews().front}
                            className="w-full py-2 px-4 text-sm font-semibold rounded-card bg-[#F57979] text-white shadow transition hover:bg-[#ea5b5b] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            onClick={() => {
                              const { front } = getFinalFiles();
                              onComplete(front, null);
                              resetWizard();
                            }}
                          >
                            <CircleCheckBig className="w-4 h-4" />
                            Use Photo
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Fixed bottom navigation / footer */}
            <div className="sticky bottom-0 left-0 w-full py-5 flex flex-row gap-4 justify-center items-center bg-white border-t border-gray-200 shadow-lg">
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

export default PayslipWizard;
