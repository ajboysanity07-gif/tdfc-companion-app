// resources/js/components/ui/payslip-crop-box.tsx

type Props = {
  src: string; // data URL or object URL
  aspect: number;
  onDone: (cropped: File) => void;
  onCancel: () => void;
};

const PayslipCropBox: React.FC<Props> = ({ src, aspect, onCancel }) => {
  // Use your cropping library and logic as in PRC CropBox
  // Call onDone with the cropped File

  return (
    <div>
      <img src={src} style={{ aspectRatio: aspect }} alt="Crop preview" />
      {/* Add croppie or react-easy-crop, etc */}
      <button onClick={onCancel}>Cancel</button>
      <button
        onClick={() => {
          /* run cropping logic, then onDone(croppedFile) */
        }}
      >
        Crop & Next
      </button>
    </div>
  );
};

export default PayslipCropBox;
