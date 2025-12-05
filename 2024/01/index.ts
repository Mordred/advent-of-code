import fs from 'fs/promises';
import { toInt } from '#aoc/utils.ts';

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const data = raw.split('\n');

  const [left, right] = data
    .map((l) => l.split(/\s+/).map(toInt))
    .reduce(
      (acc, cur) => {
        acc[0].push(cur[0]);
        acc[1].push(cur[1]);
        return acc;
      },
      [[], []],
    );

  const leftSorted = left.toSorted((a, b) => a - b);
  const rightSorted = right.toSorted((a, b) => a - b);

  let part1 = 0;
  for (let i = 0; i < leftSorted.length; i++) {
    part1 += Math.abs(leftSorted[i] - rightSorted[i]);
  }

  console.log('Part 1:', part1);

  const rightCounts = right.reduce((acc, cur) => {
    acc[cur] ??= 0;
    acc[cur]++;
    return acc;
  }, {});

  let part2 = 0;
  for (const leftItem of left) {
    part2 += (rightCounts[leftItem] ?? 0) * leftItem;
  }

  console.log('Part 2:', part2);
}

run().catch((e) => console.error(e));
