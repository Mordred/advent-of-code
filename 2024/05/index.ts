import fs from 'fs/promises';
import { toInt } from '#aoc/utils.js';

function isCorrect(rules: Record<string, boolean>, update: number[]) {
  for (let i = 0; i < update.length; i++) {
    for (let j = i + 1; j < update.length; j++) {
      if (rules[`${update[j]}|${update[i]}`] === true) {
        return false;
      }
    }
  }

  return true;
}

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const [firstSection, secondSection] = raw.split('\n\n');

  const orderingRules = firstSection.split('\n').reduce(
    (acc, line) => {
      acc[line] = true;
      return acc;
    },
    {} as Record<string, boolean>,
  );
  const updates = secondSection.split('\n').map((line) => line.split(',').map(toInt));

  const part1 = updates
    .filter((u) => isCorrect(orderingRules, u))
    .reduce((acc, cur) => acc + cur[Math.floor(cur.length / 2)], 0);

  console.log('Part 1:', part1);

  const part2 = updates
    .filter((u) => !isCorrect(orderingRules, u))
    .map((update) => update.sort((a, b) => (orderingRules[`${a}|${b}`] ? -1 : orderingRules[`${b}|${a}`] ? 1 : 0)))
    .reduce((acc, cur) => acc + cur[Math.floor(cur.length / 2)], 0);

  console.log('Part 2:', part2);
}

run().catch((e) => console.error(e));
