import { toInt } from '#aoc/utils.js';
import fs from 'fs/promises';

type Position = [number, number, number];
type Brick = [Position, Position];

function overlaps(a: Brick, b: Brick) {
  return Math.max(a[0][0], b[0][0]) <= Math.min(a[1][0], b[1][0]) && Math.max(a[0][1], b[0][1]) <= Math.min(a[1][1], b[1][1]);
}

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const data = raw.split('\n').map((l) => l.split('~').map((p) => p.split(',').map(toInt) as Position) as Brick);

  data.sort((a, b) => a[0][2] - b[0][2])

  for (let i = 0; i < data.length; i++) {
    const brick = data[i];
    let maxZ = 1
    for (let check of data.slice(0, i)) {
      if (overlaps(brick, check)) {
        maxZ = Math.max(maxZ, check[1][2] + 1)
      }
    }
    brick[1][2] -= brick[0][2] - maxZ
    brick[0][2] = maxZ
  }

  data.sort((a, b) => a[0][2] - b[0][2]);

  const supports: Record<number, Set<number>> = {};
  const lays: Record<number, Set<number>> = {};

  for (let i = 0; i < data.length; i++) {
    const upperBrick = data[i];
    for (let j = 0; j < i; j++) {
      const lowerBrick = data[j];
      if (overlaps(lowerBrick, upperBrick) && upperBrick[0][2] === lowerBrick[1][2] + 1) {
        supports[j] ??= new Set();
        supports[j].add(i);
        lays[i] ??= new Set();
        lays[i].add(j);
      }
    }
  }

  let part1 = 0;
  for (let i = 0; i < data.length; i++) {
    if (Array.from(supports[i]?.values() ?? []).every((j) => lays[j].size >= 2)) {
      part1++;
    }
  }

  console.log('Part 1:', part1);

  let part2 = 0;
  for (let i = 0; i < data.length; i++) {
    let queue = Array.from(supports[i]?.values() ?? []).filter((j) => lays[j].size == 1);
    let falling = new Set<number>(queue);
    falling.add(i);

    while (queue.length) {
      const j = queue.shift()!;
      for (let k of supports[j]?.values() ?? []) {
        if (falling.has(k)) {
          continue;
        }

        if (Array.from(lays[k]?.values() ?? []).every((l) => falling.has(l))) {
          queue.push(k);
          falling.add(k)
        }
      }
    }

    part2 += falling.size - 1
  }

  console.log('Part 2:', part2);
}

run().catch((e) => console.error(e));
