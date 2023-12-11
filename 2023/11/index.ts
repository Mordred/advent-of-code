import fs from 'fs/promises';

type Grid = string[][];
type Coords = [number, number];

function transpose(grid: Grid): Grid {
  return grid[0].map((_, i) => grid.map((row) => row[i]));
}

function distances(grid: Grid, times: number): [number[], number[]] {
  const rowDistances = grid.reduce((acc, cur) => {
    if (cur.every((c) => c === '.')) {
      acc.push(times);
    } else {
      acc.push(1);
    }
    return acc;
  }, [] as number[]);
  const transposed = transpose(grid);
  const colDistances = transposed.reduce((acc, cur) => {
    if (cur.every((c) => c === '.')) {
      acc.push(times);
    } else {
      acc.push(1);
    }
    return acc;
  }, [] as number[]);
  return [rowDistances, colDistances];
}

function solve(grid: Grid, distances: [number[], number[]]) {
  const galaxies: Coords[] = [];
  let realY = 0;
  for (let y = 0; y < grid.length; y++) {
    let realX = 0
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] === '#') {
        galaxies.push([realX, realY]);
      }
      realX += distances[1][x];
    }
    realY += distances[0][y];
  }

  let sum = 0;
  for (let i = 0; i < galaxies.length; i++) {
    for (let j = i + 1; j < galaxies.length; j++) {
      const [x1, y1] = galaxies[i];
      const [x2, y2] = galaxies[j];
      const distance = Math.abs(y2 - y1) + Math.abs(x2 - x1);
      sum += distance;
    }
  }

  return sum;
}

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const grid = raw.split('\n').map((line) => line.split('')) as Grid;

  console.log('Part 1:', solve(grid, distances(grid, 2)));
  console.log('Part 2:', solve(grid, distances(grid, 1_000_000)));
}

run().catch((e) => console.error(e));
