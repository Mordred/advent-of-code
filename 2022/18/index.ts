import fs from 'fs/promises';
import { toInt } from '#aoc/utils.js';

type Point = [number, number, number];
interface Points {
  [pointString: string]: Point;
}

const pointToString = (point: Point) => point.join(',');

const UNBOUND = 5_000;

const STEPS = [
  [0, 0, 1],
  [0, 0, -1],
  [0, 1, 0],
  [0, -1, 0],
  [1, 0, 0],
  [-1, 0, 0],
];

function surfaceArea(points: Points): [number, Points] {
  const exterior: Points = {};
  let area = 0;
  for (const [key, [x, y, z]] of Object.entries(points)) {
    for (const [dx, dy, dz] of STEPS) {
      const newPoint: Point = [x + dx, y + dy, z + dz];
      const k = pointToString(newPoint);
      if (!points[k]) {
        exterior[k] = newPoint;
        area++;
      }
    }
  }

  return [area, exterior];
}

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const points = raw
    .split('\n')
    .map((l) => l.split(',').map(toInt) as Point)
    .reduce<Points>((acc, cur) => {
      acc[pointToString(cur)] = cur;
      return acc;
    }, {});

  const [part1, checks] = surfaceArea(points);
  console.log('Part 1:', part1);

  const interior: Points = {};
  while (Object.keys(checks).length) {
    const c = checks[Object.keys(checks)[0]];
    const queue = [c];
    const area: Points = {
      [pointToString(c)]: c
    };

    while (queue.length) {
      // Asume that area is outside of shape
      // Remove scanned area from items to "check" (checks)
      if (Object.keys(area).length > UNBOUND) {
        Object.keys(area).forEach((k) => {
          delete checks[k];
        });
        break;
      }

      const [x, y, z] = queue.shift();
      for (const [dx, dy, dz] of STEPS) {
        const newPoint: Point = [x + dx, y + dy, z + dz];
        const k = pointToString(newPoint);
        if (!area[k] && !points[k]) {
          queue.push(newPoint);
          // Add to scanned area
          area[k] = newPoint;
        }
      }
    }

    // Found bounded interior
    if (queue.length === 0) {
      Object.keys(area).forEach((k) => {
        interior[k] = area[k];
        delete checks[k];
      });
    }
  }

  // Copy points and fill bounded interior
  const newPoints = { ...points };
  Object.keys(interior).forEach((k) => {
    newPoints[k] = interior[k];
  });
  // Then calculate new area
  const [part2] = surfaceArea(newPoints);
  console.log('Part 2:', part2);
}

run().catch((e) => console.error(e));
