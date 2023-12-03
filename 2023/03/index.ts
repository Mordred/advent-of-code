import fs from 'fs/promises';
import { toInt, sum } from '#aoc/utils.js';
import { prod } from 'mathjs';

type Coords = [number, number];

const directions = [
  [1, 1], // bottomright
  [1, 0], // right
  [1, -1], // topright
  [0, 1], // bottom
  [0, -1], // top
  [-1, 1], // bottomleft
  [-1, 0], // left
  [-1, -1], // topleft
];

function* neighborhood(grid: string[][], [x, y]: Coords): Generator<Coords> {
  for (const [i, j] of directions) {
    const y2 = y + i;
    const x2 = x + j;

    if (y2 >= grid.length || y2 < 0) {
      continue;
    }

    if (x2 >= grid[y2].length || x2 < 0) {
      continue;
    }

    yield [x2, y2];
  }
}

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const data = raw.split('\n').map((l) => l.split(''));

  const visited = new Set<string>();

  let part1 = 0;
  for (let y = 0; y < data.length; y++) {
    for (let x = 0; x < data[y].length; x++) {
      if (data[y][x] === '.' || /\d/.test(data[y][x])) {
        continue;
      }

      for (const [x1, y1] of neighborhood(data, [x, y])) {
        if (visited.has(`${x1},${y1}`)) {
          continue;
        }

        if (/\d/.test(data[y1][x1])) {
          let x2 = x1;
          while (x2 > 0 && /\d/.test(data[y1][x2 - 1])) {
            x2--;
          }

          // Already counted
          if (visited.has(`${x2},${y1}`)) {
            continue;
          }

          let number = '';
          while (x2 < data[y1].length && /\d/.test(data[y1][x2])) {
            number += data[y1][x2];
            visited.add(`${x2},${y1}`);
            x2++;
          }

          part1 += toInt(number);
        }
      }
    }
  }

  console.log('Part 1:', part1);

  let part2 = 0;
  for (let y = 0; y < data.length; y++) {
    for (let x = 0; x < data[y].length; x++) {
      if (data[y][x] !== '*') {
        continue;
      }

      const adjacents = [];
      const visited2 = new Set<string>();
      for (const [x1, y1] of neighborhood(data, [x, y])) {
        // if (visited2.has(`${x1},${y1}`)) {
        //   continue;
        // }
        if (/\d/.test(data[y1][x1])) {
          let x2 = x1;
          while (x2 > 0 && /\d/.test(data[y1][x2 - 1])) {
            x2--;
          }

          // Already counted
          if (visited2.has(`${x2},${y1}`)) {
            continue;
          }

          let number = '';
          while (x2 < data[y1].length && /\d/.test(data[y1][x2])) {
            number += data[y1][x2];
            visited2.add(`${x2},${y1}`);
            x2++;
          }

          adjacents.push(toInt(number));
        }
      }

      if (adjacents.length === 2) {
        part2 += prod(adjacents);
      }
    }
  }

  console.log('Path 2:', part2);
}

run().catch((e) => console.error(e));
