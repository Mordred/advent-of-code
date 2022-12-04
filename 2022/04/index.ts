import fs from 'fs/promises';

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const data = raw.split('\n').map((a) => a.split(',').map((b) => b.split('-').map((c) => +c)));

  let part1: number = 0;
  let part2: number = 0;
  for (const [a, b] of data) {
    if ((a[0] <= b[0] && a[1] >= b[1]) || (b[0] <= a[0] && b[1] >= a[1])) {
      part1++;
    }

    if (a[0] <= b[1] && a[1] >= b[0]) {
      part2++
    }
  }

  console.log('Part 1', part1);
  console.log('Part 2', part2);
}

run().catch((e) => console.error(e));
