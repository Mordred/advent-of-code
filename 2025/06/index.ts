import { toInt, transpose } from '#aoc/utils.ts';
import fs from 'fs/promises';

type Operation = '+' | '*';
type Operations = Operation[];
type Values = number[];

function calculate(ops: Operations, vals: Values[]): number {
  return ops.reduce(
    (acc, cur, idx) =>
      acc + vals[idx].reduce((acc2, cur2) => (cur === '+' ? acc2 + cur2 : acc2 * cur2), cur === '+' ? 0 : 1),
    0,
  );
}

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const lines = raw.split('\n');

  const operations = lines
    .at(-1)!
    .split(/\s+/)
    .map((v) => v.trim()) as Operations;
  const rawOperands = lines.slice(0, -1);
  const operands = rawOperands.map((l, i, a) =>
    l
      .trim()
      .split(/\s+/)
      .map((v) => toInt(v.trim())),
  );
  console.log('Part 1:', calculate(operations, transpose(operands)));

  const transposed = transpose(rawOperands.map((l) => l.split(''))).map((r) => r.join('').trim()).reduce((acc, cur) => {
    if (cur === '') {
      acc.push([]);
    } else {
      acc.at(-1)?.push(toInt(cur));
    }

    return acc;
  }, [[]] as Values[]);
  console.log('Part 2:', calculate(operations, transposed));
}

run().catch((e) => console.error(e));
