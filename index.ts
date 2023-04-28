import * as fs from "fs";
import { PNG } from "pngjs";

// Example: you have a tilemap whose tiles are 15x15 pixels plus a 1 pixel margin. The top-left tile is from (0,0) to (15,15). The next tile to the right starts at (17,0). The next tile to the bottom starts at (0,17). And so on.

// ASSUMPTION: The image should not have any empty pixels around the tilemap.

const filepath = "tilemap.png";
const outputfile = "out.png";
const marginX = 1;
const marginY = 1;
const actualTileWidth = 16; // together with margins we get that the first x coordinate to skip is 16, 33, 50, 67 etc
const actualTileHeight = 16; // together with margins we get 17x17 tiles

const currentTileWidth = actualTileWidth + marginX;
const currentTileHeight = actualTileHeight + marginY;

const file = fs.readFileSync(filepath);
const original = PNG.sync.read(file);

const newfile = new PNG({
  width: Math.floor(1 + original.width / currentTileWidth) * actualTileWidth,
  height:
    Math.floor(1 + original.height / currentTileHeight) * actualTileHeight,
});

console.log(
  "original dimensions in pixels",
  original.width,
  "x",
  original.height
);
console.log("newfile dimensions in pixels", newfile.width, "x", newfile.height);
const coordsToSkip: Record<number, number[]> = {};
for (
  let y = actualTileHeight;
  y < original.height;
  y = y + actualTileHeight + marginY
) {
  coordsToSkip[y] = [];
  for (
    let x = actualTileWidth;
    x < original.width;
    x = x + actualTileWidth + marginX
  ) {
    coordsToSkip[y].push(x);
  }
}

for (let y = 0; y < original.height; y++) {
  for (let x = 0; x < original.width; x++) {
    if (coordsToSkip[y]?.includes(x)) {
      //   console.log("skipping x", x, "in y", y);
      continue;
    }
    if (coordsToSkip[y]) {
      //   console.log("skipping y", y);
      continue;
    }
    const newfileY =
      Math.floor(y / currentTileHeight) * actualTileHeight +
      (y % currentTileHeight);
    const newfileX =
      Math.floor(x / currentTileWidth) * actualTileWidth +
      (x % currentTileWidth);
    const idx = (newfile.width * newfileY + newfileX) << 2;
    const originalIdx = (original.width * y + x) << 2;
    newfile.data[idx] = original.data[originalIdx]; // R
    newfile.data[idx + 1] = original.data[originalIdx + 1]; // G
    newfile.data[idx + 2] = original.data[originalIdx + 2]; // B
    newfile.data[idx + 3] = original.data[originalIdx + 3]; // A
  }
}

var buffer = PNG.sync.write(newfile, { colorType: 6 }); // colorType 6 is RGBA
fs.writeFileSync(outputfile, buffer);

console.log(`DONE. Written to ${outputfile}`);
