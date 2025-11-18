import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { RotateCcw, Zap, ZapOff, ZoomIn, ZoomOut } from 'lucide-react';
import { ObjectDetector, FilesetResolver } from '@mediapipe/tasks-vision';

type CameraCaptureBoxProps = {
  label?: string;
  onCapture: (imageSrc: string) => void;
};

// Capability extension types for browser APIs
interface FocusCapability {
  focusMode?: string;
  pointsOfInterest?: { x: number; y: number }[];
}
interface TorchCapability {
  torch?: boolean;
}
interface ZoomCapability {
  zoom?: number;
}

// Type guard helpers to avoid 'any'
function hasFocusMode(obj: object): obj is FocusCapability {
  return 'focusMode' in obj;
}
function hasTorch(obj: object): obj is TorchCapability {
  return 'torch' in obj;
}
function hasZoom(obj: object): obj is ZoomCapability {
  return 'zoom' in obj;
}

const CameraCaptureBox: React.FC<CameraCaptureBoxProps> = ({
  label = 'Front ID',
  onCapture,
}) => {
  const webcamRef = useRef<Webcam>(null);

  // UI state
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('Loading detector...');
  const [stableFrames, setStableFrames] = useState(0);

  // Detector & frame state
  const [detector, setDetector] = useState<ObjectDetector | null>(null);
  const [lastFrame, setLastFrame] = useState<ImageData | null>(null);

  // Camera controls
  const [torchOn, setTorchOn] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [torchSupported, setTorchSupported] = useState(false);
  const [zoomSupported, setZoomSupported] = useState(false);

  // Load MediaPipe detector on mount
  useEffect(() => {
    const initDetector = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
        const objectDetector = await ObjectDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite',
            delegate: 'GPU',
          },
          scoreThreshold: 0.2,
          runningMode: 'VIDEO',
        });
        setDetector(objectDetector);
        setStatusMessage('Position ID in frame');
      } catch (error) {
        console.error('Failed to initialize detector:', error);
        setStatusMessage('Position ID in frame');
      }
    };
    initDetector();
  }, []);

  // Check for torch/zoom capability
  useEffect(() => {
    const checkCapabilities = async () => {
      const video = webcamRef.current?.video;
      if (!video) return;
      const stream = video.srcObject as MediaStream;
      if (!stream) return;
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities();
      setTorchSupported(hasTorch(capabilities));
      setZoomSupported(hasZoom(capabilities));
    };
    const timer = setTimeout(checkCapabilities, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Detection + steady-frame logic
  useEffect(() => {
    if (showPreview || capturedImage) return;

    const detectAndCapture = async () => {
      const video = webcamRef.current?.video;
      if (!video || video.readyState !== 4 || video.videoWidth === 0) return;

      // Downsample for motion check
      const canvas = document.createElement('canvas');
      canvas.width = 160;
      canvas.height = 90;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, 160, 90);
      const currentFrame = ctx.getImageData(0, 0, 160, 90);

      // Compare with last frame for stability
      let isStable = true;
      if (lastFrame) {
        let bigChanges = 0;
        for (let i = 0; i < currentFrame.data.length; i += 200) {
          const diff = Math.abs(currentFrame.data[i] - lastFrame.data[i]);
          if (diff > 50) bigChanges++;
        }
        isStable = bigChanges < 10;
      }
      setLastFrame(currentFrame);

      // Run object detector
      let detected = true;
      if (detector) {
        try {
          const results = detector.detectForVideo(video, Date.now());
          detected = results.detections.length > 0;
        } catch (error) {
          console.error('Detection error:', error);
          detected = true;
        }
      }

      // Always null-check webcamRef.current before access
      if (detected && isStable) {
        setStableFrames(prev => prev + 1);
        setStatusMessage(`Hold steady... ${Math.min(stableFrames + 1, 4)}/4`);
        if (stableFrames >= 3) {
          setStatusMessage('Capturing...');
          // Null-check webcamRef.current before using getScreenshot
          const hdImage = webcamRef.current?.getScreenshot?.();
          if (hdImage) {
            setCapturedImage(hdImage);
            setShowPreview(true);
            setStableFrames(0);
            setLastFrame(null);
          }
        }
      } else {
        setStableFrames(0);
        setStatusMessage(isStable ? 'Position ID in frame' : 'Keep camera steady');
      }
    };

    const interval = setInterval(detectAndCapture, 300);
    return () => clearInterval(interval);
  }, [showPreview, capturedImage, detector, lastFrame, stableFrames]);

  // Tap-to-focus handler using correct type guard and suppression
// Tap-to-focus handler using correct type guard and suppression
const handleTapToFocus = async (e: React.MouseEvent<HTMLDivElement>) => {
  if (!webcamRef.current?.video || showPreview) return;
  const rect = e.currentTarget.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width;
  const y = (e.clientY - rect.top) / rect.height;
  const stream = webcamRef.current.video.srcObject as MediaStream;
  if (!stream) return;
  const track = stream.getVideoTracks()[0];
  const capabilities = track.getCapabilities();

  if (hasFocusMode(capabilities)) {
    try {
      // Build a focused constraint object and cast the final payload to MediaTrackConstraints
      // to avoid using `any` while acknowledging these are non-standard keys.
      const focusConstraint = {
        focusMode: 'single-shot',
        pointsOfInterest: [{ x, y }],
      };
      // applyConstraints accepts MediaTrackConstraints; cast the custom advanced array to that type
      await track.applyConstraints({ advanced: [focusConstraint] } as MediaTrackConstraints);
    } catch (error) {
      console.error('Tap to focus failed:', error);
    }
  }
};


  // Toggle flashlight using type guard
  const toggleTorch = async () => {
    const video = webcamRef.current?.video;
    if (!video) return;
    const stream = video.srcObject as MediaStream;
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    const capabilities = track.getCapabilities();
    if (hasTorch(capabilities)) {
      try {
        // @ts-expect-error: 'torch' is non-standard
        await track.applyConstraints({ advanced: [{ torch: !torchOn }] });
        setTorchOn(prev => !prev);
      } catch (error) {
        console.error('Toggle torch failed:', error);
      }
    }
  };

  // Adjust zoom level using type guard
  const adjustZoom = async (delta: number) => {
    const video = webcamRef.current?.video;
    if (!video) return;
    const stream = video.srcObject as MediaStream;
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    const newZoom = Math.max(1, Math.min(3, zoom + delta));
    setZoom(newZoom);
    const capabilities = track.getCapabilities();
    if (hasZoom(capabilities)) {
      try {
        // @ts-expect-error: 'zoom' is non-standard
        await track.applyConstraints({ advanced: [{ zoom: newZoom }] });
      } catch (error) {
        console.error('Adjust zoom failed:', error);
      }
    }
  };

  // Retry capture
  const handleRetry = () => {
    setCapturedImage(null);
    setShowPreview(false);
    setStableFrames(0);
    setLastFrame(null);
    setStatusMessage('Position ID in frame');
  };

  // Finalize capture
  const handleSave = () => {
    if (capturedImage) onCapture(capturedImage);
  };

  // Camera access error
  const handleCameraError = () => {
    setError('Camera access denied. Please enable camera permissions.');
  };

  return (
    <div className="flex flex-col items-center w-full px-0">
      <h3 className="font-semibold text-lg mb-4 text-gray-700">{`Capture ${label}`}</h3>
      <div
        className="border-2 border-dashed border-gray-400 mx-0 mb-6 bg-white shadow-lg relative"
        style={{ aspectRatio: '1.585', width: '100%', maxWidth: '100%', borderRadius: 18, overflow: 'hidden' }}
      >
        {error ? (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-center text-sm text-red-600 px-4">{error}</span>
          </div>
        ) : showPreview && capturedImage ? (
          <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
        ) : (
          <div className="relative w-full h-full" onClick={handleTapToFocus}>
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              screenshotQuality={1.0}
              videoConstraints={{ facingMode: 'environment', width: { min: 1920, ideal: 3840 }, height: { min: 1080, ideal: 2160 } }}
              onUserMediaError={handleCameraError}
              className="w-full h-full object-cover cursor-pointer"
            />
            {/* Overlay frame guides */}
            <div
              className="absolute top-1/2 left-1/2 pointer-events-none z-20"
              style={{ width: '80%', aspectRatio: '1.585', transform: 'translate(-50%, -50%)' }}
            >
              <div className="absolute top-0 left-0 w-12 h-12 border-l-4 border-t-4 border-white rounded-tl-xl" />
              <div className="absolute top-0 right-0 w-12 h-12 border-r-4 border-t-4 border-white rounded-tr-xl" />
              <div className="absolute bottom-0 left-0 w-12 h-12 border-l-4 border-b-4 border-white rounded-bl-xl" />
              <div className="absolute bottom-0 right-0 w-12 h-12 border-r-4 border-b-4 border-white rounded-br-xl" />
            </div>
            {/* Status message */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-70 text-white text-sm px-4 py-2 rounded-full z-30">
              {statusMessage}
            </div>
            {/* Torch & zoom controls */}
            <div className="absolute bottom-3 left-3 flex flex-col gap-2 z-30">
              {torchSupported && (
                <button
                  onClick={e => {
                    e.stopPropagation();
                    toggleTorch();
                  }}
                  className="bg-black bg-opacity-60 text-white p-2 rounded-full hover:bg-opacity-80 transition"
                  aria-label="Toggle flashlight"
                >
                  {torchOn ? <Zap className="w-5 h-5" /> : <ZapOff className="w-5 h-5" />}
                </button>
              )}
              {zoomSupported && (
                <>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      adjustZoom(0.5);
                    }}
                    className="bg-black bg-opacity-60 text-white p-2 rounded-full hover:bg-opacity-80 transition"
                    aria-label="Zoom in"
                  >
                    <ZoomIn className="w-5 h-5" />
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      adjustZoom(-0.5);
                    }}
                    className="bg-black bg-opacity-60 text-white p-2 rounded-full hover:bg-opacity-80 transition"
                    aria-label="Zoom out"
                  >
                    <ZoomOut className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      {showPreview && (
        <div className="flex gap-3">
          <button
            type="button"
            className="px-6 py-3 rounded-full border-2 border-gray-300 bg-white text-gray-700 font-semibold flex items-center gap-2 shadow hover:bg-gray-100 transition"
            onClick={handleRetry}
          >
            <RotateCcw className="w-5 h-5" /> Retake
          </button>
          <button
            type="button"
            className="px-6 py-3 rounded-full bg-[#F57979] text-white font-bold shadow-md hover:bg-[#ea5b5b] transition"
            onClick={handleSave}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default CameraCaptureBox;
