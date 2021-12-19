import fs from 'fs/promises';

type Point = number[];

const DIM = 3;

const toInt = (v: string) => parseInt(v, 10);

function rebase(beacons: Point[], base: Point): Point[] {
  return beacons.map((p) => p.map((v, i) => v - base[i]));
}

const key = (point: Point) => point.join(',');

const ROTATIONS = [
  [1, 1, 1],
  [-1, 1, 1],
  [1, -1, 1],
  [1, 1, -1],
  [1, -1, -1],
  [-1, 1, -1],
  [-1, -1, 1],
  [-1, -1, -1],
];
function* rotations(beacons: Point[]) {
  for (const r of ROTATIONS) {
    // Current: x, y, z
    yield beacons.map((p) => [p[0] * r[0], p[1] * r[1], p[2] * r[2]]);
    // Swap x -> z: z, y, x
    yield beacons.map((p) => [p[2] * r[2], p[1] * r[1], p[0] * r[0]]);
    // Swap y -> z: x, z, y
    yield beacons.map((p) => [p[0] * r[0], p[2] * r[2], p[1] * r[1]]);

    // Swap x -> y: y, x, z
    yield beacons.map((p) => [p[1] * r[1], p[0] * r[0], p[2] * r[2]]);
    // Swap x -> y: y, z, x
    yield beacons.map((p) => [p[1] * r[1], p[2] * r[2], p[0] * r[0]]);
    // Swap x -> y: z, x, y
    yield beacons.map((p) => [p[2] * r[2], p[0] * r[0], p[1] * r[1]]);
  }
}

function intersection(aBeacons: Point[], bBeacons: Point[]): Point[] {
  const inter = {};
  const result: Point[] = [];
  for (const b of aBeacons) {
    inter[key(b)] = b;
  }
  for (const b of bBeacons) {
    if (inter[key(b)]) {
      result.push(b);
    }
  }
  return result;
}

function union(aBeacons: Point[], bBeacons: Point[]): Point[] {
  const union = {};
  for (const b of aBeacons) {
    union[key(b)] = b;
  }
  for (const b of bBeacons) {
    union[key(b)] = b;
  }
  return Array.from(Object.values(union));
}

function distance(a: Point, b: Point): number {
  return a.reduce((acc, cur, i) => acc + Math.abs(cur - b[i]), 0);
}

async function run() {
  const data = (await fs.readFile('./input.txt', 'utf-8')).trim();
  const scanners = data
    .split(/\n?--- scanner \d+ ---\n/)
    .filter(Boolean)
    .map((s) =>
      s
        .trim()
        .split('\n')
        .map((c) => c.split(',').map(toInt) as Point),
    );

  let beacons = [...scanners[0]];
  const toProcess = scanners.slice(1);
  const scannerPositions: Point[] = [[0, 0, 0]];
  while (toProcess.length) {
    const scanner = toProcess.shift();
    let found = false;
    rotation: for (const b of beacons) {
      const aRebased = rebase(beacons, b);
      for (const bRotated of rotations(scanner)) {
        for (const rP of bRotated) {
          const bRebased = rebase(bRotated, rP);
          const inter = intersection(aRebased, bRebased);
          if (inter.length > 2) {
            const scannerPosition = b.map((v, i) => rP[i] - v);
            scannerPositions.push(scannerPosition);
            beacons = union(beacons, rebase(bRotated, scannerPosition));
            found = true;
            break rotation;
          }
        }
      }
    }

    if (!found) {
      toProcess.push(scanner);
    }

    console.log(`found: ${beacons.length} beacons, to process: ${toProcess.length} scanners`);
  }

  console.log('Part 1:', beacons.length);

  let max = 0;
  for (let i = 0; i < scannerPositions.length; i++) {
    for (let j = i; j < scannerPositions.length; j++) {
      const dist = distance(scannerPositions[i], scannerPositions[j]);
      if (dist > max) {
        max = dist;
      }
    }
  }

  console.log('Part 2:', max);
}

run().catch((e) => console.error(e));
