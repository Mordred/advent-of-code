import fs from 'fs/promises';

const toInt = (v: string) => parseInt(v, 10);

function* neighborhood(grid: number[][], x: number, y: number) {
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      const y2 = y + i;
      const x2 = x + j;

      if (
        (y2 === y && x2 === x) || // same
        y2 >= grid.length ||
        y2 < 0 || // out of bounds
        x2 >= grid[y2].length ||
        x2 < 0
      ) {
        // out of bounds
        continue;
      }

      yield [x2, y2];
    }
  }
}

function flash(grid: number[][], x: number, y: number): number {
  let count = 1;
  for (const [x2, y2] of neighborhood(grid, x, y)) {
    grid[y2][x2] += 1;
    if (grid[y2][x2] === 10) {
      count += flash(grid, x2, y2);
      // increase to 11 to prevent flashing again
      grid[y2][x2] += 1;
    }
  }
  return count;
}

function step(grid: number[][]): number {
  let flashes = 0;
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid.length; x++) {
      grid[y][x] += 1;
      if (grid[y][x] === 10) {
        flashes += flash(grid, x, y);
        // increase to 11 to prevent flashing again
        grid[y][x] += 1;
      }
    }
  }
  // Lower all energies to 0
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid.length; x++) {
      if (grid[y][x] > 9) {
        grid[y][x] = 0;
      }
    }
  }
  return flashes;
}

async function run() {
  const lines = (await fs.readFile('./input.txt', 'utf-8')).trim().split('\n');

  const grid = lines.map((line) => line.split('').map(toInt));

  let flashes = 0;
  let s = 0;
  for (; s < 100; s++) {
    flashes += step(grid);
  }

  console.log('Part 1:', flashes);

  while (true) {
    s++;
    step(grid);
    if (grid.every((r) => r.every((c) => c === 0))) {
      break;
    }
  }

  console.log('Part 2:', s);
}

run().catch((e) => console.error(e));
