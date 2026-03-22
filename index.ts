const render = async () => {
  if (!state.wbuf || !state.bbuf) throw "no input file";
  if (!state.mt) state.mt = new MirageTank(state.wbuf, state.bbuf);

  let width = parseInt(widthInput.value, 10);
  let height = parseInt(heightInput.value, 10);
  assertSize(width), assertSize(height);

  // --- New: Apply limit if checkbox is checked ---
  if (limitCheckbox.checked) {
    const maxSize = 900;
    if (width > maxSize || height > maxSize) {
      // Preserve aspect ratio
      const aspect = width / height;
      if (width > height) {
        width = maxSize;
        height = Math.round(maxSize / aspect);
      } else {
        height = maxSize;
        width = Math.round(maxSize * aspect);
      }
      // Ensure dimensions are at least 1
      width = Math.max(1, width);
      height = Math.max(1, height);
    }
  }
  // --- End of new code ---

  const checkerboarded = checkerboardCheckbox.checked;
  const isColorful = colorfulCheckbox.checked;
  const wlight = parseFloat(foregroundLightInput.value);
  const blight = parseFloat(backgroundLightInput.value);
  const wcolor = parseFloat(foregroundColorInput.value);
  const bcolor = parseFloat(backgroundColorInput.value);

  let imageBuf: Uint8Array;
  if (isColorful) {
    imageBuf = state.mt.colorful_output(width, height, checkerboarded, wlight, blight, wcolor, bcolor);
  } else {
    imageBuf = state.mt.grey_output(width, height, checkerboarded, wlight, blight);
  }

  // --- New: Make first pixel transparent ---
  if (limitCheckbox.checked) {
    // Assumes the buffer is in RGBA format (4 bytes per pixel)
    // First pixel is at indices 0 (R), 1 (G), 2 (B), 3 (A)
    if (imageBuf.length >= 4) {
      imageBuf[3] = 0; // set alpha channel to 0 (fully transparent)
    }
  }
  // --- End of new code ---

  const data = imageEncode(imageBuf, 'png', { width, height });
  const urlBlob = URL.createObjectURL(new Blob([data]));

  outputImg.src = urlBlob;
  downloadAnchor.href = urlBlob;
  downloadAnchor.download = 'output.png'; // ensure download works
};
