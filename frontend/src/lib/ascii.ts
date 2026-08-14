export function processImageToAsciiText(img: HTMLImageElement, width: number = 90): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No canvas context');

  const ratio = img.height / img.width;
  const charAspect = 2.0;
  const targetHeight = Math.max(1, Math.floor((width * ratio) / charAspect));

  canvas.width = width;
  canvas.height = targetHeight;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, targetHeight);

  const imgData = ctx.getImageData(0, 0, width, targetHeight);
  const data = imgData.data;

  let minGray = 255, maxGray = 0;
  const grayPixels: number[][] = Array.from({ length: targetHeight }, () => new Array(width));

  for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < width; x++) {
      const offset = (y * width + x) * 4;
      const gray = Math.round(0.299 * data[offset] + 0.587 * data[offset + 1] + 0.114 * data[offset + 2]);
      grayPixels[y][x] = gray; // no vignette — real image data only
      minGray = Math.min(minGray, gray);
      maxGray = Math.max(maxGray, gray);
    }
  }

  const chars = ' .:-=+*#%@'; // deduped, 10 distinct levels
  const gamma = 1.0; // Adjusted gamma to balance density
  const levels = chars.length;

  for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < width; x++) {
      const stretched = maxGray > minGray
        ? ((grayPixels[y][x] - minGray) / (maxGray - minGray)) * 255
        : grayPixels[y][x];
      grayPixels[y][x] = Math.round(Math.pow(stretched / 255, gamma) * 255);
    }
  }

  // Floyd–Steinberg dithering
  for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < width; x++) {
      const oldGray = grayPixels[y][x];
      const quantized = Math.round((oldGray * (levels - 1)) / 255) * (255 / (levels - 1));
      const error = oldGray - quantized;
      grayPixels[y][x] = quantized;

      if (x + 1 < width) grayPixels[y][x + 1] += (error * 7) / 16;
      if (y + 1 < targetHeight && x > 0) grayPixels[y + 1][x - 1] += (error * 3) / 16;
      if (y + 1 < targetHeight) grayPixels[y + 1][x] += (error * 5) / 16;
      if (y + 1 < targetHeight && x + 1 < width) grayPixels[y + 1][x + 1] += (error * 1) / 16;
    }
  }

  let text = '';
  for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < width; x++) {
      const finalGray = Math.max(0, Math.min(255, grayPixels[y][x]));
      const charIdx = Math.floor((finalGray / 255) * (levels - 1));
      text += chars[charIdx];
    }
    text += '\n';
  }
  return text;
}

export function generateAsciiFromImage(file: File, width: number = 90): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          resolve(processImageToAsciiText(img, width));
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject('Image load failed');
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject('File read failed');
    reader.readAsDataURL(file);
  });
}

export function generateAsciiFromBase64(base64: string, width: number = 90): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        resolve(processImageToAsciiText(img, width));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject('Image load failed');
    img.src = base64;
  });
}