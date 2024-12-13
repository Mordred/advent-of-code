import { toInt, sum, counts } from '#aoc/utils.js';
import fs from 'fs/promises';

type Coords = readonly [number, number];

const get = (grid: string[][], [x, y]: Coords, [dx, dy]: Coords = [0, 0]) => grid[y + dy]?.[x + dx];
const hash = ([x, y]: Coords) => `${x},${y}`;

const directions = {
  top: [0, -1] as Coords,
  left: [-1, 0] as Coords,
  right: [1, 0] as Coords,
  bottom: [0, 1] as Coords,
} as const;

interface Plot {
  region: string;
  fence: {
    top: boolean;
    left: boolean;
    right: boolean;
    bottom: boolean;
  }
  position: Coords;
}

function* region(grid: string[][], [x, y]: Coords): Generator<Plot> {
  const current = get(grid, [x, y]);
  const visited = new Set<string>();
  const queue = [[x, y]];
  while (queue.length) {
    const [x, y] = queue.shift()!;
    const key = hash([x, y]);
    if (visited.has(key)) {
      continue;
    }
    visited.add(key);
    let fence = {
      top: false,
      left: false,
      right: false,
      bottom: false,
    }

    for (const [dir, [dx, dy]] of Object.entries(directions)) {
      const next = get(grid, [x, y], [dx, dy]);
      if (next === current) {
        queue.push([x + dx, y + dy]);
      } else {
        fence[dir as keyof typeof fence] = true;
      }
    }

    yield { region: current, position: [x, y] as Coords, fence };
  }
}

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const grid = raw.split('\n').map((v) => v.split(''));

  const visited = new Set<string>();
  let part1 = 0;
  let part2 = 0;
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (visited.has(hash([x, y]))) {
        continue;
      }

      let area = 0;
      let perimeter = 0;
      let reg: Record<string, Plot> = {};
      for (const plot of region(grid, [x, y])) {
        area++;
        perimeter += Object.values(plot.fence).filter((v) => v).length;
        visited.add(hash(plot.position));
        reg[hash(plot.position)] = plot;
      }

      let sides = 0;
      for (const plot of Object.values(reg)) {
        const top = reg[hash([plot.position[0], plot.position[1] - 1])];
        const left = reg[hash([plot.position[0] - 1, plot.position[1]])];

        // If there is a fence on the left, check if we already counted left fence on top field
        if (plot.fence.left && !top?.fence.left) {
          sides++;
        }

        // If there is a fence on the top, check if we already counted top fence on left field
        if (plot.fence.top && !left?.fence.top) {
          sides++;
        }

        // If there is a fence on the right, check if we already counted right fence on top field
        if (plot.fence.right && !top?.fence.right) {
          sides++;
        }

        // If there is a fence on the right, check if we already counted right fence on top field
        if (plot.fence.bottom && !left?.fence.bottom) {
          sides++;
        }
      }
      part1 += area * perimeter;
      part2 += area * sides;
    }
  }

  console.log('Part 1:', part1);
  console.log('Part 2:', part2);
}

run().catch((e) => console.error(e));
