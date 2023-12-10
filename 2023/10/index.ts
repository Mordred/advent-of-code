import fs from 'fs/promises';

type Grid = string[][];
type Coords = [number, number];

const PIPES = {
  '|': [
    [0, -1],
    [0, 1],
  ],
  '-': [
    [-1, 0],
    [1, 0],
  ],
  L: [
    [0, -1],
    [1, 0],
  ],
  J: [
    [0, -1],
    [-1, 0],
  ],
  '7': [
    [0, 1],
    [-1, 0],
  ],
  F: [
    [0, 1],
    [1, 0],
  ],
};

let pipeEnds = (grid: Grid, [x, y]: Coords, current: string): [Coords, Coords] | undefined => {
  if (current === '.') {
    return undefined;
  }

  const ends = PIPES[current].map(([dx, dy]) => [x + dx, y + dy]);
  if (ends.some(([x, y]) => x < 0 || y < 0 || x >= grid[0].length || y >= grid.length)) {
    return undefined;
  }
  return ends;
};

const coordsToString = (coords: Coords) => coords.join(',');

function traverse(grid: Grid, start: Coords, pipe: string): [number, Set<string>] {
  const visited = new Set<string>();
  const queue = [{ coords: start, distance: 0 }];
  visited.add(coordsToString(start));

  let current: { coords: Coords; distance: number };
  while ((current = queue.shift())) {
    visited.add(coordsToString(current.coords));

    let curPipe = grid[current.coords[1]][current.coords[0]];
    let ends = pipeEnds(grid, current.coords, curPipe === 'S' ? pipe : curPipe);
    if (ends === undefined) {
      return [Infinity, visited];
    }

    let [left, right] = ends;
    if (visited.has(coordsToString(left)) && visited.has(coordsToString(right))) {
      return [current.distance, visited];
    }

    if (!visited.has(coordsToString(left))) {
      queue.push({ coords: left, distance: current.distance + 1 });
    }
    if (!visited.has(coordsToString(right))) {
      queue.push({ coords: right, distance: current.distance + 1 });
    }
  }

  return [Infinity, visited];
}

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const grid = raw.split('\n').map((line) => line.split('')) as Grid;

  let start: Coords;
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] === 'S') {
        start = [x, y];
        break;
      }
    }
    if (start) {
      break;
    }
  }

  const paths = Object.keys(PIPES)
    .map((pipe) => [...traverse(grid, start, pipe), pipe] as [number, Set<string>, keyof typeof PIPES])
    .filter((p) => p[0] !== Infinity)
    .sort((a, b) => b[0] - a[0]);
  const largest = paths[0];
  console.log('Part 1:', largest[0]);

  let chain = largest[1];
  let contained = 0;
  for (let y = 0; y < grid.length; y++) {
    let depth = 0;
    for (let x = 0; x < grid[y].length; x++) {
      const char = grid[y][x] === 'S' ? largest[2] : grid[y][x];
      if (chain.has(coordsToString([x, y]))) {
        if (['|', 'L', 'J'].includes(char)) {
          depth++;
        }
      } else if (depth % 2 === 1) {
        contained++;
      }
    }
  }

  console.log('Part 2:', contained);
}

run().catch((e) => console.error(e));
