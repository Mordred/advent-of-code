import fs from 'fs/promises';

type Coords = [number, number];

const directions = [
  [1, 0], // right
  [0, 1], // bottom
  [-1, 0], // left
  [0, -1], // top
]

function *neighborhood(grid: number[][], [x, y]: Coords): Generator<Coords> {
  for (const [i, j] of directions) {
    const y2 = y + i;
    const x2 = x + j;

    if (y2 >= grid.length || y2 < 0) {
      continue;
    }

    if (x2 >= grid[y2].length || x2 < 0) {
      continue;
    }

    if (grid[y][x] - 1 <= grid[y2][x2]) {
      yield [x2, y2];
    }
  }
}

const key = (coords: Coords) => coords.join(',');

interface Step {
  coords: Coords;
  distance: number;
}

function traverse(grid: number[][], start: Coords, isFinal: (coords: Coords) => boolean): number {
  const visited = new Set<string>();
  const queue = [{ coords: start, distance: 0 }];
  visited.add(key(start));

  let current: Step;

  while (current = queue.shift()) {
    for (const next of neighborhood(grid, current.coords)) {
      if (visited.has(key(next))) {
        continue;
      }

      if (isFinal(next)) {
        return current.distance + 1;
      }

      queue.push({ coords: next, distance: current.distance + 1 });
      visited.add(key(next));
    }
  }

  return Infinity;
}

async function run() {
  const raw = await fs.readFile(process.argv[2], 'utf-8');
  const start: Coords = [0, 0];
  const end: Coords = [0, 0];
  const data = raw.split('\n').map((r, y) => r.split('').map((v, x) => {
    if (v === 'S') {
      start[0] = x;
      start[1] = y;
      return 0;
    } else if (v === 'E') {
      end[0] = x;
      end[1] = y;
      return 'z'.charCodeAt(0) - 'a'.charCodeAt(0);
    } else {
      return v.charCodeAt(0) - 'a'.charCodeAt(0);
    }
  }));

  const part1: number = traverse(data, end, (c) => key(c) === key(start));
  const part2: number = traverse(data, end, (c) => data[c[1]][c[0]] === 0);

  console.log('Part 1', part1);
  console.log('Part 2', part2);
}

run().catch((e) => console.error(e));
