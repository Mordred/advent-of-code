import fs from 'fs/promises';

const get = (grid: string[][], [x, y]: Coords, [dx, dy]: Coords = [0, 0]) => grid[y + dy]?.[x + dx];
const eq = (a: Coords, b: Coords) => a[0] === b[0] && a[1] === b[1];
const hash = (a: Coords) => a.join(',');

type Coords = [number, number];

const DIRECTIONS = {
  N: [0, -1] as Coords,
  E: [1, 0] as Coords,
  S: [0, 1] as Coords,
  W: [-1, 0] as Coords,
} as const;

const FREE = '.';
const WALL = '#';
const START = 'S';
const END = 'E';

interface State {
  position: Coords;
  score: number;
  path: Coords[];
}

interface Result {
  path: Coords[];
  score: number;
}

function bestPath(grid: string[][], start: Coords, end: Coords): Result | null {
  const fastest = new Map<string, number>();

  let queue: State[] = [
    {
      position: start,
      score: 0,
      path: [start],
    },
  ];

  if (eq(start, end)) {
    return queue[0];
  }

  while (queue.length > 0) {
    queue = queue.sort((a, b) => a.score - b.score);
    const state = queue.shift()!;

    for (const [name, [dx, dy]] of Object.entries(DIRECTIONS)) {
      let nextPosition = [state.position[0] + dx, state.position[1] + dy] as Coords;
      let next = get(grid, nextPosition);

      next = get(grid, nextPosition);
      if (next !== FREE) {
        continue;
      }

      const key = hash(nextPosition);
      if (eq(nextPosition, end)) {
        return {
          path: [...state.path, nextPosition],
          score: state.score + 1,
        };
      }

      const visited = state.path.some((p) => eq(p, nextPosition));
      if (visited) {
        continue;
      }

      if (fastest.get(key) ?? Infinity <= state.score + 1) {
        continue;
      }

      fastest.set(key, Math.min(fastest.get(key) ?? Infinity, state.score + 1));
      queue.push({
        position: nextPosition,
        score: state.score + 1,
        path: [...state.path, nextPosition],
      });
    }
  }

  return null;
}

function* radius(grid: string[][], start: Coords, radius: number) {
  for (let y = start[1] - radius; y <= start[1] + radius; y++) {
    for (let x = start[0] - radius; x <= start[0] + radius; x++) {
      if (x < 0 || y < 0 || x >= grid[0].length || y >= grid.length || eq(start, [x, y])) {
        continue;
      }

      const dist = Math.abs(x - start[0]) + Math.abs(y - start[1]);
      if (grid[y][x] === FREE && dist <= radius) {
        yield [[x, y] as Coords, dist] as [Coords, number];
      }
    }
  }
}

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const grid = raw.split('\n').map((line) => line.split(''));

  const atLeast = process.argv[3] ? parseInt(process.argv[3], 10) : 100;

  const bestPathsFromStart = new Map<string, number | null>();
  const bestPathsFromEnd = new Map<string, number | null>();

  let start!: Coords;
  let end!: Coords;
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] === START) {
        start = [x, y];
        grid[y][x] = FREE;
      } else if (grid[y][x] === END) {
        end = [x, y];
        grid[y][x] = FREE;
      }
    }
  }

  const best = bestPath(grid, start, end);
  if (!best) {
    throw new Error('Cannot find path from start to end');
  }

  let s = 0;
  for (const p of best?.path ?? []) {
    const key = hash(p);
    if (!bestPathsFromStart.has(key)) {
      bestPathsFromStart.set(key, s);
    }
    s++;
  }

  let part1 = 0;
  let part2 = 0;
  for (let i = 0; i < best.path.length; i++) {
    const path = best.path[i];
    const pathKey = hash(path);
    if (!bestPathsFromStart.has(pathKey)) {
      const bp = bestPath(grid, start, path);
      let s = 0;
      for (const p of bp?.path ?? []) {
        const key = hash(p);
        if (!bestPathsFromStart.has(key)) {
          bestPathsFromStart.set(key, s);
        }
        s++;
      }
      bestPathsFromStart.set(pathKey, bp?.score ?? null);
    }

    if (bestPathsFromStart.get(pathKey) === null) {
      continue;
    }

    for (const [jump, dist] of radius(grid, path, 20)) {
      // Ignore best path next items
      if (best.path[i + dist] && eq(jump, best.path[i + dist])) {
        continue;
      }

      // Ignore best path previous items
      if (best.path[i - dist] && eq(jump, best.path[i - dist])) {
        continue;
      }

      const jumpKey = hash(jump);
      if (!bestPathsFromEnd.has(jumpKey)) {
        const bp = bestPath(grid, end, jump);
        let s = 0;
        for (const p of bp?.path ?? []) {
          const key = hash(p);
          if (!bestPathsFromEnd.has(key)) {
            bestPathsFromEnd.set(key, s);
          }
          s++;
        }
        bestPathsFromEnd.set(jumpKey, bp?.score ?? null);
      }

      const fromStart = bestPathsFromStart.get(pathKey);
      const fromEnd = bestPathsFromEnd.get(jumpKey);
      if (fromStart === null || fromStart === undefined || fromEnd === null || fromEnd === undefined) {
        continue;
      }

      const score = fromStart + dist + fromEnd;
      const saves = best.score - score;
      if (saves >= atLeast) {
        if (dist <= 2) {
          part1++;
        }
        part2++;
      }
    }
  }

  console.log('Part 1:', part1);
  console.log('Part 2:', part2);
}

run().catch((e) => console.error(e));
