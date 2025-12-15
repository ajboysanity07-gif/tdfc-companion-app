// resources/js/utils/prc-id-get-cropped-img.ts
const toRadian = (deg: number) => (deg * Math.PI) / 180;

const rotateSize = (width: number, height: number, rotation: number) => {
  const rotRad = toRadian(rotation);
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
};

export async function prcIdGetCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  rotation: number = 0
): Promise<Blob> {
  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new window.Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', error => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const image = await createImage(imageSrc);
  const rotRad = toRadian(rotation);
  const { width: bBoxW, height: bBoxH } = rotateSize(image.width, image.height, rotation);

  // Draw the rotated image on a temp canvas
  const canvas = document.createElement('canvas');
  canvas.width = bBoxW;
  canvas.height = bBoxH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Context not found');

  ctx.translate(bBoxW / 2, bBoxH / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.width / 2, -image.height / 2);
  ctx.drawImage(image, 0, 0);

  // Extract the cropped area
  const data = ctx.getImageData(pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height);

  // Place it on a new canvas of the target size
  const outCanvas = document.createElement('canvas');
  outCanvas.width = pixelCrop.width;
  outCanvas.height = pixelCrop.height;
  const outCtx = outCanvas.getContext('2d');
  if (!outCtx) throw new Error('Context not found');
  outCtx.putImageData(data, 0, 0);

  return new Promise((resolve, reject) => {
    outCanvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error('Could not get image blob'));
    }, 'image/jpeg');
  });
}
