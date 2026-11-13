import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "../public");
const svgPath = path.join(publicDir, "logo.svg");

async function generateIcons() {
  if (!fs.existsSync(svgPath)) {
    console.error("Source logo.svg not found at", svgPath);
    process.exit(1);
  }

  const svgBuffer = fs.readFileSync(svgPath);

  // 1. 192x192 standard icon
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, "icon-192.png"));
  console.log("Generated icon-192.png");

  // 2. 512x512 standard icon
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, "icon-512.png"));
  console.log("Generated icon-512.png");

  // 3. 512x512 maskable icon with safe zone padding (OLED background)
  // Maskable icons require safe area (padding ~10%)
  const paddedIcon = await sharp(svgBuffer)
    .resize(410, 410)
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 5, g: 8, b: 17, alpha: 1 }, // OLED #050811
    },
  })
    .composite([{ input: paddedIcon, gravity: "center" }])
    .png()
    .toFile(path.join(publicDir, "icon-maskable.png"));
  console.log("Generated icon-maskable.png");
}

generateIcons().catch((err) => {
  console.error("Error generating icons:", err);
  process.exit(1);
});

