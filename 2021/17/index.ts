import fs from 'fs/promises';

const toInt = (v: string) => parseInt(v, 10);

type X = number;
type Y = number;
type XVelocity = number;
type Steps = number;

function* stepsForYVelocity(dYPerStep: number, minY: number, maxY: number): Generator<[Steps, Y]> {
  let y = 0;
  let steps = 0;
  while (y >= minY) {
    if (minY <= y && y <= maxY) {
      // Yield how many steps it took and final Y position
      yield [steps, y];
    }

    // Add Y-velocity per each step
    y += dYPerStep;
    // Increase steps counter
    steps += 1;
    // Decrease velocity Y due gravity
    dYPerStep -= 1;
  }
}

function* destinationX(steps: number, maxX: number): Generator<[X, XVelocity]> {
  // For each X-velocity from 1 to maxX
  for (let dXPerStep = 1; dXPerStep <= maxX; dXPerStep++) {
    // Start at 0 position
    let x = 0;
    let dX = dXPerStep;
    // Move per steps
    for (let step = 0; step < steps; step++) {
      // Add X-velocity per each step
      x += dX;
      // Decrease X-velocity
      if (dX > 0) {
        dX -= 1;
      }
    }

    // Yield final X position and velocity which brings us there
    yield [x, dXPerStep];
  }
}

async function run() {
  const data = (await fs.readFile('./input.txt', 'utf-8')).trim();

  const [minX, maxX, minY, maxY] = data
    .replace('target area: ', '')
    .split(', ')
    .map((s) => s.split('=')[1].split('..'))
    .flat()
    .map(toInt);
  let maxDY = null;
  let initialVelocities = new Set<string>();

  // Because Y is given as negative value -minY is bigger than -maxY
  // so start with highest possible Y-velocity (-minY) to lowest possible minY
  for (let dY = -minY; dY >= minY; dY--) {
    for (const [steps, y] of stepsForYVelocity(dY, minY, maxY)) {
      for (const [x, dX] of destinationX(steps, maxX)) {
        // We are at final destination
        if (minX <= x && x <= maxX) {
          // Save max Y-velocity for part 1
          if (maxDY === null) {
            maxDY = dY;
          }
          // Store all possible velocities
          initialVelocities.add(`${dX},${dY}`);
        }
      }
    }
  }

  console.log('Part 1:', (maxDY * (maxDY + 1)) / 2);
  console.log('Part 2:', initialVelocities.size);
}

run().catch((e) => console.error(e));
