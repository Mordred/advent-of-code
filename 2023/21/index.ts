import fs from 'fs/promises';

type Grid = string[][];
type Coords = [number, number];

function wrap(grid: Grid, [x, y]: Coords): Coords {
  let y2 = y % grid.length;
  if (y2 < 0) {
    y2 += grid.length;
  }

  let x2 = x % grid[y2].length;
  if (x2 < 0) {
    x2 += grid[y2].length;
  }

  return [x2, y2];
}

const hash = ([x, y]: Coords) => `${x},${y}`;

function calculate(grid: Grid, [x, y]: Coords, steps: number): number {
  const queue = [[x, y, steps]];
  const plots = { [hash([x, y])]: -1 };
  while (queue.length) {
    const [x, y, remainingSteps] = queue.shift()!;
    const h = hash([x, y]);
    const [x2, y2] = wrap(grid, [x, y]);

    if (grid[y2][x2] === '#' || plots[h] >= remainingSteps) {
      continue;
    }

    plots[h] = remainingSteps;

    if (remainingSteps > 0) {
      queue.push([x, y + 1, remainingSteps - 1]);
      queue.push([x, y - 1, remainingSteps - 1]);
      queue.push([x + 1, y, remainingSteps - 1]);
      queue.push([x - 1, y, remainingSteps - 1]);
    }
  }

  return Object.values(plots).filter((v) => v % 2 === 0).length;
}

/**
 * Lagrange's Interpolation formula for ax^2 + bx + c with x=[0,1,2] and y=[y0,y1,y2] we have
 *   f(x) = (x^2-3x+2) * y0/2 - (x^2-2x)*y1 + (x^2-x) * y2/2
 * so the coefficients are:
 * a = y0/2 - y1 + y2/2
 * b = -3*y0/2 + 2*y1 - y2/2
 * c = y0
 */
function simplifiedLagrange(y0: number, y1: number, y2: number) {
  return {
    a: y0 / 2 - y1 + y2 / 2,
    b: (-3 * y0) / 2 + 2 * y1 - y2 / 2,
    c: y0,
  };
}

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const data = raw.split('\n').map((l) => l.split(''));

  let start: Coords;
  for (let y = 0; y < data.length; y++) {
    for (let x = 0; x < data[y].length; x++) {
      if (data[y][x] === 'S') {
        start = [x, y];
      }
    }
  }

  console.log('Part 1:', calculate(data, start, 64));

  let size = data.length;
  let middle = Math.floor(data.length / 2);

  // First grid expand (from middle to edges)
  const y0 = calculate(data, start, middle);
  // Second grid expand
  const y1 = calculate(data, start, middle + size);
  // Thrid grid expand
  const y2 = calculate(data, start, middle + size * 2);

  const { a, b, c } = simplifiedLagrange(y0, y1, y2);
  const target = (26501365 - middle) / size;
  console.log('Part 2:', a * target * target + b * target + c);
}

run().catch((e) => console.error(e));
