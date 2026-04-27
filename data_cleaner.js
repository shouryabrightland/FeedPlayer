const fs = require("fs");
const path = require("path");

const inputDir = path.join(__dirname, "public/suilight/selfi");
const outputDir = path.join(__dirname, "images");

// create output folder if not exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// supported types
const imageExt = [".jpg", ".jpeg", ".png", ".webp"];
const videoExt = [".mp4", ".mov", ".mkv"];

function getType(ext) {
  if (imageExt.includes(ext)) return "image";
  if (videoExt.includes(ext)) return "video";
  return null;
}

// read files
let files = fs.readdirSync(inputDir);

// sort for consistency
files.sort();

let mediaArray = [];

files.forEach((file, index) => {
  const ext = path.extname(file).toLowerCase();
  const type = getType(ext);

  if (!type) return; // skip unknown files

  const newName = `${index + 1}${ext}`;
  const oldPath = path.join(inputDir, file);
  const newPath = path.join(outputDir, newName);

  // copy + rename
  fs.copyFileSync(oldPath, newPath);

  mediaArray.push({
    type,
    src: `selfi/${newName}`
  });
});

// final JSON structure
const outputJSON = {
  media: mediaArray
};

// write JSON file
fs.writeFileSync(
  path.join(__dirname, "media.json"),
  JSON.stringify(outputJSON, null, 2)
);

console.log("Done. Files renamed + JSON generated.");