/**
 * Turns a photograph into an ink-on-paper sketch entirely in the browser.
 *
 * `detail` (0 → 1) is driven by how many Avatar dimensions have been answered:
 * an unanswered Avatar renders as a faint, unresolved outline; a complete one
 * renders as a fully inked portrait.
 */

const MAX_EDGE = 640;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read that image."));
    img.src = src;
  });
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.readAsDataURL(file);
  });
}

/** Render a paper-and-ink sketch data URL from any image source. */
export async function sketchFromImage(src: string, detail: number): Promise<string> {
  const d = Math.max(0, Math.min(1, detail));
  const img = await loadImage(src);

  const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Sketching is not supported in this browser.");

  ctx.drawImage(img, 0, 0, w, h);
  const src32 = ctx.getImageData(0, 0, w, h);
  const px = src32.data;

  // Luminance pass.
  const gray = new Float32Array(w * h);
  for (let i = 0, p = 0; i < px.length; i += 4, p++) {
    gray[p] = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
  }

  // Sobel edge magnitude.
  const edge = new Float32Array(w * h);
  let maxEdge = 1;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const gx =
        -gray[i - w - 1] - 2 * gray[i - 1] - gray[i + w - 1] +
        gray[i - w + 1] + 2 * gray[i + 1] + gray[i + w + 1];
      const gy =
        -gray[i - w - 1] - 2 * gray[i - w] - gray[i - w + 1] +
        gray[i + w - 1] + 2 * gray[i + w] + gray[i + w + 1];
      const m = Math.hypot(gx, gy);
      edge[i] = m;
      if (m > maxEdge) maxEdge = m;
    }
  }

  // Ink strength and tonal shading both grow with `detail`.
  const inkGain = 0.45 + 0.85 * d;
  const shadeGain = 0.12 + 0.5 * d;
  const paper = [250, 250, 247];
  const ink = [28, 28, 30];

  const out = ctx.createImageData(w, h);
  for (let p = 0, i = 0; p < gray.length; p++, i += 4) {
    const e = Math.min(1, (edge[p] / maxEdge) * 2.2) * inkGain;
    const shade = (1 - gray[p] / 255) * shadeGain;
    // Paper grain keeps it from looking machine-made.
    const grain = (Math.random() - 0.5) * 0.045;
    const a = Math.max(0, Math.min(1, e + shade + grain));
    out.data[i] = paper[0] + (ink[0] - paper[0]) * a;
    out.data[i + 1] = paper[1] + (ink[1] - paper[1]) * a;
    out.data[i + 2] = paper[2] + (ink[2] - paper[2]) * a;
    out.data[i + 3] = 255;
  }
  ctx.putImageData(out, 0, 0);

  return canvas.toDataURL("image/png");
}

export async function sketchFromFile(file: File, detail: number): Promise<string> {
  return sketchFromImage(await fileToDataUrl(file), detail);
}
