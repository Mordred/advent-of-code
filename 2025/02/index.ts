import { toInt } from '#aoc/utils.ts';
import fs from 'fs/promises';

type Range = [number, number];

function isInvalidPart1(number: number): boolean {
  let str = number.toString();
  if (str.length % 2 !== 0) {
    str = '0' + str;
  }
  let left = str.slice(0, Math.floor(str.length / 2));
  let right = str.slice(Math.ceil(str.length / 2));

  if (left[0] === '0' || right[0] === '0') {
    return false;
  }

  return left === right;
}

function isInvalidPart2(number: number): boolean {
  let str = number.toString();
  let length = str.length;

  let cur = '';
  for (let i = 0; i < length - 1; i++) {
    cur += str[i];
    let repeated = cur.repeat(Math.ceil(length / cur.length));
    if (repeated === str) {
      return true;
    }
  }

  return false
}

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const data = raw.replace('\n', '').split(',').map((range) => range.split('-').map(toInt) as Range);

  let part1 = 0;
  let part2 = 0;

  for (const [start, end] of data) {
    console.log('Checking range:', start, '-', end);
    for (let i = start; i <= end; i++) {
      if (isInvalidPart1(i)) {
        part1 += i;
      }
      if (isInvalidPart2(i)) {
        part2 += i;
      }
    }
  }

  console.log('Part 1:', part1);
  console.log('Part 2:', part2);
}

run().catch((e) => console.error(e));
