import fs from 'fs/promises';
import { toInt } from '#aoc/utils.ts';

const textToInt = {
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
};

const regex = new RegExp('(' + Object.keys(textToInt).join('|') + ')');

function firstDigit(str: string, fromStart = true): number {
  const entries = Object.entries(textToInt).sort((a, b) => b[0].length - a[0].length);
  let testString = '';
  while (str.length) {
    testString = fromStart ? testString + str.at(0) : str.at(-1) + testString;
    const match = testString.match(regex);
    if (match) {
      return textToInt[match[1]];
    }
    str = fromStart ? str.slice(1) : str.slice(0, -1);
  }

  return 0;
}

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const data = raw.split('\n');

  const part1 = data
    .map((l) => l.split(''))
    .map((d) => d.filter((v) => /\d/.test(v)))
    .reduce((acc, cur) => {
      return acc + toInt(cur.at(0) + cur.at(-1));
    }, 0);

  console.log('Part 1:', part1);

  const part2 = data
    .map((l) => [firstDigit(l), firstDigit(l, false)])
    .reduce((acc, cur) => {
      return acc + toInt(`${cur[0]}${cur[1]}`);
    }, 0);

  console.log('Part 2:', part2);
}

run().catch((e) => console.error(e));
