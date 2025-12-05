import { toInt } from '#aoc/utils.ts';
import fs from 'fs/promises';

type Bank = number[];

const memory: Record<string, number> = {};
function getMaxPower(bank: Bank, left: number): number {
  let key = bank.join(',') + '|' + left;
  if (memory[key] !== undefined) {
    return memory[key];
  }

  if (left <= 1) {
    const maxPower = Math.max(...bank);
    memory[key] = maxPower;
    return maxPower;
  }

  let maxPower = 0;
  for (let i = 0; i < bank.length - left + 1; i++) {
    const cur = bank[i];
    const end = bank.slice(i + 1);

    const rest = getMaxPower(end, left - 1);
    const newMax = cur * (10 ** (left - 1)) + rest;
    if (newMax > maxPower) {
      maxPower = newMax;
    }
  }

  memory[key] = maxPower;
  return maxPower;
}

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const data = raw.split('\n').map((line) => line.split('').map(toInt) as Bank);

  let part1 = 0;
  let part2 = 0;

  for (const bank of data) {
    part1 += getMaxPower(bank, 2);
    part2 += getMaxPower(bank, 12);
  }

  console.log('Part 1:', part1);
  console.log('Part 2:', part2);
}

run().catch((e) => console.error(e));
