import fs from 'fs/promises';

type Image = string[][];

const bitsToInt = (v: string | string[]) => parseInt(Array.isArray(v) ? v.join('') : v, 2);
const sumArray = (vals: number[]) => vals.reduce((acc, cur) => acc + cur, 0);

function* neighbors(image: Image, x: number, y: number, restIsLit: boolean): Generator<string> {
  for (let r = -1; r <= 1; r++) {
    for (let c = -1; c <= 1; c++) {
      const y2 = y + r;
      const x2 = x + c;

      if (
        y2 >= image.length ||
        y2 < 0 || // out of bounds
        x2 >= image[y2].length ||
        x2 < 0
      ) {
        // out of bounds
        yield restIsLit ? '1' : '0';
        continue;
      }

      yield image[y2][x2] === '#' ? '1' : '0';
    }
  }
}

function enhance(image: Image, enhanceTable: string[], restIsLit: boolean): Image {
  const rows = image.length + 2;
  const cells = image[0].length + 2;
  const newImage: Image = Array.from({ length: rows }, (_, y) => new Array(cells));

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cells; x++) {
      newImage[y][x] = enhanceTable[bitsToInt(Array.from(neighbors(image, x - 1, y - 1, restIsLit)))];
    }
  }

  return newImage;
}

async function run() {
  const data = (await fs.readFile('./input.txt', 'utf-8')).trim();
  const [enhanceData, imageData] = data.split(/\n\n/);

  const enhanceTable = enhanceData.split('');
  let image = imageData.split('\n').map((l) => l.split(''));

  let lit = false;
  for (let i = 0; i < 2; i++) {
    image = enhance(image, enhanceTable, lit);
    lit = lit ? enhanceTable.at(-1) === '#' : enhanceTable.at(0) === '#';
  }

  console.log('Part 1:', sumArray(image.map((r) => sumArray(r.map((c) => (c === '#' ? 1 : 0))))));

  for (let i = 2; i < 50; i++) {
    image = enhance(image, enhanceTable, lit);
    lit = lit ? enhanceTable.at(-1) === '#' : enhanceTable.at(0) === '#';
  }

  console.log('Part 2:', sumArray(image.map((r) => sumArray(r.map((c) => (c === '#' ? 1 : 0))))));
}

run().catch((e) => console.error(e));
