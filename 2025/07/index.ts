import { type Coords } from '#aoc/utils.ts';
import fs from 'fs/promises';

const SPLITTER = '^';
const EMPTY = '.';
const START = 'S';

const key = (coords: Coords): string => `${coords[0]},${coords[1]}`;

type Grid = string[][];

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const grid = raw.split('\n').map((l) => l.split('')) as Grid;

  let start: Coords | null = null;
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] === START) {
        start = [x, y];
      }
    }
  }

  if (!start) {
    throw new Error('No start found');
  }

  // Count the number of ways to reach each cell
  let counts = new Map<string, number>([[key(start), 1]]);
  let part2 = 0;

  const part1Splitters = new Set<string>();

  for (let y = start[1]; y < grid.length; y++) {
    const next = new Map<string, number>();

    for (const [k, v] of counts.entries()) {
      const [xs, ys] = k.split(',').map((s) => Number(s));
      if (ys !== y) continue;

      // No more rows below
      if (grid[y + 1] === undefined) {
        part2 += v;
        continue;
      }

      const below = grid[y + 1][xs];
      switch (below) {
        case EMPTY: {
          const nk = key([xs, y + 1]);
          next.set(nk, (next.get(nk) ?? 0) + v);
          break;
        }
        case SPLITTER: {
          part1Splitters.add(key([xs, y + 1]));

          const leftX = xs - 1;
          const rightX = xs + 1;

          if (grid[y + 1][leftX] !== undefined) {
            const lk = key([leftX, y + 1]);
            next.set(lk, (next.get(lk) ?? 0) + v);
          }

          if (grid[y + 1][rightX] !== undefined) {
            const rk = key([rightX, y + 1]);
            next.set(rk, (next.get(rk) ?? 0) + v);
          }
          break;
        }
      }
    }

    counts = next;
  }

  console.log('Part 1:', part1Splitters.size);
  console.log('Part 2:', part2);
}

run().catch((e) => console.error(e));
