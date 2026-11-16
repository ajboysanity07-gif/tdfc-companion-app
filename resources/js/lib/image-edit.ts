// Canvas helpers for the auth photo flows. Every output is a JPEG File so the
// backend's image/size rules (<=2MB for PRC) hold even for raw phone photos.
const MAX_EDGE = 1600;
const QUALITY = 0.85;

const toFile = (c: HTMLCanvasElement, name: string) =>
    new Promise<File>((res, rej) =>
        c.toBlob((b) => (b ? res(new File([b], name, { type: 'image/jpeg' })) : rej(new Error('encode failed'))), 'image/jpeg', QUALITY),
    );

const canvasOf = (w: number, h: number) => {
    const scale = Math.min(1, MAX_EDGE / Math.max(w, h));
    const c = document.createElement('canvas');
    c.width = Math.round(w * scale);
    c.height = Math.round(h * scale);
    return c;
};

/** Decode (EXIF orientation applied by the browser), downscale, re-encode. Accepts a Blob or a <video> frame. */
export async function normalize(src: ImageBitmapSource, name: string): Promise<File> {
    const bmp = await createImageBitmap(src);
    const c = canvasOf(bmp.width, bmp.height);
    c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height);
    return toFile(c, name);
}

/** dir: -1 = left, 1 = right. */
export async function rotate(src: Blob, dir: -1 | 1, name: string): Promise<File> {
    const bmp = await createImageBitmap(src);
    const c = document.createElement('canvas');
    c.width = bmp.height;
    c.height = bmp.width;
    const x = c.getContext('2d')!;
    x.translate(dir > 0 ? c.width : 0, dir > 0 ? 0 : c.height);
    x.rotate((dir * Math.PI) / 2);
    x.drawImage(bmp, 0, 0);
    return toFile(c, name);
}

/** r is normalized 0..1 of the image. */
export async function crop(src: Blob, r: { x: number; y: number; w: number; h: number }, name: string): Promise<File> {
    const bmp = await createImageBitmap(src);
    const sx = Math.round(r.x * bmp.width),
        sy = Math.round(r.y * bmp.height),
        sw = Math.max(1, Math.round(r.w * bmp.width)),
        sh = Math.max(1, Math.round(r.h * bmp.height));
    const c = document.createElement('canvas');
    c.width = sw;
    c.height = sh;
    c.getContext('2d')!.drawImage(bmp, sx, sy, sw, sh, 0, 0, sw, sh);
    return toFile(c, name);
}
