import fs from 'fs/promises';

const toInt = (v: string) => parseInt(v, 10);
const sumArray = (vals: number[]) => vals.reduce((acc, cur) => acc + cur, 0);
const multiplyArray = (vals: number[]) => vals.reduce((acc, cur) => acc * cur, 1);

const directions = [
  [-1, 0], // top
  [0, -1], // left
  [0, 1], // right
  [1, 0] // bottom
]

const key = (x: number, y: number) => `${x},${y}`;

function *neighborhood(grid, x, y) {
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

const traverse = (grid: number[][], x: number, y: number, current: number, visited: Record<string, boolean>): number => {
  if (current === 9 || visited[key(x, y)]) {
    return 0;
  }
  let count = 1;
  for (const [x2, y2] of neighborhood(grid, x, y)) {
    if (grid[y2][x2] > current) {
      count += traverse(grid, x2, y2, grid[y2][x2], visited);
      visited[key(x2, y2)] = true;
    }
  }

  visited[key(x, y)] = true;
  return count;
}

async function run() {
  const grid = (await fs.readFile('./input.txt', 'utf-8'))
    .trim()
    .split('\n')
    .map((v) => v.split('').map(toInt));

  const heights = [];
  const basins = [];
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const cell = grid[y][x];
      let min = cell !== 9;
      for (const [x2, y2] of neighborhood(grid, x, y)) {
        if (grid[y2][x2] < cell) {
          min = false;
          break;
        }
      }

      if (min) {
        heights.push(cell);
        basins.push(traverse(grid, x, y, cell, {}));
      }
    }
  }

  console.log('Part 1:', sumArray(heights.map((h) => h + 1)));

  basins.sort((a, b) => b - a);
  console.log('Part 2:', multiplyArray(basins.slice(0, 3)));
}

run().catch((e) => console.error(e));
