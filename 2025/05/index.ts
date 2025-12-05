import { type Range, mergeRanges, toInt } from '#aoc/utils.ts';
import fs from 'fs/promises';

function isFresh(ingredient: number, ranges: Range[]): boolean {
  for (const [start, end] of ranges) {
    if (ingredient >= start && ingredient <= end) {
      return true;
    }
  }
  return false;
}

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const [rangesRaw, ingredientsRaw] = raw.split('\n\n');

  const ranges = rangesRaw.split('\n').map((line) => line.split('-').map(toInt) as Range);

  const ingredients = ingredientsRaw.split('\n').map((line) => toInt(line.trim()));

  let part1 = 0;
  for (const ingredient of ingredients) {
    if (isFresh(ingredient, ranges)) {
      part1 += 1;
    }
  }
  console.log('Part 1:', part1);

  const merged = mergeRanges(ranges);
  let part2 = 0;
  for (const range of merged) {
    part2 += range[1] - range[0] + 1;
  }
  console.log('Part 2:', part2);
}

run().catch((e) => console.error(e));
