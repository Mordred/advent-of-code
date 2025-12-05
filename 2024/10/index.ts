import { toInt, sum } from '#aoc/utils.ts';
import fs from 'fs/promises';

type Coords = readonly [number, number];

const get = (grid: number[][], [x, y]: Coords, [dx, dy]: Coords = [0, 0]) => grid[y + dy]?.[x + dx];
const hash = ([x, y]: Coords) => `${x},${y}`;

const directions = {
  top: [0, -1] as Coords,
  left: [-1, 0] as Coords,
  right: [1, 0] as Coords,
  bottom: [0, 1] as Coords,
} as const;

interface State {
  height: number;
  position: Coords;
}

function trailheads(grid: number[][], start: Coords, distincTrails: boolean = false) {
  const visited = new Set<string>();
  let queue = [{ height: 0, position: start }] as State[];
  let count = 0;
  while (queue.length > 0) {
    const { height, position }= queue.shift()!;

    const key = hash(position);
    if (visited.has(key)) {
      continue;
    }

    if (!distincTrails) {
      visited.add(key);
    }

    if (height === 9) {
      count++;
      continue;
    }

    for (const [dx, dy] of Object.values(directions)) {
      const next = [position[0] + dx, position[1] + dy] as Coords;
      const nextHeight = get(grid, next);

      if (nextHeight !== height + 1) {
        continue;
      }

      queue.push({ height: height + 1, position: next });
    }
  }

  return count;
}

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const grid = raw.split('\n').map((v) => v.split('').map((v) => v === '.' ? -1 : toInt(v)));

  let part1 = 0;
  let part2 = 0;
  for (let x = 0; x < grid[0].length; x++) {
    for (let y = 0; y < grid.length; y++) {
      if (grid[y][x] === 0) {
        part1 += trailheads(grid, [x, y]);
        part2 += trailheads(grid, [x, y], true);
      }
    }
  }
  console.log('Part 1:', part1);
  console.log('Part 2:', part2);
}

run().catch((e) => console.error(e));
