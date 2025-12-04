import { Coords, neighborhood, printGrid } from '#aoc/utils.js';
import fs from 'fs/promises';

type Grid = string[][];

const PAPER = '@';
const EMPTY = '.';

function removePaper(grid: Grid): { grid: Grid; removed: number } {
  const copy = grid.map((row) => row.slice());

  const toRemove: Coords[] = [];
  for (let row = 0; row < copy.length; row++) {
    for (let col = 0; col < copy[row].length; col++) {
      if (copy[row][col] !== PAPER) {
        continue;
      }

      const adjacent = Array.from(neighborhood(copy, col, row))
        .map(([x, y]) => copy[y][x])
        .filter((v) => v === PAPER);
      if (adjacent.length < 4) {
        toRemove.push([col, row]);
      }
    }
  }

  for (const [col, row] of toRemove) {
    copy[row][col] = EMPTY;
  }

  return { grid: copy, removed: toRemove.length };
}

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const data = raw.split('\n').map((line) => line.split('')) as Grid;

  let result = removePaper(data);
  const part1 = result.removed;
  let part2 = result.removed;
  while (result.removed > 0) {
    result = removePaper(result.grid);
    part2 += result.removed;
  }

  console.log('Part 1:', part1);
  console.log('Part 2:', part2);
}

run().catch((e) => console.error(e));
