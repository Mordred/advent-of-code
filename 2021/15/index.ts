import fs from 'fs/promises';

const toInt = (v: string) => parseInt(v, 10);

type Coord = [number, number];

const directions: Coord[] = [
  [1, 0], // bottom
  [0, 1], // right
  [0, -1], // left
  [-1, 0], // top
];

function* neighborhood(grid: number[][], [x, y]: Coord): Generator<Coord, void, unknown> {
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

const key = (c: Coord) => c.join(',');

function traverse(grid: number[][]): number {
  const paths: [number, Coord][] = [[0, [0, 0]]];
  const visited: Record<string, boolean> = {};
  while (true) {
    const [risk, current] = paths.pop();
    if (visited[key(current)]) {
      continue;
    }
    if (current[1] === grid.length - 1 && current[0] === grid.at(-1).length - 1) {
      // end
      return risk;
    }
    visited[key(current)] = true;
    for (const next of neighborhood(grid, current)) {
      if (visited[key(next)]) {
        continue;
      }
      paths.push([risk + grid[next[1]][next[0]], next]);
    }
    // Sort - continue with lowest score so far
    paths.sort((a, b) => b[0] - a[0]);
  }
}

async function run() {
  const data = (await fs.readFile('./input.txt', 'utf-8')).trim();
  const grid = data.split('\n').map((l) => l.split('').map(toInt));
  const rows = grid.length;
  const columns = grid[0].length;
  console.log('Part 1:', traverse(grid));

  const newGrid = Array.from({ length: rows * 5 }, () => new Array(columns * 5).fill(0));
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
      for (let yM = 0; yM < 5; yM++) {
        for (let xM = 0; xM < 5; xM++) {
          const newValue = grid[y][x] + yM + xM;
          newGrid[y + yM * rows][x + xM * columns] = newValue >= 9 ? ((newValue - 1) % 9) + 1 : newValue;
        }
      }
    }
  }

  console.log('Part 2:', traverse(newGrid));
}

run().catch((e) => console.error(e));
