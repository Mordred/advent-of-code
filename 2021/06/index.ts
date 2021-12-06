import fs from 'fs/promises';

const toInt = (v: string) => parseInt(v, 10);
const sumFn = (vals: number[]) => vals.reduce((acc, cur) => acc + cur, 0);

async function run() {
  const initial = (await fs.readFile('./input.txt', 'utf-8')).trim().split(',').map(toInt);

  const counts = new Array(9).fill(0);
  for (const s of initial) {
    counts[s] += 1;
  }

  let d = 0;
  for (; d < 80; d++) {
    const repr = counts.shift();
    counts.push(repr);
    counts[6] += repr;
  }

  console.log('Part 1:', sumFn(counts));

  for (; d < 256; d++) {
    const repr = counts.shift();
    counts.push(repr);
    counts[6] += repr;
  }

  console.log('Part 2:', sumFn(counts));
}

run().catch((e) => console.error(e));
