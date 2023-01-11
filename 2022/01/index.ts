import fs from 'fs/promises';
import { sum } from '#aoc/utils.js'

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const data = raw.split('\n\n').map((l) => l.split('\n').map((v) => +v)).map(sum);


  data.sort((a, b) => b - a);

  console.log("Part 1:", data[0]);

  console.log("Part 2:", sum(data.slice(0, 3)));
}

run().catch((e) => console.error(e));
