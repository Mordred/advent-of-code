import fs from 'fs/promises';
import { toInt } from '#aoc/utils.ts';

function isSafe1(data: number[]): boolean {
  const ascending = data[0] <= data.at(-1) ? data : data.toReversed();
  for (let i = 1; i < ascending.length; i++) {
    const cur = ascending[i];
    const previous = ascending[i - 1];
    const safe = previous < cur && cur - previous >= 1 && cur - previous <= 3;
    if (!safe) {
      return false;
    }
  }
  return true;
}

function isSafe2(data: number[]): boolean {
  const ascending = data[0] <= data.at(-1) ? data : data.toReversed();
  if (isSafe1(data)) {
    return true;
  }

  // Create new arrays with each element skipped
  for (let i = 0; i < ascending.length; i++) {
    const copy = ascending.slice();
    copy.splice(i, 1);
    if (isSafe1(copy)) {
      return true;
    }
  }

  return false;
}

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const data = raw.split('\n').map((line) => line.split(/\s+/).map(toInt));

  const part1 = data.filter(isSafe1).length;
  console.log('Part 1:', part1);

  const part2 = data.filter((v) => isSafe2(v)).length;
  console.log('Part 2:', part2);
}

run().catch((e) => console.error(e));
