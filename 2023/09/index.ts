import { toInt } from '#aoc/utils.js';
import fs from 'fs/promises';
import { sum } from 'mathjs';

function solve(line: number[]) {
  const rows = [line];
  while (rows.at(-1).some((n) => n !== 0)) {
    const prev = rows.at(-1);
    const next = [];
    for (let i = 1; i < prev.length; i++) {
      next.push(prev[i] - prev[i - 1]);
    }
    rows.push(next);
  }

  return rows;
}

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const lines = raw.split('\n').map((line) => line.split(/\s+/).map(toInt));

  console.log('Part 1:', sum(lines.map((l) => sum(solve(l).map((r) => r.at(-1))))));
  console.log('Part 2:', sum(lines.map((l) => {
    const first = solve(l).map((l) => l.at(0));
    first.reverse();
    return first.reduce((acc, cur) => -acc + cur, 0);
  })));
}

run().catch((e) => console.error(e));
