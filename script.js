const imageInput = document.getElementById('imageInput');
const downloadBtn = document.getElementById('downloadBtn');

imageInput.addEventListener('change', function ()
{
  const file = this.files[0];
  const ext = imageInput.value.substring(imageInput.value.indexOf(".") + 1);
  
  if (!file) return;
  
  // Supported extensions
  var supported =
    ext.includes("png") ||
    ext.includes("jpg") ||
    ext.includes("jpeg") ||
    ext.includes("jfif") ||
    ext.includes("gif") ||
    ext.includes("bmp");

  if (supported === false) return;
  
  const img = new Image();
  const reader = new FileReader();

  reader.onload = function (e)
  {
    img.onload = function ()
	{
      downloadBtn.disabled = false;  
      downloadBtn.onclick = () => createICO(img);
    };
    img.src = e.target.result;
  };

  reader.readAsDataURL(file);
});

function resizeToCanvas(img, size)
{
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, size, size);

  // Maintain aspect ratio
  const imgRatio = img.width / img.height;
  let drawWidth = size;
  let drawHeight = size;

  if (imgRatio > 1)
  {
    drawWidth = size;
    drawHeight = size / imgRatio;
  } else
  {
    drawHeight = size;
    drawWidth = size * imgRatio;
  }

  const offsetX = (size - drawWidth) / 2;
  const offsetY = (size - drawHeight) / 2;

  ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  return canvas;
}

async function createICO(img)
{
  imageInput.style.backgroundImage = "url(/imagetoicon/assets/photo-plus-spark.svg)";
  imageInput.style.backgroundPositionY = "42px";
  imageInput.style.color = "Transparent";
  
  const sizes = [16, 32, 48, 64, 128, 256];
  const iconParts = await Promise.all(sizes.map(async size =>
  {
    const canvas = resizeToCanvas(img, size);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    const arrayBuffer = await blob.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  }));

  const headerSize = 6 + (16 * iconParts.length);
  let totalSize = headerSize + iconParts.reduce((sum, part) => sum + part.length, 0);
  const ico = new Uint8Array(totalSize);

  // ICONDIR header
  ico.set([0, 0, 1, 0, iconParts.length, 0], 0);

  let offset = headerSize;
  iconParts.forEach((part, i) =>
  {
    const size = sizes[i];
    const width = size === 256 ? 0 : size;
    const height = size === 256 ? 0 : size;

    const entryOffset = 6 + i * 16;
    ico[entryOffset] = width;
    ico[entryOffset + 1] = height;
    ico[entryOffset + 2] = 0; // color count
    ico[entryOffset + 3] = 0; // reserved
    ico[entryOffset + 4] = 1; ico[entryOffset + 5] = 0; // color planes
    ico[entryOffset + 6] = 32; ico[entryOffset + 7] = 0; // bit count
    ico[entryOffset + 8] = part.length & 0xFF;
    ico[entryOffset + 9] = (part.length >> 8) & 0xFF;
    ico[entryOffset + 10] = (part.length >> 16) & 0xFF;
    ico[entryOffset + 11] = (part.length >> 24) & 0xFF;
    ico[entryOffset + 12] = offset & 0xFF;
    ico[entryOffset + 13] = (offset >> 8) & 0xFF;
    ico[entryOffset + 14] = (offset >> 16) & 0xFF;
    ico[entryOffset + 15] = (offset >> 24) & 0xFF;

    ico.set(part, offset);
    offset += part.length;
  });
  
  const blob = new Blob([ico], { type: 'image/icon' });
  const link = document.createElement('a');
  const name = imageInput.value.substring(0, imageInput.value.indexOf("."));
  link.download = name + '.ico';
  link.href = URL.createObjectURL(blob);
  link.click();
  
  imageInput.value = null;
  imageInput.disabled = true;
  downloadBtn.textContent = 'Downloading...';
  downloadBtn.disabled = true;
  $("#link-wait").show();
  $("#link-main").hide();  
}