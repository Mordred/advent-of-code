import fs from 'fs/promises';

type Schematic = string[][];

const FILLED = '#';
const EMPTY = '.';

function schematicToHeights(schematic: Schematic): number[] {
  const isKey = schematic[0][0] === EMPTY;

  const [height, width] = [schematic.length, schematic[0].length];
  let res: number[] = [];
  for (let x = 0; x < width; x++) {
    let h = -1;
    for (let y = 0; y < height; y++) {
      if (schematic[y][x] === FILLED) {
        h++;
      }
    }
    res.push(h);
  }
  return res;
}

function overlaps(key: number[], lock: number[]): boolean {
  for (let i = 0; i < key.length; i++) {
    if (key[i] + lock[i] > 5) {
      return true;
    }
  }
  return false;
}

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const schematics = raw.split('\n\n').map((s) => s.split('\n').map((l) => l.split('')) as Schematic);

  const locks: number[][] = [];
  const keys: number[][] = [];

  for (const schematic of schematics) {
    if (schematic[0][0] === FILLED) {
      locks.push(schematicToHeights(schematic));
    } else {
      keys.push(schematicToHeights(schematic));
    }
  }

  let part1 = 0;
  for (const key of keys) {
    for (const lock of locks) {
      if (!overlaps(key, lock)) {
        part1++;
      }
    }
  }

  console.log('Part 1:', part1);
}

run().catch((e) => console.error(e));
