import fs from 'fs/promises';
import { toInt } from '#aoc/utils.js';

function part1(data: string): number {
  const RE = /mul\((\d+),(\d+)\)/g;
  let match: RegExpExecArray | null;
  let res = 0;
  while ((match = RE.exec(data))) {
    const [, a, b] = match;
    res += toInt(a) * toInt(b);
  }
  return res;
}

function part2(data: string): number {
  const RE = /(mul\((\d+),(\d+)\)|do\(\)|don't\(\))/g;
  let match: RegExpExecArray | null;
  let res = 0;
  let accept = true;
  while ((match = RE.exec(data))) {
    const op = match[1];
    switch (op) {
      case 'do()':
        accept = true;
        break;
      case "don't()":
        accept = false;
        break;
      default:
        const [, , a, b] = match;
        if (accept) {
          res += toInt(a) * toInt(b);
        }
    }
  }
  return res;
}

async function run() {
  const data = (await fs.readFile(process.argv[2], 'utf-8')).trim();

  console.log('Part 1:', part1(data));
  console.log('Part 2:', part2(data));
}

run().catch((e) => console.error(e));
