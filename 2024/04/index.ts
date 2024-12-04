import fs from 'fs/promises';
import { toInt } from '#aoc/utils.js';

type Coords = readonly [number, number];

const get = (grid: string[][], [x, y]: Coords, [dx, dy]: Coords = [0, 0]) => grid[y + dy]?.[x + dx];

const directions = {
  topLeft: [-1, -1],
  top: [-1, 0],
  topRight: [-1, 1],
  left: [0, -1],
  right: [0, 1],
  bottomLeft: [1, -1],
  bottom: [1, 0],
  bottomRight: [1, 1],
} as const;

function* traverse(grid: string[][], [x, y]: Coords, [dx, dy]: Coords) {
  let cur = [x, y] as Coords;
  let item: string;
  while (item = get(grid, cur)) {
    yield item;
    cur = [cur[0] + dx, cur[1] + dy] as Coords;
  }
}

const SEARCH = 'XMAS';
const SEARCH2 = 'MS';

async function run() {
  const data = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const grid = data.split('\n').map((v) => v.split(''));

  let part1 = 0;
  for (let x = 0; x < grid[0].length; x++) {
    for (let y = 0; y < grid.length; y++) {
      let cur = [x, y] as Coords;
      if (get(grid, cur) === 'X') {
        for (const direction of Object.values(directions)) {
          let word = '';
          for (const letter of traverse(grid, cur, direction)) {
            word += letter;
            if (word === SEARCH) {
              part1++;
              break;
            } else if (word.length > SEARCH.length) {
              break;
            }
          }
        }
      }
    }
  }

  console.log('Part 1:', part1);

  let part2 = 0;
  for (let x = 0; x < grid[0].length; x++) {
    for (let y = 0; y < grid.length; y++) {
      let cur = [x, y] as Coords;
      if (
        get(grid, cur) === 'A' &&
        SEARCH2.includes(get(grid, cur, directions.topLeft)) &&
        SEARCH2.includes(get(grid, cur, directions.topRight)) &&
        SEARCH2.includes(get(grid, cur, directions.bottomLeft)) &&
        SEARCH2.includes(get(grid, cur, directions.bottomRight))
      ) {
        const topLeft = get(grid, cur, directions.topLeft);
        const topRight = get(grid, cur, directions.topRight);
        const bottomLeft = get(grid, cur, directions.bottomLeft);
        const bottomRight = get(grid, cur, directions.bottomRight);
        const one = (topLeft === 'M' && bottomRight === 'S') || (topLeft === 'S' && bottomRight === 'M');
        const two = (topRight === 'M' && bottomLeft === 'S') || (topRight === 'S' && bottomLeft === 'M');
        if (one && two) {
          part2++;
        }
      }
    }
  }

  console.log('Part 2:', part2);
}

run().catch((e) => console.error(e));
