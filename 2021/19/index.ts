import fs from 'fs/promises';

type Point = number[];

const toInt = (v: string) => parseInt(v, 10);

function* rebase(beacons: Point[], base: Point): Generator<Point> {
  for (const beacon of beacons) {
    yield beacon.map((v, i) => v - base[i]);
  }
}

const key = (point: Point) => point.join(',');

const ROTATIONS = [
  // 90 deg around X
  ([x, y, z]) => [x, y, z],
  ([x, y, z]) => [x, z, -y],
  ([x, y, z]) => [x, -y, -z],
  ([x, y, z]) => [x, -z, y],
  // 90 deg around -X
  ([x, y, z]) => [-x, z, y],
  ([x, y, z]) => [-x, y, -z],
  ([x, y, z]) => [-x, -z, -y],
  ([x, y, z]) => [-x, -y, z],
  // 90 deg around Y
  ([x, y, z]) => [y, z, x],
  ([x, y, z]) => [y, x, -z],
  ([x, y, z]) => [y, -z, -x],
  ([x, y, z]) => [y, -x, z],
  // 90 deg around -Y
  ([x, y, z]) => [-y, x, z],
  ([x, y, z]) => [-y, z, -x],
  ([x, y, z]) => [-y, -x, -z],
  ([x, y, z]) => [-y, -z, x],
  // 90 deg around Z
  ([x, y, z]) => [z, x, y],
  ([x, y, z]) => [z, y, -x],
  ([x, y, z]) => [z, -x, -y],
  ([x, y, z]) => [z, -y, x],
  // 90 deg around -Z
  ([x, y, z]) => [-z, y, x],
  ([x, y, z]) => [-z, x, -y],
  ([x, y, z]) => [-z, -y, -x],
  ([x, y, z]) => [-z, -x, y],
]

function* rotations(beacons: Point[]) {
  for (const r of ROTATIONS) {
    yield beacons.map(r);
  }
}

function distance(a: Point, b: Point): number {
  return a.reduce((acc, cur, i) => acc + Math.abs(cur - b[i]), 0);
}

function toMap(beacons: Point[] | Generator<Point>): Record<string, Point> {
  const ret = {};
  for (const beacon of beacons) {
    ret[key(beacon)] = beacon;
  }
  return ret;
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

  let beacons = toMap(scanners[0]);
  const toProcess = scanners.slice(1);
  const scannerPositions: Point[] = [[0, 0, 0]];
  while (toProcess.length) {
    const scanner = toProcess.shift();
    let found = false;
    rotation: for (const b of Object.values(beacons)) {
      const aRebasedMap = toMap(rebase(Object.values(beacons), b));
      for (const bRotated of rotations(scanner)) {
        for (const rP of bRotated) {
          let count = 0;
          for (const bR of rebase(bRotated, rP)) {
            if (aRebasedMap[key(bR)]) {
              count++;
            }

            if (count === 3) {
              const scannerPosition = b.map((v, i) => rP[i] - v);
              scannerPositions.push(scannerPosition);
              for (const p of rebase(bRotated, scannerPosition)) {
                beacons[key(p)] = p;
              }
              found = true;
              break rotation;
              }
          }
        }
      }
    }

    if (!found) {
      toProcess.push(scanner);
    }

    console.log(`found: ${Object.keys(beacons).length} beacons, to process: ${toProcess.length} scanners`);
  }

  console.log('Part 1:', Object.keys(beacons).length);

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
